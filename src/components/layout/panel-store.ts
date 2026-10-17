import { useSyncExternalStore } from "react";
import { HOME_PATH, isKnownPath } from "@/lib/tabs";
import {
  activateTab as activateTabPure,
  alignToTabs,
  groupOfTab,
  initialState,
  mergeAllGroups as mergeAllGroupsPure,
  moveGroupToGroup,
  moveTabToGroup,
  removeTabs,
  reorderInGroup,
  setActiveGroup as setActiveGroupPure,
  splitTabToGroup,
  type PanelState,
} from "@/lib/panel-groups";
import {
  collectGroupIds,
  firstGroupId,
  isPaneNode,
  updateSizes,
  verifyLayout,
  type PaneNode,
  type SplitDirectionInput,
} from "@/lib/pane-layout";
import {
  bumpTabReload,
  markTabMounted,
  pruneTabRuntime,
} from "@/components/layout/tab-runtime";

export type { PanelState } from "@/lib/panel-groups";

const STORAGE_KEY = "tool-panels:v1";
const LEGACY_TABS_KEY = "tool-tabs:v1";

interface StoredPanelState {
  version: 1;
  layout: PaneNode;
  groups: PanelState["groups"];
  activeGroupId: string;
}

// ---------------------------------------------------------------------------
// 查询
// ---------------------------------------------------------------------------

export function allTabKeys(s: PanelState): string[] {
  const out: string[] = [];
  for (const g of Object.values(s.groups)) out.push(...g.tabIds);
  return out;
}

/** 焦点组当前显示的标签 path（也就是地址栏应当显示的 path） */
export function activeTabKey(s: PanelState): string | null {
  return s.groups[s.activeGroupId]?.activeTabId ?? null;
}

/** path -> 所属组 + 是否是该组当前显示的标签 */
export function tabOwners(
  s: PanelState,
): Map<string, { groupId: string; active: boolean }> {
  const out = new Map<string, { groupId: string; active: boolean }>();
  for (const [groupId, group] of Object.entries(s.groups)) {
    for (const path of group.tabIds) {
      out.set(path, { groupId, active: path === group.activeTabId });
    }
  }
  return out;
}

export function panelGroupIds(s: PanelState): string[] {
  return collectGroupIds(s.layout);
}

export function groupLabel(s: PanelState, groupId: string): string {
  const index = collectGroupIds(s.layout).indexOf(groupId);
  return index < 0 ? "未命名分组" : `分组 ${index + 1}`;
}

// ---------------------------------------------------------------------------
// 持久化恢复
// ---------------------------------------------------------------------------

function readLegacyPaths(): string[] {
  try {
    const raw = sessionStorage.getItem(LEGACY_TABS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is string => typeof p === "string" && isKnownPath(p),
    );
  } catch {
    return [];
  }
}

function readStoredPanel(): PanelState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredPanelState> | null;
    if (!parsed || typeof parsed !== "object") return null;
    if (!isPaneNode(parsed.layout)) return null;
    if (!parsed.groups || typeof parsed.groups !== "object") return null;
    if (Array.isArray(parsed.groups)) return null;

    const groups: PanelState["groups"] = {};
    const seen = new Set<string>();
    for (const [gid, value] of Object.entries<unknown>(parsed.groups)) {
      if (!value || typeof value !== "object") return null;
      const g = value as Record<string, unknown>;
      if (g.id !== gid) return null;
      if (!Array.isArray(g.tabIds)) return null;
      if (!g.tabIds.every((p) => typeof p === "string")) return null;
      const tabIds: string[] = [];
      for (const p of g.tabIds as string[]) {
        if (seen.has(p)) continue;
        seen.add(p);
        tabIds.push(p);
      }
      if (tabIds.length === 0) return null;
      const activeTabId =
        typeof g.activeTabId === "string" && tabIds.includes(g.activeTabId)
          ? g.activeTabId
          : (tabIds[0] ?? null);
      groups[gid] = { id: gid, tabIds, activeTabId };
    }

    if (verifyLayout(Object.keys(groups), parsed.layout) !== null) return null;
    const activeGroupId =
      typeof parsed.activeGroupId === "string" &&
      groups[parsed.activeGroupId]
        ? parsed.activeGroupId
        : (firstGroupId(parsed.layout) ?? "");
    return { layout: parsed.layout, groups, activeGroupId };
  } catch {
    return null;
  }
}

function createInitialSession(currentPath: string): {
  state: PanelState;
  mounted: string[];
} {
  const stored = readStoredPanel();
  const paths: string[] = [];

  if (stored) {
    for (const gid of collectGroupIds(stored.layout)) {
      for (const path of stored.groups[gid]?.tabIds ?? []) {
        if (paths.includes(path)) continue;
        if (isKnownPath(path) || path === currentPath) paths.push(path);
      }
    }
  } else {
    paths.push(...readLegacyPaths());
  }

  if (!paths.includes(HOME_PATH)) paths.unshift(HOME_PATH);
  if (!paths.includes(currentPath)) paths.push(currentPath);

  let state = stored ?? initialState(paths);
  state = alignToTabs(state, paths);
  state = activateTabPure(state, currentPath);

  const mounted = new Set<string>([HOME_PATH, currentPath]);
  for (const g of Object.values(state.groups)) {
    if (g.activeTabId) mounted.add(g.activeTabId);
  }
  return { state, mounted: [...mounted] };
}

