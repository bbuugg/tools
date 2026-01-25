import React, { useState } from 'react';
import { Card, Button, Typography, Statistic, Row, Col } from 'antd';
import { PlusOutlined, RedoOutlined, TrophyOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';

const { Title, Text } = Typography;

const ClickCounter: React.FC = () => {
    const [count, setCount] = useState(0);

    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
                <Title level={1}><FormattedMessage id="tools.clickCounter.name" /></Title>
                <Text type="secondary"><FormattedMessage id="tools.clickCounter.description" /></Text>
            </div>

            <Card className="text-center border-none bg-white/5 py-12">
                <Row gutter={16} className="mb-12">
                    <Col span={24}>
                        <Statistic
                            title={<FormattedMessage id="common.totalClicks" />}
                            value={count}
                            prefix={<TrophyOutlined className="text-yellow-500" />}
                            className="scale-150"
                        />
                    </Col>
                </Row>

                <div className="flex flex-col gap-4 items-center">
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => setCount(c => c + 1)}
                        className="h-24 w-24 rounded-full bg-green-600 hover:bg-green-500 text-3xl hover:scale-105 transition-transform flex items-center justify-center border-none"
                    />
                    <Text type="secondary" className="mt-4"><FormattedMessage id="common.clickToIncrease" /></Text>

                    <Button
                        type="link"
                        icon={<RedoOutlined />}
                        onClick={() => setCount(0)}
                        className="mt-8 text-gray-500"
                    >
                        <FormattedMessage id="common.resetProgress" />
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default ClickCounter;
