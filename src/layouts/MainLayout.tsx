import { useEffect, useRef, useState } from "react";
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
  PictureOutlined,
  SearchOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import {
  Menu,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import { useLocaleStore } from "@/store/useLocaleStore";
import { useThemeStore } from "@/store/useThemeStore";
import { allTools } from "@/utils/toolList";
import JsonTools from "@/pages/tools/Json";
import MediaTools from "@/pages/tools/Media";
import WebTools from "@/pages/tools/Web";
import OtherTools from "@/pages/tools/Other";
import DownloadDropdown from "@/components/DownloadDropdown";
import WindowControls from "@/components/WindowControls";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: React.ReactNode;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
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

// 自定义菜单项组件
const CustomMenuItem: React.FC<{
  item: MenuItem;
  isActive: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}> = ({ item, isActive, isOpen, onToggle, onNavigate }) => {
  const navigate = useNavigate();
  const hasChildren = item.children && item.children.length > 0;

  const handleClick = () => {
    if (hasChildren) {
      onToggle();
    } else {
      navigate(item.key);
      onNavigate?.();
    }
  };

  return (
    <div>
      <button
        type="button"
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors",
          "hover:bg-accent/50",
          isActive && !hasChildren && "bg-accent text-accent-foreground font-medium"
        )}
        onClick={handleClick}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="shrink-0">{item.icon}</span>
          <span className="text-sm truncate">{item.label}</span>
        </div>
        {hasChildren && (
          <span className="shrink-0 text-muted-foreground">
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </span>
        )}
      </button>
      {hasChildren && isOpen && (
        <div className="ml-6 mt-1 space-y-1">
          {item.children!.map((child) => (
            <CustomMenuItem
              key={child.key}
              item={child}
              isActive={isActive}
              isOpen={false}
              onToggle={() => {}}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 侧边栏内容组件
type SidebarContentProps = {
  onNavigate?: () => void;
};

function SidebarContent({ onNavigate }: SidebarContentProps) {
  const location = useLocation();
  const [stateOpenKeys, setStateOpenKeys] = useState<string[]>([]);

  const toggleMenuItem = (key: string) => {
    setStateOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="flex h-full flex-col gap-5 p-4">
      {/* Logo 区域 */}
      <div className="flex items-center gap-3 px-2 pt-1">
        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_10px_24px_rgba(16,185,129,0.22)]">
          <Sparkles className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold tracking-tight">As Tools</p>
          <p className="text-xs text-muted-foreground">开发者工具集</p>
        </div>
      </div>

      {/* 菜单导航 */}
      <ScrollArea className="flex-1 -mx-2">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => (
            <CustomMenuItem
              key={item.key}
              item={item}
              isActive={location.pathname === item.key || location.pathname.startsWith(`${item.key}/`)}
              isOpen={stateOpenKeys.includes(item.key)}
              onToggle={() => toggleMenuItem(item.key)}
              onNavigate={onNavigate}
            />
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const intl = useIntl();
  const contentRef = useRef<HTMLDivElement>(null);

  const { locale, setLocale } = useLocaleStore();
  const { theme: currentTheme, toggleTheme } = useThemeStore();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // 滚动到顶部
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  // 搜索过滤
  const filteredTools = searchValue
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
            tool.translatedName.toLowerCase().includes(searchValue.toLowerCase()) ||
            tool.translatedDesc.toLowerCase().includes(searchValue.toLowerCase())
        )
    : [];

  const langItems = [
    { key: "en-US", label: "English", onClick: () => setLocale("en-US") },
    { key: "zh-CN", label: "中文", onClick: () => setLocale("zh-CN") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-[1920px] xl:grid-cols-[270px_minmax(0,1fr)]">
        {/* 桌面端侧边栏 */}
        <aside className="hidden bg-muted/35 xl:sticky xl:top-0 xl:block xl:h-screen">
          <SidebarContent />
        </aside>

        {/* 主内容区域 */}
        <div className="min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-background/80 shadow-[0_1px_0_rgba(15,23,42,0.05)] backdrop-blur-xl draggable-header">
            <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 md:px-6">
              {/* 左侧：移动端菜单 + 标题 */}
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {/* 移动端菜单按钮 */}
                <Sheet
                  open={isMobileSidebarOpen}
                  onOpenChange={setIsMobileSidebarOpen}
                >
                  <SheetTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 rounded-2xl xl:hidden no-drag"
                      aria-label="打开菜单"
                    >
                      <Menu className="size-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="left"
                    className="w-[min(88vw,320px)] border-r-0 p-0 sm:max-w-none"
                  >
                    <SheetHeader className="sr-only">
                      <SheetTitle>导航菜单</SheetTitle>
                      <SheetDescription>切换工具页面</SheetDescription>
                    </SheetHeader>
                    <SidebarContent onNavigate={() => setIsMobileSidebarOpen(false)} />
                  </SheetContent>
                </Sheet>

                {/* 标题区域 */}
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Workspace
                  </p>
                  <h1 className="mt-1 truncate text-lg font-semibold tracking-tight">
                    As Tools
                  </h1>
                </div>
              </div>

              {/* 右侧：操作按钮 */}
              <div className="flex items-center gap-2 md:gap-3">
                {/* 搜索框 */}
                <div className="w-48 hidden md:block">
                  <Popover open={searchOpen} onOpenChange={setSearchOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder={intl.formatMessage({
                            id: "layout.searchPlaceholder",
                            defaultMessage: "搜索工具...",
                          })}
                          value={searchValue}
                          onChange={(e) => {
                            setSearchValue(e.target.value);
                            setSearchOpen(!!e.target.value);
                          }}
                          className="pl-9 no-drag h-9 rounded-xl border-border/60 bg-background/80"
                        />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0 rounded-2xl" align="start">
                      <Command>
                        <CommandList>
                          <CommandEmpty>
                            {intl.formatMessage({
                              id: "layout.noResults",
                              defaultMessage: "未找到结果",
                            })}
                          </CommandEmpty>
                          <CommandGroup>
                            {filteredTools.map((tool) => (
                              <CommandItem
                                key={tool.path}
                                onSelect={() => {
                                  navigate(tool.path);
                                  setSearchOpen(false);
                                  setSearchValue("");
                                }}
                                className="cursor-pointer"
                              >
                                <div className="flex flex-col flex-1 gap-1">
                                  <span className="font-medium text-sm">
                                    {tool.translatedName}
                                  </span>
                                  <span className="text-xs text-muted-foreground line-clamp-1">
                                    {tool.translatedDesc}
                                  </span>
                                </div>
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  <FormattedMessage
                                    id={`common.category.${tool.category}`}
                                    defaultMessage={tool.category}
                                  />
                                </Badge>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* 博客按钮 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    navigate("/iframe?url=" + encodeURIComponent("https://www.codeemo.cn"))
                  }
                  className="no-drag rounded-xl hidden sm:inline-flex"
                >
                  <BookOutlined className="mr-1.5" />
                  <FormattedMessage id="nav.blog" defaultMessage="博客" />
                </Button>

                {/* Digo 按钮 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    navigate("/iframe?url=" + encodeURIComponent("https://live.codeemo.cn"))
                  }
                  className="no-drag rounded-xl hidden sm:inline-flex"
                >
                  <VideoCameraOutlined className="mr-1.5" />
                  Digo
                </Button>

                {/* 下载按钮 */}
                <DownloadDropdown />

                {/* GitHub 按钮 */}
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="no-drag rounded-xl shrink-0"
                >
                  <a
                    href="https://github.com/bbuugg/tools"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub"
                  >
                    <GithubOutlined />
                  </a>
                </Button>

                {/* 主题切换 */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="no-drag rounded-xl shrink-0"
                  aria-label="切换主题"
                >
                  {currentTheme === "dark" ? <BulbFilled /> : <BulbOutlined />}
                </Button>

                {/* 语言切换 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="no-drag rounded-xl">
                      <GlobalOutlined className="mr-1.5" />
                      {locale === "zh-CN" ? "中文" : "English"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-2xl">
                    {langItems.map((item) => (
                      <DropdownMenuItem key={item.key} onClick={item.onClick}>
                        {item.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* 窗口控制按钮 */}
                <WindowControls />
              </div>
            </div>
          </header>

          {/* 主内容区域 */}
          <main className="px-4 py-4 md:px-6 md:py-5">
            <ScrollArea className="h-[calc(100vh-4rem)]">
              <div ref={contentRef}>
                <Outlet />
              </div>
            </ScrollArea>
          </main>
        </div>
      </div>
    </div>
  );
}
