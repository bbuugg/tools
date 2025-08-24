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
    remove: 'Remove',
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
  homepage: {
    title: 'Developer Tools Collection',
    subtitle:
      'Powerful online tools for developers, designers, and content creators. Everything you need to boost your productivity.',
    recommendedTools: 'Recommended Tools',
    exploreCategories: 'Explore Categories',
    stats: {
      totalTools: 'Total Tools',
      activeTools: 'Active Tools',
      categories: 'Categories',
      comingSoon: 'Coming Soon',
    },
  },
  notFound: {
    title: 'Page Not Found',
    description: 'The tool or page you are looking for does not exist or has been moved.',
    backToHome: 'Back to Home',
    goBack: 'Go Back',
    popularTools: 'Popular Tools',
    helpText:
      'If you need help finding a specific tool, please check our categories in the sidebar.',
  },
  tools: {
    htmlExtractor: {
      title: 'HTML Content Extractor',
      description:
        'Extract images, videos, links, and other resources from HTML code with one click',
      contentTypes: 'Content Types',
      baseUrl: 'Base URL',
      inputPlaceholder: 'Paste your HTML code here...',
      extractionResults: 'Extraction Results',
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
      inputPlaceholder: 'Paste your JSON here.',
      extractedData: 'EXTRACTED DATA',
      fieldStatistics: 'FIELD STATISTICS',
      noResults:
        'No extraction results yet. Please input JSON array data and select fields to extract.',
      options: {
        preserveStructure: 'Preserve Object Structure',
        removeEmpty: 'Remove Empty Values',
        flattenNested: 'Flatten Nested Objects',
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
        noFields: 'Please select at least one field to extract',
        invalidJson: 'Invalid JSON format:',
        noData: 'Please provide JSON data to extract from',
      },
    },
    imageListProcessor: {
      title: 'Image List Processor',
      description: 'Input a list of image URLs and display them in a visual gallery format',
      inputTitle: 'Input Image URLs',
      inputNote: 'Paste your image URLs below, one per line:',
      inputPlaceholder:
        'Paste image URLs here, one per line...\n\nExample:\nhttps://example.com/image1.jpg\nhttps://example.com/image2.png\nhttps://example.com/image3.webp',
      imagePreview: 'Image Gallery',
      noResults: 'No valid image URLs found. Please enter valid image URLs.',
      imageError: 'Failed to load',
      emptyState: {
        title: 'No images to display',
        description: 'Enter some image URLs above to see them displayed in the gallery below.',
      },
      features: {
        simple: {
          title: 'Simple Input',
          description: 'Just paste image URLs line by line - no complex formatting needed.',
        },
        gallery: {
          title: 'Enhanced Gallery',
          description:
            'View all images in a clean 4-column layout with full-featured lightbox preview supporting zoom, pan, and keyboard navigation.',
        },
        fast: {
          title: 'Professional Preview',
          description:
            'Advanced image viewer with zoom, scroll, drag, and full-screen capabilities for detailed inspection.',
        },
      },
    },
    videoToGifConverter: {
      title: 'Video to GIF Converter',
      description:
        'Convert videos to animated GIFs with customizable text overlays and timing controls',
      upload: {
        title: 'Upload Video',
        dragDrop: 'Drag & drop your video here',
        selectFile: 'Select Video File',
        supportedFormats: 'Supports MP4, AVI, MOV, WebM and other video formats (Max: 100MB)',
      },
      settings: {
        width: 'GIF Width (px)',
        quality: 'Quality',
        fps: 'Frame Rate (FPS)',
        qualityOptions: {
          high: 'High Quality',
          medium: 'Medium Quality',
          low: 'Low Quality (Smaller File)',
        },
      },
      preview: {
        title: 'Video Preview & Controls',
      },
      actions: {
        startCapture: 'Start Capture',
        stopCapture: 'Stop Capture',
        generateGif: 'Generate GIF',
      },
      timeRange: {
        title: 'Time Range Selection',
        start: 'Start',
        end: 'End',
        setStart: 'Set Start',
        setEnd: 'Set End',
      },
      textOverlay: {
        title: 'Text Overlays',
        add: 'Add Text',
        text: 'Text',
        placeholder: 'Enter overlay text...',
        startTime: 'Start Time (s)',
        endTime: 'End Time (s)',
        fontSize: 'Font Size',
        color: 'Color',
        position: 'Position',
        positions: {
          top: 'Top',
          center: 'Center',
          bottom: 'Bottom',
        },
      },
      processing: {
        title: 'Processing Video',
        description: 'Converting your video to GIF with text overlays. This may take a moment...',
      },
      result: {
        title: 'Generated GIF',
        download: 'Download GIF',
        createNew: 'Create New GIF',
      },
      features: {
        conversion: {
          title: 'Video Conversion',
          description:
            'Convert videos to high-quality animated GIFs with customizable frame rate and dimensions.',
        },
        textOverlay: {
          title: 'Text Overlays',
          description:
            'Add multiple text overlays with precise timing, custom colors, fonts, and positioning.',
        },
        customization: {
          title: 'Full Customization',
          description:
            'Control every aspect including quality, size, timing, and text appearance for perfect results.',
        },
      },
      errors: {
        invalidFile: 'Please select a valid video file.',
        fileTooLarge: 'File size must be less than 100MB.',
        processingFailed: 'Failed to process video. Please try again.',
      },
    },
    apngGenerator: {
      title: 'APNG Generator',
      description:
        'Create animated PNG files from multiple static images with customizable settings',
      uploadTitle: 'Upload Image Frames',
      uploadDescription:
        'Drag and drop multiple images or click to select frames for your animation',
      selectFiles: 'Select Image Files',
      supportedFormats: 'Supported formats',
      settings: 'Animation Settings',
      frameDelay: 'Frame Delay',
      loopCount: 'Loop Count',
      infinite: 'Infinite',
      outputWidth: 'Output Width',
      outputHeight: 'Output Height',
      advancedOptions: 'Advanced Options',
      maintainAspectRatio: 'Maintain Aspect Ratio',
      optimizeSize: 'Optimize File Size',
      frameList: 'Animation Frames',
      generateAPNG: 'Generate APNG',
      generating: 'Generating...',
      preview: 'Preview Animation',
      animationPreview: 'Animation Preview',
      downloadAPNG: 'Download APNG',
      reorderHint:
        'Frames will be animated in the order shown above. You can remove unwanted frames by clicking the × button.',
      features: {
        title: 'Key Features',
        highQuality: {
          title: 'High Quality Output',
          description:
            'Generate lossless animated PNG files with support for transparency and 24-bit color',
        },
        customizable: {
          title: 'Fully Customizable',
          description: 'Control frame timing, loop count, dimensions, and optimization settings',
        },
        easyToUse: {
          title: 'Easy to Use',
          description: 'Simple drag-and-drop interface with real-time preview and instant download',
        },
      },
    },
    backgroundRemover: {
      title: 'Background Remover',
      description: 'Remove backgrounds from images automatically using AI technology',
      features: {
        aiPowered: {
          title: 'AI-Powered',
          description:
            'Advanced machine learning algorithms for precise background detection and removal',
        },
        fastProcessing: {
          title: 'Fast Processing',
          description: 'Quick background removal with high-quality results in seconds',
        },
        highQuality: {
          title: 'High Quality',
          description: 'Preserve image quality and details while removing backgrounds cleanly',
        },
      },
      upload: {
        title: 'Upload Image',
        dragDrop: 'Drag & Drop Image Here',
        supportedFormats: 'Supports JPG, PNG, GIF, and other image formats',
        selectFile: 'Select Image',
      },
      preview: {
        original: 'Original Image',
        originalAlt: 'Original image',
        processed: 'Background Removed',
        processedAlt: 'Processed image with background removed',
      },
      options: {
        title: 'Output Options',
        model: 'AI Model',
        outputFormat: 'Output Format',
        transparent: 'Transparent background',
        whiteBackground: 'White background',
        backgroundColor: 'Background Color',
        quality: 'Output Quality',
      },
      models: {
        small: 'Small (Fast)',
        medium: 'Medium (Balanced)',
        large: 'Large (Best Quality)',
      },
      actions: {
        remove: 'Remove Background',
      },
      processing: {
        inProgress: 'Processing...',
        analyzing: 'Analyzing image and removing background...',
        pleaseWait: 'This may take a few seconds',
      },
      result: {
        title: 'Result',
        noResult: 'No processed image yet. Please upload an image to remove its background.',
        complete: 'Background Removal Complete',
        ready: 'Your image is ready for download',
      },
      imageInfo: {
        size: 'File size',
        format: 'Format',
      },
      tips: {
        title: 'Tips for Best Results',
        tip1: 'Use high-resolution images with clear subject boundaries for best results',
        tip2: 'Images with good contrast between subject and background work better',
        tip3: 'Avoid images with complex backgrounds or similar colors to the main subject',
        tip4: 'PNG format preserves transparency, while JPG uses white background',
        tip5: 'Use the comparison view to see before and after results side by side',
      },
      comparison: {
        before: 'Before',
        after: 'After',
      },
    },
    csvtojson: {
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
    excelTextToJson: {
      title: 'Excel Text to JSON',
      description: 'Convert Excel clipboard data directly to JSON format',
      introduction: {
        title: 'Tool Introduction',
        description:
          'Online Excel text to JSON converter for converting tab-separated Excel data to JSON format.',
        usage:
          'Copy data from Excel and paste it here. Default delimiter is tab (\\t). First row should contain headers for object format.',
      },
      example: {
        title: 'Example',
        input: 'Excel Input:',
        output: 'JSON Output:',
      },
      input: {
        title: 'Input Excel Data',
        placeholder:
          'Paste your Excel data here...\n\nExample:\nname\tage\tscore\nLi Hua\t25\t89\nXiao Ming\t22\t85',
        fileUpload: 'Upload Text File',
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
        noOutput: 'No JSON output yet. Please input Excel data to convert.',
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
        jsonPlaceholder: 'Paste your JSON data here...',
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
    jsonFormatter: {
      title: 'JSON Formatter',
      description: 'Format, beautify, and validate JSON data with customizable indentation',
      inputTitle: 'Input JSON',
      outputTitle: 'Formatted JSON',
      inputPlaceholder: 'Paste your JSON here...',
      noResults: 'No formatted JSON yet. Please input valid JSON to format.',
      validJson: 'Valid JSON',
      invalidJson: 'Invalid JSON',
      formattingComplete: 'Formatting Complete',
      formatOptions: 'Format Options',
      indent: 'Indent',
      sortKeys: 'Sort Keys',
      compactFormat: 'Compact Format',
      escapeUnicode: 'Escape Unicode',
      formatJson: 'Format JSON',
      spaces2: '2 spaces',
      spaces4: '4 spaces',
      tab: 'Tab',
      lines: 'lines',
      characters: 'characters',
      smaller: 'smaller',
      larger: 'larger',
      features: {
        prettyFormat: {
          title: 'Pretty Format',
          description: 'Automatically format and beautify JSON with proper indentation and spacing',
        },
        validation: {
          title: 'Validation',
          description: 'Real-time JSON validation with detailed error messages and line numbers',
        },
        customization: {
          title: 'Customization',
          description: 'Choose indentation size, sorting, and compact formatting options',
        },
      },
      messages: {
        formatSuccess: 'JSON formatted successfully!',
        formatError: 'Failed to format JSON: ',
        provideData: 'Please provide JSON data to format',
        copied: 'JSON copied to clipboard successfully!',
        copyFailed: 'Failed to copy to clipboard',
        downloaded: 'JSON file downloaded successfully!',
        downloadFailed: 'Failed to download file',
      },
    },
    jsonMerge: {
      title: 'JSON File Merger',
      description: 'Merge multiple JSON files into a single file',
      introduction: {
        title: 'Tool Introduction',
        description:
          'Online JSON file merger tool to combine multiple JSON files into one large JSON file.',
        usage:
          'JSON files will be merged in import order. If order matters, please note the file sequence.',
      },
      fileUpload: {
        title: 'Upload JSON Files',
        description:
          'Select multiple JSON files to merge. Files will be processed in the order shown below.',
        selectFiles: 'Select JSON Files',
        supportedFormats: 'Supports .json files',
        noFiles: 'No files selected yet. Please select JSON files to merge.',
      },
      filePreview: {
        title: 'File Preview',
        fileName: 'File Name',
        fileSize: 'File Size',
        jsonStructure: 'JSON Structure',
        arrayItems: '{count} array items',
        object: 'JSON Object',
        remove: 'Remove',
        moveUp: 'Move Up',
        moveDown: 'Move Down',
      },
      options: {
        title: 'Merge Options',
        outputFileName: 'Output File Name',
        outputFileNamePlaceholder: 'Enter output file name (without extension)',
        defaultFileName: 'merged-json',
      },
      actions: {
        merge: 'Merge JSON Files',
        clear: 'Clear All Files',
        download: 'Download Merged JSON',
      },
      output: {
        title: 'Merged JSON Output',
        noOutput: 'No merged output yet. Please upload JSON files and click Merge.',
        complete: 'Merge Complete',
        itemsMerged: '{count} items merged',
        downloadReady: 'Merged JSON file is ready for download.',
      },
      features: {
        multipleFiles: {
          title: 'Multiple File Support',
          description: 'Upload and merge multiple JSON files with drag-and-drop support.',
        },
        orderControl: {
          title: 'Order Control',
          description: 'Reorder files before merging to control the output sequence.',
        },
        preview: {
          title: 'File Preview',
          description: 'Preview file structure and content before merging.',
        },
      },
      errors: {
        noFiles: 'Please select at least one JSON file to merge',
        invalidJson: 'Invalid JSON in file: {fileName}',
        mergeFailed: 'Failed to merge JSON files: {error}',
        emptyArray: 'JSON file must contain an array at the root level',
      },
      success: {
        filesAdded: '{count} file(s) added successfully',
        mergeComplete: 'JSON files merged successfully!',
      },
    },
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
      supportedFormats: 'Supports .xlsx, .xls, .csv, and .ods files',
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
          description:
            'Convert with options for headers, empty rows, and specific sheet selection.',
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
        script: 'Generate Script',
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
      script: {
        scriptType: 'Script Type',
        windows: 'Windows Batch (.bat)',
        linux: 'Linux Shell (.sh)',
        both: 'Both Scripts',
        outputDirectory: 'Output Directory',
        outputDirectoryPlaceholder: 'e.g., C:\\MyFiles or /home/user/files',
        includeSubdirectories: 'Include Subdirectories',
        instructions: {
          title: 'Instructions',
          description: 'This tool generates scripts to rename your files. Download the script, place it in the directory with your files, and run it to perform the renaming operation.',
        },
      },
      actions: {
        preview: 'Preview',
        apply: 'Apply Rename',
        download: 'Download ZIP',
        clear: 'Clear Files',
        generateScript: 'Generate Script',
      },
      sorting: {
        title: 'Sorting',
        natural: 'Natural Sort',
        filename: 'Filename Order',
        modifiedTime: 'Modified Time',
        modifiedTimeDesc: 'Modified Time (Descending)',
        random: 'Random',
        reverse: 'Reverse Current Order',
        manual: 'Manual Sort (Drag & Drop)',
      },
      fileList: {
        title: 'File List',
        drag: 'Drag',
        originalName: 'Original Name',
        newName: 'New Name',
        size: 'Size',
        type: 'Type',
        dragHint: 'Drag files to reorder them manually',
      },
      messages: {
        filesAdded: '{count} file(s) added successfully!',
        previewGenerated: 'Preview generated successfully!',
        renameApplied: 'Rename applied successfully!',
        downloadStarted: 'Download started! Please check your downloads folder.',
        downloadError: 'Download failed! Please try again.',
        filesCleared: 'All files cleared!',
        noFilesToProcess: 'No files to process! Please add files first.',
        scriptDownloaded: 'Script "{fileName}" downloaded successfully!',
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
    cookieToJson: {
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
    },
  },
}
