# Wick Chat — Design System

## Overview

Wick Chat's landing surface is a dark-first, border-defined editorial layout — a deep canvas (`--background: oklch(0.145 0 0)`) with amber-primary CTAs (`--primary: oklch(0.473 0.137 46.201)` in dark mode), custom **Bebas Neue** display typography for all headings, **Nunito Sans** for body copy, and **Geist Mono** as the base interface font. The system reads as premium, structured, and intentionally measured — every section is framed by connected borders (`border-border`) within a constrained `max-w-5xl` column, creating a blueprint-like grid where content sits inside clearly delineated cells.

Type voice splits cleanly into three roles: **Bebas Neue** (weight 400, all-caps display face — used for h1, h2, h3, and brand wordmark), **Nunito Sans** (body text, labels, descriptions), and **Geist Mono** (default interface font on the `<body>`). Bebas Neue uses `tracking-wide` to `tracking-wider` depending on size to compensate for its naturally condensed letterforms.

The page is structured as a vertical stack of bordered sections inside a single `max-w-5xl` container. The header spans full viewport width with its own border, the footer is centered with `max-w-7xl`, and every content section between them connects via shared top/bottom borders — no vertical gaps, creating a continuous measured grid.

**Key Characteristics:**

- Dark-first theme (`next-themes` with `defaultTheme="dark"`). Light mode also supported via the `ThemeToggle` tabs.
- Amber primary (`oklch(0.473 0.137 46.201)` dark) — used for CTAs, accents, icon backgrounds, and highlight spans.
- Every section is a bordered cell — `border-border` on all sides, connected flush to adjacent sections.
- Content constrained to `max-w-5xl` centered column with `px-6` gutters.
- Bebas Neue for all headings (all-caps display face). Nunito Sans for body. Geist Mono for interface chrome.
- Theme variants (ocean, rose, neon, sunset, forest) via `localStorage` — applied as `.theme-{id}` on `<html>`.
- Zero rounded corners on shadcn/ui components — the system is intentionally rectilinear.
- Animated ping indicator on badge and status elements — the only animation in the system.
- Footer is the only full-width element below the bordered column, centered with `max-w-7xl`.

---

## Colors

### Token Reference

Wick Chat uses CSS custom properties defined in `oklch` color space via `globals.css`. The `@theme inline` block maps them to Tailwind utility classes.

| Token                    | Light                        | Dark                         | Usage                     |
| ------------------------ | ---------------------------- | ---------------------------- | ------------------------- |
| `--background`           | `oklch(1 0 0)`               | `oklch(0.145 0 0)`           | Page floor                |
| `--foreground`           | `oklch(0.145 0 0)`           | `oklch(0.985 0 0)`           | Primary text              |
| `--primary`              | `oklch(0.555 0.163 48.998)`  | `oklch(0.473 0.137 46.201)`  | CTAs, accents, highlights |
| `--primary-foreground`   | `oklch(0.987 0.022 95.277)`  | `oklch(0.987 0.022 95.277)`  | Text on primary           |
| `--secondary`            | `oklch(0.967 0.001 286.375)` | `oklch(0.274 0.006 286.033)` | Secondary buttons, cards  |
| `--secondary-foreground` | `oklch(0.21 0.006 285.885)`  | `oklch(0.985 0 0)`           | Text on secondary         |
| `--muted`                | `oklch(0.97 0 0)`            | `oklch(0.269 0 0)`           | Subtle backgrounds        |
| `--muted-foreground`     | `oklch(0.556 0 0)`           | `oklch(0.708 0 0)`           | Secondary text            |
| `--card`                 | `oklch(1 0 0)`               | `oklch(0.205 0 0)`           | Card surfaces             |
| `--card-foreground`      | `oklch(0.145 0 0)`           | `oklch(0.985 0 0)`           | Text on card              |
| `--border`               | `oklch(0.922 0 0)`           | `oklch(1 0 0 / 10%)`         | All borders               |
| `--ring`                 | `oklch(0.708 0 0)`           | `oklch(0.556 0 0)`           | Focus rings               |
| `--radius`               | `0.625rem`                   | `0.625rem`                   | Base radius token         |

