# Styling Guidelines - Treasure Hunt Application

## Overview

This document defines styling conventions and best practices for the Treasure Hunt application to ensure consistency, maintainability, and scalability.

## Design System Philosophy

### Visual Identity
- **Theme**: Adventure treasure hunt with warm, inviting aesthetics
- **Inspiration**: Ancient temples, treasure maps, golden sands, mystical waters
- **Feel**: Modern game interface with polish and delightful interactions
- **Transition**: Terminal (login) → Rich game interface (main app)

### Core Principles
1. **Consistency**: Use CSS variables for all colors, spacing, and measurements
2. **Responsive**: Mobile-first approach with touch-friendly targets
3. **Accessible**: WCAG 2.1 AA compliance minimum
4. **Performant**: Optimize animations and avoid layout thrashing
5. **Scalable**: Component-based styling with clear naming conventions

---

## CSS Variables System

### Location
All global CSS variables are defined in `frontend/src/styles.scss` within the `:root` selector.

### Categories

#### 1. Colors
**Primary Palette** (Game Board Inspired):
- `--color-gold-*`: Treasure, highlights, currency
- `--color-sand-*`: Backgrounds, neutral tones
- `--color-teal-*`: Water accents, active states
- `--color-brown-*`: Text, dark elements

**Semantic Colors**:
- `--color-success`: Completed, unlocked states
- `--color-danger`: Locked, error states
- `--color-info`: Help, information
- `--color-warning`: Caution, alerts

**NEVER hardcode hex values** - always use CSS variables.

#### 2. Spacing
Use the spacing scale for consistent layouts:
- `--spacing-xs` (4px): Tight spacing
- `--spacing-sm` (8px): Small gaps
- `--spacing-md` (16px): Default spacing
- `--spacing-lg` (24px): Section spacing
- `--spacing-xl` (32px): Large gaps
- `--spacing-2xl` (48px): Major sections
- `--spacing-3xl` (64px): Hero spacing

#### 3. Typography
**Font Families**:
- `--font-family-primary`: Body text (Lato, Open Sans)
- `--font-family-heading`: Headings (Cinzel, Playfair Display)
- `--font-family-display`: Special text (Cinzel Decorative)

**Font Sizes**: Use predefined scale (`--font-size-*`)
**Font Weights**: Use semantic weights (`--font-weight-normal`, `--font-weight-bold`)

#### 4. Shadows
Predefined shadow levels for consistent depth:
- `--shadow-sm`: Subtle elevation
- `--shadow-md`: Default cards
- `--shadow-lg`: Modals, overlays
- `--shadow-xl`: Full-screen overlays
- `--shadow-gold`: Golden glow effects
- `--shadow-teal`: Water/active effects

#### 5. Borders
- Radius: `--border-radius-*` (sm, md, lg, xl)
- Width: `--border-width-*` (thin, medium, thick)
- Colors: `--border-color-*`

#### 6. Z-Index
Use predefined z-index values to prevent conflicts:
- Dropdowns: 1000
- Modals: 1050
- Tooltips: 1070

---

## Component Styling

### File Organization

```
component/
├── component.component.ts
├── component.component.html
├── component.component.scss  // Component-specific styles
└── component.component.spec.ts
```

### SCSS Best Practices

#### 1. Use BEM Methodology (Block, Element, Modifier)

```scss
// ✅ GOOD
.sidebar {
  &__header { }
  &__menu { }
  &__item {
    &--active { }
    &--disabled { }
  }
}

// ❌ BAD
.sidebar .header { }
.sidebar-menu-item-active { }
```

#### 2. Component Encapsulation

```scss
// Use :host for component root
:host {
  display: block;
  width: 100%;
}

// Scope all styles to component
.game-board {
  // Component styles here
}
```

#### 3. Use CSS Variables

```scss
// ✅ GOOD
.currency {
  color: var(--color-gold-primary);
  font-size: var(--font-size-2xl);
  padding: var(--spacing-md);
}

// ❌ BAD
.currency {
  color: #D4AF37;
  font-size: 24px;
  padding: 16px;
}
```

#### 4. Mobile-First Responsive Design

```scss
// ✅ GOOD - Mobile first, then larger screens
.sidebar {
  width: 100%; // Mobile
  
  @media (min-width: 768px) {
    width: var(--sidebar-width); // Desktop
  }
}

// ❌ BAD - Desktop first
.sidebar {
  width: var(--sidebar-width);
  
  @media (max-width: 767px) {
    width: 100%;
  }
}
```

#### 5. Avoid Deep Nesting

```scss
// ✅ GOOD - Max 3 levels
.modal {
  &__header {
    &-title { }
  }
}

// ❌ BAD - Too deep
.modal {
  .content {
    .body {
      .section {
        .item { } // 5 levels!
      }
    }
  }
}
```

