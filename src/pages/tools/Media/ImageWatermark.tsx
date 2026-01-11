import React, { useState } from 'react';
import {
    Card,
    Upload,
    Slider,
    Select,
    Input,
    InputNumber,
    Button,
    Typography,
    Space,
    message,
    ColorPicker,
    Modal
} from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    FileImageOutlined,
    DownloadOutlined,
    DeleteOutlined,
    EyeOutlined,
    ClearOutlined,
    FormatPainterOutlined
} from '@ant-design/icons';
import JSZip from 'jszip';

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { Option } = Select;

interface ProcessedImage {
    id: string;
    file: File;
    name: string;
    preview: string;
    originalSize: number;
    processedSize?: number;
    dimensions: { width: number; height: number };
    status: 'pending' | 'processing' | 'completed' | 'error';
    progress: number;
    processedBlob?: Blob;
    processedPreviewUrl?: string;
}

interface TextOptions {
    text: string;
    fontSize: number;
    color: string;
    fontFamily: string;
}

interface ImageOptions {
    file: File | null;
    preview: string;
    width: number;
    opacity: number;
}

interface PositionOptions {
    position: string;
    margin: number;
}

interface AdvancedOptions {
    opacity: number;
    rotation: number;
    scale: number;
}

const ImageWatermark: React.FC = () => {
    const intl = useIntl();
    // --- State ---
    const [images, setImages] = useState<ProcessedImage[]>([]);
    const [watermarkType, setWatermarkType] = useState<'text' | 'image' | 'combined'>('text');
    const [isProcessing, setIsProcessing] = useState(false);

    // Watermark Settings
    const [textOptions, setTextOptions] = useState<TextOptions>({
        text: 'Watermark',
        fontSize: 24,
        color: '#ffffff',
        fontFamily: 'Arial'
    });

    const [watermarkImage, setWatermarkImage] = useState<ImageOptions>({
        file: null,
        preview: '',
        width: 100,
        opacity: 80
    });

    const [positionOptions, setPositionOptions] = useState<PositionOptions>({
        position: 'bottom-right',
        margin: 20
    });

    const [advancedOptions, setAdvancedOptions] = useState<AdvancedOptions>({
        opacity: 80,
        rotation: 0,
        scale: 100
    });

    // Preview
    const [previewItem, setPreviewItem] = useState<ProcessedImage | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    // --- Helpers ---
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
    };

    const getImageDimensions = (file: File): Promise<{ width: number, height: number }> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    };

    const createImagePreview = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(file);
        });
    };

    // --- Actions ---
    const handleUpload = async (info: any) => {
        const file = info.file;
        if (!file.type.startsWith('image/')) {
            message.error(`${file.name} is not a valid image file`);
            return;
        }

        try {
            const dimensions = await getImageDimensions(file);
            const preview = await createImagePreview(file);

            const newItem: ProcessedImage = {
                id: Math.random().toString(36).substr(2, 9),
                file,
                name: file.name,
                preview,
                originalSize: file.size,
                dimensions,
                status: 'pending',
                progress: 0
            };
            setImages(prev => [...prev, newItem]);
        } catch (e) {
            console.error(e);
            message.error(`Failed to load ${file.name}`);
        }
    };

    const handleWatermarkImageUpload = async (info: any) => {
        const file = info.file;
        if (!file.type.startsWith('image/')) {
            message.error('Invalid watermark image');
            return;
        }
        const preview = await createImagePreview(file);
        setWatermarkImage(prev => ({ ...prev, file, preview }));
        message.success('Watermark image loaded');
    };

    const processImage = async (id: string) => {
        const index = images.findIndex(img => img.id === id);
        if (index === -1) return;

        const image = images[index];
        setImages(prev => prev.map(img => img.id === id ? { ...img, status: 'processing', progress: 0 } : img));

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('No context');

            const mainImg = new Image();
            await new Promise((resolve) => {
                mainImg.onload = resolve;
                mainImg.src = image.preview;
            });

            canvas.width = mainImg.width;
            canvas.height = mainImg.height;
            ctx.drawImage(mainImg, 0, 0);

            // Helper to get coordinates
            const getCoords = (contentWidth: number, contentHeight: number) => {
                const { width, height } = canvas;
                const margin = positionOptions.margin;
                let x = 0, y = 0;

                switch (positionOptions.position) {
                    case 'top-left': x = margin; y = margin; break;
                    case 'top-center': x = (width - contentWidth) / 2; y = margin; break;
                    case 'top-right': x = width - contentWidth - margin; y = margin; break;
                    case 'center-left': x = margin; y = (height - contentHeight) / 2; break;
                    case 'center': x = (width - contentWidth) / 2; y = (height - contentHeight) / 2; break;
                    case 'center-right': x = width - contentWidth - margin; y = (height - contentHeight) / 2; break;
                    case 'bottom-left': x = margin; y = height - contentHeight - margin; break;
                    case 'bottom-center': x = (width - contentWidth) / 2; y = height - contentHeight - margin; break;
                    case 'bottom-right': x = width - contentWidth - margin; y = height - contentHeight - margin; break;
                }
                return { x, y };
            };

            const globalAlpha = advancedOptions.opacity / 100;

            // Draw Text Watermark
            const drawText = () => {
                ctx.save();
                ctx.globalAlpha = globalAlpha;

                ctx.font = `${textOptions.fontSize}px ${textOptions.fontFamily}`;
                ctx.fillStyle = textOptions.color;
                ctx.textBaseline = 'top';

                const metrics = ctx.measureText(textOptions.text);
                const textWidth = metrics.width;
                const textHeight = textOptions.fontSize;

                const { x, y } = getCoords(textWidth, textHeight);

                ctx.translate(x + textWidth / 2, y + textHeight / 2);
                ctx.rotate((advancedOptions.rotation * Math.PI) / 180);
                ctx.fillText(textOptions.text, -textWidth / 2, -textHeight / 2);
                ctx.restore();
            };

            // Draw Image Watermark
            const drawImageWatermark = async () => {
                if (!watermarkImage.preview) return;
                const wmImg = new Image();
                await new Promise((resolve) => {
                    wmImg.onload = resolve;
                    wmImg.src = watermarkImage.preview;
                });

                const wmWidth = watermarkImage.width;
                const wmHeight = (wmImg.height / wmImg.width) * wmWidth;

                const { x, y } = getCoords(wmWidth, wmHeight);

                ctx.save();
                ctx.globalAlpha = (watermarkImage.opacity / 100) * globalAlpha;
                ctx.translate(x + wmWidth / 2, y + wmHeight / 2);
                ctx.rotate((advancedOptions.rotation * Math.PI) / 180);

                const scale = advancedOptions.scale / 100;
                ctx.scale(scale, scale);

                ctx.drawImage(wmImg, -wmWidth / 2, -wmHeight / 2, wmWidth, wmHeight);
                ctx.restore();
            };

            if (watermarkType === 'text') drawText();
            else if (watermarkType === 'image') await drawImageWatermark();
            else if (watermarkType === 'combined') {
                await drawImageWatermark();
                drawText();
            }

            // Convert to blob
            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob(blob => resolve(blob!), image.file.type);
            });

            const processedUrl = URL.createObjectURL(blob);

            setImages(prev => prev.map(img => {
                if (img.id !== id) return img;
                return {
                    ...img,
                    status: 'completed',
                    progress: 100,
                    processedBlob: blob,
                    processedSize: blob.size,
                    processedPreviewUrl: processedUrl
                };
            }));

        } catch (e) {
            console.error(e);
            message.error(`Failed to process ${image.name}`);
            setImages(prev => prev.map(img => img.id === id ? { ...img, status: 'error' } : img));
        }
    };

    const handleProcessAll = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        const pending = images.filter(img => img.status === 'pending' || img.status === 'error');
        for (const img of pending) {
            await processImage(img.id);
        }
        setIsProcessing(false);
        message.success(intl.formatMessage({ id: 'tools.imageWatermark.batchComplete' }));
    };

    const handleDownload = (id: string) => {
        const img = images.find(i => i.id === id);
        if (!img || !img.processedBlob) return;

        const url = URL.createObjectURL(img.processedBlob);
        const link = document.createElement('a');
        link.href = url;
        const name = img.name.substring(0, img.name.lastIndexOf('.'));
        const ext = img.name.split('.').pop();
        link.download = `${name}_watermarked.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDownloadAll = async () => {
        const completed = images.filter(img => img.status === 'completed' && img.processedBlob);
        if (completed.length === 0) return;

        const zip = new JSZip();
        completed.forEach(img => {
            const name = img.name.substring(0, img.name.lastIndexOf('.'));
            const ext = img.name.split('.').pop();
            zip.file(`${name}_watermarked.${ext}`, img.processedBlob!);
        });

        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `watermarked_images_${Date.now()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDelete = (id: string) => {
        setImages(prev => prev.filter(i => i.id !== id));
    };

    const handlePreview = (img: ProcessedImage) => {
        setPreviewItem(img);
        setShowPreviewModal(true);
    };

    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
                <Title level={1} className="text-white mb-4">
                    <FormattedMessage id="tools.imageWatermark.name" />
                </Title>
                <Text className="text-lg">
                    <FormattedMessage id="tools.imageWatermark.description" />
                </Text>
            </div>

            <Space orientation='vertical' style={{ width: "100%" }}>
                <Space orientation='vertical' style={{ width: "100%" }}>
                    <Card>
                        <Dragger
                            customRequest={({ file, onSuccess }) => { handleUpload({ file }); setTimeout(() => onSuccess?.("ok"), 0); }}
                            showUploadList={false}
                            multiple
                            accept="image/*"
                            className="bg-transparent border-slate-600 hover:border-primary-500"
                        >
                            <p className="ant-upload-drag-icon"><FileImageOutlined className="text-5xl" /></p>
                            <p className="text-xl mt-4"><FormattedMessage id="tools.imageWatermark.uploadText" /></p>
                        </Dragger>
                    </Card>

                    <Card title={<FormattedMessage id="tools.imageWatermark.settings" />}>
                        <div className="mb-6">
                            <div className="mb-2"><FormattedMessage id="tools.imageWatermark.type" /></div>
                            <div className="grid grid-cols-3 gap-3">
                                <Button
                                    type={watermarkType === 'text' ? 'primary' : 'default'}
                                    onClick={() => setWatermarkType('text')}
                                    className="h-auto py-3"
                                >
                                    <FormattedMessage id="tools.imageWatermark.type.text" />
                                </Button>
                                <Button
                                    type={watermarkType === 'image' ? 'primary' : 'default'}
                                    onClick={() => setWatermarkType('image')}
                                    className="h-auto py-3"
                                >
                                    <FormattedMessage id="tools.imageWatermark.type.image" />
                                </Button>
                                <Button
                                    type={watermarkType === 'combined' ? 'primary' : 'default'}
                                    onClick={() => setWatermarkType('combined')}
                                    className="h-auto py-3"
                                >
                                    <FormattedMessage id="tools.imageWatermark.type.combined" />
                                </Button>
                            </div>
                        </div>

                        {(watermarkType === 'text' || watermarkType === 'combined') && (
                            <div className="p-4 rounded-lg mb-4 border border-slate-700">
                                <Title level={5} className="text-white mb-3"><FormattedMessage id="tools.imageWatermark.textOptions" /></Title>
                                <Space direction="vertical" className="w-full">
                                    <Input
                                        placeholder={intl.formatMessage({ id: 'tools.imageWatermark.textPlaceholder' })}
                                        value={textOptions.text}
                                        onChange={e => setTextOptions({ ...textOptions, text: e.target.value })}
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs mb-1"><FormattedMessage id="tools.imageWatermark.fontSize" /></div>
                                            <InputNumber
                                                min={10} max={200}
                                                value={textOptions.fontSize}
                                                onChange={v => setTextOptions({ ...textOptions, fontSize: v || 24 })}
                                                style={{ width: '100%' }}
                                            />
                                        </div>
                                        <div>
                                            <div className="text-xs mb-1"><FormattedMessage id="tools.imageWatermark.color" /></div>
                                            <ColorPicker
                                                format="hex"
                                                value={textOptions.color}
                                                onChange={(_, hex) => setTextOptions({ ...textOptions, color: hex })}
                                                showText
                                            />
                                        </div>
                                        <Select
                                            value={textOptions.fontFamily}
                                            onChange={v => setTextOptions({ ...textOptions, fontFamily: v })}
                                            style={{ width: '100%' }}
                                        >
                                            <Option value="Arial">Arial</Option>
                                            <Option value="Verdana">Verdana</Option>
                                            <Option value="Times New Roman">Times New Roman</Option>
                                            <Option value="Courier New">Courier New</Option>
                                        </Select>
                                    </div>

                                </Space>
                            </div>
                        )}

                        {(watermarkType === 'image' || watermarkType === 'combined') && (
                            <div className="p-4 rounded-lg mb-4 border border-slate-700">
                                <Title level={5} className="text-white mb-3"><FormattedMessage id="tools.imageWatermark.imageOptions" /></Title>
                                <div className="mb-4">
                                    {!watermarkImage.preview ? (
                                        <Upload
                                            customRequest={({ file, onSuccess }) => { handleWatermarkImageUpload({ file }); setTimeout(() => onSuccess?.("ok"), 0); }}
                                            showUploadList={false}
                                            accept="image/*"
                                        >
                                            <Button icon={<FileImageOutlined />}><FormattedMessage id="tools.imageWatermark.selectImage" /></Button>
                                        </Upload>
                                    ) : (
                                        <div className="relative inline-block group">
                                            <img
                                                referrerPolicy='no-referrer'
                                                src={watermarkImage.preview} alt="Watermark" className="h-20 object-contain rounded border border-slate-600" />
                                            <Button
                                                type="primary"
                                                danger
                                                size="small"
                                                icon={<DeleteOutlined />}
                                                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => setWatermarkImage({ ...watermarkImage, file: null, preview: '' })}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-xs mb-1"><FormattedMessage id="tools.imageWatermark.width" /> (px)</div>
                                        <InputNumber
                                            min={20} max={1000}
                                            value={watermarkImage.width}
                                            onChange={v => setWatermarkImage({ ...watermarkImage, width: v || 100 })}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div>
                                        <div className="text-xs mb-1"><FormattedMessage id="tools.imageWatermark.opacity" /> (%)</div>
                                        <Slider
                                            min={0} max={100}
                                            value={watermarkImage.opacity}
                                            onChange={v => setWatermarkImage({ ...watermarkImage, opacity: v })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="p-4 rounded-lg mb-4 border border-slate-700">
                            <Title level={5} className="text-white mb-3"><FormattedMessage id="tools.imageWatermark.position" /></Title>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-xs mb-1"><FormattedMessage id="tools.imageWatermark.position" /></div>
                                    <Select
                                        value={positionOptions.position}
                                        onChange={v => setPositionOptions({ ...positionOptions, position: v })}
                                        style={{ width: '100%' }}
                                    >
                                        <Option value="top-left">Top Left</Option>
                                        <Option value="top-center">Top Center</Option>
                                        <Option value="top-right">Top Right</Option>
                                        <Option value="center-left">Center Left</Option>
                                        <Option value="center">Center</Option>
                                        <Option value="center-right">Center Right</Option>
                                        <Option value="bottom-left">Bottom Left</Option>
                                        <Option value="bottom-center">Bottom Center</Option>
                                        <Option value="bottom-right">Bottom Right</Option>
                                    </Select>
                                </div>
                                <div>
                                    <div className="text-xs mb-1"><FormattedMessage id="tools.fileRenamer.index" /> (px)</div>
                                    <InputNumber
                                        min={0} max={500}
                                        value={positionOptions.margin}
                                        onChange={v => setPositionOptions({ ...positionOptions, margin: v || 0 })}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg border border-slate-700">
                            <Title level={5} className="text-white mb-3"><FormattedMessage id="tools.imageWatermark.advanced" /></Title>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <div className="text-xs mb-1"><FormattedMessage id="tools.imageWatermark.opacity" /></div>
                                    <Slider value={advancedOptions.opacity} onChange={v => setAdvancedOptions({ ...advancedOptions, opacity: v })} />
                                </div>
                                <div>
                                    <div className="text-xs mb-1"><FormattedMessage id="tools.imageWatermark.rotation" /></div>
                                    <Slider min={0} max={360} value={advancedOptions.rotation} onChange={v => setAdvancedOptions({ ...advancedOptions, rotation: v })} />
                                </div>
                                <div>
                                    <div className="text-xs mb-1"><FormattedMessage id="tools.imageWatermark.scale" /> %</div>
                                    <Slider min={10} max={200} value={advancedOptions.scale} onChange={v => setAdvancedOptions({ ...advancedOptions, scale: v })} />
                                </div>
                            </div>
                        </div>
                    </Card>
                </Space>

                <Space orientation='vertical' style={{ width: "100%" }}>
                    {images.length > 0 && (
                        <Card className="bg-white/5 border-slate-700 h-full flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-white">Images ({images.length})</h3>
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={isProcessing ? <span className="animate-spin">↻</span> : <FormatPainterOutlined />}
                                        onClick={handleProcessAll}
                                        disabled={isProcessing}
                                    >
                                        <FormattedMessage id="tools.imageWatermark.processAll" />
                                    </Button>
                                    <Button
                                        icon={<DownloadOutlined />}
                                        className="text-green-500 border-green-600 hover:text-green-400"
                                        onClick={handleDownloadAll}
                                    >
                                        Download All
                                    </Button>
                                    <Button icon={<ClearOutlined />} onClick={() => setImages([])} danger>Clear</Button>
                                </Space>
                            </div>

                            <div className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)] space-y-4 pr-2">
                                {images.map(img => (
                                    <div key={img.id} className="border border-slate-700/50 rounded-lg p-4 flex gap-4 items-start hover:border-primary-500/50 transition-colors">
                                        <img
                                            referrerPolicy='no-referrer'
                                            src={img.preview} alt={img.name} className="w-24 h-24 object-cover rounded bg-black/20" />

                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium truncate">{img.name}</h4>
                                            <div className="text-xs mt-1">
                                                {img.dimensions.width} x {img.dimensions.height} • {formatFileSize(img.originalSize)}
                                            </div>

                                            {img.status === 'completed' && (
                                                <div className="text-green-400 text-xs mt-2 flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-green-500"></span> Completed
                                                </div>
                                            )}

                                            {img.status === 'error' && <div className="text-red-400 text-xs mt-2">Error</div>}

                                            <div className="mt-3 flex gap-2">
                                                <Button size="small" type="primary" ghost icon={<FormatPainterOutlined />} onClick={() => processImage(img.id)} disabled={isProcessing}><FormattedMessage id="common.extract" /></Button>
                                                <Button size="small" icon={<EyeOutlined />} onClick={() => handlePreview(img)} disabled={img.status !== 'completed'}><FormattedMessage id="tools.qrCodeTool.recognize" /></Button>
                                                <Button size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(img.id)} disabled={img.status !== 'completed'} />
                                                <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(img.id)} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </Space>
            </Space>

            <Modal
                title="Preview"
                open={showPreviewModal}
                onCancel={() => setShowPreviewModal(false)}
                footer={null}
                width={800}
                centered
            >
                {previewItem && previewItem.processedPreviewUrl && (
                    <div className="flex justify-center items-center bg-black/10 rounded border border-slate-200 p-4">
                        <img
                            referrerPolicy='no-referrer'
                            src={previewItem.processedPreviewUrl}
                            className="max-w-full max-h-[70vh] object-contain" />
                    </div>
                )}
            </Modal>
        </div >
    );
};

export default ImageWatermark;
