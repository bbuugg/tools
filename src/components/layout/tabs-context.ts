import { createContext, useContext } from "react";
import type { TabMeta } from "@/lib/tabs";

/** 一个已打开的标签页（含派生信息） */
export interface TabItem {
  /** 标签唯一标识，等于路由路径 */
  path: string;
  /** 页面组件是否已经挂载过（未挂载的标签不渲染，等激活时再加载） */
  mounted: boolean;
  /** 递增该值会重新挂载页面，用于「重新加载」 */
  reloadKey: number;
  /** 是否为当前激活标签 */
  active: boolean;
  /** 固定标签（首页），不可关闭 */
  pinned: boolean;
  /** 标题 / 描述 / 图标等展示信息 */
  meta: TabMeta;
}

export interface TabsContextValue {
  /** 所有标签，按打开顺序排列 */
  tabs: TabItem[];
  /** 当前激活标签的路径（与地址栏保持一致） */
  activePath: string;
  activeTab: TabItem | undefined;
  /** 激活（切换）到指定标签 */
  activate: (path: string) => void;
  /** 关闭标签，关闭的是当前标签时自动切到相邻标签 */
  close: (path: string) => void;
  /** 关闭除指定标签（与首页）之外的所有标签 */
  closeOthers: (path: string) => void;
  /** 关闭指定标签左侧（不含首页）的所有标签 */
  closeLeft: (path: string) => void;
  /** 关闭指定标签右侧的所有标签 */
  closeRight: (path: string) => void;
  /** 关闭除首页之外的所有标签 */
  closeAll: () => void;
  /** 重新加载（重新挂载）指定标签的页面 */
  reload: (path: string) => void;
}

export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabs(): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error("useTabs 必须在 <TabsProvider> 内部使用");
  return ctx;
}
