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
  }
}
```

## Configuration Options

- **enabled**: `true/false` - Turn background image on/off
- **url**: Path to your image (relative to public folder)
- **opacity**: `0.0-1.0` - Image opacity (0.3 = 30% visible)
- **position**: CSS background-position (`center`, `top`, `bottom`, etc.)
- **size**: CSS background-size (`cover`, `contain`, `100% 100%`, etc.)

## Recommended Image Specs

- **Size**: 400x400 pixels (matches plot dimensions)
- **Format**: PNG with transparency works best
- **Style**: Light/subtle images work better (use opacity to adjust)

## Examples

```json
// Subtle watermark
"opacity": 0.2,
"size": "contain",
"position": "center"

// Full coverage background
"opacity": 0.4,
"size": "cover",
"position": "center"

// Logo in corner
"size": "100px 100px",
"position": "bottom right",
"opacity": 0.5
```