### Theme Variants

Room theme variants override `--primary` and related tokens per theme. Defined in `app/themes/theme-{id}.css`:

| Theme   | Primary Color                           |
| ------- | --------------------------------------- |
| Default | `oklch(0.555 0.163 48.998)` — amber     |
| Ocean   | `oklch(0.488 0.243 264.376)` — blue     |
| Rose    | `oklch(0.505 0.213 27.518)` — rose      |
| Neon    | `oklch(0.218 0.008 223.9)` — near-black |
| Sunset  | `oklch(0.228 0.013 107.4)` — near-black |
| Forest  | `oklch(0.527 0.154 150.069)` — green    |

### Surface & Border

- **Section borders**: `border-border` (1px solid, `oklch(1 0 0 / 10%)` in dark). Every section has `border-l border-r border-b`; the first section additionally has `border-t`. Sections stack flush — bottom border of one touches top border of next.
- **Header**: Full-width with its own `border-b border-border`. Inner container `max-w-[243.75]` matches the content column width with `border-l border-r`.
- **Card surfaces**: `bg-card` (`oklch(0.205 0 0)` dark) — used for feature card backgrounds, step cards, accordion.
- **Active session card**: `border-border/60` — slightly softer border than standard section borders.

### Text

- **Ink** (`text-foreground`): All headings, brand wordmark, primary text.
- **Body** (`text-muted-foreground`): Paragraphs, descriptions, feature labels.
- **Muted Soft** (`text-muted-foreground/60` to `/70`): Captions, feature indicator labels, footer fine-print.
- **Muted Softest** (`text-muted-foreground/30`): Decorative elements, copyright.
- **On Primary** (`text-primary-foreground`): Text on primary buttons.
- **Primary Accent** (`text-primary`): Highlighted words, badge text, icon fills.

---

## Typography

### Font Family

The system uses three distinct font families via `next/font/google`:

| Role              | Font            | Weight  | Variable            |
| ----------------- | --------------- | ------- | ------------------- |
| Display / Heading | **Bebas Neue**  | 400     | `--font-heading`    |
| Body / UI         | **Nunito Sans** | 400–700 | `--font-sans`       |
| Interface (base)  | **Geist Mono**  | 400–700 | `--font-geist-mono` |

The `<body>` carries `font-mono` by default (from `layout.tsx`), making Geist Mono the base interface font. Landing page sections explicitly override with `font-heading` (Bebas Neue) for headings and `font-sans` (Nunito Sans) for body text.

### Hierarchy

| Token          | Size                       | Weight | Letter Spacing      | Font        | Use                                         |
| -------------- | -------------------------- | ------ | ------------------- | ----------- | ------------------------------------------- |
| `display-hero` | `clamp(3rem, 8vw, 5.5rem)` | 700    | `tracking-wide`     | Bebas Neue  | Hero h1                                     |
| `display-lg`   | `text-4xl` → `sm:text-5xl` | 700    | `tracking-wide`     | Bebas Neue  | Section h2                                  |
| `display-sm`   | `text-sm`                  | 600    | `tracking-wider`    | Bebas Neue  | Feature titles, step titles                 |
| `body-lg`      | `text-[0.9375rem]`         | 400    | 0                   | Nunito Sans | Hero description                            |
| `body-md`      | `text-base`                | 400    | 0                   | Nunito Sans | Section descriptions                        |
| `body-sm`      | `text-sm`                  | 400    | 0                   | Nunito Sans | Feature descriptions, step descriptions     |
| `caption`      | `text-xs`                  | 500    | `tracking-widest`   | Nunito Sans | Section labels ("Features", "How It Works") |
| `label-sm`     | `text-[0.6875rem]`         | 500    | `tracking-[0.12em]` | Nunito Sans | "Active Room" label                         |
| `badge`        | `text-xs`                  | 500    | `tracking-wide`     | Nunito Sans | Beta badge                                  |
| `button-label` | `text-xs`                  | 600    | `tracking-widest`   | Nunito Sans | Button text (shadcn default)                |

### Principles

