import React from 'react';
import { PictureOutlined, QrcodeOutlined, BgColorsOutlined, FileTextOutlined, CompressOutlined, FileImageOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { type ToolConfig } from '@/types/tool';

const tools: ToolConfig[] = [
    {
        id: 'imageListProcessor',
        name: 'Image List Processor',
        description: 'Batch process and preview list of image URLs',
        icon: <PictureOutlined />,
        category: 'Media',
        component: React.lazy(() => import('./ImageListProcessor')),
        path: '/media/image-list-processor',
    },
    {
        id: 'qrCodeTool',
        name: 'QR Code Tool',
        description: 'Generate and recognize QR codes',
        icon: <QrcodeOutlined />,
        category: 'Media',
        component: React.lazy(() => import('./QrCodeTool')),
        path: '/media/qr-code',
    },
    {
        id: 'colorPicker',
        name: 'Color Picker',
        description: 'Advanced color selection and conversion',
        icon: <BgColorsOutlined />,
        category: 'Media',
        component: React.lazy(() => import('./ColorPickerTool')),
        path: '/media/color-picker',
    },
    {
        id: 'fileRenamer',
        name: 'File Renamer',
        description: 'Batch rename files with advanced rules',
        icon: <FileTextOutlined />,
        category: 'Media',
        component: React.lazy(() => import('./FileRenamer')),
        path: '/media/file-renamer',
    },
    {
        id: 'imageCompressor',
        name: 'Image Compressor',
        description: 'Compress images (JPG, PNG, WebP, GIF) locally',
        icon: <CompressOutlined />,
        category: 'Media',
        component: React.lazy(() => import('./ImageCompressor')),
        path: '/media/image-compressor',
    },
    {
        id: 'imageWatermark',
        name: 'Image Watermark',
        description: 'Add text or image watermarks to images',
        icon: <FileImageOutlined />,
        category: 'Media',
        component: React.lazy(() => import('./ImageWatermark')),
        path: '/media/image-watermark',
    },
    {
        id: 'imageToGifConverter',
        name: 'Image to GIF Converter',
        description: 'Convert multiple images into a single animated GIF',
        icon: <FileImageOutlined />,
        category: 'Media',
        component: React.lazy(() => import('./ImageToGifConverter')),
        path: '/media/image-to-gif-converter',
    },
    {
        id: 'gifEditor',
        name: 'GIF Editor',
        description: 'Edit and customize animated GIFs by manipulating frames and delays',
        icon: <FileImageOutlined />,
        category: 'Media',
        component: React.lazy(() => import('./GifEditor')),
        path: '/media/gif-editor',
    },
    {
        id: 'videoImageConverter',
        name: 'Video Image Converter',
        description: 'Convert videos to images and images to videos with customizable settings',
        icon: <VideoCameraOutlined />,
        category: 'Media',
        component: React.lazy(() => import('./VideoImageConverter')),
        path: '/media/video-image-converter',
    },
    {
        id: 'videoToGifConverter',
        name: 'Video to GIF Converter',
        description: 'Convert videos to animated GIFs with time range selection and text overlay',
        icon: <VideoCameraOutlined />,
        category: 'Media',
        component: React.lazy(() => import('./VideoToGifConverter')),
        path: '/media/video-to-gif-converter',
    }
];

export default tools;
