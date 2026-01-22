import React, { useState } from 'react';
import { Input, Typography, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { allTools } from '@/utils/toolList';

const { Text } = Typography;

interface StartMenuProps {
    visible: boolean;
    onClose: () => void;
    onOpenWindow: (toolId: string) => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ visible, onClose, onOpenWindow }) => {
    const intl = useIntl();
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [showGrid, setShowGrid] = useState(false);

    React.useEffect(() => {
        if (visible) {
            // Sequence: Open -> Wait -> Show Search -> Wait -> Show Grid
            const t1 = setTimeout(() => setShowSearch(true), 100);
            const t2 = setTimeout(() => setShowGrid(true), 300);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        } else {
            setShowSearch(false);
            setShowGrid(false);
        }
    }, [visible]);

    if (!visible) return null;

    const filteredTools = allTools.filter(tool => {
        const translatedName = intl.formatMessage({ id: `tools.${tool.id}.name`, defaultMessage: tool.name });
        const translatedDesc = intl.formatMessage({ id: `tools.${tool.id}.description`, defaultMessage: tool.description });
        const searchLower = searchTerm.toLowerCase();
        return translatedName.toLowerCase().includes(searchLower) ||
            translatedDesc.toLowerCase().includes(searchLower) ||
            tool.category.toLowerCase().includes(searchLower);
    });

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/10 backdrop-blur-sm transition-all duration-500"
            onClick={onClose}
        >
            <div
                className={`
                    relative w-[720px] h-[70vh] flex flex-col items-center
                    bg-white/20 dark:bg-black/30 
                    backdrop-blur-3xl backdrop-saturate-200
                    rounded-[40px] 
                    border border-white/20 dark:border-white/10
                    shadow-[0_40px_100px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.3)]
                    overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                    p-4
                    ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}
                `}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Search Section */}
                <div className={`w-full transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] transform ${showSearch ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <Input
                        autoFocus
                        size="large"
                        prefix={<SearchOutlined className="text-lg opacity-50 mr-2" />}
                        placeholder={intl.formatMessage({ id: "home.searchPlaceholder", defaultMessage: "Search" })}
                        className="rounded-full h-12 text-base text-center placeholder:text-center focus:placeholder:opacity-0 transition-all font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        allowClear
                        onKeyUp={(e) => {
                            if (e.key === 'Escape') {
                                if (searchTerm) {
                                    setSearchTerm('');
                                } else {
                                    onClose();
                                }
                            }
                        }}
                        variant="borderless"
                    />
                </div>

                {/* Grid Content */}
                <div className={`w-full mt-8 flex-1 overflow-y-auto custom-scrollbar p-2 transition-all duration-700 delay-100 ease-[cubic-bezier(0.2,0.8,0.2,1)] transform ${showGrid ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                    {filteredTools.length > 0 ? (
                        <div className="grid grid-cols-6 gap-2">
                            {filteredTools.map((tool) => (
                                <div
                                    key={tool.id}
                                    className="aspect-square flex flex-col items-center justify-center gap-2 p-1 rounded-2xl hover:bg-white/20 dark:hover:bg-white/5 hover:backdrop-blur-md cursor-pointer transition-all duration-300 group hover:scale-105 active:scale-95 border border-transparent hover:border-white/10 hover:shadow-lg"
                                    onClick={() => {
                                        onOpenWindow(tool.id);
                                        onClose();
                                    }}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/80 to-white/20 dark:from-white/10 dark:to-white/5 flex items-center justify-center text-2xl shadow-md ring-1 ring-white/20 group-hover:ring-white/40 transition-all">
                                        {tool.icon}
                                    </div>
                                    <Text className="text-[10px] font-medium text-center leading-tight opacity-70 group-hover:opacity-100 line-clamp-1 w-full px-1">
                                        <FormattedMessage id={`tools.${tool.id}.name`} defaultMessage={tool.name} />
                                    </Text>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center opacity-30">
                            <Empty description={false} />
                            <Text className="mt-4">No tools found</Text>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className={`mt-6 flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity duration-500 delay-200 ${showGrid ? 'opacity-40' : 'opacity-0'}`}>
                    <Text className="text-[10px] font-mono tracking-widest uppercase">
                        AS Tools • v1.0
                    </Text>
                </div>

                <style>{`
                    .custom-scrollbar::-webkit-scrollbar {
                        width: 0px;
                        background: transparent;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default StartMenu;