Bebas Neue is the brand voice — every heading uses it. Nunito Sans handles body and supporting text. Geist Mono is the interface default (body class). The split is strict: body copy never uses Bebas Neue, and display headlines never use Nunito Sans or Geist Mono.

Bebas Neue requires compensatory `tracking-wide` or `tracking-wider` because its letter spacing is naturally tight at display sizes. Never use `tracking-tighter` or `tracking-tight` with Bebas Neue — those classes are designed for fonts with wider default tracking.

---

## Layout

### Page Structure

```
┌──────────────────────────────────────┐
│  Header (full-width, bordered)       │
├──────────────────────────────────────┤
│  ┌────────────────────────────────┐  │
│  │  Hero Section (bordered)       │  │
│  ├────────────────────────────────┤  │
│  │  ActiveSessionCard (optional)  │  │
│  ├────────────────────────────────┤  │
│  │  Features (bordered)           │  │
│  ├────────────────────────────────┤  │
│  │  How It Works (bordered)       │  │
│  ├────────────────────────────────┤  │
│  │  FAQ (bordered)                │  │
│  └────────────────────────────────┘  │
├──────────────────────────────────────┤
│  Footer (full-width centered)        │
└──────────────────────────────────────┘
```

- **Content column**: `max-w-5xl` centered, `px-6` gutters.
- **Section spacing**: Zero vertical gaps between sections. Each section touches the next — shared border lines create a continuous measured grid.
- **Footer**: `max-w-7xl` centered, independent of the bordered column.

### Section Border System

Each section has `border-l border-r border-b border-border`. The first content section (Hero) additionally has... actually no, Hero relies on its inner div having padding. Sections stack directly:

- Hero: contains the min-height hero content
- Features: `border-l border-r border-b border-border`
- How It Works: `border-l border-r border-b border-border`
- FAQ: `border-l border-r border-border`

The double-stacked borders between sections create a 2px seam, reinforcing the measured/blueprint aesthetic.

### Grid & Container

- **Max content width**: ~1024px (`max-w-5xl`) for the landing page main column.
- **Header width**: Full viewport with inner container `max-w-[243.75]` (matching `max-w-5xl` approximately) with `border-l border-r`.
- **Feature grid**: 3-up at desktop (`lg:grid-cols-3`), 2-up at tablet (`sm:grid-cols-2`), 1-up at mobile. Bento layout: alternating `lg:col-span-2` items create zigzag pattern.
- **How It Works grid**: 4-up at desktop (`lg:grid-cols-4`), 2-up at tablet, 1-up at mobile.
- **Feature grid within bento**: `gap-px overflow-hidden border border-border bg-border` — the grid lines are 1px gaps showing the container's `bg-border` color through.

### Whitespace Philosophy

Wick Chat uses compact, deliberate spacing. Section content has `p-6` internal padding. Feature cards have `p-8` internal padding. There is no vertical margin between sections — the border system is the spatial separator. The rhythm is tight, structured, and blueprint-like rather than generous and airy.

---

## Elevation & Depth

| Level         | Treatment                        | Use                                             |
| ------------- | -------------------------------- | ----------------------------------------------- |
| Flat          | No shadow, no border             | Body sections, hero band                        |
| Card surface  | `bg-card` background — no shadow | Feature cards, step cards, accordion            |
| Hairline      | 1px `border-border`              | Section borders, card outlines, grid separators |
| Subtle shadow | `shadow-sm`                      | Active session card                             |
| Hover state   | `hover:bg-muted/50`              | Feature cards on hover                          |
| Icon ring     | `ring-1 ring-primary/10`         | Feature icon containers, step icon containers   |

The elevation philosophy is **flat and structural** — depth comes from the border grid system and surface color contrast, not from drop shadows. The only shadow in the system is `shadow-sm` on the active session card.

### Decorative Depth

- **Hero background**: Subtle dot-grid pattern using `var(--primary)` at 1.5–3% opacity with `mask-image: radial-gradient(ellipse 80% 50% at 50% -20%, ...)` — creates a ghost grid that fades out toward the bottom.
- **Hero glow orbs**: `bg-primary/5 blur-[120px]` and `bg-primary/[0.03] blur-[100px]` — soft color blooms at low opacity.
- **Feature accent bar**: Wide features get an `absolute top-0 left-0 right-0 h-px bg-primary/20` top accent line.

