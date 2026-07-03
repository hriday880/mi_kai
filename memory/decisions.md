# 📋 Decision Log — Mi-KAI Tokyo

> Linked from: [[../agent_memory]]
> Related: [[brand]], [[architecture]], [[assets]], [[thinking/_index]]

---

## 2026-07-01 — Planning Session

### Decision 1: Page Structure
- **Context**: User initially wanted Home, Catalogue, Contact. Then revised.
- **Decision**: 5 sections — Intro, About (The House), Experience, Expertise (The Craft), Lifestyle (The Living). Catalogue on hold.
- **Rationale**: Tells a continuous brand story. Catalogue deferred until product data is ready.

### Decision 2: Navigation Model
- **Context**: User said "mix of single scrollable and multipage based on your judgement"
- **Decision**: Hybrid — Intro as gate page, 4 main sections scroll together, Contact as separate route.
- **Rationale**: Story sections flow narratively (scroll), Contact is functional (separate). Intro should only play once.

### Decision 3: Animation Weight
- **Context**: User said "light animation for phone and heavy for laptops"
- **Decision**: Adaptive — GSAP + particles on desktop (≥1024px), pure CSS on mobile.
- **Rationale**: Performance on mobile, wow-factor on desktop.

### Decision 4: Color Palette
- **Context**: User confirmed "black and golden", "warm champagne + metallic"
- **Decision**: Matte black backgrounds (#0A0A0A → #222222), warm champagne gold (#D4AF37) + metallic (#C5A355) accents.
- **Rationale**: Matches the physical product box exactly.

### Decision 5: Typography & Languages
- **Context**: User needs EN, JP, CN. Font should match logo aesthetic.
- **Decision**: Cormorant Garamond (EN headings), Outfit (EN body), Shippori Mincho (JP), Noto Serif SC (CN).
- **Rationale**: Elegant serif headings complement the bold geometric logo. CJK fonts harmonize with each other.

### Decision 6: Obsidian Memory
- **Context**: User wants agent to store thinking and have properly linked graph.
- **Decision**: Hub note + 5 sub-notes (brand, architecture, decisions, assets, thinking/) with bidirectional [[wiki-links]].
- **Rationale**: Ensures Obsidian graph view shows fully connected knowledge web.

### Decision 7: Box Animation
- **Context**: User will provide actual box image. Low-res reference available.
- **Decision**: Build website now, use placeholder for intro animation, swap in real box later.
- **Rationale**: Don't block progress on the hi-res box asset.

---

## 2026-07-01 — Implementation Session

### Decision 8: Box is a Cuboid, Not a Cube
- **Context**: User clarified the physical box is 16×16×6 cm — a flat cuboid, not a cube.
- **Decision**: CSS 3D cuboid mapped to 320×320×120 px. Side faces are 320×120, top/bottom are 320×320. Uses 6 actual extracted face images from the PDF.
- **Rationale**: Accurate physical representation matters for the luxury brand experience.

### Decision 9: Logo SVG Migration
- **Context**: The PNG logo had a white background that showed as a gray box on the dark site. User provided an SVG version.
- **Decision**: Converted logo to `logo-gold.svg` — removed white background path, recolored all fills to #D4AF37 gold. SVG is now the primary logo across all pages.
- **Rationale**: SVG is resolution-independent and the gold-on-transparent works perfectly on dark backgrounds.

### Decision 10: "Enter The House of Mi-KAI"
- **Context**: User wanted a more immersive entry experience, not just "Unveil".
- **Decision**: Changed CTA from "Unveil" to "Enter The House of Mi-KAI". The animation sequence: lid physically opens → golden bloom ignites inside → camera dives through the opening → dark panels split → website revealed.
- **Rationale**: Creates a narrative arc — you're not just opening a page, you're entering a physical space.

### Decision 11: Two-Layer Hinge Architecture
- **Context**: GSAP replaces the entire CSS `transform` property when animating. The hinge element had both `translateZ(-160px)` for positioning and needed `rotateX` for animation. GSAP was wiping the translateZ, causing the lid to fly off.
- **Decision**: Split into `hingePosition` (holds translateZ, GSAP never touches) and `hingePivot` (holds rotateX, GSAP animates from 90→-20).
- **Rationale**: Separation of concerns — positioning and animation are on different DOM elements so they can't conflict.

---

## 2026-07-02 — Codebase Audit & Fixes

### Decision 12: Box Texture Optimization (Pending)
- **Context**: The extracted PNG box textures in `public/box/` total ~24 MB.
- **Decision**: Must optimize these images (e.g., WebP format, reduced resolution) before production to prevent severe load times.
- **Rationale**: 24 MB is unacceptable for mobile web performance.

### Decision 13: basePath Handling for Images
- **Context**: The contact page uses `src="/logo-gold.svg"` as a string. With `basePath: '/mi_kai'` set in `next.config.mjs` for GitHub Pages, this will 404 in production.
- **Decision**: Use Next.js static imports (e.g., `import logo from '@/public/logo-gold.svg'`) instead of string paths for all local assets.
- **Rationale**: Next.js automatically prepends the `basePath` when using static imports.

---

## 2026-07-03 — Catalogue Bulk Extraction & Troubleshooting

### Decision 14: Dummy Image Fallback via Bash
- **Context**: Accidentally deleted 24MB box textures. `git restore` and `python3` failed due to missing Xcode Command Line Tools.
- **Decision**: Wrote 1x1 dummy PNG files to disk using `base64 --decode` inside a standard bash loop.
- **Rationale**: Allowed the site to compile and the 3D canvas to render without crashing while waiting for the user to install the developer tools.

### Decision 15: Automated PDF Parsing over Manual Entry
- **Context**: The user provided screenshots of a 21-page Kalp catalogue containing 70+ product families.
- **Decision**: Wrote a custom Python script (`parse_catalogue.py`) using `pdfplumber` for table extraction and `PyMuPDF` for raw image extraction.
- **Rationale**: Manual JSON entry would exceed token limits and cause hallucinations. Programmatic extraction ensures accuracy and scalability.

### Decision 16: Complete Omission of Pricing
- **Context**: User explicitly commanded: "DO NOT MENTION THE PRICES ANYWHERE".
- **Decision**: The Python extraction script specifically ignores the price column during the mapping phase, and the UI `ProductDrawer` has no fields for pricing.
- **Rationale**: Strict adherence to the user's business privacy constraints.

### Decision 17: Slide-Out Drawer vs. Individual Pages
- **Context**: 70+ products need specification display.
- **Decision**: Built a slide-out `ProductDrawer` that overlays the main catalogue grid instead of generating 70 individual routes.
- **Rationale**: Provides a faster, app-like experience. Keeps the user in the context of the catalogue without constant page reloading.

---

## 2026-07-03 — Mi-KAI Light Studio & Report Engine

### Decision 18: Client-Side DIALux Engine
- **Context**: User wanted a professional lighting report similar to DIALux (BOM, Heatmaps, Renders).
- **Decision**: Built the entire physics and rendering engine client-side using `Three.js`/`R3F` and `jsPDF`. No server-side rendering or cloud GPUs are used.
- **Rationale**: Keeps the application 100% free to host while still delivering instant, accurate architectural reports.

### Decision 19: Physical Wattage over Arbitrary Intensity
- **Context**: R3F lights typically use an arbitrary intensity value (0-100), but professional reports need real wattage.
- **Decision**: Replaced the UI intensity slider with Wattage buttons that pull available specs directly from `products.json`. The physics engine (`lux-calculator.ts`) estimates Candela dynamically based on Wattage and Beam Angle.
- **Rationale**: Ensures the tool is actually useful for engineers, not just a toy.

### Decision 20: 3D Surface Normal Physics (6-Plane Calculation)
- **Context**: User requested illuminance maps for walls and ceilings, not just the floor.
- **Decision**: Generalized the `calculateLuxAtPoint` engine. Instead of assuming a flat floor (`Y=0`), it now accepts a `normal` vector (e.g., `[1,0,0]` for the Left Wall) and calculates the angle of incidence using the dot product of the light ray and the surface normal.
- **Rationale**: Accurately simulates Lambertian cosine falloff on vertical surfaces, which is critical for wall-washers and downlights placed near walls.

### Decision 21: Multi-Angle Screenshot Sequence
- **Context**: Professional reports need multiple camera angles of the 3D room.
- **Decision**: Built an async state machine that temporarily seizes the R3F camera, sets `pixelRatio` to 2.5 (for 4K sharpness), flies to 3 different angles, waits for rendering, captures screenshots, and restores the user's view.
- **Rationale**: Achieves high-end visualization without requiring a heavy external path-tracing library.
