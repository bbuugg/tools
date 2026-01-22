import { useCopy } from '@/hooks/useCopy';
import {
    CheckCircleOutlined,
    CompressOutlined,
    CopyOutlined,
    DeleteOutlined,
    DownloadOutlined,
    EditOutlined,
    ExpandOutlined,
    FolderOpenOutlined,
    FolderOutlined,
    FormatPainterOutlined,
    HistoryOutlined,
    SaveOutlined,
    ScissorOutlined,
    SyncOutlined
} from '@ant-design/icons';
import { Alert, Button, Card, Checkbox, Col, Drawer, Input, Modal, Row, Select, Space, Tag, Typography } from 'antd';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

interface JsonHistoryItem {
    id: string;
    title: string;
    json: string;
    timestamp: number;
    isFavorite?: boolean;
}

const JsonFormatter: React.FC = () => {
    const intl = useIntl();
    const copy = useCopy();

    // State
    const [inputJson, setInputJson] = useState('');
    const [formattedJson, setFormattedJson] = useState('');
    const [validationError, setValidationError] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [pathResult, setPathResult] = useState('');
    const [isCompressed, setIsCompressed] = useState<boolean>(false);
    const [isFoldable, setIsFoldable] = useState<boolean>(true);
    const [copied, setCopied] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isLargeJson, setIsLargeJson] = useState<boolean>(false);
    const [validationResult, setValidationResult] = useState({
        isValid: false,
        message: ''
    });

    // 历史记录相关状态
    const [historyItems, setHistoryItems] = useState<JsonHistoryItem[]>([]);
    const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
    const [savingTitle, setSavingTitle] = useState<string>('');
    const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
    const [editingItem, setEditingItem] = useState<JsonHistoryItem | null>(null);

    // 参考值，确保能在格式化过程中保持加载状态
    const processingRef = useRef<boolean>(false);

    const [options, setOptions] = useState<FormatOptions>({
        indent: 2,
        sortKeys: false,
        compact: false,
        escapeUnicode: false,
        keyCase: 'preserve',
        valueCase: 'preserve',
    });

    // 从本地存储加载历史记录
    useEffect(() => {
        const savedHistory = localStorage.getItem('json_formatter_history');
        if (savedHistory) {
            try {
                const parsedHistory = JSON.parse(savedHistory) as JsonHistoryItem[];
                setHistoryItems(parsedHistory);
            } catch (e) {
                console.error(intl.formatMessage({ id: 'tools.jsonFormatter.load_history_error' }), e);
            }
        }
    }, [intl]);

    // 保存历史记录到本地存储
    const saveHistoryToLocalStorage = (items: JsonHistoryItem[]) => {
        localStorage.setItem('json_formatter_history', JSON.stringify(items));
    };

    // 格式化JSON
    const formatJson = useCallback(() => {
        if (!inputJson.trim()) {
            setFormattedJson('');
            setValidationError('');
            setIsValid(false);
            setValidationResult({ isValid: false, message: '' });
            return;
        }

        // 检查JSON大小
        const isLarge = inputJson.length > 100000;
        setIsLargeJson(isLarge);

        // 设置加载状态和处理参考值
        setIsLoading(true);
        processingRef.current = true;

        // 使用setTimeout确保UI先更新，但不添加不必要的延迟
        setTimeout(() => {
            try {
                // 处理可能的JS对象文本 (将单引号转为双引号)
                const processedJson = inputJson
                    .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // 键名标准化
                    .replace(/'/g, '"'); // 单引号转双引号

                try {
                    let parsed;
                    try {
                        parsed = JSON.parse(processedJson);
                    } catch (e) {
                        // 尝试使用eval处理JS对象（不安全，但为了更好的兼容性）
                        try {
                            // eslint-disable-next-line no-eval
                            parsed = eval('(' + inputJson + ')');
                        } catch (/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
                        _) {
                            throw e; // 如果eval也失败了，抛出原始错误
                        }
                    }

                    // 根据模式输出不同格式
                    let formattedJson;
                    if (options.compact || isCompressed) {
                        formattedJson = JSON.stringify(parsed);
                    } else {
                        formattedJson = JSON.stringify(parsed, null, options.indent === 'tab' ? '\t' : Number(options.indent));
                    }

                    // 计算大小
                    const sizeKB = (formattedJson.length / 1024).toFixed(1);
                    const largeJsonMessage = intl.formatMessage({ id: 'tools.jsonFormatter.large_json_processed' }).replace('{size}', sizeKB);

                    setFormattedJson(formattedJson);
                    setIsValid(true);
                    setValidationError('');
                    setValidationResult({
                        isValid: true,
                        message: isLarge ? largeJsonMessage : intl.formatMessage({ id: 'tools.jsonFormatter.json_valid' })
                    });

                    // 完成后取消加载状态和处理参考值
                    setIsLoading(false);
                    processingRef.current = false;
                } catch (error) {
                    if (error instanceof Error) {
                        setValidationError(error.message);
                        setIsValid(false);
                        setValidationResult({ isValid: false, message: intl.formatMessage({ id: 'tools.jsonFormatter.json_invalid' }) });
                        setIsLoading(false);
                        processingRef.current = false;
                    }
                }
            } catch (error) {
                if (error instanceof Error) {
                    setValidationError(error.message);
                    setIsValid(false);
                    setValidationResult({ isValid: false, message: intl.formatMessage({ id: 'tools.jsonFormatter.json_invalid' }) });
                    setIsLoading(false);
                    processingRef.current = false;
                }
            }
        }, 0);
    }, [inputJson, options, isCompressed, intl]);

    // 取消正在进行的格式化操作
    const cancelFormatting = () => {
        processingRef.current = false;
        setIsLoading(false);
    };

    // 清除组件卸载时可能的处理操作
    useEffect(() => {
        return () => {
            processingRef.current = false;
        };
    }, []);

    // 压缩/美化切换
    const toggleCompression = () => {
        setIsCompressed(!isCompressed);
        formatJson();
    };

    // 切换折叠功能
    const toggleFoldable = () => {
        setIsFoldable(!isFoldable);
    };

    // 移除JSON中的转义斜杠
    const removeSlashes = () => {
        if (!inputJson) return;

        try {
            // 直接在原始输入字符串上移除转义斜杠
            const processed = inputJson.replace(/\\\\\\/g, '/');

            // 检查是否有变化
            if (processed === inputJson) {
                console.log('没有检测到需要替换的内容，JSON未改变');
                return;
            }

            console.log('移除斜杠前:', inputJson);
            console.log('移除斜杠后:', processed);

            // 更新输入框而不是直接格式化
            setInputJson(processed);

            // 手动触发格式化
            setTimeout(() => formatJson(), 100);
        } catch (error) {
            console.error('移除斜杠处理失败:', error);
        }
    };

    // 字符串转义
    const escapeString = () => {
        if (!inputJson) return;

        try {
            // 将常见字符转义为JSON字符串中的格式
            const processed = inputJson
                .replace(/\\/g, '\\\\')    // 先转义反斜杠
                .replace(/"/g, '\\"')      // 转义双引号
                .replace(/\n/g, '\\n')     // 转义换行符
                .replace(/\r/g, '\\r')     // 转义回车符
                .replace(/\t/g, '\\t')     // 转义制表符
                .replace(/\f/g, '\\f')     // 转义换页符
                .replace(/\b/g, '\\b');    // 转义退格符

            // 检查是否有变化
            if (processed === inputJson) {
                console.log('没有检测到需要转义的内容');
                return;
            }

            // 更新输入框
            setInputJson(processed);

            // 不需要立即格式化，因为用户可能还需要进一步编辑
        } catch (error) {
            console.error('字符串转义处理失败:', error);
        }
    };

    // 字符串反转义
    const unescapeString = () => {
        if (!inputJson) return;

        try {
            // 将JSON字符串中的转义字符还原为原始字符
            const processed = inputJson
                .replace(/\\"/g, '"')      // 反转义双引号
                .replace(/\\n/g, '\n')     // 反转义换行符
                .replace(/\\r/g, '\r')     // 反转义回车符
                .replace(/\\t/g, '\t')     // 反转义制表符
                .replace(/\\f/g, '\f')     // 反转义换页符
                .replace(/\\b/g, '\b')     // 反转义退格符
                .replace(/\\\\/g, '\\');   // 最后反转义反斜杠

            // 检查是否有变化
            if (processed === inputJson) {
                console.log('没有检测到需要反转义的内容');
                return;
            }

            // 更新输入框
            setInputJson(processed);

            // 不需要立即格式化，因为用户可能还需要进一步编辑
        } catch (error) {
            console.error('字符串反转义处理失败:', error);
        }
    };

    // 复制结果到剪贴板
    const copyToClipboard = () => {
        if (formattedJson) {
            navigator.clipboard.writeText(formattedJson)
                .then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                })
                .catch(err => console.error(intl.formatMessage({ id: 'tools.jsonFormatter.copy_failed' }), err));
        }
    };

    // 清空输入
    const clearInput = () => {
        // 如果正在处理，先取消
        if (isLoading) {
            cancelFormatting();
        }

        setInputJson('');
        setFormattedJson('');
        setValidationError('');
        setIsValid(false);
        setValidationResult({ isValid: false, message: '' });
        setPathResult('');
    };

    // 重新格式化
    const reformat = () => {
        // 如果正在处理，先取消
        if (isLoading) {
            cancelFormatting();
        }

        formatJson();
    };

    // 保存当前JSON到历史记录
    const saveToHistory = () => {
        if (!formattedJson || !formattedJson.trim()) return;

        if (editingItem) {
            // 更新现有项目
            const updatedItem = {
                ...editingItem,
                title: savingTitle || `未命名 ${new Date().toLocaleString()}`,
                json: formattedJson,
                timestamp: Date.now()
            };

            const updatedHistory = historyItems.map(item =>
                item.id === editingItem.id ? updatedItem : item
            );

            setHistoryItems(updatedHistory);
            saveHistoryToLocalStorage(updatedHistory);
        } else {
            // 创建新项目
            const newItem: JsonHistoryItem = {
                id: Date.now().toString(),
                title: savingTitle || `未命名 ${new Date().toLocaleString()}`,
                json: formattedJson,
                timestamp: Date.now()
            };

            const updatedHistory = [newItem, ...historyItems];
            setHistoryItems(updatedHistory);
            saveHistoryToLocalStorage(updatedHistory);
        }

        // 重置状态
        setSavingTitle('');
        setIsSaveModalOpen(false);
        setEditingItem(null);
    };

    // 加载历史记录中的JSON
    const loadFromHistory = (item: JsonHistoryItem) => {
        setInputJson(item.json);
        formatJson();
        setIsHistoryOpen(false);
    };

    // 删除历史记录项目
    const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // 防止触发父元素的点击事件

        const updatedHistory = historyItems.filter(item => item.id !== id);
        setHistoryItems(updatedHistory);
        saveHistoryToLocalStorage(updatedHistory);
    };

    // 编辑历史记录项目标题
    const startEditingTitle = (item: JsonHistoryItem, e: React.MouseEvent) => {
        e.stopPropagation(); // 防止触发父元素的点击事件
        setEditingItem(item);
        setSavingTitle(item.title);
        setIsSaveModalOpen(true);
    };

    // 切换收藏状态
    const toggleFavorite = (id: string, e: React.MouseEvent) => {
        e.stopPropagation(); // 防止触发父元素的点击事件

        const updatedHistory = historyItems.map(item => {
            if (item.id === id) {
                return { ...item, isFavorite: !item.isFavorite };
            }
            return item;
        });

        setHistoryItems(updatedHistory);
        saveHistoryToLocalStorage(updatedHistory);
    };

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
            <div className="text-center mb-8">
                <Title level={1} className="text-white mb-2">
                    <FormattedMessage id="tools.jsonFormatter.name" />
                </Title>
                <Text className="text-slate-400 text-lg">
                    <FormattedMessage id="tools.jsonFormatter.description" />
                </Text>
            </div>

            {/* 工具栏 */}
            <div className="flex flex-wrap gap-2 mb-4">
                <Button
                    size="small"
                    onClick={toggleCompression}
                    disabled={isLoading}
                    icon={isCompressed ? <ExpandOutlined /> : <CompressOutlined />}
                >
                    {isCompressed ? intl.formatMessage({ id: 'tools.jsonFormatter.beautify' }) : intl.formatMessage({ id: 'tools.jsonFormatter.compress' })}
                </Button>
                <Button
                    size="small"
                    onClick={toggleFoldable}
                    disabled={isLoading || !formattedJson}
                    icon={isFoldable ? <FolderOutlined /> : <FolderOpenOutlined />}
                >
                    {isFoldable ? intl.formatMessage({ id: 'tools.jsonFormatter.normal_mode' }) : intl.formatMessage({ id: 'tools.jsonFormatter.fold_mode' })}
                </Button>
                <Button
                    size="small"
                    onClick={reformat}
                    disabled={!inputJson || isLoading}
                    icon={<SyncOutlined className={isLoading ? 'animate-spin' : ''} />}
                >
                    {isLoading ? intl.formatMessage({ id: 'tools.jsonFormatter.processing' }) : intl.formatMessage({ id: 'tools.jsonFormatter.reformat' })}
                </Button>

                {/* 新增的保存和历史记录按钮 */}
                <Button
                    size="small"
                    onClick={() => setIsSaveModalOpen(true)}
                    disabled={!formattedJson || isLoading}
                    icon={<SaveOutlined />}
                >
                    {intl.formatMessage({ id: 'tools.jsonFormatter.save' })}
                </Button>
                <Button
                    size="small"
                    onClick={() => setIsHistoryOpen(true)}
                    icon={<HistoryOutlined />}
                >
                    {intl.formatMessage({ id: 'tools.jsonFormatter.history' })}
                </Button>

                {/* 移除斜杠按钮 */}
                <Button
                    size="small"
                    onClick={removeSlashes}
                    disabled={!inputJson || isLoading}
                    icon={<ScissorOutlined />}
                >
                    {intl.formatMessage({ id: 'tools.jsonFormatter.remove_slash' })}
                </Button>

                {/* 字符串转义按钮 */}
                <Button
                    size="small"
                    onClick={escapeString}
                    disabled={!inputJson || isLoading}
                    icon={<FormatPainterOutlined />}
                >
                    {intl.formatMessage({ id: 'tools.jsonFormatter.escape_string' })}
                </Button>

                {/* 字符串反转义按钮 */}
                <Button
                    size="small"
                    onClick={unescapeString}
                    disabled={!inputJson || isLoading}
                    icon={<SyncOutlined />}
                >
                    {intl.formatMessage({ id: 'tools.jsonFormatter.unescape_string' })}
                </Button>

                <Checkbox
                    checked={options.escapeUnicode}
                    onChange={(e) => setOptions({ ...options, escapeUnicode: e.target.checked })}
                    className="text-slate-300"
                >
                    <FormattedMessage id="tools.jsonFormatter.escapeUnicode" defaultMessage="Escape Unicode" />
                </Checkbox>
                <Checkbox
                    checked={options.sortKeys}
                    onChange={(e) => setOptions({ ...options, sortKeys: e.target.checked })}
                    className="text-slate-300"
                >
                    <FormattedMessage id="tools.jsonFormatter.sortKeys" defaultMessage="Sort Keys" />
                </Checkbox>
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
                                    { label: 'Size', value: jsonStats.size, color: 'text-green-400' },
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
                                style={{ height: 'calc(100vh - 600px)', minHeight: '300px', resize: 'none' }}
                            />
                        )}
                    </Card>
                </Col>
            </Row>

            <Drawer open={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title={<FormattedMessage id="tools.jsonFormatter.history" />}>
                <div className="overflow-y-auto">
                    {historyItems.length === 0 ? (
                        <div className="text-center text-slate-500 py-10">
                            <FormattedMessage id="tools.jsonFormatter.noResults" defaultMessage="No history yet" />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {historyItems.map(item => (
                                <div
                                    key={item.id}
                                    className="p-3 rounded-md hover:bg-gray-100 transition-all cursor-pointer flex justify-between items-center mb-2"
                                    onClick={() => loadFromHistory(item)}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className=" truncate">{item.title}</div>
                                        <div className="text-slate-400 text-xs">
                                            {new Date(item.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                    <Space>
                                        <Button
                                            size="small"
                                            type={item.isFavorite ? "primary" : "text"}
                                            onClick={(e) => toggleFavorite(item.id, e)}
                                            className="text-yellow-400"
                                        >
                                            ★
                                        </Button>
                                        <Button
                                            size="small"
                                            onClick={(e) => startEditingTitle(item, e)}
                                        >
                                            <EditOutlined />
                                        </Button>
                                        <Button
                                            size="small"
                                            onClick={(e) => deleteHistoryItem(item.id, e)}
                                            danger
                                        >
                                            <DeleteOutlined />
                                        </Button>
                                    </Space>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Drawer>

            {/* 保存对话框 */}
            <Modal
                title={<FormattedMessage id="tools.jsonFormatter.save" />}
                open={isSaveModalOpen}
                onOk={saveToHistory}
                onCancel={() => setIsSaveModalOpen(false)}
            >
                <Input
                    value={savingTitle}
                    onChange={(e) => setSavingTitle(e.target.value)}
                    placeholder={intl.formatMessage({ id: 'tools.jsonFormatter.save' }) + ' ' + new Date().toLocaleString()}
                />
            </Modal>

            {/* 背景遮罩 */}
            {isHistoryOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsHistoryOpen(false)}
                ></div>
            )}
        </div>
    );
};

export default JsonFormatter;
