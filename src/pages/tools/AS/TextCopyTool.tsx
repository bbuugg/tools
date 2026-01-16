import React, { useState } from 'react';
import { Card, Input, Button, Typography, message } from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { useCopy } from '@/hooks/useCopy';
import { FormattedMessage, useIntl } from 'react-intl';

const { TextArea } = Input;
const { Title, Text } = Typography;

const TextCopyTool: React.FC = () => {
    const [text, setText] = useState('');
    const copy = useCopy();
    const intl = useIntl();

    const handleCopy = async () => {
        if (!text.trim()) {
            message.warning(intl.formatMessage({ id: 'common.enterText', defaultMessage: 'Please enter some text first' }));
            return;
        }
        await copy(text);
    };

    const handleClear = () => {
        setText('');
    };

    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="mb-8 text-center">
                <Title level={1}><FormattedMessage id="tools.textCopy.name" /></Title>
                <Text type="secondary"><FormattedMessage id="tools.textCopy.description" /></Text>
            </div>

            <Card
                className="border-none bg-white/5"
                actions={[
                    <Button
                        key="clear"
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleClear}
                        disabled={!text}
                    >
                        <FormattedMessage id="common.clear" />
                    </Button>,
                    <Button
                        key="copy"
                        type="primary"
                        icon={<CopyOutlined />}
                        onClick={handleCopy}
                        disabled={!text}
                        className="px-8"
                    >
                        <FormattedMessage id="common.copy" />
                    </Button>
                ]}
            >
                <TextArea
                    rows={12}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={intl.formatMessage({ id: 'home.searchPlaceholder' })}
                    className="border-none bg-transparent text-lg focus:ring-0 resize-none font-sans"
                    style={{ boxShadow: 'none' }}
                />
            </Card>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card size="small" className="text-center border-none bg-gray-50/5">
                    <Text strong className="block text-2xl">{text.length}</Text>
                    <Text type="secondary" className="text-xs"><FormattedMessage id="common.characters" /></Text>
                </Card>
                <Card size="small" className="text-center border-none bg-gray-50/5">
                    <Text strong className="block text-2xl">{text.trim() === '' ? 0 : text.trim().split(/\s+/).length}</Text>
                    <Text type="secondary" className="text-xs"><FormattedMessage id="common.words" /></Text>
                </Card>
                <Card size="small" className="text-center border-none bg-gray-50/5">
                    <Text strong className="block text-2xl">{text.trim() === '' ? 0 : text.split('\n').length}</Text>
                    <Text type="secondary" className="text-xs"><FormattedMessage id="common.lines" /></Text>
                </Card>
            </div>
        </div>
    );
};

export default TextCopyTool;
