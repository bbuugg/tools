import {
  collectGroupIds,
  firstGroupId,
  genPaneId,
  insertSibling,
  makeLeaf,
  removeLeaf,
  verifyLayout,
  type PaneNode,
  type SplitDirectionInput,
} from "@/lib/pane-layout";

/** 一个面板分组：若干标签 + 组内当前显示的那一个 */
export interface PanelGroup {
  id: string;
  /** 组内标签 path，按组内顺序 */
  tabIds: string[];
  activeTabId: string | null;
}

export interface PanelState {
  layout: PaneNode;
  groups: Record<string, PanelGroup>;
  /** 当前焦点组：URL、顶栏和下一步操作的默认目标都跟着它 */
  activeGroupId: string;
}

export function initialState(tabKeys: string[]): PanelState {
  const gid = genPaneId();
  return {
    layout: makeLeaf(gid),
    groups: {
      [gid]: { id: gid, tabIds: [...tabKeys], activeTabId: tabKeys[0] ?? null },
    },
    activeGroupId: gid,
  };
}

export function groupOfTab(state: PanelState, key: string): string | null {
  for (const g of Object.values(state.groups)) {
    if (g.tabIds.includes(key)) return g.id;
  }
  return null;
}

export function activateTab(state: PanelState, key: string): PanelState {
  const gid = groupOfTab(state, key);
  if (!gid) return state;
  const g = state.groups[gid];
  if (g.activeTabId === key && state.activeGroupId === gid) return state;
  return {
    ...state,
    activeGroupId: gid,
    groups: { ...state.groups, [gid]: { ...g, activeTabId: key } },
  };
}

export function setActiveGroup(
  state: PanelState,
  groupId: string,
): PanelState {
  if (!state.groups[groupId] || state.activeGroupId === groupId) return state;
  return { ...state, activeGroupId: groupId };
}

export function reorderInGroup(
  state: PanelState,
  groupId: string,
  tabId: string,
  toIndex: number,
): PanelState {
  const g = state.groups[groupId];
  if (!g) return state;
  const from = g.tabIds.indexOf(tabId);
  if (from === -1) return state;
  const arr = [...g.tabIds];
  arr.splice(from, 1);
  let idx = from < toIndex ? toIndex - 1 : toIndex;
  idx = Math.max(0, Math.min(arr.length, idx));
  arr.splice(idx, 0, tabId);
  if (arr.every((k, i) => k === g.tabIds[i])) return state;
  return {
    ...state,
    groups: { ...state.groups, [groupId]: { ...g, tabIds: arr } },
  };
}

export function moveTabToGroup(
  state: PanelState,
  tabId: string,
  targetGroupId: string,
  index?: number,
): PanelState {
  if (!state.groups[targetGroupId]) return state;
  const srcGroupId = groupOfTab(state, tabId);
  if (!srcGroupId || srcGroupId === targetGroupId) return state;

  const groups: Record<string, PanelGroup> = { ...state.groups };
  const src = groups[srcGroupId];
  if (!src) return state;

  let removedGroupId: string | null = null;
  const srcTabIds = src.tabIds.filter((k) => k !== tabId);
  if (srcTabIds.length === 0) {
    delete groups[srcGroupId];
    removedGroupId = srcGroupId;
  } else {
    groups[srcGroupId] = {
      ...src,
      tabIds: srcTabIds,
      activeTabId:
        src.activeTabId === tabId
          ? (srcTabIds[srcTabIds.length - 1] ?? null)
          : src.activeTabId,
    };
  }

  const target = groups[targetGroupId];
  if (!target) return state;
  const tabIds = [...target.tabIds];
  const at =
    index === undefined
      ? tabIds.length
      : Math.max(0, Math.min(tabIds.length, index));
  tabIds.splice(at, 0, tabId);
  groups[targetGroupId] = { ...target, tabIds, activeTabId: tabId };

  let layout: PaneNode = state.layout;
  if (removedGroupId) {
    const next = removeLeaf(state.layout, removedGroupId);
    if (!next) return state;
    layout = next;
  }
  if (verifyLayout(collectGroupIds(layout), layout) !== null) return state;

  return { layout, groups, activeGroupId: targetGroupId };
}

