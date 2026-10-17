import { useCallback, useEffect, useRef } from "react";
import type { DropTargetMonitor, XYCoord } from "react-dnd";
import type { SplitDirectionInput } from "@/lib/pane-layout";

export const PANEL_TAB_TYPE = "tools/panel-tab";

export interface PanelTabDragItem {
  kind: "tab" | "group";
  /** 标签 path；整组拖动时放组内第一个标签，仅作占位 */
  path: string;
  fromGroupId: string;
  /** 整组拖动时存在 */
  groupId?: string;
}

export type TabDropZone = "before" | "inside" | "after";
export type GroupDropZone = SplitDirectionInput | "center";

const EDGE_RATIO = 0.25;

export function horizontalRatio(
  monitor: DropTargetMonitor,
  el: HTMLElement | null,
): number {
  if (!el) return 0.5;
  const offset = monitor.getClientOffset() as XYCoord | null;
  if (!offset) return 0.5;
  const rect = el.getBoundingClientRect();
  if (rect.width <= 0) return 0.5;
  return (offset.x - rect.left) / rect.width;
}

export function zoneOf(ratio: number): TabDropZone {
  if (ratio < 0.25) return "before";
  if (ratio > 0.75) return "after";
  return "inside";
}

/** 指针在组矩形里靠近哪条边：边内侧 1/4 为分屏区，其余为 center（并入） */
export function groupZoneOf(
  rect: DOMRect,
  x: number,
  y: number,
): GroupDropZone {
  const px = (x - rect.left) / (rect.width || 1);
  const py = (y - rect.top) / (rect.height || 1);
  const d = [px, 1 - px, py, 1 - py];
  const min = Math.min(...d);
  if (min > EDGE_RATIO) return "center";
  if (min === d[0]) return "left";
  if (min === d[1]) return "right";
  if (min === d[2]) return "up";
  return "down";
}

/**
 * 把 react-dnd 连接器与自定义 ref 逻辑合成一个 ref 回调。
 * 依赖必须包含连接器本身：连接器换了要重新连接，但不能用裸箭头函数造成无限更新。
 */
export function useDndRef<T extends HTMLElement>(
  connect: unknown,
  ...extra: Array<(node: T | null) => void>
): (node: T | null) => void {
  const extraRef = useRef(extra);
  useEffect(() => {
    extraRef.current = extra;
  });
  return useCallback(
    (node: T | null) => {
      (connect as (el: T | null) => void)(node);
      for (const fn of extraRef.current) fn(node);
    },
    [connect],
  );
}
