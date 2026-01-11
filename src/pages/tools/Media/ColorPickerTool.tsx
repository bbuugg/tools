import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Card,
    ColorPicker,
    Row,
    Col,
    Slider,
    InputNumber,
    Typography,
    Button,
    Tabs,
    Upload,
    Input,
    Space
} from 'antd';
import {
    CopyOutlined,
    BgColorsOutlined,
    FileImageOutlined
} from '@ant-design/icons';
import type { Color, ColorPickerProps } from 'antd/es/color-picker';
import { useCopy } from '@/hooks/useCopy';
import { FormattedMessage } from 'react-intl';

const { Title, Text } = Typography;
const { Dragger } = Upload;

// Helper to convert RGB to CMYK
function rgbToCmyk(r: number, g: number, b: number) {
    let c = 0;
    let m = 0;
    let y = 0;
    let k = 0;

    const rN = r / 255;
    const gN = g / 255;
    const bN = b / 255;

    k = Math.min(1 - rN, 1 - gN, 1 - bN);
    c = (1 - rN - k) / (1 - k) || 0;
    m = (1 - gN - k) / (1 - k) || 0;
    y = (1 - bN - k) / (1 - k) || 0;

    return {
        c: Math.round(c * 100),
        m: Math.round(m * 100),
        y: Math.round(y * 100),
        k: Math.round(k * 100)
    };
}

