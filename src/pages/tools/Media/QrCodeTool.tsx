import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Input,
    Radio,
    Button,
    Typography,
    Space,
    Upload,
    message,
    Tooltip
} from 'antd';
import {
    QrcodeOutlined,
    ScanOutlined,
    DownloadOutlined,
    CopyOutlined,
    DeleteOutlined,
    FileImageOutlined
} from '@ant-design/icons';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import JSZip from 'jszip';
import { useCopy } from '@/hooks/useCopy';
import { FormattedMessage, useIntl } from 'react-intl';

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

// Interfaces
interface GeneratedQR {
    text: string;
    dataUrl: string;
}

interface RecognizedResult {
    fileName: string;
    preview?: string;
    data?: string;
    error?: string;
    status: 'success' | 'error';
}

const QrCodeTool: React.FC = () => {
    const intl = useIntl();
    const copy = useCopy();
    const [activeTab, setActiveTab] = useState('generate');

    // Generate State
    const [generateText, setGenerateText] = useState('');
    const [generateMode, setGenerateMode] = useState<'single' | 'batch'>('single');
    const [generatedQRCodes, setGeneratedQRCodes] = useState<GeneratedQR[]>([]);

    // Recognize State
    const [recognizedResults, setRecognizedResults] = useState<RecognizedResult[]>([]);

    // -------------------------------------------------------------------------
    // GENERATE LOGIC
    // -------------------------------------------------------------------------

    const handleGenerate = async () => {
        if (!generateText.trim()) return;

        try {
            if (generateMode === 'single') {
                const dataUrl = await QRCode.toDataURL(generateText.trim(), {
                    width: 300,
                    margin: 2,
                    color: { dark: '#000000', light: '#ffffff' }
                });
                setGeneratedQRCodes([{ text: generateText.trim(), dataUrl }]);
                message.success(intl.formatMessage({ id: 'tools.qrCodeTool.generateSuccess' }));
            } else {
                const lines = generateText.split('\n').map(l => l.trim()).filter(l => l);
                if (lines.length === 0) {
                    message.warning(intl.formatMessage({ id: 'tools.qrCodeTool.noValidText' }));
                    return;
                }

                const newQRs: GeneratedQR[] = [];
                for (const line of lines) {
                    const dataUrl = await QRCode.toDataURL(line, {
                        width: 300,
                        margin: 2,
                        color: { dark: '#000000', light: '#ffffff' }
                    });
                    newQRs.push({ text: line, dataUrl });
                }
                setGeneratedQRCodes(newQRs);
                message.success(intl.formatMessage({ id: 'tools.qrCodeTool.generateCount' }, { count: lines.length }));
            }
        } catch (err) {
            console.error(err);
            message.error(intl.formatMessage({ id: 'tools.qrCodeTool.generateError' }));
        }
    };

    const clearGenerated = () => {
        setGeneratedQRCodes([]);
        setGenerateText('');
    };

    const downloadSingle = (qr: GeneratedQR, index: number) => {
        const link = document.createElement('a');
        link.href = qr.dataUrl;
        link.download = `qr-code-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadAll = async () => {
        if (generatedQRCodes.length === 0) return;
        try {
            const zip = new JSZip();
            for (let i = 0; i < generatedQRCodes.length; i++) {
                const qr = generatedQRCodes[i];
                const base64Data = qr.dataUrl.split(',')[1];
                zip.file(`qr-code-${i + 1}.png`, base64Data, { base64: true });
            }
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `qr-codes-${Date.now()}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            message.success(intl.formatMessage({ id: 'toast.success' }));
        } catch (err) {
            console.error(err);
            message.error(intl.formatMessage({ id: 'tools.qrCodeTool.zipError' }));
        }
    };

    const copyImage = async (dataUrl: string) => {
        try {
            const blob = await (await fetch(dataUrl)).blob();
            await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob })
            ]);
            message.success(intl.formatMessage({ id: 'common.copySuccess' }));
        } catch (err) {
            message.error(intl.formatMessage({ id: 'tools.qrCodeTool.copyImageError' }));
        }
    };

    // -------------------------------------------------------------------------
    // RECOGNIZE LOGIC
    // -------------------------------------------------------------------------

    const processFiles = async (files: File[]) => {
        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        if (imageFiles.length === 0) {
            message.error(intl.formatMessage({ id: 'tools.qrCodeTool.noImagesFound' }));
            return;
        }

        const results: RecognizedResult[] = [];

        for (const file of imageFiles) {
            const res: RecognizedResult = {
                fileName: file.name,
                status: 'error'
            };

            try {
                // 1. Create Preview
                const preview = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                res.preview = preview;

                // 2. Decode
                const img = new Image();
                img.src = preview;
                await new Promise((resolve) => { img.onload = resolve; });

                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('Canvas context failed');

                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                const code = jsQR(imageData.data, imageData.width, imageData.height);

                if (code) {
                    res.data = code.data;
                    res.status = 'success';
                } else {
                    res.error = 'No QR Code found';
                }

            } catch (err) {
                console.error(err);
                res.error = 'Recognition failed';
            }
            results.push(res);
        }

        setRecognizedResults(prev => [...prev, ...results]);
        message.success(intl.formatMessage({ id: 'tools.qrCodeTool.processedCount' }, { count: imageFiles.length }));
    };

    const handleUploadRequest = ({ file, onSuccess }: any) => {
        processFiles([file]);
        setTimeout(() => onSuccess?.("ok"), 0);
    };

    const handlePaste = useCallback((event: ClipboardEvent) => {
        if (activeTab !== 'recognize') return;
        const items = event.clipboardData?.items;
        if (!items) return;

        const files: File[] = [];
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const f = item.getAsFile();
                if (f) files.push(f);
            }
        }
        if (files.length > 0) processFiles(files);
    }, [activeTab]);

    useEffect(() => {
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [handlePaste]);

    const copyAllResults = () => {
        const text = recognizedResults
            .filter(r => r.status === 'success' && r.data)
            .map(r => r.data)
            .join('\n');
        if (text) copy(text);
        else message.warning('No success results to copy');
    };

    // -------------------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------------------

    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
                <Title level={1} className="text-white mb-4">
                    <FormattedMessage id="tools.qrCodeTool.name" />
                </Title>
                <Text className="text-lg">
                    <FormattedMessage id="tools.qrCodeTool.description" />
                </Text>
            </div>

            {/* Mode Switcher */}
            <div className="flex justify-center mb-10">
                <Radio.Group
                    value={activeTab}
                    onChange={e => setActiveTab(e.target.value)}
                    optionType="button"
                    buttonStyle="solid"
                >
                    <Radio.Button value="generate"><QrcodeOutlined /> <FormattedMessage id="tools.qrCodeTool.generate" /></Radio.Button>
                    <Radio.Button value="recognize"><ScanOutlined /> <FormattedMessage id="tools.qrCodeTool.recognize" /></Radio.Button>
                </Radio.Group>
            </div>

            {activeTab === 'generate' ? (
                <div className="animate-fade-in space-y-8">
                    <Card
                        extra={
                            <Button size='small' type="default" onClick={clearGenerated} icon={<DeleteOutlined />}>
                                <FormattedMessage id="common.clear" />
                            </Button>
                        }
                        className="bg-white/5 border-slate-700"
                        title={<FormattedMessage id="tools.qrCodeTool.inputSettings" />}
                    >
                        <Space direction="vertical" style={{ width: "100%" }} size="middle">
                            <div>
                                <Paragraph className="text-slate-400 mb-2">
                                    <FormattedMessage id="tools.qrCodeTool.inputDesc" defaultMessage="Text or URLs (supports multiline for batch mode)" />
                                </Paragraph>
                                <TextArea
                                    rows={6}
                                    value={generateText}
                                    onChange={e => setGenerateText(e.target.value)}
                                    placeholder={intl.formatMessage({ id: 'tools.qrCodeTool.inputPlaceholder' })}
                                    className="mb-4 border-slate-600 text-slate-100 placeholder-slate-500 bg-slate-900"
                                />
                            </div>

                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <Space direction="vertical">
                                    <Radio.Group value={generateMode} onChange={e => setGenerateMode(e.target.value)} buttonStyle="solid">
                                        <Radio.Button value="single"><FormattedMessage id="tools.qrCodeTool.singleMode" /></Radio.Button>
                                        <Radio.Button value="batch"><FormattedMessage id="tools.qrCodeTool.batchMode" /></Radio.Button>
                                    </Radio.Group>
                                    <Text className="text-slate-500 text-xs">
                                        {generateMode === 'single' ? intl.formatMessage({ id: 'tools.qrCodeTool.singleDesc' }) : intl.formatMessage({ id: 'tools.qrCodeTool.batchDesc' })}
                                    </Text>
                                </Space>

                                <Button type="primary" onClick={handleGenerate} size="large" icon={<QrcodeOutlined />}>
                                    <FormattedMessage id="tools.qrCodeTool.generate" />
                                </Button>
                            </div>
                        </Space>
                    </Card>

                    {generatedQRCodes.length > 0 && (
                        <Card
                            className="bg-white/5 border-slate-700"
                            title={<FormattedMessage id="tools.qrCodeTool.results" values={{ count: generatedQRCodes.length }} />}
                            extra={
                                <Button icon={<DownloadOutlined />} onClick={downloadAll} type="primary" ghost>
                                    <FormattedMessage id="tools.qrCodeTool.downloadZip" />
                                </Button>
                            }
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {generatedQRCodes.map((qr, idx) => (
                                    <div key={idx} className="p-4 rounded-lg border border-slate-700/50 text-center group hover:border-primary-500/50 transition-colors bg-slate-900/50">
                                        <div className="bg-white p-2 rounded mb-3 inline-block">
                                            <img
                                                referrerPolicy='no-referrer'
                                                src={qr.dataUrl} alt="QR"
                                                className="w-48 h-48 object-contain" />
                                        </div>
                                        <Paragraph className="text-xs truncate mb-3 text-slate-300" copyable={{ text: qr.text }} title={qr.text}>
                                            {qr.text}
                                        </Paragraph>
                                        <Space size="small">
                                            <Tooltip title={intl.formatMessage({ id: 'tools.qrCodeTool.copyImage' })}>
                                                <Button size="small" icon={<CopyOutlined />} onClick={() => copyImage(qr.dataUrl)} />
                                            </Tooltip>
                                            <Tooltip title={intl.formatMessage({ id: 'common.download' })}>
                                                <Button size="small" icon={<DownloadOutlined />} type="primary" onClick={() => downloadSingle(qr, idx)} />
                                            </Tooltip>
                                        </Space>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            ) : (
                <div className="animate-fade-in space-y-8">
                    <Card className="bg-white/5 border-slate-700">
                        <Dragger
                            customRequest={handleUploadRequest}
                            multiple
                            showUploadList={false}
                            accept="image/*"
                            className="bg-transparent border-slate-600 hover:border-primary-500"
                        >
                            <p className="ant-upload-drag-icon">
                                <FileImageOutlined className="text-5xl text-slate-500" />
                            </p>
                            <p className="ant-upload-text text-xl font-medium mt-4 text-slate-200">
                                <FormattedMessage id="tools.qrCodeTool.scanTitle" />
                            </p>
                            <p className="ant-upload-hint text-slate-400 mt-2">
                                <FormattedMessage id="tools.qrCodeTool.scanHint" />
                            </p>
                        </Dragger>
                    </Card>

                    {recognizedResults.length > 0 && (
                        <Card
                            className="bg-white/5 border-slate-700"
                            title={<FormattedMessage id="tools.qrCodeTool.scanResults" values={{ count: recognizedResults.length }} />}
                            extra={
                                <Space>
                                    <Button onClick={() => setRecognizedResults([])} icon={<DeleteOutlined />}>
                                        <FormattedMessage id="common.clear" />
                                    </Button>
                                    <Button type="primary" icon={<CopyOutlined />} onClick={copyAllResults}>
                                        <FormattedMessage id="tools.qrCodeTool.copyAllResults" />
                                    </Button>
                                </Space>
                            }
                        >
                            <div className="space-y-4">
                                {recognizedResults.map((res, idx) => (
                                    <div key={idx} className={`p-4 rounded-lg border ${res.status === 'success' ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'} flex items-start gap-4 transition-all hover:bg-white/5`}>
                                        {res.preview && (
                                            <img
                                                referrerPolicy='no-referrer'
                                                src={res.preview} className="w-16 h-16 object-cover rounded border border-white/10" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <Text strong className="text-slate-200 block mb-1">{res.fileName}</Text>
                                            {res.status === 'success' ? (
                                                <Paragraph className="text-green-300 font-mono text-sm break-all mb-0" copyable>
                                                    {res.data}
                                                </Paragraph>
                                            ) : (
                                                <Text className="text-red-400">{res.error}</Text>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default QrCodeTool;
