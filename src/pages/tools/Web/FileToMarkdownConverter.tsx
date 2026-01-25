import React, { useState, useRef } from 'react';
import {
  Card,
  Button,
  Typography,
  Space,
  Upload,
  Alert,
  Input,
  Tooltip
} from 'antd';
import {
  UploadOutlined,
  FileTextOutlined,
  DownloadOutlined,
  CopyOutlined,
  CheckOutlined,
  DeleteOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { useCopy } from '@/hooks/useCopy';
import { FormattedMessage, useIntl } from 'react-intl';

const { Title, Text } = Typography;



// Supported file formats
const SUPPORTED_FILE_FORMATS = [
  '.docx', '.pdf', '.pptx', '.xlsx', '.html', '.htm', '.rtf', '.txt', '.csv', '.json', '.xml', '.epub', '.md'
];

// File size limit (50MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const FileToMarkdownConverter: React.FC = () => {
  const intl = useIntl();
  const copy = useCopy();

  // State management
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isFileTooLarge, setIsFileTooLarge] = useState(false);

  // Refs
  const markdownTextAreaRef = useRef<HTMLTextAreaElement>(null);

  // Submit file for conversion
  const handleSubmit = async () => {
    if (!file) {
      setError(intl.formatMessage({ id: 'tools.fileToMarkdownConverter.no_file_selected' }));
      return;
    }

    // Set loading state
    setLoading(true);
    setError(null);
    setSuccess(null);
    setMarkdown('');

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Simulate API call (in a real implementation, this would be an actual API call)
      // For now, we'll simulate the conversion process
      setTimeout(() => {
        // This is a simplified example - in reality, you'd make an actual API call
        // const result = await apiClient.uploadFile<ConversionResult>('/api/markdown-convert', file);
        
        // Simulate result
        const result = {
          markdown_content: `# ${file.name}

This is a simulated conversion of ${file.name} to Markdown format.

- File size: ${(file.size / 1024).toFixed(1)} KB
- Conversion time: 0.5 seconds

For actual file conversion, an API endpoint would be called.`,
          conversion_time_seconds: 0.5
        };

        // Update state
        setMarkdown(result.markdown_content);
        setSuccess(
          intl.formatMessage(
            { id: 'tools.fileToMarkdownConverter.conversion_success' },
            { time: result.conversion_time_seconds.toFixed(2) }
          )
        );
        setLoading(false);
      }, 1500);
    } catch (err) {
      console.error(intl.formatMessage({ id: 'tools.fileToMarkdownConverter.conversion_error' }), err);
      setError(err instanceof Error ? err.message : intl.formatMessage({ id: 'tools.fileToMarkdownConverter.conversion_error' }));
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (file: File) => {
    // Check file format
    const fileExtension = file.name.toLowerCase().split('.').pop();
    if (fileExtension === 'doc' || fileExtension === 'ppt' || fileExtension === 'xls') {
      setError(
        intl.formatMessage(
          { id: 'tools.fileToMarkdownConverter.old_office_format' },
          { format: fileExtension }
        )
      );
      setIsFileTooLarge(true); // Use this state to disable conversion button
      return false;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setIsFileTooLarge(true);
      setError(
        intl.formatMessage(
          { id: 'tools.fileToMarkdownConverter.file_too_large' },
          { size: (file.size / (1024 * 1024)).toFixed(2) }
        )
      );
      return false;
    }

    // Reset states
    setMarkdown('');
    setError(null);
    setSuccess(null);
    setCopied(false);
    setIsFileTooLarge(false);

    // Set the selected file
    setFile(file);
    return true;
  };

  // Copy Markdown to clipboard
  const copyToClipboard = () => {
    if (!markdown) return;

    copy(markdown)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error(intl.formatMessage({ id: 'tools.fileToMarkdownConverter.copy_failed' }), err);
        setError(intl.formatMessage({ id: 'tools.fileToMarkdownConverter.copy_failed' }));
      });
  };

  // Download Markdown file
  const downloadMarkdown = () => {
    if (!markdown) return;

    // Create Blob object
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    // Create download link
    const link = document.createElement('a');
    link.href = url;
    // Set filename, extracting base name from original filename
    const originalName = file?.name || 'document';
    const baseName = originalName.split('.').slice(0, -1).join('.') || originalName;
    link.download = `${baseName}.md`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  // Clear selected file and results
  const clearAll = () => {
    setFile(null);
    setMarkdown('');
    setError(null);
    setSuccess(null);
    setCopied(false);
    setIsFileTooLarge(false);
  };

  // Custom upload before function
  const beforeUpload = (file: File) => {
    handleFileChange(file);
    return false; // Prevent automatic upload since we handle it manually
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-8">
        <Title level={1} className="text-white mb-2">
          <FormattedMessage id="tools.fileToMarkdownConverter.name" />
        </Title>
        <Text className="text-slate-400 text-lg">
          <FormattedMessage id="tools.fileToMarkdownConverter.description" />
        </Text>
      </div>

      <Card className="bg-white/5 border-slate-700">
        <div className="space-y-6">
          {/* Info box */}
          <Alert
            message={
              <div>
                <Text className="text-slate-400">
                  <FormattedMessage id="tools.fileToMarkdownConverter.description" />
                </Text>
                <br />
                <Text strong className="text-yellow-400">
                  <FormattedMessage 
                    id="tools.fileToMarkdownConverter.old_office_format" 
                    values={{ format: 'doc/xls/ppt' }} 
                  />
                </Text>
              </div>
            }
            type="info"
            className="bg-slate-800/50 border-slate-700"
          />

          {/* Error message */}
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
            />
          )}

          {/* Success message */}
          {success && (
            <Alert
              message={success}
              type="success"
              showIcon
            />
          )}

          {/* Upload area */}
          <div className="text-center">
            <Upload
              beforeUpload={beforeUpload}
              showUploadList={false}
              accept={SUPPORTED_FILE_FORMATS.join(',')}
              maxCount={1}
              disabled={loading}
            >
              <Button
                type="dashed"
                className="w-full h-48 flex flex-col items-center justify-center border-slate-600 hover:border-purple-500"
                disabled={loading}
              >
                <UploadOutlined className="text-2xl mb-3 text-purple-500" />
                <div className="text-slate-400">
                  {file ? (
                    <FormattedMessage id="tools.fileToMarkdownConverter.select_file" />
                  ) : (
                    <FormattedMessage id="tools.fileToMarkdownConverter.drop_file_here" />
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  <FormattedMessage id="tools.fileToMarkdownConverter.supported_formats" />
                </div>
                <div className="text-xs text-yellow-500 mt-1">
                  <FormattedMessage id="tools.fileToMarkdownConverter.file_too_large" values={{ size: '50' }} />
                </div>
                <div className="text-xs text-yellow-500">
                  <FormattedMessage 
                    id="tools.fileToMarkdownConverter.old_office_format" 
                    values={{ format: 'doc/xls/ppt' }} 
                  />
                </div>
              </Button>
            </Upload>
          </div>

          {/* Selected file info */}
          {file && !isFileTooLarge && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="flex items-center mb-3 sm:mb-0">
                <FileTextOutlined className="text-xl mr-3 text-purple-500" />
                <div>
                  <div className="font-medium text-white">{file.name}</div>
                  <div className="text-sm text-slate-400">
                    <FormattedMessage 
                      id="tools.fileToMarkdownConverter.file_size" 
                      values={{ size: (file.size / 1024).toFixed(1) }} 
                    />
                  </div>
                </div>
              </div>
              <Space>
                <Button
                  type="primary"
                  icon={loading ? <LoadingOutlined /> : <FileTextOutlined />}
                  onClick={handleSubmit}
                  loading={loading}
                  disabled={loading}
                >
                  <FormattedMessage id="tools.fileToMarkdownConverter.convert" />
                </Button>
                <Button
                  icon={<DeleteOutlined />}
                  onClick={clearAll}
                  disabled={loading}
                  danger
                >
                  <FormattedMessage id="tools.fileToMarkdownConverter.clear" />
                </Button>
              </Space>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center p-6 bg-slate-800 rounded-lg">
              <LoadingOutlined className="text-2xl text-purple-500 mb-4" spin />
              <Text className="text-slate-400">
                <FormattedMessage id="tools.fileToMarkdownConverter.converting" />
              </Text>
            </div>
          )}

          {/* Conversion result */}
          {markdown && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <Title level={4} className="text-white !mb-0">
                  <FormattedMessage id="tools.fileToMarkdownConverter.markdown_output" />
                </Title>
                <Space>
                  <Tooltip title={intl.formatMessage({ id: 'tools.fileToMarkdownConverter.copy' })}>
                    <Button
                      icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                      onClick={copyToClipboard}
                    >
                      {copied 
                        ? intl.formatMessage({ id: 'tools.fileToMarkdownConverter.copied' }) 
                        : intl.formatMessage({ id: 'tools.fileToMarkdownConverter.copy' })}
                    </Button>
                  </Tooltip>
                  <Tooltip title={intl.formatMessage({ id: 'tools.fileToMarkdownConverter.download' })}>
                    <Button
                      icon={<DownloadOutlined />}
                      onClick={downloadMarkdown}
                    >
                      <FormattedMessage id="tools.fileToMarkdownConverter.download" />
                    </Button>
                  </Tooltip>
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={clearAll}
                    danger
                  >
                    <FormattedMessage id="tools.fileToMarkdownConverter.clear" />
                  </Button>
                </Space>
              </div>
              
              <Input.TextArea
                ref={markdownTextAreaRef}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                rows={15}
                className="border-slate-700 bg-slate-800 text-white font-mono"
                spellCheck={false}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default FileToMarkdownConverter;