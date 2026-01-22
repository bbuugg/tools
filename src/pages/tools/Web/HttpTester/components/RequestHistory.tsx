import React from 'react';
import { Card, Button, Space, Typography, Empty } from 'antd';
import { DeleteOutlined, HistoryOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import type { HistoryItem, HttpMethod } from '../types';

const { Text } = Typography;

interface RequestHistoryProps {
  history: HistoryItem[];
  showHistory: boolean;
  onToggleHistory: () => void;
  onClearHistory: () => void;
  onLoadFromHistory: (item: {url: string, method: HttpMethod}) => void;
}

const RequestHistory: React.FC<RequestHistoryProps> = ({
  history,
  onClearHistory,
  onLoadFromHistory,
}) => {
  
  // 格式化日期
  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  
  return (
    <Card
      title={
        <Space>
          <HistoryOutlined />
          <FormattedMessage id="tools.httpTester.history" />
        </Space>
      }
      extra={
        history.length > 0 && (
          <Button 
            type="text" 
            danger 
            size="small"
            icon={<DeleteOutlined />}
            onClick={onClearHistory}
          >
            <FormattedMessage id="tools.httpTester.clear_history" />
          </Button>
        )
      }
    >
      {history.length > 0 ? (
        <div>
          {history.map((item, index) => (
            <div 
              key={index}
              onClick={() => onLoadFromHistory(item)}
              style={{ cursor: 'pointer', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <Text code>{item.method}</Text>
                  <Text ellipsis={{ tooltip: item.url }}>{item.url}</Text>
                </Space>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {formatDate(item.timestamp)}
                </Text>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Empty 
          description={<FormattedMessage id="tools.httpTester.history_empty" />}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </Card>
  );
};

export default RequestHistory;