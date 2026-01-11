import { ConfigProvider, theme } from 'antd';
import { StrictMode } from 'react';
import { IntlProvider } from 'react-intl';
import messages from "./i18n";
import AppRouter from './router';
import { useLocaleStore } from './store/useLocaleStore';
import { useThemeStore } from './store/useThemeStore';

import { useEffect } from 'react';

function App() {
    const { locale } = useLocaleStore();
    const { theme: currentTheme } = useThemeStore();

    useEffect(() => {
        const root = window.document.documentElement;
        if (currentTheme === 'dark') {
            root.classList.add('dark');
            root.style.setProperty('color-scheme', 'dark');
        } else {
            root.classList.remove('dark');
            root.style.setProperty('color-scheme', 'light');
        }
    }, [currentTheme]);

    return (
        <StrictMode>
            <IntlProvider
                locale={locale}
                messages={(messages as any)[locale] || messages['zh-CN']}>
                <ConfigProvider
                    theme={{
                        algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
                        token: {
                            colorPrimary: '#22c55e',
                            borderRadius: 8,
                        },
                    }}
                >
                    <AppRouter />
                </ConfigProvider>
            </IntlProvider>
        </StrictMode>
    );
}

export default App;