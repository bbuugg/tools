import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Card,
  Typography,
  Space,
  Row,
  Col,
  Button,
  Input,
  Alert,
  Divider,
  InputNumber,
  Tag
} from 'antd';
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  MergeOutlined,
  ScissorOutlined,
  DragOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';

const { Title, Text, Paragraph } = Typography;

interface PDFFile {
  file: File;
  url: string;
  size: number;
  pages?: number;
}

interface SplitRange {
  start: number;
  end: number;
  id: string;
}

type OperationMode = 'merge' | 'split';

export default function PdfManager() {
  const intl = useIntl();
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [operationMode, setOperationMode] = useState<OperationMode>('merge');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ url: string; filename: string; size: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pdfLib, setPdfLib] = useState<Record<string, any> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  // 分割模式状态
  const [splitMethod, setSplitMethod] = useState<'single_pages' | 'custom_ranges' | 'equal_parts'>('single_pages');
  const [customRanges, setCustomRanges] = useState<SplitRange[]>([]);
  const [customRangeInput, setCustomRangeInput] = useState('');
  const [partsCount, setPartsCount] = useState(2);

  // 合并模式状态
  const [outputName, setOutputName] = useState('merged_document.pdf');

  // 确保只在客户端运行
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 动态导入pdf-lib
  useEffect(() => {
    if (!isClient) return;

    const loadPdfLib = async () => {
      try {
        const pdfLibModule = await import('pdf-lib');
        setPdfLib(pdfLibModule);
      } catch (error) {
        console.error('Failed to load pdf-lib:', error);
        setError(intl.formatMessage({ id: 'tools.pdfManager.errors.loading_failed' }));
      }
    };

    loadPdfLib();
  }, [isClient, intl]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const pdfFiles = Array.from(selectedFiles).filter(file => 
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      );
      
      const totalSize = pdfFiles.reduce((sum, file) => sum + file.size, 0);
      
      if (totalSize > (operationMode === 'merge' ? 500 * 1024 * 1024 : 100 * 1024 * 1024)) {
        setError(intl.formatMessage({ id: 'tools.pdfManager.errors.file_too_large' }));
        return;
      }

      const newFiles: PDFFile[] = pdfFiles.map(file => ({
        file,
        url: URL.createObjectURL(file),
        size: file.size
      }));

      setFiles(newFiles);
      setError(null);
    }
  }, [operationMode, intl]);

  const removeFile = useCallback((index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  }, [files]);

  // 解析自定义范围输入
  const parseCustomRanges = useCallback((input: string): SplitRange[] => {
    const ranges: SplitRange[] = [];
    const parts = input.split(',').map(p => p.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          ranges.push({
            start,
            end,
            id: `${start}-${end}`
          });
        }
      } else {
        const page = parseInt(part);
        if (!isNaN(page)) {
          ranges.push({
            start: page,
            end: page,
            id: `${page}`
          });
        }
      }
    }
    
    return ranges;
  }, []);

  const addCustomRange = useCallback(() => {
    if (!customRangeInput.trim()) return;
    
    const newRanges = parseCustomRanges(customRangeInput);
    setCustomRanges(prev => [...prev, ...newRanges]);
    setCustomRangeInput('');
  }, [customRangeInput, parseCustomRanges]);

  const removeCustomRange = useCallback((id: string) => {
    setCustomRanges(prev => prev.filter(range => range.id !== id));
  }, []);

  // 重置所有状态到初始值
  const resetState = useCallback(() => {
    setFiles([]);
    setResults([]);
    setError(null);
    setProgress(0);
    setCustomRanges([]);
    setCustomRangeInput('');
    setOutputName('merged_document.pdf');
    setSplitMethod('single_pages');
    setPartsCount(2);
  }, []);

  // 切换操作模式时重置状态
  const handleOperationModeChange = useCallback((mode: OperationMode) => {
    setOperationMode(mode);
    resetState();
  }, [resetState]);

  const startOperation = useCallback(async () => {
    if (!pdfLib) {
      setError(intl.formatMessage({ id: 'tools.pdfManager.errors.library_not_loaded' }));
      return;
    }

    if (files.length === 0) {
      setError(intl.formatMessage({ id: 'tools.pdfManager.errors.no_files' }));
      return;
    }

    // 滚动到页面顶部，确保用户能看到进度
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      if (operationMode === 'merge') {
        await performMerge();
      } else if (operationMode === 'split') {
        await performSplit();
      }
      
      // 操作完成后自动滚动到结果区域
      setTimeout(() => {
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
      }, 100);
    } catch (err) {
      console.error('PDF operation error:', err);
      setError(err instanceof Error ? err.message : intl.formatMessage({ id: 'tools.pdfManager.errors.operation_failed' }));
    } finally {
      setIsProcessing(false);
    }
  }, [files, operationMode, splitMethod, customRanges, partsCount, outputName, pdfLib, intl]);

  const performMerge = useCallback(async () => {
    if (files.length < 2) {
      throw new Error(intl.formatMessage({ id: 'tools.pdfManager.errors.need_at_least_two' }));
    }

    // 创建新的PDF文档
    const { PDFDocument } = pdfLib as any;
    const mergedPdf = await PDFDocument.create();
    setProgress(20);

    // 合并所有PDF文件
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const arrayBuffer = await file.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        
        // 复制所有页面到合并文档
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page: any) => mergedPdf.addPage(page));
        
        setProgress(20 + (i + 1) * (60 / files.length));
      } catch {
        throw new Error(`处理文件失败: ${file.file.name}。请确保是有效的PDF文件。`);
      }
    }

    setProgress(80);

    // 生成合并后的PDF
    const mergedPdfBytes = await mergedPdf.save();
    setProgress(100);

    // 创建Blob并生成下载链接
    const mergedPdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    
    const result = {
      url: URL.createObjectURL(mergedPdfBlob),
      filename: outputName,
      size: mergedPdfBlob.size
    };

    setResults([result]);
  }, [files, outputName, pdfLib, intl]);

  const performSplit = useCallback(async () => {
    if (files.length === 0) {
      throw new Error(intl.formatMessage({ id: 'tools.pdfManager.errors.no_files' }));
    }

    const file = files[0];
    const arrayBuffer = await file.file.arrayBuffer();
    const { PDFDocument } = pdfLib as any;
    const pdf = await PDFDocument.load(arrayBuffer);
    const pageCount = pdf.getPageCount();

    setProgress(20);

    const splitResults: { url: string; filename: string; size: number }[] = [];

    if (splitMethod === 'single_pages') {
      // 单页分割
      for (let i = 0; i < pageCount; i++) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(pdf, [i]);
        newPdf.addPage(page);
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        splitResults.push({
          url: URL.createObjectURL(blob),
          filename: `${file.file.name.replace('.pdf', '')}_page_${i + 1}.pdf`,
          size: blob.size
        });
        
        setProgress(20 + (i + 1) * (60 / pageCount));
      }
    } else if (splitMethod === 'custom_ranges') {
      // 自定义范围分割
      const ranges = customRanges.length > 0 ? customRanges : [{ start: 1, end: pageCount, id: 'default' }];
      
      for (let i = 0; i < ranges.length; i++) {
        const range = ranges[i];
        if (range.start < 1 || range.end > pageCount || range.start > range.end) {
          throw new Error(intl.formatMessage({ id: 'tools.pdfManager.errors.range_out_of_bounds' }));
        }

        const newPdf = await PDFDocument.create();
        const pageIndices = Array.from({ length: range.end - range.start + 1 }, (_, j) => range.start - 1 + j);
        const pages = await newPdf.copyPages(pdf, pageIndices);
        pages.forEach((page: any) => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        splitResults.push({
          url: URL.createObjectURL(blob),
          filename: `${file.file.name.replace('.pdf', '')}_${range.start}-${range.end}.pdf`,
          size: blob.size
        });
        
        setProgress(20 + (i + 1) * (60 / ranges.length));
      }
    } else if (splitMethod === 'equal_parts') {
      // 等分分割
      if (partsCount < 2) {
        throw new Error(intl.formatMessage({ id: 'tools.pdfManager.errors.invalid_parts_count' }));
      }

      const pagesPerPart = Math.ceil(pageCount / partsCount);
      
      for (let i = 0; i < partsCount; i++) {
        const startPage = i * pagesPerPart + 1;
        const endPage = Math.min((i + 1) * pagesPerPart, pageCount);
        
        if (startPage > pageCount) break;

        const newPdf = await PDFDocument.create();
        const pageIndices = Array.from({ length: endPage - startPage + 1 }, (_, j) => startPage - 1 + j);
        const pages = await newPdf.copyPages(pdf, pageIndices);
        pages.forEach((page: any) => newPdf.addPage(page));
        
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        splitResults.push({
          url: URL.createObjectURL(blob),
          filename: `${file.file.name.replace('.pdf', '')}_part_${i + 1}.pdf`,
          size: blob.size
        });
        
        setProgress(20 + (i + 1) * (60 / partsCount));
      }
    }

    setProgress(100);
    setResults(splitResults);
  }, [files, splitMethod, customRanges, partsCount, pdfLib, intl]);

  const downloadResult = useCallback((result: { url: string; filename: string; size: number }) => {
    const link = document.createElement('a');
    link.href = result.url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const downloadAllResults = useCallback(() => {
    results.forEach(result => downloadResult(result));
  }, [results, downloadResult]);

  const clearAll = useCallback(() => {
    files.forEach(file => URL.revokeObjectURL(file.url));
    results.forEach(result => URL.revokeObjectURL(result.url));
    setFiles([]);
    setResults([]);
    setError(null);
    setProgress(0);
    setCustomRanges([]);
    setCustomRangeInput('');
  }, [files, results]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  // 如果不在客户端，显示加载状态
  if (!isClient) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">
            <FormattedMessage id="tools.pdfManager.loading" />
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <Title level={2}>
        <FormattedMessage id="tools.pdfManager.title" />
      </Title>
      <Paragraph className="text-gray-500 dark:text-gray-400 mb-6">
        <FormattedMessage id="tools.pdfManager.description" />
      </Paragraph>

      <Card>
        <Space orientation="vertical" size="large" className="w-full">
          {/* 操作模式选择 */}
          <div>
            <Text strong className="block mb-3">
              <FormattedMessage id="tools.pdfManager.operation_mode.title" />
            </Text>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Button
                  type={operationMode === 'merge' ? 'primary' : 'default'}
                  icon={<MergeOutlined />}
                  onClick={() => handleOperationModeChange('merge')}
                  block
                >
                  <FormattedMessage id="tools.pdfManager.operation_mode.merge" />
                </Button>
              </Col>
              <Col xs={24} md={12}>
                <Button
                  type={operationMode === 'split' ? 'primary' : 'default'}
                  icon={<ScissorOutlined />}
                  onClick={() => handleOperationModeChange('split')}
                  block
                >
                  <FormattedMessage id="tools.pdfManager.operation_mode.split" />
                </Button>
              </Col>
            </Row>
          </div>

          {/* 文件上传 */}
          <div>
            <Text strong className="block mb-3">
              <FormattedMessage id="tools.pdfManager.upload_area.title" />
            </Text>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <FilePdfOutlined className="text-4xl text-red-500 mb-3" />
              <p className="text-lg mb-2">
                <FormattedMessage id="tools.pdfManager.upload_area.title" />
              </p>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                <FormattedMessage id="tools.pdfManager.upload_area.subtitle" />
              </p>
              <input
                type="file"
                accept=".pdf"
                multiple={operationMode === 'merge'}
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
                  <FormattedMessage id="tools.pdfManager.upload_area.button" />
                </Button>
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {operationMode === 'merge' 
                  ? <FormattedMessage id="tools.pdfManager.upload_area.merge_limit" />
                  : <FormattedMessage id="tools.pdfManager.upload_area.split_limit" />}
              </p>
            </div>
            
            {files.length > 0 && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-3">
                  <Text strong>
                    <FormattedMessage id="tools.pdfManager.file_list.title" /> ({files.length})
                  </Text>
                  <Text type="secondary">
                    <FormattedMessage id="tools.pdfManager.file_list.total_size" />: {formatFileSize(totalSize)}
                  </Text>
                </div>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <DragOutlined className="text-gray-400" />
                        <div>
                          <Text className="block">{file.file.name}</Text>
                          <Text type="secondary" className="text-sm">
                            {formatFileSize(file.size)}
                          </Text>
                        </div>
                      </div>
                      <Button
                        icon={<DeleteOutlined />}
                        danger
                        size="small"
                        onClick={() => removeFile(index)}
                      />
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

          {/* 操作设置 */}
          {files.length > 0 && (
            <div>
              {operationMode === 'merge' && (
                <div>
                  <Text strong className="block mb-3">
                    <FormattedMessage id="tools.pdfManager.merge_mode.title" />
                  </Text>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <div>
                        <Text className="block mb-2">
                          <FormattedMessage id="tools.pdfManager.merge_mode.output_name" />
                        </Text>
                        <Input
                          value={outputName}
                          onChange={(e) => setOutputName(e.target.value)}
                          placeholder={intl.formatMessage({ id: 'tools.pdfManager.merge_mode.output_name_placeholder' })}
                        />
                      </div>
                    </Col>
                  </Row>
                </div>
              )}

              {operationMode === 'split' && (
                <div>
                  <Text strong className="block mb-3">
                    <FormattedMessage id="tools.pdfManager.split_mode.title" />
                  </Text>
                  
                  {/* 分割方式选择 */}
                  <div className="mb-4">
                    <Text className="block mb-2">
                      <FormattedMessage id="tools.pdfManager.split_mode.split_method" />
                    </Text>
                    <Row gutter={[16, 16]}>
                      {(['single_pages', 'custom_ranges', 'equal_parts'] as const).map((method) => (
                        <Col xs={24} sm={8} key={method}>
                          <Button
                            type={splitMethod === method ? 'primary' : 'default'}
                            onClick={() => setSplitMethod(method)}
                            block
                          >
                            <FormattedMessage id={`tools.pdfManager.split_methods.${method}`} />
                          </Button>
                        </Col>
                      ))}
                    </Row>
                  </div>

                  {/* 单页分割设置 */}
                  {splitMethod === 'single_pages' && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-4">
                      <Text>
                        <FormattedMessage id="tools.pdfManager.split_methods.single_pages_description" />
                      </Text>
                    </div>
                  )}

                  {/* 自定义范围设置 */}
                  {splitMethod === 'custom_ranges' && (
                    <div className="space-y-4 mb-4">
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <Text className="block mb-2">
                          <FormattedMessage id="tools.pdfManager.custom_ranges.title" />
                        </Text>
                        <Row gutter={[8, 8]}>
                          <Col xs={24} sm={16}>
                            <Input
                              value={customRangeInput}
                              onChange={(e) => setCustomRangeInput(e.target.value)}
                              placeholder={intl.formatMessage({ id: 'tools.pdfManager.custom_ranges.placeholder' })}
                              onPressEnter={addCustomRange}
                            />
                          </Col>
                          <Col xs={24} sm={8}>
                            <Button
                              type="primary"
                              onClick={addCustomRange}
                              block
                            >
                              <FormattedMessage id="tools.pdfManager.custom_ranges.add_range" />
                            </Button>
                          </Col>
                        </Row>
                        <Text type="secondary" className="text-sm mt-2 block">
                          <FormattedMessage id="tools.pdfManager.custom_ranges.range_format" />
                        </Text>
                      </div>

                      {customRanges.length > 0 && (
                        <div className="space-y-2">
                          {customRanges.map((range) => (
                            <div key={range.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <Tag color="blue">
                                {range.start === range.end 
                                  ? intl.formatMessage({ id: 'tools.pdfManager.custom_ranges.single_page' }).replace('{page}', range.start.toString())
                                  : intl.formatMessage({ id: 'tools.pdfManager.custom_ranges.page_range' }).replace('{start}', range.start.toString()).replace('{end}', range.end.toString())
                                }
                              </Tag>
                              <Button
                                icon={<DeleteOutlined />}
                                danger
                                size="small"
                                onClick={() => removeCustomRange(range.id)}
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* 等分分割设置 */}
                  {splitMethod === 'equal_parts' && (
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-4">
                      <Text className="block mb-2">
                        <FormattedMessage id="tools.pdfManager.equal_parts.parts_count" />
                      </Text>
                      <InputNumber
                        min={2}
                        max={100}
                        value={partsCount}
                        onChange={(value) => setPartsCount(value || 2)}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 处理进度 */}
          {isProcessing && (
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <Text strong>
                  {operationMode === 'merge' 
                    ? <FormattedMessage id="tools.pdfManager.status.merging" />
                    : <FormattedMessage id="tools.pdfManager.status.splitting" />}
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
          {files.length > 0 && !isProcessing && (
            <div className="flex flex-wrap gap-3">
              <Button
                type="primary"
                icon={isProcessing ? <LoadingOutlined /> : undefined}
                onClick={startOperation}
                disabled={files.length === 0}
                loading={isProcessing}
                size="large"
              >
                {operationMode === 'merge' 
                  ? <FormattedMessage id="tools.pdfManager.actions.merge" />
                  : <FormattedMessage id="tools.pdfManager.actions.split" />}
              </Button>
              <Button
                onClick={clearAll}
                danger
                size="large"
              >
                <FormattedMessage id="tools.pdfManager.actions.clear" />
              </Button>
            </div>
          )}

          {/* 操作结果 */}
          {results.length > 0 && (
            <div ref={resultsRef}>
              <Divider>
                <FormattedMessage id="tools.pdfManager.results.title" />
              </Divider>
              <div className="mb-4">
                <Text strong className="block mb-3">
                  <FormattedMessage id="tools.pdfManager.results.files_count" />: {results.length}
                </Text>
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div>
                        <Text className="block">{result.filename}</Text>
                        <Text type="secondary" className="text-sm">
                          {formatFileSize(result.size)}
                        </Text>
                      </div>
                      <Button
                        icon={<DownloadOutlined />}
                        onClick={() => downloadResult(result)}
                        type="primary"
                      >
                        <FormattedMessage id="tools.pdfManager.actions.download" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {results.length > 1 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={downloadAllResults}
                      type="primary"
                    >
                      <FormattedMessage id="tools.pdfManager.results.download_all" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Space>
      </Card>
    </div>
  );
}