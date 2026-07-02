import json
import os

file_path = "data/products.json"
with open(file_path, "r") as f:
    products = json.load(f)

# Filter out products >= 028
original_len = len(products)
products = [p for p in products if int(p["id"]) < 28]

with open(file_path, "w") as f:
    json.dump(products, f, indent=2)

print(f"Reverted {original_len - len(products)} products from {file_path}")

# Remove the generated images
import glob
for p in range(28, 47):
    main = f"public/images/products/{p:03d}-main.png"
    tech = f"public/images/products/{p:03d}-tech.png"
    if os.path.exists(main):
        os.remove(main)
    if os.path.exists(tech):
        os.remove(tech)
print("Removed old extracted images.")
