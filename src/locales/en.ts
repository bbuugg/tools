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
    loading: 'Loading...',
  },
  navigation: {
    tools: 'Tools',
    language: 'Language',
    categories: 'Tool Categories',
    menu: 'Menu',
    close: 'Close',
    search: 'Search tools...',
    noResults: 'No tools found matching your search.',
    noToolsInCategory: 'No tools available in this category.',
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
    csvtojson: {
      title: 'CSV to JSON Converter',
      description: 'Convert CSV data to JSON format with customizable parsing options',
    },
    csvToJson: {
      title: 'CSV to JSON Converter',
      description: 'Convert CSV data to JSON format with customizable parsing options',
      introduction: {
        title: 'Tool Introduction',
        description:
          'Online CSV to JSON converter for converting fixed-symbol separated CSV format data to JSON format data.',
        usage:
          'Default delimiter is tab (\\t), but you can change it to comma or other symbols. Supports converting CSV to JSON objects or arrays.',
      },
      example: {
        title: 'Example',
        input: 'CSV Input:',
        output: 'JSON Output:',
      },
      input: {
        title: 'Input CSV Data',
        placeholder:
          'Paste your CSV data here...\n\nExample:\nname,age,score\nLi Hua,25,89\nXiao Ming,22,85',
        fileUpload: 'Upload CSV File',
      },
      options: {
        title: 'Parsing Options',
        delimiter: 'Delimiter',
        outputFormat: 'Output Format',
        hasHeaders: 'First Row as Headers',
        skipEmptyLines: 'Skip Empty Lines',
        autoDetectNumbers: 'Auto-detect Numbers',
        autoDetectBooleans: 'Auto-detect Booleans',
      },
      delimiters: {
        comma: 'Comma (,)',
        semicolon: 'Semicolon (;)',
        tab: 'Tab (\\t)',
        pipe: 'Pipe (|)',
        space: 'Space',
      },
      formats: {
        jsonObject: 'JSON Objects',
        jsonArray: 'JSON Array',
      },
      preview: {
        title: 'Data Preview',
        firstRows: 'first {count} rows',
        rowsDetected: '{count} rows detected',
      },
      convert: 'Convert to JSON',
      output: {
        title: 'JSON Output',
        complete: 'Conversion Complete',
        recordsConverted: '{count} records converted',
        noOutput: 'No JSON output yet. Please input CSV data to convert.',
      },
    },
    title: 'JSON Path Extractor',
    description:
      'Extract data from JSON using JSONPath expressions with advanced filtering capabilities',
    extractButton: 'Extract Data',
    features: {
      pathExtraction: {
        title: 'Path Extraction',
        description:
          'Use JSONPath expressions to precisely extract data from complex JSON structures with dot notation and array indexing.',
      },
      filtering: {
        title: 'Advanced Filtering',
        description:
          'Support for wildcards, array slicing, and conditional filtering to extract exactly the data you need.',
      },
      export: {
        title: 'Export Results',
        description:
          'Copy extracted data to clipboard or download as JSON file with formatted output and statistics.',
      },
    },
    syntaxGuide: {
      title: 'JSONPath Syntax Guide',
      basicSyntax: 'Basic Syntax',
      examples: 'Common Examples',
      rootSymbol: 'Root of JSON data',
      dotNotation: 'Access object properties',
      bracketNotation: 'Array/object access',
      wildcard: 'Match all elements',
      exampleDesc1: 'Get first book title',
      exampleDesc2: 'Get all book authors',
    },
    inputSection: {
      title: 'JSON Data & Path',
      jsonData: 'JSON Data',
      jsonPath: 'JSONPath Expression',
      jsonPlaceholder:
        'Paste your JSON data here...\n\nExample:\n{\n  "users": [\n    {"name": "John", "age": 30},\n    {"name": "Jane", "age": 25}\n  ]\n}',
      pathPlaceholder: 'Enter JSONPath expression (e.g., $.users[*].name)',
      quickPaths: 'Quick Path Templates',
    },
    outputSection: {
      title: 'Extracted Results',
      noResults: 'No extraction results yet. Please input JSON data and JSONPath expression.',
      extractedData: 'Extracted Data',
    },
    quickPaths: {
      root: 'Root element',
      allProperties: 'All properties',
      firstArrayItem: 'First array item',
      allArrayItems: 'All array items',
      lastArrayItem: 'Last array item',
      arraySlice: 'Array slice (0-2)',
    },
    success: {
      validJson: 'Valid JSON format',
      extracted: 'Data Extracted Successfully',
      arrayResults: 'Found {count} array items',
      objectResults: 'Found object with {count} properties',
      primitiveResult: 'Found {type} value',
    },
    errors: {
      invalidJson: 'Invalid JSON format',
      pathError: 'JSONPath Expression Error',
      noMatches: 'No data matches the specified path',
    },
    messages: {
      copied: 'Extracted data copied to clipboard successfully!',
      copyFailed: 'Failed to copy to clipboard',
      downloaded: 'JSON file downloaded successfully!',
      downloadFailed: 'Failed to download file',
    },
  },
  title: 'Cookie to JSON',
  description: 'Convert cookie strings to JSON objects with parsing options',
  inputTitle: 'Input Cookie String',
  outputTitle: 'JSON Output',
  inputNote: 'Paste cookie string in the format:',
  inputPlaceholder:
    'Paste your cookie string here, e.g.:\nsessionId=abc123; userId=12345; theme=dark; lang=en-US\n\nSupported formats:\n- Standard cookie format: name1=value1; name2=value2\n- URL-encoded values are automatically decoded\n- Handles cookies without values (flags)',
  parseOptions: 'Parse Options',
  noResults: 'No conversion results yet. Please input a cookie string to convert.',
  error: 'Parse Error',
  success: 'Parsing Successful',
  conversionComplete: 'Conversion Complete',
  cookiesFound: '{count} cookies found',
  statistics: '{total} total cookies, {nonEmpty} with values',
  options: {
    decodeValues: 'Decode URL-encoded Values',
    removeEmpty: 'Remove Empty Values',
    formatOutput: 'Format JSON Output',
  },
  features: {
    parsing: {
      title: 'Cookie Parsing',
      description:
        'Automatically parse cookie strings with support for standard HTTP cookie format and URL decoding.',
    },
    conversion: {
      title: 'JSON Conversion',
      description:
        'Convert parsed cookies to clean JSON format with customizable output formatting options.',
    },
    export: {
      title: 'Export Options',
      description:
        'Copy to clipboard or download as JSON file with statistics and validation feedback.',
    },
  },
  errors: {
    noCookies: 'No valid cookies found in the input string',
    parseError: 'Failed to parse cookie string: {error}',
  },
  messages: {
    copied: 'JSON copied to clipboard successfully!',
    copyFailed: 'Failed to copy to clipboard',
    downloaded: 'JSON file downloaded successfully!',
    downloadFailed: 'Failed to download file',
  },
  fileRenamer: {
    title: 'File Renamer Tool',
    subtitle: 'Batch rename files with multiple modes - local processing for privacy',
    uploadArea: {
      title: 'Drag & Drop Files Here',
      subtitle: 'or click to select files',
      selectFiles: 'Select Files',
    },
    fileCount: 'Total files: {count}',
    tabs: {
      sequential: 'Sequential',
      replace: 'Find & Replace',
      case: 'Case Transform',
      insert: 'Insert Text',
      truncate: 'Truncate',
    },
    sequential: {
      prefix: 'Prefix',
      prefixPlaceholder: 'e.g., photo_',
      startNumber: 'Start Number',
      padding: 'Number Padding',
    },
    replace: {
      findText: 'Find Text',
      findPlaceholder: 'Text to find',
      replaceText: 'Replace With',
      replacePlaceholder: 'Replacement text',
      caseSensitive: 'Case Sensitive',
    },
    case: {
      transformation: 'Case Transformation',
      uppercase: 'UPPERCASE',
      lowercase: 'lowercase',
      capitalize: 'Capitalize Words',
    },
    insert: {
      text: 'Text to Insert',
      textPlaceholder: 'Text to insert',
      position: 'Position',
      prefix: 'At Beginning',
      suffix: 'At End',
      atIndex: 'At Index',
      index: 'Insert Index',
    },
    truncate: {
      startIndex: 'Start Index',
      endIndex: 'End Index',
      description: 'Extract substring from start index to end index (0-based)',
    },
    actions: {
      preview: 'Preview',
      apply: 'Apply Rename',
      download: 'Download ZIP',
      clear: 'Clear Files',
    },
    fileList: {
      title: 'File List',
      originalName: 'Original Name',
      newName: 'New Name',
      size: 'Size',
      type: 'Type',
    },
    messages: {
      filesAdded: '{count} file(s) added successfully',
      previewGenerated: 'Preview generated successfully',
      renameApplied: 'Rename applied to all files',
      downloadStarted: 'Download started',
      downloadError: 'Download failed, please try again',
      filesCleared: 'All files cleared',
    },
  },
  imageCompressor: {
    title: 'Image Compressor Master',
    description: 'Efficient online image compression tool with batch processing and local privacy',
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
  faviconGenerator: {
    title: 'Favicon Generator',
    description: 'Generate professional favicons in multiple sizes and formats from any image',
    uploadSection: 'Upload Image',
    uploadTitle: 'Drag & Drop Image or Click to Select',
    uploadDescription: 'Upload any image to create favicons for your website',
    supportedFormats: 'Supported formats',
    selectImage: 'Select Image',
    cropImage: 'Crop Image',
    originalImage: 'Original Image',
    originalImageDescription: 'Full resolution image preview - this is your source image',
    imageSize: 'Image Size',
    cropPreview: 'Crop Preview',
    selectAnother: 'Select Another',
    cropInstruction:
      'Drag the crop area to move it, or drag the corner handles to resize. The selected square area will be used to generate favicons.',
    cropInstructionAdvanced:
      'Drag to move the crop area, resize by dragging corners, or use mouse wheel to zoom. The selected square area will be used for favicon generation.',
    outputFormat: 'Output Format',
    sizes: 'Favicon Sizes',
    generate: 'Generate Favicons',
    generating: 'Generating...',
    generatedFavicons: 'Generated Favicons',
    downloadAll: 'Download All as ZIP',
    usageInstructions: 'How to Use Favicons',
    htmlUsage: 'HTML Implementation',
    tips: 'Best Practices',
    tip1: 'Use simple, recognizable designs that work at small sizes',
    tip2: 'Ensure good contrast for visibility across different backgrounds',
    tip3: 'Test your favicon on various devices and browsers',
    tip4: 'Place favicon.ico in your website root directory for automatic detection',
    features: {
      cropping: {
        title: 'Smart Cropping',
        description:
          'Interactive crop tool to select the perfect square area from your image with real-time preview.',
      },
      multiSize: {
        title: 'Multiple Sizes',
        description:
          'Generate favicons in all standard sizes (16px to 128px) for optimal compatibility across devices.',
      },
      formats: {
        title: 'Multiple Formats',
        description:
          'Export in ICO, PNG, or JPG formats to meet different browser and platform requirements.',
      },
    },
    errors: {
      invalidFile: 'Please select a valid image file',
      generationFailed: 'Failed to generate favicons',
      downloadFailed: 'Failed to download files',
      imageLoadFailed: 'Failed to load image',
      fileReadFailed: 'Failed to read file',
    },
    success: {
      imageLoaded: 'Image loaded successfully!',
      generationComplete: 'Favicons generated successfully!',
      downloadComplete: 'Download completed!',
    },
  },
  // JSON Tools
  jsonToExcel: {
    title: 'JSON to Excel Converter',
    description: 'Convert JSON data to Excel format with customizable options',
    inputTitle: 'Input JSON Data',
    outputTitle: 'Excel Output',
    inputPlaceholder: 'Paste your JSON array here...',
    noResults: 'No conversion results yet. Please input JSON data to convert.',
    conversionComplete: 'Conversion completed successfully!',
    readyForDownload: 'Excel file is ready for download.',
    previewTitle: 'Data Preview',
    convert: 'Convert to Excel',
    showingRows: 'Showing {shown} of {total} rows',
    options: {
      includeHeaders: 'Include Headers',
      autoFitColumns: 'Auto-fit Columns',
      sheetName: 'Sheet Name',
      sheetNamePlaceholder: 'Enter sheet name',
    },
    features: {
      conversion: {
        title: 'Smart Conversion',
        description:
          'Automatically convert JSON arrays to Excel format with proper data type handling.',
      },
      formatting: {
        title: 'Excel Formatting',
        description:
          'Generate properly formatted Excel files with headers, auto-sized columns, and multiple sheets.',
      },
      batch: {
        title: 'Batch Processing',
        description:
          'Handle large datasets efficiently with preview and bulk download capabilities.',
      },
    },
    errors: {
      emptyInput: 'Please provide JSON data to convert',
      invalidJson: 'Invalid JSON format. Please check your input.',
      notArray: 'Input must be a JSON array',
      emptyArray: 'JSON array cannot be empty',
      conversionFailed: 'Failed to convert JSON to Excel',
    },
    success: {
      conversionComplete: 'JSON converted to Excel successfully!',
    },
  },
  excelToJson: {
    title: 'Excel to JSON Converter',
    description: 'Convert Excel files to JSON format with flexible parsing options',
    inputTitle: 'Upload Excel File',
    outputTitle: 'JSON Output',
    uploadDescription: 'Select an Excel file to convert to JSON',
    selectFile: 'Select Excel File',
    supportedFormats: 'Supports .xlsx, .xls, and .csv files',
    noResults: 'No conversion results yet. Please upload an Excel file.',
    conversionComplete: 'Conversion completed successfully!',
    recordsCount: '{count} records converted',
    convert: 'Convert to JSON',
    fileSelected: 'File selected successfully',
    options: {
      title: 'Conversion Options',
      firstRowAsHeaders: 'First Row as Headers',
      skipEmptyRows: 'Skip Empty Rows',
      sheetIndex: 'Sheet to Convert',
    },
    features: {
      parsing: {
        title: 'Excel Parsing',
        description:
          'Parse Excel files with support for multiple sheets, formulas, and data types.',
      },
      conversion: {
        title: 'Flexible Conversion',
        description: 'Convert with options for headers, empty rows, and specific sheet selection.',
      },
      options: {
        title: 'Conversion Options',
        description:
          'Customize output with header handling, empty row skipping, and sheet selection.',
      },
    },
    errors: {
      noFileSelected: 'Please select an Excel file to convert',
      xlsxRequired:
        'XLSX library is required for Excel file parsing. Please install: npm install xlsx',
      conversionFailed: 'Failed to convert Excel to JSON',
    },
  },
  jsonToCsv: {
    title: 'JSON to CSV Converter',
    description: 'Convert JSON data to CSV format with customizable delimiters and formatting',
    inputTitle: 'Input JSON Data',
    outputTitle: 'CSV Output',
    inputPlaceholder: 'Paste your JSON array here...',
    noResults: 'No conversion results yet. Please input JSON data to convert.',
    conversionComplete: 'Conversion completed successfully!',
    linesGenerated: '{count} lines generated',
    convert: 'Convert to CSV',
    options: {
      title: 'CSV Options',
      includeHeaders: 'Include Headers',
      flattenNested: 'Flatten Nested Objects',
      delimiter: 'Delimiter',
      quoteChar: 'Quote Character',
      tab: 'Tab',
      none: 'None',
    },
    features: {
      conversion: {
        title: 'Flexible Conversion',
        description: 'Convert JSON to CSV with support for nested objects and custom delimiters.',
      },
      customization: {
        title: 'Customization',
        description: 'Choose delimiters, quote characters, and handle nested data structures.',
      },
      nested: {
        title: 'Nested Data',
        description: 'Automatically flatten nested objects or preserve them as JSON strings.',
      },
    },
    errors: {
      emptyInput: 'Please provide JSON data to convert',
      invalidJson: 'Invalid JSON format. Please check your input.',
      notArray: 'Input must be a JSON array',
      emptyArray: 'JSON array cannot be empty',
      conversionFailed: 'Failed to convert JSON to CSV',
    },
    success: {
      conversionComplete: 'JSON converted to CSV successfully!',
    },
  },
  jsonToSql: {
    title: 'JSON to SQL Converter',
    description: 'Generate SQL INSERT, UPDATE, or CREATE TABLE statements from JSON data',
    inputTitle: 'Input JSON Data',
    outputTitle: 'SQL Output',
    inputPlaceholder: 'Paste your JSON array here...',
    noResults: 'No SQL statements generated yet. Please input JSON data and configure options.',
    conversionComplete: 'SQL generation completed successfully!',
    statementsGenerated: '{count} SQL statements generated',
    convert: 'Generate SQL',
    options: {
      title: 'SQL Options',
      tableName: 'Table Name',
      tableNamePlaceholder: 'Enter table name',
      sqlType: 'SQL Type',
      whereField: 'WHERE Field',
      whereFieldPlaceholder: 'Field for WHERE clause',
      escapeValues: 'Escape Values',
      batchInsert: 'Batch Insert',
    },
    features: {
      insertion: {
        title: 'Multiple SQL Types',
        description: 'Generate INSERT, UPDATE, or CREATE TABLE statements from JSON data.',
      },
      customization: {
        title: 'Customization',
        description: 'Configure table names, SQL types, and field mappings for your database.',
      },
      security: {
        title: 'SQL Security',
        description: 'Automatic value escaping to prevent SQL injection vulnerabilities.',
      },
    },
    errors: {
      emptyInput: 'Please provide JSON data to convert',
      emptyTableName: 'Please provide a table name',
      emptyWhereField: 'Please provide a WHERE field for UPDATE statements',
      invalidJson: 'Invalid JSON format. Please check your input.',
      notArray: 'Input must be a JSON array',
      emptyArray: 'JSON array cannot be empty',
      conversionFailed: 'Failed to generate SQL statements',
    },
    success: {
      conversionComplete: 'SQL statements generated successfully!',
    },
  },
  jsonPathExtractor: {
    title: 'JSON Path Extractor',
    description:
      'Extract data from JSON using JSONPath expressions with advanced filtering capabilities',
    extractButton: 'Extract Data',
    features: {
      pathExtraction: {
        title: 'Path Extraction',
        description:
          'Use JSONPath expressions to precisely extract data from complex JSON structures with dot notation and array indexing.',
      },
      filtering: {
        title: 'Advanced Filtering',
        description:
          'Support for wildcards, array slicing, and conditional filtering to extract exactly the data you need.',
      },
      export: {
        title: 'Export Results',
        description:
          'Copy extracted data to clipboard or download as JSON file with formatted output and statistics.',
      },
    },
    syntaxGuide: {
      title: 'JSONPath Syntax Guide',
      basicSyntax: 'Basic Syntax',
      examples: 'Common Examples',
      rootSymbol: 'Root of JSON data',
      dotNotation: 'Access object properties',
      bracketNotation: 'Array/object access',
      wildcard: 'Match all elements',
      exampleDesc1: 'Get first book title',
      exampleDesc2: 'Get all book authors',
    },
    inputSection: {
      title: 'JSON Data & Path',
      jsonData: 'JSON Data',
      jsonPath: 'JSONPath Expression',
      jsonPlaceholder:
        'Paste your JSON data here...\n\nExample:\n{\n  "users": [\n    {"name": "John", "age": 30},\n    {"name": "Jane", "age": 25}\n  ]\n}',
      pathPlaceholder: 'Enter JSONPath expression (e.g., $.users[*].name)',
      quickPaths: 'Quick Path Templates',
    },
    outputSection: {
      title: 'Extracted Results',
      noResults: 'No extraction results yet. Please input JSON data and JSONPath expression.',
      extractedData: 'Extracted Data',
    },
    quickPaths: {
      root: 'Root element',
      allProperties: 'All properties',
      firstArrayItem: 'First array item',
      allArrayItems: 'All array items',
      lastArrayItem: 'Last array item',
      arraySlice: 'Array slice (0-2)',
    },
    success: {
      validJson: 'Valid JSON format',
      extracted: 'Data Extracted Successfully',
      arrayResults: 'Found {count} array items',
      objectResults: 'Found object with {count} properties',
      primitiveResult: 'Found {type} value',
    },
    errors: {
      invalidJson: 'Invalid JSON format',
      pathError: 'JSONPath Expression Error',
      noMatches: 'No data matches the specified path',
    },
    messages: {
      copied: 'Extracted data copied to clipboard successfully!',
      copyFailed: 'Failed to copy to clipboard',
      downloaded: 'JSON file downloaded successfully!',
      downloadFailed: 'Failed to download file',
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
    'json-tools': {
      name: 'JSON Tools',
      description: 'Comprehensive JSON processing and conversion utilities',
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
