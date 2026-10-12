# One Cloud — Design System

**Document status:** Source of truth for Stitch UI generation  
**Product:** One Cloud — Telegram-powered personal cloud drive  
**Default appearance:** Dark theme  
**Primary language for generated UI:** English  
**Target:** Responsive web app; desktop-first for the core drive workspace

## 1. Product and design intent

One Cloud helps users organize, browse, preview, upload, download, search, star, move, restore, and manage files through a familiar cloud-drive interface. File bytes are stored in the user's Telegram Saved Messages; Firebase/Firestore supports authentication and file metadata. The UI should communicate clarity, control, privacy, and reliability.

Create a premium, calm, modern productivity product: polished like a mature cloud-storage/workspace application, with the focused hierarchy of Linear and the usability patterns expected from Google Drive, but do not copy either product's exact UI. Avoid flashy gradients, excessive glassmorphism, oversized empty hero areas inside the app, decorative blobs, excessive shadows, and random accent colors.

This document is the canonical design source for every One Cloud screen. When a screen-specific prompt conflicts with this document, follow this document unless the prompt explicitly names a one-off page requirement that does not break global consistency.

## 2. Non-negotiable design rules

1. **Dark is the default.** Every generated screen must open in the dark theme. Do not generate light-mode variants unless explicitly requested. Keep a theme control available where appropriate, but the default state must always be dark.
2. Use the same One Cloud wordmark, cloud mark, sidebar, header, spacing system, typography, icon family, button styles, focus style, and corner radii throughout the authenticated app.
3. Do not invent new navigation items, features, routes, or backend behavior. Redesign presentation only; preserve the capabilities and information architecture listed in this document.
4. Use a restrained blue accent and neutral dark surfaces. No rainbow palettes or frequent gradients.
5. Use Lucide-style outline icons consistently. Do not switch to emojis, filled cartoon icons, or mixed icon families.
6. Prioritize legibility, strong alignment, clear visual hierarchy, and practical density. A file manager should make it easy to scan rows and take action.
7. Do not claim the product provides unlimited storage. Describe storage as usage tracked in the drive and Telegram-backed file storage when needed.
8. Use realistic demo content only to make screens readable. Treat counts, storage usage, names, and dates as illustrative sample data, not real account information.
9. Preserve accessible contrast and clear keyboard-focus states. Never communicate status by color alone.
10. Do not redesign each route as an unrelated website. All authenticated routes must clearly belong to one coherent application.

## 3. Design tokens

### Color palette

| Token | Hex | Use |
|---|---|---|
| `canvas` | `#0B0E13` | Main application background |
| `sidebar` | `#0F131B` | Persistent app sidebar |
| `surface` | `#141A24` | Cards, table surface, panels |
| `surface-raised` | `#191F2B` | Popovers, menus, raised cards |
| `surface-hover` | `#202938` | Hover/selected secondary surface |
| `border` | `#293241` | Default borders and separators |
| `border-strong` | `#3A4658` | Stronger separators / selected outlines |
| `text-primary` | `#F3F6FB` | Main headings and primary labels |
| `text-secondary` | `#A4AFBF` | Body text and secondary labels |
| `text-muted` | `#758195` | Helper text, metadata, placeholders |
| `brand-primary` | `#4F8CFF` | Primary buttons, links, selected navigation |
| `brand-hover` | `#3D79EF` | Hover state for primary actions |
| `brand-subtle` | `#172B49` | Quiet blue-tinted selected background |
| `focus-ring` | `#82B0FF` | Accessible keyboard focus |
| `success` | `#38C98B` | Connected / completed status |
| `warning` | `#F2B84B` | Caution / pending status |
| `danger` | `#F16B7A` | Errors and destructive actions only |
| `telegram-blue` | `#36AEEA` | Telegram-specific icon or connection indicator only |
| `file-document` | `#6FA2FF` | Document file icon accent |
| `file-image` | `#45C89A` | Image file icon accent |
| `file-video` | `#A88BFF` | Video file icon accent |
| `file-audio` | `#F2B84B` | Audio file icon accent |
| `file-archive` | `#E99A64` | Archive file icon accent |

Use the dark canvas and surfaces as the majority of the interface. Blue is the only general-purpose brand accent. File-type colors are small icon accents, not large card backgrounds.

### Typography

- **Preferred font:** Inter; use a close neutral sans-serif fallback if unavailable.
- **Page title:** 28–32 px, weight 650–700, compact line height.
- **Section title:** 16–18 px, weight 600–650.
- **Body / controls:** 14 px, weight 400–500.
- **Table rows:** 13–14 px.
- **Metadata / helper text:** 12 px; do not make important text smaller than 12 px.
- **Metrics:** 24–30 px, weight 650–700; use tabular numerals for sizes and counts.
- Use sentence case. Avoid all-caps labels except very short status chips.

### Spacing and geometry

Use a consistent 4 px base spacing scale: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.

