# 🏗️ Website Architecture — Mi-KAI Tokyo

> Linked from: [[../agent_memory]]
> Related: [[brand]], [[decisions]], [[thinking/_index]]

---

## Tech Stack
| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | Vanilla CSS / CSS Modules |
| Animation (Desktop) | GSAP |
| Animation (Mobile) | Pure CSS |
| Fonts | Google Fonts (Cormorant Garamond, Outfit, Shippori Mincho, Noto Serif SC) |
| i18n | Custom lightweight (EN/JP/CN) |

## Navigation Architecture
- **Hybrid**: Intro gate page → scrollable story → separate contact route
- `/` — Intro animation (gate, plays once per session)
- `/home` — Main scrollable page with 4 sections
- `/contact` — Contact HQ with messaging system

## Page Sections
| # | Internal | Display (EN) | Display (JP) | Display (CN) |
|---|---|---|---|---|
| 0 | Intro | — | — | — |
| 1 | TheHouse | The House of Mi-KAI | 光の館 | 光之馆 |
| 2 | TheExperience | Illuminate Your World | 光の体験 | 光的体验 |
| 3 | TheCraft | Mastery in Every Detail | 匠の技 | 匠心工艺 |
| 4 | TheLiving | Curated Luminance | 光のある暮らし | 光的生活美学 |

## Component Tree
```
Layout (fonts, lang context)
├── IntroAnimation (gate page /)
├── MainPage (/home)
│   ├── Navigation (floating, appears after intro)
│   ├── LanguageSwitcher (EN/JP/CN)
│   ├── TheHouse
│   ├── TheExperience
│   ├── TheCraft
│   └── TheLiving
└── ContactPage (/contact)
    └── MessagingForm
```

## Animation Strategy
- **Desktop**: GSAP timelines, parallax, particle effects, scroll-triggered reveals
- **Mobile**: CSS keyframe animations, simple fades/slides, no canvas/particles
- Detection via `matchMedia('(min-width: 1024px)')`
