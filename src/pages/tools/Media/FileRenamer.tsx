import React, { useState, useEffect, useMemo } from 'react';
import {
    Card,
    Tabs,
    Input,
    Button,
    Typography,
    Space,
    Upload,
    message,
    Select,
    Checkbox,
    Radio,
    Table,
    Modal
} from 'antd';
import { FormattedMessage, useIntl } from 'react-intl';
import {
    FileAddOutlined,
    DeleteOutlined,
    DownloadOutlined,
    ClearOutlined,
    CodeOutlined,
    MenuOutlined
} from '@ant-design/icons';
import JSZip from 'jszip';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { Option } = Select;

// --- Interfaces ---
interface FileInfo {
    id: string;
    file: File;
    originalName: string;
    currentName: string; // The name after applying rename logic (preview)
    size: number;
    type: string;
    lastModified: number;
}

interface SequentialOptions {
    prefix: string;
    startNumber: number;
    padding: number;
}

interface ReplaceOptions {
    findText: string;
    replaceText: string;
    caseSensitive: boolean;
}

interface CaseOptions {
    type: 'uppercase' | 'lowercase' | 'capitalize';
}

interface InsertOptions {
    text: string;
    position: 'prefix' | 'suffix' | 'index';
    index: number;
}

interface TruncateOptions {
    startIndex: number;
    endIndex: number; // 0 means end of string
}

const SortableRow = ({ children, ...props }: any) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: props['data-row-key'],
    });

    const style: React.CSSProperties = {
        ...props.style,
        transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
        transition,
        cursor: 'move',
        ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
    };

    return (
        <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </tr>
    );
};


