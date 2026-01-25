import React from 'react';
import { Rnd } from 'react-rnd';
import { CloseOutlined, ExpandOutlined, CompressOutlined, MinusOutlined } from '@ant-design/icons';

interface WindowProps {
    id: string;
    title: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
    initialX?: number;
    initialY?: number;
    initialWidth?: number;
    initialHeight?: number;
    isActive: boolean;
    isMinimized: boolean;
    isMaximized: boolean;
    zIndex: number;
    onClose: (id: string) => void;
    onMinimize: (id: string) => void;
    onMaximize: (id: string) => void;
    onFocus: (id: string) => void;
    onUpdateWindow: (id: string, updates: Partial<{ x: number; y: number; width: number; height: number }>) => void;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}

const Window: React.FC<WindowProps> = ({
    id,
    title,
    icon,
    content,
    isActive,
    isMinimized,
    isMaximized,
    zIndex,
    onClose,
    onMinimize,
    onMaximize,
    onFocus,
    onUpdateWindow,
    initialX = 100,
    initialY = 100,
    initialWidth = 600,
    initialHeight = 300,
    x,
    y,
    width,
    height,
}) => {
    const [isClosing, setIsClosing] = React.useState(false);
    const [isDragging, setIsDragging] = React.useState(false);
    const [isResizing, setIsResizing] = React.useState(false);

    const baseStyle = "flex flex-col rounded-xl overflow-hidden backdrop-blur-3xl transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]";
    const activeStyle = isActive
        ? "shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-white/40 ring-1 ring-white/20"
        : "shadow-xl opacity-90 grayscale-[0.2]";

    // Animation states
    const visibleState = "opacity-100 scale-100 translate-y-0";
    const minimizedState = "opacity-0 scale-75 translate-y-20 pointer-events-none";
    const closingState = "opacity-0 scale-90 pointer-events-none";

    const currentStateClass = isClosing
        ? closingState
        : isMinimized
            ? minimizedState
            : visibleState;

    const currentX = x ?? initialX;
    const currentY = y ?? initialY;
    const currentWidth = width ?? initialWidth;
    const currentHeight = height ?? initialHeight;

    const handleClose = (id: string) => {
        setIsClosing(true);
        setTimeout(() => {
            onClose(id);
        }, 300);
    };

    return (
        <Rnd
            position={isMaximized ? { x: 0, y: 0 } : { x: currentX, y: currentY }}
            size={isMaximized ? { width: '100vw', height: '100vh' } : { width: currentWidth, height: currentHeight }}
            minWidth={300}
            minHeight={250}
            dragHandleClassName="window-header"
            disableDragging={isMaximized || isMinimized || isClosing}
            enableResizing={!isMaximized && !isMinimized && !isClosing}
            onDragStart={() => {
                setIsDragging(true);
                onFocus(id);
            }}
            onResizeStart={() => {
                setIsResizing(true);
                onFocus(id);
            }}
            onDragStop={(_e, d) => {
                setIsDragging(false);
                // Manually constrain to ensure at least 40px visible
                let newX = d.x;
                let newY = d.y;
                const minVisibleStart = 40; // minimum amount of window visible from left/top
                const minVisibleEnd = 40;   // minimum amount of window visible from right/bottom

                // Constrain Left
                if (newX + currentWidth < minVisibleStart) {
                    newX = minVisibleStart - currentWidth;
                }

                // Constrain Top
                if (newY < 0) {
                    newY = 0;
                }

                // Constrain Right
                if (newX > window.innerWidth - minVisibleEnd) {
                    newX = window.innerWidth - minVisibleEnd;
                }

                // Constrain Bottom
                if (newY > window.innerHeight - minVisibleEnd) {
                    newY = window.innerHeight - minVisibleEnd;
                }

                onUpdateWindow(id, { x: newX, y: newY });
                onFocus(id);
            }}
            onResizeStop={(_e, _direction, ref, _delta, position) => {
                setIsResizing(false);
                const newWidth = parseInt(ref.style.width);
                const newHeight = parseInt(ref.style.height);

                onUpdateWindow(id, {
                    width: newWidth,
                    height: newHeight,
                    ...position,
                });
                onFocus(id);
            }}
            // Apply transition to Rnd for smooth Maximize/Restore, but disable during drag/resize to avoid lag
            className={`${isDragging || isResizing ? '' : 'transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]'} ${isMinimized || isClosing ? 'pointer-events-none' : ''}`}
            style={{ zIndex }}
            onClick={() => onFocus(id)}
        >
            {/* 
                Inner Container for Visuals & Scale/Opacity Animations 
                Separating visuals from Rnd allows us to scale/fade the content 
                without fighting Rnd's transform-based positioning.
            */}
            <div onContextMenu={(e) => e.stopPropagation()} className={`w-full h-full flex flex-col bg-slate-100/40 dark:bg-slate-900/40 ${baseStyle} ${activeStyle} ${currentStateClass}`}>

                {/* Header */}
                <div
                    onDoubleClick={() => onMaximize(id)}
                    className="window-header h-8 bg-white/50 dark:bg-white/5 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-3 select-none cursor-default shrink-0"
                >
                    <div className="flex items-center gap-2 flex-1 overflow-hidden">
                        {icon && <div className="text-lg opacity-80">{icon}</div>}
                        <span className="text-xs font-semibold truncate opacity-80">{title}</span>
                    </div>

                    <div className="flex items-center gap-1.5 pl-4" onMouseDown={(e) => e.stopPropagation()}>
                        <button
                            className="w-[14px] h-[14px] cursor-pointer rounded-full bg-yellow-500 hover:bg-yellow-400 flex items-center justify-center text-[8px] text-black/50 opacity-80 hover:opacity-100 transition-all group"
                            onClick={() => onMinimize(id)}
                        >
                            <MinusOutlined className="opacity-0 group-hover:opacity-100" />
                        </button>
                        <button
                            className="w-[14px] h-[14px] cursor-pointer rounded-full bg-green-500 hover:bg-green-400 flex items-center justify-center text-[8px] text-black/50 opacity-80 hover:opacity-100 transition-all group"
                            onClick={() => onMaximize(id)}
                        >
                            {isMaximized ? (
                                <CompressOutlined className="opacity-0 group-hover:opacity-100" />
                            ) : (
                                <ExpandOutlined className="opacity-0 group-hover:opacity-100" />
                            )}
                        </button>
                        <button
                            className="w-[14px] h-[14px] cursor-pointer rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center text-[8px] text-black/50 opacity-80 hover:opacity-100 transition-all group"
                            onClick={() => handleClose(id)}
                        >
                            <CloseOutlined className="opacity-0 group-hover:opacity-100" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto bg-white/80 dark:bg-[#0a0f1e]/80 p-2 relative min-h-0 max-h-full">
                    <div className="h-full w-full overflow-auto custom-scrollbar">
                        {content}
                    </div>
                </div>
            </div>
        </Rnd>
    );
};

export default Window;
