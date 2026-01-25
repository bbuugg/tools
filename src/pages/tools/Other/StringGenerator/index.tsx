import React, { useState, useEffect } from "react";
import {
    Card,
    Button,
    Input,
    InputNumber,
    Checkbox,
    Space,
    Typography,
    message,
    Tabs,
    Divider,
} from "antd";
import { CopyOutlined, ReloadOutlined } from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";
import { v4 as uuidv4 } from "uuid";
import { ulid } from "ulid";

const { Title, Text } = Typography;
const { TextArea } = Input;

const StringGenerator: React.FC = () => {
    const intl = useIntl();
    const [uuidCount, setUuidCount] = useState<number>(10);
    const [uuidResult, setUuidResult] = useState<string>("");

    const [randomLength, setRandomLength] = useState<number>(16);
    const [randomCount, setRandomCount] = useState<number>(10);
    const [includeUppercase, setIncludeUppercase] = useState(true);
    const [includeLowercase, setIncludeLowercase] = useState(true);
    const [includeNumbers, setIncludeNumbers] = useState(true);
    const [includeSymbols, setIncludeSymbols] = useState(false);
    const [customChars, setCustomChars] = useState("");
    const [randomResult, setRandomResult] = useState<string>("");

    const [ulidCount, setUlidCount] = useState<number>(10);
    const [ulidResult, setUlidResult] = useState<string>("");

    const handleGenerateUUID = () => {
        const uuids = Array.from({ length: uuidCount }, () => uuidv4());
        setUuidResult(uuids.join("\n"));
    };

    const handleGenerateULID = () => {
        const ulids = Array.from({ length: ulidCount }, () => ulid());
        setUlidResult(ulids.join("\n"));
    };

    const handleGenerateRandom = () => {
        let charset = customChars;
        if (!charset) {
            if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
            if (includeNumbers) charset += "0123456789";
            if (includeSymbols) charset += "!@#$%^&*()_+~`|}{[]:;?><,./-=";
        }

        if (!charset) {
            message.error(intl.formatMessage({ id: "tools.stringGenerator.errorNoCharset" }));
            return;
        }

        const results = Array.from({ length: randomCount }, () => {
            let str = "";
            for (let i = 0; i < randomLength; i++) {
                str += charset.charAt(Math.floor(Math.random() * charset.length));
            }
            return str;
        });

        setRandomResult(results.join("\n"));
    };

    useEffect(() => {
        // Generate initial values on mount
        const initialUuids = Array.from({ length: 10 }, () => uuidv4());
        setUuidResult(initialUuids.join("\n"));

        const initialUlids = Array.from({ length: 10 }, () => ulid());
        setUlidResult(initialUlids.join("\n"));

        // Default random charset
        let charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const initialRandom = Array.from({ length: 10 }, () => {
            let str = "";
            for (let i = 0; i < 16; i++) {
                str += charset.charAt(Math.floor(Math.random() * charset.length));
            }
            return str;
        });
        setRandomResult(initialRandom.join("\n"));
    }, []);

    const copyToClipboard = (text: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        message.success(intl.formatMessage({ id: "common.copySuccess" }));
    };

    return (
        <div className="">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Title level={2}>
                        <FormattedMessage id="tools.stringGenerator.name" />
                    </Title>
                    <Text type="secondary">
                        <FormattedMessage id="tools.stringGenerator.description" />
                    </Text>
                </div>

                <Tabs
                    defaultActiveKey="uuid"
                    items={[
                        {
                            key: "uuid",
                            label: "UUID",
                            children: (
                                <Card>
                                    <Space direction="vertical" style={{ width: "100%" }} size="large">
                                        <Space align="center">
                                            <Text><FormattedMessage id="tools.stringGenerator.count" /></Text>
                                            <InputNumber min={1} max={100} value={uuidCount} onChange={(v) => setUuidCount(v || 1)} />
                                            <Button type="primary" icon={<ReloadOutlined />} onClick={handleGenerateUUID}>
                                                <FormattedMessage id="tools.stringGenerator.generate" />
                                            </Button>
                                        </Space>
                                        {uuidResult && (
                                            <div style={{ position: "relative" }}>
                                                <TextArea value={uuidResult} autoSize={{ minRows: 3, maxRows: 15 }} readOnly />
                                                <Button
                                                    icon={<CopyOutlined />}
                                                    style={{ position: "absolute", top: 8, right: 8 }}
                                                    onClick={() => copyToClipboard(uuidResult)}
                                                />
                                            </div>
                                        )}
                                    </Space>
                                </Card>
                            ),
                        },
                        {
                            key: "ulid",
                            label: "ULID",
                            children: (
                                <Card>
                                    <Space direction="vertical" style={{ width: "100%" }} size="large">
                                        <Space align="center">
                                            <Text><FormattedMessage id="tools.stringGenerator.count" /></Text>
                                            <InputNumber min={1} max={100} value={ulidCount} onChange={(v) => setUlidCount(v || 1)} />
                                            <Button type="primary" icon={<ReloadOutlined />} onClick={handleGenerateULID}>
                                                <FormattedMessage id="tools.stringGenerator.generate" />
                                            </Button>
                                        </Space>
                                        {ulidResult && (
                                            <div style={{ position: "relative" }}>
                                                <TextArea value={ulidResult} autoSize={{ minRows: 3, maxRows: 15 }} readOnly />
                                                <Button
                                                    icon={<CopyOutlined />}
                                                    style={{ position: "absolute", top: 8, right: 8 }}
                                                    onClick={() => copyToClipboard(ulidResult)}
                                                />
                                            </div>
                                        )}
                                    </Space>
                                </Card>
                            ),
                        },
                        {
                            key: "random",
                            label: <FormattedMessage id="tools.stringGenerator.randomString" />,
                            children: (
                                <Card>
                                    <Space direction="vertical" style={{ width: "100%" }} size="middle">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Space direction="vertical">
                                                <Text strong><FormattedMessage id="tools.stringGenerator.length" /></Text>
                                                <InputNumber min={1} max={1024} value={randomLength} onChange={(v) => setRandomLength(v || 16)} style={{ width: "100%" }} />
                                            </Space>
                                            <Space direction="vertical">
                                                <Text strong><FormattedMessage id="tools.stringGenerator.count" /></Text>
                                                <InputNumber min={1} max={100} value={randomCount} onChange={(v) => setRandomCount(v || 1)} style={{ width: "100%" }} />
                                            </Space>
                                        </div>

                                        <Divider orientation="left" plain><FormattedMessage id="tools.stringGenerator.characterSet" /></Divider>

                                        <div className="flex flex-wrap gap-4">
                                            <Checkbox checked={includeUppercase} onChange={(e) => setIncludeUppercase(e.target.checked)}>
                                                ABC
                                            </Checkbox>
                                            <Checkbox checked={includeLowercase} onChange={(e) => setIncludeLowercase(e.target.checked)}>
                                                abc
                                            </Checkbox>
                                            <Checkbox checked={includeNumbers} onChange={(e) => setIncludeNumbers(e.target.checked)}>
                                                123
                                            </Checkbox>
                                            <Checkbox checked={includeSymbols} onChange={(e) => setIncludeSymbols(e.target.checked)}>
                                                #$&
                                            </Checkbox>
                                        </div>

                                        <Space direction="vertical" style={{ width: "100%" }}>
                                            <Text><FormattedMessage id="tools.stringGenerator.customChars" /></Text>
                                            <Input
                                                placeholder={intl.formatMessage({ id: "tools.stringGenerator.customCharsPlaceholder" })}
                                                value={customChars}
                                                onChange={(e) => setCustomChars(e.target.value)}
                                            />
                                        </Space>

                                        <Button type="primary" block icon={<ReloadOutlined />} onClick={handleGenerateRandom} size="large">
                                            <FormattedMessage id="tools.stringGenerator.generate" />
                                        </Button>

                                        {randomResult && (
                                            <div style={{ position: "relative" }}>
                                                <TextArea value={randomResult} autoSize={{ minRows: 3, maxRows: 15 }} readOnly />
                                                <Button
                                                    icon={<CopyOutlined />}
                                                    style={{ position: "absolute", top: 8, right: 8 }}
                                                    onClick={() => copyToClipboard(randomResult)}
                                                />
                                            </div>
                                        )}
                                    </Space>
                                </Card>
                            ),
                        },
                    ]}
                />
            </div>
        </div>
    );
};

export default StringGenerator;
