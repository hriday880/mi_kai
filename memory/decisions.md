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
