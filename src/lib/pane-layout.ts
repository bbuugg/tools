/** 分屏方向（相对目标组）：左右并排为 row，上下堆叠为 col */
export type SplitDirectionInput = "up" | "down" | "left" | "right";
export type SplitDirection = "row" | "col";

export interface PaneLeaf {
  id: string;
  type: "leaf";
  /** 这一格承载的分组 id；组里有哪些标签由 panel-groups 决定 */
  groupId: string;
}

export interface PaneSplit {
  id: string;
  type: "split";
  direction: SplitDirection;
  /** 与 children 一一对应的 flex-grow 权重，总和恒为 1 */
  sizes: number[];
  children: PaneNode[];
}

export type PaneNode = PaneLeaf | PaneSplit;

export function genPaneId(): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  return `pane-${c?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
}

export function makeLeaf(groupId: string): PaneLeaf {
  return { id: genPaneId(), type: "leaf", groupId };
}

function directionToSplit(d: SplitDirectionInput): SplitDirection {
  return d === "left" || d === "right" ? "row" : "col";
}

function isBefore(d: SplitDirectionInput): boolean {
  return d === "left" || d === "up";
}

/**
 * 归一到「与 children 等长」且总和为 1。
 * 渲染层把 sizes 直接当 flex-grow 用，总和小于 1 时 flexbox 只分配部分剩余空间。
 */
function normalizeSizes(sizes: number[], count: number): number[] {
  if (count <= 0) return [];
  const kept = Array.from({ length: count }, (_, i) => sizes[i] ?? 1);
  const total = kept.reduce((a, b) => a + b, 0);
  if (!Number.isFinite(total) || total <= 0) {
    return Array.from({ length: count }, () => 1 / count);
  }
  return kept.map((s) => s / total);
}

function childContainsGroup(node: PaneNode, groupId: string): boolean {
  if (node.type === "leaf") return node.groupId === groupId;
  return node.children.some((c) => childContainsGroup(c, groupId));
}

function splitSize(sizes: number[], idx: number, before: boolean): number[] {
  const n = sizes.length || 1;
  const total = sizes.reduce((a, b) => a + b, 0) || n;
  const cur = sizes[idx] ?? total / n;
  const half = cur / 2;
  const next = sizes.map((s, i) => (i === idx ? half : s));
  next.splice(before ? idx : idx + 1, 0, half);
  return next;
}

function wrapWith(
  target: PaneNode,
  newLeaf: PaneLeaf,
  splitDir: SplitDirection,
  before: boolean,
): PaneSplit {
  return {
    id: genPaneId(),
    type: "split",
    direction: splitDir,
    sizes: [0.5, 0.5],
    children: before ? [newLeaf, target] : [target, newLeaf],
  };
}

/** 在承载 sourceGroupId 的叶子旁插入新组，必要时在该叶子的紧邻父层新建分隔节点 */
export function insertSibling(
  layout: PaneNode,
  sourceGroupId: string,
  direction: SplitDirectionInput,
  newLeaf: PaneLeaf,
): PaneNode {
  const splitDir = directionToSplit(direction);
  const before = isBefore(direction);
  if (layout.type === "leaf") {
    if (layout.groupId !== sourceGroupId) return layout;
    return wrapWith(layout, newLeaf, splitDir, before);
  }
  return descend(layout, sourceGroupId, splitDir, before, newLeaf);
}

function descend(
  node: PaneSplit,
  sourceGroupId: string,
  splitDir: SplitDirection,
  before: boolean,
  newLeaf: PaneLeaf,
): PaneNode {
  const idx = node.children.findIndex(
    (c) => c.type === "leaf" && c.groupId === sourceGroupId,
  );

  if (idx >= 0) {
    const leaf = node.children[idx] as PaneLeaf;
    if (node.direction === splitDir) {
      const children = [...node.children];
      children.splice(before ? idx : idx + 1, 0, newLeaf);
      return {
        ...node,
        children,
        sizes: splitSize(node.sizes, idx, before),
      };
    }
    const children = [...node.children];
    children[idx] = wrapWith(leaf, newLeaf, splitDir, before);
    return { ...node, children };
  }

  const deepIdx = node.children.findIndex((c) =>
    childContainsGroup(c, sourceGroupId),
  );
  if (deepIdx < 0) return node;
  const child = node.children[deepIdx];
  if (child.type === "leaf") return node;
  const deeper = descend(child, sourceGroupId, splitDir, before, newLeaf);
  if (deeper === child) return node;
  const children = [...node.children];
  children[deepIdx] = deeper;
  return { ...node, children };
}

/** 删除承载 groupId 的叶子，并递归折叠只剩一个孩子的分隔节点 */
export function removeLeaf(
  layout: PaneNode | null,
  groupId: string,
): PaneNode | null {
  if (!layout) return null;
  if (layout.type === "leaf") {
    return layout.groupId === groupId ? null : layout;
  }
  const children = layout.children
    .map((c) => removeLeaf(c, groupId))
    .filter((c): c is PaneNode => c !== null);
  if (children.length === 0) return null;
  if (children.length === 1) return children[0];
  const sizes = normalizeSizes(layout.sizes, children.length);
  return { ...layout, children, sizes };
}

export function collectGroupIds(layout: PaneNode | null): string[] {
  if (!layout) return [];
  if (layout.type === "leaf") return [layout.groupId];
  return layout.children.flatMap((c) => collectGroupIds(c));
}

export function firstGroupId(layout: PaneNode | null): string | null {
  if (!layout) return null;
  if (layout.type === "leaf") return layout.groupId;
  for (const c of layout.children) {
    const id = firstGroupId(c);
    if (id) return id;
  }
  return null;
}

export function updateSizes(
  layout: PaneNode,
  splitId: string,
  sizes: number[],
): PaneNode {
  if (layout.type === "leaf") return layout;
  if (layout.id === splitId) {
    return { ...layout, sizes: normalizeSizes(sizes, layout.children.length) };
  }
  const children = layout.children.map((c) => updateSizes(c, splitId, sizes));
  return children.every((c, i) => c === layout.children[i])
    ? layout
    : { ...layout, children };
}

/** 结构自检：所有组在树里恰好出现一次；失败时调用方放弃这次变更 */
export function verifyLayout(
  beforeGroups: string[],
  layout: PaneNode | null,
): string | null {
  if (!layout) return "布局为空";
  const after = collectGroupIds(layout);
  const bag = new Map<string, number>();
  for (const g of beforeGroups) bag.set(g, (bag.get(g) ?? 0) + 1);
  const seen = new Set<string>();
  for (const g of after) {
    if (seen.has(g)) return `组 ${g} 重复出现`;
    seen.add(g);
    const n = bag.get(g);
    if (n === undefined) return `多出了组 ${g}`;
    if (n === 0) return `组 ${g} 重复出现`;
    bag.set(g, n - 1);
  }
  for (const [g, n] of bag) if (n > 0) return `组 ${g} 丢失`;
  return null;
}

/** 校验持久化数据的基本树形（不校验组与标签的对应关系，那一步交给 verifyLayout） */
export function isPaneNode(value: unknown): value is PaneNode {
  if (!value || typeof value !== "object") return false;
  const node = value as Record<string, unknown>;
  if (typeof node.id !== "string") return false;
  if (node.type === "leaf") return typeof node.groupId === "string";
  if (node.type !== "split") return false;
  if (node.direction !== "row" && node.direction !== "col") return false;
  if (!Array.isArray(node.sizes) || !Array.isArray(node.children)) return false;
  if (node.children.length === 0) return false;
  if (node.sizes.length !== node.children.length) return false;
  if (!node.sizes.every((s) => typeof s === "number" && Number.isFinite(s))) {
    return false;
  }
  return node.children.every(isPaneNode);
}
