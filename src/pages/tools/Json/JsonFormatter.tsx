import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, Input, Button, Select, Checkbox, Typography, Space, Row, Col, Alert, Tag } from 'antd';
import {
    CopyOutlined,
    DownloadOutlined,
    DeleteOutlined,
    CheckCircleOutlined,
    FormatPainterOutlined
} from '@ant-design/icons';
import { useCopy } from '@/hooks/useCopy';
import { FormattedMessage, useIntl } from 'react-intl';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

interface FormatOptions {
    indent: number | 'tab';
    sortKeys: boolean;
    compact: boolean;
    escapeUnicode: boolean;
    keyCase: 'preserve' | 'upper' | 'lower';
    valueCase: 'preserve' | 'upper' | 'lower';
}

const JsonFormatter: React.FC = () => {
    const intl = useIntl();
    const copy = useCopy();

    // State
    const [inputJson, setInputJson] = useState('');
    const [formattedJson, setFormattedJson] = useState('');
    const [validationError, setValidationError] = useState('');
    const [isValid, setIsValid] = useState(false);

    const [options, setOptions] = useState<FormatOptions>({
        indent: 2,
        sortKeys: false,
        compact: false,
        escapeUnicode: false,
        keyCase: 'preserve',
        valueCase: 'preserve',
    });

    // Helper Functions
    const countKeys = (obj: any): number => {
        if (typeof obj !== 'object' || obj === null) return 0;
        if (Array.isArray(obj)) {
            return obj.reduce((count: number, item) => count + countKeys(item), 0);
        }
        return (
            Object.keys(obj).length +
            Object.values(obj).reduce((count: number, value) => count + countKeys(value), 0)
        );
    };

    const getMaxDepth = (obj: any, currentDepth = 0): number => {
        if (typeof obj !== 'object' || obj === null) return currentDepth;
        if (Array.isArray(obj)) {
            return Math.max(currentDepth, ...obj.map((item) => getMaxDepth(item, currentDepth + 1)));
        }
        return Math.max(
            currentDepth,
            ...Object.values(obj).map((value) => getMaxDepth(value, currentDepth + 1)),
        );
    };

    const sortObjectKeys = (obj: unknown): unknown => {
        if (Array.isArray(obj)) {
            return obj.map(sortObjectKeys);
        } else if (obj !== null && typeof obj === 'object') {
            const sortedObj: Record<string, unknown> = {};
            Object.keys(obj as Record<string, unknown>)
                .sort()
                .forEach((key) => {
                    sortedObj[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
                });
            return sortedObj;
        }
        return obj;
    };

    const convertCase = (obj: unknown): unknown => {
        if (Array.isArray(obj)) {
            return obj.map((item) => convertCase(item));
        } else if (obj !== null && typeof obj === 'object') {
            const convertedObj: Record<string, unknown> = {};

            Object.entries(obj as Record<string, unknown>).forEach(([key, value]) => {
                // Convert key case
                let convertedKey = key;
                if (options.keyCase === 'upper') {
                    convertedKey = key.toUpperCase();
                } else if (options.keyCase === 'lower') {
                    convertedKey = key.toLowerCase();
                }

                // Convert value case if it's a string, else recurse
                let convertedValue = value;
                if (typeof value === 'string' && options.valueCase !== 'preserve') {
                    if (options.valueCase === 'upper') {
                        convertedValue = value.toUpperCase();
                    } else if (options.valueCase === 'lower') {
                        convertedValue = value.toLowerCase();
                    }
                } else if (typeof value === 'object' && value !== null) {
                    convertedValue = convertCase(value);
                }

                convertedObj[convertedKey] = convertedValue;
            });

            return convertedObj;
        }

        // Handle primitive values (strings)
        if (typeof obj === 'string' && options.valueCase !== 'preserve') {
            if (options.valueCase === 'upper') {
                return obj.toUpperCase();
            } else if (options.valueCase === 'lower') {
                return obj.toLowerCase();
            }
        }

        return obj;
    };

    const formatJson = useCallback(() => {
        if (!inputJson.trim()) {
            setFormattedJson('');
            setValidationError('');
            setIsValid(false);
            return;
        }

        try {
            let data = JSON.parse(inputJson);
            setIsValid(true);
            setValidationError('');

            if (options.sortKeys) {
                data = sortObjectKeys(data);
            }

            if (options.keyCase !== 'preserve' || options.valueCase !== 'preserve') {
                data = convertCase(data);
            }

            let formatted: string;
            const indent = options.indent === 'tab' ? '\t' : Number(options.indent);

            if (options.compact) {
                formatted = JSON.stringify(data);
            } else {
                formatted = JSON.stringify(data, null, indent);
            }

            if (options.escapeUnicode) {
                formatted = formatted.replace(/[\u0080-\uFFFF]/g, function (match) {
                    return '\\u' + ('0000' + match.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            setFormattedJson(formatted);

        } catch (error: any) {
            setValidationError(error.message || String(error));
            setIsValid(false);
            setFormattedJson('');
        }
    }, [inputJson, options]);

    // Effects
    useEffect(() => {
        formatJson();
    }, [formatJson]);

    // Stats
    const jsonStats = useMemo(() => {
        if (!formattedJson) return { size: 0, lines: 0, keys: 0, depth: 0 };

        try {
            const parsed = JSON.parse(inputJson); // Parse original input to get logic stats
            return {
                size: formattedJson.length,
                lines: formattedJson.split('\n').length,
                keys: countKeys(parsed),
                depth: getMaxDepth(parsed)
            };
        } catch {
            return { size: 0, lines: 0, keys: 0, depth: 0 };
        }
    }, [formattedJson]);


    // Actions
    const handleLoadExample = () => {
        const example = {
            name: "John Doe",
            age: 30,
            city: "New York",
            hobbies: ["reading", "swimming", "coding"],
            address: { street: "123 Main St", zip: "10001" },
            active: true,
            metadata: null
        };
        setInputJson(JSON.stringify(example, null, 2));
    };

    const handleClear = () => {
        setInputJson('');
        setFormattedJson('');
        setValidationError('');
        setIsValid(false);
    };

    const handleDownload = () => {
        if (!formattedJson) return;
        const blob = new Blob([formattedJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `formatted_${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="max-w-7xl mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-10">
                <Title level={1} className="text-white mb-2">
                    <FormattedMessage id="tools.jsonFormatter.name" />
                </Title>
                <Text className="text-slate-400 text-lg">
                    <FormattedMessage id="tools.jsonFormatter.description" />
                </Text>
            </div>
            <Row gutter={[24, 24]}>
                {/* Input Section */}
                <Col xs={24} lg={12}>
                    <Card
                        className="border-none bg-white/5 h-full"
                        title={<FormattedMessage id="tools.jsonFormatter.inputTitle" defaultMessage="Input JSON" />}
                        extra={
                            <Space>
                                <Button size="small" onClick={handleLoadExample} className="border-none hover:text-white">
                                    <FormattedMessage id="common.loadExample" defaultMessage="Load Example" />
                                </Button>
                                <Button size="small" onClick={handleClear} icon={<DeleteOutlined />} className="border-none hover:text-white">
                                    <FormattedMessage id="common.clear" defaultMessage="Clear" />
                                </Button>
                            </Space>
                        }
                    >
                        <TextArea
                            value={inputJson}
                            onChange={(e) => setInputJson(e.target.value)}
                            placeholder={intl.formatMessage({ id: 'tools.jsonFormatter.placeholder', defaultMessage: 'Paste your JSON here...' })}
                            className="font-mono text-sm border-slate-700/50 text-slate-100 placeholder-slate-500 rounded-lg mb-4"
                            style={{ minHeight: '300px', resize: 'vertical' }}
                            spellCheck={false}
                        />

                        {/* Validation Status */}
                        {inputJson.trim() && (
                            <div className="mb-4">
                                {isValid ? (
                                    <Tag color="success" icon={<CheckCircleOutlined />}><FormattedMessage id="tools.jsonExtractor.validJson" defaultMessage="Valid JSON" /></Tag>
                                ) : (
                                    <Alert
                                        type="error"
                                        showIcon
                                        message={<FormattedMessage id="tools.jsonExtractor.invalidJson" defaultMessage="Invalid JSON" />}
                                        description={validationError}
                                        className="bg-red-500/10 border-red-500/30 text-red-200"
                                    />
                                )}
                            </div>
                        )}

                        {/* Options */}
                        <div className="p-4 rounded-lg border border-slate-700/30">
                            <Text strong className="mb-2 block"><FormattedMessage id="tools.jsonFormatter.options" defaultMessage="Format Options" /></Text>
                            <Row gutter={[16, 16]}>
                                <Col span={12}>
                                    <Text className="text-slate-400 text-xs mb-1 block"><FormattedMessage id="tools.jsonFormatter.indent" defaultMessage="Indent" /></Text>
                                    <Select
                                        value={options.indent}
                                        onChange={(val) => setOptions({ ...options, indent: val })}
                                        className="w-full"
                                        popupClassName=""
                                    >
                                        <Option value={2}>2 Spaces</Option>
                                        <Option value={4}>4 Spaces</Option>
                                        <Option value="tab"><FormattedMessage id="tools.jsonFormatter.tab" defaultMessage="Tab" /></Option>
                                    </Select>
                                </Col>
                                <Col span={12}>
                                    <Text className="text-slate-400 text-xs mb-1 block"><FormattedMessage id="tools.jsonFormatter.mode" defaultMessage="Mode" /></Text>
                                    <Select
                                        value={options.compact}
                                        onChange={(val) => setOptions({ ...options, compact: val })}
                                        className="w-full"
                                        popupClassName=""
                                    >
                                        <Option value={false}><FormattedMessage id="tools.jsonFormatter.pretty" defaultMessage="Pretty Print" /></Option>
                                        <Option value={true}><FormattedMessage id="tools.jsonFormatter.compact" defaultMessage="Compact" /></Option>
                                    </Select>
                                </Col>
                                <Col span={12}>
                                    <Text className="text-slate-400 text-xs mb-1 block"><FormattedMessage id="tools.jsonFormatter.keyCase" defaultMessage="Key Case" /></Text>
                                    <Select
                                        value={options.keyCase}
                                        onChange={(val) => setOptions({ ...options, keyCase: val })}
                                        className="w-full"
                                        popupClassName=""
                                    >
                                        <Option value="preserve"><FormattedMessage id="tools.jsonFormatter.preserve" defaultMessage="Preserve" /></Option>
                                        <Option value="upper"><FormattedMessage id="tools.jsonFormatter.uppercase" defaultMessage="UPPERCASE" /></Option>
                                        <Option value="lower"><FormattedMessage id="tools.jsonFormatter.lowercase" defaultMessage="lowercase" /></Option>
                                    </Select>
                                </Col>
                                <Col span={12}>
                                    <Text className="text-slate-400 text-xs mb-1 block"><FormattedMessage id="tools.jsonFormatter.valueCase" defaultMessage="Value Case" /></Text>
                                    <Select
                                        value={options.valueCase}
                                        onChange={(val) => setOptions({ ...options, valueCase: val })}
                                        className="w-full"
                                        popupClassName=""
                                    >
                                        <Option value="preserve"><FormattedMessage id="tools.jsonFormatter.preserve" defaultMessage="Preserve" /></Option>
                                        <Option value="upper"><FormattedMessage id="tools.jsonFormatter.uppercase" defaultMessage="UPPERCASE" /></Option>
                                        <Option value="lower"><FormattedMessage id="tools.jsonFormatter.lowercase" defaultMessage="lowercase" /></Option>
                                    </Select>
                                </Col>
                            </Row>
                            <div className="mt-4 space-x-4">
                                <Checkbox
                                    checked={options.sortKeys}
                                    onChange={(e) => setOptions({ ...options, sortKeys: e.target.checked })}
                                    className="text-slate-300"
                                >
                                    <FormattedMessage id="tools.jsonFormatter.sortKeys" defaultMessage="Sort Keys" />
                                </Checkbox>
                                <Checkbox
                                    checked={options.escapeUnicode}
                                    onChange={(e) => setOptions({ ...options, escapeUnicode: e.target.checked })}
                                    className="text-slate-300"
                                >
                                    <FormattedMessage id="tools.jsonFormatter.escapeUnicode" defaultMessage="Escape Unicode" />
                                </Checkbox>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Output Section */}
                <Col xs={24} lg={12}>
                    <Card
                        className="border-none bg-white/5 h-full"
                        title={<FormattedMessage id="tools.jsonFormatter.outputTitle" defaultMessage="Formatted Output" />}
                        extra={
                            <Space>
                                <Button size="small" onClick={() => copy(formattedJson)} disabled={!formattedJson} icon={<CopyOutlined />} type="dashed">
                                    <FormattedMessage id="common.copy" defaultMessage="Copy" />
                                </Button>
                                <Button size="small" onClick={handleDownload} disabled={!formattedJson} icon={<DownloadOutlined />} type="dashed">
                                    <FormattedMessage id="common.download" defaultMessage="Download" />
                                </Button>
                            </Space>
                        }
                    >
                        {/* Stats */}
                        {formattedJson && (
                            <Row gutter={[8, 8]} className="mb-4">
                                {[
                                    { label: 'Size', value: jsonStats.size, color: 'text-blue-400' },
                                    { label: 'Lines', value: jsonStats.lines, color: 'text-green-400' },
                                    { label: 'Keys', value: jsonStats.keys, color: 'text-orange-400' },
                                    { label: 'Depth', value: jsonStats.depth, color: 'text-purple-400' },
                                ].map(stat => (
                                    <Col span={6} key={stat.label}>
                                        <div className="rounded-lg p-2 text-center">
                                            <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                                            <div className="text-xs text-slate-500"><FormattedMessage id={`tools.jsonFormatter.stats.${stat.label.toLowerCase()}`} defaultMessage={stat.label} /></div>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                        )}

                        {!formattedJson ? (
                            <div className="h-96 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700/30 rounded-xl">
                                <FormatPainterOutlined className="text-4xl mb-4 opacity-50" />
                                <p><FormattedMessage id="tools.jsonFormatter.waitingInput" defaultMessage="Formatted JSON will appear here" /></p>
                            </div>
                        ) : (
                            <TextArea
                                value={formattedJson}
                                readOnly
                                className="font-mono text-sm border-slate-700 text-green-400 rounded-lg"
                                style={{ height: 'calc(100vh - 450px)', minHeight: '400px', resize: 'none' }}
                            />
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default JsonFormatter;
