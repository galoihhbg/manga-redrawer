# Manga Image Processor - Design Guidelines

## Design Approach
**System-Based Approach**: Shadcn UI with focus on functionality and visual content clarity. The design prioritizes efficient workflow and prominent image display, drawing inspiration from professional image editing tools like Figma and Photoshop's web interfaces.

**Core Principle**: Let the manga images be the hero. UI elements should be functional, unobtrusive, and enhance the image processing experience.

## Color Palette

### Dark Mode (Primary)
- **Background**: 222 14% 8% (deep charcoal)
- **Surface**: 222 14% 12% (elevated surfaces)
- **Border**: 222 14% 18% (subtle divisions)
- **Primary**: 262 83% 58% (vibrant purple for actions)
- **Text**: 210 20% 98% (high contrast white)
- **Muted Text**: 215 16% 65% (secondary information)

### Light Mode
- **Background**: 0 0% 100% (pure white)
- **Surface**: 210 20% 98% (subtle gray)
- **Border**: 214 32% 91% (soft borders)
- **Primary**: 262 83% 58% (consistent purple)
- **Text**: 222 47% 11% (dark gray)

## Typography
- **Primary Font**: Inter (Google Fonts) for UI elements
- **Monospace**: JetBrains Mono for API key input
- **Headings**: font-semibold, tracking-tight
- **Body**: font-normal, leading-relaxed
- **Sizes**: text-sm (labels), text-base (body), text-xl to text-3xl (headings)

## Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 24 for consistent rhythm
- Tight spacing: gap-2, p-2 (within components)
- Standard spacing: gap-4, p-4, p-6 (between elements)
- Section spacing: py-12, py-16, py-24 (page sections)

**Container Strategy**:
- Max-width: max-w-7xl for main content
- Image display area: Full width within container, aspect-ratio preserved
- Forms: max-w-md for API key input, max-w-2xl for upload area

## Component Library

### Header
- Full-width with backdrop-blur effect
- Logo/title on left, theme toggle on right
- Sticky positioning (sticky top-0)
- Border bottom with subtle shadow

### API Key Input Section
- Card component with muted background
- Monospace input field with eye icon for reveal/hide
- "Save Key" button (primary color)
- Success/error states with icon indicators
- Compact layout: max-w-md, p-6

### Image Upload Zone
- Large drag-and-drop area (min-h-64)
- Dashed border (border-dashed) in idle state
- Active state: border-primary with bg-primary/5
- Center-aligned upload icon and instructions
- File type indicator: "PNG, JPG, WEBP up to 10MB"
- Selected image preview with remove option

### Processing Section
- Two-column grid for before/after comparison (grid-cols-1 lg:grid-cols-2)
- Image containers with aspect-ratio-auto and object-contain
- Labels: "Original" and "Processed" with subtle badges
- Loading overlay with spinner during processing
- Action buttons below: "Process Image" (primary), "Download" (outline)

### Image Display
- High-quality image rendering with rounded corners (rounded-lg)
- Shadow elevation for depth (shadow-xl)
- Zoom capability on click (optional modal view)
- Download button overlays on hover

### Status Indicators
- Processing: Animated spinner with "Processing..." text
- Success: Check icon with "Complete!" message
- Error: Alert icon with error details in muted text
- Toast notifications for user feedback (top-right positioning)

### Buttons
- Primary: bg-primary, hover:bg-primary/90
- Outline: variant="outline" with blur backdrop when on images
- Icon buttons: Square aspect ratio, p-2
- Disabled state: opacity-50, cursor-not-allowed

## Images
**Hero Image**: No traditional hero image. The interface immediately presents the functional upload zone as the primary visual element.

**Content Images**: 
- Manga image previews are the main visual content
- Display with proper aspect ratio preservation
- Use object-contain for different manga page sizes
- Background: muted surface color for letterboxing

## Animations
**Minimal & Purposeful**:
- Drag-and-drop zone: Scale on hover (scale-105 transition)
- Button states: Subtle color transitions (transition-colors duration-200)
- Image loading: Fade in effect (animate-in fade-in)
- Processing indicator: Rotating spinner only
- NO scroll animations, parallax, or decorative motion

## Responsive Strategy
- **Mobile** (< 768px): Single column, full-width images, stacked comparison
- **Tablet** (768px - 1024px): Maintain single column for images, side-by-side buttons
- **Desktop** (> 1024px): Two-column before/after grid, optimized spacing

## Accessibility
- High contrast ratios (WCAG AAA where possible)
- Focus indicators on all interactive elements (ring-2 ring-primary)
- Alt text for all processed images
- Keyboard navigation support throughout
- Screen reader announcements for processing states
- Consistent dark mode across inputs and text fields