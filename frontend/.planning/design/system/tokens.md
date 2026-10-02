# Orbit Store — Design Tokens

## Brand

| Token | Value | Usage |
|-------|-------|-------|
| Product name | Orbit Store | |
| Personality | Professional, Minimal, Clean | |
| Font | Inter (Google Fonts) | All UI text |

---

## Colors

### Light mode

| Token | Value | CSS var |
|-------|-------|---------|
| Background | `#FFFFFF` | `--bg` |
| Surface | `#F8FAFC` (slate-50) | `--bg-muted` ← rename to `--surface` |
| Primary | `#2563EB` (blue-600) | `--accent` ← rename to `--primary` |
| Primary hover | `#1D4ED8` (blue-700) | `--accent-hover` ← rename to `--primary-hover` |
| Text | `#0F172A` (slate-900) | `--text-h` ← rename to `--text-primary` |
| Text secondary | `#475569` (slate-600) | `--text` ← rename to `--text-secondary` |
| Text muted | `#94A3B8` (slate-400) | `--text-muted` |
| Border | `#E2E8F0` (slate-200) | `--border` |
| Error | `#DC2626` (red-600) | `--error` |
| Success | `#16A34A` (green-600) | `--success` |
| Warning | `#D97706` (amber-600) | `--warning` |

### Dark mode

| Token | Value | CSS var |
|-------|-------|---------|
| Background | `#0F172A` (slate-900) | `--bg` |
| Surface | `#1E293B` (slate-800) | `--bg-muted` |
| Primary | `#3B82F6` (blue-500) | `--accent` |
| Primary hover | `#60A5FA` (blue-400) | `--accent-hover` |
| Text | `#F8FAFC` (slate-50) | `--text-h` |
| Text secondary | `#94A3B8` (slate-400) | `--text` |
| Text muted | `#64748B` (slate-500) | `--text-muted` |
| Border | `#334155` (slate-700) | `--border` |
| Error | `#EF4444` (red-500) | `--error` |
| Success | `#22C55E` (green-500) | `--success` |
| Warning | `#F59E0B` (amber-500) | `--warning` |

### Contrast notes

All text/background pairs meet 4.5:1 minimum contrast (WCAG AA). Primary text (#0F172A / #F8FAFC) exceeds 10:1.

---

## Typography

### Font stack

```css
--sans: 'Inter', system-ui, -apple-system, sans-serif;
```

### Type scale

| Level | Size | Weight | Line-height | Letter-spacing |
|-------|------|--------|-------------|----------------|
| h1 | 32px | 700 | 1.2 | -0.02em |
| h2 | 24px | 600 | 1.25 | -0.01em |
| h3 | 20px | 600 | 1.3 | 0 |
| h4 | 18px | 600 | 1.35 | 0 |
| body | 16px | 400 | 1.6 | 0 |
| body-sm | 14px | 400 | 1.5 | 0 |
| caption | 13px | 500 | 1.4 | 0 |
| price | 20px | 600 | 1.2 | -0.01em |

---

## Spacing (8px grid)

| Token | Value | rem |
|-------|-------|-----|
| --space-xs | 4px | 0.25rem |
| --space-sm | 8px | 0.5rem |
| --space-md | 16px | 1rem |
| --space-lg | 24px | 1.5rem |
| --space-xl | 32px | 2rem |
| --space-2xl | 48px | 3rem |
| --space-3xl | 64px | 4rem |

All layout spacing snaps to this grid. Never use arbitrary values.

---

## Border radius

| Token | Value | Usage |
|-------|-------|-------|
| --radius-sm | 4px | Badges, small elements |
| --radius-md | 6px | Buttons, inputs, list items |
| --radius-lg | 8px | Cards, dialogs, containers |
| --radius-xl | 16px | Product cards (concentric: outer 16, padding 8 → inner 8) |
| --radius-full | 9999px | Avatars, pills |

---

## Shadows

### Light mode

```css
--shadow-sm:  0px 0px 0px 1px oklch(0 0 0 / 0.06),
              0px 1px 2px -1px oklch(0 0 0 / 0.06),
              0px 2px 4px 0px oklch(0 0 0 / 0.04);
--shadow-md:  0px 0px 0px 1px oklch(0 0 0 / 0.08),
              0px 1px 2px -1px oklch(0 0 0 / 0.08),
              0px 2px 4px 0px oklch(0 0 0 / 0.06);
--shadow-lg:  0px 0px 0px 1px oklch(0 0 0 / 0.08),
              0px 4px 6px -2px oklch(0 0 0 / 0.08),
              0px 10px 20px -4px oklch(0 0 0 / 0.06);
```

### Dark mode

```css
--shadow-sm:  0 0 0 1px oklch(1 0 0 / 0.08);
--shadow-md:  0 0 0 1px oklch(1 0 0 / 0.13);
--shadow-lg:  0 0 0 1px oklch(1 0 0 / 0.13),
              0 4px 12px rgba(59 130 246 / 0.08);
```

---

## Motion

| Token | Value | Usage |
|-------|-------|-------|
| --ease-out | `ease-out` | All interactive transitions |
| --duration-fast | 100ms | Hover, nav link color |
| --duration-normal | 150ms | Button states, card hover |
| --duration-slow | 300ms | Staggered entrances |
| --scale-press | 0.96 | Button active state |

---

## Layout

| Token | Value |
|-------|-------|
| Max content width | 960px |
| Container padding | 24px top, 16px sides, 64px bottom |
| Nav height | 56px |
| Product grid min column | 200px |