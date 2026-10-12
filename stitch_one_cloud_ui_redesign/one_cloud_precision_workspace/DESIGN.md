---
name: One Cloud Precision Workspace
colors:
  surface: '#141A24'
  surface-dim: '#111319'
  surface-bright: '#36393f'
  surface-container-lowest: '#0b0e13'
  surface-container-low: '#191c21'
  surface-container: '#1d2025'
  surface-container-high: '#272a30'
  surface-container-highest: '#32353b'
  on-surface: '#e1e2ea'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e1e2ea'
  inverse-on-surface: '#2e3036'
  outline: '#8c909f'
  outline-variant: '#424753'
  surface-tint: '#afc6ff'
  primary: '#afc6ff'
  on-primary: '#002d6c'
  primary-container: '#528dff'
  on-primary-container: '#00275f'
  inverse-primary: '#0059c6'
  secondary: '#83cfff'
  on-secondary: '#00344b'
  secondary-container: '#089ad5'
  on-secondary-container: '#002d42'
  tertiary: '#53de9e'
  on-tertiary: '#003822'
  tertiary-container: '#00a56d'
  on-tertiary-container: '#00311d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#afc6ff'
  on-primary-fixed: '#001a43'
  on-primary-fixed-variant: '#004398'
  secondary-fixed: '#c6e7ff'
  secondary-fixed-dim: '#83cfff'
  on-secondary-fixed: '#001e2e'
  on-secondary-fixed-variant: '#004c6c'
  tertiary-fixed: '#72fbb9'
  tertiary-fixed-dim: '#53de9e'
  on-tertiary-fixed: '#002112'
  on-tertiary-fixed-variant: '#005234'
  background: '#111319'
  on-background: '#e1e2ea'
  surface-variant: '#32353b'
  canvas: '#0B0E13'
  sidebar: '#0F131B'
  surface-raised: '#191F2B'
  surface-hover: '#202938'
  border: '#293241'
  border-strong: '#3A4658'
  text-primary: '#F3F6FB'
  text-secondary: '#A4AFBF'
  text-muted: '#758195'
  brand-hover: '#3D79EF'
  brand-subtle: '#172B49'
  focus-ring: '#82B0FF'
  warning: '#F2B84B'
  danger: '#F16B7A'
  file-document: '#6FA2FF'
  file-image: '#45C89A'
  file-video: '#A88BFF'
  file-audio: '#F2B84B'
  file-archive: '#E99A64'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  metric-display:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  gutter-lg: 1.5rem
  margin: 2rem
  margin-tablet: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

The design system embodies calm, technical confidence and functional precision. Built as a Telegram-backed personal cloud workspace, it combines the surgical density and focused hierarchy of high-velocity developer tools (Linear) with the spatial familiarity and frictionless muscle memory of modern cloud drive platforms (Google Drive). 

### Aesthetic Philosophy
The system follows a strict technical minimalism built on low-contrast structural outlines, pure obsidian base surfaces, and quiet, deliberate color accents. Decorative gradients, non-functional glassmorphic blurs, animated backdrops, and artificial skeumorphic elements are strictly avoided. Visual authority emerges through micro-alignment, tabular precision, rhythmic spacing, and restrained typography.

### Emotional Target
- **Control & Agency:** Complex file hierarchies feel structured, organized, and effortlessly scannable.
- **Privacy & Security:** Deep obsidian hues and matte surfaces establish a discrete, hardened vault atmosphere.
- **Velocity:** High-density, sub-millimeter layout logic enables rapid scanning, fast keyboard access, and quick file manipulation.

## Colors

The system uses a strictly dark visual architecture rooted in obsidian, charcoal, and cool slate.

