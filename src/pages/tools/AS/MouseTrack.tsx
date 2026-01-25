import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Typography, Space } from 'antd';
import { LineChartOutlined, StopOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';

const { Title, Text } = Typography;

const MouseTrack: React.FC = () => {
    const [recording, setRecording] = useState(false);
    const [points, setPoints] = useState<{ x: number; y: number }[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!recording) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setPoints(prev => [...prev.slice(-500), {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                }]);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [recording]);

    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="mb-8 text-center">
                <Title level={1}><FormattedMessage id="tools.mouseTrack.name" /></Title>
                <Text type="secondary"><FormattedMessage id="tools.mouseTrack.description" /></Text>
            </div>

            <Card className="border-none bg-white/5 overflow-hidden">
                <div className="mb-6 flex justify-between items-center">
                    <Space>
                        <Button
                            type={recording ? 'primary' : 'default'}
                            danger={recording}
                            onClick={() => setRecording(!recording)}
                            icon={recording ? <StopOutlined /> : <LineChartOutlined />}
                        >
                            <FormattedMessage id={recording ? 'common.stopRecording' : 'common.startRecording'} />
                        </Button>
                        <Button onClick={() => setPoints([])}>
                            <FormattedMessage id="common.clearTrack" />
                        </Button>
                    </Space>
                    <Text type="secondary">
                        <FormattedMessage id="common.pointsRecorded" values={{ count: points.length }} />
                    </Text>
                </div>

                <div
                    ref={containerRef}
                    className="h-[400px] w-full border border-dashed border-gray-600 rounded-lg relative"
                >
                    <svg className="w-full h-full pointer-events-none">
                        <polyline
                            points={points.map(p => `${p.x},${p.y}`).join(' ')}
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            opacity="0.6"
                        />
                    </svg>
                    {!recording && points.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                            <FormattedMessage id="common.mousePlaceholder" />
                        </div>
                    )}
                </div>
            </Card>

            <div className="mt-8">
                <Title level={4}><FormattedMessage id="common.efficiencyAnalysis" /></Title>
                <Card className="bg-green-500/10 border-none">
                    <Text type="success">
                        <FormattedMessage id="common.mouseTrackResult" values={{ pixels: Math.round(points.length * 0.5) }} />
                    </Text>
                </Card>
            </div>
        </div>
    );
};

export default MouseTrack;
