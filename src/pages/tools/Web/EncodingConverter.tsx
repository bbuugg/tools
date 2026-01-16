import React, { useState, useEffect } from 'react';
import {
  Card,
  Typography,
  Space,
  Row,
  Col,
  Button,
  Input,
  Alert,
  Tooltip
} from 'antd';
import {
  SwapOutlined,
  CopyOutlined,
  CheckOutlined,
  ClearOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';

const { Title, Text, Paragraph } = Typography;

export default function EncodingConverter() {
  const intl = useIntl();
  
  // 编码类型选项
  const encodingTypes = [
    { id: 'base64', name: intl.formatMessage({ id: 'tools.encodingConverter.types.base64' }), description: intl.formatMessage({ id: 'tools.encodingConverter.base64_desc' }) },
    { id: 'url', name: intl.formatMessage({ id: 'tools.encodingConverter.types.url' }), description: intl.formatMessage({ id: 'tools.encodingConverter.url_desc' }) },
    { id: 'unicode', name: intl.formatMessage({ id: 'tools.encodingConverter.types.unicode' }), description: intl.formatMessage({ id: 'tools.encodingConverter.unicode_desc' }) },
    { id: 'html_entity', name: intl.formatMessage({ id: 'tools.encodingConverter.types.html_entity' }), description: intl.formatMessage({ id: 'tools.encodingConverter.html_entity_desc' }) },
    { id: 'html_escape', name: intl.formatMessage({ id: 'tools.encodingConverter.types.html_escape' }), description: intl.formatMessage({ id: 'tools.encodingConverter.html_escape_desc' }) }
  ];
  
  // 状态管理
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [encodingType, setEncodingType] = useState('base64');
  const [operation, setOperation] = useState<'encode' | 'decode'>('encode');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  // 当输入文本、编码类型或操作变化时，自动执行转换
  useEffect(() => {
    if (inputText.trim() === '') {
      setOutputText('');
      setError('');
      return;
    }
    
    try {
      const result = processConversion(inputText, encodingType, operation);
      setOutputText(result);
      setError('');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(intl.formatMessage({ id: 'tools.encodingConverter.general_error' }));
      }
      setOutputText('');
    }
  }, [inputText, encodingType, operation, intl]);
  
  // 执行编码或解码操作
  const processConversion = (text: string, type: string, op: string): string => {
    if (text.trim() === '') return '';
    
    try {
      if (type === 'base64') {
        return op === 'encode' 
          ? btoa(encodeURIComponent(text).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))
          : decodeURIComponent(Array.from(atob(text.replace(/\s/g, '')))
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join(''));
      } 
      else if (type === 'url') {
        return op === 'encode' 
          ? encodeURIComponent(text)
          : decodeURIComponent(text);
      }
      else if (type === 'unicode') {
        if (op === 'encode') {
          return Array.from(text)
            .map(char => '\\u' + char.charCodeAt(0).toString(16).padStart(4, '0'))
            .join('');
        } else {
          return text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => 
            String.fromCharCode(parseInt(hex, 16))
          );
        }
      }
      else if (type === 'html_entity') {
        if (op === 'encode') {
          // 将文本转换为HTML十六进制实体格式 (&#x6C49;)
          return Array.from(text)
            .map(char => {
              const codePoint = char.codePointAt(0) as number;
              return '&#x' + codePoint.toString(16).toLowerCase() + ';';
            })
            .join('');
        } else {
          // 将HTML十六进制实体格式转换回文本
          // 正则表达式匹配 &#xXXXX; 格式的十六进制值
          return text.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => 
            String.fromCodePoint(parseInt(hex, 16))
          );
        }
      }
      else if (type === 'html_escape') {
        if (op === 'encode') {
          const el = document.createElement('div');
          el.textContent = text;
          return el.innerHTML;
        } else {
          const el = document.createElement('div');
          el.innerHTML = text;
          return el.textContent || '';
        }
      }
      
      throw new Error(intl.formatMessage({ id: 'tools.encodingConverter.unsupported_type' }));
    } catch (err) {
      if (type === 'base64' && op === 'decode') {
        throw new Error(intl.formatMessage({ id: 'tools.encodingConverter.invalid_base64' }));
      } else if (type === 'url' && op === 'decode') {
        throw new Error(intl.formatMessage({ id: 'tools.encodingConverter.invalid_url' }));
      } else if (type === 'unicode' && op === 'decode') {
        throw new Error(intl.formatMessage({ id: 'tools.encodingConverter.invalid_unicode' }));
      } else if (type === 'html_entity' && op === 'decode') {
        throw new Error(intl.formatMessage({ id: 'tools.encodingConverter.invalid_html_entity' }));
      } else if (type === 'html_escape' && op === 'decode') {
        throw new Error(intl.formatMessage({ id: 'tools.encodingConverter.invalid_html_escape' }));
      }
      throw err;
    }
  };
  
  // 复制输出内容到剪贴板
  const copyToClipboard = () => {
    if (!outputText) return;
    
    navigator.clipboard.writeText(outputText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error(intl.formatMessage({ id: 'tools.encodingConverter.copy_failed' }), err);
        setError(intl.formatMessage({ id: 'tools.encodingConverter.clipboard_error' }));
      });
  };
  
  // 清空输入和输出
  const clearAll = () => {
    setInputText('');
    setOutputText('');
    setError('');
  };
  
  // 切换操作类型（编码/解码）
  const toggleOperation = () => {
    // 交换输入和输出文本
    const newOperation = operation === 'encode' ? 'decode' : 'encode';
    // 使用输出文本替换输入文本
    setInputText(outputText);
    setOperation(newOperation);
    setError('');
  };
  
  // 加载示例文本
  const loadExample = () => {
    type ExampleMap = {
      [key: string]: {
        encode: string;
        decode: string;
      };
    };
    
    const examples: ExampleMap = {
      base64: {
        encode: intl.formatMessage({ id: 'tools.encodingConverter.example_text' }), 
        decode: '5L2g5aW977yM5LiW55WM77yB'
      },
      url: {
        encode: 'https://jisuxiang.com?query=' + intl.formatMessage({ id: 'tools.encodingConverter.hello' }) + '&lang=zh-CN',
        decode: 'https%3A%2F%2Fjisuxiang.com%3Fquery%3D%E4%BD%A0%E5%A5%BD%26lang%3Dzh-CN'
      },
      unicode: {
        encode: intl.formatMessage({ id: 'tools.encodingConverter.example_text' }),
        decode: '\\u4f60\\u597d\\uff0c\\u4e16\\u754c\\uff01'
      },
      html_entity: {
        encode: intl.formatMessage({ id: 'tools.encodingConverter.example_text' }),
        decode: '&#x4f60;&#x597d;&#xff0c;&#x4e16;&#x754c;&#xff01;'
      },
      html_escape: {
        encode: '<div class="example">' + intl.formatMessage({ id: 'tools.encodingConverter.html_example' }) + '</div>',
        decode: '&lt;div class=&quot;example&quot;&gt;HTML示例 &amp; 特殊字符&lt;/div&gt;'
      }
    };
    
    // 根据当前编码类型和操作选择示例
    const exampleText = examples[encodingType][operation];
    setInputText(exampleText);
  };
  
  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <Title level={2}>
        <FormattedMessage id="tools.encodingConverter.name" />
      </Title>
      <Paragraph className="text-gray-500 dark:text-gray-400 mb-6">
        <FormattedMessage id="tools.encodingConverter.description" />
      </Paragraph>

      <Card>
        <Space orientation="vertical" size="large" className="w-full">
          {/* 编码类型选择 */}
          <div>
            <Text strong className="block mb-3">
              <FormattedMessage id="tools.encodingConverter.select_type" />
            </Text>
            <div className="flex flex-wrap gap-2">
              {encodingTypes.map((type) => (
                <Button
                  key={type.id}
                  type={encodingType === type.id ? 'primary' : 'default'}
                  onClick={() => setEncodingType(type.id)}
                >
                  {type.name}
                </Button>
              ))}
            </div>
          </div>
          
          {/* 操作类型切换和描述 */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Button
                  type={operation === 'encode' ? 'primary' : 'default'}
                  onClick={() => setOperation('encode')}
                  className="rounded-r-none"
                >
                  <FormattedMessage id="tools.encodingConverter.encode" />
                </Button>
                <Button
                  type={operation === 'decode' ? 'primary' : 'default'}
                  onClick={() => setOperation('decode')}
                  className="rounded-l-none border-l-0"
                >
                  <FormattedMessage id="tools.encodingConverter.decode" />
                </Button>
              </div>
              
              <Text type="secondary" className="text-sm">
                {encodingTypes.find(type => type.id === encodingType)?.description}
              </Text>
            </div>
            
            <div className="flex gap-2">
              <Tooltip title={<FormattedMessage id="tools.encodingConverter.load_example" />}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadExample}
                >
                  <FormattedMessage id="tools.encodingConverter.example" />
                </Button>
              </Tooltip>
              
              <Tooltip title={<FormattedMessage id="tools.encodingConverter.clear_all" />}>
                <Button
                  icon={<ClearOutlined />}
                  onClick={clearAll}
                  danger
                >
                  <FormattedMessage id="tools.encodingConverter.clear_all" />
                </Button>
              </Tooltip>
            </div>
          </div>
          
          {/* 输入输出区域 */}
          <Row gutter={[24, 24]}>
            {/* 输入框 */}
            <Col xs={24} md={11}>
              <div className="space-y-3">
                <Text strong>
                  {operation === 'encode' ? 
                    <FormattedMessage id="tools.encodingConverter.text_to_encode" /> : 
                    <FormattedMessage id="tools.encodingConverter.text_to_decode" />}
                </Text>
                <Input.TextArea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={intl.formatMessage({ id: 'tools.encodingConverter.input_placeholder' })}
                  rows={10}
                />
              </div>
            </Col>
            
            {/* 操作按钮 */}
            <Col xs={24} md={2} className="flex items-center justify-center">
              <Tooltip title={<FormattedMessage id="tools.encodingConverter.swap_operation" />}>
                <Button
                  icon={<SwapOutlined />}
                  size="large"
                  shape="circle"
                  onClick={toggleOperation}
                  className="text-xl"
                />
              </Tooltip>
            </Col>
            
            {/* 输出框 */}
            <Col xs={24} md={11}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Text strong>
                    {operation === 'encode' ? 
                      <FormattedMessage id="tools.encodingConverter.encoded_result" /> : 
                      <FormattedMessage id="tools.encodingConverter.decoded_result" />}
                  </Text>
                  
                  {outputText && (
                    <Tooltip title={<FormattedMessage id="tools.encodingConverter.copy" />}>
                      <Button
                        icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                        onClick={copyToClipboard}
                      >
                        {copied ? 
                          <FormattedMessage id="common.copySuccess" /> : 
                          <FormattedMessage id="tools.encodingConverter.copy" />}
                      </Button>
                    </Tooltip>
                  )}
                </div>
                
                <Input.TextArea
                  value={outputText}
                  readOnly
                  placeholder={intl.formatMessage({ id: 'tools.encodingConverter.output_placeholder' })}
                  rows={10}
                />
                
                {/* 错误信息 */}
                {error && (
                  <Alert
                    message={error}
                    type="error"
                    showIcon
                  />
                )}
              </div>
            </Col>
          </Row>
          
          {/* 说明部分 */}
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <Text strong className="block mb-2">
              <FormattedMessage id="tools.encodingConverter.encoding_info" />
            </Text>
            <Text className="text-sm">
              {encodingType === 'base64' && (
                <FormattedMessage id="tools.encodingConverter.info.base64" />
              )}
              {encodingType === 'url' && (
                <FormattedMessage id="tools.encodingConverter.info.url" />
              )}
              {encodingType === 'unicode' && (
                <FormattedMessage id="tools.encodingConverter.info.unicode" />
              )}
              {encodingType === 'html_entity' && (
                <FormattedMessage id="tools.encodingConverter.info.html_entity" />
              )}
              {encodingType === 'html_escape' && (
                <FormattedMessage id="tools.encodingConverter.info.html_escape" />
              )}
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
}