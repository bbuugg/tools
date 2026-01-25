import { Button, Card, Space, Tabs } from 'antd';
import { useEffect, useRef, useState } from 'react';

import { ApiOutlined, ClearOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import ErrorDisplay from './components/ErrorDisplay';
import RequestBody from './components/RequestBody';
import RequestForm from './components/RequestForm';
import RequestHeaders from './components/RequestHeaders';
import RequestHistory from './components/RequestHistory';
import ResponseDisplay from './components/ResponseDisplay';
import type { HistoryItem, HttpMethod, HttpResponse, NetworkType, RequestHeader } from './types';

import { sendHttpRequest } from './utils';

// 本地存储的key
const HISTORY_STORAGE_KEY = 'http_tester_history';

export default function HttpTester() {
  const intl = useIntl();
  // 请求配置
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const generateId = () => {
    return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
  };
  
  const [headers, setHeaders] = useState<RequestHeader[]>(() => [
    { key: 'Content-Type', value: 'application/json', id: 'initial-header-' + generateId() }
  ]);
  const [body, setBody] = useState('');
  const [bodyFormat, setBodyFormat] = useState<'json' | 'text' | 'form'>('json');
  // 添加表单字段状态
  const [formFields, setFormFields] = useState<RequestHeader[]>(() => [
    { key: '', value: '', id: 'initial-field-' + generateId() }
  ]);

  
  // 网络类型（新增）
  const [networkType, setNetworkType] = useState<NetworkType>('public');
  
  // 响应状态
  const [response, setResponse] = useState<HttpResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(true); // 默认显示历史记录
  
  // 历史记录
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // 上一次bodyFormat的引用
  const prevBodyFormatRef = useRef(bodyFormat);
  
  // 从本地存储加载历史记录 - 放在顶部优先执行
  useEffect(() => {
    // 确保在客户端运行
    if (typeof window === 'undefined') return;

    try {
      // 直接从localStorage获取数据
      const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        // 转换时间戳为Date对象
        const processedHistory = parsedHistory.map((item: {url: string, method: HttpMethod, timestamp: string}) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        
        // 设置历史记录
        setHistory(processedHistory);
      }
    } catch (e) {
      console.error(intl.formatMessage({ id: 'tools.httpTester.copy_failed' }), e);
    }
  }, [intl]);

  // 监听bodyFormat变化，自动更新Content-Type
  useEffect(() => {
    // 如果bodyFormat没有变化，直接返回
    if (prevBodyFormatRef.current === bodyFormat) return;
    
    // 更新上一次的bodyFormat
    prevBodyFormatRef.current = bodyFormat;
    
    // 获取对应的Content-Type值
    let newContentType = '';
    if (bodyFormat === 'json') {
      newContentType = 'application/json';
    } else if (bodyFormat === 'form') {
      newContentType = 'application/x-www-form-urlencoded';
    } else if (bodyFormat === 'text') {
      newContentType = 'text/plain';
    }
    
    // 使用函数式更新，避免依赖headers
    setHeaders(prevHeaders => {
      // 查找现有的Content-Type请求头
      const contentTypeIndex = prevHeaders.findIndex(
        h => h.key.toLowerCase() === 'content-type'
      );
      
      // 如果找到了Content-Type并且需要更新
      if (contentTypeIndex !== -1) {
        const updatedHeaders = [...prevHeaders];
        updatedHeaders[contentTypeIndex] = {
          ...updatedHeaders[contentTypeIndex],
          value: newContentType
        };
        return updatedHeaders;
      } else if (newContentType) {
        // 如果没有找到Content-Type但需要添加
        return [
          ...prevHeaders,
          { key: 'Content-Type', value: newContentType, id: Date.now().toString() }
        ];
      }
      
      // 没有变化时返回原来的headers
      return prevHeaders;
    });
  }, [bodyFormat]); // 只依赖bodyFormat

  // 在组件挂载时检查是否是从首页导航过来
  useEffect(() => {
    // 确保在客户端运行
    if (typeof window !== 'undefined') {
      // 检查是否是从首页导航过来的标记
      const fromHomepage = sessionStorage.getItem('from_homepage');
      if (fromHomepage) {
        // 确保历史记录显示
        setShowHistory(true);
        // 清除标记
        sessionStorage.removeItem('from_homepage');
      }
    }
  }, []);

  // 当历史记录更新时保存到本地存储
  useEffect(() => {
    if (typeof window === 'undefined' || history.length === 0) return;
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history]);
  
  // 添加请求头
  const addHeader = () => {
    setHeaders(prevHeaders => [...prevHeaders, { key: '', value: '', id: Date.now().toString() }]);
  };
  
  // 更新请求头
  const updateHeader = (id: string, key: string, value: string) => {
    setHeaders(prevHeaders =>
      prevHeaders.map(header => 
        header.id === id ? { ...header, key, value } : header
      )
    );
  };
  
  // 删除请求头
  const removeHeader = (id: string) => {
    setHeaders(prevHeaders => prevHeaders.filter(header => header.id !== id));
  };
  
  // 添加表单字段
  const addFormField = () => {
    setFormFields(prevFields => [...prevFields, { key: '', value: '', id: Date.now().toString() }]);
  };
  
  // 更新表单字段
  const updateFormField = (id: string, key: string, value: string) => {
    setFormFields(prevFields => 
      prevFields.map(field => 
        field.id === id ? { ...field, key, value } : field
      )
    );
  };
  
  // 删除表单字段
  const removeFormField = (id: string) => {
    setFormFields(prevFields => prevFields.filter(field => field.id !== id));
  };
  
  // 清空所有内容
  const clearAll = () => {
    // 一次性重置所有状态
    setUrl('');
    setMethod('GET');
    setHeaders([{ key: 'Content-Type', value: 'application/json', id: Date.now().toString() }]);
    setBody('');
    setFormFields([{ key: '', value: '', id: Date.now().toString() }]);
    setResponse(null);
    setError(null);
    // 确保bodyFormat匹配Content-Type
    setBodyFormat('json');
  };
  
  // 发送请求
  const handleSendRequest = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);
    
    const result = await sendHttpRequest(
      url,
      method,
      headers,
      body,
      bodyFormat,
      formFields,
      networkType
    );
    
    if (result.error) {
      setError(result.error);
    } else if (result.response) {
      setResponse(result.response);
      
      // 更新历史记录
      setHistory(prev => [
        { url, method, timestamp: new Date() },
        ...prev.slice(0, 9) // 保留最近10条
      ]);
    }
    
    setLoading(false);
  };
  
  // 从历史记录加载请求
  const loadFromHistory = (historyItem: {url: string, method: HttpMethod}) => {
    setUrl(historyItem.url);
    setMethod(historyItem.method);
    // 不重置其他状态，保留当前的请求头和请求体
  };
  
  // 清空历史记录
  const clearHistory = () => {
    if (confirm(intl.formatMessage({ id: 'tools.httpTester.clear_history_confirm' }))) {
      setHistory([]);
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    }
  };
  
  // 切换历史记录显示状态
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4">
<Space orientation="vertical" className="w-full">
            {/* 请求表单 */}
            <Card
              className="border-none bg-white/5"
              title={<span><ApiOutlined /> <FormattedMessage id="tools.httpTester.http_request" /></span>}
              extra={
                <Button
                  danger
                  size="small"
                  icon={<ClearOutlined />}
                  onClick={clearAll}
                >
                  <FormattedMessage id="tools.httpTester.clear" />
                </Button>
              }
            >
              {/* 请求URL和方法 */}
              <RequestForm 
                url={url}
                method={method}
                loading={loading}
                networkType={networkType}
                onUrlChange={setUrl}
                onMethodChange={setMethod}
                onNetworkTypeChange={setNetworkType}
                onSendRequest={handleSendRequest}
              />
              
              {/* 请求参数标签页 */}
              <Tabs 
                defaultActiveKey="body"
                size="small"
                items={[{
                  label: <FormattedMessage id="tools.httpTester.request_body" />,
                  key: 'body',
                  children: <RequestBody 
                    bodyFormat={bodyFormat}
                    body={body}
                    formFields={formFields}
                    onBodyChange={setBody}
                    onBodyFormatChange={setBodyFormat}
                    onAddFormField={addFormField}
                    onUpdateFormField={updateFormField}
                    onRemoveFormField={removeFormField}
                  />
                }, {
                  label: <FormattedMessage id="tools.httpTester.request_headers" />,
                  key: 'headers',
                  children: <RequestHeaders 
                    headers={headers}
                    onAddHeader={addHeader}
                    onUpdateHeader={updateHeader}
                    onRemoveHeader={removeHeader}
                  />
                }]}
              />
            </Card>
             <ErrorDisplay error={error} />
            <ResponseDisplay 
            response={response} 
            url={url}
            method={method}
            headers={headers}
            body={body}
            bodyFormat={bodyFormat}
            formFields={formFields}
            networkType={networkType}
          />
            {/* 历史记录 */}
            <RequestHistory 
              history={history}
              showHistory={showHistory}
              onToggleHistory={toggleHistory}
              onClearHistory={clearHistory}
              onLoadFromHistory={loadFromHistory}
            />
          </Space>
    </div>
  );
} 