
import WindowControls from '@/components/WindowControls';
import {
    BulbFilled,
    BulbOutlined,
    ControlOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { Button, Space, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import ControlCenter from './ControlCenter';

interface StatusBarProps {
    currentTheme: string;
    toggleTheme: () => void;
    toggleStartMenu: (isOpen: boolean) => void;
}

const StatusBar: React.FC<StatusBarProps> = ({ currentTheme, toggleTheme, toggleStartMenu }) => {
    const [time, setTime] = useState(new Date());
    const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <div onContextMenu={(e) => e.stopPropagation()}
                className="select-none w-full h-8 draggable-header flex items-center justify-between z-[9999]
            bg-white/30 dark:bg-black/30 
            backdrop-blur-xl backdrop-saturate-150
            text-slate-800 dark:text-slate-100
            transition-all duration-300"
            >
                {/* Left Section: Menu */}
                <div className="flex items-center gap-4 text-sm font-medium">
                    <WindowControls reverse />
                </div>

                {/* Right Section: Status Icons & Time */}
                <div className="flex items-center gap-4 text-sm">
                    <Space size="small" className="hidden sm:flex opacity-90">
                        <div className="hover:bg-white/20 rounded-full p-1 cursor-default transition-colors">
                            <Tooltip title="Toggle Theme">
                                <Button
                                    type="text"
                                    icon={currentTheme === 'dark' ? <BulbFilled className="text-2xl text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" /> : <BulbOutlined className="text-2xl text-slate-600" />}
                                    onClick={toggleTheme}
                                    className="no-drag hover:rotate-12 transition-all w-12 h-12 rounded-2xl hover:bg-white/20 dark:hover:bg-white/10"
                                />
                            </Tooltip>
                        </div>

                        <div className="no-drag hover:bg-white/20 rounded-full p-1 cursor-pointer transition-colors">
                            <Tooltip title="Search">
                                <Button
                                    type="text"
                                    icon={<SearchOutlined className='text-2xl text-slate-600' />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleStartMenu(true);
                                    }}
                                    className="no-drag hover:rotate-12 transition-all w-12 h-12 rounded-2xl hover:bg-white/20 dark:hover:bg-white/10"
                                />
                            </Tooltip>
                        </div>
                        <div className="no-drag hover:bg-white/20 rounded-full p-1 cursor-pointer transition-colors">
                            <Tooltip title="Control Center">
                                <Button
                                    type="text"
                                    icon={<ControlOutlined className={`text-2xl transition-all ${isControlCenterOpen ? 'text-blue-500 rotate-90' : 'text-slate-600'}`} />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsControlCenterOpen(!isControlCenterOpen);
                                    }}
                                    className={`no-drag hover:rotate-12 transition-all w-12 h-12 rounded-2xl hover:bg-white/20 dark:hover:bg-white/10 ${isControlCenterOpen ? 'bg-white/20' : ''}`}
                                />
                            </Tooltip>
                        </div>
                    </Space>

                    <div className="no-drag flex items-center hover:bg-white/20 rounded px-2 py-0.5 cursor-pointer transition-colors mr-2">
                        <span className="font-medium tracking-wide">
                            {time.toLocaleDateString([], { month: 'short', day: 'numeric' })}  {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
            </div>

            <ControlCenter isOpen={isControlCenterOpen} onClose={() => setIsControlCenterOpen(false)} />
        </>
    );
};

export default StatusBar;
