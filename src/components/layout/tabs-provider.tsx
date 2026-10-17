import { useEffect, useLayoutEffect, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  bindPanelNavigate,
  savePanelState,
  syncFromUrl,
  usePanelState,
} from "@/components/layout/panel-store";

/**
 * 把地址栏与面板状态对齐：
 * - 外部导航（侧边栏 / 首页卡片 / 浏览器前进后退）→ 打开或聚焦对应标签
 * - 面板内部操作（切组 / 拆分 / 关闭）→ 由 panel-store 把地址栏同步到焦点组
 * - 分组布局与标签归属写入 sessionStorage，刷新后恢复
 */
export function TabsProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const state = usePanelState();

  useLayoutEffect(() => bindPanelNavigate(navigate), [navigate]);

  useEffect(() => {
    syncFromUrl(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    const timer = window.setTimeout(() => savePanelState(state), 200);
    return () => window.clearTimeout(timer);
  }, [state]);

  return children;
}
