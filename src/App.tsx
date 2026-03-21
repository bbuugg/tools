import { ConfigProvider, theme } from "antd";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import localizedFormat from "dayjs/plugin/localizedFormat";
import weekday from "dayjs/plugin/weekday";
import { StrictMode, useEffect } from "react";
import { IntlProvider } from "react-intl";
import messages from "./i18n";
import AppRouter from "./router";
import { useLocaleStore } from "./store/useLocaleStore";
import { useThemeStore } from "./store/useThemeStore";

dayjs.extend(localizedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);

function App() {
  const { locale } = useLocaleStore();
  const { theme: currentTheme } = useThemeStore();

  dayjs.locale(locale);

  useEffect(() => {
    const root = window.document.documentElement;
    if (currentTheme === "dark") {
      root.classList.add("dark");
      root.style.setProperty("color-scheme", "dark");
    } else {
      root.classList.remove("dark");
      root.style.setProperty("color-scheme", "light");
    }
  }, [currentTheme]);

  return (
    <StrictMode>
      <IntlProvider
        locale={locale}
        messages={(messages as any)[locale] || messages["zh-CN"]}
      >
        <ConfigProvider
          theme={{
            algorithm:
              currentTheme === "dark"
                ? theme.darkAlgorithm
                : theme.defaultAlgorithm,
            token: {
              colorPrimary: "#22c55e",
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
