import DownloadDropdown from "@/components/DownloadDropdown";
import useIsMobile from "@/hooks/useIsMobile";
import AS from "@/pages/tools/AS";
import JsonTools from "@/pages/tools/Json";
import MediaTools from "@/pages/tools/Media";
import WebTools from "@/pages/tools/Web";
import OtherTools from "@/pages/tools/Other";
import { useLocaleStore } from "@/store/useLocaleStore";
import { useThemeStore } from "@/store/useThemeStore";
import { isElectron as isElectronEnv } from "@/utils/env";
import { allTools } from "@/utils/toolList";
import {
  AppstoreOutlined,
  BookOutlined,
  BulbFilled,
  BulbOutlined,
  GithubOutlined,
  GlobalOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PictureOutlined,
  SearchOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  Dropdown,
  Layout,
  Menu,
  type MenuProps,
  Tag,
  theme,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Link, useLocation, useNavigate } from "react-router-dom";
import WindowControls from "../components/WindowControls";

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

interface LevelKeysProps {
  key?: string;
  children?: LevelKeysProps[];
}

const menuItems = [
  {
    key: "/",
    icon: <HomeOutlined />,
    label: (
      <Link to="/">
        <FormattedMessage id="nav.allTools" />
      </Link>
    ),
  },
  {
    key: "artificial-stupidity",
    icon: <AppstoreOutlined />,
    label: <FormattedMessage id="nav.as" />,
    children: AS.map((tool) => ({
      key: tool.path,
      icon: tool.icon,
      label: (
        <Link to={tool.path}>
          <FormattedMessage
            id={`tools.${tool.id}.name`}
            defaultMessage={tool.name}
          />
        </Link>
      ),
    })),
  },
  {
    key: "json",
    icon: <AppstoreOutlined />,
    label: <FormattedMessage id="nav.json" />,
    children: JsonTools.map((tool) => ({
      key: tool.path,
      icon: tool.icon,
      label: (
        <Link to={tool.path}>
          <FormattedMessage
            id={`tools.${tool.id}.name`}
            defaultMessage={tool.name}
          />
        </Link>
      ),
    })),
  },
  {
    key: "web",
    icon: <GlobalOutlined />,
    label: <FormattedMessage id="nav.web" defaultMessage="Web Tools" />,
    children: WebTools.map((tool) => ({
      key: tool.path,
      icon: tool.icon,
      label: (
        <Link to={tool.path}>
          <FormattedMessage
            id={`tools.${tool.id}.name`}
            defaultMessage={tool.name}
          />
        </Link>
      ),
    })),
  },
  {
    key: "media",
    icon: <PictureOutlined />,
    label: <FormattedMessage id="nav.media" defaultMessage="Media Tools" />,
    children: MediaTools.map((tool) => ({
      key: tool.path,
      icon: tool.icon,
      label: (
        <Link to={tool.path}>
          <FormattedMessage
            id={`tools.${tool.id}.name`}
            defaultMessage={tool.name}
          />
        </Link>
      ),
    })),
  },
  {
    key: "other",
    icon: <PictureOutlined />,
    label: <FormattedMessage id="nav.other" defaultMessage="Other Tools" />,
    children: OtherTools.map((tool) => ({
      key: tool.path,
      icon: tool.icon,
      label: (
        <Link to={tool.path}>
          <FormattedMessage
            id={`tools.${tool.id}.name`}
            defaultMessage={tool.name}
          />
        </Link>
      ),
    })),
  },
];

const getLevelKeys = (items1: LevelKeysProps[]) => {
  const key: Record<string, number> = {};
  const func = (items2: LevelKeysProps[], level = 1) => {
    items2.forEach((item) => {
      if (item.key) {
        key[item.key] = level;
      }
      if (item.children) {
        func(item.children, level + 1);
      }
    });
  };
  func(items1);
  return key;
};

