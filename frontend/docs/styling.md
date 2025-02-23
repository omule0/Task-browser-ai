# Styling Guide

This document outlines the styling conventions and design system used in the Digest AI frontend application.

## Design System

### Colors

The application uses a custom color palette defined in `tailwind.config.ts`:

```typescript
colors: {
  primary: {
    DEFAULT: '#2563eb',
    dark: '#1d4ed8',
    light: '#3b82f6'
  },
  secondary: {
    DEFAULT: '#64748b',
    dark: '#475569',
    light: '#94a3b8'
  },
  // Add other color definitions
}
```

### Typography

Font families and sizes are configured in the Tailwind configuration:

```typescript
fontFamily: {
  sans: ['var(--font-sans)', 'system-ui'],
  heading: ['var(--font-heading)', 'sans-serif']
}
```

### Spacing

Follow the Tailwind CSS spacing scale:
- `space-1`: 0.25rem (4px)
- `space-2`: 0.5rem (8px)
- `space-4`: 1rem (16px)
- `space-8`: 2rem (32px)
- etc.

## Component Styling

### Button Variants

```tsx
// Primary Button
<button className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark">
  Primary
</button>

// Secondary Button
<button className="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary-dark">
  Secondary
</button>

// Ghost Button
<button className="px-4 py-2 text-primary hover:bg-primary/10 rounded">
  Ghost
</button>
```

### Input Styling

```tsx
// Default Input
<input className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-primary" />

// Error State
<input className="w-full px-3 py-2 border border-red-500 rounded focus:ring-2 focus:ring-red-500" />
```

### Card Styling

```tsx
<div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
  {/* Card content */}
</div>
```

## Layout Guidelines

### Container Widths

```tsx
// Default container
<div className="container mx-auto px-4">
  {/* Content */}
</div>

// Narrow container
<div className="max-w-3xl mx-auto px-4">
  {/* Content */}
</div>
```

### Grid System

```tsx
// Basic grid
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-4">Sidebar</div>
  <div className="col-span-8">Main content</div>
</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Grid items */}
</div>
```

### Spacing Patterns

```tsx
// Section spacing
<section className="py-12 space-y-8">
  {/* Section content */}
</section>

// Stack layout
<div className="space-y-4">
  {/* Stacked items */}
</div>
```

## Responsive Design

### Breakpoints

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Media Query Examples

```tsx
// Responsive text
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Heading
</h1>

// Responsive layout
<div className="flex flex-col md:flex-row">
  {/* Content */}
</div>
```

## Dark Mode

### Implementation

The application supports dark mode using Tailwind's dark mode feature:

```tsx
// Dark mode aware component
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  {/* Content */}
</div>
```

### Color Patterns

Common dark mode color combinations:
- Background: `bg-white dark:bg-gray-800`
- Text: `text-gray-900 dark:text-gray-100`
- Border: `border-gray-200 dark:border-gray-700`

## Accessibility

### Focus States

```tsx
// Accessible focus states
<button className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
  Click me
</button>
```

### Screen Reader Support

```tsx
// Screen reader only text
<span className="sr-only">Close menu</span>

// Visible focus indicator
<a className="focus:outline-none focus:ring-2" href="#">Link</a>
```

## Animation

### Transitions

```tsx
// Basic transition
<div className="transition-all duration-300 ease-in-out">
  {/* Content */}
</div>

// Hover effect
<button className="transform transition hover:scale-105">
  Hover me
</button>
```

### Loading States

```tsx
// Spinner
<div className="animate-spin h-5 w-5">
  {/* Spinner icon */}
</div>

// Pulse
<div className="animate-pulse bg-gray-200">
  {/* Loading content */}
</div>
```

## Best Practices

1. **Maintainability**
   - Use Tailwind's @apply for repeated patterns
   - Keep classes organized and readable
   - Use consistent spacing patterns

2. **Performance**
   - Minimize custom CSS
   - Use Tailwind's JIT mode
   - Purge unused styles in production

3. **Accessibility**
   - Maintain sufficient color contrast
   - Provide focus indicators
   - Support keyboard navigation

4. **Responsive Design**
   - Mobile-first approach
   - Test across breakpoints
   - Use fluid typography

## Common Patterns

### Form Elements

```tsx
// Form group
<div className="space-y-2">
  <label className="block text-sm font-medium">Label</label>
  <input className="w-full px-3 py-2 border rounded" />
  <p className="text-sm text-red-500">Error message</p>
</div>
```

### Lists

```tsx
// List container
<ul className="space-y-4">
  <li className="p-4 bg-white rounded shadow">
    {/* List item content */}
  </li>
</ul>
```

### Navigation

```tsx
// Navigation menu
<nav className="flex space-x-4">
  <a className="px-4 py-2 hover:text-primary" href="#">
    Link
  </a>
</nav>
``` 