import { Space, Button, Tooltip, Dropdown, type MenuProps } from 'antd';
import {
    DashboardOutlined,
    PlusOutlined,
    AppstoreOutlined,
    CloseOutlined,
    ExpandOutlined,
    CompressOutlined,
    MinusOutlined,
    BorderOutlined,
    PushpinOutlined,
    PushpinFilled
} from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { allTools } from '@/utils/toolList';

interface WindowState {
    id: string;
    toolId: string;
    title: string;
    icon?: React.ReactNode;
    isMinimized: boolean;
    isMaximized: boolean;
    isActive: boolean;
}

interface TaskbarProps {
    onAddIcon: () => void;
    onToggleStart: (e: React.MouseEvent) => void;
    isStartOpen: boolean;
    windows: WindowState[];
    onWindowClick: (id: string) => void;
    onClose: (id: string) => void;
    onMinimize: (id: string) => void;
    onMaximize: (id: string) => void;
    pinnedApps: string[]; // Array of toolIds
    onPinApp: (toolId: string) => void;
    onUnpinApp: (toolId: string) => void;
    onOpenWindow: (toolId: string) => void;
}

const Taskbar: React.FC<TaskbarProps> = ({
    onAddIcon,
    onToggleStart,
    isStartOpen,
    windows = [],
    onWindowClick,
    onClose,
    onMinimize,
    onMaximize,
    pinnedApps = [],
    onPinApp,
    onUnpinApp,
    onOpenWindow
}) => {
    const intl = useIntl();

    const getContextMenuItems = (win: WindowState): MenuProps['items'] => {
        const items: MenuProps['items'] = [];
        const isPinned = pinnedApps.includes(win.toolId);

        // Restore / Minimize
        if (win.isMinimized) {
            items.push({
                key: 'restore',
                label: <FormattedMessage id="common.restore" defaultMessage="Restore" />,
                icon: <BorderOutlined />,
                onClick: () => onWindowClick(win.id)
            });
        } else {
            items.push({
                key: 'minimize',
                label: <FormattedMessage id="common.minimize" defaultMessage="Minimize" />,
                icon: <MinusOutlined />,
                onClick: () => onMinimize(win.id)
            });
        }

        // Maximize / Restore Down
        if (!win.isMinimized) {
            items.push({
                key: 'maximize',
                label: win.isMaximized ? <FormattedMessage id="common.restore" defaultMessage="Restore" /> : <FormattedMessage id="common.maximize" defaultMessage="Maximize" />,
                icon: win.isMaximized ? <CompressOutlined /> : <ExpandOutlined />,
                onClick: () => onMaximize(win.id)
            });
        }

        items.push({ type: 'divider' });

        // Pin / Unpin
        items.push({
            key: 'pin',
            label: isPinned ? <FormattedMessage id="taskbar.unpinFromDock" defaultMessage="Unpin from Dock" /> : <FormattedMessage id="taskbar.pinToDock" defaultMessage="Pin to Dock" />,
            icon: isPinned ? <PushpinFilled /> : <PushpinOutlined />,
            onClick: () => isPinned ? onUnpinApp(win.toolId) : onPinApp(win.toolId)
        });

        items.push({ type: 'divider' });

        items.push({
            key: 'close',
            label: <FormattedMessage id="common.close" defaultMessage="Close" />,
            icon: <CloseOutlined />,
            danger: true,
            onClick: () => onClose(win.id)
        });

        return items;
    };

    const getPinnedAppMenuItems = (toolId: string): MenuProps['items'] => {
        return [
            {
                key: 'unpin',
                label: <FormattedMessage id="taskbar.unpinFromDock" defaultMessage="Unpin from Dock" />,
                icon: <PushpinFilled />,
                onClick: () => onUnpinApp(toolId)
            }
        ];
    };

    return (
        <div
            onContextMenu={(e) => e.stopPropagation()}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-auto min-w-[500px] max-w-[90vw] h-16 
            bg-white/10 dark:bg-black/20 
            backdrop-blur-3xl backdrop-saturate-150 
            rounded-[32px] 
            border border-white/20 dark:border-white/10 
            shadow-[0_30px_60px_-12px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.2)] 
            flex items-center justify-between px-6 z-[9999] 
            transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.01]"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center gap-2">
                <Tooltip title={isStartOpen ? "Close Start" : "Start"}>
                    <Button
                        type="text"
                        icon={<DashboardOutlined className={`text-2xl transition-all duration-500 ${isStartOpen ? 'scale-110 rotate-90 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'text-slate-600 dark:text-slate-200'}`} />}
                        onClick={onToggleStart}
                        className="hover:scale-110 transition-all active:scale-95 w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white/20 dark:hover:bg-white/10"
                    />
                </Tooltip>

                <div className="w-[1px] h-10 bg-gradient-to-b from-transparent via-black/10 dark:via-white/20 to-transparent mx-2" />

                {/* Pinned Apps and Open Windows List */}
                <div className="flex items-center gap-2 overflow-x-auto max-w-[40vw] custom-scrollbar pb-1">
                    {/* Pinned Apps */}
                    {pinnedApps.map((toolId) => {
                        const openWindow = windows.find(w => w.toolId === toolId);
                        if (openWindow) return null; // Don't show pinned app if it's already open

                        return (
                            <Dropdown key={`pinned-${toolId}`} menu={{ items: getPinnedAppMenuItems(toolId) }} trigger={['contextMenu']} placement="top" overlayStyle={{ zIndex: 20000 }}>
                                <div className="flex">
                                    <Tooltip title={toolId}>
                                        <div
                                            onClick={() => onOpenWindow(toolId)}
                                            className="relative group cursor-pointer transition-all duration-500 ease-out w-12 h-12 flex items-center justify-center rounded-2xl hover:bg-white/20 dark:hover:bg-white/10"
                                        >
                                            <div className="text-2xl transition-transform duration-500 group-hover:scale-110">
                                                <AppstoreOutlined />
                                            </div>
                                            {/* Small pin indicator */}
                                            <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-slate-400/60" />
                                        </div>
                                    </Tooltip>
                                </div>
                            </Dropdown>
                        );
                    })}

                    {/* Open Windows */}
                    {windows.map((win) => (
                        <Dropdown key={win.id} menu={{ items: getContextMenuItems(win) }} trigger={['contextMenu']} placement="top" overlayStyle={{ zIndex: 20000 }}>
                            <div className="flex">
                                <Tooltip title={win.title}>
                                    <div
                                        onClick={() => onWindowClick(win.id)}
                                        className={`
                                            relative group cursor-pointer transition-all duration-500 ease-out
                                            w-12 h-12 flex items-center justify-center rounded-2xl
                                            ${win.isActive && !win.isMinimized
                                                ? 'bg-gradient-to-b from-white/40 to-white/10 dark:from-white/20 dark:to-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]'
                                                : 'hover:bg-white/20 dark:hover:bg-white/10'}
                                            ${win.isMinimized ? 'opacity-50 grayscale' : 'opacity-100'}
                                        `}
                                    >
                                        <div className={`text-2xl transition-transform duration-500 ${win.isActive && !win.isMinimized ? 'scale-110 drop-shadow-md' : 'group-hover:scale-110'}`}>
                                            {win.icon || <AppstoreOutlined />}
                                        </div>
                                        {win.isActive && !win.isMinimized && (
                                            <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-blue-500/80 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                        )}
                                    </div>
                                </Tooltip>
                            </div>
                        </Dropdown>
                    ))}
                </div>
            </div>

            <Space size="middle">
                <div className="w-[1px] h-10 bg-gradient-to-b from-transparent via-black/10 dark:via-white/20 to-transparent hidden md:block" />
                <div className="hidden md:block">
                    <Tooltip title={<FormattedMessage id="common.add" />}>
                        <Button
                            type="text"
                            icon={<PlusOutlined className="text-2xl" />}
                            onClick={onAddIcon}
                            className="hover:scale-110 transition-all text-slate-600 dark:text-slate-300 hover:text-blue-500 w-12 h-12 rounded-2xl hover:bg-white/20 dark:hover:bg-white/10"
                        />
                    </Tooltip>
                </div>
            </Space>
        </div>
    );
};

export default Taskbar;
