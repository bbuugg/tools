import React, { useState } from 'react';
import { Card, Input, Button, Typography, message } from 'antd';
import { SwapOutlined, CopyOutlined, LoadingOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';

const { TextArea } = Input;
const { Title, Text } = Typography;

const IdentityTransformer: React.FC = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [processing, setProcessing] = useState(false);
    const intl = useIntl();

    const handleTransform = () => {
        if (!input.trim()) return;
        setProcessing(true);
        // High complexity processing simulation
        setTimeout(() => {
            setOutput(input);
            setProcessing(false);
            message.success(intl.formatMessage({ id: 'common.identityMapping' }));
        }, 1500);
    };

    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="mb-8 text-center">
                <Title level={1}><FormattedMessage id="tools.identity.name" /></Title>
                <Text type="secondary"><FormattedMessage id="tools.identity.description" /></Text>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title={<FormattedMessage id="common.sourceEntity" />} className="border-none bg-white/5">
                    <TextArea
                        rows={12}
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={intl.formatMessage({ id: 'common.identityMapping' })}
                    />
                </Card>

                <Card
                    title={<FormattedMessage id="common.transformedResult" />}
                    className="border-none bg-white/5"
                    extra={
                        <Button
                            icon={<CopyOutlined />}
                            disabled={!output}
                            onClick={() => {
                                navigator.clipboard.writeText(output);
                                message.success(intl.formatMessage({ id: 'common.copiedIdentical' }));
                            }}
                        >
                            <FormattedMessage id="common.copyResult" />
                        </Button>
                    }
                >
                    <TextArea
                        rows={12}
                        value={output}
                        readOnly
                        placeholder={intl.formatMessage({ id: 'common.transformedResult' })}
                        className="bg-gray-50/5"
                    />
                </Card>
            </div>

            <div className="mt-8 text-center flex flex-col gap-4">
                <Button
                    type="primary"
                    size="large"
                    icon={processing ? <LoadingOutlined /> : <SwapOutlined />}
                    onClick={handleTransform}
                    disabled={processing || !input.trim()}
                    className="bg-green-600 rounded-full px-12 h-12 text-lg border-none"
                >
                    {processing ? <FormattedMessage id="common.processingAlgorithms" /> : <FormattedMessage id="common.executeTransformation" />}
                </Button>
                <Text type="secondary" className="italic mt-4">
                    <FormattedMessage id="common.identityMapping" />
                </Text>
            </div>
        </div>
    );
};

export default IdentityTransformer;
