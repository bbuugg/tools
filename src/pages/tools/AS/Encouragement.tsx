import React, { useState } from 'react';
import { Card, Input, Button, Typography, Result, Space } from 'antd';
import { SmileOutlined, LikeOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';

const { TextArea } = Input;
const { Title, Text } = Typography;

const Encouragement: React.FC = () => {
    const [input, setInput] = useState('');
    const [praise, setPraise] = useState<string | null>(null);
    const intl = useIntl();

    const getPraise = () => {
        const praises = [
            intl.formatMessage({ id: 'common.praise1' }),
            intl.formatMessage({ id: 'common.praise2' }),
            intl.formatMessage({ id: 'common.praise3' }),
            intl.formatMessage({ id: 'common.praise4' }),
            intl.formatMessage({ id: 'common.praise5' }),
            intl.formatMessage({ id: 'common.praise6' }),
            intl.formatMessage({ id: 'common.praise7' }),
            intl.formatMessage({ id: 'common.praise8' }),
        ];
        setPraise(praises[Math.floor(Math.random() * praises.length)]);
    };

    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
                <Title level={1}><FormattedMessage id="tools.encouragement.name" /></Title>
                <Text type="secondary"><FormattedMessage id="tools.encouragement.description" /></Text>
            </div>

            <Card className="border-none bg-white/5">
                {!praise ? (
                    <Space orientation='vertical' size={'middle'} style={{ width: "100%" }}>
                        <TextArea
                            rows={6}
                            placeholder={intl.formatMessage({ id: 'common.praisePlaceholder' })}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                        />
                        <Button
                            type="primary"
                            size="large"
                            block
                            icon={<LikeOutlined />}
                            disabled={!input.trim()}
                            onClick={getPraise}
                        >
                            <FormattedMessage id="common.getPraise" />
                        </Button>
                    </Space>
                ) : (
                    <Result
                        icon={<SmileOutlined className="text-yellow-500 animate-bounce" />}
                        title={praise}
                        subTitle={<FormattedMessage id="common.regarding" values={{ input }} />}
                        extra={[
                            <Button key="again" onClick={() => { setPraise(null); setInput(''); }}>
                                <FormattedMessage id="common.morePraise" />
                            </Button>
                        ]}
                    />
                )}
            </Card>
        </div>
    );
};

export default Encouragement;
