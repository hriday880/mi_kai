import fitz  # PyMuPDF
import sys
import os

def extract_pdf_pages(pdf_path, start_page, end_page, start_product_id):
    print(f"Extracting pages {start_page} to {end_page} from {pdf_path}...")
    
    # Create a temporary directory for the batch
    out_dir = "/tmp/pdf_batch"
    os.makedirs(out_dir, exist_ok=True)
    
    # Open the PDF
    doc = fitz.open(pdf_path)
    
    # Validate pages
    if start_page > len(doc) or end_page > len(doc):
        print(f"Error: PDF only has {len(doc)} pages.")
        sys.exit(1)
        
    for page_num in range(start_page, end_page + 1):
        # 0-indexed page in PyMuPDF
        page_index = page_num - 1
        page = doc.load_page(page_index)
        
        # Calculate Product ID and Type (H/S)
        diff = page_num - start_page
        product_id_int = start_product_id + (diff // 2)
        product_id = f"{product_id_int:03d}"
        
        is_hero = (diff % 2 == 0)
        prefix = "H" if is_hero else "S"
        
        filename = f"{prefix}{product_id}.png"
        out_path = os.path.join(out_dir, filename)
        
        # Render page to an image (high resolution)
        pix = page.get_pixmap(matrix=fitz.Matrix(3, 3))
        pix.save(out_path)
        
        print(f"Page {page_num} -> Saved as {filename}")
        
    print(f"\nAll pages extracted to {out_dir}!")
    print("Now running the batch ML ingestion on these files...")
    
    # Run the batch ingest script
    os.system(f"python scripts/batch_ingest.py {out_dir}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python pdf_ingest.py <path_to_pdf>")
        sys.exit(1)
        
    pdf_file = sys.argv[1]
    
    # Hardcoded based on user request:
    # Page 55 to 91, starting at Product 028
    extract_pdf_pages(pdf_file, 55, 91, 28)
