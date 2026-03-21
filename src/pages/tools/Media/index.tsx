import React from 'react';
import { PictureOutlined, QrcodeOutlined, BgColorsOutlined, FileTextOutlined, CompressOutlined, FileImageOutlined, VideoCameraOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { type ToolConfig } from '@/types/tool';

const tools: ToolConfig[] = [
    {
        id: 'imageListProcessor',
        name: 'Image List Processor',
        description: 'Batch process and preview list of image URLs',
        icon: <PictureOutlined />,
        category: 'Media',
        component: React.lazy(() => import('./ImageListProcessor')),
        path: '/tools/image-list-processor',
    },
    {
        id: 'qrCodeTool',
        name: 'QR Code Tool',
        description: 'Generate and recognize QR codes',
        icon: <QrcodeOutlined />,
        category: 'Media',
        component: React.lazy(() => import('./QrCodeTool')),
        path: '/tools/qr-code',
    },
    {
        id: 'colorPicker',
        name: 'Color Picker',
        description: 'Advanced color selection and conversion',
        icon: <BgColorsOutlined />,
        category: 'Media',
        component: React.lazy(() => import('./ColorPickerTool')),
        path: '/tools/color-picker',
    },
    {
        id: 'fileRenamer',
        name: 'File Renamer',
        description: 'Batch rename files with advanced rules',
        icon: <FileTextOutlined />,
        category: 'Media',
        component: React.lazy(() => import('./FileRenamer')),
        path: '/tools/file-renamer',
    },
    {
        id: "livePhoto",
        name: "Live Photo Utility",
        description: "Extract or create Live Photos (MVIMG, Motion Photos) from images and videos",
        icon: <VideoCameraOutlined />,
        category: "Media",
        component: React.lazy(() => import("../Media/LivePhotoUtility")),
        path: "/tools/live-photo-utility",
    },
    {
        id: 'imageCompressor',
        name: 'Image Compressor',
        description: 'Compress images (JPG, PNG, WebP, GIF) locally',
        icon: <CompressOutlined />,
        category: 'Media',
        component: React.lazy(() => import('./ImageCompressor')),
        path: '/tools/image-compressor',
    },
    {
        id: 'imageWatermark',
        name: 'Image Watermark',
        description: 'Add text or image watermarks to images',
        icon: <FileImageOutlined />,
        category: 'Media',
        component: React.lazy(() => import('./ImageWatermark')),
        path: '/tools/image-watermark',
    },
    {
        id: 'imageToGifConverter',
        name: 'Image to GIF Converter',
        description: 'Convert multiple images into a single animated GIF',
        icon: <FileImageOutlined />,
        category: 'Media',
        component: React.lazy(() => import('./ImageToGifConverter')),
        path: '/tools/image-to-gif-converter',
    },
    {
        id: 'universalVideoPlayer',
        name: 'Universal Video Player',
        description: 'Professional video player supporting HLS, DASH, and local files',
        icon: <PlayCircleOutlined />,
        category: 'Media',
        component: React.lazy(() => import('./UniversalVideoPlayer')),
        path: '/tools/universal-video-player',
    },
    {
        id: 'imageBase64Converter',
        name: 'Image Base64 Converter',
        description: 'Convert images to base64 strings and vice versa',
        icon: <FileImageOutlined />,
        category: 'Media',
        component: React.lazy(() => import('./ImageBase64Converter')),
        path: '/tools/image-base64-converter',
    }
];

export default tools;
