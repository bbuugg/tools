import React from 'react';
import { Button, Input, Radio, Space, Typography, Row, Col } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import type { FormField } from '../types';

const { Text } = Typography;
import TextArea from 'antd/es/input/TextArea';

interface RequestBodyProps {
  bodyFormat: 'json' | 'text' | 'form';
  body: string;
  formFields: FormField[];
  onBodyChange: (body: string) => void;
  onBodyFormatChange: (format: 'json' | 'text' | 'form') => void;
  onAddFormField: () => void;
  onUpdateFormField: (id: string, key: string, value: string) => void;
  onRemoveFormField: (id: string) => void;
}

const RequestBody: React.FC<RequestBodyProps> = ({
  bodyFormat,
  body,
  formFields,
  onBodyChange,
  onBodyFormatChange,
  onAddFormField,
  onUpdateFormField,
  onRemoveFormField,
}) => {
  const intl = useIntl();

  return (
    <div>
      {/* 请求体格式选择 */}
      <Radio.Group 
        value={bodyFormat} 
        onChange={(e) => onBodyFormatChange(e.target.value)}
        style={{ marginBottom: 16 }}
      >
        <Radio.Button value="json">
          <FormattedMessage id="tools.httpTester.json_format" />
        </Radio.Button>
        <Radio.Button value="text">
          <FormattedMessage id="tools.httpTester.text_format" />
        </Radio.Button>
        <Radio.Button value="form">
          <FormattedMessage id="tools.httpTester.form_format" />
        </Radio.Button>
      </Radio.Group>
      
      {bodyFormat === 'json' && (
        <>
          <TextArea 
            value={body}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onBodyChange(e.target.value)}
            placeholder='{\n  "key": "value"\n}'
            rows={6}
          />
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <FormattedMessage id="tools.httpTester.enter_request_body" />
            </Text>
          </div>
        </>
      )}
      
      {bodyFormat === 'text' && (
        <TextArea 
          value={body}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onBodyChange(e.target.value)}
          placeholder={intl.formatMessage({ id: 'tools.httpTester.enter_request_body' })}
          rows={6}
        />
      )}
      
      {bodyFormat === 'form' && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Button 
              type="primary"
              size="small"
              icon={<PlusOutlined />}
              onClick={onAddFormField}
            >
              <FormattedMessage id="tools.httpTester.add_form_field" />
            </Button>
          </div>
          
          <Space orientation="vertical" style={{ width: '100%' }} size={8}>
            {formFields.map(field => (
              <Row key={field.id} gutter={[8, 8]} align="middle">
                <Col flex="1">
                  <Input
                    placeholder={intl.formatMessage({ id: 'tools.httpTester.form_field_key' })}
                    value={field.key}
                    onChange={(e) => onUpdateFormField(field.id, e.target.value, field.value)}
                  />
                </Col>
                <Col flex="1">
                  <Input
                    placeholder={intl.formatMessage({ id: 'tools.httpTester.form_field_value' })}
                    value={field.value}
                    onChange={(e) => onUpdateFormField(field.id, field.key, e.target.value)}
                  />
                </Col>
                <Col>
                  <Button
                    type="text"
                    icon={<CloseOutlined />}
                    onClick={() => onRemoveFormField(field.id)}
                    danger
                  />
                </Col>
              </Row>
            ))}
          </Space>
          
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              <FormattedMessage id="tools.httpTester.enter_request_body" />
            </Text>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestBody;