import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Progress, message } from 'antd';
import { HeartOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';

const { Title, Text } = Typography;

const BreathingReminder: React.FC = () => {
    const [active, setActive] = useState(false);
    const [phase, setPhase] = useState<'In' | 'Out'>('In');
    const [timer, setTimer] = useState(0);
    const intl = useIntl();

    useEffect(() => {
        let interval: any;
        if (active) {
            interval = setInterval(() => {
                setTimer(prev => {
                    const next = (prev + 1) % 100;
                    if (next === 0) {
                        setPhase(p => {
                            const newPhase = p === 'In' ? 'Out' : 'In';
                            message.info(intl.formatMessage({ id: newPhase === 'In' ? 'common.breatheIn' : 'common.breatheOut' }));
                            return newPhase;
                        });
                    }
                    return next;
                });
            }, 50); // 5 seconds per phase (10s total)
        }
        return () => clearInterval(interval);
    }, [active, intl]);

    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
                <Title level={1}><FormattedMessage id="tools.breathing.name" /></Title>
                <Text type="secondary"><FormattedMessage id="tools.breathing.description" /></Text>
            </div>

            <Card className="text-center border-none bg-white/5 py-12">
                <div className={`transition-all duration-1000 transform ${phase === 'In' ? 'scale-110' : 'scale-90'}`}>
                    <HeartOutlined
                        className={`text-6xl mb-6 ${active ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}
                    />
                </div>

                <Title level={3} className="min-h-[40px]">
                    {active ? (
                        <FormattedMessage id={phase === 'In' ? 'common.inhale' : 'common.exhale'} />
                    ) : (
                        <FormattedMessage id="common.standby" />
                    )}
                </Title>

                <div className="max-w-xs mx-auto my-8">
                    <Progress
                        type="circle"
                        percent={timer}
                        strokeColor={phase === 'In' ? '#22c55e' : '#3b82f6'}
                        format={() => `${Math.ceil((100 - timer) / 20)}s`}
                    />
                </div>

                <Button
                    type="primary"
                    size="large"
                    icon={active ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                    onClick={() => setActive(!active)}
                    className={`rounded-full px-12 ${active ? 'bg-red-500 border-none' : 'bg-green-600 border-none'}`}
                >
                    <FormattedMessage id={active ? 'common.stopReminding' : 'common.startReminder'} />
                </Button>

                <p className="mt-8 text-gray-400 italic">
                    <FormattedMessage id="common.oxygenCritical" />
                </p>
            </Card>
        </div>
    );
};

export default BreathingReminder;
