# 24 — Design System, Animation & Impeccable Integration

**Date:** 2026-07-11
**Branch:** `feature/design-system-impeccable` → merged `main`
**Commit:** `4878110` (54 files, +2259/-253)

---

## Overview

Complete UI polish: design system documentation, lightweight animation framework, and impeccable anti-pattern detection integration. All 16 detected anti-patterns resolved to 0.

---

## Files Created

| File | Purpose |
|------|---------|
| `DESIGN.md` | Full design spec — colors, typography, spacing, radius, shadows, gradients, components, animations, anti-patterns, iconography, layout |
| `PRODUCT.md` | Product context — users, brand voice, anti-references, key flows, design priorities |
| `src/lib/animations.ts` | Animation hooks — `useScrollReveal`, `useStaggerReveal`, `pageTransition` |

---

## Design Decisions

### Font: Inter → DM Sans
- Inter flagged by impeccable as overused AI-generated font
- DM Sans: clean, slightly quirky, excellent readability, passes impeccable detect
- Google Fonts, variable weight support, no performance penalty

### Color Consistency
- Purple/indigo gradients → primary blue across admin, profile, gamification, referral pages
- gradient-text → solid color text (anti-pattern)
- Emerald/teal preserved as **brand identity** (logo, wordmark)
- Primary blue for **functional** elements (CTAs, buttons, focus states)

### Logo: Emerald Kept
- Initially changed to blue (option 1) → reverted — emerald is more distinctive for sports brand
- DESIGN.md documents: emerald = brand color, primary blue = functional color, coexist

### animate-bounce → animate-float
- `animate-bounce` flagged as tacky/dated by impeccable
- `animate-float`: smooth up-down, cubic-bezier easing, no elastic feel

---

## Animation System

### Architecture
```
src/lib/animations.ts    — React hooks (useScrollReveal, useStaggerReveal)
src/app/globals.css      — CSS classes (.reveal, .reveal-item, .page-enter, .skeleton)
tailwind.config.ts       — animate-float keyframe
```

### Performance Principles
1. **GPU-only properties** — only `transform` + `opacity` animated (no layout/paint)
2. **CSS `will-change`** — browser compositing hints
3. **`cubic-bezier(0.22, 1, 0.36, 1)`** — ease-out-quart, smooth deceleration
4. **IntersectionObserver** — one-shot, auto-disconnect (no scroll listeners)
5. **`prefers-reduced-motion`** — complete kill switch for accessibility
6. **No JS runtime cost** — CSS handles timing, JS only toggles visibility classes

### Available Classes
| Class | Effect |
|-------|--------|
| `.reveal` | Fade up on scroll (16px translateY) |
| `.reveal-scale` | Scale in on scroll (0.96 → 1) |
| `.reveal-item` | Staggered children (set transition-delay via JS) |
| `.page-enter-fade` | Page entrance: fade |
| `.page-enter-slide-up` | Page entrance: slide up (12px) |
| `.page-enter-scale` | Page entrance: scale (0.98 → 1) |
| `.press-in` | Micro-interaction on click |
| `.skeleton` | Shimmer loading placeholder |

### Usage
```tsx
// Scroll reveal
const ref = useScrollReveal<HTMLDivElement>();
<section ref={ref} className="reveal">...</section>

// Staggered grid
const gridRef = useRef<HTMLDivElement>(null);
useStaggerReveal(gridRef, { count: 6, delay: 80 });
<div ref={gridRef}>
  {items.map((item) => <div key={item.id} className="reveal-item">...</div>)}
</div>

// Page transition
<div className="page-enter page-enter-slide-up">...</div>
```

---

## Animations Applied

| Page | Animation Type |
|------|---------------|
| Homepage | Scroll reveal (4 sections) + staggered sport cards (6×80ms) + staggered steps (4×120ms) |
| Booking | Scroll reveal area section |
| Booking Form | page-enter slide-up |
| Booking Success | page-enter slide-up |
| Admin Dashboard | Staggered stat cards (6×80ms) + staggered quick actions (4×100ms) |
| Admin (all) | page-enter slide-up via AdminLayout |
| Login | page-enter scale |
| Register | page-enter scale |
| Profile | page-enter slide-up |
| Gamification | page-enter slide-up |
| Referral | page-enter slide-up |

---

## Impeccable Integration

### What It Does
Deterministic anti-pattern detector (no LLM). Scans for AI-generated UI tells:
- `ai-color-palette` — purple/indigo gradients, cyan-on-dark
- `gradient-text` — bg-clip-text + gradient
- `bounce-easing` — animate-bounce
- `overused-font` — Inter, Roboto, Geist, etc.
- `gray-on-color` — washed out text on colored backgrounds
- 46 total rules

### Integration
- Installed via `npm install --save-dev impeccable`
- Skills installed to `.github/skills/impeccable/`
- Run: `npx impeccable detect src/`
- Can be wired into CI/PR checks (exit codes)

### Results
- Before: 16 anti-patterns detected
- After: **0 anti-patterns**

---

## Bug Fixes

| Issue | Fix |
|-------|-----|
| AdminLayout header "ArenaBook" | Changed to "Lapangin" |
| `gradient-text` class used in globals.css | Changed to solid color text |
| Purple/indigo in admin customer avatars | Changed to primary-500/600 |

---

## Testing
- `tsc --noEmit` — clean
- `npm run build` — clean (all routes built)
- `npx impeccable detect src/` — 0 issues

---

## Next Steps
- Add animations to venue detail pages (`/cari/[sport]/[courtId]`)
- Dark mode support (Tailwind `dark:` prefix + `next-themes`)
- Consider font swap to DM Sans variable for better weight loading

---

## Post-Launch Fixes (22:12)

### Admin Dashboard Invisible Cards
**Root cause:** `reveal-item` CSS class starts at `opacity: 0`. IntersectionObserver fired during skeleton loading phase, observed the container, and disconnected. When real stats loaded, cards stayed invisible.

**Fix:** Replaced `useStaggerReveal` with `page-enter-slide-up` on the data block. Skeleton uses `.skeleton` shimmer class instead of `animate-pulse`.

### Notification Bell Popup
**Before:** Notifications was a full page at `/admin/notifications` in sidebar nav.
**After:** Bell icon with unread count badge in admin navbar header.

**Features:**
- Red badge with count (9+ cap)
- Dropdown with notification list (max 20)
- Blue dot for unread items
- Click to mark read
- "Tandai Semua Dibaca" button
- 30s auto-poll for new notifications
- Skeleton loading state
- Close on outside click
- "Lihat Semua" link to full page (kept as fallback)

**Files:**
- `src/components/admin/NotificationBell.tsx` (new)
- `src/components/admin/AdminLayout.tsx` (bell in header, removed from sidebar)
- `src/app/admin/page.tsx` (dashboard fix)
