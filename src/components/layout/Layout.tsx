import { AppSidebar } from "@/components/app-sidebar";
import { Spinner } from "@/components/ui/spinner";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { type RouteHandle } from "@/lib/routes";
import { pageTitle } from "@/lib/site";
import { useEffect, useMemo } from "react";
import { Outlet, ScrollRestoration, useMatches, useNavigation } from "react-router-dom";

/** 从当前路由 handle.meta 获取标题和描述 */
function useRouteMeta() {
  const matches = useMatches();
  const lastMatch = matches[matches.length - 1];
  const meta = (lastMatch.handle as RouteHandle | undefined)?.meta;

  return useMemo(() => {
    if (meta) {
      return { title: meta.title, description: meta.description };
    }
    if (lastMatch.pathname === "/") {
      return { title: "工具", description: "在线工具合集" };
    }
    return { title: "开发者工具", description: "" };
  }, [meta, lastMatch.pathname]);
}

/** 根据当前路由 handle.meta 动态更新 document.title */
function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = pageTitle(title);
  }, [title]);
}

export default function Layout() {
  const { title, description } = useRouteMeta();
  useDocumentTitle(title);

  // 路由级 lazy 加载 chunk 期间，navigation.location 为真（底层 useSyncExternalStore 强制同步渲染）
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 bg-background/80 px-4 backdrop-blur-sm">
          <SidebarTrigger size="icon-lg" />
          <div className="flex min-w-0 items-baseline gap-0.5 ml-2 flex-col">
            <h1 className="truncate font-semibold text-lg sm:text-md">{title}</h1>
            {description && (
              <p className="hidden truncate text-xs text-muted-foreground sm:block">
                {description}
              </p>
            )}
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden relative">
          <Outlet />
          {isNavigating && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/70 backdrop-blur-sm">
              <Spinner className="size-8" />
            </div>
          )}
        </main>
      </SidebarInset>
      <ScrollRestoration />
    </SidebarProvider>
  );
}
