import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { HOME_PATH, isKnownPath, resolveTabMeta } from "@/lib/tabs";
import {
  TabsContext,
  type TabItem,
  type TabsContextValue,
} from "@/components/layout/tabs-context";

/** sessionStorage 键：仅保存标签顺序与路径，页面数据不落盘 */
const STORAGE_KEY = "tool-tabs:v1";

/** 标签内部状态 */
interface TabState {
  path: string;
  /** 是否已经挂载过页面组件 */
  mounted: boolean;
  /** 递增该值会重新挂载页面 */
  reloadKey: number;
}

function readStoredPaths(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p): p is string => typeof p === "string");
  } catch {
    return [];
  }
}

/** 初始标签：首页 + 上次会话恢复的标签 + 当前地址（去重，保持顺序） */
function createInitialTabs(currentPath: string): TabState[] {
  const stored = readStoredPaths().filter(isKnownPath);
  const paths = Array.from(
    new Set([HOME_PATH, ...stored.filter((p) => p !== HOME_PATH)]),
  );
  if (!paths.includes(currentPath)) paths.push(currentPath);
  return paths.map((path) => ({
    path,
    mounted: path === currentPath,
    reloadKey: 0,
  }));
}

/**
 * 多标签容器：
 * - 以地址栏路径为标签唯一标识，激活标签 = 当前 URL
 * - 已打开的页面组件常驻内存（隐藏而非卸载），切换标签不丢失数据
 * - 标签列表写入 sessionStorage，刷新后恢复（页面组件等到激活时再加载）
 */
export function TabsProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const activePath = location.pathname;

  const [tabs, setTabs] = useState<TabState[]>(() =>
    createInitialTabs(activePath),
  );

  // 事件回调里读取最新值，避免闭包过期
  const tabsRef = useRef(tabs);
  const activePathRef = useRef(activePath);
  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);
  useEffect(() => {
    activePathRef.current = activePath;
  }, [activePath]);

  // 地址变化：补齐对应标签，并标记为已挂载（首次激活时才真正加载页面）。
  // 采用「渲染期根据 prop 调整 state」写法，避免在 effect 中同步 setState。
  const [syncedPath, setSyncedPath] = useState(activePath);
  if (syncedPath !== activePath) {
    setSyncedPath(activePath);
    setTabs((prev) => {
      const index = prev.findIndex((t) => t.path === activePath);
      if (index === -1) {
        return [...prev, { path: activePath, mounted: true, reloadKey: 0 }];
      }
      if (prev[index].mounted) return prev;
      const next = prev.slice();
      next[index] = { ...next[index], mounted: true };
      return next;
    });
  }

  // 持久化标签列表
  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(tabs.map((t) => t.path)),
      );
    } catch {
      // 隐私模式等场景下写入失败，忽略即可
    }
  }, [tabs]);

  const activate = useCallback(
    (path: string) => {
      if (path !== activePathRef.current) navigate(path);
    },
    [navigate],
  );

  const close = useCallback(
    (path: string) => {
      if (path === HOME_PATH) return;
      const list = tabsRef.current;
      const index = list.findIndex((t) => t.path === path);
      if (index === -1) return;

      const rest = list.filter((t) => t.path !== path);
      setTabs(rest);

      // 关闭当前标签时，切到相邻标签（优先右侧，没有则左侧）
      if (path === activePathRef.current) {
        const next = rest[Math.min(index, rest.length - 1)];
        navigate(next ? next.path : HOME_PATH);
      }
    },
    [navigate],
  );

  const closeOthers = useCallback(
    (path: string) => {
      setTabs(
        tabsRef.current.filter((t) => t.path === path || t.path === HOME_PATH),
      );
      if (activePathRef.current !== path) navigate(path);
    },
    [navigate],
  );

  const closeLeft = useCallback(
    (path: string) => {
      const list = tabsRef.current;
      const index = list.findIndex((t) => t.path === path);
      if (index === -1) return;
      const rest = list.filter(
        (t, i) => i >= index || t.path === HOME_PATH,
      );
      setTabs(rest);
      // 当前标签被关掉了就切回被右键的那个
      if (!rest.some((t) => t.path === activePathRef.current)) navigate(path);
    },
    [navigate],
  );

  const closeRight = useCallback(
    (path: string) => {
      const list = tabsRef.current;
      const index = list.findIndex((t) => t.path === path);
      if (index === -1) return;
      const rest = list.filter((t, i) => i <= index || t.path === HOME_PATH);
      setTabs(rest);
      if (!rest.some((t) => t.path === activePathRef.current)) navigate(path);
    },
    [navigate],
  );

  const closeAll = useCallback(() => {
    setTabs(tabsRef.current.filter((t) => t.path === HOME_PATH));
    if (activePathRef.current !== HOME_PATH) navigate(HOME_PATH);
  }, [navigate]);

  const reload = useCallback((path: string) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.path === path
          ? { ...t, mounted: true, reloadKey: t.reloadKey + 1 }
          : t,
      ),
    );
  }, []);

  const resolvedTabs = useMemo<TabItem[]>(
    () =>
      tabs.map((tab) => ({
        ...tab,
        active: tab.path === activePath,
        pinned: tab.path === HOME_PATH,
        meta: resolveTabMeta(tab.path),
      })),
    [tabs, activePath],
  );

  const value = useMemo<TabsContextValue>(
    () => ({
      tabs: resolvedTabs,
      activePath,
      activeTab: resolvedTabs.find((t) => t.active),
      activate,
      close,
      closeOthers,
      closeLeft,
      closeRight,
      closeAll,
      reload,
    }),
    [
      resolvedTabs,
      activePath,
      activate,
      close,
      closeOthers,
      closeLeft,
      closeRight,
      closeAll,
      reload,
    ],
  );

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}
