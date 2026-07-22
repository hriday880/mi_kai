import cv2
import numpy as np
import fitz
import glob
import os

def process_pdf(pdf_path, templates_dir, logo_path, output_path):
    print(f"Processing {pdf_path}...")
    doc = fitz.open(pdf_path)
    
    # Load templates
    template_paths = glob.glob(f"{templates_dir}/*.png")
    templates = []
    for tp in template_paths:
        t = cv2.imread(tp)
        if t is not None:
            templates.append(t)
            
    if not templates:
        print("No templates found!")
        return
        
    print(f"Loaded {len(templates)} templates.")
    
    # Load Mi-KAI logo (with alpha)
    mikai_logo = cv2.imread(logo_path, cv2.IMREAD_UNCHANGED)
    if mikai_logo is None:
        print("Could not load mikai logo.")
        return
        
    out_doc = fitz.open()

    for page_num in range(len(doc)):
        print(f"Processing page {page_num + 1}/{len(doc)}")
        page = doc[page_num]
        
        # Render page at 300 DPI
        pix = page.get_pixmap(dpi=300)
        
        # Convert pixmap to numpy array (RGB to BGR for OpenCV)
        img_np = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.height, pix.width, pix.n)
        if pix.n == 4:
            # RGBA to BGR
            img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGBA2BGR)
        else:
            img_bgr = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)
            
        best_val = -1
        best_loc = None
        best_scale = 1.0
        best_tw = 0
        best_th = 0
        
        # Crop to top-left quadrant to speed up search and reduce false positives
        search_region = img_bgr[0:int(pix.height/2), 0:int(pix.width/2)]
        
        for template in templates:
            # Multi-scale template matching
            for scale in np.linspace(0.2, 2.0, 20):
                tw = int(template.shape[1] * scale)
                th = int(template.shape[0] * scale)
                if tw > search_region.shape[1] or th > search_region.shape[0]:
                    continue
                    
                resized_template = cv2.resize(template, (tw, th))
                res = cv2.matchTemplate(search_region, resized_template, cv2.TM_CCOEFF_NORMED)
                min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)
                
                if max_val > best_val:
                    best_val = max_val
                    best_loc = max_loc
                    best_scale = scale
                    best_tw = tw
                    best_th = th

        print(f"  Best match confidence: {best_val:.2f}")
        
        # If match is confident enough, inpaint and overlay
        if best_val > 0.4:  # Threshold
            # Expand bounding box slightly
            padding = 10
            x = max(0, best_loc[0] - padding)
            y = max(0, best_loc[1] - padding)
            w = best_tw + 2*padding
            h = best_th + 2*padding
            
            # Create mask for inpainting
            mask = np.zeros(img_bgr.shape[:2], dtype=np.uint8)
            mask[y:y+h, x:x+w] = 255
            
            # Inpaint
            img_inpainted = cv2.inpaint(img_bgr, mask, 5, cv2.INPAINT_TELEA)
            
            # Overlay Mi-KAI logo
            # Resize mikai logo to fit nicely within the height of the original logo, maintaining aspect ratio
            target_h = int(best_th * 1.5)  # Make it slightly bigger than original logo
            aspect = mikai_logo.shape[1] / mikai_logo.shape[0]
            target_w = int(target_h * aspect)
            
            resized_logo = cv2.resize(mikai_logo, (target_w, target_h))
            
            # Calculate position to center the new logo over the old one
            center_x = x + w // 2
            center_y = y + h // 2
            
            start_x = center_x - target_w // 2
            start_y = center_y - target_h // 2
            
            # Bounds check
            start_x = max(0, start_x)
            start_y = max(0, start_y)
            
            # Alpha blending
            for i in range(target_h):
                for j in range(target_w):
                    if start_y + i < img_inpainted.shape[0] and start_x + j < img_inpainted.shape[1]:
                        alpha = resized_logo[i, j, 3] / 255.0
                        if alpha > 0:
                            img_inpainted[start_y+i, start_x+j] = \
                                alpha * resized_logo[i, j, :3] + (1 - alpha) * img_inpainted[start_y+i, start_x+j]
                                
            final_img = img_inpainted
        else:
            print("  No confident match found. Skipping inpainting.")
            final_img = img_bgr
            
        # Convert back to PDF page
        # OpenCV uses BGR, fitz expects RGB
        final_img_rgb = cv2.cvtColor(final_img, cv2.COLOR_BGR2RGB)
        is_success, buffer = cv2.imencode(".png", cv2.cvtColor(final_img_rgb, cv2.COLOR_RGB2BGR))
        
        # Create a new PDF page with the same dimensions as the original
        out_page = out_doc.new_page(width=page.rect.width, height=page.rect.height)
        out_page.insert_image(out_page.rect, stream=buffer.tobytes())
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    out_doc.save(output_path)
    print(f"Saved {output_path}")

if __name__ == "__main__":
    process_pdf("pdf_input/laxen.pdf", "templates", "golden_logo.png", "pdf_output/laxen_modified.pdf")
