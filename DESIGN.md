# p5.js Learning App Design System

Design tokens are defined in `tailwind.config.js` and referenced via Tailwind utility classes. Never hardcode hex values — use the token names below.

## Brand

- **Primary:** `#ED225D` → class: `bg-primary`, `text-primary`, `border-primary`
- **On Primary:** `#FFFFFF` → class: `text-on-primary`

## Light/Dark Theme

| Token            | Light           | Tailwind class (light)     | Dark            | Tailwind class (dark)          |
| ---------------- | --------------- | -------------------------- | --------------- | ------------------------------ |
| **Surface**      | `#FFFFFF`       | `bg-surface`               | `#121212`       | `dark:bg-surface-dark`         |
| **On Surface**   | `#000000`       | `text-on-surface`          | `#F5F5F5`       | `dark:text-on-surface-dark`    |
| **Surface Dim**  | `#F3F4F6`       | `bg-surface-dim`           | `#1E1E1E`       | `dark:bg-surface-dim-dark`     |
| **Primary**      | `#ED225D`       | `bg-primary`               | `#ED225D`       | `bg-primary` (no change)       |
| **On Primary**   | `#FFFFFF`       | `text-on-primary`          | `#FFFFFF`       | `text-on-primary` (no change)  |
| **Outline**      | `#000000`       | `border-outline`           | `#757575`       | `dark:border-outline-dark`     |
| **Text Secondary**| `#6B7280`     | `text-text-secondary`      | `#9CA3AF`       | `dark:text-text-secondary-dark`|
| **Brutalist Shadow** | `rgba(237,34,93,1)` | — (Tailwind config only) | `rgba(237,34,93,0.8)` | — |

- Dark mode toggled via a `dark` class on the root view
- Respects system `prefers-color-scheme` via `useColorScheme()` by default
- Manual toggle available via `Switch` component on the home screen

## Typography

| Role       | Font              | Weight                        |
| ---------- | ----------------- | ----------------------------- |
| Headline   | Space Grotesk     | 700 (Bold), 900 (Black)       |
| Display    | Space Grotesk     | 900 (Black)                   |
| Body       | Inter             | 400 (Regular), 600 (Semibold) |
| Label      | Inter             | 700 (Bold)                    |
| Mono/Code  | JetBrains Mono    | 400 (Regular), 700 (Bold)     |

### Type Scale

- **display (5xl):** `48px` `Space Grotesk 900` — hero/welcome
- **headline-1 (3xl):** `30px` `Space Grotesk 700` — section titles
- **headline-2 (2xl):** `24px` `Space Grotesk 700` — card titles
- **headline-3 (xl):** `20px` `Space Grotesk 700` — subsection titles
- **body:** `16px` `Inter 400` — paragraph text
- **body-small:** `14px` `Inter 400` — secondary text
- **label:** `12px` `Inter 700` — uppercase labels
- **mono:** `14px` `JetBrains Mono` — code snippets
- **mono-small:** `10px` `JetBrains Mono 400` — badges

## Spacing

Base unit: `4px`. Use Tailwind spacing scale.

## Shadows

- **Brutalist:** `4px 4px 0px 0px theme-color` with `border-2`
- **Brutalist Hover:** `6px 6px 0px 0px theme-color`, `translate(-2px, -2px)`

## Border Radius

- **Default:** `4px` (`rounded`)
- **Large:** `8px` (`rounded-lg`)
- **Full:** `9999px` (`rounded-full`)

## Icons

Use Material Symbols Outlined. Size `24px` (`text-2xl`).

## Components

### Button (Primary)

| State   | Light                                                     | Dark                                                      |
| ------- | --------------------------------------------------------- | --------------------------------------------------------- |
| Default | `bg-primary text-on-primary border-2 border-outline`     | `bg-primary text-on-primary border-2 border-outline-dark` |
| Active  | `translate-y-1 translate-x-1`                             | `translate-y-1 translate-x-1`                             |
| Disabled| `opacity-50`                                              | `opacity-50`                                              |

Typography: `font-headline font-black text-xl uppercase tracking-wider`

### Button (Outline)

| State   | Light                                              | Dark                                                     |
| ------- | -------------------------------------------------- | -------------------------------------------------------- |
| Default | `bg-white text-primary border-2 border-primary`     | `bg-transparent text-primary border-2 border-primary`     |
| Active  | `translate-y-0.5`                                  | `translate-y-0.5`                                        |

Typography: `font-headline font-bold text-xl uppercase tracking-widest`

## Accessibility

### Button Component

| Property            | Value                        |
| ------------------- | ---------------------------- |
| `accessibilityRole` | `"button"`                   |
| `accessibilityLabel`| Customizable; defaults to `title` |
| `accessibilityState`| Includes `{ disabled }`      |
| Touch target        | `min-h-[52px]` (exceeds 44pt guideline) |
| Disabled opacity    | `opacity-50` (meets 3:1 contrast for disabled AA) |

### Color Contrast

All button text uses `text-xl` (20px bold) qualifying as WCAG **large text** (≥14pt bold), threshold **3:1**.

| Token pattern | Ratio | Threshold | Status |
|---|---|---|---|
| `text-on-primary` on `bg-primary` (`#FFFFFF` / `#ED225D`) | **4.21:1** | 3.0 (large text/UI) | **PASS** |
| `text-primary` on `bg-surface` (`#ED225D` / `#FFFFFF`) | **4.21:1** | 3.0 (large text/UI) | **PASS** |
| `text-on-surface` on `bg-surface` (`#000000` / `#FFFFFF`) | **21.00:1** | 3.0 (large text) | **PASS AAA** |
| `text-text-secondary` on `bg-surface` (`#6B7280` / `#FFFFFF`) | **4.83:1** | 4.5 (normal text) | **PASS AA** |
| `text-on-surface-dark` on `bg-surface-dark` (`#F5F5F5` / `#121212`) | **17.18:1** | 3.0 (large text) | **PASS AAA** |
| `text-text-secondary-dark` on `bg-surface-dark` (`#9CA3AF` / `#121212`) | **7.38:1** | 4.5 (normal text) | **PASS AA** |
| `text-primary` on `bg-surface-dark` (`#ED225D` / `#121212`) | **4.45:1** | 3.0 (large text/UI) | **PASS** |
| `border-outline-dark` on `bg-surface-dark` (`#757575` / `#121212`) | **4.07:1** | 3.0 (UI component) | **PASS** |

Design preserves `#ED225D` brand color everywhere — contrast is met via text sizing classification, not color changes.

### Reduced Motion

- Animations use `duration-75` for micro-interactions (below 100ms motion threshold)
- No auto-playing animations without user interaction
- Use `prefers-reduced-motion` media query for future enhancements

### Screen Reader Guidelines

- Every interactive element must have an `accessibilityLabel`
- Buttons always have `accessibilityRole="button"`
- Icons and decorative elements use `aria-hidden` equivalent
- Badges and status indicators include meaningful `accessibilityLabel`

### Touch Targets

- All interactive elements must be **minimum 44x44pt**
- Buttons enforce `min-h-[52px]` for comfortable touch targets
- Adequate spacing between touch targets (`gap-4` = 16px minimum)

## Future Accessibility Improvements

- [ ] Dynamic type scaling (respect system font size)
- [ ] `accessibilityHint` on complex interactions
- [ ] Focus trap for modal screens
- [ ] Keyboard navigation support (web)
- [ ] High contrast mode override
- [ ] Semantic heading levels for screen readers
- [ ] Error announcements via `accessibilityLiveRegion`
