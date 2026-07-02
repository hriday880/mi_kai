import os
import sys
import glob

def main(folder_path):
    print(f"Scanning folder: {folder_path} for H* and S* pairs...")
    
    # Find all H images
    h_pattern = os.path.join(folder_path, "H*.png")
    h_files = glob.glob(h_pattern)
    
    products = {}
    
    for h_file in h_files:
        filename = os.path.basename(h_file)
        # Extract product id, assuming H011.png -> 011
        pid = filename[1:].replace('.png', '')
        products[pid] = {'hero': h_file}
        
    # Find matching S images
    for pid in products.keys():
        s_file = os.path.join(folder_path, f"S{pid}.png")
        if os.path.exists(s_file):
            products[pid]['specs'] = s_file
        else:
            print(f"Warning: No matching specs file S{pid}.png found for H{pid}.png")
            
    # Now run the processing for each
    from process_images import process_main_image, process_tech_image
    os.makedirs("public/images/products", exist_ok=True)
    
    sorted_pids = sorted(list(products.keys()))
    
    for pid in sorted_pids:
        print(f"\n=======================================================")
        print(f"                PROCESSING PRODUCT {pid}")
        print(f"=======================================================")
        
        hero = products[pid].get('hero')
        specs = products[pid].get('specs')
        
        if not specs:
            print(f"Skipping {pid} due to missing specs image.")
            continue
            
        out_main = f"public/images/products/{pid}-main.png"
        out_tech = f"public/images/products/{pid}-tech.png"
        
        process_main_image(hero, out_main)
        process_tech_image(specs, out_tech)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python batch_ingest.py <folder_path>")
        sys.exit(1)
        
    main(sys.argv[1])
