# 📖 Product Catalogue — Mi-KAI Tokyo

> Linked from: [[../agent_memory]]
> Related: [[studio]], [[architecture]]

---

## 🗃️ Data Structure
The master catalogue is stored in `data/products.json` and currently holds over 2,000 lines of JSON describing 44 premium luminaires.

### Model Schema
Each product contains:
- `id`: Internal UUID/SKU
- `category`: The product line. **Note:** This represents the exact line string (e.g., `"Downlight"`, `"Downlight (Delta)"`). 
- `finishes`: Array of available reflector finishes (`{ id, name, hex }`). E.g., Matte Black (`#1a1a1a`), Champagne Gold (`#d4af37`).
- `specifications`: Array of variants by wattage, mapping to physical size, cutout diameter, and optical beam angle.
- `media`: Links to `thumbnail`, `technicalDrawing`, and `video`.

---

## 🛠️ Ingestion Pipeline (ML Automated)
We built a robust Python data pipeline to transform raw manufacturer assets into our structured `.json` format:
1. **Background Removal**: Uses `rembg` (U-Net/AI masking) to strip backgrounds from raw product photos to create transparent PNG thumbnails.
2. **Technical OCR**: Uses `easyocr` (PyTorch) to scan tabular spec sheets and extract Wattage, Size, Cutout, and Beam Angle.
3. **Data Assembly**: Maps the processed assets and JSON snippets into the final array in `data/products.json`.

---

## ⚠️ Known Quicks / Caveats
- **Category Naming Variations**: Some products are strictly categorized as `"Downlight"` (e.g. Products 001, 002) while others use a trailing parenthesis identifier (e.g. `"Downlight (Delta)"`, `"Downlight (Catch)"`). This is intentional based on the raw manufacturer schema.
- **Finishes**: The exact hex colors used by the renderer (`#1a1a1a`) must match the `hex` keys in the JSON to correctly reverse-lookup the finish string names (`"Matte Black"`) during PDF report generation.
