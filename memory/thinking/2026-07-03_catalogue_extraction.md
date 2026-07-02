# 🧠 Thinking: Catalogue Bulk Extraction & System Troubleshooting

> Linked from: [[../agent_memory]]

## Objective
Extract over 70+ product families and their technical specifications from a 21-page PDF catalogue and build a dynamic UI grid and sliding specification drawer, while strictly omitting prices as per user instruction.

## The Troubleshooting Phase

### 1. The Xcode Command Line Tools Block
While attempting to restore accidentally deleted high-res 3D box textures using `git restore`, the command failed because the Mac environment was entirely missing the Xcode Command Line Developer Tools (`xcode-select: note: No developer tools were found, requesting install.`). 

**Impact**: I temporarily lost access to `git`, `python3`, and other fundamental Unix build tools.
**Workaround**: I fell back to using `base64 --decode` via standard bash to write tiny 1x1 dummy PNG files to disk. This prevented the Three.js canvas from hard-crashing on missing textures and kept the site running.
**Resolution**: The user manually accepted the Xcode installation prompt, restoring access to Git and Python.

### 2. The Node.js / NPM Vacuum
When instructed by the user to "run locally", I attempted to run `npm run dev`. The terminal returned `zsh: command not found: npm`. This indicated that Node.js was completely absent from the user's environment.

**Resolution**: I instructed the user to install Node Version Manager (NVM). The user ran the install script, but their ZSH environment lacked a `.zshrc` profile, so NVM couldn't load.
**The Fix**: I used my tools to programmatically write an `export NVM_DIR...` initialization script directly into `~/.zshrc` and instructed the user to `source ~/.zshrc` and `nvm install 20`. This permanently fixed their local dev environment.

## The Catalogue Extraction Strategy

Faced with 70+ product families, writing JSON by hand was a recipe for truncation and hallucination. 

**Decision**: Write a custom Python parser (`parse_catalogue.py`).
- **Challenges**: Extracting clean tables from highly stylized PDFs is notoriously difficult. Using PyMuPDF (`fitz`) alone for bounding box extraction often results in misaligned data.
- **Solution**: Combine `fitz` (for extracting the original high-res product images based on bounding box constraints) with `pdfplumber` (for highly accurate table extraction). 
- **Privacy constraint**: The script explicitly ignores the price column during the mapping phase, ensuring the user's B2B/B2C privacy request ("DO NOT MENTION THE PRICES ANYWHERE") is strictly upheld.

## The UI Implementation

To handle 70+ products elegantly:
1. **The Grid**: A clean, dark-mode CSS grid for the catalogue front page.
2. **The Drawer**: Instead of 70 individual routing pages, I designed `ProductDrawer.tsx` — a slide-out specification panel. It keeps the user anchored in the catalogue while exposing the technical tables (Model, Dimensions, Cutout) and finishes, completely devoid of pricing data.
