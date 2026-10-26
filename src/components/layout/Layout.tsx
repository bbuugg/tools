import { AppSidebar } from "@/components/app-sidebar";
import { useActiveTabKey } from "@/components/layout/panel-store";
import { PanelView } from "@/components/layout/panel-view";
import { TabsProvider } from "@/components/layout/tabs-provider";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { pageTitle } from "@/lib/site";
import { HOME_PATH, resolveTabMeta } from "@/lib/tabs";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Layout() {
  return (
    <TabsProvider>
      <LayoutShell />
    </TabsProvider>
  );
}

function LayoutShell() {
  const activePath = useActiveTabKey();
  const { pathname } = useLocation();
  const titlePath = pathname === HOME_PATH ? HOME_PATH : activePath;
  const title =
    (titlePath ? resolveTabMeta(titlePath)?.title : null) ?? "开发者工具";

  useDocumentTitle(title);

  return (
    // h-svh + overflow-hidden：整页固定视口高度，滚动交给每个面板的标签内容，
    // 这样多分组并排时标签条始终可见。
    <SidebarProvider className="h-svh min-h-0 overflow-hidden">
      <AppSidebar />
      {/* min-w-0：内容区宽度固定为「视口 - 侧边栏」，不被面板的 min-content 撑开 */}
      <SidebarInset className="h-svh min-h-0 min-w-0 overflow-hidden">
        {/* 桌面端的收起/展开按钮在侧边栏底部；移动端侧边栏是抽屉，用悬浮把手唤起 */}
        <SidebarTrigger className="absolute top-1/2 left-0 z-20 -translate-y-1/2 rounded-r-2xl rounded-l-none bg-sidebar text-sidebar-foreground shadow-sm md:hidden" />
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
