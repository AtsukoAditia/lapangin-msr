# DESIGN.md — Lapangin Design System

## Brand

### Wordmark
- **Font:** Inter Black (900)
- **Style:** `Lapang` in gray-900 + `in` in emerald-600
- **Tracking:** tight (-0.02em)

### Logo Mark
- ⚡ icon inside 36×36 rounded-xl (rounded-xl = 12px)
- Background: `bg-gradient-to-br from-emerald-500 to-teal-600`
- Icon color: white

### Brand Color (Emerald)
Separate from primary blue. Used for:
- Logo + wordmark accent
- Success/confirmation states
- Positive metrics (availability, bookings)
- Nature/freshness associations

Not a replacement for primary — they coexist.

---

## Colors

### Primary (Blue)
| Token      | Value     | Usage                    |
|------------|-----------|--------------------------|
| primary-50 | #eff6ff   | Hover backgrounds        |
| primary-100| #dbeafe   | Focus rings, light fills |
| primary-200| #bfdbfe   | Borders                  |
| primary-300| #93c5fd   | Disabled text            |
| primary-400| #60a5fa   | Icons, links             |
| primary-500| #1e40af   | **Main CTA, buttons**    |
| primary-600| #1e3a8a   | Button hover             |
| primary-700| #1e2d5f   | Active state             |
| primary-800| #1a2544   | Headings (admin)         |
| primary-900| #0f172a   | Body text, dark bg       |

### Accent (Orange)
| Token      | Value     | Usage                    |
|------------|-----------|--------------------------|
| accent-50 | #fff7ed   | Highlight backgrounds    |
| accent-100| #ffedd5   | Tags, badges             |
| accent-400| #fb923c   | Icons, highlights        |
| accent-500| #f97316   | **Accent CTA, badges**   |
| accent-600| #ea580c   | Accent hover             |

### Success (Green)
| Token      | Value     | Usage                    |
|------------|-----------|--------------------------|
| success-50 | #f0fdf4   | Success backgrounds      |
| success-100| #dcfce7   | Success badges           |
| success-500| #22c55e   | **Confirmations, active**|
| success-600| #16a34a   | Success hover            |

### Sport Colors
| Sport       | Color   | Hex       |
|-------------|---------|-----------|
| Futsal      | Green   | #22c55e   |
| Badminton   | Orange  | #f97316   |
| Padel       | Purple  | #8b5cf6   |
| Tennis      | Yellow  | #eab308   |
| Basketball  | Red     | #ef4444   |
| Minisoccer  | Blue    | #3b82f6   |

### Neutrals
- Background: `#f0f4f8` (cool gray)
- Card/surface: `white`
- Border: `gray-100` / `gray-200`
- Text primary: `gray-900`
- Text secondary: `gray-500` / `gray-600`
- Text muted: `gray-400`

---

## Typography

### Font Stack
```css
font-family: 'DM Sans', system-ui, sans-serif;
```

### Scale
| Role          | Size          | Weight  | Tracking   |
|---------------|---------------|---------|------------|
| Hero title    | text-4xl/5xl  | 800     | tight      |
| Section title | text-2xl/3xl  | 700     | normal     |
| Card title    | text-lg       | 600     | normal     |
| Body          | text-base     | 400     | normal     |
| Small/Label   | text-sm       | 500-600 | normal     |
| Badge         | text-xs       | 600     | wide       |

---

## Spacing

### Base Unit: 4px
All spacing uses multiples of 4px (Tailwind default).

### Common Patterns
- Page padding: `px-4 sm:px-6 lg:px-8` (16/24/32)
- Card padding: `p-6` (24px)
- Section gap: `gap-6` or `gap-8` (24/32)
- Inline elements: `gap-2` or `gap-3` (8/12)
- Max width: `max-w-7xl` (1280px)

---

## Border Radius

| Element        | Class         | Value  |
|----------------|---------------|--------|
| Cards          | rounded-2xl   | 16px   |
| Buttons        | rounded-xl    | 12px   |
| Inputs         | rounded-xl    | 12px   |
| Badges/Pills   | rounded-full  | 9999px |
| Small elements | rounded-lg    | 8px    |

---

