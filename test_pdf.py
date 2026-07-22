import fitz

doc = fitz.open("pdf_input/laxen.pdf")
page = doc[0]
print("Number of images:", len(page.get_images()))
print("Number of drawings:", len(page.get_drawings()))

text_blocks = page.get_text("dict")["blocks"]
for b in text_blocks:
    if b["type"] == 0:
        for l in b["lines"]:
            for s in l["spans"]:
                if 'LAXEN' in s["text"]:
                    print("Found 'LAXEN' in text:", s["text"], "at", s["bbox"])

# Also let's check if there are any drawings or images near the top left (where the logo usually is)
print("\nItems in top left quadrant (0, 0, 200, 200):")
rect = fitz.Rect(0, 0, 200, 200)

for img in page.get_image_info():
    if fitz.Rect(img["bbox"]).intersects(rect):
        print("Image in top left:", img["bbox"])

for p in page.get_drawings():
    if p["rect"].intersects(rect):
        print("Drawing in top left:", p["rect"])
