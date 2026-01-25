import React, { useState, useEffect } from 'react';
import { Card, Typography, Spin, Result, Button } from 'antd';
import { HourglassOutlined, CoffeeOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';

const { Title, Text } = Typography;

const WaitPage: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'waiting' | 'done'>('idle');
    const [seconds, setSeconds] = useState(0);
    const [target, setTarget] = useState(0);

    const startWaiting = () => {
        const t = Math.floor(Math.random() * 9) + 2; // 2-10 seconds
        setTarget(t);
        setSeconds(0);
        setStatus('waiting');
    };

    useEffect(() => {
        let interval: any;
        if (status === 'waiting') {
            interval = setInterval(() => {
                setSeconds(prev => {
                    if (prev + 1 >= target) {
                        clearInterval(interval);
                        setStatus('done');
                        return target;
                    }
                    return prev + 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status, target]);

    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
                <Title level={1}><FormattedMessage id="tools.waitPage.name" /></Title>
                <Text type="secondary"><FormattedMessage id="tools.waitPage.description" /></Text>
            </div>

            <Card className="text-center border-none bg-white/5 py-12">
                {status === 'idle' && (
                    <div className="py-12 text-center">
                        <CoffeeOutlined style={{ fontSize: 80, color: '#3b82f6', marginBottom: 32 }} />
                        <Title level={3}><FormattedMessage id="common.innerPeace" /></Title>
                        <p className="text-gray-500 mb-8"><FormattedMessage id="common.readyToDoNothing" /></p>
                        <Button
                            type="primary"
                            size="large"
                            onClick={startWaiting}
                            className="bg-green-600 rounded-full px-12 border-none"
                        >
                            <FormattedMessage id="common.beginTraining" />
                        </Button>
                    </div>
                )}

                {status === 'waiting' && (
                    <div className="py-12 text-center">
                        <Spin size="large" indicator={<HourglassOutlined style={{ fontSize: 64 }} spin />} />
                        <Title level={4} className="mt-8">
                            <FormattedMessage id="common.waitingTime" values={{ seconds }} />
                        </Title>
                        <Text className="italic text-gray-500"><FormattedMessage id="common.patienceVirtue" /></Text>
                    </div>
                )}

                {status === 'done' && (
                    <Result
                        status="success"
                        title={<span className="text-green-500"><FormattedMessage id="common.waitComplete" /></span>}
                        subTitle={<FormattedMessage id="common.waitCongratulations" values={{ target }} />}
                        extra={[
                            <Button key="again" onClick={() => setStatus('idle')}><FormattedMessage id="common.oneMoreTime" /></Button>
                        ]}
                    />
                )}
            </Card>
        </div>
    );
};

export default WaitPage;
