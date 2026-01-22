import React from 'react';
import { Button, Input, Space, Row, Col } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import type { RequestHeader } from '../types';

interface RequestHeadersProps {
  headers: RequestHeader[];
  onAddHeader: () => void;
  onUpdateHeader: (id: string, key: string, value: string) => void;
  onRemoveHeader: (id: string) => void;
}

const RequestHeaders: React.FC<RequestHeadersProps> = ({
  headers,
  onAddHeader,
  onUpdateHeader,
  onRemoveHeader,
}) => {
  const intl = useIntl();

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button 
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={onAddHeader}
        >
          <FormattedMessage id="tools.httpTester.add_header" />
        </Button>
      </div>
      
      <Space orientation="vertical" style={{ width: '100%' }} size={8}>
        {headers.map(header => (
          <Row key={header.id} gutter={[8, 8]} align="middle">
            <Col flex="1">
              <Input
                placeholder={intl.formatMessage({ id: 'tools.httpTester.header_key' })}
                value={header.key}
                onChange={(e) => onUpdateHeader(header.id, e.target.value, header.value)}
              />
            </Col>
            <Col flex="1">
              <Input
                placeholder={intl.formatMessage({ id: 'tools.httpTester.header_value' })}
                value={header.value}
                onChange={(e) => onUpdateHeader(header.id, header.key, e.target.value)}
              />
            </Col>
            <Col>
              <Button
                type="text"
                icon={<CloseOutlined />}
                onClick={() => onRemoveHeader(header.id)}
                danger
              />
            </Col>
          </Row>
        ))}
      </Space>
    </div>
  );
};

export default RequestHeaders;