const levelKeys = getLevelKeys(menuItems as LevelKeysProps[]);

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const contentRef = useRef<HTMLDivElement>(null);

  // Check if we're running in Electron environment
  // const isElectron = typeof window !== 'undefined' &&
  //   (typeof (window as unknown as { process?: { type?: string } }).process?.type !== 'undefined' ||
  const isElectron = isElectronEnv();

  // If in Electron, don't collapse the sidebar
  const [collapsed, setCollapsed] = useState(isMobile && !isElectron);
  const location = useLocation();
  const navigate = useNavigate();
  const intl = useIntl();
  const { locale, setLocale } = useLocaleStore();
  const { theme: currentTheme, toggleTheme } = useThemeStore();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [stateOpenKeys, setStateOpenKeys] = useState<string[]>([]);

  // Scroll to top on route change
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    } else {
      // Fallback to window scroll if content ref is not available
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);

  const onOpenChange: MenuProps["onOpenChange"] = (openKeys) => {
    const currentOpenKey = openKeys.find((key) => !stateOpenKeys.includes(key));
    // open
    if (currentOpenKey !== undefined) {
      const repeatIndex = openKeys
        .filter((key) => key !== currentOpenKey)
        .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);

      setStateOpenKeys(
        openKeys
          // remove repeat key
          .filter((_, index) => index !== repeatIndex)
          // remove current level all child
          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey])
      );
    } else {
      // close
      setStateOpenKeys(openKeys);
    }
  };

  const [options, setOptions] = useState<
    { value: string; label: React.ReactNode; path: string }[]
  >([]);

  const handleSearch = (value: string) => {
    if (!value) {
      setOptions([]);
      return;
    }

    const filtered = allTools
      .map((tool) => {
        const translatedName = intl.formatMessage({
          id: `tools.${tool.id}.name`,
          defaultMessage: tool.name,
        });
        const translatedDesc = intl.formatMessage({
          id: `tools.${tool.id}.description`,
          defaultMessage: tool.description,
        });
        return { ...tool, translatedName, translatedDesc };
      })
      .filter(
        (tool) =>
          tool.translatedName.toLowerCase().includes(value.toLowerCase()) ||
          tool.translatedDesc.toLowerCase().includes(value.toLowerCase())
      )
      .map((tool) => ({
        value: tool.translatedName,
        path: tool.path,
        label: (
          <div className="flex items-center justify-between py-1">
            <div className="flex flex-col">
              <span className="font-medium">{tool.translatedName}</span>
              <span className="text-[10px] text-slate-400 line-clamp-1">
                {tool.translatedDesc}
              </span>
            </div>
            <Tag className="ml-2 text-[10px] scale-90 origin-right">
              <FormattedMessage
                id={`common.category.${tool.category}`}
                defaultMessage={tool.category}
              />
            </Tag>
          </div>
        ),
      }));
    setOptions(filtered);
  };

  const handleSelect = (_: string, option: { path: string }) => {
    navigate(option.path);
  };

  const langItems = [
    { key: "en-US", label: "English", onClick: () => setLocale("en-US") },
    { key: "zh-CN", label: "中文", onClick: () => setLocale("zh-CN") },
  ];

  return (
    <Layout className="h-screen overflow-hidden">
      <Header
        className="flex items-center justify-between w-full !px-4 draggable-header"
        style={{ background: colorBgContainer }}
      >
        <div className="flex items-center gap-2">
          <Link to="/" className="font-bold text-xl !text-green-600 mr-4">
            {isElectron || (!isElectron && !collapsed) ? "As Tools" : "Tools"}
          </Link>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => {
              // If in Electron, don't allow collapsing
              if (!isElectron) {
                setCollapsed(!collapsed);
              }
            }}
            className="w-10 h-10 no-drag"
            hidden={isElectron}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-48 hidden md:flex items-center auto-complete-container">
            <AutoComplete
              prefix={<SearchOutlined />}
              options={options}
              showSearch={{
                onSearch: handleSearch,
              }}
              onSelect={handleSelect}
              className="w-full no-drag"
              popupMatchSelectWidth={false}
              style={{ height: 32 }}
              placeholder={intl.formatMessage({
                id: "layout.searchPlaceholder",
              })}
            />
          </div>

          <Button
            icon={<BookOutlined />}
            type="text"
            onClick={() =>
              navigate(
                "/iframe?url=" + encodeURIComponent("https://www.codeemo.cn")
              )
            }
            className="no-drag"
          >
            <FormattedMessage id="nav.blog" defaultMessage={"博客"} />
          </Button>
          <Button
            icon={<VideoCameraOutlined />}
            type="text"
            onClick={() =>
              navigate(
                "/iframe?url=" + encodeURIComponent("https://live.codeemo.cn")
              )
            }
            className="no-drag"
          >
            Digo
          </Button>
          <DownloadDropdown />
          <Button
            icon={<GithubOutlined />}
            type="text"
            href="https://github.com/bbuugg/tools"
            target="_blank"
            className="no-drag"
          />
          <Button
            icon={currentTheme === "dark" ? <BulbFilled /> : <BulbOutlined />}
            onClick={toggleTheme}
            type="text"
            className="no-drag"
          />

          <Dropdown menu={{ items: langItems }} placement="bottomRight">
            <Button icon={<GlobalOutlined />} type="text" className="no-drag">
              {locale === "zh-CN" ? "中文" : "English"}
            </Button>
          </Dropdown>
          <WindowControls />
        </div>
      </Header>

      <Layout
        style={{ transition: "all 0.2s", display: "flex", overflow: "hidden" }}
      >
        <Sider
          trigger={null}
          collapsible={!isElectron}
          collapsed={isElectron ? false : collapsed}
          collapsedWidth={isMobile ? 50 : 80}
          className="overflow-y-auto no-scrollbar"
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            openKeys={stateOpenKeys}
            onOpenChange={onOpenChange}
            items={menuItems}
            style={{ minHeight: "100%" }}
          />
        </Sider>
        <Content
          ref={contentRef}
          style={{
            overflowY: "auto",
            borderRadius: borderRadiusLG,
            padding: "24px",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
