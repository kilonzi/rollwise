# Rollwise Logo Assets

This directory contains all logo variations for the Rollwise brand.

## Available Logos

### 1. **logo.svg** (200x200)
- Main logo for general use
- Square format with circular badge
- Black background with white door segments
- Rolling motion indicator arc

### 2. **logo-horizontal.svg** (400x100)
- Horizontal layout with text
- Perfect for headers, marketing materials
- Logo + "ROLLWISE" wordmark

### 3. **logo-inline.svg** (120x120)
- Medium size for auth pages and components
- Used in the Logo.vue component
- Clean, simplified version

### 4. **logo-small.svg** (32x32)
- Small icon/favicon version
- Simplified for small sizes
- Maintains brand identity at any scale

## Design Concept

The logo represents:
- **Horizontal door segments**: Rolling garage/door systems
- **Motion arc**: Dynamic movement and swift service
- **Clean modern style**: Professional, trustworthy, technical
- **High contrast**: Black & white for versatility

## Usage

### In Vue Components
```vue
import Logo from '@/components/Logo.vue'

<Logo />
```

### Direct SVG Import
```vue
<img src="@/assets/logo-inline.svg" alt="Rollwise" />
```

### Public Assets
```html
<img src="/logo.svg" alt="Rollwise" />
```

## Brand Colors

- Primary Black: `#000000`
- Primary White: `#FFFFFF`
- Accent Blue: `#2563EB` (theme color)
- Background: `#0F172A` (dark mode)

## Files Updated

- `index.html` - Updated favicon and meta tags
- `manifest.webmanifest` - Updated app icon
- `BaseAuthView.vue` - Now includes Logo component
- `components/Logo.vue` - New reusable logo component

