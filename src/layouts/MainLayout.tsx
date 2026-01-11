import useIsMobile from "@/hooks/useIsMobile";
import ArtificialStupidity from "@/pages/tools/ArtificialStupidity";
import JsonTools from "@/pages/tools/Json";
import MediaTools from "@/pages/tools/Media";
import WebTools from "@/pages/tools/Web";
import { useLocaleStore } from "@/store/useLocaleStore";
import { useThemeStore } from "@/store/useThemeStore";
import { allTools } from "@/utils/toolList";
import {
  AppstoreOutlined,
  BulbFilled,
  BulbOutlined,
  GithubOutlined,
  GlobalOutlined,
  HomeOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PictureOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { AutoComplete, Button, Dropdown, Layout, Menu, Tag, theme } from "antd";
import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Link, useLocation, useNavigate } from "react-router-dom";

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
    label: <FormattedMessage id="nav.artificialStupidity" />,
    children: ArtificialStupidity.map((tool) => ({
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
  const [collapsed, setCollapsed] = useState(isMobile);
  const location = useLocation();
  const navigate = useNavigate();
  const intl = useIntl();
  const { locale, setLocale } = useLocaleStore();
  const { theme: currentTheme, toggleTheme } = useThemeStore();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  const [stateOpenKeys, setStateOpenKeys] = useState([]);

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

  const handleSelect = (_: string, option: any) => {
    navigate(option.path);
  };

  const langItems = [
    { key: "en-US", label: "English", onClick: () => setLocale("en-US") },
    { key: "zh-CN", label: "中文", onClick: () => setLocale("zh-CN") },
  ];

  return (
    <Layout className="h-screen overflow-hidden">
      <Header
        className="flex items-center justify-between w-full !px-4"
        style={{ background: colorBgContainer }}
      >
        <div className="flex items-center gap-2">
          <Link to="/" className="font-bold text-xl !text-green-600 mr-4">
            {collapsed ? "AS" : "Artificial Stupidity"}
          </Link>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="w-10 h-10"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-64 hidden md:flex items-center">
            <AutoComplete
              prefix={<SearchOutlined />}
              options={options}
              showSearch={{
                onSearch: handleSearch,
              }}
              onSelect={handleSelect}
              className="w-full"
              placeholder={intl.formatMessage({
                id: "layout.searchPlaceholder",
              })}
            />
          </div>

          <Button
            icon={currentTheme === "dark" ? <BulbFilled /> : <BulbOutlined />}
            onClick={toggleTheme}
            type="text"
          />

          <Dropdown menu={{ items: langItems }} placement="bottomRight">
            <Button icon={<GlobalOutlined />} type="text">
              {locale === "zh-CN" ? "中文" : "EN"}
            </Button>
          </Dropdown>

          <Button
            icon={<GithubOutlined />}
            type="text"
            href="https://github.com/bbuugg/as"
            target="_blank"
          />
        </div>
      </Header>

      <Layout
        style={{ transition: "all 0.2s", display: "flex", overflow: "hidden" }}
      >
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
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
