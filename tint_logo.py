from PIL import Image

def tint_image(src, color="#D4AF37"):
    img = Image.open(src).convert("RGBA")
    data = img.getdata()

    # Parse color
    h = color.lstrip('#')
    golden_rgb = tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
    r, g, b = golden_rgb

    new_data = []
    for item in data:
        # Keep alpha, replace RGB
        # If it's a white/black logo, we just color the visible pixels
        # Let's assume any pixel with alpha > 0 gets colored golden (but keeps its original alpha)
        if item[3] > 0:
            new_data.append((r, g, b, item[3]))
        else:
            new_data.append(item)

    img.putdata(new_data)
    img.save("golden_logo.png", "PNG")

tint_image("public/logo.png")
