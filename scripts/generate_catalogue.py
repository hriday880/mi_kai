import os
import json
import base64
import urllib.request
import time
from jinja2 import Environment, FileSystemLoader
from playwright.sync_api import sync_playwright

from PIL import Image
import io

def remove_white_background(img_data, tolerance=60):
    try:
        img = Image.open(io.BytesIO(img_data)).convert("RGBA")
        data = img.getdata()
        new_data = []
        for item in data:
            r, g, b, a = item
            # Calculate distance to white
            dist = ((255-r)**2 + (255-g)**2 + (255-b)**2)**0.5
            
            if dist < tolerance:
                # Smooth alpha falloff for anti-aliasing
                alpha = int((dist / tolerance) * 255)
                # To prevent white fringe, darken the color slightly when blending
                new_data.append((int(r * (dist/tolerance)), int(g * (dist/tolerance)), int(b * (dist/tolerance)), alpha))
            elif r < 20 and g < 20 and b < 20:
                new_data.append((0, 0, 0, 0))
            else:
                new_data.append(item)
        img.putdata(new_data)
        out_buffer = io.BytesIO()
        img.save(out_buffer, format="PNG")
        return out_buffer.getvalue()
    except Exception as e:
        print(f"Pillow BG removal error: {e}")
        return img_data

# Cache to limit API usage
KANJI_CACHE = {}

def get_name_and_kanji(product_id, base64_image):
    cache_file = "name_cache.json"
    cache = {}
    if os.path.exists(cache_file):
        with open(cache_file, "r") as f:
            try:
                cache = json.load(f)
            except json.JSONDecodeError:
                pass

    if product_id in cache:
        print(f"Loaded {product_id} from cache: {cache[product_id]['name']}")
        return cache[product_id]["name"], cache[product_id]["kanji"]

    if not base64_image:
        return "Unknown", "未"

    if base64_image.startswith("data:image"):
        encoded_image = base64_image.split(",")[1]
        mime_type = base64_image.split(";")[0].split(":")[1]
    else:
        encoded_image = base64_image
        mime_type = "image/png"
        
    api_key = os.environ.get("GEMINI_API_KEY", "")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={api_key}"
    
    prompt = "Analyze this lighting product's design. Invent a premium, elegant Japanese name for it (like 'Hasu', 'Kujaku'). Return ONLY a JSON object with 'name' (the English Romanized name) and 'kanji' (the 1-3 Japanese kanji characters), nothing else."
    
    data = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {"inlineData": {"mimeType": mime_type, "data": encoded_image}}
            ]
        }],
        "generationConfig": {"responseMimeType": "application/json"}
    }
    
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    
    # Rate limit handling (15 RPM = 1 every 4 seconds, so sleep 5s)
    print(f"Querying Gemini for {product_id}...")
    time.sleep(5)
    try:
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            text_resp = result['candidates'][0]['content']['parts'][0]['text'].strip()
            
            if text_resp.startswith("```json"):
                text_resp = text_resp[7:-3].strip()
                
            parsed = json.loads(text_resp)
            
            cache[product_id] = {
                "name": parsed.get("name", "Unknown"),
                "kanji": parsed.get("kanji", "光")
            }
            with open(cache_file, "w") as f:
                json.dump(cache, f, indent=4)
                
            return cache[product_id]["name"], cache[product_id]["kanji"]
    except Exception as e:
        print(f"API Error for Vision AI: {e}")
        return "Unknown", "光"

def process_image(filepath, remove_bg=False):
    if not os.path.exists(filepath):
        return ""
    with open(filepath, "rb") as img_file:
        img_data = img_file.read()
        
    if remove_bg:
        print(f"Removing background for {filepath}...")
        img_data = remove_white_background(img_data)
        
    encoded = base64.b64encode(img_data).decode('utf-8')
    return f"data:image/png;base64,{encoded}"

def generate_catalogue_pages():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        with open("data/products.json", "r") as f:
            products = json.load(f)

        print(f"Loaded {len(products)} products.")

        env = Environment(loader=FileSystemLoader('templates'))
        template = env.get_template('square_template.html')

        # Run for the final 4 products
        for i in range(len(products)):
            product = products[i]
            prod_id = product["id"]
            if prod_id not in ["040", "041", "042", "043"]:
                continue
            
            # Switch to square 6000x6000 viewport for each to avoid memory leak
            page = browser.new_page(viewport={"width": 6000, "height": 6000})
            
            # Use main.png instead of thumb.png which is a full page
            hero_path = f"public/images/products/{prod_id}-main.png"
            if not os.path.exists(hero_path):
                # Fallback if main.png doesn't exist
                hero_path = f"public/images/products/{prod_id}-main.jpg"
                if not os.path.exists(hero_path):
                    hero_path = ""
                    
            # Use brand color instead of dynamic
            theme_color = "#D4AF37"
            
            # The hero image already has a transparent background, do not destroy its bright pixels!
            hero_base64 = process_image(hero_path, remove_bg=False) if hero_path else ""
            
            dyn_name, kanji = get_name_and_kanji(prod_id, hero_base64)
            
            print(f"Rendering {dyn_name} (ID: {prod_id}, Square)...")
            
            html_content = template.render(
                product_name=dyn_name,
                kanji=kanji,
                theme_color=theme_color,
                colors=product.get("finishes", []),
                specifications=product.get("specifications", []),
                hero_image=hero_base64
            )
            
            page.set_content(html_content)
            
            # Ensure fonts are loaded
            page.evaluate("document.fonts.ready")
            page.wait_for_timeout(2000)
            
            filename = f"outputs/{prod_id}_{dyn_name.lower()}_square.png"
            page.screenshot(path=filename, full_page=True, timeout=90000)
            print(f"Saved: {filename}")
            page.close()

        browser.close()

if __name__ == "__main__":
    products_file = "data/products.json"
    with open(products_file, "r") as f:
        products_data = json.load(f)
        
    print(f"Loaded {len(products_data)} products.")
    # Process only the first image for review
    generate_catalogue_pages()
