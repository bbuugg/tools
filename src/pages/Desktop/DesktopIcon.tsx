import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import { Dropdown, Typography } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { FormattedMessage } from 'react-intl';
import { type DesktopIconData } from './types';

const { Text } = Typography;

interface DesktopIconProps {
    icon: DesktopIconData;
    onStop: (id: string, _: any, data: { x: number, y: number }) => void;
    onClick: (path: string) => void;
    onEdit: (icon: DesktopIconData) => void;
    onDelete: (id: string) => void;
    getIconComponent: (toolId: string) => React.ReactNode;
}

const DesktopIcon: React.FC<DesktopIconProps> = ({
    icon,
    onStop,
    onClick,
    onEdit,
    onDelete,
    getIconComponent
}) => {
    const nodeRef = useRef(null);
    const isDragging = useRef(false);

    return (
        <Draggable
            nodeRef={nodeRef}
            defaultPosition={{ x: icon.x, y: icon.y }}
            onStart={() => {
                isDragging.current = false;
            }}
            onDrag={() => {
                isDragging.current = true;
            }}
            onStop={(e, data) => {
                onStop(icon.id, e, data);
                setTimeout(() => {
                    isDragging.current = false;
                }, 100);
            }}
            bounds="parent"
        >
            <div ref={nodeRef} className="absolute z-10 group bg-transparent select-none" onContextMenu={(e) => e.stopPropagation()}>
                <Dropdown
                    trigger={['contextMenu']}
                    menu={{
                        items: [
                            {
                                key: 'open',
                                label: <FormattedMessage id="common.open" defaultMessage="Open" />,
                                onClick: () => onClick(icon.path)
                            },
                            { type: 'divider' },
                            {
                                key: 'edit',
                                label: <FormattedMessage id="common.edit" />,
                                icon: <EditOutlined />,
                                onClick: () => onEdit(icon)
                            },
                            {
                                key: 'delete',
                                label: <FormattedMessage id="common.delete" />,
                                icon: <DeleteOutlined />,
                                danger: true,
                                onClick: () => onDelete(icon.id)
                            },
                        ]
                    }}
                >
                    <div className="flex flex-col items-center w-22 p-2 rounded-xl transition-all hover:bg-white/30 dark:hover:bg-white/5 hover:shadow-xl cursor-pointer backdrop-blur-sm border border-transparent hover:border-white/20 group">
                        <div
                            className="text-3xl mb-2 flex items-center justify-center w-16 h-16 rounded-2xl bg-white/60 dark:bg-slate-800/60 shadow-lg border border-white/20 dark:border-white/5 transform group-hover:scale-105 transition-all group-active:scale-95"
                            onDoubleClick={() => {
                                onClick(icon.path);
                            }}
                            style={{ color: icon.color || '#22c55e' }}
                        >
                            {getIconComponent(icon.id)}
                        </div>
                        <Text className="text-center text-[11px] font-semibold truncate w-full px-1 drop-shadow-md" strong>
                            <FormattedMessage id={`tools.${icon.id}.name`} defaultMessage={icon.title} />
                        </Text>
                    </div>
                </Dropdown>
            </div>
        </Draggable>
    );
};

export default DesktopIcon;
