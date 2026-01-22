import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Card,
  Typography,
  Space,
  Row,
  Col,
  Button,
  Select,
  Alert,
  Divider,
  Checkbox,
  Slider,
  Tag
} from 'antd';
import {
  CompressOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';

const { Title, Text, Paragraph } = Typography;

interface CompressionResult {
  url: string;
  filename: string;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

interface CompressionSettings {
  quality: 'high' | 'medium' | 'low';
  imageCompression: boolean;
  fontSubsetting: boolean;
  metadataRemoval: boolean;
  removeBookmarks: boolean;
  removeAnnotations: boolean;
  compressionLevel: number;
}

export default function PdfCompressor() {
  const intl = useIntl();
  const [files, setFiles] = useState<File[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<CompressionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pdfjsLib, setPdfjsLib] = useState<Record<string, any> | null>(null);
  const [isClient, setIsClient] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState<CompressionSettings>({
    quality: 'medium',
    imageCompression: true,
    fontSubsetting: true,
    metadataRemoval: false,
    removeBookmarks: false,
    removeAnnotations: false,
    compressionLevel: 50,
  });

  // 确保只在客户端运行
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 动态导入PDF.js
  useEffect(() => {
    if (!isClient) return;

    const loadPDFJS = async () => {
      try {
        const pdfjs = await import('pdfjs-dist');
        (pdfjs as any).GlobalWorkerOptions.workerSrc = '/lib/pdfjs-dist/pdf.worker.min.mjs';
        setPdfjsLib(pdfjs);
      } catch (error) {
        console.error('Failed to load PDF.js:', error);
        setError(intl.formatMessage({ id: 'tools.pdfCompressor.errors.library_failed' }));
      }
    };

    loadPDFJS();
  }, [isClient, intl]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const pdfFiles = Array.from(selectedFiles).filter(file => 
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      );
      setFiles(pdfFiles);
      setError(null);
    }
  }, []);

  // 压缩PDF文件
  const compressPDF = async (pdfFile: File): Promise<CompressionResult> => {
    if (!pdfjsLib) {
      throw new Error(intl.formatMessage({ id: 'tools.pdfCompressor.errors.library_failed' }));
    }

    const arrayBuffer = await pdfFile.arrayBuffer();
    const originalSize = pdfFile.size;

    try {
      // 使用PDF.js加载PDF
      const loadingTask = (pdfjsLib as any).getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      // 创建新的PDF文档
      const { PDFDocument } = await import('pdf-lib');
      const newPdfDoc = await PDFDocument.create();

      // 根据质量设置确定压缩参数
      const qualitySettings = {
        high: { imageQuality: 0.8, imageScale: 1.0 },
        medium: { imageQuality: 0.6, imageScale: 0.8 },
        low: { imageQuality: 0.4, imageScale: 0.6 }
      };

      const currentQuality = qualitySettings[settings.quality];

      // 处理每一页
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        setProgress((pageNum / numPages) * 80); // 80%用于页面处理

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: currentQuality.imageScale });

        // 创建canvas渲染页面
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderContext).promise;

        // 将canvas转换为图片
        const imageBlob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!);
          }, 'image/jpeg', currentQuality.imageQuality);
        });

        // 将图片嵌入到新PDF中
        const imageBytes = await imageBlob.arrayBuffer();
        const image = await newPdfDoc.embedJpg(imageBytes);
        const pageWidth = viewport.width;
        const pageHeight = viewport.height;

        const newPage = newPdfDoc.addPage([pageWidth, pageHeight]);
        newPage.drawImage(image, {
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
        });
      }

      // 生成压缩后的PDF
      const compressedPdfBytes = await newPdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 20,
        updateFieldAppearances: false,
      });

      setProgress(90);

      // 创建Blob和URL
      const compressedBlob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(compressedBlob);
      const filename = pdfFile.name.replace('.pdf', '_compressed.pdf');
      const compressedSize = compressedBlob.size;
      const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

      setProgress(100);

      return {
        url,
        filename,
        originalSize,
        compressedSize,
        compressionRatio,
      };
    } catch (error) {
      console.error('PDF compression error:', error);
      throw new Error(intl.formatMessage({ id: 'tools.pdfCompressor.errors.compression_failed' }));
    }
  };

  const startCompression = useCallback(async () => {
    if (files.length === 0) {
      setError(intl.formatMessage({ id: 'tools.pdfCompressor.errors.no_file' }));
      return;
    }

    if (!pdfjsLib) {
      setError(intl.formatMessage({ id: 'tools.pdfCompressor.errors.library_failed' }));
      return;
    }
    
    // 滚动到页面顶部，确保用户能看到进度
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setIsCompressing(true);
    setProgress(0);
    setError(null);
    setResults([]);

    try {
      const compressionResults: CompressionResult[] = [];

      // 只处理PDF文件
      const pdfFiles = files.filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
      if (pdfFiles.length === 0) {
        setError(intl.formatMessage({ id: 'tools.pdfCompressor.errors.invalid_format' }));
        return;
      }

      for (let i = 0; i < pdfFiles.length; i++) {
        setProgress((i / pdfFiles.length) * 10); // 前10%用于文件准备
        const result = await compressPDF(pdfFiles[i]);
        compressionResults.push(result);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setResults(compressionResults);
      
      // 压缩完成后滚动到结果区域
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    } catch (err) {
      console.error('Compression error:', err);
      setError(intl.formatMessage({ id: 'tools.pdfCompressor.errors.compression_failed' }));
    } finally {
      setIsCompressing(false);
    }
  }, [files, settings, pdfjsLib, intl]);

  const downloadResult = useCallback((result: CompressionResult) => {
    const link = document.createElement('a');
    link.href = result.url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const clearAll = useCallback(() => {
    // 清理之前的结果URL
    results.forEach(result => URL.revokeObjectURL(result.url));
    setFiles([]);
    setResults([]);
    setError(null);
    setProgress(0);
  }, [results]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 如果不在客户端，显示加载状态
  if (!isClient) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">
            <FormattedMessage id="tools.pdfCompressor.loading" />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <Title level={2}>
        <FormattedMessage id="tools.pdfCompressor.title" />
      </Title>
      <Paragraph className="text-gray-500 dark:text-gray-400 mb-6">
        <FormattedMessage id="tools.pdfCompressor.description" />
      </Paragraph>

      <Card>
        <Space orientation="vertical" size="large" className="w-full">
          {/* 压缩设置 */}
          <div>
            <Text strong className="block mb-3">
              <FormattedMessage id="tools.pdfCompressor.compression_settings.title" />
            </Text>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div>
                  <Text className="block mb-2">
                    <FormattedMessage id="tools.pdfCompressor.compression_settings.quality" />
                  </Text>
                  <Select
                    value={settings.quality}
                    onChange={(value) => setSettings(prev => ({ ...prev, quality: value as 'high' | 'medium' | 'low' }))}
                    className="w-full"
                    options={[
                      { value: 'high', label: intl.formatMessage({ id: 'tools.pdfCompressor.compression_settings.quality_high' }) },
                      { value: 'medium', label: intl.formatMessage({ id: 'tools.pdfCompressor.compression_settings.quality_medium' }) },
                      { value: 'low', label: intl.formatMessage({ id: 'tools.pdfCompressor.compression_settings.quality_low' }) }
                    ]}
                  />
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div>
                  <Text className="block mb-2">
                    <FormattedMessage id="tools.pdfCompressor.compression_settings.compression_level" />
                  </Text>
                  <Slider
                    min={1}
                    max={100}
                    value={settings.compressionLevel}
                    onChange={(value) => setSettings(prev => ({ ...prev, compressionLevel: value || 50 }))}
                  />
                  <Text>{settings.compressionLevel}%</Text>
                </div>
              </Col>
            </Row>
            
            <Divider />
            
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Checkbox
                  checked={settings.imageCompression}
                  onChange={(e) => setSettings(prev => ({ ...prev, imageCompression: e.target.checked }))}
                >
                  <FormattedMessage id="tools.pdfCompressor.compression_settings.image_compression" />
                </Checkbox>
              </Col>
              <Col xs={24} md={12}>
                <Checkbox
                  checked={settings.fontSubsetting}
                  onChange={(e) => setSettings(prev => ({ ...prev, fontSubsetting: e.target.checked }))}
                >
                  <FormattedMessage id="tools.pdfCompressor.compression_settings.font_subsetting" />
                </Checkbox>
              </Col>
              <Col xs={24} md={12}>
                <Checkbox
                  checked={settings.metadataRemoval}
                  onChange={(e) => setSettings(prev => ({ ...prev, metadataRemoval: e.target.checked }))}
                >
                  <FormattedMessage id="tools.pdfCompressor.compression_settings.metadata_removal" />
                </Checkbox>
              </Col>
              <Col xs={24} md={12}>
                <Checkbox
                  checked={settings.removeBookmarks}
                  onChange={(e) => setSettings(prev => ({ ...prev, removeBookmarks: e.target.checked }))}
                >
                  <FormattedMessage id="tools.pdfCompressor.compression_settings.remove_bookmarks" />
                </Checkbox>
              </Col>
              <Col xs={24} md={12}>
                <Checkbox
                  checked={settings.removeAnnotations}
                  onChange={(e) => setSettings(prev => ({ ...prev, removeAnnotations: e.target.checked }))}
                >
                  <FormattedMessage id="tools.pdfCompressor.compression_settings.remove_annotations" />
                </Checkbox>
              </Col>
            </Row>
          </div>

          {/* 文件上传 */}
          <div>
            <Text strong className="block mb-3">
              <FormattedMessage id="tools.pdfCompressor.upload_area.title" />
            </Text>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <FilePdfOutlined className="text-4xl text-red-500 mb-3" />
              <p className="text-lg mb-2">
                <FormattedMessage id="tools.pdfCompressor.upload_area.title" />
              </p>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                <FormattedMessage id="tools.pdfCompressor.upload_area.subtitle" />
              </p>
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-compressor-upload"
              />
              <label htmlFor="pdf-compressor-upload">
                <Button
                  icon={<FilePdfOutlined />}
                  size="large"
                  className="mb-2"
                >
                  <FormattedMessage id="tools.pdfCompressor.upload_area.button" />
                </Button>
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <FormattedMessage id="tools.pdfCompressor.upload_area.max_size" />
              </p>
            </div>
            
            {files.length > 0 && (
              <div className="mt-4">
                <Text strong>
                  <FormattedMessage id="tools.pdfCompressor.selected_files" /> ({files.length})
                </Text>
                <div className="mt-2 space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <div>
                        <Text className="block">{file.name}</Text>
                        <Text type="secondary" className="text-sm">
                          {formatFileSize(file.size)}
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 错误提示 */}
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
            />
          )}

          {/* 压缩进度 */}
          {isCompressing && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <Text strong>
                  <FormattedMessage id="tools.pdfCompressor.status.compressing" />
                </Text>
                <Text>{Math.round(progress)}%</Text>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          {files.length > 0 && !isCompressing && (
            <div className="flex flex-wrap gap-3">
              <Button
                type="primary"
                icon={isCompressing ? <LoadingOutlined /> : <CompressOutlined />}
                onClick={startCompression}
                disabled={files.length === 0 || !pdfjsLib}
                loading={isCompressing}
                size="large"
              >
                <FormattedMessage id="tools.pdfCompressor.actions.compress" />
              </Button>
              <Button
                onClick={clearAll}
                danger
                size="large"
              >
                <FormattedMessage id="tools.pdfCompressor.actions.clear" />
              </Button>
            </div>
          )}

          {/* 压缩结果 */}
          {results.length > 0 && (
            <div ref={resultsRef}>
              <Divider>
                <FormattedMessage id="tools.pdfCompressor.results.title" />
              </Divider>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <Text className="block">{result.filename}</Text>
                        <Text type="secondary" className="text-sm">
                          <FormattedMessage id="tools.pdfCompressor.results.original_size" />: {formatFileSize(result.originalSize)} | 
                          <FormattedMessage id="tools.pdfCompressor.results.compressed_size" />: {formatFileSize(result.compressedSize)}
                        </Text>
                      </div>
                      <div className="text-right">
                        <Text className={`font-bold ${
                          result.compressionRatio > 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {result.compressionRatio > 0 ? '-' : '+'}{Math.abs(result.compressionRatio).toFixed(1)}%
                        </Text>
                        <br />
                        <Tag color={result.compressionRatio > 0 ? 'green' : 'red'}>
                          <FormattedMessage id="tools.pdfCompressor.results.savings" />
                        </Tag>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        icon={<DownloadOutlined />}
                        onClick={() => downloadResult(result)}
                        type="primary"
                      >
                        <FormattedMessage id="tools.pdfCompressor.actions.download" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
}