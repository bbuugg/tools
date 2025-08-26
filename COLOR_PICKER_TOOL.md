# Color Picker Tool

## Overview

The Color Picker Tool is a comprehensive color management utility that supports multiple color format conversions, image color extraction, and a palette of common colors. It provides an intuitive interface for developers, designers, and content creators to work with colors in various formats.

## Features

### 1. Multiple Color Format Support

- **HEX**: Standard hexadecimal color representation (#RRGGBB)
- **RGB**: Red, Green, Blue values (0-255)
- **RGBA**: RGB with Alpha channel for transparency (0-1)
- **HSL**: Hue, Saturation, Lightness
- **HSV**: Hue, Saturation, Value
- **CMYK**: Cyan, Magenta, Yellow, Key (Black)

### 2. Real-time Conversion

- Instant conversion between all supported color formats
- Interactive sliders for precise color adjustment
- Alpha channel support for transparency control
- Input fields for direct value entry with validation

### 3. Image Color Picker

- Upload any image file
- Preview uploaded images
- Dedicated color picker button for activating color selection mode
- Click anywhere on the image to extract exact colors
- Drag and drop support for easy image loading

### 4. Common Colors Palette

- Quick selection from a palette of commonly used colors
- 12 predefined colors for immediate access
- Easy customization of favorite colors

### 5. Color Preview

- Visual preview on both light and dark backgrounds
- Helps determine color visibility and contrast
- Real-time updates as colors change

## How to Use

### Basic Color Selection

1. Use the main color picker to select a base color
2. Adjust RGB, HSL, or HSV values using the sliders
3. Modify the alpha channel for transparency effects
4. Enter HEX values directly and confirm with the confirmation button
5. Copy any color format to clipboard with one click

### Image Color Extraction

1. Click "Select Image" or drag and drop an image file
2. Once the image loads, click "Pick Color" to activate color selection mode
3. Click anywhere on the image to pick a color
4. The selected color will automatically update all conversion formats
5. Click "Cancel Pick" to exit color selection mode

### Common Colors

1. Click any color in the common colors palette
2. The selected color will become the current color
3. All conversion formats will update automatically

### Direct Value Entry

1. Edit any color format value in the input fields
2. Valid formats:
   - HEX: #RRGGBB or #RGB
   - RGB: rgb(0-255, 0-255, 0-255)
   - RGBA: rgba(0-255, 0-255, 0-255, 0-1)
   - HSL: hsl(0-360, 0-100%, 0-100%)
   - HSV: hsv(0-360, 0-100%, 0-100%)
   - CMYK: cmyk(0-100%, 0-100%, 0-100%, 0-100%)
3. Click outside the input field or press Tab to apply changes
4. Invalid formats will show error messages and revert to previous values

## Technical Implementation

### Color Conversion Algorithms

The tool implements accurate conversion algorithms between all supported color formats:

- **HEX ↔ RGB**: Direct conversion using hexadecimal arithmetic
- **RGB ↔ HSL**: Standard RGB to HSL conversion algorithm
- **RGB ↔ HSV**: Standard RGB to HSV conversion algorithm
- **RGB ↔ CMYK**: Industry-standard RGB to CMYK conversion with black preservation

### Image Processing

- Uses HTML5 Canvas API for pixel-level color extraction
- Supports all standard image formats (JPEG, PNG, GIF, WebP, etc.)
- Cross-browser compatible implementation
- Dedicated color picker activation mode for better user experience

### UI Components

- Built with Vue 3 Composition API
- Responsive design using Tailwind CSS
- Internationalization support with vue-i18n
- Accessible interface with proper ARIA attributes
- Input validation with user feedback
- Dedicated confirmation for color picker selections

## Use Cases

### Design Systems

- Maintain consistent color palettes across projects
- Convert design colors to development-ready formats
- Ensure accessibility compliance with contrast checking

### Web Development

- Quick color format conversion for CSS properties
- Extract brand colors from existing websites or images
- Generate color variations for UI components

### Digital Art

- Extract color schemes from reference images
- Convert between color formats for different software
- Maintain color consistency across different mediums

## API Reference

### Color Object Structure

```typescript
interface Color {
  hex: string // #RRGGBB format
  rgb: {
    // RGB values
    r: number // 0-255
    g: number // 0-255
    b: number // 0-255
    a: number // 0-1 (alpha)
  }
  hsl: {
    // HSL values
    h: number // 0-360
    s: number // 0-100
    l: number // 0-100
  }
  hsv: {
    // HSV values
    h: number // 0-360
    s: number // 0-100
    v: number // 0-100
  }
  cmyk: {
    // CMYK values
    c: number // 0-100
    m: number // 0-100
    y: number // 0-100
    k: number // 0-100
  }
}
```

### Helper Functions

- `hexToRgb(hex: string): RGB` - Convert HEX to RGB
- `rgbToHex(r: number, g: number, b: number): string` - Convert RGB to HEX
- `rgbToHsl(r: number, g: number, b: number): HSL` - Convert RGB to HSL
- `hslToRgb(h: number, s: number, l: number): RGB` - Convert HSL to RGB
- `rgbToHsv(r: number, g: number, b: number): HSV` - Convert RGB to HSV
- `hsvToRgb(h: number, s: number, v: number): RGB` - Convert HSV to RGB
- `rgbToCmyk(r: number, g: number, b: number): CMYK` - Convert RGB to CMYK
- `cmykToRgb(c: number, m: number, y: number, k: number): RGB` - Convert CMYK to RGB

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Accessibility

- Keyboard navigation support
- Proper color contrast for UI elements
- Screen reader compatible labels
- Focus indicators for interactive elements

## Performance

- Optimized rendering with Vue 3 reactivity
- Efficient color conversion algorithms
- Lazy-loaded components
- Minimal DOM updates
