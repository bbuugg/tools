import React, { useState, useMemo } from 'react';
import {
    Card,
    Upload,
    Slider,
    Select,
    InputNumber,
    Button,
    Typography,
    Space,
    message,
    Modal
} from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    FileImageOutlined,
    CompressOutlined,
    DownloadOutlined,
    DeleteOutlined,
    EyeOutlined,
    ClearOutlined
} from '@ant-design/icons';
// @ts-expect-error No type definitions available
import GIF from 'gif.js';
import { parseGIF, decompressFrames } from 'gifuct-js';
import JSZip from 'jszip';

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { Option } = Select;

interface ImageItem {
    id: string;
    file: File;
    name: string;
    preview: string;
    originalSize: number;
    compressedSize?: number;
    dimensions: { width: number; height: number };
    status: 'pending' | 'compressing' | 'completed' | 'error';
    progress: number;
    savedPercentage?: number;
    compressedBlob?: Blob;
    isAnimatedGif?: boolean;
}

const ImageCompressor: React.FC = () => {
    const intl = useIntl();
    // --- State ---
    const [images, setImages] = useState<ImageItem[]>([]);
    const [compressionQuality, setCompressionQuality] = useState(80);
    const [outputFormat, setOutputFormat] = useState('original');
    const [maxWidth, setMaxWidth] = useState<number | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);

    // Preview
    const [previewItem, setPreviewItem] = useState<ImageItem | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [compressedPreviewUrl, setCompressedPreviewUrl] = useState('');

    // --- Computed ---
    const stats = useMemo(() => {
        const completed = images.filter(img => img.status === 'completed');
        const totalOriginal = completed.reduce((sum, img) => sum + img.originalSize, 0);
        const totalCompressed = completed.reduce((sum, img) => sum + (img.compressedSize || 0), 0);
        const savedPercent = totalOriginal > 0
            ? Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100)
            : 0;
        return { totalOriginal, totalCompressed, savedPercent };
    }, [images]);

    // --- Helper Functions ---
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getImageDimensions = (file: File): Promise<{ width: number, height: number }> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve({ width: img.width, height: img.height });
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    };

    const checkIfAnimatedGif = async (file: File): Promise<boolean> => {
        if (file.type !== 'image/gif') return false;
        try {
            const buffer = await file.arrayBuffer();
            const gif = parseGIF(buffer);
            const frames = decompressFrames(gif, true);
            return frames.length > 1;
        } catch (e) {
            return false;
        }
    };

    // --- Core Actions ---
    const handleUpload = async (info: any) => {
        const file = info.file;
        if (!file.type.startsWith('image/')) {
            message.error(`${file.name} is not a valid image file`);
            return;
        }

        try {
            const dimensions = await getImageDimensions(file);
            const isAnimatedGif = await checkIfAnimatedGif(file);
            const newItem: ImageItem = {
                id: Math.random().toString(36).substr(2, 9),
                file,
                name: file.name,
                preview: URL.createObjectURL(file), // Note: Revoke this later
                originalSize: file.size,
                dimensions,
                status: 'pending',
                progress: 0,
                isAnimatedGif
            };
            setImages(prev => [...prev, newItem]);
        } catch (e) {
            console.error(e);
            message.error(`Failed to load ${file.name}`);
        }
    };

    const compressImage = async (id: string) => {
        const index = images.findIndex(img => img.id === id);
        if (index === -1) return;

        const image = images[index];
        // Mutate status to compressing
        setImages(prev => prev.map(img => img.id === id ? { ...img, status: 'compressing', progress: 0 } : img));

        try {
            if (image.isAnimatedGif && outputFormat === 'original') {
                await compressAnimatedGif(id);
                return;
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = image.preview;
            });

            // Resize
            let { width, height } = image.dimensions;
            if (maxWidth && width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);

            // Determine Format
            let mimeType = image.file.type;
            if (outputFormat !== 'original') {
                mimeType = `image/${outputFormat === 'jpg' ? 'jpeg' : outputFormat}`;
            }

            // To Blob
            const blob = await new Promise<Blob>((resolve) => {
                canvas.toBlob(blob => resolve(blob!), mimeType, compressionQuality / 100);
            });

            setImages(prev => prev.map(img => {
                if (img.id !== id) return img;
                return {
                    ...img,
                    status: 'completed',
                    progress: 100,
                    compressedBlob: blob,
                    compressedSize: blob.size,
                    savedPercentage: Math.round(((img.originalSize - blob.size) / img.originalSize) * 100)
                };
            }));

        } catch (e) {
            console.error(e);
            message.error(`Failed to compress ${image.name}`);
            setImages(prev => prev.map(img => img.id === id ? { ...img, status: 'error' } : img));
        }
    };

    const compressAnimatedGif = async (id: string) => {
        const index = images.findIndex(img => img.id === id);
        const image = images[index];

        try {
            const buffer = await image.file.arrayBuffer();
            const gif = parseGIF(buffer);
            const frames = decompressFrames(gif, true);

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) throw new Error('No Context');

            canvas.width = gif.lsd.width;
            canvas.height = gif.lsd.height;

            const quality = Math.max(1, Math.min(30, Math.floor((100 - compressionQuality) / 3)));

            const newGif = new GIF({
                workers: 2,
                quality: quality,
                width: canvas.width,
                height: canvas.height,
                workerScript: '/gif.worker.js' // Ensure this file exists in public folder
            });

            for (let i = 0; i < frames.length; i++) {
                const frame = frames[i];
                // Update progress
                setImages(prev => prev.map(img => img.id === id ? { ...img, progress: Math.round((i / frames.length) * 90) } : img));

                const imageData = new ImageData(
                    new Uint8ClampedArray(frame.patch),
                    frame.dims.width,
                    frame.dims.height
                );

                // Draw logic is slightly complex for GIFs with transparency/disposal
                // Simplified: Put frame image data
                // Note: Real gif rendering requires handling disposal methods (restore to bg, previous, etc)
                // decompressFrames helps, but we might need a temp canvas-buffer to compose frames if 'disposalType' implies dependency.
                // Assuming gifuct-js helps us get raw patches, but we still need to composite if the frame is partial.
                // For 'true' simplified compression, passing 'true' to decompressFrames builds full frames if supported? 
                // Ah, decompressFrames(gif, true) DOES NOT automatically composite. It just decompresses LZW.
                // We need to composite manually ideally. 
                // But for a quick tool, let's try direct putImageData if users upload simple GIFs, or refine later.
                // Actually, let's use ctx.putImageData at the right offset.

                ctx.putImageData(imageData, frame.dims.left, frame.dims.top);
                newGif.addFrame(ctx, { copy: true, delay: frame.delay });
            }

            const blob = await new Promise<Blob>((resolve, reject) => {
                newGif.on('finished', resolve);
                newGif.on('error', reject);
                newGif.render();
            });

            setImages(prev => prev.map(img => {
                if (img.id !== id) return img;
                return {
                    ...img,
                    status: 'completed',
                    progress: 100,
                    compressedBlob: blob,
                    compressedSize: blob.size,
                    savedPercentage: Math.round(((img.originalSize - blob.size) / img.originalSize) * 100)
                };
            }));

        } catch (e) {
            console.error('GIF Error', e);
            message.error('Animated GIF compression failed');
            setImages(prev => prev.map(img => img.id === id ? { ...img, status: 'error' } : img));
        }
    };

    const handleCompressAll = async () => {
        if (isCompressing) return;
        setIsCompressing(true);
        const pending = images.filter(img => img.status === 'pending' || img.status === 'error');

        // Process sequentially or small batches
        for (const img of pending) {
            await compressImage(img.id);
        }
        setIsCompressing(false);
        message.success(intl.formatMessage({ id: 'tools.imageCompressor.batchComplete' }));
    };

    const handleDownload = (id: string) => {
        const img = images.find(i => i.id === id);
        if (!img || !img.compressedBlob) return;

        const url = URL.createObjectURL(img.compressedBlob);
        const link = document.createElement('a');
        link.href = url;
        const ext = outputFormat === 'original' ? img.name.split('.').pop() : outputFormat;
        const name = img.name.substring(0, img.name.lastIndexOf('.'));
        link.download = `${name}_compressed.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDownloadAll = async () => {
        const completed = images.filter(img => img.status === 'completed' && img.compressedBlob);
        if (completed.length === 0) return;

        const zip = new JSZip();
        completed.forEach(img => {
            const ext = outputFormat === 'original' ? img.name.split('.').pop() : outputFormat;
            const name = img.name.substring(0, img.name.lastIndexOf('.'));
            const filename = `${name}_compressed.${ext}`;
            zip.file(filename, img.compressedBlob!);
        });

        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const link = document.createElement('a');
        link.href = url;
        link.download = `compressed_images_${Date.now()}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handlePreview = (img: ImageItem) => {
        setPreviewItem(img);
        if (img.compressedBlob) {
            const url = URL.createObjectURL(img.compressedBlob);
            setCompressedPreviewUrl(url);
        } else {
            setCompressedPreviewUrl('');
        }
        setShowPreviewModal(true);
    };

    // --- Render ---

    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
                <Title level={1} className="text-white mb-4">
                    <FormattedMessage id="tools.imageCompressor.name" />
                </Title>
                <Text className="text-lg">
                    <FormattedMessage id="tools.imageCompressor.description" />
                </Text>
            </div>

            {/* Upload */}
            <Space orientation='vertical' style={{ width: "100%" }}>
                <Card className="bg-white/5 border-slate-700 mb-6">
                    <Dragger
                        customRequest={({ file, onSuccess }) => { handleUpload({ file }); setTimeout(() => onSuccess?.("ok"), 0); }}
                        showUploadList={false}
                        multiple
                        accept="image/*"
                        className="bg-transparent border-slate-600 hover:border-primary-500"
                    >
                        <p className="ant-upload-drag-icon"><FileImageOutlined className="text-5xl text-slate-500" /></p>
                        <p className="text-xl mt-4"><FormattedMessage id="tools.imageCompressor.uploadText" /></p>
                        <p className="text-slate-400 mt-2"><FormattedMessage id="tools.imageCompressor.uploadHint" /></p>
                    </Dragger>
                </Card>

                {/* Settings */}
                <Card className="bg-white/5 border-slate-700 mb-6" title={<FormattedMessage id="common.options" />}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <div className="mb-2"><FormattedMessage id="tools.imageCompressor.quality" />: {compressionQuality}%</div>
                            <Slider
                                min={10} max={95}
                                value={compressionQuality}
                                onChange={setCompressionQuality}
                            />
                        </div>
                        <div>
                            <div className="mb-2"><FormattedMessage id="tools.imageCompressor.outputFormat" /></div>
                            <Select
                                value={outputFormat}
                                onChange={setOutputFormat}
                                style={{ width: '100%' }}
                                className=""
                            >
                                <Option value="original"><FormattedMessage id="tools.imageCompressor.keepOriginal" /></Option>
                                <Option value="jpg">JPG</Option>
                                <Option value="png">PNG</Option>
                                <Option value="webp">WebP</Option>
                            </Select>
                        </div>
                        <div>
                            <div className="mb-2"><FormattedMessage id="tools.imageCompressor.maxWidth" /> (px)</div>
                            <InputNumber
                                value={maxWidth}
                                onChange={setMaxWidth}
                                placeholder={intl.formatMessage({ id: 'tools.imageCompressor.optional' })}
                                style={{ width: '100%' }}
                                min={100}
                            />
                        </div>
                    </div>
                </Card>
                {images.length > 0 && (
                    <Space orientation='vertical' style={{ width: "100%" }}>
                        {/* Controls & Stats */}
                        <Card className="bg-white/5 border-slate-700">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <h3 className="text-lg font-semibold"><FormattedMessage id="tools.qrCodeTool.results" values={{ count: images.length }} /></h3>
                                <Space>
                                    <Button
                                        type="primary"
                                        icon={isCompressing ? <span className="animate-spin">↻</span> : <CompressOutlined />}
                                        onClick={handleCompressAll}
                                        disabled={isCompressing}
                                    >
                                        {isCompressing ? intl.formatMessage({ id: 'tools.imageCompressor.compressing' }) : intl.formatMessage({ id: 'tools.imageCompressor.compressAll' })}
                                    </Button>
                                    <Button
                                        type="default"
                                        className="border-green-600 text-green-500 hover:text-green-400"
                                        icon={<DownloadOutlined />}
                                        onClick={handleDownloadAll}
                                    >
                                        <FormattedMessage id="tools.qrCodeTool.downloadZip" />
                                    </Button>
                                    <Button icon={<ClearOutlined />} onClick={() => setImages([])}><FormattedMessage id="common.clear" /></Button>
                                </Space>
                            </div>

                            {stats.totalOriginal > 0 && (
                                <div className="grid grid-cols-3 gap-4 mt-6 text-center bg-green-900/20 p-4 rounded-lg border border-green-900/30">
                                    <div>
                                        <div className="text-2xl font-bold text-green-400">{formatFileSize(stats.totalOriginal)}</div>
                                        <div className="text-slate-400 text-xs"><FormattedMessage id="tools.imageCompressor.original" /></div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-400">{formatFileSize(stats.totalCompressed)}</div>
                                        <div className="text-slate-400 text-xs"><FormattedMessage id="tools.imageCompressor.compressed" /></div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-green-400">-{stats.savedPercent}%</div>
                                        <div className="text-slate-400 text-xs"><FormattedMessage id="tools.imageCompressor.saved" /></div>
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Image List */}
                        <div className="space-y-4">
                            {images.map(img => (
                                <div key={img.id} className="border border-slate-700/50 rounded-lg p-4 flex gap-4 items-center hover:border-primary-500/50 transition-colors">
                                    <img
                                        referrerPolicy='no-referrer'
                                        src={img.preview}
                                        alt={img.name}
                                        className="w-20 h-20 object-cover rounded bg-black/20" />

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium truncate">{img.name}</h4>
                                        <div className="text-xs mt-1">
                                            {img.dimensions.width} x {img.dimensions.height} • {formatFileSize(img.originalSize)}
                                        </div>
                                        {img.status === 'completed' && (
                                            <div className="text-green-400 text-xs mt-1">
                                                <FormattedMessage id="tools.imageCompressor.compressed" />: {formatFileSize(img.compressedSize!)} (-{img.savedPercentage}%)
                                            </div>
                                        )}
                                        {img.status === 'error' && <div className="text-red-400 text-xs mt-1"><FormattedMessage id="tools.qrCodeTool.scanFailed" /></div>}
                                        {img.status !== 'completed' && img.status !== 'error' && (
                                            <div className="w-full h-1 mt-2 rounded-full overflow-hidden">
                                                <div className="bg-primary-500 h-full transition-all duration-300" style={{ width: `${img.progress}%` }}></div>
                                            </div>
                                        )}
                                    </div>

                                    <Space orientation="vertical" align="end">
                                        <Space>
                                            <Button size="small" icon={<CompressOutlined />} onClick={() => compressImage(img.id)} disabled={isCompressing || img.status === 'completed' || img.status === 'compressing'} />
                                            <Button size="small" icon={<EyeOutlined />} onClick={() => handlePreview(img)} disabled={img.status !== 'completed'}><FormattedMessage id="tools.qrCodeTool.recognize" /></Button>
                                        </Space>
                                        <Space>
                                            <Button size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(img.id)} disabled={img.status !== 'completed'} type="primary" ghost />
                                            <Button size="small" icon={<DeleteOutlined />} onClick={() => setImages(prev => prev.filter(i => i.id !== img.id))} danger />
                                        </Space>
                                    </Space>
                                </div>
                            ))}
                        </div>
                    </Space>
                )}
            </Space>

            <Modal
                title={<FormattedMessage id="tools.qrCodeTool.recognize" />}
                open={showPreviewModal}
                onCancel={() => setShowPreviewModal(false)}
                footer={null}
                width={800}
                className="image-preview-modal"
            >
                {previewItem && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <div className="font-medium mb-2 text-center"><FormattedMessage id="tools.imageCompressor.original" /> ({formatFileSize(previewItem.originalSize)})</div>
                            <div className="bg-black/10 rounded overflow-hidden flex justify-center items-center h-64 border border-slate-200">
                                <img
                                    referrerPolicy='no-referrer'
                                    src={previewItem.preview}
                                    className="max-w-full max-h-full object-contain" />
                            </div>
                        </div>
                        <div>
                            <div className="font-medium mb-2 text-center text-green-600"><FormattedMessage id="tools.imageCompressor.compressed" /> ({formatFileSize(previewItem.compressedSize || 0)})</div>
                            <div className="bg-black/10 rounded overflow-hidden flex justify-center items-center h-64 border border-slate-200">
                                {compressedPreviewUrl && <img
                                    referrerPolicy='no-referrer'
                                    src={compressedPreviewUrl}
                                    className="max-w-full max-h-full object-contain" />}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ImageCompressor;
