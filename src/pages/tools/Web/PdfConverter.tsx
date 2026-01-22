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
  Modal,
  Image
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileTextOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { jsPDF } from "jspdf";

const { Title, Text, Paragraph } = Typography;

interface ConversionResult {
  url: string;
  filename: string;
  size: number;
  type: 'image' | 'text';
}

export default function PdfConverter() {
  const intl = useIntl();
  const [files, setFiles] = useState<File[]>([]);
  const [conversionType, setConversionType] = useState<'pdf_to_image' | 'pdf_to_text'>('pdf_to_image');
  const [imageFormat, setImageFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [imageQuality, setImageQuality] = useState<'high' | 'medium' | 'low'>('high');
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pdfjsLib, setPdfjsLib] = useState<Record<string, any> | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isFileModalVisible, setIsFileModalVisible] = useState(false);
  const [currentFileUrl, setCurrentFileUrl] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);

  // 确保只在客户端运行
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 动态导入PDF.js
  useEffect(() => {
    if (!isClient) return;

    const loadPDFJS = async () => {
      try {
        const pdfjsModule = await import('pdfjs-dist');
        (pdfjsModule as Record<string, any>).GlobalWorkerOptions.workerSrc = '/lib/pdfjs-dist/pdf.worker.min.mjs';
        setPdfjsLib(pdfjsModule);
      } catch (error) {
        console.error('Failed to load PDF.js:', error);
        setError(intl.formatMessage({ id: 'tools.pdfConverter.errors.loading_failed' }));
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

  // PDF转图片功能
  const convertPDFToImages = async (pdfFile: File): Promise<ConversionResult[]> => {
    if (!pdfjsLib) {
      throw new Error(intl.formatMessage({ id: 'tools.pdfConverter.errors.pdfjs_not_loaded' }));
    }

    const arrayBuffer = await pdfFile.arrayBuffer();
    const results: ConversionResult[] = [];

    try {
      // 使用本地PDF.js来加载和渲染PDF
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        // 获取页面
        const page = await pdf.getPage(pageNum);
        
        // 设置渲染比例
        const scale = 2.0; // 提高分辨率
        const viewport = page.getViewport({ scale });

        // 创建canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // 渲染页面到canvas
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        };

        await page.render(renderContext).promise;

        // 转换canvas为图片
        const quality = imageQuality === 'high' ? 1.0 : imageQuality === 'medium' ? 0.7 : 0.5;
        const mimeType = imageFormat === 'png' ? 'image/png' : imageFormat === 'jpeg' ? 'image/jpeg' : 'image/webp';
        
        // 等待canvas转换为blob
        const blob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob);
          }, mimeType, quality);
        });

        if (blob) {
          const url = URL.createObjectURL(blob);
          const filename = `${pdfFile.name.replace('.pdf', '')}_page_${pageNum}.${imageFormat}`;
          results.push({
            url,
            filename,
            size: blob.size,
            type: 'image'
          });
        }
      }

      return results;
    } catch (error) {
      console.error('PDF conversion error:', error);
      throw new Error(intl.formatMessage({ id: 'tools.pdfConverter.errors.conversion_failed' }));
    }
  };

  const startConversion = useCallback(async () => {
    if (files.length === 0) {
      setError(intl.formatMessage({ id: 'tools.pdfConverter.errors.no_file' }));
      return;
    }

    if (!pdfjsLib) {
      setError(intl.formatMessage({ id: 'tools.pdfConverter.errors.pdfjs_not_loaded' }));
      return;
    }

    // 滚动到页面顶部，确保用户能看到进度
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setIsConverting(true);
    setProgress(0);
    setError(null);
    setResults([]);

    try {
      const conversionResults: ConversionResult[] = [];

      if (conversionType === 'pdf_to_image') {
        // 只处理PDF文件
        const pdfFiles = files.filter(file => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'));
        if (pdfFiles.length === 0) {
          setError(intl.formatMessage({ id: 'tools.pdfConverter.errors.pdf_required' }));
          return;
        }

        for (let i = 0; i < pdfFiles.length; i++) {
          setProgress((i / pdfFiles.length) * 100);
          const results = await convertPDFToImages(pdfFiles[i]);
          conversionResults.push(...results);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } else if (conversionType === 'pdf_to_text') {
        // PDF转文本功能 - 直接跳转到文件转Markdown工具
        window.open('https://www.jisuxiang.com/tools/fileToMarkdownConverter', '_blank');
        return;
      }

      setProgress(100);
      setResults(conversionResults);
      
      // 转换完成后滚动到结果区域
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    } catch (err) {
      console.error('Conversion error:', err);
      setError(intl.formatMessage({ id: 'tools.pdfConverter.errors.conversion_failed' }));
    } finally {
      setIsConverting(false);
    }
  }, [files, conversionType, imageFormat, imageQuality, intl, pdfjsLib]);

  const downloadResult = useCallback((result: ConversionResult) => {
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

  const showFilePreview = (url: string) => {
    setCurrentFileUrl(url);
    setIsFileModalVisible(true);
  };

  // 如果不在客户端，显示加载状态
  if (!isClient) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">
            <FormattedMessage id="tools.pdfConverter.loading" />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <Title level={2}>
        <FormattedMessage id="tools.pdfConverter.title" />
      </Title>
      <Paragraph className="text-gray-500 dark:text-gray-400 mb-6">
        <FormattedMessage id="tools.pdfConverter.description" />
      </Paragraph>

      <Card>
        <Space orientation="vertical" size="large" className="w-full">
          {/* 转换类型选择 */}
          <div>
            <Text strong className="block mb-3">
              <FormattedMessage id="tools.pdfConverter.conversion_type" />
            </Text>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(['pdf_to_image', 'pdf_to_text'] as const).map((type) => (
                <Button
                  key={type}
                  type={conversionType === type ? 'primary' : 'default'}
                  icon={type === 'pdf_to_image' ? <FileImageOutlined /> : <FileTextOutlined />}
                  onClick={() => setConversionType(type)}
                  block
                >
                  {type === 'pdf_to_image' 
                    ? <FormattedMessage id="tools.pdfConverter.pdf_to_image" /> 
                    : <FormattedMessage id="tools.pdfConverter.pdf_to_text" />}
                </Button>
              ))}
            </div>
          </div>

          {/* PDF转文本提示 */}
          {conversionType === 'pdf_to_text' && (
            <Alert
              message={<FormattedMessage id="tools.pdfConverter.text_recommendation.title" />}
              description={
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mb-1">
                      <FormattedMessage id="tools.pdfConverter.text_recommendation.description" />
                    </p>
                    <Button
                      type="link"
                      href="https://www.jisuxiang.com/tools/fileToMarkdownConverter"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-0"
                    >
                      <FormattedMessage id="tools.pdfConverter.text_recommendation.button" />
                    </Button>
                  </div>
                </div>
              }
              type="info"
              showIcon
            />
          )}

          {/* 转换设置 */}
          {conversionType === 'pdf_to_image' && (
            <div>
              <Text strong className="block mb-3">
                <FormattedMessage id="tools.pdfConverter.settings" />
              </Text>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <div>
                    <Text className="block mb-2">
                      <FormattedMessage id="tools.pdfConverter.image_format" />
                    </Text>
                    <Select
                      value={imageFormat}
                      onChange={(value) => setImageFormat(value as 'png' | 'jpeg' | 'webp')}
                      className="w-full"
                      options={[
                        { value: 'png', label: 'PNG' },
                        { value: 'jpeg', label: 'JPEG' },
                        { value: 'webp', label: 'WebP' }
                      ]}
                    />
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div>
                    <Text className="block mb-2">
                      <FormattedMessage id="tools.pdfConverter.image_quality" />
                    </Text>
                    <Select
                      value={imageQuality}
                      onChange={(value) => setImageQuality(value as 'high' | 'medium' | 'low')}
                      className="w-full"
                      options={[
                        { value: 'high', label: intl.formatMessage({ id: 'tools.pdfConverter.quality.high' }) },
                        { value: 'medium', label: intl.formatMessage({ id: 'tools.pdfConverter.quality.medium' }) },
                        { value: 'low', label: intl.formatMessage({ id: 'tools.pdfConverter.quality.low' }) }
                      ]}
                    />
                  </div>
                </Col>
              </Row>
            </div>
          )}

          {/* 文件上传 - 在PDF转文本时隐藏 */}
          {conversionType !== 'pdf_to_text' && (
            <div>
              <Text strong className="block mb-3">
                <FormattedMessage id="tools.pdfConverter.upload_files" />
              </Text>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <FilePdfOutlined className="text-4xl text-red-500 mb-3" />
                <p className="text-lg mb-2">
                  <FormattedMessage id="tools.pdfConverter.upload.title" />
                </p>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  <FormattedMessage id="tools.pdfConverter.upload.subtitle" />
                </p>
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload">
                  <Button
                    icon={<UploadOutlined />}
                    size="large"
                    className="mb-2"
                  >
                    <FormattedMessage id="tools.pdfConverter.upload.button" />
                  </Button>
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <FormattedMessage id="tools.pdfConverter.upload.max_size" />
                </p>
              </div>
              
              {files.length > 0 && (
                <div className="mt-4">
                  <Text strong>
                    <FormattedMessage id="tools.pdfConverter.selected_files" /> ({files.length})
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
          )}

          {/* 错误提示 */}
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
            />
          )}

          {/* 操作按钮 */}
          {files.length > 0 && !isConverting && conversionType !== 'pdf_to_text' && (
            <div className="flex flex-wrap gap-3">
              <Button
                type="primary"
                icon={isConverting ? <LoadingOutlined /> : undefined}
                onClick={startConversion}
                disabled={files.length === 0 || !pdfjsLib}
                loading={isConverting}
                size="large"
              >
                <FormattedMessage id="tools.pdfConverter.start_conversion" />
              </Button>
              <Button
                onClick={clearAll}
                danger
                size="large"
              >
                <FormattedMessage id="tools.pdfConverter.clear_all" />
              </Button>
            </div>
          )}

          {/* 转换进度 */}
          {isConverting && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <Text strong>
                  <FormattedMessage id="tools.pdfConverter.converting" />
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

          {/* 转换结果 */}
          {results.length > 0 && (
            <div ref={resultsRef}>
              <Divider>
                <FormattedMessage id="tools.pdfConverter.results" />
              </Divider>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileImageOutlined className="text-green-500 text-lg" />
                      <div>
                        <Text className="block">{result.filename}</Text>
                        <Text type="secondary" className="text-sm">
                          {formatFileSize(result.size)}
                        </Text>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        icon={<DownloadOutlined />}
                        onClick={() => downloadResult(result)}
                        type="primary"
                      >
                        <FormattedMessage id="tools.pdfConverter.download" />
                      </Button>
                      {result.type === 'image' && (
                        <Button
                          onClick={() => showFilePreview(result.url)}
                        >
                          <FormattedMessage id="tools.pdfConverter.preview" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Space>
      </Card>

      {/* 文件预览模态框 */}
      <Modal
        open={isFileModalVisible}
        footer={null}
        onCancel={() => setIsFileModalVisible(false)}
        width="80%"
        bodyStyle={{ padding: 0 }}
      >
        <Image
          src={currentFileUrl}
          alt="Preview"
          width="100%"
          height="auto"
          preview={false}
        />
      </Modal>
    </div>
  );
}