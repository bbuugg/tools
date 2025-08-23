export default {
  common: {
    clear: 'Clear',
    copy: 'Copy',
    download: 'Download',
    loadExample: 'Load Example',
    selectAll: 'Select All',
    clearSelection: 'Clear Selection',
    extract: 'Extract',
    results: 'Results',
    options: 'Options',
    input: 'Input',
    preview: 'Preview',
    statistics: 'Statistics',
    fields: 'Fields',
    items: 'items',
    found: 'found',
    extracted: 'extracted',
    with: 'with',
    total: 'Total',
    unique: 'Unique',
    nonEmpty: 'Non-empty',
  },
  navigation: {
    tools: 'Tools',
    language: 'Language',
  },
  tools: {
    htmlExtractor: {
      title: 'HTML Content Extractor',
      description:
        'Extract images, videos, links, and other resources from HTML code with one click',
      contentTypes: 'Content Types',
      baseUrl: 'Base URL',
      inputPlaceholder: 'Paste your HTML code here...',
      noResults:
        'No extraction results yet. Please input HTML code and select content types to extract.',
      features: {
        imageExtraction: {
          title: 'Image Extraction',
          description:
            'Automatically extract all image URLs from HTML, including img tags and CSS background images. Supports relative to absolute URL conversion for easy use.',
        },
        mediaProcessing: {
          title: 'Media Processing',
          description:
            'Batch extract video and audio file links, supporting multiple formats (MP4, WebM, Ogg, MP3, etc.). Automatically recognizes source files in video and audio tags.',
        },
        linkAnalysis: {
          title: 'Link Analysis',
          description:
            'Extract all hyperlinks from the page, including href attributes of a tags. Supports filtering internal and external links to help analyze website structure.',
        },
      },
      options: {
        uniqueOnly: 'Unique Results Only',
        absoluteUrls: 'Convert to Absolute URLs',
      },
      types: {
        images: 'Images',
        videos: 'Videos',
        audio: 'Audio',
        links: 'Links',
        css: 'CSS',
        javascript: 'JavaScript',
        iframes: 'iFrames',
        metadata: 'Metadata',
        forms: 'Forms',
      },
    },
    jsonExtractor: {
      title: 'JSON Field Extractor',
      description: 'Extract specific fields from JSON array data with one click',
      availableFields: 'Available Fields',
      inputTitle: 'Input JSON Array',
      inputNote: 'Please paste JSON array data in the format:',
      inputDescription:
        'The tool will automatically parse the JSON and list all available fields for selection.',
      inputPlaceholder:
        'Paste your JSON array here, e.g.:\n[\n  {"name": "John", "age": 30, "city": "New York"},\n  {"name": "Jane", "age": 25, "city": "London"}\n]',
      extractedData: 'EXTRACTED DATA',
      fieldStatistics: 'FIELD STATISTICS',
      noResults:
        'No extraction results yet. Please input JSON array data and select fields to extract.',
      options: {
        preserveStructure: 'Preserve Object Structure',
        removeEmpty: 'Remove Empty Values',
      },
      features: {
        fieldExtraction: {
          title: 'Field Extraction',
          description:
            'Automatically parse JSON array and extract selected fields. Supports nested objects and preserves data types for accurate extraction.',
        },
        smartFiltering: {
          title: 'Smart Filtering',
          description:
            'Choose specific fields to include in the output. Option to remove empty values and preserve original object structure for clean results.',
        },
        exportOptions: {
          title: 'Export Options',
          description:
            'Copy extracted data to clipboard or download as JSON file. Includes field statistics and data analysis for better understanding of your dataset.',
        },
      },
      errors: {
        invalidFormat: 'Input must be a JSON array in format: [{},{},...]',
        emptyArray: 'JSON array cannot be empty',
        noFields: 'No fields found in the JSON objects',
        invalidJson: 'Invalid JSON format:',
      },
    },
  },
  toast: {
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Info',
    copied: 'Results copied to clipboard!',
    copyFailed: 'Failed to copy to clipboard',
    downloadSuccess: 'File downloaded successfully!',
  },
  footer: {
    madeWith: 'Made with',
    by: 'by',
  },
}
