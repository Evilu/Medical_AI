---
name: openai-design
description: OpenAI-inspired design system for Tailwind CSS v4. Use when styling components, choosing colors, typography, spacing, animations, or implementing the visual design language for the medical search app.
user-invocable: true
---
# OpenAI-Inspired Design System for Tailwind CSS

This document defines the visual language for the medical search app, inspired by openai.com's clean, sophisticated aesthetic.

## Table of Contents
1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Components](#components)
5. [Animations](#animations)
6. [Dark Mode](#dark-mode)
7. [Mobile Patterns](#mobile-patterns)

---

## Color Palette

### Tailwind CSS v4 — Use CSS Custom Properties

With Tailwind CSS v4, define custom theme values via CSS. In `src/index.css`:

```css
@import "tailwindcss";

@theme {
  /* Surface colors */
  --color-surface-primary: #ffffff;
  --color-surface-secondary: #f7f7f8;
  --color-surface-tertiary: #ececed;
  --color-surface-inverse: #0d0d0d;

  /* Text colors */
  --color-text-primary: #0d0d0d;
  --color-text-secondary: #6e6e80;
  --color-text-tertiary: #8e8ea0;
  --color-text-inverse: #ffffff;

  /* Border colors */
  --color-border-default: #e5e5e5;
  --color-border-subtle: #f0f0f0;
  --color-border-strong: #d1d1d6;

  /* Accent — OpenAI green, used sparingly */
  --color-accent: #10a37f;
  --color-accent-hover: #0d8c6d;
  --color-accent-light: #e6f7f2;

  /* Semantic */
  --color-success: #10a37f;
  --color-warning: #f59e0b;
  --color-error: #ef4444;

  /* Fonts */
  --font-sans: "Inter", ui-sans-serif, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Code", Monaco, Consolas, monospace;

  /* Custom font sizes */
  --text-display: 3.5rem;
  --text-heading-1: 2.25rem;
  --text-heading-2: 1.5rem;
  --text-heading-3: 1.125rem;
  --text-body-lg: 1.125rem;
  --text-body: 1rem;
  --text-body-sm: 0.875rem;
  --text-caption: 0.75rem;

  /* Shadows */
  --shadow-subtle: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
  --shadow-card: 0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04);
  --shadow-elevated: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
  --shadow-float: 0 8px 30px rgba(0, 0, 0, 0.08);
  --shadow-search: 0 2px 8px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.04);
  --shadow-search-focus: 0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.08);

  /* Animations */
  --animate-fade-in: fadeIn 0.3s ease-out;
  --animate-slide-up: slideUp 0.3s ease-out;
  --animate-slide-down: slideDown 0.2s ease-out;
  --animate-scale-in: scaleIn 0.2s ease-out;
}

@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes slideUp {
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes slideDown {
  0% { opacity: 0; transform: translateY(-4px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes scaleIn {
  0% { opacity: 0; transform: scale(0.97); }
  100% { opacity: 1; transform: scale(1); }
}

/* Base styles */
body {
  @apply bg-surface-primary text-text-primary antialiased;
  font-feature-settings: "rlig" 1, "calt" 1;
}

html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

::selection {
  @apply bg-accent/10 text-text-primary;
}

:focus-visible {
  @apply outline-2 outline-offset-2 outline-accent;
}
```

**Note:** Add Inter font in `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

## Typography

### Hierarchy Rules
1. **Page title**: `text-heading-1` or `text-2xl font-bold tracking-tight` — only one per page
2. **Section headings**: `text-heading-2` or `text-xl font-semibold tracking-tight`
3. **Card titles**: `text-base font-medium`
4. **Body text**: `text-base` (16px) — default for all content
5. **Secondary text**: `text-sm text-text-secondary`
6. **Captions/labels**: `text-xs text-text-tertiary uppercase tracking-wider`

### Key Principle
OpenAI uses *restraint* in typography. Few sizes, clear hierarchy, generous line height. Never use more than 3 font sizes on a single screen.

## Spacing & Layout

### Container Pattern

```tsx
// Standard page container
<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>

// Narrow content (for reading)
<div className="mx-auto max-w-2xl px-4 sm:px-6">
  {/* Article content */}
</div>
```

### Section Spacing
- Between major sections: `py-16 sm:py-24`
- Between related items: `space-y-8` or `gap-6`
- Between compact items: `space-y-4` or `gap-4`
- Inside cards: `p-4 sm:p-6`

### Whitespace Philosophy
More whitespace = more premium feel. When in doubt, add more padding. OpenAI's site uses generous margins that let content breathe. Cramming too much into too little space is the most common mistake.

## Components

### Search Input (Hero)
The search input is the centerpiece. It should feel like a premium product.

```
+-----------------------------------------------------+
|  [magnifying glass]  Search medical literature...    |
+-----------------------------------------------------+
```

Key properties:
- `rounded-2xl` (pill-ish, not fully round)
- `py-4 pl-12 pr-4` (generous padding)
- `shadow-search` → `shadow-search-focus` on focus
- `border-gray-200` → `border-gray-300` on focus
- No ring (`ring-0` explicitly), shadow instead
- Smooth `transition-shadow duration-200`

### Article Card
Clean, scannable, with clear hierarchy:

```
Title of the Article That Might Be Long
Smith J, Jones A, et al. · Nature Medicine · 2024 · Q1
First two lines of abstract text that give the reader
enough context to decide if they want to read more...
```

Key properties:
- `border-b border-gray-100` (hairline separator, not card borders)
- `py-6` spacing between items
- `hover:bg-gray-50/50` subtle hover
- Title: `text-base font-medium line-clamp-2`
- Meta: `text-sm text-gray-500` with `·` separators
- Abstract preview: `text-sm text-gray-600 line-clamp-2`

### Expanded Article Detail
When an article card is clicked, it expands to show full information in a `rounded-xl bg-gray-50 p-4` container below the card, with a smooth animation.

### Result Count Bar
```tsx
<div className="flex items-center justify-between py-4 border-b border-gray-100">
  <span className="text-sm text-gray-500">
    {total.toLocaleString()} results
  </span>
</div>
```

### Badges/Tags (for SJR quartile)
```tsx
<span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
  Q{quartile}
</span>
```

### Buttons
- Primary: `bg-gray-900 text-white hover:bg-gray-800 rounded-xl px-4 py-2.5 text-sm font-medium`
- Secondary: `border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl px-4 py-2.5 text-sm font-medium`
- Ghost: `text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg px-3 py-2 text-sm`

## Animations

### Principles
- Duration: 150-300ms max. Nothing should feel slow.
- Easing: `ease-out` for entrances, `ease-in` for exits
- Properties: Only animate `opacity`, `transform`, and `shadow`
- Reduce motion: Respect `prefers-reduced-motion`

### Specific Animations
- Article expand: `animate-slide-down` (200ms)
- Search results load: Stagger with `animation-delay` (50ms between items)
- Skeleton pulse: `animate-pulse` (Tailwind built-in)
- Page transitions: `animate-fade-in` (300ms)

## Dark Mode

**Optional** for this assessment, but if implemented:
- Use `dark:` prefix throughout
- Background: `#0d0d0d` (not pure black)
- Surface: `#1a1a2e` for cards
- Text: `#e5e5e5` primary, `#8e8ea0` secondary
- Border: `#2d2d3a`

## Mobile Patterns

### Header
- Mobile: Logo left, h-14 height, minimal
- Desktop: Logo left, nav center, h-16 height

### Search
- Mobile: Full-width, `mx-4`, sticky at top when scrolling
- Desktop: Centered with `max-w-2xl mx-auto`

### Results
- Mobile: Full-bleed cards, `px-4` padding
- Desktop: Contained within `max-w-4xl`

### Touch Targets
- All buttons: min `h-11` (44px)
- All links in lists: min `py-3`
- Clear button on search: `p-2` padding for adequate hit area

### Bottom Sheet Pattern (for mobile collection picker)
```tsx
<div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white shadow-float
                animate-slide-up sm:relative sm:rounded-xl sm:shadow-elevated">
  {/* Content */}
</div>
```
