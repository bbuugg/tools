import { useEffect } from "react";
import { Outlet, ScrollRestoration, useMatches } from "react-router-dom";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/app-sidebar";
import { pageTitle } from "@/lib/site";
import { type RouteHandle } from "@/lib/routes";

/** 根据当前路由 handle.meta 动态更新 document.title */
function useDocumentTitle() {
  const matches = useMatches();
  const lastMatch = matches[matches.length - 1];
  const meta = (lastMatch.handle as RouteHandle | undefined)?.meta;

  useEffect(() => {
    if (meta) {
      document.title = pageTitle(meta.title);
    } else if (lastMatch.pathname === "/") {
      document.title = pageTitle("工具");
    } else {
      document.title = "工具站";
    }
  }, [meta, lastMatch.pathname]);
}

export default function Layout() {
  useDocumentTitle();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 bg-white flex h-14 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </SidebarInset>
      <ScrollRestoration />
    </SidebarProvider>
  );
}
