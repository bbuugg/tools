import React, { useState } from 'react';
import { Card, Button, Typography, Progress, Result } from 'antd';
import { PoweroffOutlined, LoadingOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';

const { Title, Text } = Typography;

const PowerOnDetector: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'detecting' | 'finished'>('idle');
    const [percent, setPercent] = useState(0);

    const startDetection = () => {
        setStatus('detecting');
        setPercent(0);

        const duration = Math.floor(Math.random() * 4000) + 2000;
        const interval = 50;
        const steps = duration / interval;
        const increment = 100 / steps;

        let currentPercent = 0;
        const timer = setInterval(() => {
            currentPercent += increment;
            if (currentPercent >= 100) {
                setPercent(100);
                clearInterval(timer);
                setTimeout(() => {
                    setStatus('finished');
                }, 500);
            } else {
                setPercent(Math.floor(currentPercent));
            }
        }, interval);
    };

    const reset = () => {
        setStatus('idle');
        setPercent(0);
    };

    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
                <Title level={1}><FormattedMessage id="tools.powerOn.name" /></Title>
                <Text type="secondary"><FormattedMessage id="tools.powerOn.description" /></Text>
            </div>

            <Card className="text-center border-none bg-white/5">
                {status === 'idle' && (
                    <div className="py-12">
                        <PoweroffOutlined style={{ fontSize: 64, color: '#22c55e', marginBottom: 24 }} />
                        <Title level={4}><FormattedMessage id="tools.powerOn.readyTitle" /></Title>
                        <p className="mb-8 text-gray-500"><FormattedMessage id="tools.powerOn.readyDesc" /></p>
                        <Button
                            type="primary"
                            size="large"
                            onClick={startDetection}
                            className="bg-green-600 hover:bg-green-500 border-none px-12 h-12 text-lg rounded-full"
                        >
                            <FormattedMessage id="tools.powerOn.startAction" />
                        </Button>
                    </div>
                )}

                {status === 'detecting' && (
                    <div className="py-12">
                        <LoadingOutlined style={{ fontSize: 64, color: '#22c55e', marginBottom: 24 }} spin />
                        <Title level={4}><FormattedMessage id="common.detecting" /></Title>
                        <div className="max-w-xs mx-auto mt-6">
                            <Progress
                                percent={percent}
                                status="active"
                                strokeColor="#22c55e"
                                showInfo={false}
                            />
                            <Text type="secondary" className="mt-4 block italic">
                                {percent < 30 && <FormattedMessage id="tools.powerOn.step1" />}
                                {percent >= 30 && percent < 60 && <FormattedMessage id="tools.powerOn.step2" />}
                                {percent >= 60 && percent < 90 && <FormattedMessage id="tools.powerOn.step3" />}
                                {percent >= 90 && <FormattedMessage id="tools.powerOn.step4" />}
                            </Text>
                        </div>
                    </div>
                )}

                {status === 'finished' && (
                    <div className="py-12">
                        <Result
                            status="success"
                            icon={<CheckCircleOutlined style={{ color: '#22c55e' }} />}
                            title={<span className="text-green-600"><FormattedMessage id="common.complete" /></span>}
                            subTitle={
                                <div className="text-lg">
                                    <p className="font-bold text-gray-200"><FormattedMessage id="tools.powerOn.result" /></p>
                                    <p className="text-sm text-gray-500 mt-2"><FormattedMessage id="common.diagnosis" /></p>
                                </div>
                            }
                            extra={[
                                <Button key="again" onClick={reset} className="rounded-full">
                                    <FormattedMessage id="common.again" />
                                </Button>
                            ]}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default PowerOnDetector;