---

## Shapes

### Border Radius

The system is intentionally **zero-radius** on all shadcn/ui components. Tailwind's base `--radius: 0.625rem` is defined but overridden by explicit `rounded-none` (or absence of rounded classes) on interactive components.

| Token          | Value  | Use                                           |
| -------------- | ------ | --------------------------------------------- |
| `rounded-none` | 0      | All buttons, inputs, cards, accordion, badges |
| `rounded-full` | 9999px | Ping animation dots, decorative circles       |

The only rounded elements in the system are:

- Pulse indicator dots: `rounded-full` on the "Active Room" ping dot and beta badge dot
- Logo container in footer: `rounded-md` (the "R" letter box)

### Photography / Icon Geometry

- Feature icons: 40×40px container, `bg-primary/[0.08]` with `ring-1 ring-primary/10`. Square.
- Step icons: Same treatment as feature icons. Square.
- Feature indicator icons: 24×24px container, `bg-primary/[0.06]`. Square.

---

## Components

### Header (`Header.tsx`)

**`site-header`** — Fixed top nav bar. Full width, `border-b border-border`, 64px tall (`h-16`). Contains a centered inner container matching the page content width with `border-l border-r border-border`. Left side holds the Wick Chat wordmark as an `<Image>` (`/transparent-logo.png`, 100×28, `h-7 w-auto`). Right side has the `ThemeToggle` (light/dark/system tabs) and a GitHub icon link.

```
┌─────────────────────────────────────────────┐
│  [Wick Chat Logo]           [ThemeToggle] [GitHub] │
└─────────────────────────────────────────────┘
```

### Hero Section (`HeroSection.tsx`)

**`hero-band`** — Dark canvas hero occupying `min-h-[calc(100dvh-4rem)]`. Background has a subtle dot-grid pattern (`var(--primary)` at 1.5–3% opacity) masked with a radial gradient, plus two soft glow orbs. Content is left-aligned within `p-6` padding.

Sequenced vertically:

1. **Beta badge** — `inline-flex border border-primary/15 bg-primary/[0.04]`. Text `text-xs tracking-wide text-primary`. Icon: `IconSparkles`.
2. **h1** — `font-heading text-[clamp(3rem,8vw,5.5rem)] font-bold tracking-wide leading-[1.02]`. First line: "Chat without", second line: "boundaries" in `text-primary` with a `h-[3px] bg-primary/30` underline bar.
3. **Sub-headline** — `font-sans max-w-xl text-[0.9375rem] text-muted-foreground`.
4. **CTA row** — Two shadcn `Button` components. Primary (default variant): "Create a Room" with `IconArrowRight` inside a white 15% opacity icon box. Secondary: "Join Room" with `IconUsers`. Both `h-12 gap-3 px-8 text-xs`.
5. **Feature indicators** — Three items in a row: IconShield / IconClock / IconUsers inside 24×24 `bg-primary/[0.06]` boxes with `text-primary/50`.

```
[✨ Now in public beta]

CHAT WITHOUT
BOUNDARIES
───

Wick Chat is a private, ephemeral chat platform...

[Create a Room →]  [Join Room]

[🛡 Anonymous]  [⏱ Ephemeral]  [👥 Private]
```

### Features Section (`FeaturesSection.tsx`)

**`feature-grid`** — Bento grid layout. Section label in `text-xs font-semibold tracking-widest text-primary/70 uppercase`. h2 heading. Description in `font-sans`.

The feature grid is a 3-column grid on desktop with `gap-px` and `border border-border bg-border` — the background color shows through the 1px gaps as grid lines.

Six features with bento spans:

| Desktop (3-col) | Item                                  |
| --------------- | ------------------------------------- |
| Row 1           | Anonymous (span 2), Ephemeral         |
| Row 2           | Instant Setup (span 2), Private Rooms |
| Row 3           | End-to-End, Easy Sharing (span 2)     |

Each card:

