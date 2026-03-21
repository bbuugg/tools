import {
    CalendarOutlined,
    WifiOutlined,
    SoundOutlined,
    MoonOutlined,
    SunOutlined,
    ApiOutlined
} from '@ant-design/icons';
import { Calendar, Slider, Typography } from 'antd';
import React from 'react';

const { Text } = Typography;

interface ControlCenterProps {
    isOpen: boolean;
    onClose: () => void;
}

const ControlCenter: React.FC<ControlCenterProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop for closing */}
            <div
                className="fixed inset-0 z-[10001] bg-transparent"
                onClick={onClose}
            />

            {/* Control Center Panel */}
            <div
                className="fixed top-10 right-2 z-[10002] w-80 bg-white/70 shadow-2xl border border-white/20 dark:border-white/10 dark:bg-black/70 backdrop-blur-2xl rounded-2xl animate-fade-in-down max-h-[80vh] overflow-auto no-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 flex flex-col gap-4 text-slate-800 dark:text-slate-100">

                    {/* Top Row: Connectivity */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/50 dark:bg-zinc-800/50 rounded-xl p-3 flex flex-col gap-3 shadow-sm transition-transform hover:scale-[1.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transition-transform active:scale-90 cursor-pointer">
                                    <WifiOutlined />
                                </div>
                                <div className="flex flex-col">
                                    <Text className="text-xs font-bold dark:text-white">Wi-Fi</Text>
                                    <Text className="text-[10px] text-slate-500 dark:text-slate-400">Home-5G</Text>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transition-transform active:scale-90 cursor-pointer">
                                    <ApiOutlined />
                                </div>
                                <div className="flex flex-col">
                                    <Text className="text-xs font-bold dark:text-white">Bluetooth</Text>
                                    <Text className="text-[10px] text-slate-500 dark:text-slate-400">On</Text>
                                </div>
                            </div>
                        </div>

                        {/* Other toggles container */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white/50 dark:bg-zinc-800/50 rounded-xl flex flex-col items-center justify-center gap-2 p-2 hover:bg-white/60 dark:hover:bg-zinc-700/60 transition-all cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-orange-400 text-white flex items-center justify-center text-lg active:bg-orange-500 transition-colors">
                                    <MoonOutlined />
                                </div>
                                <Text className="text-[10px] font-semibold dark:text-white">DND</Text>
                            </div>
                            <div className="bg-white/50 dark:bg-zinc-800/50 rounded-xl flex flex-col items-center justify-center gap-2 p-2 hover:bg-white/60 dark:hover:bg-zinc-700/60 transition-all cursor-pointer">
                                <div className="w-8 h-8 rounded-full bg-slate-400/50 text-slate-800 dark:text-white flex items-center justify-center text-lg active:bg-slate-500/50 transition-colors">
                                    <SunOutlined />
                                </div>
                                <Text className="text-[10px] font-semibold dark:text-white">Keyboard</Text>
                            </div>
                        </div>
                    </div>

                    {/* Sliders */}
                    <div className="bg-white/50 dark:bg-zinc-800/50 rounded-xl p-3 flex flex-col gap-3 shadow-sm">
                        <div className="flex flex-col gap-1">
                            <Text className="text-[10px] font-bold dark:text-white px-1">Display</Text>
                            <div className="flex items-center gap-2 bg-white/40 dark:bg-black/20 rounded-full px-2 py-1">
                                <SunOutlined className="text-slate-500 text-xs" />
                                <Slider defaultValue={80} className="w-full m-0 p-0" tooltip={{ open: false }} />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <Text className="text-[10px] font-bold dark:text-white px-1">Sound</Text>
                            <div className="flex items-center gap-2 bg-white/40 dark:bg-black/20 rounded-full px-2 py-1">
                                <SoundOutlined className="text-slate-500 text-xs" />
                                <Slider defaultValue={45} className="w-full m-0 p-0" tooltip={{ open: false }} />
                            </div>
                        </div>
                    </div>

                    {/* Calendar Widget */}
                    <div className="bg-white/50 dark:bg-zinc-800/50 rounded-xl p-0 overflow-hidden shadow-sm">
                        <div className="p-2 border-b border-black/5 dark:border-white/5 flex items-center gap-2">
                            <CalendarOutlined className="text-red-500" />
                            <Text className="text-xs font-bold dark:text-white">Calendar</Text>
                        </div>
                        <div className="scale-90 origin-top">
                            <Calendar fullscreen={false} />
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default ControlCenter;

