# 💭 Thinking Log — 2026-07-02: Codebase Audit

> Linked from: [[_index]]
> Related: [[../decisions]], [[../assets]], [[../architecture]]

---

## Session Context
Conducted a deep-dive file-by-file audit of the entire codebase to understand the current implementation state, architecture patterns, and remaining work.

## Reasoning: Completion Status
The project is surprisingly far along — estimated at **~95% complete**.
- All 4 main sections (TheHouse, TheExperience, TheCraft, TheLiving) are fully implemented with scroll-reveal animations.
- The 3D intro animation is fully built using Three.js and GSAP (a change from the original pure CSS 3D plan), implementing the two-layer hinge architecture perfectly.
- i18n is functional across EN/JP/CN with `localStorage` persistence.
- The global design system (`globals.css`) robustly implements the matte black + champagne gold luxury aesthetic.
- The light switch pull-cord micro-interaction is implemented and functional.

## Findings: Issues to Address
During the audit, several critical and minor issues were identified that need fixing before launch:

1. **🔴 Critical Performance Threat:** The 6 PNG textures in `public/box/` used for the 3D intro animation total **~24 MB** in size (e.g., `face_0.png` is 7.3 MB). This will cause massive load delays, especially on mobile. They must be aggressively optimized (e.g., converted to WebP, resized).
2. **🟡 Production Bug:** In `app/contact/page.tsx`, the logo uses a string path `"/logo-gold.svg"`. Because the project uses `next.config.mjs` with `basePath: '/mi_kai'` for GitHub Pages deployment, this string path will break in production. It must be updated to use a static import like in `Navigation.tsx`.
3. **🟡 Incomplete UI:** The "Privacy Policy" and "Terms of Service" in the Footer are currently just `<span>` placeholders and need to be real links.
4. **🟡 i18n Gaps:** The contact page error message and the footer legal links are hardcoded in English instead of using the `t()` translation function.
5. **🟡 Accessibility:** The footer logo has a click-to-scroll handler but lacks `role="button"` and keyboard support.

## Next Steps
- Address the 24MB texture issue (compress assets).
- Fix the `basePath` bug in the Contact page.
- Polish the Footer links and accessibility.
- Update hardcoded strings to use i18n.
