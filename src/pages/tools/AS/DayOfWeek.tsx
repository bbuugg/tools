import React, { useState } from 'react';
import { Card, Button, Typography, Spin, Result } from 'antd';
import { CalendarOutlined, RocketOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';

const { Title, Text } = Typography;

const DayOfWeek: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const intl = useIntl();

    const calculateDay = () => {
        setLoading(true);
        setResult(null);

        // Simulate heavy AI computation
        setTimeout(() => {
            const days = [
                'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
            ];
            const cnDays = [
                '星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'
            ];
            const now = new Date();
            const dayIndex = now.getDay();

            setResult(intl.locale === 'zh-CN' ? cnDays[dayIndex] : days[dayIndex]);
            setLoading(false);
        }, 3500);
    };

    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
                <Title level={1}><FormattedMessage id="tools.dayOfWeek.name" /></Title>
                <Text type="secondary"><FormattedMessage id="tools.dayOfWeek.description" /></Text>
            </div>

            <Card className="text-center py-12">
                {!loading && !result && (
                    <div className="text-center">
                        <CalendarOutlined style={{ fontSize: 80, color: '#22c55e', marginBottom: 32 }} />
                        <Title level={3}><FormattedMessage id="common.timeSync" /></Title>
                        <p className="text-2xl text-gray-500 mb-8"><FormattedMessage id="common.temporalAnalysis" /></p>
                        <Button
                            type="primary"
                            size="large"
                            icon={<RocketOutlined />}
                            onClick={calculateDay}
                            className="px-8 h-12 text-lg rounded-full"
                        >
                            <FormattedMessage id="common.askAi" />
                        </Button>
                    </div>
                )}

                {loading && (
                    <div className="py-8">
                        <Spin size="large" />
                        <Title level={4} className="mt-8"><FormattedMessage id="common.consultingTemporal" /></Title>
                        <Text className="italic text-gray-500"><FormattedMessage id="common.quantumTunneling" /></Text>
                    </div>
                )}

                {result && (
                    <Result
                        status="success"
                        title={<span className="text-3xl text-green-500 font-bold">{result}</span>}
                        subTitle={<FormattedMessage id="common.sophisticatedModels" />}
                        extra={[
                            <Button key="reset" onClick={() => setResult(null)}><FormattedMessage id="common.recalculate" /></Button>
                        ]}
                    />
                )}
            </Card>
        </div>
    );
};

export default DayOfWeek;