## Shadows

| Name         | Class           | Usage                |
|--------------|-----------------|----------------------|
| card         | shadow-card     | Default card         |
| card-hover   | shadow-card-hover| Card on hover       |
| sport        | shadow-sport    | Primary buttons      |
| sport-lg     | shadow-sport-lg | Primary button hover |
| md           | shadow-md       | Accent/success btn   |

---

## Gradients

| Name           | Usage              | Value                                    |
|----------------|--------------------|------------------------------------------|
| gradient-hero  | Hero background    | 135deg #0f172a → #1e3a8a → #1e40af → #3b82f6 |
| gradient-card  | Card subtle fill   | 135deg #ffffff → #f8fafc                 |
| gradient-accent| Accent buttons     | 135deg #f97316 → #fb923c                 |
| gradient-success| Success buttons   | 135deg #22c55e → #4ade80                 |

---

## Components

### Buttons
| Variant    | Style                                                |
|------------|------------------------------------------------------|
| btn-primary| gradient blue, white text, shadow-sport, lift hover  |
| btn-accent | gradient orange, white text, shadow-md               |
| btn-success| gradient green, white text, shadow-md                |
| btn-outline| border-2 primary-500, fill on hover                  |
| btn-ghost  | text gray-600, bg gray-100 on hover                  |

All buttons: `gap-2`, `font-semibold`, `transition-all duration-300`

### Cards
| Variant       | Style                                    |
|---------------|------------------------------------------|
| card-sport    | white, rounded-2xl, shadow-card, hover lift |
| glass-card    | white/80, backdrop-blur, rounded-2xl     |
| stat-card     | white, rounded-2xl, p-6, border gray-100 |

### Badges
| Variant      | Style                      |
|--------------|----------------------------|
| badge-success| green-100 bg, green-700 text|
| badge-warning| yellow-100 bg, yellow-700  |
| badge-error  | red-100 bg, red-700 text   |
| badge-info   | blue-100 bg, blue-700 text |
| badge-neutral| gray-100 bg, gray-600 text |

### Inputs
- Full width, px-4 py-3, border-2 gray-200, rounded-xl
- Focus: border primary-500, ring-2 primary-100
- Label: text-sm, font-semibold, gray-700, mb-1.5

### Tables
- Container: overflow-x-auto, rounded-xl, border gray-200
- Header: bg-gray-50, text-xs, font-semibold, gray-500, uppercase
- Cell: px-4 py-3, text-sm, gray-700

---

## Animations

| Name          | Duration | Effect                        |
|---------------|----------|-------------------------------|
| fade-in       | 0.5s     | opacity 0→1                   |
| slide-up      | 0.5s     | translateY(20px)→0 + opacity  |
| slide-down    | 0.3s     | translateY(-10px)→0 + opacity |
| scale-in      | 0.3s     | scale(0.95)→1 + opacity       |
| bounce-subtle | 2s loop  | translateY(0)→-5px→0          |

### Transitions
- Interactive elements: `transition-all duration-300`
- Hover lift: `hover:-translate-y-0.5` (buttons), `hover:-translate-y-1` (cards)
- Active press: `active:translate-y-0`

---

## Anti-Patterns (Do Not Use)

- ❌ `gradient-text` — use solid color text instead
- ❌ AI-generated color palettes outside this spec
- ❌ Glassmorphism on non-overlay elements
- ❌ Random emoji in UI (use Lucide icons)
- ❌ Mixed border-radius (pick from the scale above)
- ❌ Drop shadows heavier than shadow-sport-lg
- ❌ Font sizes outside the scale above
- ❌ More than 3 colors in one view

---

## Iconography

- **Library:** Lucide React (`lucide-react`)
- **Size:** 16px (inline), 20px (buttons), 24px (standalone)
- **Color:** inherit from parent text color
- **Sport icons:** Custom SVGs in `src/lib/sport-icons.ts`

---

## Layout Patterns

### Page
```
page-container: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

### Admin Page
```
admin-page-container: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6
```

### Grid
```
sport-card-grid: grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4
```

---

## Dark Mode

Not yet implemented. Future: use Tailwind `dark:` prefix with `next-themes`.