---

## Animations & Transitions

### Performance Guidelines

1. **Prefer transform and opacity** - these are GPU accelerated
2. **Avoid animating**: width, height, top, left (causes reflow)
3. **Use will-change sparingly** - only for specific animations

### Standard Transitions

```scss
// Use predefined transition variables
.button {
  transition: all var(--transition-normal);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}
```

### Angular Animations

For complex animations, use Angular's animation system:

```typescript
import { trigger, transition, style, animate } from '@angular/animations';

animations: [
  trigger('slideIn', [
    transition(':enter', [
      style({ transform: 'translateX(-100%)' }),
      animate('300ms ease-out', style({ transform: 'translateX(0)' }))
    ])
  ])
]
```

---

## Responsive Design

### Breakpoints

Use CSS custom properties breakpoints:
- XS: 480px (small phones)
- SM: 640px (phones)
- MD: 768px (tablets)
- LG: 1024px (desktops)
- XL: 1280px (large desktops)

### Touch Targets

**Minimum size**: 44x44px for all interactive elements (WCAG requirement)

```scss
.button,
.node,
.menu-item {
  min-width: 44px;
  min-height: 44px;
}
```

---

## Accessibility

### Color Contrast

Maintain WCAG 2.1 AA contrast ratios:
- Normal text: 4.5:1
- Large text (18pt+): 3:1

Test all color combinations using CSS variables.

### Focus States

Always provide visible focus indicators:

```scss
.button {
  &:focus-visible {
    outline: 2px solid var(--color-gold-primary);
    outline-offset: 2px;
  }
}
```

### Reduced Motion

Respect user preferences:

```scss
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Common Patterns

### Card Component

```scss
.card {
  background: var(--color-background-modal);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  transition: box-shadow var(--transition-normal);
  
  &:hover {
    box-shadow: var(--shadow-lg);
  }
}
```

### Modal Pattern

```scss
.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: var(--z-index-modal);
  max-width: var(--modal-max-width);
  background: var(--color-background-modal);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-xl);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: var(--z-index-modal-backdrop);
}
```

### Button Variants

```scss
.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-fast);
  cursor: pointer;
  border: none;
  
  &--primary {
    background: var(--color-gold-primary);
    color: var(--color-text-light);
    
    &:hover {
      background: var(--color-gold-bright);
      box-shadow: var(--shadow-gold);
    }
  }
  
  &--secondary {
    background: var(--color-sand-medium);
    color: var(--color-text-primary);
  }
}
```

---

## Dos and Don'ts

### ✅ DO

- Use CSS variables for all styling values
- Follow BEM naming convention
- Write mobile-first responsive styles
- Use semantic HTML elements
- Provide focus states for keyboard navigation
- Test with reduced motion preferences
- Keep specificity low
- Use meaningful class names
- Comment complex calculations or magic numbers

### ❌ DON'T

- Hardcode colors, spacing, or font sizes
- Use inline styles (except for dynamic positioning)
- Nest selectors more than 3 levels deep
- Use `!important` (except for utility classes)
- Animate properties that cause reflow
- Use fixed pixel values for responsive layouts
- Override component library styles globally
- Use generic class names (`.container`, `.wrapper`)

---

## Tools & Testing

### Recommended VS Code Extensions
- **Stylelint**: Enforce CSS best practices
- **SCSS IntelliSense**: Autocomplete for SCSS
- **Color Highlight**: Visualize colors in code

### Browser DevTools
- Use Chrome DevTools for debugging animations
- Firefox DevTools for CSS Grid inspection
- Safari for testing mobile layouts

### Accessibility Testing
- **axe DevTools**: Automated accessibility testing
- **WAVE**: Web accessibility evaluation tool
- Manual keyboard navigation testing

---

## Migration & Maintenance

### Adding New CSS Variables

1. Define in `styles.scss` under appropriate category
2. Use semantic naming (`--color-purpose-variant`)
3. Document usage in this guide
4. Update existing hardcoded values

### Refactoring Existing Styles

When updating components:
1. Replace hardcoded values with CSS variables
2. Apply BEM naming if not already used
3. Ensure mobile-first approach
4. Test accessibility and reduced motion
5. Update tests if needed

---

## Examples

See the following components for reference implementations:
- `sidebar.component.scss`: Responsive sidebar with animations
- `game-board.component.scss`: Complex layout with absolute positioning
- `modal.component.scss`: Overlay and backdrop patterns
- `currency-display.component.scss`: Animated counters and effects

---

## Questions?

For styling questions or additions to this guide, consult with the team or update this document with new patterns as they emerge.

**Last Updated**: December 2024
**Version**: 1.0.0


