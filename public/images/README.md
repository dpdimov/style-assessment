# Assessment Background Images

This directory contains background images for the assessment results plot.

## Usage

To use a custom background image:

1. **Add your image**: Place your image file in this directory (e.g., `assessment-background.png`)

2. **Configure in JSON**: Update `/config/phrases.json` in the `resultsDisplay` section:

```json
"resultsDisplay": {
  "backgroundImage": {
    "enabled": true,
    "url": "/images/your-image.png",
    "opacity": 0.3,
    "position": "center",
    "size": "cover"
  },
  "plotSettings": {
    "showGrid": true,
    "gridColor": "#e5e7eb",
    "borderColor": "#9ca3af"
  }
}
```

## Configuration Options

### Background Image Settings
- **enabled**: `true/false` - Turn background image on/off
- **url**: Path to your image (relative to public folder)
- **opacity**: `0.0-1.0` - Image opacity (0.3 = 30% visible)
- **position**: CSS background-position (`center`, `top`, `bottom`, etc.)
- **size**: CSS background-size (`cover`, `contain`, `100% 100%`, etc.)

### Plot Settings
- **showGrid**: `true/false` - Show/hide the quadrant dividing lines
- **gridColor**: Hex color for quadrant lines (e.g., `#e5e7eb`)
- **borderColor**: Hex color for plot border (e.g., `#9ca3af`)

## Recommended Image Specs

- **Size**: 400x400 pixels (matches plot dimensions)
- **Format**: PNG with transparency works best
- **Style**: Light/subtle images work better (use opacity to adjust)

## Complete Examples

### Subtle Company Watermark
```json
"resultsDisplay": {
  "backgroundImage": {
    "enabled": true,
    "url": "/images/company-logo.png",
    "opacity": 0.15,
    "size": "200px 200px",
    "position": "center"
  },
  "plotSettings": {
    "showGrid": true,
    "gridColor": "#d1d5db",
    "borderColor": "#6b7280"
  }
}
```

### Full Background Design
```json
"resultsDisplay": {
  "backgroundImage": {
    "enabled": true,
    "url": "/images/abstract-background.png",
    "opacity": 0.4,
    "size": "cover",
    "position": "center"
  },
  "plotSettings": {
    "showGrid": true,
    "gridColor": "#ffffff",
    "borderColor": "#374151"
  }
}
```

### Minimal Clean Look
```json
"resultsDisplay": {
  "backgroundImage": {
    "enabled": false
  },
  "plotSettings": {
    "showGrid": false,
    "gridColor": "#e5e7eb",
    "borderColor": "#d1d5db"
  }
}
```