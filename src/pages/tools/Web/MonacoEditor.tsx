import { useCopy } from '@/hooks/useCopy';
import { useThemeStore } from '@/store/useThemeStore';
import {
    BgColorsOutlined,
    CodeOutlined,
    CopyOutlined,
    DeleteOutlined,
    DownloadOutlined,
    FullscreenOutlined,
    GlobalOutlined
} from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { Badge, Button, Card, Col, Divider, InputNumber, Row, Select, Space, Switch, Tooltip, Typography, message } from 'antd';
import React, { useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Supported languages in Monaco
const LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'python', label: 'Python' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'cpp', label: 'C++' },
    { value: 'java', label: 'Java' },
    { value: 'sql', label: 'SQL' },
    { value: 'xml', label: 'XML' },
    { value: 'yaml', label: 'YAML' },
    { value: 'shell', label: 'Shell' },
];

const MonacoEditorTool: React.FC = () => {
    const intl = useIntl();
    const copy = useCopy();
    const { theme: appTheme } = useThemeStore();

    // Editor State
    const [value, setValue] = useState<string>('// Welcome to Monaco Editor\n\nfunction helloWorld() {\n    console.log("Hello, world!");\n}\n\nhelloWorld();');
    const [language, setLanguage] = useState<string>('javascript');
    const [fontSize, setFontSize] = useState<number>(14);
    const [minimap, setMinimap] = useState<boolean>(true);
    const [readOnly, setReadOnly] = useState<boolean>(false);
    const [wordWrap, setWordWrap] = useState<'on' | 'off'>('on');

    // Map app theme to monaco theme
    const monacoTheme = appTheme === 'dark' ? 'vs-dark' : 'light';

    const editorRef = useRef<any>(null);

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
    };

    const handleCopy = async () => {
        const success = await copy(value);
        if (success) {
            message.success(intl.formatMessage({ id: 'common.copySuccess' }));
        }
    };

    const handleDownload = () => {
        const blob = new Blob([value], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const ext = LANGUAGES.find(l => l.value === language)?.label.toLowerCase().replace('++', 'cpp') || 'txt';
        a.download = `code_${Date.now()}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleClear = () => {
        setValue('');
    };

    const handleFormat = () => {
        if (editorRef.current) {
            editorRef.current.getAction('editor.action.formatDocument').run();
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 animate-fade-in">
            <div className="text-center mb-6">
                <Title level={2} className="!mb-2">
                    <FormattedMessage id="tools.monacoEditor.name" />
                </Title>
                <Paragraph className="text-slate-500">
                    <FormattedMessage id="tools.monacoEditor.description" />
                </Paragraph>
            </div>

            {/* Toolbar Area */}
            <Card
                className="border-none"
                bodyStyle={{ padding: '12px 24px' }}
            >
                <Row justify="space-between" align="middle" gutter={[16, 16]}>
                    <Col>
                        <Space size="large" split={<Divider type="vertical" className="h-6" />}>
                            <Space>
                                <Text strong className="text-xs uppercase text-slate-400"><FormattedMessage id="common.language" /></Text>
                                <Select
                                    size="small"
                                    className="min-w-[140px]"
                                    value={language}
                                    onChange={setLanguage}
                                    showSearch
                                    optionFilterProp="label"
                                >
                                    {LANGUAGES.map(lang => (
                                        <Option key={lang.value} value={lang.value} label={lang.label}>
                                            {lang.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Space>

                            <Space>
                                <Text strong className="text-xs uppercase text-slate-400"><FormattedMessage id="tools.monacoEditor.fontSize" /></Text>
                                <InputNumber
                                    size="small"
                                    min={10}
                                    max={40}
                                    value={fontSize}
                                    onChange={(v) => setFontSize(v || 14)}
                                />
                            </Space>

                            <Space size="middle">
                                <Tooltip title={intl.formatMessage({ id: 'tools.monacoEditor.minimap' })}>
                                    <Space size={4}>
                                        <Text className="text-xs text-slate-400">Map</Text>
                                        <Switch checked={minimap} onChange={setMinimap} size="small" />
                                    </Space>
                                </Tooltip>
                                <Tooltip title={intl.formatMessage({ id: 'tools.monacoEditor.wordWrap' })}>
                                    <Space size={4}>
                                        <Text className="text-xs text-slate-400">Wrap</Text>
                                        <Switch checked={wordWrap === 'on'} onChange={(checked) => setWordWrap(checked ? 'on' : 'off')} size="small" />
                                    </Space>
                                </Tooltip>
                                <Tooltip title={intl.formatMessage({ id: 'tools.monacoEditor.readOnly' })}>
                                    <Space size={4}>
                                        <Text className="text-xs text-slate-400">Lock</Text>
                                        <Switch checked={readOnly} onChange={setReadOnly} size="small" />
                                    </Space>
                                </Tooltip>
                            </Space>
                        </Space>
                    </Col>

                    <Col>
                        <Space>
                            <Button
                                size="small"
                                type="primary"
                                ghost
                                icon={<CodeOutlined />}
                                onClick={handleFormat}
                            >
                                <FormattedMessage id="tools.monacoEditor.format" />
                            </Button>
                            <Button
                                size="small"
                                icon={<CopyOutlined />}
                                onClick={handleCopy}
                            >
                                <FormattedMessage id="common.copy" />
                            </Button>
                            <Button
                                size="small"
                                icon={<DownloadOutlined />}
                                onClick={handleDownload}
                            >
                                <FormattedMessage id="common.download" />
                            </Button>
                            <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={handleClear}
                            >
                                <FormattedMessage id="common.clear" />
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Editor Area */}
            <Card
                className="border-none overflow-hidden"
                bodyStyle={{ padding: 0 }}
            >
                <div className="bg-slate-50 dark:bg-slate-900/40 px-4 py-1 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <Space>
                        <Badge status="processing" color={monacoTheme === 'vs-dark' ? '#1890ff' : '#52c41a'} />
                        <Text className="text-[10px] uppercase font-mono tracking-wider opacity-70">
                            {LANGUAGES.find(l => l.value === language)?.label} Mode
                        </Text>
                    </Space>
                    <Text type="secondary" className="text-[10px] uppercase font-mono tracking-wider opacity-50">
                        {monacoTheme}
                    </Text>
                </div>
                <Editor
                    height="75vh"
                    language={language}
                    theme={monacoTheme}
                    value={value}
                    onChange={(v) => setValue(v || '')}
                    onMount={handleEditorDidMount}
                    options={{
                        fontSize,
                        minimap: { enabled: minimap },
                        readOnly,
                        wordWrap,
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        lineNumbers: 'on',
                        folding: true,
                        glyphMargin: true,
                        contextmenu: true,
                        quickSuggestions: true,
                        parameterHints: { enabled: true },
                        suggestOnTriggerCharacters: true,
                        fontFamily: "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
                        fontLigatures: true,
                    }}
                />
            </Card>
        </div>
    );
};

export default MonacoEditorTool;