- Desktop sidebar: 248 px fixed width.
- Top application header: 68–72 px high.
- Main content padding: 28–32 px desktop; 20–24 px tablet; 16 px mobile.
- Main content should use the available width without looking stretched or cramped.
- Standard file-table row: about 56 px high.
- Card padding: 20–24 px.
- Input and button height: 40–44 px.
- Keep horizontal alignment consistent from page heading to toolbar to content.

### Corner radius and elevation

- Small controls / inputs / buttons: 9–10 px.
- Standard cards / table containers: 12–14 px.
- Large panels: 16 px.
- Pills: only for compact statuses, filters, or labels.
- Use 1 px borders and subtle elevation on raised surfaces. Do not use strong, diffuse shadows on every card.

### Iconography

- Use Lucide-style outline icons exclusively.
- Typical icon sizes: 16 px for dense controls; 18–20 px for navigation and actions; 24 px only for prominent empty states or feature illustrations.
- Keep stroke weight consistent. Use the same icon for the same action across every screen.
- Use the cloud icon for One Cloud branding; do not invent alternate logos on different pages.

## 4. Shared authenticated application shell

All authenticated workspace screens use the same fixed shell:

### Sidebar (left)

- Dark sidebar, separated from content by a subtle 1 px border.
- Top brand area: one consistent cloud mark + **One Cloud** wordmark; optional tiny subtitle **Telegram Drive**.
- One full-width primary **New** button near the top. Its menu supports **Upload files** and **New folder**.
- Navigation order and labels are fixed:
  1. Home — `/app`
  2. My Drive — `/app/drive`
  3. Recent — `/app/recent`
  4. Starred — `/app/starred`
  5. Trash — `/app/trash`
- Keep a stable icon per item: LayoutDashboard, HardDrive, Clock, Star, Trash2 (Lucide-style equivalents).
- Active navigation: muted blue-tinted background, brand-blue icon/text, medium/semibold label. Do not use a bright full-width glow.
- Bottom area: compact Storage Used card, Telegram connection status/action, and Settings (`/app/settings`).
- Do not move the primary navigation between screens.

### Top header

- Same header dimensions and placement on all authenticated routes.
- Left side can hold a mobile sidebar toggle and/or contextual breadcrumb when needed.
- Prominent global search field with placeholder **Search files and folders**; maintain the same width, border, icon, and location across all authenticated screens.
- Right-side utilities, in consistent order: sync/refresh status, theme control (default dark), and user profile/avatar menu. Keep them quiet and compact.
- Do not introduce a second unrelated navigation bar on any workspace screen.

### Main content region

- Starts after the persistent header and uses the shared content padding.
- Every page begins with a consistent title row: page title and a short helper sentence where useful, followed by context-specific primary actions.
- Toolbars, filters, breadcrumbs, tables, empty states, and panels align to the same content grid.
- Keep upload status/progress visually accessible without covering important page content.

## 5. Shared components

### Buttons

- Primary: solid `brand-primary`, white label, 9–10 px radius, clear hover/focus/disabled states. Use for the single most important action in a region.
- Secondary: `surface` fill or transparent fill with a `border` outline and primary text.
- Tertiary/icon button: transparent until hover, with an accessible tooltip label.
- Destructive: `danger` only for delete/permanently remove actions; never use red as a decorative accent.
- Never show multiple competing high-emphasis primary buttons in one small area.

### Search, inputs, and filters

- Dark surface, subtle border, 40–44 px high, 9–10 px radius.
- Placeholder text uses `text-muted`; entered text uses `text-primary`.
- Use visible focus ring `focus-ring`.
- Filters should be compact, aligned and visibly reflect their selected state.

### File and folder rows

- Reuse one consistent file icon/thumbnail column, name/type details, metadata columns, and row action menu.
- Folder items appear before file rows when the route contains both.
- Provide adequate row hover treatment and a clear selected state without recoloring the whole table strongly.
- Use familiar menu affordances for Preview, Download, Rename, Move, Star/Unstar, Move to Trash, Restore, or Delete Forever where supported by the current route. Do not show actions that are not relevant to that route.
- File type must be recognizable from a consistent compact icon or preview thumbnail. Do not make every row a separate large card.
- Keep column headings muted and aligned with their values. Align sizes and dates consistently.

### Statuses

- Use small, restrained status labels with both text and color/icon: Connected, Syncing, Uploading, Completed, Failed, etc.
- Telegram blue is reserved for Telegram-specific status/action accents; success green means successful/connected; danger red means failure/destructive actions.

### Empty, loading, and error states

- Use a consistent composition: simple relevant outline icon, concise title, one sentence explaining the state, and one useful next action when applicable.
- Do not invent illustrations that use a different visual style on each page.
- Loading uses restrained skeletons/spinners that preserve layout; error states offer a clear retry or corrective action where supported.

### Modals and menus

- Same dark surface, border, spacing and 12–16 px radius throughout the app.
- Modal title, helper description, content, and footer actions follow a consistent order.
- Destructive confirmation must be visually distinct but not alarmist.

## 6. Screen-specific requirements

