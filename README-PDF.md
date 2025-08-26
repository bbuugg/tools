# PDF Viewer Tool

The PDF Viewer tool allows you to preview and perform basic operations on PDF documents directly in your browser.

## Features

- PDF document preview with zoom and rotation controls
- Page navigation (previous/next page)
- Drag and drop file upload
- Document information display (file name, size, page count)
- Download original PDF file

## Usage

1. Upload a PDF file by either:
   - Clicking the "Select PDF File" button and choosing a file from your device
   - Dragging and dropping a PDF file onto the upload area

2. Once uploaded, the first page of the PDF will be displayed

3. Use the controls to:
   - Navigate between pages using the previous/next buttons
   - Adjust zoom level using the dropdown menu
   - Rotate the document left or right using the rotation buttons
   - Download the original PDF file

## Technical Details

The PDF Viewer tool uses Mozilla's PDF.js library to render PDF documents in the browser. PDF.js is a general-purpose, web standards-based platform for parsing and rendering PDFs.

### Dependencies

- `pdfjs-dist`: The core PDF.js library for rendering PDFs
- Vue 3 with TypeScript
- Tailwind CSS for styling

### Implementation

The tool implements the following functionality:

1. File upload handling (drag-and-drop and file selection)
2. PDF parsing using PDF.js
3. Canvas-based rendering of PDF pages
4. Navigation controls (page navigation, zoom, rotation)
5. Document information display
6. File download capability

## Limitations

- The current implementation provides preview capabilities only
- Editing PDF content (text, images, annotations) is not supported in this version
- For advanced PDF editing features, additional libraries like PDF-LIB would be required

## Future Enhancements

Possible future enhancements could include:
- Text selection and copying
- Annotation tools
- Basic editing capabilities (adding text, shapes, images)
- PDF merging and splitting
- Form filling capabilities