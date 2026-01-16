import React from 'react';
import { Card, Typography, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';

const { Title, Text } = Typography;

const TypingSimulator: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
                <Title level={1}><FormattedMessage id="tools.typing.name" /></Title>
                <Text type="secondary"><FormattedMessage id="tools.typing.description" /></Text>
            </div>

            <Card className="border-none bg-white/5">
                <div className="flex flex-col h-[400px]">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="flex items-end gap-2">
                            <Avatar icon={<UserOutlined />} />
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg rounded-bl-none max-w-xs">
                                <Text><FormattedMessage id="common.typingImportant" /></Text>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-700/50 flex items-center gap-3">
                        <div className="flex gap-1 animate-pulse">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                        </div>
                        <Text type="secondary" className="italic">
                            <FormattedMessage id="common.typingStatus" />
                        </Text>
                    </div>
                </div>
            </Card>

            <p className="mt-8 text-center text-gray-500 text-sm">
                <FormattedMessage id="common.typingWait" />
            </p>
        </div>
    );
};

export default TypingSimulator;
