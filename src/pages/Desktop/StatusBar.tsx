
import WindowControls from '@/components/WindowControls';
import {
    BulbFilled,
    BulbOutlined,
    ControlOutlined,
    SearchOutlined,
    GlobalOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { Button, Space, Tooltip, Dropdown, type MenuProps, Drawer, Divider } from 'antd';
import React, { useEffect, useState } from 'react';
import { useLocaleStore } from '@/store/useLocaleStore';
import ControlCenter from './ControlCenter';

interface StatusBarProps {
    currentTheme: string;
    toggleTheme: () => void;
    toggleStartMenu: (isOpen: boolean) => void;
}

const StatusBar: React.FC<StatusBarProps> = ({ currentTheme, toggleTheme, toggleStartMenu }) => {
    const [time, setTime] = useState(new Date());
    const [isControlCenterOpen, setIsControlCenterOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const { setLocale } = useLocaleStore();
    
    const langItems: MenuProps['items'] = [
        { 
            key: 'en-US', 
            label: 'English', 
            onClick: () => setLocale('en-US') 
        },
        { 
            key: 'zh-CN', 
            label: '中文', 
            onClick: () => setLocale('zh-CN') 
        },
    ];

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
                            <Tooltip title="Language">
                                <Dropdown menu={{ items: langItems }} placement="top">
                                    <Button
                                        type="text"
                                        icon={<GlobalOutlined className="text-2xl text-slate-600" />}
                                        className="no-drag hover:rotate-12 transition-all w-12 h-12 rounded-2xl hover:bg-white/20 dark:hover:bg-white/10"
                                    />
                                </Dropdown>
                            </Tooltip>
                        </div>
                        <div className="no-drag hover:bg-white/20 rounded-full p-1 cursor-pointer transition-colors">
                            <Tooltip title="Settings">
                                <Button
                                    type="text"
                                    icon={<SettingOutlined className="text-2xl text-slate-600" />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsSettingsOpen(true);
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
            
            <Drawer
                title="Desktop Settings"
                placement="right"
                closable={true}
                onClose={() => setIsSettingsOpen(false)}
                open={isSettingsOpen}
                width={320}
            >
                <div className="space-y-4">
                    <div>
                        <h3 className="font-medium mb-2">Wallpaper</h3>
                        <div className="flex space-x-2">
                            <Button 
                                size="small" 
                                type={currentTheme === 'dark' ? "primary" : "default"}
                                onClick={() => {
                                    if (currentTheme !== 'dark') toggleTheme();
                                }}
                            >
                                Dark
                            </Button>
                            <Button 
                                size="small" 
                                type={currentTheme === 'light' ? "primary" : "default"}
                                onClick={() => {
                                    if (currentTheme !== 'light') toggleTheme();
                                }}
                            >
                                Light
                            </Button>
                        </div>
                    </div>
                    
                    <Divider />
                    
                    <div>
                        <h3 className="font-medium mb-2">Background Image</h3>
                        <div className="flex flex-col space-y-2">
                            <Button 
                                size="small" 
                                onClick={() => {
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
                                                localStorage.setItem('as-desktop-background-image', result);
                                                // Trigger a custom event to notify the desktop to update background
                                                window.dispatchEvent(new CustomEvent('backgroundChanged', { detail: result }));
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    };
                                    input.click();
                                }}
                            >
                                Upload Image
                            </Button>
                            <Button 
                                size="small" 
                                onClick={() => {
                                    localStorage.removeItem('as-desktop-background-image');
                                    window.dispatchEvent(new CustomEvent('backgroundChanged', { detail: null }));
                                }}
                            >
                                Reset Background
                            </Button>
                        </div>
                    </div>
                    
                    <Divider />
                    
                    <div>
                        <h3 className="font-medium mb-2">Auto Arrange Icons</h3>
                        <Button 
                            size="small" 
                            onClick={() => {
                                window.dispatchEvent(new CustomEvent('autoArrangeIcons'));
                            }}
                        >
                            Arrange Now
                        </Button>
                    </div>
                </div>
            </Drawer>
        </>
    );
};

export default StatusBar;
