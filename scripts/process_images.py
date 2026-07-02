import sys
import os
import cv2
import numpy as np
import easyocr
from rembg import remove
from PIL import Image

def process_main_image(input_path, output_path):
    print(f"\n--- Processing Main Image: {input_path} ---")
    
    # 1. Background removal using rembg
    print("Removing background with rembg...")
    with open(input_path, 'rb') as i:
        with open(output_path, 'wb') as o:
            input_bytes = i.read()
            output_bytes = remove(input_bytes)
            o.write(output_bytes)
    print(f"Saved transparent main image to {output_path}")

    # 2. Extract text using EasyOCR
    print("Extracting text via EasyOCR...")
    reader = easyocr.Reader(['en'])
    result = reader.readtext(input_path)
    print("\n--- OCR TEXT FOUND IN MAIN IMAGE ---")
    for (bbox, text, prob) in result:
        print(f"[{prob:.2f}] {text}")
    print("------------------------------------\n")

def process_tech_image(input_path, output_path):
    print(f"\n--- Processing Tech Image: {input_path} ---")
    
    # For technical drawings, rembg might destroy thin lines. 
    # Instead, we will convert white background to transparent, 
    # and invert black lines to white lines for the dark mode website!
    
    img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)
    if img is None:
        print(f"Could not read {input_path}")
        return

    # Convert to BGRA if not already
    if img.shape[2] == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)

    print("Extracting text via EasyOCR from Tech Image (just in case)...")
    reader = easyocr.Reader(['en'])
    result = reader.readtext(input_path)
    print("\n--- OCR TEXT FOUND IN TECH IMAGE ---")
    for (bbox, text, prob) in result:
        print(f"[{prob:.2f}] {text}")
    print("------------------------------------\n")

    print("Inverting drawing for dark mode and making background transparent...")
    # Convert image to grayscale for thresholding
    gray = cv2.cvtColor(img, cv2.COLOR_BGRA2GRAY)
    
    # Threshold: anything close to white (e.g. > 200) becomes background
    _, alpha = cv2.threshold(gray, 220, 255, cv2.THRESH_BINARY_INV)
    
    # The drawing lines are now white in the alpha channel, background is black.
    # We want white lines (255,255,255) with alpha=255 where lines exist.
    
    out_img = np.zeros_like(img)
    out_img[:, :, 0] = 255 # B
    out_img[:, :, 1] = 255 # G
    out_img[:, :, 2] = 255 # R
    out_img[:, :, 3] = alpha # A

    cv2.imwrite(output_path, out_img)
    print(f"Saved inverted transparent tech drawing to {output_path}")


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python process_images.py <product_id> <main_image_path> <tech_image_path>")
        sys.exit(1)

    product_id = sys.argv[1]
    main_img = sys.argv[2]
    tech_img = sys.argv[3]

    os.makedirs("public/images/products", exist_ok=True)
    
    out_main = f"public/images/products/{product_id}-main.png"
    out_tech = f"public/images/products/{product_id}-tech.png"

    process_main_image(main_img, out_main)
    process_tech_image(tech_img, out_tech)
    print("\nDONE!")