- `bg-card p-8 transition-colors hover:bg-muted/50`
- Top accent line on wide items (`absolute top-0 h-px bg-primary/20`)
- 40×40 icon container with `bg-primary/[0.08] ring-1 ring-primary/10`
- Title in `font-heading text-sm font-semibold tracking-wider`
- Description in `font-sans text-sm leading-relaxed text-muted-foreground`

### How It Works Section (`HowItWorksSection.tsx`)

**`step-grid`** — 4-column grid on desktop (`lg:grid-cols-4`), 2-column on tablet, 1-column on mobile. Each step card is `border border-border bg-card p-6 transition-colors hover:border-primary/20`.

Each step contains:

- Step number in `text-4xl font-bold tracking-tighter text-primary/10` (e.g., "01")
- 40×40 icon container (same treatment as feature icons)
- Title in `font-heading mt-4 text-sm font-semibold tracking-wider`
- Description in `font-sans text-sm leading-relaxed text-muted-foreground`
- Connector line between steps: `absolute top-1/2 -right-3 h-px w-6 bg-border` (hidden on mobile)

### FAQ Section (`FAQSection.tsx`)

Uses the shadcn `Accordion` component. Wrapped in `divide-y divide-border border border-border bg-card`. Each trigger has `px-6 py-5` with question text in `font-sans text-sm font-medium`. Content panels have `px-6` with answers in `font-sans text-sm leading-relaxed text-muted-foreground`.

### Active Session Card (`ActiveSessionCard.tsx`)

Conditionally rendered when a `chat_room_session` exists in `localStorage`. Shows between Hero and Features. `max-w-sm` with `border border-border/60 bg-card p-5 shadow-sm`. Displays:

- Animated ping dot (`animate-ping rounded-full bg-primary/60`)
- "Active Room" label in `text-[0.6875rem] uppercase tracking-[0.12em]`
- Room code in `font-heading text-lg font-semibold tracking-wide`
- Time remaining countdown with `IconClock`
- Chevron-right ghost button linking to `/room/[roomCode]`

### Footer (`FooterSection.tsx`)

**`site-footer`** — `border-t border-border py-12` with `max-w-7xl centered`. Three sections in a flex row (centered on mobile, row on desktop):

- Left: "R" letter logo (`rounded-md bg-primary/10`) + "Wick Chat" wordmark in `font-heading text-sm font-semibold tracking-wide`
- Center: "Built with ❤️ by Nehan Ahmed" — `font-sans text-xs text-muted-foreground` with `IconHeart` in `text-primary/60` and a link to `https://github.com/NehanAhmed`
- Right: GitHub link + copyright

### ThemeToggle (`ThemeToggle.tsx`)

Uses shadcn `Tabs` with three values: `light`, `dark`, `system`. Each tab has an icon (`IconSun`, `IconMoon`, `IconDeviceDesktop`) and label. Wrapped in `useSyncExternalStore` for hydration safety. Renders a skeleton placeholder before mount.

### ThemeVariantSwitcher (`theme-switcher.tsx`)

A dropdown palette icon button that opens a floating panel with room theme variants (Default, Ocean, Rose, Neon, Sunset, Forest). Each option has a colored circle and name. Uses `motion/react` for open/close animation.

---

## Interactive Behavior

### Button States

| State    | Primary Button                        | Secondary Button                         | Ghost Button                           |
| -------- | ------------------------------------- | ---------------------------------------- | -------------------------------------- |
| Default  | `bg-primary text-primary-foreground`  | `bg-secondary text-secondary-foreground` | No background, text only               |
| Hover    | `hover:bg-primary/80`                 | `hover:bg-[color-mix(...)]`              | `hover:bg-muted hover:text-foreground` |
| Active   | `active:translate-y-px` (from shadcn) | Same                                     | Same                                   |
| Disabled | `opacity-50 pointer-events-none`      | Same                                     | Same                                   |

### Hover Effects

- **Feature cards**: `hover:bg-muted/50 transition-colors` — subtle background shift.
- **Step cards**: `hover:border-primary/20 transition-colors` — border highlight.
- **Create Room button arrow**: `group-hover:translate-x-0.5 transition-transform duration-300` — arrow shifts right on hover.
- **Secondary button icon**: `group-hover:text-foreground transition-colors` — icon color shift.
- **Create Room icon box**: `group-hover:bg-white/25 transition-colors` — icon background lightens.
- **Footer links**: `hover:text-primary` / `hover:text-foreground` — color shift.

