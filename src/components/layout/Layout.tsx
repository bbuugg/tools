import { AppSidebar } from "@/components/app-sidebar";
import { GithubLink } from "@/components/github-link";
import { InstallButton } from "@/components/install-button";
import { useActiveTabKey } from "@/components/layout/panel-store";
import { PanelView } from "@/components/layout/panel-view";
import { TabsProvider } from "@/components/layout/tabs-provider";
import { ModeToggle } from "@/components/mode-toggle";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { pageTitle } from "@/lib/site";
import { resolveTabMeta } from "@/lib/tabs";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export default function Layout() {
  return (
    <TabsProvider>
      <LayoutShell />
    </TabsProvider>
  );
}

function LayoutShell() {
  const activePath = useActiveTabKey();
  const meta = activePath ? resolveTabMeta(activePath) : null;
  const title = meta?.title ?? "开发者工具";
  const description = meta?.description ?? "";
  const Icon = meta?.icon;

  useDocumentTitle(title);

  return (
    // h-svh + overflow-hidden：整页固定视口高度，滚动交给每个面板的标签内容，
    // 这样多分组并排时标签条始终可见。
    <SidebarProvider className="h-svh min-h-0 overflow-hidden">
      <AppSidebar />
      {/* min-w-0：内容区宽度固定为「视口 - 侧边栏」，不被面板的 min-content 撑开 */}
      <SidebarInset className="h-svh min-h-0 min-w-0 overflow-hidden">
        <div className="shrink-0 border-b border-border/60 bg-background/80 backdrop-blur-sm">
          <header className="flex h-16 shrink-0 items-center gap-3 px-4 sm:px-6">
            <SidebarTrigger className="size-10" />
            {Icon && (
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg text-white",
                  meta?.color,
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
              <InstallButton />
              <GithubLink />
              <ModeToggle />
            </div>
          </header>
        </div>
        <div className="flex min-h-0 flex-1 flex-col p-2 sm:p-3">
          <PanelView />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

/** 根据焦点分组的活动标签更新 document.title */
function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = pageTitle(title);
  }, [title]);
}
