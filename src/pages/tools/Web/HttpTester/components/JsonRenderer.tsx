import React, { useState } from 'react';
import { Typography, Button } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface JsonRendererProps {
  data: unknown;
}

/**
 * JSON格式化和语法高亮组件
 */
const JsonRenderer: React.FC<JsonRendererProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  
  // 递归渲染JSON对象
  const renderJsonValue = (value: unknown, depth = 0, isLast = true): React.ReactNode => {
    const indent = Array(depth * 2).fill(' ').join('');
    
    // 处理不同类型的值
    if (value === null) return <Text type="danger">null</Text>;
    if (value === undefined) return <Text type="secondary">undefined</Text>;
    
    if (typeof value === 'boolean') {
      return <Text type="warning">{value.toString()}</Text>;
    }
    
    if (typeof value === 'number') {
      return <Text type="success">{value}</Text>;
    }
    
    if (typeof value === 'string') {
      return <Text type="secondary">"{value}"</Text>;
    }
    
    // 处理数组
    if (Array.isArray(value)) {
      if (value.length === 0) return <span>[]</span>;
      
      return (
        <span>
          <span>[</span>
          <div style={{ paddingLeft: '20px' }}>
            {value.map((item, index) => (
              <div key={index}>
                {renderJsonValue(item, depth + 1, index === value.length - 1)}
                {index !== value.length - 1 && <Text type="secondary">,</Text>}
              </div>
            ))}
          </div>
          <span>{indent}]</span>
          {!isLast && <Text type="secondary">,</Text>}
        </span>
      );
    }
    
    // 处理对象
    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);
      if (entries.length === 0) return <span>{'{}'}</span>;
      
      return (
        <span>
          <span>{'{'}</span>
          {'\n'}
          <div style={{ paddingLeft: '20px' }}>
            {entries.map(([key, val], index) => (
              <div key={key}>
                <Text strong style={{ color: '#722ed1' }}>"{key}"</Text>
                <Text type="secondary">: </Text>
                {renderJsonValue(val, depth + 1, index === entries.length - 1)}
                {index !== entries.length - 1 && <Text type="secondary">,</Text>}
              </div>
            ))}
          </div>
          <span>{'\n'}{indent}{'}'}</span>
          {!isLast && <Text type="secondary">,</Text>}
        </span>
      );
    }
    
    return <span>{String(value)}</span>;
  };

  // 解析JSON字符串 (如果传入的是字符串)
  const parseAndRender = () => {
    try {
      if (typeof data === 'string') {
        const parsedData = JSON.parse(data);
        return renderJsonValue(parsedData);
      }
      return renderJsonValue(data);
    } catch {
      return <Text type="danger">Invalid JSON: {String(data)}</Text>;
    }
  };
  
  // 格式化JSON为可读字符串
  const formatJson = (json: unknown): string => {
    try {
      if (typeof json === 'string') {
        return JSON.stringify(JSON.parse(json), null, 2);
      }
      return JSON.stringify(json, null, 2);
    } catch {
      return String(json);
    }
  };
  
  // 复制JSON到剪贴板
  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(formatJson(data));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };
  
  return (
    <div style={{ 
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      fontSize: '13px',
      lineHeight: '1.5',
      overflowX: 'auto',
      padding: '8px',
      backgroundColor: '#1d1d1d',
      borderRadius: '4px',
      border: '1px solid #303030',
      position: 'relative'
    }}>
      <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
        <Button 
          size="small" 
          icon={copied ? <CheckOutlined /> : <CopyOutlined />}
          onClick={copyJson}
          title="复制JSON"
        />
      </div>
      <div style={{ paddingTop: '30px' }}>
        {parseAndRender()}
      </div>
    </div>
  );
};

export default JsonRenderer;