### Home / Dashboard — `/app`

Purpose: a high-level overview and fast entry point to common actions.

- Use the shared authenticated shell.
- Heading: **Welcome back** or **Home**, with a concise supporting line.
- Primary actions: **Upload** and **New folder**; show **Connect Telegram** prominently only if connection is not active.
- Show an overview of drive contents: tracked storage usage, file count, folder count, and file-category breakdown (documents, images, videos, audio, other) where it fits the existing product behavior.
- Include a **Recent files** section with a consistent compact file list and a **View all** link to Recent.
- Include a useful first-time/empty state if there are no files yet.
- Avoid unnecessary marketing hero sections inside the authenticated dashboard.

### My Drive — `/app/drive`

Purpose: primary file and folder management.

- Use the shared shell and a clear **My Drive** title.
- Include breadcrumb/path navigation when inside a nested folder.
- Use a consistent toolbar for Upload, New folder, view mode, file-type filter, and sort controls where supported.
- Show folder tiles/rows first, then a scannable file list/table.
- Include selection states and per-item action menus without visual clutter.
- The root My Drive and nested Folder View must look like the same page template; only title/breadcrumb/content changes.

### Recent — `/app/recent`

Purpose: find recently uploaded or modified items quickly.

- Use the shared shell, title **Recent files**, and a short helper sentence.
- Reuse the exact file-list/table component from My Drive, with the same row height, columns, icons, typography, and menus.
- Sort newest first; folders do not need their own section on this route.
- Include a consistent empty state for accounts without recent files.

### Starred — `/app/starred`

Purpose: access important files and folders quickly.

- Use the shared shell, title **Starred**, and the same content grid as Recent and My Drive.
- Use the same folder and file components as My Drive; starred status is shown with the same restrained star icon treatment.
- Include both starred folders and starred files where available.
- Include a consistent empty state that tells the user how to star an item.

## 7. Route inventory for future design prompts

Use these real routes when planning later groups. Do not invent replacement routes.

| Screen | Route | Design family |
|---|---|---|
| Public landing page | `/` | Public marketing shell |
| Login | `/login` | Authentication |
| Sign up | `/signup` | Authentication |
| Home / Dashboard | `/app` | Authenticated workspace |
| My Drive | `/app/drive` | Authenticated workspace |
| Nested folder view | `/app/drive/[folderId]` | Authenticated workspace; same My Drive template |
| Recent files | `/app/recent` | Authenticated workspace |
| Starred files | `/app/starred` | Authenticated workspace |
| Trash | `/app/trash` | Authenticated workspace |
| Settings | `/app/settings` | Authenticated workspace / settings sections |
| Help | `/help` | Public help/content shell |
| How it works | `/how-it-works` | Public informational shell |
| Privacy policy | `/privacy` | Public legal-content shell |
| Terms of service | `/terms` | Public legal-content shell |
| Security | `/security` | Public informational shell |
| Acceptable use policy | `/acceptable-use` | Public legal-content shell |

Public pages may use a simpler public header/footer instead of the authenticated sidebar, but must keep the same brand, typography, color tokens, button styles, and dark-first appearance. Auth/login forms, marketing pages, and legal documents can have different layouts according to their purpose while clearly belonging to One Cloud.

## 8. Responsive behavior

- Desktop: persistent 248 px sidebar and full top header.
- Tablet: sidebar may collapse, but preserve icon meaning, ordering, and active-state style.
- Mobile: use a drawer for navigation; keep search and primary actions usable without horizontal overflow. File tables may become a stacked list, but keep the same visual tokens, file icons, and action semantics.
- Do not generate desktop-only elements that overlap or clip at narrow widths.

## 9. Do-not-do list

- Do not switch to light mode.
- Do not replace the One Cloud name or invent alternate logo lockups.
- Do not change the sidebar order or create a different sidebar on each workspace screen.
- Do not randomly change fonts, blue hue, border color, radius, spacing or icon family between screens.
- Do not use gradients as the default card/button treatment, strong neon glows, excessive blur, glassmorphism, huge shadows, or decorative charts without meaning.
- Do not invent billing, subscription tiers, sharing, collaboration, or storage limits/features unless they exist in the current product.
- Do not claim unlimited storage.
- Do not remove search, Telegram connection status, storage summary, file actions, or established navigation.
- Do not show light and dark variants in the same output.

## 10. Consistency checklist for every new screen

Before considering a screen complete, verify:

- [ ] Default theme is dark and matches the exact color tokens.
- [ ] One Cloud wordmark and cloud icon match other screens.
- [ ] Authenticated screens reuse the same sidebar and top header.
- [ ] Navigation order, labels, icons, and active states match this document.
- [ ] Typography sizes, spacing, borders, radii, and file-row density match.
- [ ] Shared components are reused instead of reinvented.
- [ ] Page content matches the actual purpose and route.
- [ ] Responsive layout, keyboard focus, and readable contrast are considered.
- [ ] Demo numbers/content are clearly illustrative and not claims about a real user account.
