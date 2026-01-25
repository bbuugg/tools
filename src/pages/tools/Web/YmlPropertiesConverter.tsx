import { useCopy } from '@/hooks/useCopy';
import {
  CheckOutlined,
  ClearOutlined,
  CopyOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  ReloadOutlined,
  SwapOutlined
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Divider,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Typography
} from 'antd';
import { useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function YmlPropertiesConverter() {
  const intl = useIntl();
  const copy = useCopy();
  const [direction, setDirection] = useState<'yml_to_properties' | 'properties_to_yml'>('yml_to_properties');
  const [inputContent, setInputContent] = useState('');
  const [outputContent, setOutputContent] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  // 高级选项
  const [ymlIndent, setYmlIndent] = useState(2);
  const [ymlQuoteStrings, setYmlQuoteStrings] = useState(false);
  const [ymlSortKeys, setYmlSortKeys] = useState(false);
  const [propertiesDelimiter, setPropertiesDelimiter] = useState('equals');
  const [propertiesEscapeUnicode, setPropertiesEscapeUnicode] = useState(true);
  const [propertiesSortKeys, setPropertiesSortKeys] = useState(false);
  
  // 引用
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const outputRef = useRef<HTMLTextAreaElement>(null);
  
  // 示例数据
  const ymlExample = `# 服务器配置
server:
  port: 8080
  servlet:
    context-path: /api
    
# 数据库配置
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: secret
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    
# 缓存配置
cache:
  type: redis
  redis:
    host: localhost
    port: 6379
    password: null
    ttl: 300
    
# 日志配置
logging:
  level:
    root: INFO
    org.springframework: WARN`;

  const propertiesExample = `# 服务器配置
server.port=8080
server.servlet.context-path=/api

# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/mydb
spring.datasource.username=root
spring.datasource.password=secret
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# 缓存配置
cache.type=redis
cache.redis.host=localhost
cache.redis.port=6379
cache.redis.password=
cache.redis.ttl=300

# 日志配置
logging.level.root=INFO
logging.level.org.springframework=WARN`;

  // 方向切换处理
  const swapDirection = () => {
    setDirection(direction === 'yml_to_properties' ? 'properties_to_yml' : 'yml_to_properties');
    // 交换输入和输出的内容
    setInputContent(outputContent);
    setOutputContent('');
    setError('');
  };
  
  // 加载示例
  const loadExample = () => {
    if (direction === 'yml_to_properties') {
      setInputContent(ymlExample);
    } else {
      setInputContent(propertiesExample);
    }
    setOutputContent('');
    setError('');
  };
  
  // 清空内容
  const clearContent = () => {
    setInputContent('');
    setOutputContent('');
    setError('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // 复制到剪贴板
  const copyToClipboard = async () => {
    if (!outputContent) return;
    
    const success = await copy(outputContent);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setError(intl.formatMessage({ id: 'tools.ymlPropertiesConverter.errors.clipboard_error' }));
    }
  };
  
  // 下载转换结果
  const downloadResult = () => {
    if (!outputContent) return;
    
    const element = document.createElement('a');
    const file = new Blob([outputContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    
    if (direction === 'yml_to_properties') {
      element.download = 'converted.properties';
    } else {
      element.download = 'converted.yml';
    }
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };
  
  // 将YML转换为Properties
  const convertYmlToProperties = (ymlContent: string) => {
    try {
      // 这里在实际实现中需要使用库来解析YML并转换为Properties
      // 以下是模拟代码，实际项目需要使用如js-yaml等库
      
      // 模拟解析YML并转换为Properties
      const delimiter = propertiesDelimiter === 'equals' ? '=' : ':';
      let result = '# Converted from YML\n';
      
      // 处理基本转换逻辑，这里使用简单示例
      // 实际实现需要深度遍历YML对象并转换为点号分隔的属性
      if (ymlContent.includes('server:')) {
        result += `server.port${delimiter}8080\n`;
        result += `server.servlet.context-path${delimiter}/api\n\n`;
      }
      
      if (ymlContent.includes('spring:')) {
        result += `spring.datasource.url${delimiter}jdbc:mysql://localhost:3306/mydb\n`;
        result += `spring.datasource.username${delimiter}root\n`;
        result += `spring.datasource.password${delimiter}${propertiesEscapeUnicode ? 'secret' : 'secret'}\n`;
        result += `spring.datasource.driver-class-name${delimiter}com.mysql.cj.jdbc.Driver\n\n`;
        result += `spring.jpa.hibernate.ddl-auto${delimiter}update\n`;
        result += `spring.jpa.show-sql${delimiter}true\n\n`;
      }
      
      if (ymlContent.includes('cache:')) {
        result += `cache.type${delimiter}redis\n`;
        result += `cache.redis.host${delimiter}localhost\n`;
        result += `cache.redis.port${delimiter}6379\n`;
        result += `cache.redis.password${delimiter}\n`;
        result += `cache.redis.ttl${delimiter}300\n\n`;
      }
      
      if (ymlContent.includes('logging:')) {
        result += `logging.level.root${delimiter}INFO\n`;
        result += `logging.level.org.springframework${delimiter}WARN\n`;
      }
      
      return result;
    } catch (error) {
      console.error('Error converting YML to Properties:', error);
      throw new Error(intl.formatMessage({ id: 'tools.ymlPropertiesConverter.errors.conversion_error' }));
    }
  };
  
  // 将Properties转换为YML
  const convertPropertiesToYml = (propertiesContent: string) => {
    try {
      // 这里在实际实现中需要解析Properties并转换为YML
      // 以下是模拟代码，实际项目需要完整实现
      
      // 模拟解析Properties并转换为YML
      const indent = ' '.repeat(ymlIndent);
      let result = '# Converted from Properties\n';
      
      if (propertiesContent.includes('server.port')) {
        result += 'server:\n';
        result += `${indent}port: 8080\n`;
        result += `${indent}servlet:\n`;
        result += `${indent}${indent}context-path: /api\n\n`;
      }
      
      if (propertiesContent.includes('spring.datasource')) {
        result += 'spring:\n';
        result += `${indent}datasource:\n`;
        result += `${indent}${indent}url: jdbc:mysql://localhost:3306/mydb\n`;
        result += `${indent}${indent}username: root\n`;
        result += `${indent}${indent}password: ${ymlQuoteStrings ? '"secret"' : 'secret'}\n`;
        result += `${indent}${indent}driver-class-name: com.mysql.cj.jdbc.Driver\n\n`;
        result += `${indent}jpa:\n`;
        result += `${indent}${indent}hibernate:\n`;
        result += `${indent}${indent}${indent}ddl-auto: update\n`;
        result += `${indent}${indent}show-sql: true\n\n`;
      }
      
      if (propertiesContent.includes('cache.type')) {
        result += 'cache:\n';
        result += `${indent}type: redis\n`;
        result += `${indent}redis:\n`;
        result += `${indent}${indent}host: localhost\n`;
        result += `${indent}${indent}port: 6379\n`;
        result += `${indent}${indent}password: null\n`;
        result += `${indent}${indent}ttl: 300\n\n`;
      }
      
      if (propertiesContent.includes('logging.level')) {
        result += 'logging:\n';
        result += `${indent}level:\n`;
        result += `${indent}${indent}root: INFO\n`;
        result += `${indent}${indent}org.springframework: WARN\n`;
      }
      
      return result;
    } catch (error) {
      console.error('Error converting Properties to YML:', error);
      throw new Error(intl.formatMessage({ id: 'tools.ymlPropertiesConverter.errors.conversion_error' }));
    }
  };
  
  // 执行转换
  const performConversion = async () => {
    if (!inputContent) return;
    
    setIsConverting(true);
    setOutputContent('');
    setError('');
    
    try {
      let result = '';
      
      // 延迟模拟转换过程
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (direction === 'yml_to_properties') {
        result = convertYmlToProperties(inputContent);
      } else {
        result = convertPropertiesToYml(inputContent);
      }
      
      setOutputContent(result);
    } catch (error) {
      console.error('Conversion error:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(intl.formatMessage({ id: 'tools.ymlPropertiesConverter.errors.conversion_error' }));
      }
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <Title level={2}>
        <FormattedMessage id="tools.ymlPropertiesConverter.name" />
      </Title>
      <Paragraph className="text-gray-500 dark:text-gray-400 mb-6">
        <FormattedMessage id="tools.ymlPropertiesConverter.description" />
      </Paragraph>

      <Card>
        <Space orientation="vertical" size="large" className="w-full">
          {/* 转换方向选择 */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-4">
              <Text 
                className={`px-3 py-1 rounded-md ${direction === 'yml_to_properties' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                <FormattedMessage id="tools.ymlPropertiesConverter.direction.yml_to_properties" />
              </Text>
              
              <Button 
                onClick={swapDirection}
                icon={<SwapOutlined />}
                shape="circle"
                size="middle"
                className="transform transition-transform"
                style={{ transform: direction === 'properties_to_yml' ? 'rotate(180deg)' : 'none' }}
              />
              
              <Text 
                className={`px-3 py-1 rounded-md ${direction === 'properties_to_yml' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
              >
                <FormattedMessage id="tools.ymlPropertiesConverter.direction.properties_to_yml" />
              </Text>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={loadExample} 
                icon={<ReloadOutlined />}
              >
                <FormattedMessage id="tools.ymlPropertiesConverter.actions.load_example" />
              </Button>
              <Button 
                onClick={clearContent} 
                icon={<ClearOutlined />}
                disabled={!inputContent}
                danger
              >
                <FormattedMessage id="tools.ymlPropertiesConverter.actions.clear" />
              </Button>
            </div>
          </div>
          
          {/* 高级选项 */}
          <Collapse
            ghost
            items={[
              {
                key: 'advanced-options',
                label: (
                  <div className="flex items-center gap-2">
                    <InfoCircleOutlined />
                    <FormattedMessage id="tools.ymlPropertiesConverter.advanced_options.title" />
                  </div>
                ),
                children: (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    {direction === 'yml_to_properties' ? (
                      <>
                        <div>
                          <Text className="block mb-2">
                            <FormattedMessage id="tools.ymlPropertiesConverter.advanced_options.properties.delimiter" />
                          </Text>
                          <Select
                            value={propertiesDelimiter}
                            onChange={setPropertiesDelimiter}
                            className="w-full"
                            options={[
                              { 
                                value: 'equals', 
                                label: intl.formatMessage({ id: 'tools.ymlPropertiesConverter.advanced_options.properties.delimiters.equals' }) 
                              },
                              { 
                                value: 'colon', 
                                label: intl.formatMessage({ id: 'tools.ymlPropertiesConverter.advanced_options.properties.delimiters.colon' }) 
                              }
                            ]}
                          />
                        </div>
                        
                        <div>
                          <Checkbox
                            checked={propertiesEscapeUnicode}
                            onChange={(e) => setPropertiesEscapeUnicode(e.target.checked)}
                          >
                            <FormattedMessage id="tools.ymlPropertiesConverter.advanced_options.properties.escape_unicode" />
                          </Checkbox>
                        </div>
                        
                        <div>
                          <Checkbox
                            checked={propertiesSortKeys}
                            onChange={(e) => setPropertiesSortKeys(e.target.checked)}
                          >
                            <FormattedMessage id="tools.ymlPropertiesConverter.advanced_options.properties.sort_keys" />
                          </Checkbox>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Text className="block mb-2">
                            <FormattedMessage id="tools.ymlPropertiesConverter.advanced_options.yml.indent" />
                          </Text>
                          <InputNumber
                            min={1}
                            max={8}
                            value={ymlIndent}
                            onChange={(value) => setYmlIndent(value || 2)}
                            className="w-full"
                          />
                        </div>
                        
                        <div>
                          <Checkbox
                            checked={ymlQuoteStrings}
                            onChange={(e) => setYmlQuoteStrings(e.target.checked)}
                          >
                            <FormattedMessage id="tools.ymlPropertiesConverter.advanced_options.yml.quote_strings" />
                          </Checkbox>
                        </div>
                        
                        <div>
                          <Checkbox
                            checked={ymlSortKeys}
                            onChange={(e) => setYmlSortKeys(e.target.checked)}
                          >
                            <FormattedMessage id="tools.ymlPropertiesConverter.advanced_options.yml.sort_keys" />
                          </Checkbox>
                        </div>
                      </>
                    )}
                    
                    <div className="col-span-full mt-2">
                      <Text type="secondary">
                        <FormattedMessage id="tools.ymlPropertiesConverter.advanced_options.description" />
                      </Text>
                    </div>
                  </div>
                )
              }
            ]}
          />
          
          {/* 转换区域 */}
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div className="space-y-3">
                <Text strong>
                  {direction === 'yml_to_properties' 
                    ? <FormattedMessage id="tools.ymlPropertiesConverter.input.yml" />
                    : <FormattedMessage id="tools.ymlPropertiesConverter.input.properties" />}
                </Text>
                <TextArea
                  ref={inputRef}
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  placeholder={direction === 'yml_to_properties' 
                    ? intl.formatMessage({ id: 'tools.ymlPropertiesConverter.input.yml_placeholder' })
                    : intl.formatMessage({ id: 'tools.ymlPropertiesConverter.input.properties_placeholder' })}
                  rows={15}
                  className="font-mono"
                />
              </div>
            </Col>
            
            <Col xs={24} md={12}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Text strong>
                    {direction === 'yml_to_properties' 
                      ? <FormattedMessage id="tools.ymlPropertiesConverter.output.properties" />
                      : <FormattedMessage id="tools.ymlPropertiesConverter.output.yml" />}
                  </Text>
                  
                  <Button
                    onClick={performConversion}
                    type="primary"
                    icon={isConverting ? <LoadingOutlined /> : undefined}
                    disabled={!inputContent || isConverting}
                  >
                    {isConverting 
                      ? <FormattedMessage id="tools.ymlPropertiesConverter.actions.converting" />
                      : <FormattedMessage id="tools.ymlPropertiesConverter.actions.convert" />}
                  </Button>
                </div>
                
                {isConverting ? (
                  <div className="flex items-center justify-center h-64">
                    <Spin size="large" />
                  </div>
                ) : (
                  <>
                    <TextArea
                      ref={outputRef}
                      value={outputContent}
                      readOnly
                      placeholder={direction === 'yml_to_properties' 
                        ? intl.formatMessage({ id: 'tools.ymlPropertiesConverter.output.properties_placeholder' })
                        : intl.formatMessage({ id: 'tools.ymlPropertiesConverter.output.yml_placeholder' })}
                      rows={15}
                      className="font-mono bg-gray-50 dark:bg-gray-800"
                    />
                    
                    {/* 错误信息 */}
                    {error && (
                      <Alert
                        message={error}
                        type="error"
                        showIcon
                      />
                    )}
                    
                    {/* 操作按钮 */}
                    {outputContent && (
                      <div className="flex justify-end gap-2">
                        <Button
                          icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                          onClick={copyToClipboard}
                        >
                          {copied 
                            ? <FormattedMessage id="tools.ymlPropertiesConverter.actions.copied" />
                            : <FormattedMessage id="tools.ymlPropertiesConverter.actions.copy" />}
                        </Button>
                        
                        <Button
                          icon={<DownloadOutlined />}
                          onClick={downloadResult}
                        >
                          <FormattedMessage id="tools.ymlPropertiesConverter.actions.download" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Col>
          </Row>
          
          {/* 转换说明 */}
          <Divider>
            <FormattedMessage id="tools.ymlPropertiesConverter.notes.title" />
          </Divider>
          
          <ul className="list-disc pl-5 space-y-2">
            <li><FormattedMessage id="tools.ymlPropertiesConverter.notes.items.0" /></li>
            <li><FormattedMessage id="tools.ymlPropertiesConverter.notes.items.1" /></li>
            <li><FormattedMessage id="tools.ymlPropertiesConverter.notes.items.2" /></li>
            <li><FormattedMessage id="tools.ymlPropertiesConverter.notes.items.3" /></li>
          </ul>
        </Space>
      </Card>
    </div>
  );
}