### Palette Hierarchy & Usage
- **Primary (`#4F8CFF`):** Reserved exclusively for core calls to action (e.g., primary "New" buttons, active navigation markers, keyboard focus states). Hover states resolve to `#3D79EF`, while active backgrounds resolve to `#172B49`.
- **Secondary (`#36AEEA`):** Designated solely for Telegram platform identity, bot connectivity indicators, and synchronization signals. Never use as generic UI accents.
- **Tertiary / Semantic Success (`#38C98B`):** Denotes confirmed file operations, active integrations, and completed uploads.
- **Neutral Canvas (`#0B0E13`) & Tonal Surfaces:**
  - `canvas` (`#0B0E13`): Application backdrop.
  - `sidebar` (`#0F131B`): Navigation panel.
  - `surface` (`#141A24`): Main cards, table containers, and contextual panels.
  - `surface-raised` (`#191F2B`): Flyouts, dropdown menus, context menus, and modals.
  - `surface-hover` (`#202938`): Dynamic interactive hover state for rows and list items.

### Content & File Accent Rules
File category colors (`file-document`, `file-image`, `file-video`, `file-audio`, `file-archive`) must never tint large surface backgrounds. They are reserved for 16–20px outline icon strokes or file badge chips. Contrast for typography relies strictly on `text-primary` (`#F3F6FB`), `text-secondary` (`#A4AFBF`), and `text-muted` (`#758195`).

## Typography

Typography is set entirely in **Inter**, relying on systematic weight contrast and strict letter-spacing tracking to produce a balanced, technical feel.

### Rules & Text Hierarchy
- **Sentence Case Only:** All page titles, table headers, buttons, and subtext use sentence case. All-caps is reserved exclusively for micro-status badges (e.g., `PDF`, `ZIP`).
- **Tabular Numerals (`font-variant-numeric: tabular-nums`):** Mandatory for file sizes, dates, item counts, upload progress percentages, and storage metrics to prevent horizontal layout shift during dynamic state updates.
- **Density Rules:** The default interactive text baseline is 14px (`body-md` / `label-md`). Metadata lines, file timestamps, and supplementary labels step down to 12px (`label-sm`). Text smaller than 12px is prohibited to ensure high contrast and readability.

## Layout & Spacing

The layout is anchored to a rigid 4px base coordinate grid (`4, 8, 12, 16, 20, 24, 32, 40, 48, 64`), balancing high-density desktop productivity with adaptable fluid regions.

### Shell Architecture
- **Persistent Sidebar:** Fixed desktop width of `248px`, spanning 100vh on the left edge.
- **Header Bar:** Persistent `68px` to `72px` vertical height across all authenticated workspaces.
- **Main Viewport Canvas:**
  - Desktop content padding: `28px` to `32px` (`margin`).
  - Tablet content padding: `20px` to `24px` (`margin-tablet`).
  - Mobile content padding: `16px` (`margin-mobile`).

### Grid & Row Mechanics
- **Standard File Table Row:** Fixed `56px` height. Elements within the row align on a vertical center axis with consistent column padding.
- **Folder Grid:** Fluid responsive column layout using 16px (`gutter`) gaps, expanding from 2 columns on mobile to 4–6 columns on wider displays.
- **Responsive Adaptations:**
  - *Desktop (>1024px):* Static sidebar (`248px`), full top header search bar, multi-column tabular data grid.
  - *Tablet (768px - 1023px):* Collapsible navigation rail or toggleable sidebar, compact file table hiding non-critical metadata.
  - *Mobile (<768px):* Full-width drawer navigation, simplified single-column file cards retaining the 56px baseline touch target, sticky bottom action sheet for contextual commands.

## Elevation & Depth

Visual hierarchy uses flat, tonal layering rather than heavy ambient shadows. Elements stack visually via brightness steps and structural borders.

### Depth Hierarchy
1. **Canvas (Base 0):** `#0B0E13` — Base floor of the workspace.
2. **Sidebar & Structural Frames (Tier 1):** `#0F131B` — Anchored structural framing, partitioned from the canvas using a 1px solid border of `#293241`.
3. **Cards & Embedded Surfaces (Tier 2):** `#141A24` — Storage widgets, folder preview tiles, and table headers. Outlined with 1px `#293241`.
4. **Popovers, Menus, Modals (Tier 3):** `#191F2B` — Floating context menus, upload drawers, and modal dialogs. Outlined with 1px `#3A4658` (`border-strong`) and elevated by a subtle shadow: `0 8px 24px -4px rgba(0, 0, 0, 0.45)`.