export function splitTabToGroup(
  state: PanelState,
  tabId: string,
  targetGroupId: string,
  direction: SplitDirectionInput,
): PanelState {
  if (!state.groups[targetGroupId]) return state;
  const srcGroupId = groupOfTab(state, tabId);
  if (!srcGroupId) return state;
  if (
    srcGroupId === targetGroupId &&
    state.groups[srcGroupId].tabIds.length < 2
  ) {
    return state;
  }

  const gid = genPaneId();
  const layout0 = insertSibling(
    state.layout,
    targetGroupId,
    direction,
    makeLeaf(gid),
  );
  const groups: Record<string, PanelGroup> = {
    ...state.groups,
    [gid]: { id: gid, tabIds: [tabId], activeTabId: tabId },
  };

  const src = groups[srcGroupId];
  let removedGroupId: string | null = null;
  if (src) {
    const tabIds = src.tabIds.filter((k) => k !== tabId);
    if (tabIds.length === 0) {
      delete groups[srcGroupId];
      removedGroupId = srcGroupId;
    } else {
      groups[srcGroupId] = {
        ...src,
        tabIds,
        activeTabId:
          src.activeTabId === tabId
            ? (tabIds[tabIds.length - 1] ?? null)
            : src.activeTabId,
      };
    }
  }

  let layout: PaneNode = layout0;
  if (removedGroupId) {
    const next = removeLeaf(layout0, removedGroupId);
    if (!next) return state;
    layout = next;
  }
  if (verifyLayout(collectGroupIds(layout), layout) !== null) return state;
  return { layout, groups, activeGroupId: gid };
}

/** 整组搬家：center = 并入目标组，其余方向 = 整组在目标组旁边新切一格 */
export function moveGroupToGroup(
  state: PanelState,
  groupId: string,
  targetGroupId: string,
  direction: SplitDirectionInput | "center",
): PanelState {
  if (groupId === targetGroupId) return state;
  const moving = state.groups[groupId];
  const target = state.groups[targetGroupId];
  if (!moving || !target) return state;

  const stripped = removeLeaf(state.layout, groupId);
  if (!stripped) return state;

  if (direction === "center") {
    const groups: Record<string, PanelGroup> = { ...state.groups };
    delete groups[groupId];
    const t = groups[targetGroupId];
    if (!t) return state;
    groups[targetGroupId] = {
      ...t,
      tabIds: [...t.tabIds, ...moving.tabIds],
      activeTabId: moving.activeTabId ?? t.activeTabId,
    };
    if (verifyLayout(collectGroupIds(stripped), stripped) !== null) return state;
    return { layout: stripped, groups, activeGroupId: targetGroupId };
  }

  const layout = insertSibling(
    stripped,
    targetGroupId,
    direction,
    makeLeaf(groupId),
  );
  if (verifyLayout(collectGroupIds(layout), layout) !== null) return state;
  return { layout, groups: state.groups, activeGroupId: groupId };
}

/**
 * 关闭一批标签（跨组）。
 * 活动标签被关时优先落到它右侧的邻居；关空的组连同叶子一起折叠。
 */
export function removeTabs(
  state: PanelState,
  keys: readonly string[],
): PanelState {
  const drop = new Set(keys);
  if (drop.size === 0) return state;

  const groups: Record<string, PanelGroup> = {};
  const emptied: string[] = [];
  for (const g of Object.values(state.groups)) {
    const activeIndex = g.activeTabId ? g.tabIds.indexOf(g.activeTabId) : -1;
    const tabIds = g.tabIds.filter((k) => !drop.has(k));
    if (tabIds.length === 0) {
      emptied.push(g.id);
      continue;
    }
    let activeTabId = g.activeTabId;
    if (!activeTabId || drop.has(activeTabId)) {
      const at = Math.max(0, Math.min(activeIndex, tabIds.length - 1));
      activeTabId = tabIds[at] ?? tabIds[0] ?? null;
    }
    groups[g.id] = { ...g, tabIds, activeTabId };
  }

  if (Object.keys(groups).length === Object.keys(state.groups).length) {
    return { ...state, groups };
  }

  let layout: PaneNode | null = state.layout;
  for (const gid of emptied) {
    layout = layout ? removeLeaf(layout, gid) : null;
  }

  // 兜底保留一个空组，布局树不能为空
  if (!layout) {
    const gid = genPaneId();
    groups[gid] = { id: gid, tabIds: [], activeTabId: null };
    layout = makeLeaf(gid);
  }

  const activeGroupId = groups[state.activeGroupId]
    ? state.activeGroupId
    : (firstGroupId(layout) ?? Object.keys(groups)[0] ?? "");
  if (verifyLayout(collectGroupIds(layout), layout) !== null) return state;
  return { layout, groups, activeGroupId };
}

