import { useSyncExternalStore } from "react";

/** 标签的运行时状态：是否已挂载过、重新加载计数。不参与面板布局持久化 */
export interface TabRuntimeEntry {
  mounted: boolean;
  reloadKey: number;
}

const entries = new Map<string, TabRuntimeEntry>();
const listeners = new Set<() => void>();
let version = 0;

function emit(): void {
  version++;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getTabRuntime(path: string): TabRuntimeEntry | undefined {
  return entries.get(path);
}

export function markTabMounted(path: string): void {
  const prev = entries.get(path);
  if (prev?.mounted) return;
  entries.set(path, { mounted: true, reloadKey: prev?.reloadKey ?? 0 });
  emit();
}

export function bumpTabReload(path: string): void {
  const prev = entries.get(path);
  entries.set(path, {
    mounted: true,
    reloadKey: (prev?.reloadKey ?? 0) + 1,
  });
  emit();
}

/** 关闭标签后回收运行时状态；重开同一路径会得到全新的页面实例 */
export function pruneTabRuntime(livePaths: ReadonlySet<string>): void {
  let changed = false;
  for (const path of entries.keys()) {
    if (livePaths.has(path)) continue;
    entries.delete(path);
    changed = true;
  }
  if (changed) emit();
}

export function tabRuntimeVersion(): number {
  return version;
}

/** 内容层订阅它：重新加载会换 key，强制重新挂载单个标签内容 */
export function useTabRuntimeVersion(): number {
  return useSyncExternalStore(subscribe, tabRuntimeVersion, tabRuntimeVersion);
}
