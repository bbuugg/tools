import {
  CheckOutlined,
  ClearOutlined,
  CopyOutlined,
  PlayCircleOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Input,
  Radio,
  Row,
  Space,
  Tooltip,
  Typography
} from 'antd';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

const { Title, Text, Paragraph } = Typography;

// 去空格模式类型
type StripMode = 'both' | 'start' | 'end' | 'all' | 'newlines' | 'all_and_newlines';

export default function TextSpaceStripper() {
  const intl = useIntl();
  
  // 输入文本
  const [inputText, setInputText] = useState('');
  // 输出文本
  const [outputText, setOutputText] = useState('');
  // 去除模式
  const [stripMode, setStripMode] = useState<StripMode>('both');
  // 复制状态
  const [copied, setCopied] = useState(false);

  // 清空输入
  const clearText = () => {
    setInputText('');
    setOutputText('');
  };

  // 处理文本
  const processText = () => {
    if (!inputText) return;

    let result = inputText;
    
    switch (stripMode) {
      case 'both':
        result = inputText.trim();
        break;
      case 'start':
        result = inputText.replace(/^\s+/, '');
        break;
      case 'end':
        result = inputText.replace(/\s+$/, '');
        break;
      case 'all':
        result = inputText.replace(/\s+/g, '');
        break;
      case 'newlines':
        result = inputText.replace(/[\r\n]+/g, '');
        break;
      case 'all_and_newlines':
        // 先去除所有换行符，再去除所有空格
        result = inputText.replace(/[\r\n]+/g, ' ').replace(/\s+/g, '');
        break;
      default:
        break;
    }

    setOutputText(result);
  };

  // 复制结果
  const copyResult = () => {
    if (!outputText) return;
    
    navigator.clipboard.writeText(outputText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error(intl.formatMessage({ id: 'tools.textSpaceStripper.copy_failed' }), err));
  };

  // 加载示例
  const loadExample = () => {
    setInputText('   这是一个    带有多余空格     和换行符的文本示例。\n\n这是   第二行     内容。\n   还有第三行内容。   \n');
    setOutputText('');
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <Title level={2}>
        <FormattedMessage id="tools.textSpaceStripper.name" />
      </Title>
      <Paragraph className="text-gray-500 dark:text-gray-400 mb-6">
        <FormattedMessage id="tools.textSpaceStripper.description" />
      </Paragraph>

      <Card>
        <Row gutter={[24, 24]}>
          {/* 左侧 - 输入和设置 */}
          <Col xs={24} md={12}>
            <Space orientation="vertical" size="large" className="w-full">
              {/* 输入区域 */}
              <div>
                <Text strong className="block mb-3">
                  <FormattedMessage id="tools.textSpaceStripper.input_text" />
                </Text>
                <Input.TextArea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={intl.formatMessage({ id: 'tools.textSpaceStripper.input_placeholder' })}
                  rows={10}
                />
                
                <div className="flex justify-end gap-2 mt-3">
                  <Button
                    icon={<ClearOutlined />}
                    onClick={clearText}
                    danger
                  >
                    <FormattedMessage id="tools.textSpaceStripper.clear" />
                  </Button>
                  <Button
                    icon={<PlayCircleOutlined />}
                    type="primary"
                    onClick={processText}
                  >
                    <FormattedMessage id="tools.textSpaceStripper.process" />
                  </Button>
                </div>
              </div>
              
              {/* 工具选项 */}
              <div>
                <Text strong className="block mb-3">
                  <FormattedMessage id="tools.textSpaceStripper.tool_options" />
                </Text>
                
                <Space orientation="vertical" size="middle" className="w-full">
                  {/* 去除方式 */}
                  <div>
                    <Text className="block mb-2">
                      <FormattedMessage id="tools.textSpaceStripper.strip_mode" />
                    </Text>
                    <Radio.Group 
                      value={stripMode} 
                      onChange={(e) => setStripMode(e.target.value)}
                      className="w-full"
                    >
                      <Space orientation="vertical" className="w-full">
                        <Radio value="both">
                          <FormattedMessage id="tools.textSpaceStripper.strip_mode_both" />
                        </Radio>
                        <Radio value="start">
                          <FormattedMessage id="tools.textSpaceStripper.strip_mode_start" />
                        </Radio>
                        <Radio value="end">
                          <FormattedMessage id="tools.textSpaceStripper.strip_mode_end" />
                        </Radio>
                        <Radio value="all">
                          <FormattedMessage id="tools.textSpaceStripper.strip_mode_all" />
                        </Radio>
                        <Radio value="newlines">
                          <FormattedMessage id="tools.textSpaceStripper.strip_mode_newlines" />
                        </Radio>
                        <Radio value="all_and_newlines">
                          <FormattedMessage id="tools.textSpaceStripper.strip_mode_all_and_newlines" />
                        </Radio>
                      </Space>
                    </Radio.Group>
                  </div>
                  
                  <Button
                    onClick={loadExample}
                    type="link"
                    className="p-0 h-auto text-left"
                  >
                    <FormattedMessage id="tools.textSpaceStripper.load_example" />
                  </Button>
                </Space>
              </div>
            </Space>
          </Col>
          
          {/* 右侧 - 输出结果 */}
          <Col xs={24} md={12}>
            <div>
              <div className="flex items-center justify-between mb-3">
                <Text strong>
                  <FormattedMessage id="tools.textSpaceStripper.output_text" />
                </Text>
                <Tooltip title={<FormattedMessage id="tools.textSpaceStripper.copy_result" />}>
                  <Button 
                    icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                    onClick={copyResult}
                    disabled={!outputText}
                  >
                    {copied ? 
                      <FormattedMessage id="tools.textSpaceStripper.copied" /> : 
                      <FormattedMessage id="tools.textSpaceStripper.copy_result" />}
                  </Button>
                </Tooltip>
              </div>
              
              <Input.TextArea
                value={outputText}
                readOnly
                placeholder={intl.formatMessage({ id: 'tools.textSpaceStripper.output_placeholder' })}
                rows={20}
              />
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}