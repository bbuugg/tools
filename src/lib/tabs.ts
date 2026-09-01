import { FileQuestion, House, type LucideIcon } from "lucide-react";
import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import NotFound from "@/pages/not-found";
import { TOOL_ROUTES } from "@/lib/routes";

/** 首页路径：固定标签，不可关闭 */
export const HOME_PATH = "/";

/** 标签页展示信息 */
export interface TabMeta {
  title: string;
  description: string;
  icon: LucideIcon;
  /** 图标背景色（Tailwind 类名） */
  color: string;
}

const HOME_META: TabMeta = {
  title: "全部工具",
  description: "按分类浏览所有在线工具",
  icon: House,
  color: "bg-primary",
};

const NOT_FOUND_META: TabMeta = {
  title: "页面未找到",
  description: "",
  icon: FileQuestion,
  color: "bg-muted-foreground",
};

const loadHome = () => import("@/pages/home");

/**
 * 路径 -> 页面组件缓存。
 * 同一个路径复用同一个 lazy 组件，避免每次渲染都创建新的组件类型导致页面重新挂载。
 */
const pageCache = new Map<string, LazyExoticComponent<ComponentType>>();

function lazyPage(
  loader: () => Promise<{ default: ComponentType }>,
): LazyExoticComponent<ComponentType> {
  return lazy(loader);
}

/** 获取路径对应的页面组件，未知路径返回 404 页面 */
export function getPageComponent(path: string): ComponentType {
  const cached = pageCache.get(path);
  if (cached) return cached;

  const loader =
    path === HOME_PATH ? loadHome : TOOL_ROUTES.find((r) => r.path === path)?.lazy;
  if (!loader) return NotFound;

  const component = lazyPage(loader);
  pageCache.set(path, component);
  return component;
}

/** 是否为站点内已知路径（首页或已注册的工具） */
export function isKnownPath(path: string): boolean {
  return path === HOME_PATH || TOOL_ROUTES.some((r) => r.path === path);
}

/** 解析路径对应的标签展示信息 */
export function resolveTabMeta(path: string): TabMeta {
  if (path === HOME_PATH) return HOME_META;
  const route = TOOL_ROUTES.find((r) => r.path === path);
  if (!route) return NOT_FOUND_META;
  return {
    title: route.meta.title,
    description: route.meta.description,
    icon: route.meta.icon,
    color: route.meta.color,
  };
}

/** 页面实例 key：reloadKey 变化即重新挂载页面（用于「重新加载」） */
export function pageKey(path: string, reloadKey: number): string {
  return `${path}#${reloadKey}`;
}
