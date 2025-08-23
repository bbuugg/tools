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
    categories: 'Tool Categories',
    menu: 'Menu',
    close: 'Close',
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
    imageListProcessor: {
      title: 'Image List Processor',
      description: 'Extract, convert and process image lists from various formats',
      processingOptions: 'Processing Options',
      inputTitle: 'Input Image Data',
      resultsTitle: 'Processing Results',
      inputNote: 'Paste your image data in one of the supported formats:',
      inputPlaceholder:
        'Paste image URLs, HTML, Markdown, or CSV data here...\n\nSupported formats:\n- Direct URLs (one per line)\n- HTML img tags\n- Markdown image syntax\n- CSV format (url,alt,width,height)',
      imagePreview: 'Image Preview',
      processedOutput: 'Processed Output',
      noResults: 'No images found. Please input image data in a supported format.',
      showingFirst: 'Showing first',
      of: 'of',
      modes: {
        extract: 'Extract URLs',
        markdown: 'Markdown Format',
        html: 'HTML Format',
        csv: 'CSV Format',
      },
      options: {
        includeAltText: 'Include Alt Text',
        includeDimensions: 'Include Dimensions',
        validateUrls: 'Validate URLs',
        sortByName: 'Sort by Filename',
      },
      supportedFormats: {
        urls: 'Direct image URLs (one per line)',
        html: 'HTML img tags with src and alt attributes',
        markdown: 'Markdown image syntax ![alt](url)',
        csv: 'CSV format: url,alt,width,height',
      },
      features: {
        extraction: {
          title: 'Smart Extraction',
          description:
            'Automatically detect and extract images from URLs, HTML, Markdown, and CSV formats with intelligent parsing.',
        },
        formats: {
          title: 'Multiple Formats',
          description:
            'Convert image lists to various output formats including plain URLs, Markdown, HTML, and CSV for different use cases.',
        },
        batch: {
          title: 'Batch Processing',
          description:
            'Process hundreds of images at once with preview thumbnails, validation, and bulk export capabilities.',
        },
      },
    },
    imageCompressor: {
      title: 'Image Compressor Master',
      description:
        'Efficient online image compression tool with batch processing and local privacy',
      settings: 'Compression Settings',
      quality: 'Quality',
      smaller: 'Smaller',
      larger: 'Larger',
      outputFormat: 'Output Format',
      keepOriginal: 'Keep Original Format',
      maxWidth: 'Max Width',
      uploadTitle: 'Drag & Drop Images or Click to Select',
      uploadDescription: 'Support multiple images, local processing, no upload to server',
      supportedFormats: 'Supported formats',
      selectFiles: 'Select Files',
      imageList: 'Image List',
      compressing: 'Compressing...',
      compressAll: 'Compress All',
      downloadAll: 'Download All',
      compress: 'Compress',
      remove: 'Remove',
      originalSize: 'Original Size',
      compressedSize: 'Compressed Size',
      spaceSaved: 'Space Saved',
      original: 'Original',
      compressed: 'Compressed',
      status: {
        pending: 'Pending',
        compressing: 'Processing',
        completed: 'Completed',
        error: 'Failed',
      },
      features: {
        efficient: {
          title: 'High Efficiency',
          description:
            'Advanced compression algorithms maintain image quality while reducing file size by 40-80%.',
        },
        secure: {
          title: 'Privacy Protection',
          description:
            'All processing happens locally in your browser. Images never uploaded to any server.',
        },
        batch: {
          title: 'Batch Processing',
          description:
            'Process multiple images simultaneously with progress tracking and batch download.',
        },
      },
      errors: {
        noValidImages: 'No valid image files found',
        compressionFailed: 'Failed to compress {filename}',
      },
      success: {
        compressionComplete: 'All images compressed successfully!',
        downloadComplete: 'Batch download completed!',
        pasteSuccess: 'Images pasted successfully!',
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
  categories: {
    'web-tools': {
      name: 'Web Tools',
      description: 'Tools for web development and analysis',
    },
    'data-tools': {
      name: 'Data Tools',
      description: 'Tools for data processing and manipulation',
    },
    'image-tools': {
      name: 'Image Tools',
      description: 'Tools for image processing and management',
    },
    converters: {
      name: 'Converters',
      description: 'Format conversion utilities',
    },
    generators: {
      name: 'Generators',
      description: 'Code and content generators',
    },
  },
  pagination: {
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
  },
  status: {
    active: 'Active',
    'coming-soon': 'Coming Soon',
  },
}
