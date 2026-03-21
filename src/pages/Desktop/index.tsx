import { useThemeStore } from '@/store/useThemeStore';
import { allTools } from '@/utils/toolList';
import {
    AppstoreOutlined,
    BgColorsOutlined,
    DashboardOutlined,
    PlusOutlined,
    ReloadOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { ColorPicker, Dropdown, Form, Input, message, Modal, theme, type MenuProps } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router';

import DesktopIcon from './DesktopIcon';
import StartMenu from './StartMenu';
import Taskbar from './Taskbar';
import StatusBar from './StatusBar';
import Window from './Window';
import Iframe from '@/pages/Iframe';
import { type DesktopIconData } from './types';

const { useToken } = theme;

interface WindowState {
    id: string; // Unique ID for the window instance
    toolId: string;
    title: string;
    icon?: React.ReactNode;
    isMinimized: boolean;
    isMaximized: boolean;
    isActive: boolean;
    zIndex: number;
    initX?: number;
    initY?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}

const WindowLoading: React.FC = () => {
    const intl = useIntl();
    useEffect(() => {
        const hide = message.loading(intl.formatMessage({ id: 'common.loading', defaultMessage: 'Loading...' }), 0);
        return () => {
            hide();
        };
    }, [intl]);
    return null; // Don't render anything in the DOM, just trigger the message
};

const generateId = () => {
    return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const Desktop: React.FC = () => {
    const intl = useIntl();
    const navigate = useNavigate();
    const { theme: currentTheme, toggleTheme } = useThemeStore();
    const [icons, setIcons] = useState<DesktopIconData[]>(() => {
        const savedIcons = localStorage.getItem('as-desktop-icons');
        if (savedIcons) {
            return JSON.parse(savedIcons);
        } else {
            return allTools.slice(0, 5).map((tool, index) => ({
                id: tool.id,
                title: tool.name,
                icon: tool.id,
                path: tool.path,
                x: 40 + (Math.floor(index / 6) * 120),
                y: 40 + ((index % 6) * 120),
                color: '#22c55e'
            }));
        }
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isStartOpen, setIsStartOpen] = useState(false);
    const [editingIcon, setEditingIcon] = useState<DesktopIconData | null>(null);
    const [wallpaperIndex, setWallpaperIndex] = useState(0);
    const [backgroundImage, setBackgroundImage] = useState<string | null>(() => {
        const savedBackground = localStorage.getItem('as-desktop-background-image');
        return savedBackground ? savedBackground : null;
    });

    // Window Management State
    const [windows, setWindows] = useState<WindowState[]>([]);
    const [activeWindowMaxZIndex, setActiveWindowMaxZIndex] = useState(100);

    // Pinned Apps State
    const [pinnedApps, setPinnedApps] = useState<string[]>(() => {
        const savedPinnedApps = localStorage.getItem('as-pinned-apps');
        return savedPinnedApps ? JSON.parse(savedPinnedApps) : [];
    });

    const desktopRef = useRef<HTMLDivElement>(null);
    const [form] = Form.useForm();
    const { token } = useToken();

    const DEFAULT_WINDOW_WIDTH = 800;
    const DEFAULT_WINDOW_HEIGHT = 500;

    const wallpapers = [
        'from-green-500 via-transparent to-blue-600',
        'from-purple-600 via-transparent to-blue-500',
        'from-rose-500 via-transparent to-orange-500',
        'from-slate-900 to-slate-800'
    ];







    const saveIcons = (newIcons: DesktopIconData[]) => {
        setIcons(newIcons);
        localStorage.setItem('as-desktop-icons', JSON.stringify(newIcons));
    };

    const handleStop = (id: string, _: unknown, data: { x: number, y: number }) => {
        const newIcons = icons.map(icon =>
            icon.id === id ? { ...icon, x: data.x, y: data.y } : icon
        );
        saveIcons(newIcons);
    };

    // --- Window Management ---

    const openWindow = (toolId: string) => {
        const existingWindow = windows.find(w => w.toolId === toolId);
        const tool = allTools.find(t => t.id === toolId);

        if (!tool) return;

        if (existingWindow) {
            // Restore if minimized and bring to front
            focusWindow(existingWindow.id);
            if (existingWindow.isMinimized) {
                setWindows(prev => prev.map(w => w.id === existingWindow.id ? { ...w, isMinimized: false } : w));
            }
        } else {
            // Create new window
            // Calculate center position
            const centerX = Math.max(0, (window.innerWidth - DEFAULT_WINDOW_WIDTH) / 2);
            const centerY = Math.max(0, (window.innerHeight - DEFAULT_WINDOW_HEIGHT) / 2) - 60; // Slightly higher due to taskbar visual balance

            const newWindow: WindowState = {
                id: generateId(),
                toolId: tool.id,
                title: intl.formatMessage({ id: `tools.${tool.id}.name`, defaultMessage: tool.name }),
                icon: tool.icon,
                isMinimized: false,
                isMaximized: false,
                isActive: true,
                zIndex: activeWindowMaxZIndex + 1,
                initX: centerX,
                initY: centerY
            };
            setActiveWindowMaxZIndex(prev => prev + 1);
            setWindows(prev => [...prev.map(w => ({ ...w, isActive: false })), newWindow]);
        }
        setIsStartOpen(false);
    };

    const closeWindow = (id: string) => {
        setWindows(prev => prev.filter(w => w.id !== id));
    };

    const minimizeWindow = (id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true, isActive: false } : w));
    };

    const toggleMinimize = (id: string) => {
        const win = windows.find(w => w.id === id);
        if (!win) return;

        if (win.isMinimized) {
            // Restore
            setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: false, isActive: true, zIndex: activeWindowMaxZIndex + 1 } : { ...w, isActive: false }));
            setActiveWindowMaxZIndex(prev => prev + 1);
        } else {
            // Minimize or Focus
            if (win.isActive) {
                minimizeWindow(id);
            } else {
                focusWindow(id);
            }
        }
    };

    const maximizeWindow = (id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
    };

    const focusWindow = (id: string) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, isActive: true, zIndex: activeWindowMaxZIndex + 1 } : { ...w, isActive: false }));
        setActiveWindowMaxZIndex(prev => prev + 1);
    };

    const updateWindow = (id: string, updates: Partial<{ x: number; y: number; width: number; height: number }>) => {
        setWindows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
    };

    const handleIconClick = (path: string) => {
        // First, check if it's a known tool
        const tool = allTools.find(t => t.path === path);
        if (tool) {
            openWindow(tool.id);
        } else {
            // For custom icons, open them in a window instead of navigating
            // Create a unique ID for custom tools
            const customToolId = `custom-${encodeURIComponent(path)}-${Date.now()}`;

            // Open in window using the Iframe component
            const existingWindow = windows.find(w => w.toolId === customToolId);

            if (existingWindow) {
                focusWindow(existingWindow.id);
                if (existingWindow.isMinimized) {
                    setWindows(prev => prev.map(w => w.id === existingWindow.id ? { ...w, isMinimized: false } : w));
                }
            } else {
                // Create new window
                const centerX = Math.max(0, (window.innerWidth - DEFAULT_WINDOW_WIDTH) / 2);
                const centerY = Math.max(0, (window.innerHeight - DEFAULT_WINDOW_HEIGHT) / 2) - 60;

                const newWindow: WindowState = {
                    id: generateId(),
                    toolId: customToolId,
                    title: path.split('/').pop() || 'Custom Tool',
                    icon: <AppstoreOutlined />, // Use a default icon
                    isMinimized: false,
                    isMaximized: false,
                    isActive: true,
                    zIndex: activeWindowMaxZIndex + 1,
                    initX: centerX,
                    initY: centerY
                };
                setActiveWindowMaxZIndex(prev => prev + 1);
                setWindows(prev => [...prev.map(w => ({ ...w, isActive: false })), newWindow]);
            }
            setIsStartOpen(false);
        }
    };

    const handleAddToDesktop = (toolId: string) => {
        const tool = allTools.find(t => t.id === toolId);
        if (!tool) return;

        // Check if already exists
        if (icons.some(icon => icon.id === tool.id)) {
            message.info(intl.formatMessage({ id: 'desktop.alreadyOnDesktop', defaultMessage: 'Already on desktop' }));
            return;
        }

        const newIcon: DesktopIconData = {
            id: tool.id,
            title: tool.name,
            icon: tool.id,
            path: tool.path,
            x: 100, // Defalut position
            y: 100,
            color: '#22c55e'
        };
        saveIcons([...icons, newIcon]);
        message.success(intl.formatMessage({ id: 'desktop.addedToDesktop', defaultMessage: 'Added to desktop' }));
    };

    const handlePinApp = (toolId: string) => {
        if (pinnedApps.includes(toolId)) {
            message.info(intl.formatMessage({ id: 'taskbar.alreadyPinned', defaultMessage: 'Already pinned to dock' }));
            return;
        }
        const newPinnedApps = [...pinnedApps, toolId];
        setPinnedApps(newPinnedApps);
        localStorage.setItem('as-pinned-apps', JSON.stringify(newPinnedApps));
        message.success(intl.formatMessage({ id: 'taskbar.pinnedToDock', defaultMessage: 'Pinned to dock' }));
    };

    const handleUnpinApp = (toolId: string) => {
        const newPinnedApps = pinnedApps.filter(id => id !== toolId);
        setPinnedApps(newPinnedApps);
        localStorage.setItem('as-pinned-apps', JSON.stringify(newPinnedApps));
        message.success(intl.formatMessage({ id: 'taskbar.unpinnedFromDock', defaultMessage: 'Unpinned from dock' }));
    };

    // --- End Window Management ---

    const handleEditIcon = (icon: DesktopIconData) => {
        setEditingIcon(icon);
        form.setFieldsValue(icon);
        setIsEditModalOpen(true);
    };

    const handleDeleteIcon = (id: string) => {
        const newIcons = icons.filter(icon => icon.id !== id);
        saveIcons(newIcons);
        message.success(intl.formatMessage({ id: 'common.deleteSuccess' }));
    };

    const handleAddIcon = () => {
        setEditingIcon(null);
        form.resetFields();
        setIsEditModalOpen(true);
    };

    const onFinish = (values: Record<string, unknown>) => {
        if (editingIcon) {
            const newIcons = icons.map(icon =>
                icon.id === editingIcon.id ? { ...icon, ...values } : icon
            );
            saveIcons(newIcons);
        } else {
            const newIcon: DesktopIconData = {
                id: generateId(),
                title: values.title as string || '',
                path: values.path as string || '',
                icon: values.icon as string || '',
                x: 100,
                y: 100,
                color: values.color as string || '#22c5e'
            };
            saveIcons([...icons, newIcon]);
        }
        setIsEditModalOpen(false);
    };

    const getIconComponent = (toolId: string) => {
        const tool = allTools.find(t => t.id === toolId);
        return tool ? tool.icon : <AppstoreOutlined />;
    };

    const refreshDesktop = () => {
        const hide = message.loading(intl.formatMessage({ id: 'common.refreshing', defaultMessage: 'Refreshing desktop...' }), 0);
        setTimeout(() => {
            hide();
            message.success(intl.formatMessage({ id: 'common.refreshed', defaultMessage: 'Desktop refreshed' }));
        }, 500);
    };

    const autoArrange = () => {
        const arranged = icons.map((icon, index) => ({
            ...icon,
            x: 40 + (Math.floor(index / 6) * 120),
            y: 40 + ((index % 6) * 120),
        }));
        saveIcons(arranged);
        message.success(intl.formatMessage({ id: 'desktop.arranged', defaultMessage: 'Icons rearranged' }));
    };

    const desktopMenuItems: MenuProps['items'] = [
        {
            key: 'refresh',
            label: intl.formatMessage({ id: 'desktop.refresh', defaultMessage: 'Refresh Desktop' }),
            icon: <ReloadOutlined />,
            onClick: ({ domEvent }) => {
                domEvent.stopPropagation();
                refreshDesktop();
            }
        },
        { type: 'divider' },
        {
            key: 'new',
            label: intl.formatMessage({ id: 'desktop.addNewShortcut', defaultMessage: 'Add New Shortcut' }),
            icon: <PlusOutlined />,
            onClick: ({ domEvent }) => {
                domEvent.stopPropagation();
                handleAddIcon();
            }
        },
        {
            key: 'arrange',
            label: intl.formatMessage({ id: 'desktop.autoArrange', defaultMessage: 'Auto-arrange Icons' }),
            icon: <AppstoreOutlined />,
            onClick: ({ domEvent }) => {
                domEvent.stopPropagation();
                autoArrange();
            }
        },
        { type: 'divider' },
        {
            key: 'upload-bg',
            label: intl.formatMessage({ id: 'desktop.uploadBackground', defaultMessage: 'Upload Background' }),
            icon: <BgColorsOutlined />,
            onClick: ({ domEvent }) => {
                domEvent.stopPropagation();
                // Create a hidden file input
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const result = event.target?.result as string;
                            setBackgroundImage(result);
                            localStorage.setItem('as-desktop-background-image', result);
                            message.success(intl.formatMessage({ id: 'desktop.backgroundChanged', defaultMessage: 'Background changed successfully!' }));
                        };
                        reader.readAsDataURL(file);
                    }
                };
                input.click();
            }
        },
        {
            key: 'reset-bg',
            label: intl.formatMessage({ id: 'desktop.resetBackground', defaultMessage: 'Reset Background' }),
            icon: <BgColorsOutlined />,
            onClick: ({ domEvent }) => {
                domEvent.stopPropagation();
                setBackgroundImage(null);
                localStorage.removeItem('as-desktop-background-image');
                message.success(intl.formatMessage({ id: 'desktop.backgroundReset', defaultMessage: 'Background reset to default!' }));
            }
        },
        {
            key: 'wallpaper',
            label: intl.formatMessage({ id: 'desktop.changeWallpaper', defaultMessage: 'Change Wallpaper' }),
            icon: <BgColorsOutlined />,
            onClick: ({ domEvent }) => {
                domEvent.stopPropagation();
                setWallpaperIndex((prev) => (prev + 1) % wallpapers.length);
            }
        },
        {
            key: 'theme',
            label: currentTheme === 'dark' 
                ? intl.formatMessage({ id: 'desktop.switchToLight', defaultMessage: 'Switch to Light' }) 
                : intl.formatMessage({ id: 'desktop.switchToDark', defaultMessage: 'Switch to Dark' }),
            icon: <SettingOutlined />,
            onClick: ({ domEvent }) => {
                domEvent.stopPropagation();
                toggleTheme();
            }
        },
        { type: 'divider' },
        {
            key: 'dashboard',
            label: intl.formatMessage({ id: 'desktop.goHome', defaultMessage: 'Go to Home Page' }),
            icon: <DashboardOutlined />,
            onClick: ({ domEvent }) => {
                domEvent.stopPropagation();
                navigate('/');
            }
        },
    ];

    return (
        <Dropdown menu={{ items: desktopMenuItems }} trigger={['contextMenu']}>
            <div
                ref={desktopRef}
                className="relative fixed inset-0 w-screen h-screen overflow-hidden bg-slate-50 dark:bg-[#0a0f1e] transition-colors duration-700"
                style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(0,0,0,0.05) 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}
                onClick={() => setIsStartOpen(false)}
            >
                {backgroundImage ? (
                    <div
                        className="absolute inset-0 opacity-100 pointer-events-none transition-all duration-1000"
                        style={{
                            backgroundImage: `url(${backgroundImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                        }}
                    />
                ) : (
                    <div
                        className={`absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-br ${wallpapers[wallpaperIndex]} transition-all duration-1000 animate-pulse`}
                        style={{ animationDuration: '10s' }}
                    />
                )}
                <StatusBar
                    currentTheme={currentTheme}
                    toggleStartMenu={setIsStartOpen}
                    toggleTheme={toggleTheme} />

                <div className="relative w-full h-full p-4">
                    {/* Icons */}
                    {icons.map((icon) => (
                        <DesktopIcon
                            key={icon.id}
                            icon={icon}
                            onStop={handleStop}
                            onClick={handleIconClick}
                            onEdit={handleEditIcon}
                            onDelete={handleDeleteIcon}
                            getIconComponent={getIconComponent}
                        />
                    ))}

                    {/* Windows */}
                    {windows.map((win) => {
                        const tool = allTools.find(t => t.id === win.toolId);
                        const ToolComponent = tool?.component;

                        // Check if this is a custom tool
                        const isCustomTool = win.toolId.startsWith('custom-');

                        let content;
                        if (isCustomTool) {
                            // Extract the path from the toolId
                            const pathMatch = win.toolId.match(/custom-(.+)-\d+/);
                            if (pathMatch && pathMatch[1]) {
                                const encodedPath = pathMatch[1];
                                const path = decodeURIComponent(encodedPath);
                                content = (
                                    <React.Suspense fallback={<WindowLoading />}>
                                        <Iframe url={path.startsWith('http') ? path : window.location.origin + path} />
                                    </React.Suspense>
                                );
                            }
                        } else if (ToolComponent) {
                            content = (
                                <React.Suspense fallback={<WindowLoading />}>
                                    <ToolComponent />
                                </React.Suspense>
                            );
                        }

                        return (
                            <Window
                                key={win.id}
                                id={win.id}
                                title={win.title}
                                icon={win.icon}
                                isActive={win.isActive}
                                isMinimized={win.isMinimized}
                                isMaximized={win.isMaximized}
                                zIndex={win.zIndex}
                                initialX={win.initX}
                                initialY={win.initY}
                                initialWidth={DEFAULT_WINDOW_WIDTH}
                                initialHeight={DEFAULT_WINDOW_HEIGHT}
                                x={win.x}
                                y={win.y}
                                width={win.width}
                                height={win.height}
                                onClose={closeWindow}
                                onMinimize={minimizeWindow}
                                onMaximize={maximizeWindow}
                                onFocus={focusWindow}
                                onUpdateWindow={updateWindow}
                                content={content}
                            />
                        );
                    })}
                </div>

                <StartMenu
                    visible={isStartOpen}
                    onClose={() => setIsStartOpen(false)}
                    onOpenWindow={openWindow}
                    onAddToDesktop={handleAddToDesktop}
                />

                <Taskbar
                    onAddIcon={handleAddIcon}
                    onToggleStart={(e) => {
                        e.stopPropagation();
                        setIsStartOpen(!isStartOpen);
                    }}
                    isStartOpen={isStartOpen}
                    windows={windows}
                    onWindowClick={toggleMinimize}
                    onClose={closeWindow}
                    onMinimize={minimizeWindow}
                    onMaximize={maximizeWindow}
                    pinnedApps={pinnedApps}
                    onPinApp={handlePinApp}
                    onUnpinApp={handleUnpinApp}
                    onOpenWindow={openWindow}
                />

                <Modal
                    title={editingIcon ? <FormattedMessage id="desktop.editIcon" /> : <FormattedMessage id="desktop.addIcon" />}
                    open={isEditModalOpen}
                    onCancel={() => setIsEditModalOpen(false)}
                    onOk={() => form.submit()}
                    centered
                    className="desktop-modal"
                    width={400}
                >
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Form.Item name="title" label={<FormattedMessage id="common.name" />} rules={[{ required: true }]}>
                            <Input placeholder="Tool name" />
                        </Form.Item>
                        <Form.Item name="path" label={<FormattedMessage id="desktop.path" />} rules={[{ required: true }]}>
                            <Input placeholder="/category/tool-id" />
                        </Form.Item>
                        <Form.Item name="color" label={<FormattedMessage id="desktop.iconColor" />}>
                            <ColorPicker defaultValue={token.colorPrimary} />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </Dropdown>
    );
};

export default Desktop;
