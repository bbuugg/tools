# QR Code Generator & Recognizer Tool

This tool allows you to generate QR codes from text and recognize QR codes from images, with support for batch processing.

## Features

1. **QR Code Generation**
   - Generate single QR codes from text input
   - Batch generate multiple QR codes from a list of texts
   - Download individual QR codes or all as a ZIP file
   - Copy QR codes to clipboard

2. **QR Code Recognition**
   - Recognize QR codes from uploaded images
   - Batch recognition from multiple images
   - Copy all recognition results to clipboard
   - Drag and drop support for image uploads

## Usage

### Generating QR Codes

1. **Single QR Code Generation**:
   - Enter text in the "Text to encode" field
   - Click "Generate QR Code"
   - The generated QR code will appear in the results section

2. **Batch QR Code Generation**:
   - Enter multiple texts in the batch input area, one per line
   - Click "Generate Batch QR Codes"
   - All QR codes will be generated and displayed

3. **Downloading**:
   - Click "Download" on individual QR codes to download them
   - Click "Download All as ZIP" to download all generated QR codes in a single ZIP file

### Recognizing QR Codes

1. **Uploading Images**:
   - Click "Select Files" to choose images from your device
   - Or drag and drop images onto the upload area
   - Supported formats: JPG, PNG, WebP

2. **Viewing Results**:
   - Recognition results will appear in the results section
   - Successful recognitions show the decoded text
   - Failed recognitions show error messages

3. **Copying Results**:
   - Click "Copy All Results" to copy all successful recognition results to clipboard

## Technical Implementation

The tool uses:
- [qrcode](https://www.npmjs.com/package/qrcode) for generating QR codes
- [jsQR](https://www.npmjs.com/package/jsqr) for recognizing QR codes in images
- [JSZip](https://www.npmjs.com/package/jszip) for creating ZIP files of multiple QR codes

## Localization

The tool supports both English and Chinese languages, with all UI elements properly translated.

## Testing

To test the tool:
1. Start the development server with `npm run dev`
2. Navigate to the "Generators" section
3. Select "QR Code Tool"
4. Test both generation and recognition features