/**
 * 把状态对齐到给定的标签集合：保留现有分组归属，新增的进焦点组，消失的摘掉。
 * 用于刷新恢复与外部数据纠偏。
 */
export function alignToTabs(
  state: PanelState,
  tabKeys: string[],
): PanelState {
  const incoming = new Set(tabKeys);
  const present = new Set<string>();
  for (const g of Object.values(state.groups)) {
    for (const k of g.tabIds) if (incoming.has(k)) present.add(k);
  }

  const staleKeys: string[] = [];
  for (const g of Object.values(state.groups)) {
    for (const k of g.tabIds) if (!incoming.has(k)) staleKeys.push(k);
  }
  const missing = tabKeys.filter((k) => !present.has(k));
  if (staleKeys.length === 0 && missing.length === 0) return state;

  const groups: Record<string, PanelGroup> = {};
  const emptied: string[] = [];
  for (const g of Object.values(state.groups)) {
    const tabIds = g.tabIds.filter((k) => incoming.has(k));
    if (tabIds.length === 0) {
      emptied.push(g.id);
      continue;
    }
    groups[g.id] = {
      ...g,
      tabIds,
      activeTabId:
        g.activeTabId && tabIds.includes(g.activeTabId)
          ? g.activeTabId
          : (tabIds[0] ?? null),
    };
  }

  let layout: PaneNode | null = state.layout;
  for (const gid of emptied) {
    layout = layout ? removeLeaf(layout, gid) : null;
  }

  if (missing.length > 0) {
    const activeStillThere = groups[state.activeGroupId];
    if (activeStillThere) {
      groups[activeStillThere.id] = {
        ...activeStillThere,
        tabIds: [...activeStillThere.tabIds, ...missing],
        activeTabId: activeStillThere.activeTabId ?? missing[0] ?? null,
      };
    } else {
      const gid = genPaneId();
      groups[gid] = { id: gid, tabIds: [...missing], activeTabId: missing[0] ?? null };
      layout = layout
        ? insertSibling(layout, collectGroupIds(layout)[0] ?? "", "right", makeLeaf(gid))
        : makeLeaf(gid);
      if (!layout || !collectGroupIds(layout).includes(gid)) layout = makeLeaf(gid);
    }
  }

  if (!layout) {
    const empty = Object.values(groups).find((g) => g.tabIds.length === 0);
    const gid = empty?.id ?? genPaneId();
    if (!empty) groups[gid] = { id: gid, tabIds: [], activeTabId: null };
    layout = makeLeaf(gid);
  }

  const ids = collectGroupIds(layout);
  const activeGroupId = ids.includes(state.activeGroupId)
    ? state.activeGroupId
    : (firstGroupId(layout) ?? "");
  if (verifyLayout(ids, layout) !== null) return state;
  return { layout, groups, activeGroupId };
}

/** 合并全部分组为一组（保留焦点组当前标签） */
export function mergeAllGroups(state: PanelState): PanelState {
  const ids = collectGroupIds(state.layout);
  if (ids.length <= 1) return state;
  const targetId = ids[0];
  const tabIds = ids.flatMap((id) => state.groups[id]?.tabIds ?? []);
  const focusedActive = state.groups[state.activeGroupId]?.activeTabId ?? null;
  const activeTabId =
    focusedActive && tabIds.includes(focusedActive)
      ? focusedActive
      : (tabIds[0] ?? null);
  return {
    layout: makeLeaf(targetId),
    groups: { [targetId]: { id: targetId, tabIds, activeTabId } },
    activeGroupId: targetId,
  };
}
