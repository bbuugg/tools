import { Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { GithubLink } from "@/components/github-link";
import { ModeToggle } from "@/components/mode-toggle";
import { Spinner } from "@/components/ui/spinner";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TabBar } from "@/components/layout/tab-bar";
import { useTabs } from "@/components/layout/tabs-context";
import { TabsProvider } from "@/components/layout/tabs-provider";
import { pageTitle } from "@/lib/site";
import { getPageComponent, pageKey } from "@/lib/tabs";
import { cn } from "@/lib/utils";

export default function Layout() {
  return (
    <TabsProvider>
      <LayoutShell />
    </TabsProvider>
  );
}

function LayoutShell() {
  const { tabs, activeTab } = useTabs();
  const title = activeTab?.meta.title ?? "开发者工具";
  const description = activeTab?.meta.description ?? "";

  useDocumentTitle(title);
  useTabScrollMemory();

  const Icon = activeTab?.meta.icon;

  return (
    <SidebarProvider>
      <AppSidebar />
      {/* min-w-0：内容区宽度固定为「视口 - 侧边栏」，不被页面 / 标签栏的 min-content 撑开，
          否则整页会出现横向滚动（溢出量正好是侧边栏宽度） */}
      <SidebarInset className="min-w-0">
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
          <header className="flex h-16 shrink-0 items-center gap-3 px-4 sm:px-6">
            <SidebarTrigger className="size-10" />
            {Icon && (
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg text-white",
                  activeTab?.meta.color,
                )}
              >
                <Icon className="size-5" />
              </div>
            )}
            <div className="flex min-w-0 flex-col justify-center gap-0.5">
              <h1 className="truncate text-lg leading-tight font-semibold">
                {title}
              </h1>
              {description && (
                <p className="hidden truncate text-xs leading-tight text-muted-foreground sm:block">
                  {description}
                </p>
              )}
            </div>
            <div className="ml-auto flex items-center gap-1">
              <GithubLink />
              <ModeToggle />
            </div>
          </header>
          <TabBar />
        </div>
        <main className="relative flex-1 overflow-x-hidden">
          {tabs
            .filter((tab) => tab.mounted)
            .map((tab) => {
              const Page = getPageComponent(tab.path);
              return (
                // 未激活的标签仅隐藏不卸载，页面状态（输入内容、文件、编辑器）保持原样
                <div key={tab.path} hidden={!tab.active}>
                  <Suspense fallback={<TabLoading />}>
                    <Page key={pageKey(tab.path, tab.reloadKey)} />
                  </Suspense>
                </div>
              );
            })}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function TabLoading() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  );
}

/** 根据当前标签更新 document.title */
function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = pageTitle(title);
  }, [title]);
}

/** 切换标签时保存 / 还原各自的滚动位置 */
function useTabScrollMemory() {
  const { activePath } = useTabs();
  const positions = useRef(new Map<string, number>());
  const previousPath = useRef(activePath);

  useLayoutEffect(() => {
    if (previousPath.current === activePath) return;
    positions.current.set(previousPath.current, window.scrollY);
    previousPath.current = activePath;
    window.scrollTo(0, positions.current.get(activePath) ?? 0);
  }, [activePath]);
}