### Animation

The only animation in the system is `animate-ping` on:

- Beta badge indicator dot
- Active Room status dot

No motion/react animations are used on the landing page.

---

## Do's and Don'ts

### Do

- Reserve `border-border` for every section boundary. The connected border grid is the defining layout principle.
- Use Bebas Neue for every heading with `tracking-wide` or `tracking-wider`. Never use `tracking-tight` or `tracking-tighter` — Bebas Neue's condensed forms need the extra letter-spacing.
- Keep sections flush — no vertical margin between bordered containers.
- Use shadcn `Button` with `rounded-none` (default) — avoid adding radius classes.
- Keep icon containers square and flat (`bg-primary/[0.08] ring-1 ring-primary/10`).
- Use the `font-sans` class explicitly on all body text to override the default `font-mono` body class.
- Stack sections directly: `border-l border-r border-b border-border` on every section.

### Don't

- Don't add `rounded-*` classes to shadcn components — the system is rectilinear.
- Don't use motion/react animations on the landing page.
- Don't add drop shadows to cards — the border system is the elevation mechanism.
- Don't use `font-heading` for body text or `font-sans` for headings.
- Don't add vertical padding/margin between bordered sections — they must touch.
- Don't center content within sections — the layout is left-aligned.

---

## Responsive Behavior

### Breakpoints

| Name    | Width      | Key Changes                                                                                                    |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------- |
| Mobile  | < 640px    | Single-column grids; hero h1 at `clamp(3rem, 8vw, ...)` minimum; CTAs stack vertically; step connectors hidden |
| Tablet  | 640–1024px | Feature grid 2-up; step grid 2-up; section h2 at `text-4xl`                                                    |
| Desktop | ≥ 1024px   | Full bento grid (`lg:col-span-2` activates); feature grid 3-up; step grid 4-up; section h2 at `text-5xl`       |

### Touch Targets

- `Button`: Minimum 40px height (default `h-10`; hero CTAs use `h-12`).
- `ThemeToggle` tabs: Meet 44px+ effective tap area via tab padding.
- Feature/step cards: Entire card surface is clickable/ interactive via hover states.

### Grid Collapse

- Bento spans (`lg:col-span-2`) only apply at `lg` breakpoint. Below that, all feature cards are equal width.
- Step grid collapses 4 → 2 → 1 columns.
- Feature indicator row remains horizontal at all breakpoints.
- Footer collapses from row to column on mobile.
- Active session card stays `max-w-sm` at all breakpoints.

---

## Iteration Guide

1. Every new section must follow the border pattern: `border-l border-r border-b border-border`.
2. Headings always use `font-heading` with `tracking-wide` or `tracking-wider`.
3. Body text always uses `font-sans`.
4. No rounded corners on shadcn components — the system is flat.
5. No motion/react on the landing page — use CSS transitions for hover states.
6. All sections stack flush — no vertical gaps between bordered containers.
7. When adding new features to the bento grid, set `wide: true` for items that should span 2 columns on desktop.
8. Keep icon containers consistent: 40×40 for feature/step icons, 24×24 for indicator icons, `bg-primary/[0.08] ring-1 ring-primary/10`.
9. Dark mode is the default — ensure new components look correct in both `:root` and `.dark` contexts.

---

## Known Gaps

- Animation and transition timings beyond hover states are not documented — the system intentionally avoids motion on the landing page.
- Form validation states (error/success on inputs) are not in scope — no forms exist on the landing page.
- The actual chat interface room page (`/room/[roomCode]`) has its own design system not covered here.
- Theme variant CSS files (`theme-ocean.css`, `theme-rose.css`, etc.) override primary/accent colors — their exact token mappings are documented in `lib/themes.ts` and `lib/THEMES.md`.
- Responsive breakpoints below 640px (small mobile) follow natural Tailwind stack behavior without explicit overrides.
