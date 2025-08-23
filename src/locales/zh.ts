export default {
  common: {
    clear: '清空',
    copy: '复制',
    download: '下载',
    loadExample: '加载示例',
    selectAll: '全选',
    clearSelection: '清空选择',
    extract: '提取',
    results: '结果',
    options: '选项',
    input: '输入',
    preview: '预览',
    statistics: '统计',
    fields: '字段',
    items: '项',
    found: '已找到',
    extracted: '已提取',
    with: '包含',
    total: '总数',
    unique: '唯一',
    nonEmpty: '非空',
  },
  navigation: {
    tools: '工具',
    language: '语言',
    categories: '工具分类',
  },
  tools: {
    htmlExtractor: {
      title: 'HTML 内容提取器',
      description: '一键从 HTML 代码中提取图片、视频、链接和其他资源',
      contentTypes: '内容类型',
      baseUrl: '基础 URL',
      inputPlaceholder: '请在此处粘贴您的 HTML 代码...',
      noResults: '暂无提取结果。请输入 HTML 代码并选择要提取的内容类型。',
      features: {
        imageExtraction: {
          title: '图片提取',
          description:
            '自动从 HTML 中提取所有图片 URL，包括 img 标签和 CSS 背景图片。支持相对路径转绝对路径，方便使用。',
        },
        mediaProcessing: {
          title: '媒体处理',
          description:
            '批量提取视频和音频文件链接，支持多种格式（MP4、WebM、Ogg、MP3 等）。自动识别 video 和 audio 标签中的源文件。',
        },
        linkAnalysis: {
          title: '链接分析',
          description:
            '提取页面中的所有超链接，包括 a 标签的 href 属性。支持筛选内部和外部链接，帮助分析网站结构。',
        },
      },
      options: {
        uniqueOnly: '仅显示唯一结果',
        absoluteUrls: '转换为绝对 URL',
      },
      types: {
        images: '图片',
        videos: '视频',
        audio: '音频',
        links: '链接',
        css: 'CSS',
        javascript: 'JavaScript',
        iframes: '内嵌框架',
        metadata: '元数据',
        forms: '表单',
      },
    },
    jsonExtractor: {
      title: 'JSON 字段提取器',
      description: '一键从 JSON 数组数据中提取指定字段',
      availableFields: '可用字段',
      inputTitle: '输入 JSON 数组',
      inputNote: '请粘贴格式为以下的 JSON 数组数据：',
      inputDescription: '工具将自动解析 JSON 并列出所有可选择的字段。',
      inputPlaceholder:
        '请在此处粘贴您的 JSON 数组，例如：\n[\n  {"name": "张三", "age": 30, "city": "北京"},\n  {"name": "李四", "age": 25, "city": "上海"}\n]',
      extractedData: '提取的数据',
      fieldStatistics: '字段统计',
      noResults: '暂无提取结果。请输入 JSON 数组数据并选择要提取的字段。',
      options: {
        preserveStructure: '保持对象结构',
        removeEmpty: '移除空值',
      },
      features: {
        fieldExtraction: {
          title: '字段提取',
          description:
            '自动解析 JSON 数组并提取选定字段。支持嵌套对象并保持数据类型以确保准确提取。',
        },
        smartFiltering: {
          title: '智能过滤',
          description:
            '选择要包含在输出中的特定字段。可选择移除空值并保持原始对象结构以获得清晰的结果。',
        },
        exportOptions: {
          title: '导出选项',
          description:
            '将提取的数据复制到剪贴板或下载为 JSON 文件。包括字段统计和数据分析，便于更好地理解您的数据集。',
        },
      },
      errors: {
        invalidFormat: '输入必须是 JSON 数组格式：[{},{},...]',
        emptyArray: 'JSON 数组不能为空',
        noFields: '在 JSON 对象中找不到字段',
        invalidJson: '无效的 JSON 格式：',
      },
    },
    imageListProcessor: {
      title: '图片列表处理器',
      description: '从各种格式中提取、转换和处理图片列表',
      processingOptions: '处理选项',
      inputTitle: '输入图片数据',
      resultsTitle: '处理结果',
      inputNote: '请粘贴以下支持格式之一的图片数据：',
      inputPlaceholder:
        '在此粘贴图片 URL、HTML、Markdown 或 CSV 数据...\n\n支持的格式：\n- 直接 URL（每行一个）\n- HTML img 标签\n- Markdown 图片语法\n- CSV 格式（url,alt,width,height）',
      imagePreview: '图片预览',
      processedOutput: '处理后输出',
      noResults: '未找到图片。请输入支持格式的图片数据。',
      showingFirst: '显示前',
      of: '个，共',
      modes: {
        extract: '提取 URL',
        markdown: 'Markdown 格式',
        html: 'HTML 格式',
        csv: 'CSV 格式',
      },
      options: {
        includeAltText: '包含替代文本',
        includeDimensions: '包含尺寸',
        validateUrls: '验证 URL',
        sortByName: '按文件名排序',
      },
      supportedFormats: {
        urls: '直接图片 URL（每行一个）',
        html: '带有 src 和 alt 属性的 HTML img 标签',
        markdown: 'Markdown 图片语法 ![alt](url)',
        csv: 'CSV 格式：url,alt,width,height',
      },
      features: {
        extraction: {
          title: '智能提取',
          description: '自动检测并从 URL、HTML、Markdown 和 CSV 格式中提取图片，具有智能解析功能。',
        },
        formats: {
          title: '多种格式',
          description:
            '将图片列表转换为各种输出格式，包括纯 URL、Markdown、HTML 和 CSV，适用于不同用途。',
        },
        batch: {
          title: '批量处理',
          description: '一次处理数百张图片，提供预览缩略图、验证和批量导出功能。',
        },
      },
    },
  },
  toast: {
    success: '成功',
    error: '错误',
    warning: '警告',
    info: '信息',
    copied: '结果已复制到剪贴板！',
    copyFailed: '复制到剪贴板失败',
    downloadSuccess: '文件下载成功！',
  },
  footer: {
    madeWith: '用',
    by: '制作',
  },
  categories: {
    'web-tools': {
      name: '网页工具',
      description: '网页开发和分析工具',
    },
    'data-tools': {
      name: '数据工具',
      description: '数据处理和操作工具',
    },
    'image-tools': {
      name: '图片工具',
      description: '图片处理和管理工具',
    },
    converters: {
      name: '转换器',
      description: '格式转换实用工具',
    },
    generators: {
      name: '生成器',
      description: '代码和内容生成器',
    },
  },
  pagination: {
    previous: '上一页',
    next: '下一页',
    page: '第',
    of: '页，共',
  },
  status: {
    active: '可用',
    'coming-soon': '即将推出',
  },
}