// Helper to convert CMYK to RGB
function cmykToRgb(c: number, m: number, y: number, k: number) {
    const cN = c / 100;
    const mN = m / 100;
    const yN = y / 100;
    const kN = k / 100;

    const r = 1 - Math.min(1, cN * (1 - kN) + kN);
    const g = 1 - Math.min(1, mN * (1 - kN) + kN);
    const b = 1 - Math.min(1, yN * (1 - kN) + kN);

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

const ColorPickerTool: React.FC = () => {
    const copy = useCopy();

    const [colorValue, setColorValue] = useState<Color | string>('#1677ff');
    const [hexString, setHexString] = useState<string>('#1677ff');
    const [rgb, setRgb] = useState({ r: 22, g: 119, b: 255, a: 1 });
    // We don't necessarily need HSB state for sliders if we don't implement HSB sliders fully, 
    // but preserving for potential use.
    // const [hsb, setHsb] = useState({ h: 215, s: 91, b: 100, a: 1 });

    const [cmyk, setCmyk] = useState({ c: 91, m: 53, y: 0, k: 0 });

    const [sliderMode, setSliderMode] = useState<'rgb' | 'cmyk'>('rgb');

    // Image Picker
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const [isPicking, setIsPicking] = useState(false);

    // Sync all states from a Hex string (Manual/Common Colors)
    const syncFromHex = useCallback((hex: string) => {
        setColorValue(hex);
        setHexString(hex);

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        let r = 0, g = 0, b = 0;
        if (result) {
            r = parseInt(result[1], 16);
            g = parseInt(result[2], 16);
            b = parseInt(result[3], 16);
        }
        setRgb({ r, g, b, a: 1 });

        const newCmyk = rgbToCmyk(r, g, b);
        setCmyk(newCmyk);
    }, []);

    // Sync from Antd ColorPicker
    const handleColorChange: ColorPickerProps['onChange'] = (color) => {
        setColorValue(color);
        setHexString(color.toHexString());

        const _rgb = color.toRgb();
        setRgb({ r: _rgb.r, g: _rgb.g, b: _rgb.b, a: _rgb.a });

        const _cmyk = rgbToCmyk(_rgb.r, _rgb.g, _rgb.b);
        setCmyk(_cmyk);
    };

    // Sync from RGB Sliders
    const updateFromRgb = (newRgb: typeof rgb) => {
        setRgb(newRgb);
        const hex = '#' + ((1 << 24) | (newRgb.r << 16) | (newRgb.g << 8) | newRgb.b).toString(16).slice(1);
        setColorValue(`rgba(${newRgb.r}, ${newRgb.g}, ${newRgb.b}, ${newRgb.a})`);
        setHexString(hex);
        setCmyk(rgbToCmyk(newRgb.r, newRgb.g, newRgb.b));
    };

    // Sync from CMYK Sliders
    const updateFromCmyk = (newCmyk: typeof cmyk) => {
        setCmyk(newCmyk);
        const newRgbVals = cmykToRgb(newCmyk.c, newCmyk.m, newCmyk.y, newCmyk.k);
        const newRgb = { ...newRgbVals, a: rgb.a };
        setRgb(newRgb);
        const hex = '#' + ((1 << 24) | (newRgb.r << 16) | (newRgb.g << 8) | newRgb.b).toString(16).slice(1);
        setColorValue(`rgba(${newRgb.r}, ${newRgb.g}, ${newRgb.b}, ${newRgb.a})`);
        setHexString(hex);
    };

    const handleImageUpload = (info: any) => {
        const file = info.file.originFileObj || info.file;
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setImageUrl(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handlePaste = useCallback((e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => setImageUrl(ev.target?.result as string);
                    reader.readAsDataURL(file);
                }
            }
        }
    }, []);

    useEffect(() => {
        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [handlePaste]);

    const pickColor = (e: React.MouseEvent) => {
        if (!isPicking || !imageRef.current) return;
        const img = imageRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);

        const rect = img.getBoundingClientRect();
        // Calculate scale
        const scaleX = img.naturalWidth / rect.width;
        const scaleY = img.naturalHeight / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const p = ctx.getImageData(x, y, 1, 1).data;
        // p is [r, g, b, a]
        const hex = "#" + ((1 << 24) | (p[0] << 16) | (p[1] << 8) | p[2]).toString(16).slice(1);

        syncFromHex(hex);
        // Optional: setIsPicking(false);
    };

    const commonColors = [
        '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#6366f1',
        '#8b5cf6', '#ec4899', '#64748b', '#000000', '#ffffff', '#f4f4f5'
    ];

    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
                <Title level={1} className="text-white mb-4">
                    <FormattedMessage id="tools.colorPicker.name" />
                </Title>
                <Text className="text-lg">
                    <FormattedMessage id="tools.colorPicker.description" />
                </Text>
            </div>

            <Row gutter={[24, 24]}>
                {/* LEFT COLUMN */}
                <Col xs={24} lg={12}>
                    <Space orientation='vertical' style={{ width: "100%" }}>
                        {/* MAIN PICKER */}
                        <Card className="bg-white/5 border-slate-700" title={<FormattedMessage id="tools.colorPicker.selector" />}>
                            <div className="flex flex-col items-center gap-6">
                                <ColorPicker
                                    size='large'
                                    value={colorValue}
                                    onChange={handleColorChange}
                                />

                                <div className="w-full">
                                    <Tabs
                                        activeKey={sliderMode}
                                        onChange={(k) => setSliderMode(k as any)}
                                        type="card"
                                        size="small"
                                        items={[
                                            {
                                                key: 'rgb',
                                                label: 'RGB',
                                                children: (
                                                    <div className="space-y-4 pt-4">
                                                        {(['r', 'g', 'b'] as const).map(channel => (
                                                            <div key={channel} className="flex items-center gap-4">
                                                                <Text className="w-4 uppercase text-slate-400 font-bold">{channel}</Text>
                                                                <Slider
                                                                    min={0} max={255}
                                                                    value={rgb[channel]}
                                                                    onChange={v => updateFromRgb({ ...rgb, [channel]: v })}
                                                                    className="flex-1"
                                                                />
                                                                <InputNumber
                                                                    min={0} max={255}
                                                                    value={rgb[channel]}
                                                                    onChange={v => updateFromRgb({ ...rgb, [channel]: v || 0 })}
                                                                    className="w-16 border-slate-600"
                                                                />
                                                            </div>
                                                        ))}
                                                        <div className="flex items-center gap-4">
                                                            <Text className="w-4 uppercase text-slate-400 font-bold">A</Text>
                                                            <Slider
                                                                min={0} max={1} step={0.01}
                                                                value={rgb.a}
                                                                onChange={v => updateFromRgb({ ...rgb, a: v })}
                                                                className="flex-1"
                                                            />
                                                            <InputNumber
                                                                min={0} max={1} step={0.01}
                                                                value={rgb.a}
                                                                onChange={v => updateFromRgb({ ...rgb, a: v || 1 })}
                                                                className="w-16 border-slate-600"
                                                            />
                                                        </div>
                                                    </div>
                                                )
                                            },
                                            {
                                                key: 'cmyk',
                                                label: 'CMYK',
                                                children: (
                                                    <div className="space-y-4 pt-4">
                                                        {(['c', 'm', 'y', 'k'] as const).map(channel => (
                                                            <div key={channel} className="flex items-center gap-4">
                                                                <Text className="w-4 uppercase text-slate-400 font-bold">{channel}</Text>
                                                                <Slider
                                                                    min={0} max={100}
                                                                    value={cmyk[channel]}
                                                                    onChange={v => updateFromCmyk({ ...cmyk, [channel]: v })}
                                                                    className="flex-1"
                                                                />
                                                                <InputNumber
                                                                    min={0} max={100}
                                                                    value={cmyk[channel]}
                                                                    onChange={v => updateFromCmyk({ ...cmyk, [channel]: v || 0 })}
                                                                    className="w-16 border-slate-600"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )
                                            }
                                        ]}
                                    />
                                </div>
                            </div>
                        </Card>

                        {/* IMAGE PICKER */}
                        <Card className="bg-white/5 border-slate-700" title={<FormattedMessage id="tools.colorPicker.imagePicker" />}>
                            {!imageUrl ? (
                                <Dragger
                                    customRequest={({ file, onSuccess }) => { handleImageUpload({ file }); setTimeout(() => onSuccess?.("ok"), 0); }}
                                    showUploadList={false}
                                    accept="image/*"
                                    className="bg-transparent border-slate-600 hover:border-primary-500"
                                >
                                    <p className="ant-upload-drag-icon"><FileImageOutlined className="text-4xl text-slate-500" /></p>
                                    <p className="ant-upload-text"><FormattedMessage id="tools.colorPicker.clickImage" /></p>
                                </Dragger>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <Button
                                            type={isPicking ? 'primary' : 'default'}
                                            danger={isPicking}
                                            icon={<BgColorsOutlined />}
                                            onClick={() => setIsPicking(!isPicking)}
                                        >
                                            {isPicking ? <FormattedMessage id="tools.colorPicker.stopPicking" /> : <FormattedMessage id="tools.colorPicker.pickColor" />}
                                        </Button>
                                        <Button onClick={() => setImageUrl(null)}><FormattedMessage id="tools.colorPicker.clearImage" /></Button>
                                    </div>
                                    <div className="relative overflow-hidden rounded-lg border border-slate-600 flex justify-center">
                                        <img
                                            referrerPolicy='no-referrer'
                                            ref={imageRef}
                                            src={imageUrl}
                                            className={`max-h-96 object-contain ${isPicking ? 'cursor-crosshair' : ''}`}
                                            onClick={pickColor}
                                            crossOrigin="anonymous"
                                        />
                                    </div>
                                    {isPicking && <Text className="text-slate-400 text-xs"><FormattedMessage id="tools.colorPicker.pickHint" /></Text>}
                                </div>
                            )}
                        </Card>
                    </Space>
                </Col>

                {/* RIGHT COLUMN */}
                <Col xs={24} lg={12}>
                    <Space orientation='vertical' style={{ width: "100%" }}>
                        {/* VALUES COPY */}
                        <Card className="bg-white/5 border-slate-700" title={<FormattedMessage id="tools.colorPicker.values" />}>
                            <div className="space-y-4">
                                <Input
                                    prefix={<span className="w-12 text-slate-400 font-mono text-xs">HEX</span>}
                                    value={hexString.toUpperCase()}
                                    suffix={<CopyOutlined className="cursor-pointer hover:text-primary-500" onClick={() => copy(hexString)} />}
                                    className="border-slate-700 font-mono"
                                    readOnly
                                />
                                <Input
                                    prefix={<span className="w-12 text-slate-400 font-mono text-xs">RGB</span>}
                                    value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}
                                    suffix={<CopyOutlined className="cursor-pointer hover:text-primary-500" onClick={() => copy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)} />}
                                    className="border-slate-700 font-mono"
                                    readOnly
                                />
                                <Input
                                    prefix={<span className="w-12 text-slate-400 font-mono text-xs">RGBA</span>}
                                    value={`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`}
                                    suffix={<CopyOutlined className="cursor-pointer hover:text-primary-500" onClick={() => copy(`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`)} />}
                                    className="border-slate-700 font-mono"
                                    readOnly
                                />
                                <Input
                                    prefix={<span className="w-12 text-slate-400 font-mono text-xs">CMYK</span>}
                                    value={`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`}
                                    suffix={<CopyOutlined className="cursor-pointer hover:text-primary-500" onClick={() => copy(`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`)} />}
                                    className="border-slate-700 font-mono"
                                    readOnly
                                />
                            </div>
                        </Card>

                        {/* PREVIEW */}
                        <Card className="bg-white/5 border-slate-700" title={<FormattedMessage id="tools.colorPicker.preview" />}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <div className="h-24 rounded-lg flex items-center justify-center bg-white border border-slate-300">
                                        <div className="w-16 h-16 rounded" style={{ backgroundColor: hexString }}></div>
                                    </div>
                                    <Text className="text-slate-400 text-xs block text-center mt-2"><FormattedMessage id="tools.colorPicker.onLight" /></Text>
                                </Col>
                                <Col span={12}>
                                    <div className="h-24 rounded-lg flex items-center justify-center bg-black">
                                        <div className="w-16 h-16 rounded" style={{ backgroundColor: hexString }}></div>
                                    </div>
                                    <Text className="text-slate-400 text-xs block text-center mt-2"><FormattedMessage id="tools.colorPicker.onDark" /></Text>
                                </Col>
                            </Row>
                        </Card>

                        {/* COLORS GRID */}
                        <Card className="bg-white/5 border-slate-700" title={<FormattedMessage id="tools.colorPicker.commonColors" />}>
                            <div className="grid grid-cols-6 gap-3">
                                {commonColors.map(color => (
                                    <div
                                        key={color}
                                        className="w-10 h-10 rounded-lg cursor-pointer hover:scale-110 transition-transform border border-white/10"
                                        style={{ backgroundColor: color }}
                                        onClick={() => syncFromHex(color)}
                                    ></div>
                                ))}
                            </div>
                        </Card>
                    </Space>
                </Col>
            </Row>
        </div>
    );
};

export default ColorPickerTool;
