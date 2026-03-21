import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Typography, Space, message, Upload, Radio, Switch, Image, Tooltip } from 'antd';
import {
    DownloadOutlined,
    CopyOutlined,
    InboxOutlined,
    DeleteOutlined,
    FileImageOutlined,
    CodeOutlined,
    PictureOutlined,
    BlockOutlined,
    ExperimentOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { useCopy } from '@/hooks/useCopy';
import { FormattedMessage, useIntl } from 'react-intl';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Dragger } = Upload;

type Mode = 'imageToBase64' | 'base64ToImage';

interface ImageItem {
    id: string;
    name: string;
    size: number;
    preview: string;
    base64: string;
    base64NoPrefix: string;
}

const ImageBase64Converter: React.FC = () => {
    const intl = useIntl();
    const copy = useCopy();

    const [mode, setMode] = useState<Mode>('imageToBase64');
    
    // Image to Base64 State
    const [imageItems, setImageItems] = useState<ImageItem[]>([]);
    const [withPrefix, setWithPrefix] = useState(true);

    // Base64 to Image State
    const [base64Input, setBase64Input] = useState('');
    const [decodedImage, setDecodedImage] = useState<string | null>(null);

    // -------------------------------------------------------------------------
    // Logic
    // -------------------------------------------------------------------------

    const handleBeforeUpload = (file: File, fileList: File[]) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error(`${file.name} is not an image file!`);
            return Upload.LIST_IGNORE;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const fullBase64 = e.target?.result as string;
            const split = fullBase64.split(',');
            const base64NoPrefix = split.length > 1 ? split[1] : split[0];

            const newItem: ImageItem = {
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                size: file.size,
                preview: fullBase64,
                base64: fullBase64,
                base64NoPrefix: base64NoPrefix,
            };

            setImageItems(prev => [...prev, newItem]);
            
            if (file === fileList[fileList.length - 1]) {
                message.success(intl.formatMessage({ id: 'toast.success' }));
            }
        };
        reader.readAsDataURL(file);
        return false;
    };

    const handleDownload = (data: string, name?: string) => {
        if (!data) return;
        const link = document.createElement('a');
        link.href = data;
        link.download = name || `image_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleClear = () => {
        if (mode === 'imageToBase64') {
            setImageItems([]);
        } else {
            setBase64Input('');
            setDecodedImage(null);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // -------------------------------------------------------------------------
    // Base64 to Image Logic
    // -------------------------------------------------------------------------

    useEffect(() => {
        let input = base64Input.trim();
        if (!input) {
            setDecodedImage(null);
            return;
        }

        try {
            input = input.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '');
            input = input.replace(/\s/g, '');
            input = input.replace(/^["']|["']$/g, '');

            if (input.startsWith('data:image/')) {
                setDecodedImage(input);
            } else if (input.includes('base64,')) {
                setDecodedImage(`data:${input}`);
            } else {
                setDecodedImage(`data:image/png;base64,${input}`);
            }
        } catch (err) {
            setDecodedImage(null);
        }
    }, [base64Input]);

    const handleLoadExampleBase64 = () => {
        const example = 'iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==';
        setBase64Input(example);
        message.info('Example Base64 loaded');
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
        <div className="max-w-6xl mx-auto px-4 pb-20">
            {/* Header */}
            <div className="text-center mb-8">
                <Title level={1} className="text-white mb-2">
                    <FormattedMessage id="tools.imageBase64Converter.name" />
                </Title>
                <Text className="text-slate-400 text-lg">
                    <FormattedMessage id="tools.imageBase64Converter.description" />
                </Text>
            </div>

            {/* Mode Switcher */}
            <div className="flex justify-center mb-10">
                <Radio.Group
                    value={mode}
                    onChange={e => setMode(e.target.value)}
                    optionType="button"
                    buttonStyle="solid"
                    size="large"
                >
                    <Radio.Button value="imageToBase64">
                        <FileImageOutlined /> <FormattedMessage id="tools.imageBase64Converter.mode.imageToBase64" />
                    </Radio.Button>
                    <Radio.Button value="base64ToImage">
                        <CodeOutlined /> <FormattedMessage id="tools.imageBase64Converter.mode.base64ToImage" />
                    </Radio.Button>
                </Radio.Group>
            </div>

            {/* Content Area */}
            {mode === 'imageToBase64' ? (
                <div className="space-y-6">
                    {imageItems.length === 0 ? (
                        <Card className="border-none bg-white/5 p-4 rounded-3xl overflow-hidden shadow-2xl">
                            <Dragger
                                multiple
                                beforeUpload={handleBeforeUpload}
                                showUploadList={false}
                                accept="image/*"
                                className="border-slate-700 hover:border-primary-500 bg-transparent py-20"
                            >
                                <p className="ant-upload-drag-icon">
                                    <InboxOutlined className="text-primary-500 text-7xl" />
                                </p>
                                <p className="ant-upload-text text-slate-200 text-2xl font-medium mt-4"><FormattedMessage id="tools.imageBase64Converter.uploadText" /></p>
                                <p className="ant-upload-hint text-slate-500 mt-3 text-base">
                                    <FormattedMessage id="tools.imageBase64Converter.uploadHint" />
                                </p>
                            </Dragger>
                        </Card>
                    ) : (
                        <>
                            <Card className="border-none bg-white/5 sticky top-4 z-10 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/10 p-0" bodyStyle={{ padding: '16px 24px' }}>
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <Space size="large">
                                        <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full border border-slate-700/50">
                                            <Text className="text-slate-300 text-sm"><FormattedMessage id="tools.imageBase64Converter.withPrefix" /></Text>
                                            <Switch size="small" checked={withPrefix} onChange={setWithPrefix} />
                                        </div>
                                        <div className="bg-primary-500/10 px-4 py-2 rounded-full border border-primary-500/20">
                                            <Text className="text-primary-400 font-mono text-sm">
                                                Images: <span className="font-bold">{imageItems.length}</span>
                                            </Text>
                                        </div>
                                    </Space>
                                    <Space>
                                        <Button 
                                            icon={<CopyOutlined />}
                                            type="primary"
                                            size="large"
                                            onClick={() => {
                                                const allBase64 = imageItems.map(i => withPrefix ? i.base64 : i.base64NoPrefix).join('\n');
                                                copy(allBase64);
                                            }}
                                            className="rounded-xl px-6"
                                        >
                                            Copy All
                                        </Button>
                                        <Button 
                                            icon={<DeleteOutlined />} 
                                            danger 
                                            size="large"
                                            onClick={handleClear}
                                            className="rounded-xl"
                                        >
                                            <FormattedMessage id="common.clear" />
                                        </Button>
                                    </Space>
                                </div>
                            </Card>

                            <div className="space-y-8 animate-fade-in">
                                {imageItems.map((item) => (
                                    <Card 
                                        key={item.id}
                                        className="border-none bg-white/5 hover:bg-white/10 transition-all rounded-3xl overflow-hidden shadow-xl border border-white/5"
                                        bodyStyle={{ padding: '24px' }}
                                    >
                                        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                                            <div className="flex-shrink-0 flex flex-col bg-black/60 rounded-2xl border border-slate-700/40 w-full lg:w-96 h-80 relative group overflow-hidden shadow-inner">
                                                <div className="flex-grow flex items-center justify-center overflow-hidden">
                                                    <Image
                                                        src={item.preview}
                                                        alt={item.name}
                                                        className="max-w-full max-h-full object-contain transform group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                </div>
                                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 pt-10 pointer-events-none">
                                                    <Tooltip title={item.name}>
                                                        <Text className="text-slate-100 text-sm block truncate w-full font-medium drop-shadow-md">{item.name}</Text>
                                                    </Tooltip>
                                                    <Text className="text-slate-400 text-xs font-mono mt-1 block opacity-80">{formatSize(item.size)}</Text>
                                                </div>
                                            </div>

                                            <div className="flex-grow flex flex-col">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-primary-500/20 p-2 rounded-lg">
                                                            <BlockOutlined className="text-primary-500 text-lg" />
                                                        </div>
                                                        <div>
                                                            <Text className="text-slate-200 font-semibold block">Base64 Output</Text>
                                                            <Text className="text-slate-500 text-[11px] font-mono">
                                                                {(withPrefix ? item.base64.length : item.base64NoPrefix.length).toLocaleString()} characters
                                                            </Text>
                                                        </div>
                                                    </div>
                                                    <Space size="middle">
                                                        <Button 
                                                            size="large"
                                                            icon={<CopyOutlined />} 
                                                            className="text-primary-400 hover:text-primary-300 bg-white/5 border-white/10 rounded-xl flex items-center"
                                                            onClick={() => copy(withPrefix ? item.base64 : item.base64NoPrefix)}
                                                        >
                                                            Copy
                                                        </Button>
                                                        <Button 
                                                            size="large"
                                                            icon={<DownloadOutlined />} 
                                                            className="text-green-400 hover:text-green-300 bg-white/5 border-white/10 rounded-xl flex items-center"
                                                            onClick={() => handleDownload(item.preview, item.name)}
                                                        >
                                                            Save Image
                                                        </Button>
                                                    </Space>
                                                </div>
                                                <TextArea
                                                    value={withPrefix ? item.base64 : item.base64NoPrefix}
                                                    readOnly
                                                    className="font-mono text-[13px] border-slate-700/50 bg-black/50 text-green-400/90 rounded-2xl resize-none flex-grow p-5 leading-relaxed shadow-inner"
                                                    style={{ color: '#4ade80', minHeight: '180px' }}
                                                />
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            ) : (
                /* Base64 to Image Mode - Side-by-Side */
                <div className="animate-fade-in">
                    <Card 
                        className="border-none bg-white/5 rounded-[32px] overflow-hidden shadow-2xl border border-white/5" 
                        bodyStyle={{ padding: '24px' }}
                    >
                        <div className="flex flex-col lg:flex-row gap-8 items-stretch min-h-[500px]">
                            {/* Left: Input Column */}
                            <div className="flex-grow flex flex-col min-w-0">
                                <div className="flex justify-between items-center mb-4 px-2">
                                    <Space size="middle">
                                        <div className="bg-primary-500/20 p-2 rounded-lg">
                                            <FileTextOutlined className="text-primary-500 text-lg" />
                                        </div>
                                        <Text className="text-slate-200 font-semibold text-lg">Input Base64</Text>
                                    </Space>
                                    <Space>
                                        <Button 
                                            size="small" 
                                            icon={<ExperimentOutlined />} 
                                            onClick={handleLoadExampleBase64} 
                                            type="text" 
                                            className="text-primary-400 hover:text-primary-300"
                                        >
                                            Load Example
                                        </Button>
                                        <Button 
                                            size="small" 
                                            icon={<DeleteOutlined />} 
                                            onClick={handleClear} 
                                            type="text" 
                                            className="text-slate-500 hover:text-red-400"
                                        >
                                            Clear
                                        </Button>
                                    </Space>
                                </div>
                                <TextArea
                                    value={base64Input}
                                    onChange={e => setBase64Input(e.target.value)}
                                    placeholder={intl.formatMessage({ id: 'tools.imageBase64Converter.base64Placeholder' })}
                                    className="font-mono text-[13px] border-slate-700/50 bg-black/30 text-slate-100 placeholder-slate-600 rounded-2xl p-6 flex-grow leading-relaxed shadow-inner focus:border-primary-500/50 transition-colors"
                                    style={{ resize: 'none' }}
                                />
                            </div>

                            {/* Right: Result Column */}
                            <div className="flex-shrink-0 w-full lg:w-[450px] flex flex-col">
                                <div className="flex items-center gap-3 mb-4 px-2">
                                    <div className="bg-green-500/20 p-2 rounded-lg">
                                        <PictureOutlined className="text-green-500 text-lg" />
                                    </div>
                                    <Text className="text-slate-200 font-semibold text-lg">Image Result</Text>
                                </div>
                                
                                <div className="flex-grow bg-black/60 rounded-2xl border border-slate-700/40 relative overflow-hidden group shadow-inner flex flex-col">
                                    {decodedImage ? (
                                        <>
                                            <div className="flex-grow flex items-center justify-center p-4 overflow-hidden">
                                                <Image
                                                    src={decodedImage}
                                                    alt="Decoded"
                                                    onError={() => message.error('Invalid Base64 string')}
                                                    className="max-w-full max-h-[400px] object-contain transform group-hover:scale-105 transition-transform duration-700 rounded-lg"
                                                />
                                            </div>
                                            <div className="bg-black/40 backdrop-blur-md p-6 border-t border-white/5 flex flex-col items-center">
                                                <Button 
                                                    type="primary" 
                                                    size="large"
                                                    icon={<DownloadOutlined />} 
                                                    onClick={() => handleDownload(decodedImage!)}
                                                    className="h-14 px-12 text-lg rounded-xl w-full shadow-lg"
                                                >
                                                    <FormattedMessage id="common.download" />
                                                </Button>
                                                <Text className="text-slate-600 mt-3 font-mono text-[10px] truncate w-full text-center">
                                                    Header: {decodedImage.substring(0, 40)}...
                                                </Text>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex-grow flex flex-col items-center justify-center text-slate-700 space-y-4">
                                            <PictureOutlined className="text-6xl opacity-20" />
                                            <p className="text-base opacity-40 font-medium px-10 text-center leading-relaxed">
                                                Paste your Base64 string on the left to decode the image
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default ImageBase64Converter;
