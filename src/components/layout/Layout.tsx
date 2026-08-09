import { useEffect } from "react";
import { Outlet, ScrollRestoration, useMatches } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
      <ScrollRestoration />
    </div>
  );
}