### Border Integrity
- All structural boundaries must use crisp, 1px lines (`#293241`).
- Never introduce diffuse, neon, or multi-directional drop shadows. Selected states rely on 1px `#3A4658` or subtle blue background flooding (`#172B49`), never ambient glow rings.

## Shapes

The design uses geometric, slightly softened corners to maintain a clean, tool-grade feel.

### Corner Radii Tokens
- **Input Fields, Controls & Buttons:** `9px` to `10px` — Compact, calibrated interactive hit targets.
- **Cards, Containers & Table Outlines:** `12px` to `14px` — File containers, folder tiles, and contextual preview panels.
- **Large Overlays & Modals:** `16px` — Upload queues, preview lightboxes, and central dialogs.
- **Status Badges & Chips:** Full pill (`9999px`) — Reserved exclusively for compact status tags (e.g., Telegram connection status, file type pill, tag filters).

## Components

### Buttons
- **Primary:** Background `#4F8CFF`, foreground `#F3F6FB`, font-weight 500, height 40–44px, radius 10px. Hover state `#3D79EF`.
- **Secondary:** Surface `#141A24` or transparent, border 1px `#293241`, foreground `#F3F6FB`. Hover state `#202938`.
- **Tertiary / Icon Action:** Transparent base, foreground `#A4AFBF`. On hover: surface `#202938`, foreground `#F3F6FB`. Fixed 36x36px or 40x40px square with a 9px radius.
- **Destructive:** Border 1px `#F16B7A` on hover, foreground `#F16B7A`. Active confirmation fills with `#F16B7A` and `#F3F6FB` text.

### Inputs & Search Bars
- Background `#141A24`, border 1px `#293241`, radius 10px, height 40–44px, text `#F3F6FB`. Placeholder `#758195`.
- Focus state applies a visible, sharp 2px outline of `#82B0FF` with no outer glow.
- Global header search includes a persistent leading 16px search icon and an optional trailing keyboard shortcut badge (`⌘K`).

### File & Folder Rows (56px Height)
- Grid columns: Selection Checkbox (32px), Type Icon (32px), Name (fluid), Date Modified (140px), File Size (90px), Actions (48px).
- Row background `#0B0E13` (or `#141A24` when inside isolated panels); hover background `#202938`.
- Selected row state: background `#172B49`, border-left 2px `#4F8CFF`.
- Action menu: 3-dot vertical trigger button revealing a 9px radius dropdown with actions: *Preview, Download, Rename, Move, Star, Trash*.

### Cards & Metrics
- Folder cards: Compact horizontal tile (64px height) featuring a folder outline icon, truncated title, and sub-metric item count.
- Storage progress card (Sidebar): Embedded card with `#141A24` background, 1px `#293241` border, 12px radius. Visual linear bar (height 6px, track `#191F2B`, active bar `#4F8CFF`).

### Chips & Badges
- Height 24px, padding 0 8px, font-size 12px, border-radius 9999px.
- Status styles:
  - *Connected / Synced:* Background `rgba(56, 201, 139, 0.12)`, text `#38C98B`, leading 6px dot.
  - *Telegram Bot Syncing:* Background `rgba(54, 174, 234, 0.12)`, text `#36AEEA`.
  - *Error / Alert:* Background `rgba(241, 107, 122, 0.12)`, text `#F16B7A`.

### Modals & Dialogs
- Centered overlay with backdrop `#0B0E13` at 70% opacity.
- Modal card: Surface `#191F2B`, border 1px `#3A4658`, radius 16px, padding 24px.
- Distinct footer containing primary action on the right and secondary/cancel on the left.