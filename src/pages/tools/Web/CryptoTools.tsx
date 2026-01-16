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
  LockOutlined,
  CopyOutlined,
  CheckOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  ClearOutlined
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import * as CryptoJS from 'crypto-js';

const { Title, Text, Paragraph } = Typography;

// 加密算法类型
type CryptoType = 'md5' | 'sha1' | 'sha256' | 'sha512' | 'aes' | 'base64';

export default function CryptoTools() {
  const intl = useIntl();
  
  // 状态管理
  const [activeAlgorithm, setActiveAlgorithm] = useState<CryptoType>('md5');
  const [inputText, setInputText] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [output, setOutput] = useState('');
  const [isDecoding, setIsDecoding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // 清除状态提示的定时器
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (error || success) {
      timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [error, success]);

  // 当算法更改时，重置解码状态
  useEffect(() => {
    if (!algorithms[activeAlgorithm].isEncodeDecode) {
      setIsDecoding(false);
    }
    setOutput('');
    setError(null);
  }, [activeAlgorithm]);

  // 处理加密或解密操作
  const processOperation = () => {
    setError(null);
    setSuccess(null);
    setOutput('');
    
    if (!inputText.trim()) {
      setError(intl.formatMessage({ id: 'tools.cryptoTools.input_required' }));
      return;
    }
    
    if (algorithms[activeAlgorithm].needsKey && !secretKey.trim()) {
      setError(intl.formatMessage({ id: 'tools.cryptoTools.key_required' }));
      return;
    }
    
    try {
      let result = '';
      
      switch (activeAlgorithm) {
        case 'md5':
          result = CryptoJS.MD5(inputText).toString();
          break;
          
        case 'sha1':
          result = CryptoJS.SHA1(inputText).toString();
          break;
          
        case 'sha256':
          result = CryptoJS.SHA256(inputText).toString();
          break;
          
        case 'sha512':
          result = CryptoJS.SHA512(inputText).toString();
          break;
          
        case 'aes':
          if (isDecoding) {
            // 解密操作
            try {
              const decrypted = CryptoJS.AES.decrypt(inputText, secretKey);
              result = decrypted.toString(CryptoJS.enc.Utf8);
              
              if (!result) {
                throw new Error(intl.formatMessage({ id: 'tools.cryptoTools.decryption_failed' }));
              }
            } catch {
              throw new Error(intl.formatMessage({ id: 'tools.cryptoTools.decryption_failed' }));
            }
          } else {
            // 加密操作
            result = CryptoJS.AES.encrypt(inputText, secretKey).toString();
          }
          break;
          
        case 'base64':
          if (isDecoding) {
            // Base64解码
            try {
              result = CryptoJS.enc.Base64.parse(inputText).toString(CryptoJS.enc.Utf8);
            } catch {
              throw new Error(intl.formatMessage({ id: 'tools.cryptoTools.base64_decode_failed' }));
            }
          } else {
            // Base64编码
            result = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(inputText));
          }
          break;
      }
      
      setOutput(result);
      setSuccess(isDecoding ? 
        intl.formatMessage({ id: 'tools.cryptoTools.decryption_success' }) : 
        intl.formatMessage({ id: 'tools.cryptoTools.encryption_success' }));
    } catch (err) {
      console.error('处理错误:', err);
      setError(`${isDecoding ? 
        intl.formatMessage({ id: 'tools.cryptoTools.decrypt' }) : 
        intl.formatMessage({ id: 'tools.cryptoTools.encrypt' })}失败: ${
        err instanceof Error ? err.message : '未知错误'
      }`);
    }
  };

  // 复制结果到剪贴板
  const copyToClipboard = () => {
    if (!output) return;
    
    navigator.clipboard.writeText(output)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('复制失败:', err);
        setError(intl.formatMessage({ id: 'tools.cryptoTools.copy_failed' }));
      });
  };

  // 清空所有内容
  const clearAll = () => {
    setInputText('');
    setSecretKey('');
    setOutput('');
    setError(null);
    setSuccess(null);
  };

  // 加载示例
  const loadExample = () => {
    const examples: Record<CryptoType, { input: string; key?: string }> = {
      md5: { input: 'Hello, World!' },
      sha1: { input: 'Hello, World!' },
      sha256: { input: 'Hello, World!' },
      sha512: { input: 'Hello, World!' },
      aes: { input: 'Hello, World!', key: 'secret-key-12345' },
      base64: { input: 'Hello, World!' }
    };
    
    const example = examples[activeAlgorithm];
    setInputText(example.input);
    if (example.key) {
      setSecretKey(example.key);
    }
    
    setOutput('');
    setError(null);
    setSuccess(null);
  };

  // 加密算法信息映射
  const algorithms = {
    md5: {
      name: intl.formatMessage({ id: 'tools.cryptoTools.algorithms.md5.name' }),
      description: intl.formatMessage({ id: 'tools.cryptoTools.algorithms.md5.description' }),
      needsKey: false,
      isEncodeDecode: false,
    },
    sha1: {
      name: intl.formatMessage({ id: 'tools.cryptoTools.algorithms.sha1.name' }),
      description: intl.formatMessage({ id: 'tools.cryptoTools.algorithms.sha1.description' }),
      needsKey: false,
      isEncodeDecode: false,
    },
    sha256: {
      name: intl.formatMessage({ id: 'tools.cryptoTools.algorithms.sha256.name' }),
      description: intl.formatMessage({ id: 'tools.cryptoTools.algorithms.sha256.description' }),
      needsKey: false,
      isEncodeDecode: false,
    },
    sha512: {
      name: intl.formatMessage({ id: 'tools.cryptoTools.algorithms.sha512.name' }),
      description: intl.formatMessage({ id: 'tools.cryptoTools.algorithms.sha512.description' }),
      needsKey: false,
      isEncodeDecode: false,
    },
    aes: {
      name: intl.formatMessage({ id: 'tools.cryptoTools.algorithms.aes.name' }),
      description: intl.formatMessage({ id: 'tools.cryptoTools.algorithms.aes.description' }),
      needsKey: true,
      isEncodeDecode: true,
    },
    base64: {
      name: intl.formatMessage({ id: 'tools.cryptoTools.algorithms.base64.name' }),
      description: intl.formatMessage({ id: 'tools.cryptoTools.algorithms.base64.description' }),
      needsKey: false,
      isEncodeDecode: true,
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <Title level={2}>
        <FormattedMessage id="tools.cryptoTools.name" />
      </Title>
      <Paragraph className="text-gray-500 dark:text-gray-400 mb-6">
        <FormattedMessage id="tools.cryptoTools.description" />
      </Paragraph>

      <Card>
        <Space orientation="vertical" size="large" className="w-full">
          {/* 算法选择 */}
          <div>
            <Text strong className="block mb-3">
              <FormattedMessage id="tools.cryptoTools.select_algorithm" />
            </Text>
            <div className="flex flex-wrap gap-2">
              {Object.entries(algorithms).map(([key, algo]) => (
                <Button
                  key={key}
                  type={activeAlgorithm === key ? 'primary' : 'default'}
                  onClick={() => setActiveAlgorithm(key as CryptoType)}
                >
                  {algo.name}
                </Button>
              ))}
            </div>
          </div>
          
          {/* 算法描述 */}
          <Text type="secondary" className="text-sm">
            {algorithms[activeAlgorithm].description}
          </Text>
          
          {/* 操作按钮和状态切换 */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            {/* 编码/解码切换 */}
            {algorithms[activeAlgorithm].isEncodeDecode && (
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-md p-1">
                <Button
                  type={!isDecoding ? 'primary' : 'default'}
                  className="rounded-r-none"
                  onClick={() => setIsDecoding(false)}
                >
                  {activeAlgorithm === 'base64' ? 
                    <FormattedMessage id="tools.cryptoTools.encode" /> : 
                    <FormattedMessage id="tools.cryptoTools.encrypt" />}
                </Button>
                <Button
                  type={isDecoding ? 'primary' : 'default'}
                  className="rounded-l-none border-l-0"
                  onClick={() => setIsDecoding(true)}
                >
                  {activeAlgorithm === 'base64' ? 
                    <FormattedMessage id="tools.cryptoTools.decode" /> : 
                    <FormattedMessage id="tools.cryptoTools.decrypt" />}
                </Button>
              </div>
            )}
            
            <div className="flex gap-2">
              <Tooltip title={<FormattedMessage id="tools.cryptoTools.load_example" />}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={loadExample}
                >
                  <FormattedMessage id="tools.cryptoTools.example" />
                </Button>
              </Tooltip>
              
              <Tooltip title={<FormattedMessage id="tools.cryptoTools.clear" />}>
                <Button
                  icon={<ClearOutlined />}
                  onClick={clearAll}
                  danger
                >
                  <FormattedMessage id="tools.cryptoTools.clear" />
                </Button>
              </Tooltip>
            </div>
          </div>
          
          {/* 输入输出部分 */}
          <Row gutter={[24, 24]}>
            {/* 输入区域 */}
            <Col xs={24} md={12}>
              <Space orientation="vertical" size="large" className="w-full">
                {/* 输入文本 */}
                <div>
                  <Text strong className="block mb-2">
                    {isDecoding 
                      ? (activeAlgorithm === 'base64' ? 
                          <FormattedMessage id="tools.cryptoTools.base64_encoded" /> : 
                          <FormattedMessage id="tools.cryptoTools.encrypted_text" />) 
                      : <FormattedMessage id="tools.cryptoTools.input_text" />}
                  </Text>
                  <Input.TextArea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={isDecoding 
                      ? (activeAlgorithm === 'base64' ? 
                          intl.formatMessage({ id: 'tools.cryptoTools.base64_decode_placeholder' }) : 
                          intl.formatMessage({ id: 'tools.cryptoTools.decrypt_placeholder' })) 
                      : intl.formatMessage({ id: 'tools.cryptoTools.input_placeholder' })}
                    rows={8}
                  />
                </div>
                
                {/* 密钥输入 */}
                {algorithms[activeAlgorithm].needsKey && (
                  <div>
                    <Text strong className="block mb-2">
                      <FormattedMessage id="tools.cryptoTools.secret_key" />
                    </Text>
                    <Input
                      type="password"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      placeholder={intl.formatMessage({ id: 'tools.cryptoTools.key_placeholder' })}
                    />
                  </div>
                )}
                
                <Button
                  icon={<LockOutlined />}
                  type="primary"
                  onClick={processOperation}
                  disabled={!inputText}
                  size="large"
                  className="w-full"
                >
                  {isDecoding 
                    ? (activeAlgorithm === 'base64' ? 
                        <FormattedMessage id="tools.cryptoTools.decode" /> : 
                        <FormattedMessage id="tools.cryptoTools.decrypt" />) 
                    : (activeAlgorithm === 'base64' ? 
                        <FormattedMessage id="tools.cryptoTools.encode" /> : 
                        (algorithms[activeAlgorithm].isEncodeDecode ? 
                          <FormattedMessage id="tools.cryptoTools.encrypt" /> : 
                          <FormattedMessage id="tools.cryptoTools.calculate" />))}
                </Button>
              </Space>
            </Col>
            
            {/* 输出区域 */}
            <Col xs={24} md={12}>
              <Space orientation="vertical" size="large" className="w-full">
                <div>
                  <Text strong className="block mb-2">
                    {isDecoding 
                      ? <FormattedMessage id="tools.cryptoTools.decoded_result" /> 
                      : (algorithms[activeAlgorithm].isEncodeDecode ? 
                          <FormattedMessage id="tools.cryptoTools.encrypted_result" /> : 
                          <FormattedMessage id="tools.cryptoTools.hash_result" />)}
                  </Text>
                  <Input.TextArea
                    value={output}
                    readOnly
                    placeholder={intl.formatMessage({ id: 'tools.cryptoTools.result_placeholder' })}
                    rows={8}
                  />
                  
                  {output && (
                    <div className="flex justify-end mt-3">
                      <Tooltip title={<FormattedMessage id="tools.cryptoTools.copy_result" />}>
                        <Button
                          icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                          onClick={copyToClipboard}
                        >
                          {copied ? 
                            <FormattedMessage id="tools.cryptoTools.copied" /> : 
                            <FormattedMessage id="tools.cryptoTools.copy_result" />}
                        </Button>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </Space>
            </Col>
          </Row>
          
          {/* 状态消息 */}
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              icon={<InfoCircleOutlined />}
            />
          )}
          
          {success && (
            <Alert
              message={success}
              type="success"
              showIcon
              icon={<CheckOutlined />}
            />
          )}
          
          {/* 算法信息说明 */}
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <Text strong className="block mb-2">
              <FormattedMessage id="tools.cryptoTools.algorithm_info" />
            </Text>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p className="mb-2">
                <strong>{algorithms[activeAlgorithm].name}:</strong>{' '}
                {algorithms[activeAlgorithm].description}
              </p>
              
              {activeAlgorithm === 'md5' && (
                <p><FormattedMessage id="tools.cryptoTools.algorithms.md5.additional_info" /></p>
              )}
              
              {activeAlgorithm === 'sha1' && (
                <p><FormattedMessage id="tools.cryptoTools.algorithms.sha1.additional_info" /></p>
              )}
              
              {activeAlgorithm === 'sha256' && (
                <p><FormattedMessage id="tools.cryptoTools.algorithms.sha256.additional_info" /></p>
              )}
              
              {activeAlgorithm === 'sha512' && (
                <p><FormattedMessage id="tools.cryptoTools.algorithms.sha512.additional_info" /></p>
              )}
              
              {activeAlgorithm === 'aes' && (
                <p><FormattedMessage id="tools.cryptoTools.algorithms.aes.additional_info" /></p>
              )}
              
              {activeAlgorithm === 'base64' && (
                <p><FormattedMessage id="tools.cryptoTools.algorithms.base64.additional_info" /></p>
              )}
            </div>
          </div>
        </Space>
      </Card>
    </div>
  );
}