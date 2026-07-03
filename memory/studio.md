# 📐 Mi-KAI Light Studio Engine

> Linked from: [[../agent_memory]]
> Related: [[catalogue]], [[architecture]]

---

## 🏗️ Architecture

The Mi-KAI Light Studio (`app/studio/StudioClient.tsx`) is a Next.js client-side module allowing users to virtually design rooms using our premium luminaires.

### Tech Stack
- **3D Rendering**: React Three Fiber (R3F) + Drei.
- **Reporting Engine**: `jspdf` and `jspdf-autotable`.
- **Lighting Physics**: Custom TypeScript engine (`lux-calculator.ts`) based on standard DIALux methodologies.

---

## 📸 WebGL Rendering & Shadows (The 16-Texture Limit)
Browsers have a strict 16-texture limit for WebGL, meaning you can typically only have ~8 spot lights casting shadows simultaneously.
**Our Solution**: The `Screenshotter` runs a multi-pass accumulation loop. It hides/shows 8 lights at a time, rendering shadow maps in chunks, and additively blends them onto a 2D HTML Canvas (`globalCompositeOperation = 'lighter'`).
- The final composite is exported as a **JPEG (quality 0.85)**. (Previously PNG, which bloated PDFs to 60MB. JPEG drops it to ~1-2MB with negligible visual loss).

---

## 🧮 Physics Engine (`lux-calculator.ts`)
We calculate direct illumination (lux) for multiple surfaces (Floor, Ceiling, 4 Walls) using a $0.5m \times 0.5m$ coordinate grid.

### Key Photometric Features
1. **Lambertian Cosine Law**: Lux = $(I / d^2) \times \cos(\theta)$.
2. **Smooth Beam Roll-off (Field Angle)**: We apply a smooth-step interpolation curve extending $1.5\times$ the beam angle. This prevents impossible drops from `1000 lx` to `0 lx` between adjacent 0.5m grid points.
3. **Ambient Baseline Bounce**: We calculate a base ambient scatter (roughly `1.5 lx per installed Watt`) to simulate indirect bounces. This ensures cells outside the direct cones are never exactly `0 lx`, fixing mathematical anomalies where `Uniformity (U0)` would crash to `0.00`.

---

## 📄 PDF Generation (`pdf-builder.ts`)
- **Uniformity Consistency**: $U_0$ ($E_{min} / E_{m}$) is strictly computed using the *rounded integers* printed on the page, ensuring 100% manual math verifiability.
- **Reflector Mapping**: Hex colors (e.g. `#1a1a1a`) are dynamically mapped back to human strings (e.g. `"Matte Black"`) for the Bill of Materials (BOM).
- **Surface Formatting**: The PDF generates separate pages containing numeric heat maps. Status colors (Green/Orange/Yellow/Red) alert the user to Underlit, Suboptimal, Optimal, and Overlit conditions. Ceilings are marked as `INFO` (Neutral Blue) since direct-light simulations don't cast light upwards.

---

## 💡 AI Recommender (`recommender.ts`)
Evaluates the calculated `surfaceResults` (Floor and Walls) to generate dynamic, contextual advice.
- Checks if the floor average hits the `lux-standards.json` minimums.
- **Smart Wall Context**: If the room is drastically overlit, it evaluates the walls. If walls are *also* overlit, it suggests moving fixtures. If walls are *dark*, it suggests replacing downlights with dedicated wall-washers.
- Highlights color temperature mismatches (e.g. mixing 3000K with 5000K).