const FileRenamer: React.FC = () => {
    const intl = useIntl();
    // --- State ---
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [activeTab, setActiveTab] = useState('sequential');
    const [sortType, setSortType] = useState('natural');
    const [showScriptModal, setShowScriptModal] = useState(false);
    const [scriptType, setScriptType] = useState<'windows' | 'linux'>('windows');

    // Options
    const [sequentialOptions, setSequentialOptions] = useState<SequentialOptions>({ prefix: '', startNumber: 1, padding: 3 });
    const [replaceOptions, setReplaceOptions] = useState<ReplaceOptions>({ findText: '', replaceText: '', caseSensitive: false });
    const [caseOptions, setCaseOptions] = useState<CaseOptions>({ type: 'lowercase' });
    const [insertOptions, setInsertOptions] = useState<InsertOptions>({ text: '', position: 'prefix', index: 0 });
    const [truncateOptions, setTruncateOptions] = useState<TruncateOptions>({ startIndex: 0, endIndex: 0 });

    // --- Helpers ---
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileNameWithoutExtension = (filename: string): string => {
        const lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex === -1) return filename;
        return filename.substring(0, lastDotIndex);
    };

    const getFileExtension = (filename: string): string => {
        const lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex === -1) return '';
        return filename.substring(lastDotIndex);
    };

    // --- Core Logic ---
    const generatePreviewName = (file: FileInfo, index: number) => {
        const originalName = file.originalName;
        let tmpName = originalName;

        if (activeTab === 'sequential') {
            const extension = getFileExtension(originalName);
            const number = (sequentialOptions.startNumber + index).toString().padStart(sequentialOptions.padding, '0');
            tmpName = `${sequentialOptions.prefix}${number}${extension}`;
        }
        else if (activeTab === 'replace' && replaceOptions.findText) {
            const flags = replaceOptions.caseSensitive ? 'g' : 'gi';
            try {
                // Escape regex special characters if not intended as regex? 
                // Vue code did: replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                const safeFind = replaceOptions.findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(safeFind, flags);
                tmpName = originalName.replace(regex, replaceOptions.replaceText);
            } catch (e) {
                // ignore invalid regex
            }
        }
        else if (activeTab === 'case') {
            const nameWithoutExt = getFileNameWithoutExtension(originalName);
            const extension = getFileExtension(originalName);
            let transformed = nameWithoutExt;

            if (caseOptions.type === 'uppercase') transformed = nameWithoutExt.toUpperCase();
            else if (caseOptions.type === 'lowercase') transformed = nameWithoutExt.toLowerCase();
            else if (caseOptions.type === 'capitalize') {
                transformed = nameWithoutExt.split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ');
            }
            tmpName = `${transformed}${extension}`;
        }
        else if (activeTab === 'insert' && insertOptions.text) {
            const nameWithoutExt = getFileNameWithoutExtension(originalName);
            const extension = getFileExtension(originalName);

            if (insertOptions.position === 'prefix') {
                tmpName = `${insertOptions.text}${nameWithoutExt}${extension}`;
            } else if (insertOptions.position === 'suffix') {
                tmpName = `${nameWithoutExt}${insertOptions.text}${extension}`;
            } else if (insertOptions.position === 'index') {
                const idx = Math.min(Math.max(0, insertOptions.index), nameWithoutExt.length);
                const before = nameWithoutExt.substring(0, idx);
                const after = nameWithoutExt.substring(idx);
                tmpName = `${before}${insertOptions.text}${after}${extension}`;
            }
        }
        else if (activeTab === 'truncate') {
            const nameWithoutExt = getFileNameWithoutExtension(originalName);
            const extension = getFileExtension(originalName);
            const start = Math.max(0, truncateOptions.startIndex);
            const end = truncateOptions.endIndex || nameWithoutExt.length;
            const truncated = nameWithoutExt.substring(start, Math.min(end, nameWithoutExt.length));
            tmpName = `${truncated}${extension}`;
        }

        return tmpName;
    };

    // Update files with preview names whenever options change
    useEffect(() => {
        setFiles(prev => prev.map((f, i) => ({
            ...f,
            currentName: generatePreviewName(f, i)
        })));
    }, [files.length, activeTab, sequentialOptions, replaceOptions, caseOptions, insertOptions, truncateOptions]);
    // Note: Including 'files.length' and option dependencies. We should NOT include 'files' itself to avoid loop if we updated inside. 
    // actually we need to re-run if order changes or options change. 
    // If we only update `currentName`, we might need a separate state or just derivation.
    // Let's use derivation on render or a specific effect that depends on the *Order* of IDs and Options.

    // Better approach: Derived state.
    // However, we want to persist the 'files' order.
    // Let's create a computed list for rendering.
    const processedFiles = useMemo(() => {
        return files.map((file, index) => ({
            ...file,
            currentName: generatePreviewName(file, index)
        }));
    }, [files, activeTab, sequentialOptions, replaceOptions, caseOptions, insertOptions, truncateOptions]);


    // --- Handlers ---
    const addFiles = (newFiles: File[]) => {
        const fileInfos: FileInfo[] = newFiles.map(f => ({
            id: Math.random().toString(36).substr(2, 9),
            file: f,
            originalName: f.name,
            currentName: f.name,
            size: f.size,
            type: f.type,
            lastModified: f.lastModified
        }));
        setFiles(prev => [...prev, ...fileInfos]);
    };

    const handleClear = () => setFiles([]);

    const handleSort = (type: string) => {
        setSortType(type);
        const sorted = [...files];
        if (type === 'natural') {
            sorted.sort((a, b) => a.originalName.localeCompare(b.originalName, undefined, { numeric: true, sensitivity: 'base' }));
        } else if (type === 'filename') {
            sorted.sort((a, b) => a.originalName.localeCompare(b.originalName));
        } else if (type === 'modifiedTime') {
            sorted.sort((a, b) => a.lastModified - b.lastModified);
        } else if (type === 'modifiedTimeDesc') {
            sorted.sort((a, b) => b.lastModified - a.lastModified);
        } else if (type === 'reverse') {
            sorted.reverse();
        }
        setFiles(sorted);
    };

    const handleDownload = async () => {
        if (processedFiles.length === 0) return;
        const zip = new JSZip();
        processedFiles.forEach(file => {
            // Handle duplicates? JSZip overwrites by default or we can rename.
            // For now assume unique names or overwrite.
            zip.file(file.currentName, file.file);
        });

        try {
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const link = document.createElement('a');
            link.href = url;
            link.download = `renamed_files_${Date.now()}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            message.success(intl.formatMessage({ id: 'common.downloadSuccess' }));
        } catch (e) {
            console.error(e);
            message.error(intl.formatMessage({ id: 'tools.favicon.zipError' }));
        }
    };

    const generateScript = () => {
        let content = '';
        if (scriptType === 'windows') {
            content = '@echo off\r\n';
            processedFiles.forEach(file => {
                if (file.currentName !== file.originalName) {
                    content += `ren "${file.originalName}" "${file.currentName}"\r\n`;
                }
            });
        } else {
            content = '#!/bin/bash\n';
            processedFiles.forEach(file => {
                if (file.currentName !== file.originalName) {
                    content += `mv "${file.originalName}" "${file.currentName}"\n`;
                }
            });
        }
        return content;
    };

    const handleCopyScript = () => {
        const content = generateScript();
        navigator.clipboard.writeText(content);
        message.success(intl.formatMessage({ id: 'common.copySuccess' }));
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            setFiles((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over?.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    // --- Render ---
    const columns = [
        {
            title: '',
            key: 'sort',
            width: 50,
            render: () => <MenuOutlined style={{ cursor: 'move', color: '#999' }} />,
        },
        { title: <FormattedMessage id="tools.fileRenamer.originalName" />, dataIndex: 'originalName', key: 'originalName', ellipsis: true },
        {
            title: <FormattedMessage id="tools.fileRenamer.newName" />,
            dataIndex: 'currentName',
            key: 'currentName',
            ellipsis: true,
            render: (text: string, record: FileInfo) => (
                <span className={text !== record.originalName ? 'text-green-400 font-medium' : ''}>{text}</span>
            )
        },
        {
            title: <FormattedMessage id="tools.jsonFormatter.stats.size" />,
            dataIndex: 'size',
            key: 'size',
            width: 100,
            render: (size: number) => formatFileSize(size)
        },
        {
            title: <FormattedMessage id="common.action" />,
            key: 'action',
            width: 80,
            render: (_: any, record: FileInfo) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => setFiles(prev => prev.filter(f => f.id !== record.id))}
                />
            )
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
                <Title level={1} className="text-white mb-4">
                    <FormattedMessage id="tools.fileRenamer.name" />
                </Title>
                <Text className="text-lg">
                    <FormattedMessage id="tools.fileRenamer.description" />
                </Text>
            </div>

            <Space orientation='vertical' style={{ width: "100%" }}>
                {/* Upload Area */}
                <Card className="bg-white/5 border-slate-700 mb-6">
                    <Dragger
                        customRequest={({ file, onSuccess }) => {
                            addFiles([file as File]);
                            setTimeout(() => onSuccess?.("ok"), 0);
                        }}
                        showUploadList={false}
                        multiple
                        className="bg-transparent border-slate-600 hover:border-primary-500"
                    >
                        <p className="ant-upload-drag-icon"><FileAddOutlined className="text-5xl" /></p>
                        <p className="text-xl mt-4"><FormattedMessage id="tools.fileRenamer.uploadText" /></p>
                        <p className="mt-2"><FormattedMessage id="tools.fileRenamer.uploadHint" /></p>
                    </Dragger>
                </Card>
                {files.length > 0 && (
                    <Space orientation='vertical'>
                        {/* Controls */}
                        <Card className="bg-white/5 border-slate-700">
                            <Space className="mb-4 w-full justify-between wrap">
                                <Space wrap>
                                    <FormattedMessage id="tools.imageListProcessor.total" values={{ count: files.length }} /> ({formatFileSize(files.reduce((a, b) => a + b.size, 0))})
                                    <Select value={sortType} onChange={handleSort} style={{ width: 140 }}>
                                        <Option value="natural"><FormattedMessage id="tools.fileRenamer.sort.natural" /></Option>
                                        <Option value="filename"><FormattedMessage id="tools.fileRenamer.sort.filename" /></Option>
                                        <Option value="modifiedTime"><FormattedMessage id="tools.fileRenamer.sort.modifiedTime" /></Option>
                                        <Option value="reverse"><FormattedMessage id="tools.fileRenamer.sort.reverse" /></Option>
                                    </Select>
                                </Space>
                                <Space>
                                    <Button icon={<CodeOutlined />} onClick={() => setShowScriptModal(true)}><FormattedMessage id="tools.fileRenamer.script" /></Button>
                                    <Button icon={<DownloadOutlined />} type="primary" onClick={handleDownload}><FormattedMessage id="tools.fileRenamer.download" /></Button>
                                    <Button icon={<ClearOutlined />} onClick={handleClear}><FormattedMessage id="common.clear" /></Button>
                                </Space>
                            </Space>

                            <Tabs
                                activeKey={activeTab}
                                onChange={setActiveTab}
                                type="card"
                                items={[
                                    {
                                        label: intl.formatMessage({ id: 'tools.fileRenamer.tab.sequential' }), key: 'sequential', children: (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                                                <div>
                                                    <div className="mb-1"><FormattedMessage id="tools.fileRenamer.prefix" /></div>
                                                    <Input value={sequentialOptions.prefix} onChange={e => setSequentialOptions({ ...sequentialOptions, prefix: e.target.value })} placeholder="Img_" />
                                                </div>
                                                <div>
                                                    <div className="mb-1"><FormattedMessage id="tools.fileRenamer.startNumber" /></div>
                                                    <Input type="number" value={sequentialOptions.startNumber} onChange={e => setSequentialOptions({ ...sequentialOptions, startNumber: parseInt(e.target.value) || 1 })} />
                                                </div>
                                                <div>
                                                    <div className="mb-1"><FormattedMessage id="tools.fileRenamer.padding" /></div>
                                                    <Input type="number" value={sequentialOptions.padding} onChange={e => setSequentialOptions({ ...sequentialOptions, padding: parseInt(e.target.value) || 1 })} />
                                                </div>
                                            </div>
                                        )
                                    },
                                    {
                                        label: intl.formatMessage({ id: 'tools.fileRenamer.tab.replace' }), key: 'replace', children: (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                                <div>
                                                    <div className="mb-1"><FormattedMessage id="tools.fileRenamer.find" /></div>
                                                    <Input value={replaceOptions.findText} onChange={e => setReplaceOptions({ ...replaceOptions, findText: e.target.value })} />
                                                </div>
                                                <div>
                                                    <div className="mb-1"><FormattedMessage id="tools.fileRenamer.replace" /></div>
                                                    <Input value={replaceOptions.replaceText} onChange={e => setReplaceOptions({ ...replaceOptions, replaceText: e.target.value })} />
                                                </div>
                                                <Checkbox checked={replaceOptions.caseSensitive} onChange={e => setReplaceOptions({ ...replaceOptions, caseSensitive: e.target.checked })}><FormattedMessage id="tools.fileRenamer.caseSensitive" /></Checkbox>
                                            </div>
                                        )
                                    },
                                    {
                                        label: intl.formatMessage({ id: 'tools.fileRenamer.tab.case' }), key: 'case', children: (
                                            <div className="pt-4">
                                                <Radio.Group value={caseOptions.type} onChange={e => setCaseOptions({ ...caseOptions, type: e.target.value })}>
                                                    <Radio.Button value="lowercase">lowercase</Radio.Button>
                                                    <Radio.Button value="uppercase">UPPERCASE</Radio.Button>
                                                    <Radio.Button value="capitalize">Capitalize</Radio.Button>
                                                </Radio.Group>
                                            </div>
                                        )
                                    },
                                    {
                                        label: intl.formatMessage({ id: 'tools.fileRenamer.tab.insert' }), key: 'insert', children: (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                                <div>
                                                    <div className="mb-1"><FormattedMessage id="common.text" /></div>
                                                    <Input value={insertOptions.text} onChange={e => setInsertOptions({ ...insertOptions, text: e.target.value })} />
                                                </div>
                                                <div>
                                                    <div className="mb-1"><FormattedMessage id="tools.fileRenamer.position" /></div>
                                                    <Select value={insertOptions.position} onChange={v => setInsertOptions({ ...insertOptions, position: v })} style={{ width: '100%' }}>
                                                        <Option value="prefix">Prefix</Option>
                                                        <Option value="suffix">Suffix</Option>
                                                        <Option value="index">At Index</Option>
                                                    </Select>
                                                </div>
                                                {insertOptions.position === 'index' && (
                                                    <div>
                                                        <div className="mb-1"><FormattedMessage id="tools.fileRenamer.index" /></div>
                                                        <Input type="number" value={insertOptions.index} onChange={e => setInsertOptions({ ...insertOptions, index: parseInt(e.target.value) || 0 })} />
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    },
                                    {
                                        label: intl.formatMessage({ id: 'tools.fileRenamer.tab.truncate' }), key: 'truncate', children: (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                                <div>
                                                    <div className="mb-1"><FormattedMessage id="tools.fileRenamer.startIndex" /></div>
                                                    <Input type="number" value={truncateOptions.startIndex} onChange={e => setTruncateOptions({ ...truncateOptions, startIndex: parseInt(e.target.value) || 0 })} />
                                                </div>
                                                <div>
                                                    <div className="mb-1"><FormattedMessage id="tools.fileRenamer.endIndex" /></div>
                                                    <Input type="number" value={truncateOptions.endIndex} onChange={e => setTruncateOptions({ ...truncateOptions, endIndex: parseInt(e.target.value) || 0 })} />
                                                </div>
                                            </div>
                                        )
                                    }
                                ]}
                            />
                        </Card>

                        {/* File List */}
                        <Card className="bg-white/5 border-slate-700 overflow-hidden" bodyStyle={{ padding: 0 }}>
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={processedFiles.map(f => f.id)} strategy={verticalListSortingStrategy}>
                                    <Table
                                        dataSource={processedFiles}
                                        columns={columns}
                                        rowKey="id"
                                        pagination={false}
                                        components={{
                                            body: {
                                                row: SortableRow,
                                            },
                                        }}
                                        className="ant-table-transparent"
                                    />
                                </SortableContext>
                            </DndContext>
                        </Card>
                    </Space>
                )}
            </Space>

            <Modal
                title={<FormattedMessage id="tools.fileRenamer.script" />}
                open={showScriptModal}
                onCancel={() => setShowScriptModal(false)}
                footer={[
                    <Button key="copy" onClick={handleCopyScript}><FormattedMessage id="common.copy" /></Button>,
                    <Button key="close" onClick={() => setShowScriptModal(false)}><FormattedMessage id="common.cancel" /></Button>
                ]}
            >
                <div className="mb-4">
                    <Select value={scriptType} onChange={setScriptType} style={{ width: 120 }}>
                        <Option value="windows">Windows</Option>
                        <Option value="linux">Linux / Mac</Option>
                    </Select>
                </div>
                <Input.TextArea
                    value={generateScript()}
                    rows={10}
                    readOnly
                    className="font-mono text-green-400"
                />
            </Modal>
        </div>
    );
};

export default FileRenamer;
