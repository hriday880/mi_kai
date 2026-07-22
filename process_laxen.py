import cv2
import numpy as np
import fitz
import glob
import os

def process_pdf(pdf_path, templates_dir, logo_path, output_path):
    print(f"Processing {pdf_path}...", flush=True)
    doc = fitz.open(pdf_path)
    
    template_paths = glob.glob(f"{templates_dir}/*.png")
    templates = []
    for tp in template_paths:
        t = cv2.imread(tp)
        if t is not None:
            # Resize template to a smaller manageable size just to be safe if they are massive
            if t.shape[0] > 500:
                scale = 500 / t.shape[0]
                t = cv2.resize(t, (0,0), fx=scale, fy=scale)
            templates.append(t)
            
    if not templates:
        print("No templates found!", flush=True)
        return
        
    mikai_logo = cv2.imread(logo_path, cv2.IMREAD_UNCHANGED)
    out_doc = fitz.open()

    known_scale = None
    known_template_idx = None
    DPI_RATIO = 300 / 72.0

    for page_num in range(len(doc)):
        print(f"Processing page {page_num + 1}/{len(doc)}...", flush=True)
        page = doc[page_num]
        
        # 72 DPI for fast matching
        pix_72 = page.get_pixmap(dpi=72)
        img_72 = np.frombuffer(pix_72.samples, dtype=np.uint8).reshape(pix_72.height, pix_72.width, pix_72.n)
        img_72 = cv2.cvtColor(img_72, cv2.COLOR_RGBA2BGR) if pix_72.n == 4 else cv2.cvtColor(img_72, cv2.COLOR_RGB2BGR)
        
        # 300 DPI for high-res output
        pix_300 = page.get_pixmap(dpi=300)
        img_300 = np.frombuffer(pix_300.samples, dtype=np.uint8).reshape(pix_300.height, pix_300.width, pix_300.n)
        img_300 = cv2.cvtColor(img_300, cv2.COLOR_RGBA2BGR) if pix_300.n == 4 else cv2.cvtColor(img_300, cv2.COLOR_RGB2BGR)
        
        best_val = -1
        best_loc = None
        best_scale = 1.0
        best_tw = 0
        best_th = 0
        best_template = None
        
        # Search region: top third of 72 DPI image
        search_region = img_72[0:int(pix_72.height/3), :]
        
        # Always test all templates and all scales
        scales_to_test = np.linspace(0.1, 1.5, 15)
        templates_to_test = enumerate(templates)
        
        for idx, template in templates_to_test:
            for scale in scales_to_test:
                tw = int(template.shape[1] * scale)
                th = int(template.shape[0] * scale)
                if tw > search_region.shape[1] or th > search_region.shape[0] or tw < 10 or th < 10:
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
                    best_template = idx

        print(f"  Best match confidence: {best_val:.2f}", flush=True)
        
        if best_val > 0.30:
                
            # Scale up coordinates to 300 DPI
            x = int(best_loc[0] * DPI_RATIO)
            y = int(best_loc[1] * DPI_RATIO)
            w = int(best_tw * DPI_RATIO)
            h = int(best_th * DPI_RATIO)
            
            padding = 15
            x = max(0, x - padding)
            y = max(0, y - padding)
            w = w + 2*padding
            h = h + 2*padding
            
            print(f"  Inpainting...", flush=True)
            mask = np.zeros(img_300.shape[:2], dtype=np.uint8)
            mask[y:y+h, x:x+w] = 255
            img_inpainted = cv2.inpaint(img_300, mask, 5, cv2.INPAINT_TELEA)
            
            target_h = int(h * 0.9)
            aspect = mikai_logo.shape[1] / mikai_logo.shape[0]
            target_w = int(target_h * aspect)
            resized_logo = cv2.resize(mikai_logo, (target_w, target_h))
            
            center_x = x + w // 2
            center_y = y + h // 2
            start_x = max(0, center_x - target_w // 2)
            start_y = max(0, center_y - target_h // 2)
            
            end_y = min(start_y + target_h, img_inpainted.shape[0])
            end_x = min(start_x + target_w, img_inpainted.shape[1])
            crop_h = end_y - start_y
            crop_w = end_x - start_x
            
            if crop_h > 0 and crop_w > 0:
                logo_rgb = resized_logo[:crop_h, :crop_w, :3]
                alpha = np.expand_dims(resized_logo[:crop_h, :crop_w, 3] / 255.0, axis=2)
                bg = img_inpainted[start_y:end_y, start_x:end_x]
                img_inpainted[start_y:end_y, start_x:end_x] = (alpha * logo_rgb + (1 - alpha) * bg).astype(np.uint8)
                                
            final_img = img_inpainted
        else:
            final_img = img_300
            
        print("  Saving page...", flush=True)
        final_img_rgb = cv2.cvtColor(final_img, cv2.COLOR_BGR2RGB)
        is_success, buffer = cv2.imencode(".png", cv2.cvtColor(final_img_rgb, cv2.COLOR_RGB2BGR))
        
        if page_num == 0:
            cv2.imwrite(os.path.join(os.path.dirname(output_path), "preview.png"), final_img)
            
        out_page = out_doc.new_page(width=page.rect.width, height=page.rect.height)
        out_page.insert_image(out_page.rect, stream=buffer.tobytes())
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    out_doc.save(output_path)
    print(f"Saved {output_path}", flush=True)

if __name__ == "__main__":
    process_pdf("pdf_input/laxen.pdf", "templates", "golden_logo.png", "pdf_output/laxen_modified.pdf")
