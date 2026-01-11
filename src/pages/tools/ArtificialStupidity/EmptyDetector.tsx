import React, { useState } from 'react';
import { Card, Input, Button, Typography, Space, Progress, Result } from 'antd';
import { RobotOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';

const { TextArea } = Input;
const { Title, Text } = Typography;

const EmptyDetector: React.FC = () => {
    const [input, setInput] = useState('');
    const [status, setStatus] = useState<'idle' | 'analyzing' | 'finished'>('idle');
    const [percent, setPercent] = useState(0);
    const intl = useIntl();

    const handleAnalyze = () => {
        setStatus('analyzing');
        setPercent(0);
        let cur = 0;
        const interval = setInterval(() => {
            cur += Math.random() * 10;
            if (cur >= 100) {
                setPercent(100);
                clearInterval(interval);
                setTimeout(() => setStatus('finished'), 500);
            } else {
                setPercent(Math.floor(cur));
            }
        }, 300);
    };

    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="mb-8 text-center text-4xl">
                <Title level={1}><FormattedMessage id="tools.emptyDetector.name" /></Title>
                <Text type="secondary"><FormattedMessage id="tools.emptyDetector.description" /></Text>
            </div>

            <Card>
                {status === 'idle' && (
                    <Space orientation="vertical" className="w-full" size="large">
                        <TextArea
                            rows={8}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={intl.formatMessage({ id: 'tools.emptyDetector.placeholder' })}
                        />
                        <Button
                            type="primary"
                            size="large"
                            block
                            icon={<RobotOutlined />}
                            onClick={handleAnalyze}
                        >
                            <FormattedMessage id="tools.emptyDetector.start" />
                        </Button>
                    </Space>
                )}

                {status === 'analyzing' && (
                    <div className="py-12 text-center text-4xl">
                        <RobotOutlined className="text-5xl animate-bounce text-green-500 mb-6" />
                        <Title level={4}><FormattedMessage id="common.aiAnalyzing" /></Title>
                        <Progress percent={percent} strokeColor="#22c55e" status="active" />
                        <Text italic className="text-gray-500 block mt-4">
                            <FormattedMessage id="common.aiAnalyzingSub" />
                        </Text>
                    </div>
                )}

                {status === 'finished' && (
                    <Result
                        icon={<RobotOutlined className="text-green-500" style={{ fontSize: 72 }} />}
                        title={<FormattedMessage id="common.neuralComplete" />}
                        subTitle={
                            <div className="text-xl">
                                <Text strong className="text-green-400 block mb-2">
                                    <FormattedMessage id="common.regarding" values={{ input: input.trim() === '' ? intl.formatMessage({ id: 'common.textEmpty' }) : intl.formatMessage({ id: 'common.textNotEmpty' }) }} />
                                </Text>
                                <Text type="secondary">
                                    <FormattedMessage
                                        id="common.aiConfidence"
                                        values={{
                                            result: input.trim() === ''
                                                ? intl.formatMessage({ id: 'common.didNot' })
                                                : intl.formatMessage({ id: 'common.did' })
                                        }}
                                    />
                                </Text>
                            </div>
                        }
                        extra={<Button onClick={() => setStatus('idle')}><FormattedMessage id="common.analyzeAnother" /></Button>}
                    />
                )}
            </Card>
        </div>
    );
};

export default EmptyDetector;