const boot = createInitialSession(window.location.pathname);

let state: PanelState = boot.state;
for (const path of boot.mounted) markTabMounted(path);

export function savePanelState(s: PanelState = state): void {
  try {
    const payload: StoredPanelState = {
      version: 1,
      layout: s.layout,
      groups: s.groups,
      activeGroupId: s.activeGroupId,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // 隐私模式等场景写入失败时忽略
  }
}

// ---------------------------------------------------------------------------
// 订阅与导航桥接
// ---------------------------------------------------------------------------

const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPanelState(): PanelState {
  return state;
}

export function usePanelState(): PanelState {
  return useSyncExternalStore(subscribe, getPanelState, getPanelState);
}

export function useActiveTabKey(): string | null {
  return activeTabKey(usePanelState());
}

let navigateFn: ((path: string) => void) | null = null;

export function bindPanelNavigate(fn: (path: string) => void): () => void {
  navigateFn = fn;
  return () => {
    if (navigateFn === fn) navigateFn = null;
  };
}

function syncUrlWithActiveTab(): void {
  const path = activeTabKey(state);
  if (!path) return;
  if (path !== window.location.pathname) navigateFn?.(path);
}

/**
 * 统一提交入口：发布新状态、挂载各组的活动标签、回收已关闭标签的运行时，
 * 并让地址栏与焦点组的活动标签保持一致。
 */
function commit(
  next: PanelState,
  options?: { syncUrl?: boolean },
): boolean {
  const changed = next !== state;
  if (changed) {
    state = next;
    emit();
  }

  pruneTabRuntime(new Set(allTabKeys(state)));
  for (const g of Object.values(state.groups)) {
    if (g.activeTabId) markTabMounted(g.activeTabId);
  }
  if (options?.syncUrl !== false) syncUrlWithActiveTab();
  return changed;
}

/**
 * 地址栏变化的入口（侧边栏链接、浏览器前进后退、刷新恢复）。
 * 只同步状态，不反向调整 URL，避免与 react-router 形成回环。
 */
export function syncFromUrl(path: string): void {
  let next = state;
  if (!groupOfTab(next, path)) {
    next = alignToTabs(next, [...allTabKeys(next), path]);
  }
  next = activateTabPure(next, path);
  commit(next, { syncUrl: false });
}

// ---------------------------------------------------------------------------
// 用户操作
// ---------------------------------------------------------------------------

export function activateTab(path: string): void {
  commit(activateTabPure(state, path));
}

export function focusGroup(groupId: string): void {
  commit(setActiveGroupPure(state, groupId));
}

export function closeTab(path: string): void {
  if (path === HOME_PATH) return;
  commit(removeTabs(state, [path]));
}

export function closeTabs(paths: readonly string[]): void {
  const keys = paths.filter((p) => p !== HOME_PATH);
  if (keys.length === 0) return;
  commit(removeTabs(state, keys));
}

export function closeOthers(path: string): void {
  const gid = groupOfTab(state, path);
  if (!gid) return;
  const g = state.groups[gid];
  commit(removeTabs(state, g.tabIds.filter((k) => k !== path && k !== HOME_PATH)));
}

export function closeLeft(path: string): void {
  const gid = groupOfTab(state, path);
  if (!gid) return;
  const g = state.groups[gid];
  const index = g.tabIds.indexOf(path);
  commit(
    removeTabs(
      state,
      g.tabIds.slice(0, Math.max(0, index)).filter((k) => k !== HOME_PATH),
    ),
  );
}

export function closeRight(path: string): void {
  const gid = groupOfTab(state, path);
  if (!gid) return;
  const g = state.groups[gid];
  const index = g.tabIds.indexOf(path);
  commit(
    removeTabs(
      state,
      g.tabIds.slice(index + 1).filter((k) => k !== HOME_PATH),
    ),
  );
}

/** 关闭一个分组里的全部标签（首页固定标签保留） */
export function closeGroup(groupId: string): void {
  const g = state.groups[groupId];
  if (!g) return;
  closeTabs(g.tabIds);
}

/** 关闭全部分组里除首页外的所有标签 */
export function closeAllTabs(): void {
  closeTabs(allTabKeys(state));
}

export function reloadTab(path: string): void {
  bumpTabReload(path);
  markTabMounted(path);
}

export function reorderTab(
  groupId: string,
  path: string,
  toIndex: number,
): void {
  commit(reorderInGroup(state, groupId, path, toIndex));
}

export function moveTab(
  path: string,
  targetGroupId: string,
  index?: number,
): void {
  commit(moveTabToGroup(state, path, targetGroupId, index));
}

export function splitTab(
  path: string,
  targetGroupId: string,
  direction: SplitDirectionInput,
): void {
  commit(splitTabToGroup(state, path, targetGroupId, direction));
}

export function moveGroup(
  groupId: string,
  targetGroupId: string,
  direction: SplitDirectionInput | "center",
): void {
  commit(moveGroupToGroup(state, groupId, targetGroupId, direction));
}

export function mergeAllGroups(): void {
  commit(mergeAllGroupsPure(state));
}

export function resizeSplit(splitId: string, sizes: number[]): void {
  const layout = updateSizes(state.layout, splitId, sizes);
  if (layout === state.layout) return;
  commit({ ...state, layout }, { syncUrl: false });
}
