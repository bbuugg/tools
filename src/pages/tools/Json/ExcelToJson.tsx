import React, { useState, useEffect, useCallback } from 'react';
import { Card, Input, Button, Select, Checkbox, Typography, Space, Row, Col, Tag, message, Upload, Radio } from 'antd';
import {
    DownloadOutlined,
    CopyOutlined,
    InboxOutlined,
    FileTextOutlined,
    FileExcelOutlined,
    DeleteOutlined
} from '@ant-design/icons';
import { useCopy } from '@/hooks/useCopy';
import * as XLSX from 'xlsx';
import { FormattedMessage, useIntl } from 'react-intl';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;
const { Dragger } = Upload;

type Mode = 'file' | 'text';
type OutputFormat = 'object' | 'array';

interface FileOptions {
    firstRowAsHeaders: boolean;
    skipEmptyRows: boolean;
    sheetIndex: number;
}

interface TextOptions {
    delimiter: string;
    outputFormat: OutputFormat;
    hasHeaders: boolean;
    skipEmptyLines: boolean;
    autoDetectNumbers: boolean;
    autoDetectBooleans: boolean;
}

const excelToJson: React.FC = () => {
    const intl = useIntl();
    const copy = useCopy();

    // Mode
    const [mode, setMode] = useState<Mode>('file');

    // File Mode State
    const [fileList, setFileList] = useState<any[]>([]);
    const [availableSheets, setAvailableSheets] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [fileOutputJson, setFileOutputJson] = useState('');
    const [fileOptions, setFileOptions] = useState<FileOptions>({
        firstRowAsHeaders: true,
        skipEmptyRows: true,
        sheetIndex: 0
    });

    // Text Mode State
    const [inputText, setInputText] = useState('');
    const [textOutputJson, setTextOutputJson] = useState('');
    const [previewRows, setPreviewRows] = useState<string[][]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [textOptions, setTextOptions] = useState<TextOptions>({
        delimiter: '\t',
        outputFormat: 'object',
        hasHeaders: true,
        skipEmptyLines: true,
        autoDetectNumbers: true,
        autoDetectBooleans: true
    });

    // -------------------------------------------------------------------------
    // File Mode Logic
    // -------------------------------------------------------------------------

    const handleFileChange = async (info: any) => {
        const file = info.file;
        // Don't actually upload, just read locally
        setFileList([file]);
        setAvailableSheets([]);
        setFileOutputJson('');

        if (file.status === 'removed') return;

        // Read sheets
        try {
            const arrayBuffer = await file.originFileObj.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            setAvailableSheets(workbook.SheetNames);
            setFileOptions(prev => ({ ...prev, sheetIndex: 0 }));
            message.success(`Loaded ${file.name}`);
        } catch (err) {
            message.error('Failed to read file');
        }
    };

    const convertFileToJson = async () => {
        if (!fileList.length) return;
        setIsLoading(true);
        try {
            const file = fileList[0].originFileObj;
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });

            const sheetName = workbook.SheetNames[fileOptions.sheetIndex];
            if (!sheetName) throw new Error('Sheet not found');

            const worksheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: fileOptions.firstRowAsHeaders ? undefined : 1, // 1 means array of arrays
                defval: "",
                blankrows: !fileOptions.skipEmptyRows,
                raw: false
            });

            setFileOutputJson(JSON.stringify(jsonData, null, 2));
            message.success(intl.formatMessage({ id: 'toast.success' }));

        } catch (err: any) {
            message.error(err.message || 'Conversion failed');
        } finally {
            setIsLoading(false);
        }
    };

    // -------------------------------------------------------------------------
    // Text Mode Logic
    // -------------------------------------------------------------------------

    const parseLine = useCallback((line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        let i = 0;

        while (i < line.length) {
            const char = line[i];
            const nextChar = line[i + 1];

            if ((char === '"' || char === "'") && !inQuotes) {
                inQuotes = true;
                i++;
            } else if ((char === '"' || char === "'") && inQuotes) {
                if (nextChar === char) {
                    current += char;
                    i += 2;
                } else {
                    inQuotes = false;
                    i++;
                }
            } else if (char === textOptions.delimiter && !inQuotes) {
                result.push(current.trim());
                current = '';
                i++;
            } else {
                current += char;
                i++;
            }
        }
        result.push(current.trim());
        return result;
    }, [textOptions.delimiter]);

    const updatePreview = useCallback(() => {
        if (!inputText.trim()) {
            setPreviewRows([]);
            setHeaders([]);
            return;
        }

        const lines = inputText.split('\n')
            .map(l => l.trim())
            .filter(l => textOptions.skipEmptyLines ? l : true);

        if (lines.length === 0) return;

        const parsedLines = lines.map(parseLine);

        if (textOptions.hasHeaders && parsedLines.length > 0) {
            setHeaders(parsedLines[0]);
            setPreviewRows(parsedLines.slice(1));
        } else {
            const maxCols = Math.max(...parsedLines.map(r => r.length));
            setHeaders(Array.from({ length: maxCols }, (_, i) => `Column${i + 1}`));
            setPreviewRows(parsedLines);
        }
    }, [inputText, textOptions.skipEmptyLines, textOptions.hasHeaders, parseLine]);

    useEffect(() => {
        updatePreview();
    }, [updatePreview]);

    const convertValue = (value: string): string | number | boolean => {
        if (value === '') return '';
        if (textOptions.autoDetectBooleans) {
            if (value.toLowerCase() === 'true') return true;
            if (value.toLowerCase() === 'false') return false;
        }
        if (textOptions.autoDetectNumbers) {
            const num = Number(value);
            if (!isNaN(num) && value.trim() !== '') return num;
        }
        return value;
    };

    const convertTextToJson = () => {
        if (!inputText.trim() || previewRows.length === 0) return;

        let result: any;

        if (textOptions.outputFormat === 'object' && textOptions.hasHeaders) {
            result = previewRows.map(row => {
                const obj: Record<string, any> = {};
                headers.forEach((h, i) => {
                    obj[h] = convertValue(row[i] || '');
                });
                return obj;
            });
        } else {
            // Array format
            const dataRows = previewRows.map(row => row.map(convertValue));
            if (textOptions.hasHeaders) {
                result = [headers, ...dataRows];
            } else {
                result = dataRows;
            }
        }

        setTextOutputJson(JSON.stringify(result, null, 2));
    };

    // -------------------------------------------------------------------------
    // Actions
    // -------------------------------------------------------------------------

    const handleDownload = (content: string) => {
        if (!content) return;
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `converted_${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExampleText = () => {
        setInputText("name\tage\tscore\nJohn\t25\t89\nAlice\t22\t95\nBob\t30\t78");
        setTextOptions(prev => ({ ...prev, delimiter: '\t' })); // Set tab delimiter for example
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
        <div className="max-w-7xl mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-2">
                <Title level={1} className="text-white mb-2">
                    <FormattedMessage id="tools.excelToJson.name" />
                </Title>
                <Text className="text-slate-400 text-lg">
                    <FormattedMessage id="tools.excelToJson.description" />
                </Text>
            </div>
            {/* Mode Switcher */}
            <div className="flex justify-center mb-6">
                <Radio.Group
                    value={mode}
                    onChange={e => setMode(e.target.value)}
                    optionType="button"
                    buttonStyle="solid"
                >
                    <Radio.Button value="file"><FileExcelOutlined /> <FormattedMessage id="tools.excelToJson.mode.file" /></Radio.Button>
                    <Radio.Button value="text"><FileTextOutlined /> <FormattedMessage id="tools.excelToJson.mode.text" /></Radio.Button>
                </Radio.Group>
            </div>

            <Row gutter={[24, 24]}>
                {/* ----------------- LEFT: INPUT ----------------- */}
                <Col xs={24} lg={12}>
                    <Card
                        className="border-none bg-white/5 h-full"
                        title={<FormattedMessage id="tools.excelToJson.inputTitle" />}
                        extra={
                            mode === 'text' && (
                                <Space>
                                    <Button size="small" onClick={handleExampleText} className="border-none hover:text-white"><FormattedMessage id="common.loadExample" /></Button>
                                    <Button size="small" onClick={() => { setInputText(''); setTextOutputJson(''); }} icon={<DeleteOutlined />} className="border-none hover:text-white"><FormattedMessage id="common.clear" /></Button>
                                </Space>
                            )
                        }
                    >
                        {mode === 'file' ? (
                            <div className="space-y-4">
                                <Dragger
                                    fileList={fileList}
                                    beforeUpload={() => false} // Prevent auto upload
                                    onChange={handleFileChange}
                                    maxCount={1}
                                    accept=".xlsx,.xls,.csv,.ods"
                                    className="border-slate-700 hover:border-primary-500"
                                >
                                    <p className="ant-upload-drag-icon">
                                        <InboxOutlined className="text-primary-500" />
                                    </p>
                                    <p className="ant-upload-text"><FormattedMessage id="tools.excelToJson.uploadText" /></p>
                                    <p className="ant-upload-hint text-slate-500">
                                        <FormattedMessage id="tools.excelToJson.uploadHint" />
                                    </p>
                                </Dragger>

                                {availableSheets.length > 0 && (
                                    <div className="p-4 rounded-lg border border-slate-700/30 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <Text className="text-slate-300"><FormattedMessage id="tools.excelToJson.sheet" />:</Text>
                                            <Select
                                                value={fileOptions.sheetIndex}
                                                onChange={v => setFileOptions({ ...fileOptions, sheetIndex: v })}
                                                className="w-full"
                                            >
                                                {availableSheets.map((s, i) => <Option key={s} value={i}>{s}</Option>)}
                                            </Select>
                                        </div>
                                        <Checkbox checked={fileOptions.firstRowAsHeaders} onChange={e => setFileOptions({ ...fileOptions, firstRowAsHeaders: e.target.checked })} className="text-slate-300"><FormattedMessage id="tools.excelToJson.firstRowHeaders" /></Checkbox>
                                        <Checkbox checked={fileOptions.skipEmptyRows} onChange={e => setFileOptions({ ...fileOptions, skipEmptyRows: e.target.checked })} className="text-slate-300"><FormattedMessage id="tools.excelToJson.skipEmptyRows" /></Checkbox>

                                        <Button type="primary" block onClick={convertFileToJson} loading={isLoading} disabled={!fileList.length}>
                                            <FormattedMessage id="tools.excelToJson.convertAction" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Text Mode Input
                            <div className="space-y-4">
                                <TextArea
                                    value={inputText}
                                    onChange={e => setInputText(e.target.value)}
                                    placeholder={intl.formatMessage({ id: 'tools.excelToJson.textPlaceholder' })}
                                    className="font-mono text-sm border-slate-700/50 text-slate-100 placeholder-slate-500 rounded-lg"
                                    style={{ minHeight: '200px' }}
                                />

                                <div className="p-4 rounded-lg border border-slate-700/30 space-y-4">
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Text className="text-slate-400 text-xs mb-1 block"><FormattedMessage id="tools.jsonToExcel.delimiter" /></Text>
                                            <Select value={textOptions.delimiter} onChange={v => setTextOptions({ ...textOptions, delimiter: v })} className="w-full">
                                                <Option value="\t"><FormattedMessage id="tools.jsonFormatter.tab" /></Option>
                                                <Option value=",">Comma (,)</Option>
                                                <Option value=";">Semicolon (;)</Option>
                                                <Option value="|">Pipe (|)</Option>
                                                <Option value=" ">Space</Option>
                                            </Select>
                                        </Col>
                                        <Col span={12}>
                                            <Text className="text-slate-400 text-xs mb-1 block"><FormattedMessage id="tools.excelToJson.outputFormat" /></Text>
                                            <Select value={textOptions.outputFormat} onChange={v => setTextOptions({ ...textOptions, outputFormat: v })} className="w-full">
                                                <Option value="object"><FormattedMessage id="tools.jsonExtractor.outputFormat.array" /> of Objects</Option>
                                                <Option value="array"><FormattedMessage id="tools.jsonExtractor.outputFormat.array" /> of Arrays</Option>
                                            </Select>
                                        </Col>
                                    </Row>

                                    <Row gutter={16}>
                                        <Col span={12}><Checkbox checked={textOptions.hasHeaders} onChange={e => setTextOptions({ ...textOptions, hasHeaders: e.target.checked })} className="text-slate-300"><FormattedMessage id="tools.excelToJson.firstRowHeaders" /></Checkbox></Col>
                                        <Col span={12}><Checkbox checked={textOptions.skipEmptyLines} onChange={e => setTextOptions({ ...textOptions, skipEmptyLines: e.target.checked })} className="text-slate-300"><FormattedMessage id="tools.jsonExtractor.options.removeEmpty" /></Checkbox></Col>
                                        <Col span={12}><Checkbox checked={textOptions.autoDetectNumbers} onChange={e => setTextOptions({ ...textOptions, autoDetectNumbers: e.target.checked })} className="text-slate-300"><FormattedMessage id="tools.excelToJson.detectNumbers" /></Checkbox></Col>
                                        <Col span={12}><Checkbox checked={textOptions.autoDetectBooleans} onChange={e => setTextOptions({ ...textOptions, autoDetectBooleans: e.target.checked })} className="text-slate-300"><FormattedMessage id="tools.excelToJson.detectBooleans" /></Checkbox></Col>
                                    </Row>

                                    <Button type="primary" block onClick={convertTextToJson} disabled={!inputText.trim()}>
                                        <FormattedMessage id="tools.excelToJson.convertAction" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </Col>

                {/* ----------------- RIGHT: OUTPUT ----------------- */}
                <Col xs={24} lg={12}>
                    <Card
                        className="border-none bg-white/5 h-full"
                        title={<FormattedMessage id="tools.excelToJson.outputTitle" />}
                        extra={
                            <Space>
                                {(fileOutputJson || textOutputJson) && (
                                    <>
                                        <Button size="small" onClick={() => copy(mode === 'file' ? fileOutputJson : textOutputJson)} icon={<CopyOutlined />}><FormattedMessage id="common.copy" /></Button>
                                        <Button size="small" onClick={() => handleDownload(mode === 'file' ? fileOutputJson : textOutputJson)} icon={<DownloadOutlined />} className="text-green-400 border-green-400/30"><FormattedMessage id="common.download" /></Button>
                                    </>
                                )}
                            </Space>
                        }
                    >
                        {/* Wrapper for output content */}
                        {(mode === 'file' && !fileOutputJson) || (mode === 'text' && !textOutputJson) ? (
                            <div className="h-96 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700/30 rounded-xl">
                                <FileTextOutlined className="text-4xl mb-4 opacity-50" />
                                <p><FormattedMessage id="tools.excelToJson.noResults" defaultMessage="JSON output will appear here" /></p>
                            </div>
                        ) : (
                            <div className="animate-fade-in relative">
                                <div className="absolute top-2 right-2 z-10">
                                    <Tag color="green">
                                        <FormattedMessage id="tools.excelToJson.recordsFound" values={{ count: mode === 'file' ? JSON.parse(fileOutputJson).length : JSON.parse(textOutputJson).length }} />
                                    </Tag>
                                </div>
                                <TextArea
                                    value={mode === 'file' ? fileOutputJson : textOutputJson}
                                    readOnly
                                    className="font-mono text-sm border-slate-700 text-green-400 rounded-lg"
                                    style={{ height: 'calc(100vh - 400px)', minHeight: '400px', resize: 'none' }}
                                />
                            </div>
                        )}

                        {/* Text Mode Preview Table - Only show if not converted yet or optionally? 
                            Let's show a small preview if input text exists in text mode.
                        */}
                        {mode === 'text' && inputText && previewRows.length > 0 && !textOutputJson && (
                            <div className="mt-4 border border-slate-700/50 rounded-lg overflow-hidden">
                                <div className="px-3 py-2 border-b border-slate-700/50 text-xs text-slate-400 uppercase tracking-wider">
                                    Input {textOptions.hasHeaders ? 'Headers' : 'Columns'} Detected: {headers.length}
                                </div>
                                <div className="p-2 flex gap-2 flex-wrap">
                                    {headers.map(h => <Tag key={h} className="m-0 border-slate-600">{h}</Tag>)}
                                </div>
                            </div>
                        )}

                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default excelToJson;
