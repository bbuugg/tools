import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { FormattedMessage, useIntl } from "react-intl";
import {
  AppstoreOutlined,
  BookOutlined,
  BulbFilled,
  BulbOutlined,
  GithubOutlined,
  GlobalOutlined,
  HomeOutlined,
  MenuOutlined,
  PictureOutlined,
  SearchOutlined,
  StarOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import {
  AutoComplete,
  Button,
  ConfigProvider,
  Drawer,
  Dropdown,
  Input,
  Menu,
  Tag,
} from "antd";
import type { MenuProps } from "antd";

import { useLocaleStore } from "@/store/useLocaleStore";
import { useThemeStore } from "@/store/useThemeStore";
import { allTools } from "@/utils/toolList";
import JsonTools from "@/pages/tools/Json";
import MediaTools from "@/pages/tools/Media";
import WebTools from "@/pages/tools/Web";
import OtherTools from "@/pages/tools/Other";
import WindowControls from "@/components/WindowControls";

type AntMenuItem = Required<MenuProps>["items"][number];

const menuItems: AntMenuItem[] = [
  {
    key: "/",
    icon: <HomeOutlined className="text-base" />,
    label: <FormattedMessage id="nav.allTools" />,
  },
  {
    key: "json",
    icon: <AppstoreOutlined className="text-base" />,
    label: <FormattedMessage id="nav.json" />,
    children: JsonTools.map((tool) => ({
      key: tool.path,
      icon: tool.icon,
      label: (
        <FormattedMessage
          id={`tools.${tool.id}.name`}
          defaultMessage={tool.name}
        />
      ),
    })),
  },
  {
    key: "web",
    icon: <GlobalOutlined className="text-base" />,
    label: <FormattedMessage id="nav.web" defaultMessage="Web Tools" />,
    children: WebTools.map((tool) => ({
      key: tool.path,
      icon: tool.icon,
      label: (
        <FormattedMessage
          id={`tools.${tool.id}.name`}
          defaultMessage={tool.name}
        />
      ),
    })),
  },
  {
    key: "media",
    icon: <PictureOutlined className="text-base" />,
    label: <FormattedMessage id="nav.media" defaultMessage="Media Tools" />,
    children: MediaTools.map((tool) => ({
      key: tool.path,
      icon: tool.icon,
      label: (
        <FormattedMessage
          id={`tools.${tool.id}.name`}
          defaultMessage={tool.name}
        />
      ),
    })),
  },
  {
    key: "other",
    icon: <PictureOutlined className="text-base" />,
    label: <FormattedMessage id="nav.other" defaultMessage="Other Tools" />,
    children: OtherTools.map((tool) => ({
      key: tool.path,
      icon: tool.icon,
      label: (
        <FormattedMessage
          id={`tools.${tool.id}.name`}
          defaultMessage={tool.name}
        />
      ),
    })),
  },
];


type SidebarContentProps = {
  onNavigate?: () => void;
};

function SidebarContent({ onNavigate }: SidebarContentProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // 根据当前路径计算默认展开的分组
  const defaultOpenKeys = menuItems
    .filter((item): item is NonNullable<typeof item> & { key: string; children: { key: string }[] } =>
      item != null && "children" in item && Array.isArray((item as any).children) &&
      (item as any).children.some((c: any) => location.pathname.startsWith(c.key))
    )
    .map((item) => item.key as string);

  const [openKeys, setOpenKeys] = useState<string[]>(defaultOpenKeys);

  const selectedKey = location.pathname;

  return (
    <div className="flex h-full flex-col gap-5 p-4 overflow-hidden">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 pt-1">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(16,185,129,0.22)]">
          <StarOutlined style={{ fontSize: 18 }} />
        </span>
        <div>
          <p className="text-sm font-semibold tracking-tight">As Tools</p>
          <p className="text-xs text-muted-foreground">开发者工具集</p>
        </div>
      </div>

      {/* 菜单导航 */}
      <div className="flex-1 min-h-0 overflow-y-auto -mx-4">
        <ConfigProvider
          theme={{
            components: {
              Menu: {
                itemBorderRadius: 12,
                itemMarginInline: 8,
                itemPaddingInline: 12,
                itemHeight: 40,
                subMenuItemBorderRadius: 12,
                collapsedIconSize: 16,
              },
            },
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            onClick={({ key }) => {
              navigate(key);
              onNavigate?.();
            }}
            items={menuItems}
            className="!border-none !bg-transparent"
            style={{ padding: "0 0 8px" }}
          />
        </ConfigProvider>
      </div>
    </div>
  );
}

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const intl = useIntl();

  const { locale, setLocale } = useLocaleStore();
  const { theme: currentTheme, toggleTheme } = useThemeStore();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const currentTool = allTools.find((tool) => tool.path === location.pathname);

  const pageTitle = currentTool
    ? intl.formatMessage({
        id: `tools.${currentTool.id}.name`,
        defaultMessage: currentTool.name,
      })
    : "As Tools";

  const pageDescription = currentTool
    ? intl.formatMessage({
        id: `tools.${currentTool.id}.description`,
        defaultMessage: currentTool.description,
      })
    : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const searchOptions = searchValue
    ? allTools
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
            tool.translatedName
              .toLowerCase()
              .includes(searchValue.toLowerCase()) ||
            tool.translatedDesc
              .toLowerCase()
              .includes(searchValue.toLowerCase())
        )
        .map((tool) => ({
          value: tool.path,
          label: (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm">{tool.translatedName}</div>
                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {tool.translatedDesc}
                </div>
              </div>
              <Tag className="shrink-0 ml-2">
                <FormattedMessage
                  id={`common.category.${tool.category}`}
                  defaultMessage={tool.category}
                />
              </Tag>
            </div>
          ),
        }))
    : [];

  const langMenuItems: MenuProps["items"] = [
    { key: "en-US", label: "English", onClick: () => setLocale("en-US") },
    { key: "zh-CN", label: "中文", onClick: () => setLocale("zh-CN") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-[1920px] xl:grid-cols-[270px_minmax(0,1fr)]">
        {/* 桌面端侧边栏 */}
        <aside className="hidden bg-muted/35 xl:sticky xl:top-0 xl:flex xl:h-screen xl:flex-col">
          <SidebarContent />
        </aside>

        {/* 主内容区域 */}
        <div className="min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-background/80 shadow-[0_1px_0_rgba(15,23,42,0.05)] backdrop-blur-xl draggable-header">
            <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 md:px-6">
              {/* 左侧：移动端菜单 + 标题 */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="shrink-0 xl:hidden">
                  <Button
                    type="text"
                    icon={<MenuOutlined />}
                    onClick={() => setIsMobileSidebarOpen(true)}
                    className="no-drag"
                    aria-label="打开菜单"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {currentTool ? "Tool" : "Workspace"}
                  </p>
                  <h1 className="mt-1 truncate text-lg font-semibold tracking-tight">
                    {pageTitle}
                  </h1>
                  {pageDescription && (
                    <p className="mt-1 hidden truncate text-sm text-muted-foreground lg:block">
                      {pageDescription}
                    </p>
                  )}
                </div>
              </div>

              {/* 右侧：操作按钞 */}
              <div className="flex items-center gap-2 md:gap-3">
                {/* 搜索框 */}
                <div className="w-48 hidden md:block">
                  <AutoComplete
                    options={searchOptions}
                    value={searchValue}
                    onChange={setSearchValue}
                    onSelect={(value) => {
                      navigate(value);
                      setSearchValue("");
                    }}
                    style={{ width: "100%" }}
                    popupMatchSelectWidth={320}
                  >
                    <Input
                      prefix={<SearchOutlined className="text-muted-foreground" />}
                      placeholder={intl.formatMessage({
                        id: "layout.searchPlaceholder",
                        defaultMessage: "搜索工具...",
                      })}
                      className="no-drag rounded-xl"
                    />
                  </AutoComplete>
                </div>

                {/* 博客按钞 */}
                <Button
                  type="text"
                  icon={<BookOutlined />}
                  onClick={() =>
                    navigate(
                      "/iframe?url=" +
                        encodeURIComponent("https://www.codeemo.cn")
                    )
                  }
                  className="no-drag hidden sm:inline-flex"
                >
                  <FormattedMessage id="nav.blog" defaultMessage="博客" />
                </Button>

                {/* Digo 按钞 */}
                <Button
                  type="text"
                  icon={<VideoCameraOutlined />}
                  onClick={() =>
                    navigate(
                      "/iframe?url=" +
                        encodeURIComponent("https://live.codeemo.cn")
                    )
                  }
                  className="no-drag hidden sm:inline-flex"
                >
                  Digo
                </Button>

                {/* GitHub */}
                <Button
                  type="text"
                  icon={<GithubOutlined />}
                  href="https://github.com/bbuugg/tools"
                  target="_blank"
                  rel="noreferrer"
                  className="no-drag"
                  aria-label="GitHub"
                />

                {/* 主题切换 */}
                <Button
                  type="text"
                  icon={
                    currentTheme === "dark" ? <BulbFilled /> : <BulbOutlined />
                  }
                  onClick={toggleTheme}
                  className="no-drag"
                  aria-label="切换主题"
                />

                {/* 语言切换 */}
                <Dropdown
                  menu={{ items: langMenuItems }}
                  placement="bottomRight"
                >
                  <Button
                    type="text"
                    icon={<GlobalOutlined />}
                    className="no-drag"
                  >
                    {locale === "zh-CN" ? "中文" : "English"}
                  </Button>
                </Dropdown>

                {/* 窗口控制 */}
                <WindowControls />
              </div>
            </div>
          </header>

          {/* 主内容 */}
          <main>
            <Outlet />
          </main>
        </div>
      </div>

      {/* 移动端侧边栏 Drawer */}
      <Drawer
        open={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        placement="left"
        styles={{
          wrapper: { width: "min(88vw, 320px)" },
          body: { padding: 0 },
          header: { display: "none" },
        }}
      >
        <SidebarContent onNavigate={() => setIsMobileSidebarOpen(false)} />
      </Drawer>
    </div>
  );
}
