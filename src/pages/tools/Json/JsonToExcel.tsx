import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Select, Checkbox, Typography, Space, Row, Col, Alert, Divider, message } from 'antd';
import {
    DownloadOutlined,
    CopyOutlined,
    TableOutlined,
    DeleteOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { useCopy } from '@/hooks/useCopy';
import { FormattedMessage, useIntl } from 'react-intl';
import * as XLSX from 'xlsx';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

// Types
type ConversionType = 'excel' | 'csv' | 'sql';

interface Options {
    conversionType: ConversionType;
    includeHeaders: boolean;
    autoFitColumns: boolean;
    sheetName: string;
    delimiter: string;
    quoteChar: string;
    flattenNested: boolean;
    tableName: string;
    sqlType: 'INSERT' | 'UPDATE' | 'CREATE_TABLE';
    escapeValues: boolean;
    batchInsert: boolean;
    whereField: string;
}

const JsonToExcel: React.FC = () => {
    const intl = useIntl();
    const copy = useCopy();

    // State
    const [inputJson, setInputJson] = useState('');
    const [excelBlob, setExcelBlob] = useState<Blob | null>(null);
    const [csvOutput, setCsvOutput] = useState('');
    const [sqlOutput, setSqlOutput] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Preview state
    const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
    const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);

    const [options, setOptions] = useState<Options>({
        conversionType: 'excel',
        includeHeaders: true,
        autoFitColumns: true,
        sheetName: 'Sheet1',
        delimiter: ',',
        quoteChar: '"',
        flattenNested: true,
        tableName: 'my_table',
        sqlType: 'INSERT',
        escapeValues: true,
        batchInsert: false,
        whereField: 'id',
    });

    // Reset outputs when conversion type changes
    useEffect(() => {
        setExcelBlob(null);
        setCsvOutput('');
        setSqlOutput('');
        setErrorMessage('');
    }, [options.conversionType]);


    // -------------------------------------------------------------------------
    // Logic: Helpers
    // -------------------------------------------------------------------------

    const flattenObject = (obj: Record<string, unknown>, prefix = ''): Record<string, unknown> => {
        const flattened: Record<string, unknown> = {};

        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const newKey = prefix ? `${prefix}.${key}` : key;

                if (Array.isArray(obj[key])) {
                    flattened[newKey] = (obj[key] as any[]).join('; ');
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    if (options.flattenNested) {
                        Object.assign(flattened, flattenObject(obj[key] as Record<string, unknown>, newKey));
                    } else {
                        flattened[newKey] = JSON.stringify(obj[key]);
                    }
                } else {
                    flattened[newKey] = obj[key];
                }
            }
        }
        return flattened;
    };

    const escapeValue = (value: unknown): string => {
        let str = String(value ?? '');
        if (options.quoteChar &&
            (str.includes(options.delimiter) || str.includes('\n') || str.includes('\r') || str.includes(options.quoteChar))) {
            str = str.replace(new RegExp(options.quoteChar, 'g'), options.quoteChar + options.quoteChar);
            str = options.quoteChar + str + options.quoteChar;
        }
        return str;
    };

    const convertToCsv = (data: Record<string, unknown>[]) => {
        const flattenedData = data.map(item => flattenObject(item));
        const allHeaders = new Set<string>();
        flattenedData.forEach(item => Object.keys(item).forEach(k => allHeaders.add(k)));
        const headers = Array.from(allHeaders);

        let csv = '';
        if (options.includeHeaders) {
            csv += headers.map(h => escapeValue(h)).join(options.delimiter) + '\n';
        }

        flattenedData.forEach(item => {
            const row = headers.map(h => escapeValue(item[h] ?? ''));
            csv += row.join(options.delimiter) + '\n';
        });

        return csv.trim();
    };

    // SQL Helpers
    const escapeSqlValue = (value: unknown): string => {
        if (value === null || value === undefined) return 'NULL';
        if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
        if (typeof value === 'number') return String(value);
        if (typeof value === 'object') value = JSON.stringify(value);

        let str = String(value);
        if (options.escapeValues) str = str.replace(/'/g, "''");
        return `'${str}'`;
    };

    const getSqlDataType = (value: unknown): string => {
        if (value === null || value === undefined) return 'VARCHAR(255)';
        if (typeof value === 'boolean') return 'BOOLEAN';
        if (typeof value === 'number') return Number.isInteger(value) ? 'INT' : 'DECIMAL(10,2)';
        if (typeof value === 'string') return value.length <= 50 ? 'VARCHAR(50)' : value.length <= 255 ? 'VARCHAR(255)' : 'TEXT';
        return 'TEXT';
    };

    const generateCreateTableSql = (data: Record<string, unknown>[]): string => {
        if (data.length === 0) return '';
        const fields = new Set<string>();
        const fieldTypes: Record<string, string> = {};

        data.forEach(item => {
            Object.keys(item).forEach(key => {
                fields.add(key);
                if (!fieldTypes[key]) fieldTypes[key] = getSqlDataType(item[key]);
            });
        });

        const definitions = Array.from(fields).map(f => `  ${f} ${fieldTypes[f]}`).join(',\n');
        return `CREATE TABLE ${options.tableName} (\n${definitions}\n);`;
    };

    const generateInsertSql = (data: Record<string, unknown>[]): string => {
        if (data.length === 0) return '';
        if (options.batchInsert) {
            const fields = Object.keys(data[0]);
            const fieldsList = fields.join(', ');
            const valuesList = data.map(item => {
                const vals = fields.map(f => escapeSqlValue(item[f])).join(', ');
                return `(${vals})`;
            }).join(',\n  ');
            return `INSERT INTO ${options.tableName} (${fieldsList})\nVALUES\n  ${valuesList};`;
        } else {
            return data.map(item => {
                const fields = Object.keys(item);
                const vals = fields.map(f => escapeSqlValue(item[f])).join(', ');
                return `INSERT INTO ${options.tableName} (${fields.join(', ')}) VALUES (${vals});`;
            }).join('\n');
        }
    };

    const generateUpdateSql = (data: Record<string, unknown>[]): string => {
        if (data.length === 0) return '';
        return data.map(item => {
            const fields = Object.keys(item).filter(k => k !== options.whereField);
            const setClause = fields.map(f => `${f} = ${escapeSqlValue(item[f])}`).join(', ');
            const whereVal = escapeSqlValue(item[options.whereField]);
            return `UPDATE ${options.tableName} SET ${setClause} WHERE ${options.whereField} = ${whereVal};`;
        }).join('\n');
    };

    // -------------------------------------------------------------------------
    // Actions
    // -------------------------------------------------------------------------

    const handleConvert = () => {
        setErrorMessage('');
        setExcelBlob(null);
        setCsvOutput('');
        setSqlOutput('');
        setPreviewData([]);
        setPreviewHeaders([]);

        if (!inputJson.trim() || (options.conversionType === 'sql' && !options.tableName.trim())) {
            message.error(intl.formatMessage({ id: 'tools.jsonExtractor.errors.invalidJson' }));
            return;
        }

        try {
            let data: any;
            try {
                data = JSON.parse(inputJson);
            } catch {
                throw new Error('Invalid JSON input');
            }

            if (!Array.isArray(data)) throw new Error('Root input must be a JSON Array');
            if (data.length === 0) throw new Error('Array cannot be empty');

            // Set Preview
            if (options.conversionType !== 'sql') {
                setPreviewData(data as Record<string, unknown>[]);
                setPreviewHeaders(Object.keys(data[0] || {}));
            }

            if (options.conversionType === 'excel') {
                const workbook = XLSX.utils.book_new();
                const worksheet = XLSX.utils.json_to_sheet(data, {
                    header: options.includeHeaders ? undefined : []
                });

                if (options.autoFitColumns) {
                    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
                    const wscols = [];
                    for (let C = range.s.c; C <= range.e.c; ++C) {
                        let maxW = 10;
                        for (let R = range.s.r; R <= range.e.r; ++R) {
                            const cell = worksheet[XLSX.utils.encode_cell({ c: C, r: R })];
                            if (cell?.v) maxW = Math.max(maxW, Math.min(String(cell.v).length + 2, 50));
                        }
                        wscols.push({ wch: maxW });
                    }
                    worksheet['!cols'] = wscols;
                }

                XLSX.utils.book_append_sheet(workbook, worksheet, options.sheetName || 'Sheet1');
                const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                setExcelBlob(new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
                message.success(intl.formatMessage({ id: 'toast.success' }));

            } else if (options.conversionType === 'csv') {
                const csv = convertToCsv(data);
                setCsvOutput(csv);
                message.success(intl.formatMessage({ id: 'toast.success' }));

            } else if (options.conversionType === 'sql') {
                if (options.sqlType === 'UPDATE' && !options.whereField) throw new Error('Where field required for UPDATE');

                let sql = '';
                if (options.sqlType === 'CREATE_TABLE') sql = generateCreateTableSql(data);
                else if (options.sqlType === 'INSERT') sql = generateInsertSql(data);
                else if (options.sqlType === 'UPDATE') sql = generateUpdateSql(data);

                setSqlOutput(sql);
                message.success(intl.formatMessage({ id: 'toast.success' }));
            }

        } catch (err: any) {
            setErrorMessage(err.message);
        }
    };

    const handleLoadExample = () => {
        const example = [
            { id: 1, name: 'John Doe', email: 'john@ex.com', role: 'Admin' },
            { id: 2, name: 'Jane Smith', email: 'jane@ex.com', role: 'User' }
        ];
        setInputJson(JSON.stringify(example, null, 2));
    };

    const handleDownload = () => {
        let blob: Blob | null = null;
        let ext = '';

        if (options.conversionType === 'excel' && excelBlob) {
            blob = excelBlob;
            ext = 'xlsx';
        } else if (options.conversionType === 'csv' && csvOutput) {
            blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
            ext = 'csv';
        } else if (options.conversionType === 'sql' && sqlOutput) {
            blob = new Blob([sqlOutput], { type: 'application/sql' });
            ext = 'sql';
        }

        if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `export_${Date.now()}.${ext}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <div className="max-w-7xl mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-10">
                <Title level={1} className="text-white mb-2">
                    <FormattedMessage id="tools.jsonToExcel.name" />
                </Title>
                <Text className="text-slate-400 text-lg">
                    <FormattedMessage id="tools.jsonToExcel.description" />
                </Text>
            </div>
            <Row gutter={[24, 24]}>

                {/* ----------------- LEFT: INPUT ----------------- */}
                <Col xs={24} lg={12}>
                    <Card
                        className="border-none bg-white/5 h-full"
                        title={<FormattedMessage id="tools.jsonToExcel.inputTitle" />}
                        extra={
                            <Space>
                                <Button size="small" onClick={handleLoadExample} className="border-none hover:text-white"><FormattedMessage id="common.loadExample" /></Button>
                                <Button size="small" onClick={() => { setInputJson(''); setExcelBlob(null); setCsvOutput(''); setSqlOutput(''); }} icon={<DeleteOutlined />} className="border-none hover:text-white"><FormattedMessage id="common.clear" /></Button>
                            </Space>
                        }
                    >
                        <Space orientation="vertical" style={{ width: '100%' }}>
                            <TextArea
                                value={inputJson}
                                onChange={(e) => setInputJson(e.target.value)}
                                placeholder={intl.formatMessage({ id: 'tools.jsonToExcel.placeholder' })}
                                className="font-mono text-sm border-slate-700/50 text-slate-100 placeholder-slate-500 rounded-lg mb-4"
                                style={{ minHeight: '200px', resize: 'vertical' }}
                                spellCheck={false}
                            />

                            {/* Conversion Type Config */}
                            <div className="p-4 space-y-4">
                                <div className="flex items-center gap-4">
                                    <Text className="text-slate-300"><FormattedMessage id="tools.jsonToExcel.format" />:</Text>
                                    <Select
                                        value={options.conversionType}
                                        onChange={(v) => setOptions({ ...options, conversionType: v })}
                                        className="w-32"
                                    >
                                        <Option value="excel">Excel</Option>
                                        <Option value="csv">CSV</Option>
                                        <Option value="sql">SQL</Option>
                                    </Select>
                                </div>

                                <Divider />

                                {/* Excel Options */}
                                {options.conversionType === 'excel' && (
                                    <Space direction="vertical" className="w-full">
                                        <Row gutter={16}>
                                            <Col span={32}>
                                                <Input
                                                    addonBefore={<FormattedMessage id="tools.jsonToExcel.tableName" />}
                                                    value={options.sheetName}
                                                    onChange={e => setOptions({ ...options, sheetName: e.target.value })}
                                                    className="w-full"
                                                />
                                            </Col>
                                        </Row>
                                        <Col span={12}>
                                            <Checkbox
                                                checked={options.autoFitColumns}
                                                onChange={e => setOptions({ ...options, autoFitColumns: e.target.checked })}
                                                className="text-slate-300"
                                            >
                                                <FormattedMessage id="tools.jsonToExcel.autoFitCols" />
                                            </Checkbox>
                                        </Col>
                                        <Col span={12}>
                                            <Checkbox
                                                checked={options.includeHeaders}
                                                onChange={e => setOptions({ ...options, includeHeaders: e.target.checked })}
                                                className="text-slate-300"
                                            >
                                                <FormattedMessage id="tools.jsonToExcel.includeHeaders" />
                                            </Checkbox>
                                        </Col>
                                    </Space>
                                )}

                                {/* CSV Options */}
                                {options.conversionType === 'csv' && (
                                    <Space direction="vertical" className="w-full">
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Text className="text-slate-400 text-xs mb-1 block"><FormattedMessage id="tools.jsonToExcel.delimiter" /></Text>
                                                <Select value={options.delimiter} onChange={v => setOptions({ ...options, delimiter: v })} className="w-full">
                                                    <Option value=",">Comma (,)</Option>
                                                    <Option value=";">Semicolon (;)</Option>
                                                    <Option value="\t"><FormattedMessage id="tools.jsonFormatter.tab" /></Option>
                                                    <Option value="|">Pipe (|)</Option>
                                                </Select>
                                            </Col>
                                            <Col span={12}>
                                                <Text className="text-slate-400 text-xs mb-1 block"><FormattedMessage id="tools.jsonToExcel.quoteChar" /></Text>
                                                <Select value={options.quoteChar} onChange={v => setOptions({ ...options, quoteChar: v })} className="w-full">
                                                    <Option value='"'>Double Quote (")</Option>
                                                    <Option value="'">Single Quote (')</Option>
                                                    <Option value=""><FormattedMessage id="common.none" /></Option>
                                                </Select>
                                            </Col>
                                        </Row>
                                        <Checkbox checked={options.flattenNested} onChange={e => setOptions({ ...options, flattenNested: e.target.checked })} className="text-slate-300"><FormattedMessage id="tools.jsonToExcel.flattenNested" /></Checkbox>
                                        <Checkbox checked={options.includeHeaders} onChange={e => setOptions({ ...options, includeHeaders: e.target.checked })} className="text-slate-300"><FormattedMessage id="tools.jsonToExcel.includeHeaders" /></Checkbox>
                                    </Space>
                                )}

                                {/* SQL Options */}
                                {options.conversionType === 'sql' && (
                                    <Space direction="vertical" className="w-full">
                                        <Row gutter={16}>
                                            <Col span={12}>
                                                <Text className="text-slate-400 text-xs mb-1 block"><FormattedMessage id="tools.jsonToExcel.tableName" /></Text>
                                                <Input value={options.tableName} onChange={e => setOptions({ ...options, tableName: e.target.value })} />
                                            </Col>
                                            <Col span={12}>
                                                <Text className="text-slate-400 text-xs mb-1 block"><FormattedMessage id="tools.jsonToExcel.sqlType" /></Text>
                                                <Select value={options.sqlType} onChange={v => setOptions({ ...options, sqlType: v })} className="w-full">
                                                    <Option value="INSERT">INSERT</Option>
                                                    <Option value="UPDATE">UPDATE</Option>
                                                    <Option value="CREATE_TABLE">CREATE TABLE</Option>
                                                </Select>
                                            </Col>
                                        </Row>
                                        {options.sqlType === 'UPDATE' && (
                                            <div className="mt-2">
                                                <Text className="text-slate-400 text-xs mb-1 block"><FormattedMessage id="tools.jsonToExcel.whereField" /></Text>
                                                <Input value={options.whereField} onChange={e => setOptions({ ...options, whereField: e.target.value })} placeholder="id" />
                                            </div>
                                        )}
                                        <Row gutter={16} className="mt-2">
                                            <Col span={12}>
                                                <Checkbox checked={options.batchInsert} onChange={e => setOptions({ ...options, batchInsert: e.target.checked })} disabled={options.sqlType !== 'INSERT'} className="text-slate-300"><FormattedMessage id="tools.jsonToExcel.batchInsert" /></Checkbox>
                                            </Col>
                                            <Col span={12}>
                                                <Checkbox checked={options.escapeValues} onChange={e => setOptions({ ...options, escapeValues: e.target.checked })} className="text-slate-300"><FormattedMessage id="tools.jsonToExcel.escapeValues" /></Checkbox>
                                            </Col>
                                        </Row>
                                    </Space>
                                )}

                                <Button type="primary" block onClick={handleConvert} className="mt-4">
                                    <FormattedMessage id="tools.jsonToExcel.convertAction" values={{ format: options.conversionType.toUpperCase() }} />
                                </Button>
                            </div>
                        </Space>
                    </Card>
                </Col>

                {/* ----------------- RIGHT: OUTPUT ----------------- */}
                <Col xs={24} lg={12}>
                    <Card
                        className="border-none bg-white/5 h-full"
                        title={<FormattedMessage id="tools.jsonToExcel.outputTitle" />}
                        extra={
                            <Space>
                                {(excelBlob || csvOutput || sqlOutput) && (
                                    <>
                                        {(csvOutput || sqlOutput) && <Button size="small" onClick={() => copy(csvOutput || sqlOutput)} icon={<CopyOutlined />}><FormattedMessage id="common.copy" /></Button>}
                                        <Button size="small" onClick={handleDownload} icon={<DownloadOutlined />} className="text-green-400 border-green-400/30 hover:text-green-300 hover:border-green-300"><FormattedMessage id="common.download" /></Button>
                                    </>
                                )}
                            </Space>
                        }
                    >
                        {errorMessage ? (
                            <Alert type="error" showIcon message="Result" description={errorMessage} className="bg-red-500/10 border-red-500/30 text-red-200" />
                        ) : !excelBlob && !csvOutput && !sqlOutput ? (
                            <div className="h-64 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700/30 rounded-xl">
                                <TableOutlined className="text-4xl mb-4 opacity-50" />
                                <p><FormattedMessage id="tools.jsonToExcel.noResults" defaultMessage="Conversion results will appear here" /></p>
                            </div>
                        ) : (
                            <div className="animate-fade-in">
                                {/* Success Banner */}
                                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4 flex items-center gap-3">
                                    <CheckCircleOutlined className="text-green-400 text-xl" />
                                    <div>
                                        <p className="text-green-300 font-medium"><FormattedMessage id="tools.jsonToExcel.conversionComplete" /></p>
                                        <p className="text-green-400/70 text-sm"><FormattedMessage id="tools.jsonToExcel.readyDownload" /></p>
                                    </div>
                                </div>

                                {/* Preview for Excel/CSV Table style */}
                                {(options.conversionType !== 'sql' && previewData.length > 0) && (
                                    <div className="border border-slate-700/50 rounded-lg overflow-hidden mb-4">
                                        <div className="px-3 py-2 border-b border-slate-700/50 text-xs text-slate-400 uppercase tracking-wider"><FormattedMessage id="tools.jsonToExcel.preview" /></div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm text-left">
                                                <thead className="text-xs text-slate-400 uppercase">
                                                    <tr>
                                                        {previewHeaders.map(h => <th key={h} className="px-4 py-2 whitespace-nowrap">{h}</th>)}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {previewData.slice(0, 10).map((row, i) => (
                                                        <tr key={i} className="border-b border-slate-700/30/20">
                                                            {previewHeaders.map(h => (
                                                                <td key={h} className="px-4 py-2 whitespace-nowrap font-mono text-xs text-slate-400 max-w-xs truncate">
                                                                    {String(row[h] ?? '')}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Raw Text Output for CSV/SQL */}
                                {(options.conversionType === 'csv' || options.conversionType === 'sql') && (
                                    <TextArea
                                        value={options.conversionType === 'csv' ? csvOutput : sqlOutput}
                                        readOnly
                                        className="font-mono text-sm text-blue-300 rounded-lg"
                                        style={{ height: '300px', resize: 'none' }}
                                    />
                                )}
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default JsonToExcel;
