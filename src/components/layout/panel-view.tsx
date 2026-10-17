import {
  Fragment,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefCallback,
  type RefObject,
} from "react";
import { useDrag, useDragLayer, useDrop } from "react-dnd";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  GripVertical,
  Layers,
  Link2,
  MoreHorizontal,
  RefreshCw,
  RotateCw,
  Split,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import {
  PANEL_TAB_TYPE,
  groupZoneOf,
  horizontalRatio,
  useDndRef,
  zoneOf,
  type GroupDropZone,
  type PanelTabDragItem,
  type TabDropZone,
} from "@/components/layout/dnd-context";
import {
  getPanelState,
  groupLabel,
  mergeAllGroups,
  moveGroup,
  moveTab,
  panelGroupIds,
  reloadTab,
  reorderTab,
  resizeSplit,
  splitTab,
  usePanelState,
  type PanelState,
} from "@/components/layout/panel-store";
import {
  allTabKeys,
  activateTab,
  closeGroup,
  closeLeft,
  closeOthers,
  closeRight,
  closeTab,
  focusGroup,
  tabOwners,
  closeAllTabs,
} from "@/components/layout/panel-store";
import {
  panelBodies,
  panelBodiesVersion,
  registerPanelBody,
  subscribePanelBodies,
} from "@/components/layout/panel-bodies";
import {
  getTabRuntime,
  useTabRuntimeVersion,
} from "@/components/layout/tab-runtime";
import { cn } from "@/lib/utils";
import { HOME_PATH, getPageComponent, resolveTabMeta } from "@/lib/tabs";
import type { PaneNode, PaneSplit, SplitDirectionInput } from "@/lib/pane-layout";

const TAB_STRIP_HEIGHT = "h-10";

// ---------------------------------------------------------------------------
// 分隔条
// ---------------------------------------------------------------------------

function useDragResize<C>({
  axis,
  onStart,
  onMove,
}: {
  axis: "x" | "y";
  onStart?: (e: ReactPointerEvent<HTMLDivElement>) => C | null;
  onMove: (delta: number, ctx: C) => void;
}): (e: ReactPointerEvent<HTMLDivElement>) => void {
  const latest = useRef({ onStart, onMove });
  useEffect(() => {
    latest.current = { onStart, onMove };
  });

  return useCallback(
    (e: ReactPointerEvent<HTMLDivElement>): void => {
      if (!e.isPrimary) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;

      e.preventDefault();
      const handle = e.currentTarget;
      const pointerId = e.pointerId;
      const start = axis === "x" ? e.clientX : e.clientY;
      const ctx = latest.current.onStart?.(e);
      if (ctx === null) return;

      const move = (ev: PointerEvent): void => {
        latest.current.onMove(
          (axis === "x" ? ev.clientX : ev.clientY) - start,
          ctx as C,
        );
      };

      let done = false;
      const cleanup = (): void => {
        if (done) return;
        done = true;
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", cleanup);
        window.removeEventListener("pointercancel", cleanup);
        window.removeEventListener("blur", cleanup);
        try {
          handle.releasePointerCapture(pointerId);
        } catch {
          // 指针已被浏览器释放
        }
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        document.body.style.touchAction = "";
      };

      try {
        handle.setPointerCapture(pointerId);
      } catch {
        // 合成事件没有真实指针，退化为 window 监听
      }
      document.body.style.cursor = axis === "x" ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";
      document.body.style.touchAction = "none";
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", cleanup);
      window.addEventListener("pointercancel", cleanup);
      window.addEventListener("blur", cleanup);
    },
    [axis],
  );
}

function Splitter({
  split,
  index,
  containerRef,
}: {
  split: PaneSplit;
  index: number;
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  const horizontal = split.direction === "row";

  const onPointerDown = useDragResize<{
    total: number;
    totalWeight: number;
    startSizes: number[];
    minWeight: number;
  }>({
    axis: horizontal ? "x" : "y",
    onStart: () => {
      const container = containerRef.current;
      if (!container) return null;
      const rect = container.getBoundingClientRect();
      const total = horizontal ? rect.width : rect.height;
      if (total <= 0) return null;
      const totalWeight = split.sizes.reduce((a, b) => a + b, 0) || 1;
      return {
        total,
        totalWeight,
        startSizes: [...split.sizes],
        minWeight: totalWeight * 0.06,
      };
    },
    onMove: (delta, drag) => {
      const deltaWeight = (delta / drag.total) * drag.totalWeight;
      const a = drag.startSizes[index] + deltaWeight;
      const b = drag.startSizes[index + 1] - deltaWeight;
      if (a < drag.minWeight || b < drag.minWeight) return;
      const next = [...drag.startSizes];
      next[index] = a;
      next[index + 1] = b;
      resizeSplit(split.id, next);
    },
  });

  return (
    <div
      role="separator"
      aria-orientation={horizontal ? "vertical" : "horizontal"}
      onPointerDown={onPointerDown}
      className={cn(
        "group/split relative z-10 shrink-0 touch-none select-none [-webkit-touch-callout:none]",
        horizontal
          ? "-mx-1 w-2 cursor-col-resize sm:-mx-0.5 sm:w-1"
          : "-my-1 h-2 cursor-row-resize sm:-my-0.5 sm:h-1",
      )}
    >
      <div
        className={cn(
          "absolute bg-border transition-colors group-hover/split:bg-primary/60",
          horizontal
            ? "inset-y-0 left-1/2 w-px -translate-x-1/2"
            : "inset-x-0 top-1/2 h-px -translate-y-1/2",
        )}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// 单个标签
// ---------------------------------------------------------------------------

function PanelTabItem({
  path,
  groupId,
  groupTabIds,
  index,
  active,
  canCloseGroup,
  onClose,
}: {
  path: string;
  groupId: string;
  groupTabIds: string[];
  index: number;
  active: boolean;
  canCloseGroup: boolean;
  onClose: (path: string) => void;
}) {
  const meta = resolveTabMeta(path);
  const Icon = meta.icon;
  const pinned = path === HOME_PATH;
  const elRef = useRef<HTMLDivElement | null>(null);
  const [zone, setZone] = useState<TabDropZone | null>(null);

  const [{ isDragging }, dragRef] = useDrag<
    PanelTabDragItem,
    void,
    { isDragging: boolean }
  >(
    () => ({
      type: PANEL_TAB_TYPE,
      item: { kind: "tab", path, fromGroupId: groupId },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [path, groupId],
  );

  const [{ isOver }, dropRef] = useDrop<
    PanelTabDragItem,
    void,
    { isOver: boolean }
  >(
    () => ({
      accept: PANEL_TAB_TYPE,
      drop: (item, monitor) => {
        if (monitor.didDrop()) return;
        setZone(null);

        if (item.kind === "group") {
          if (item.groupId && item.groupId !== groupId) {
            moveGroup(item.groupId, groupId, "center");
          }
          return;
        }
        if (item.path === path) return;

        const target = zoneOf(horizontalRatio(monitor, elRef.current));
        if (target === "inside") {
          if (item.fromGroupId === groupId) activateTab(item.path);
          else moveTab(item.path, groupId);
          return;
        }

        const state = getPanelState();
        const targetIndex =
          state.groups[groupId]?.tabIds.indexOf(path) ?? index;
        const at = Math.max(0, targetIndex) + (target === "after" ? 1 : 0);
        if (item.fromGroupId === groupId) reorderTab(groupId, item.path, at);
        else moveTab(item.path, groupId, at);
      },
      hover: (item, monitor) => {
        if (item.path === path) {
          setZone(null);
          return;
        }
        setZone(zoneOf(horizontalRatio(monitor, elRef.current)));
      },
      collect: (monitor) => ({ isOver: monitor.isOver() }),
    }),
    [path, groupId, index],
  );

  const setRef = useDndRef<HTMLDivElement>(dragRef, dropRef, (node) => {
    elRef.current = node;
  });

  const visibleZone = isOver ? zone : null;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setRef}
          role="tab"
          aria-selected={active}
          tabIndex={active ? 0 : -1}
          title={meta.title}
          onClick={() => activateTab(path)}
          onPointerDown={(e) => e.stopPropagation()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              activateTab(path);
            }
          }}
          onAuxClick={(e) => {
            if (e.button === 1 && !pinned) {
              e.preventDefault();
              onClose(path);
            }
          }}
          className={cn(
            "group/tab relative flex h-7 max-w-52 min-w-20 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-sm transition-colors select-none",
            active
              ? "bg-background font-medium text-foreground shadow-sm ring-1 ring-border/70"
              : "text-muted-foreground hover:bg-background/70 hover:text-foreground data-[state=open]:bg-background/80 data-[state=open]:text-foreground",
            isDragging && "opacity-40",
          )}
        >
          <Icon className="size-3.5 shrink-0" />
          <span className="truncate">{meta.title}</span>
          {!pinned && (
            <button
              type="button"
              aria-label={`关闭 ${meta.title}`}
              onClick={(e) => {
                e.stopPropagation();
                onClose(path);
              }}
              className="ml-0.5 flex size-4 shrink-0 items-center justify-center rounded text-muted-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          )}

          {visibleZone === "inside" ? (
            <span className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-primary" />
          ) : visibleZone ? (
            <span
              className={cn(
                "pointer-events-none absolute inset-y-0 w-0.5 bg-primary",
                visibleZone === "before" ? "-left-1" : "-right-1",
              )}
            />
          ) : null}
        </div>
      </ContextMenuTrigger>

      <TabContextMenu
        path={path}
        groupId={groupId}
        groupTabIds={groupTabIds}
        index={index}
        pinned={pinned}
        canCloseGroup={canCloseGroup}
      />
    </ContextMenu>
  );
}

async function copyPageLink(path: string) {
  const url = window.location.origin + path;
  try {
    await navigator.clipboard.writeText(url);
    toast.success("已复制页面链接", { description: url });
  } catch {
    toast.error("复制失败", { description: "浏览器拒绝了剪贴板访问" });
  }
}

function TabContextMenu({
  path,
  groupId,
  groupTabIds,
  index,
  pinned,
  canCloseGroup,
}: {
  path: string;
  groupId: string;
  groupTabIds: string[];
  index: number;
  pinned: boolean;
  canCloseGroup: boolean;
}) {
  const state = usePanelState();
  const meta = resolveTabMeta(path);
  const otherGroups = panelGroupIds(state).filter((id) => id !== groupId);
  const hasLeft = groupTabIds
    .slice(0, index)
    .some((key) => key !== HOME_PATH);
  const hasRight = groupTabIds
    .slice(index + 1)
    .some((key) => key !== HOME_PATH);
  const hasOthers = groupTabIds.some(
    (key) => key !== path && key !== HOME_PATH,
  );
  const groupHasClosable = groupTabIds.some((key) => key !== HOME_PATH);
  const splittable = groupTabIds.length > 1;

  const split = (direction: SplitDirectionInput): void => {
    if (!splittable) return;
    splitTab(path, groupId, direction);
  };

  return (
    <ContextMenuContent className="w-52">
      <ContextMenuLabel className="truncate font-medium">
        {meta.title}
      </ContextMenuLabel>
      <ContextMenuSeparator />
      <ContextMenuItem onSelect={() => reloadTab(path)}>
        <RotateCw />
        重新加载
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => void copyPageLink(path)}>
        <Link2 />
        复制页面链接
      </ContextMenuItem>

      {(splittable || otherGroups.length > 0) && <ContextMenuSeparator />}
      {splittable && (
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Split />
            拆分到新分组
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onSelect={() => split("up")}>
              <ArrowUp />
              向上拆分
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => split("down")}>
              <ArrowDown />
              向下拆分
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => split("left")}>
              <ArrowLeft />
              向左拆分
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => split("right")}>
              <ArrowRight />
              向右拆分
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      )}
      {otherGroups.length > 0 && (
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Layers />
            移动到分组
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {otherGroups.map((id) => (
              <ContextMenuItem key={id} onSelect={() => moveTab(path, id)}>
                {groupLabel(state, id)}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
      )}

      <ContextMenuSeparator />
      <ContextMenuItem disabled={pinned} onSelect={() => closeTab(path)}>
        <X />
        关闭
      </ContextMenuItem>
      <ContextMenuItem
        disabled={!hasOthers}
        onSelect={() => closeOthers(path)}
      >
        关闭分组内其他标签
      </ContextMenuItem>
      <ContextMenuItem disabled={!hasLeft} onSelect={() => closeLeft(path)}>
        关闭分组内左侧标签
      </ContextMenuItem>
      <ContextMenuItem disabled={!hasRight} onSelect={() => closeRight(path)}>
        关闭分组内右侧标签
      </ContextMenuItem>
      {canCloseGroup && groupHasClosable && (
        <>
          <ContextMenuSeparator />
          <ContextMenuItem
            variant="destructive"
            onSelect={() => closeGroup(groupId)}
          >
            <Trash2 />
            关闭整个分组
          </ContextMenuItem>
        </>
      )}
    </ContextMenuContent>
  );
}

// ---------------------------------------------------------------------------
// 一个面板分组
// ---------------------------------------------------------------------------

function PanelGroupView({ groupId }: { groupId: string }) {
  const state = usePanelState();
  const group = state.groups[groupId];
  const isActiveGroup = state.activeGroupId === groupId;
  const tabIds = group?.tabIds ?? [];
  const activeKey = group?.activeTabId ?? null;
  const groupCount = panelGroupIds(state).length;
  const canCloseGroup = groupCount > 1;

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const [bodyZone, setBodyZone] = useState<GroupDropZone | null>(null);

  // 活动标签滚入可视区
  useEffect(() => {
    const container = tabsRef.current;
    if (!container || !activeKey) return;
    const el = Array.from(
      container.querySelectorAll<HTMLElement>("[data-tab-path]"),
    ).find((node) => node.dataset.tabPath === activeKey);
    el?.scrollIntoView({ inline: "nearest", block: "nearest" });
  }, [activeKey]);

  // 竖向滚轮 → 标签条横向滚动
  useEffect(() => {
    const list = tabsRef.current;
    if (!list) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      const atLeft = list.scrollLeft <= 1;
      const atRight =
        list.scrollLeft + list.clientWidth >= list.scrollWidth - 1;
      if ((e.deltaY < 0 && atLeft) || (e.deltaY > 0 && atRight)) return;
      e.preventDefault();
      list.scrollLeft += e.deltaY;
    };
    list.addEventListener("wheel", onWheel, { passive: false });
    return () => list.removeEventListener("wheel", onWheel);
  }, []);

  const [, groupDragRef] = useDrag<PanelTabDragItem, void>(
    () => ({
      type: PANEL_TAB_TYPE,
      item: {
        kind: "group",
        path: tabIds[0] ?? "",
        fromGroupId: groupId,
        groupId,
      },
      canDrag: tabIds.length > 0,
    }),
    [groupId, tabIds.length, tabIds[0]],
  );

  // 标签条空白区域：标签拖进来 = 并入本组；整组拖进来 = 合并
  const [, stripDropRef] = useDrop<PanelTabDragItem, void, { isOver: boolean }>(
    () => ({
      accept: PANEL_TAB_TYPE,
      drop: (item, monitor) => {
        if (monitor.didDrop()) return;
        if (item.kind === "group") {
          if (item.groupId && item.groupId !== groupId) {
            moveGroup(item.groupId, groupId, "center");
          }
          return;
        }
        if (item.fromGroupId === groupId) return;
        moveTab(item.path, groupId);
      },
      collect: (monitor) => ({ isOver: monitor.isOver() }),
    }),
    [groupId],
  );

  const [{ isOver, canDrop }, bodyDropRef] = useDrop<
    PanelTabDragItem,
    void,
    { isOver: boolean; canDrop: boolean }
  >(
    () => ({
      accept: PANEL_TAB_TYPE,
      drop: (item, monitor) => {
        if (monitor.didDrop()) return;
        setBodyZone(null);
        const rect = bodyRef.current?.getBoundingClientRect();
        const offset = monitor.getClientOffset();
        if (!rect || !offset) return;
        const zone = groupZoneOf(rect, offset.x, offset.y);

        if (item.kind === "group") {
          if (item.groupId && item.groupId !== groupId) {
            moveGroup(item.groupId, groupId, zone);
          }
          return;
        }
        if (zone === "center") {
          moveTab(item.path, groupId);
        } else {
          splitTab(item.path, groupId, zone);
        }
      },
      hover: (item, monitor) => {
        if (item.kind === "group" && item.groupId === groupId) {
          setBodyZone(null);
          return;
        }
        const rect = bodyRef.current?.getBoundingClientRect();
        const offset = monitor.getClientOffset();
        if (!rect || !offset) return;
        setBodyZone(groupZoneOf(rect, offset.x, offset.y));
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [groupId],
  );

  const tabsSetRef = useDndRef<HTMLDivElement>(stripDropRef, (node) => {
    tabsRef.current = node;
  });
  const bodySetRef = useDndRef<HTMLDivElement>(bodyDropRef, (node) => {
    bodyRef.current = node;
    registerPanelBody(groupId, node);
  });

  const visibleZone = isOver && canDrop ? bodyZone : null;

  return (
    <div
      className={cn(
        "relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
        isActiveGroup ? "bg-background" : "bg-muted/25",
      )}
      onPointerDown={() => focusGroup(groupId)}
    >
      <div
        className={cn(
          "relative z-10 flex shrink-0 items-center gap-1 border-b border-border/60 px-1.5",
          TAB_STRIP_HEIGHT,
          isActiveGroup ? "bg-muted/45" : "bg-muted/25",
        )}
      >
        <span
          ref={groupDragRef as unknown as RefCallback<HTMLSpanElement>}
          role="button"
          aria-label="拖动移动整个分组"
          title="拖动移动整个分组"
          className="flex h-6 w-4 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground/50 transition-colors hover:bg-accent hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="size-3.5" />
        </span>

        <div
          ref={tabsSetRef}
          role="tablist"
          aria-label={`${groupLabel(state, groupId)}的标签`}
          className="flex h-full min-w-0 flex-1 items-center gap-1 overflow-x-auto no-scrollbar"
        >
          {tabIds.map((path, index) => (
            <span key={path} data-tab-path={path} className="flex shrink-0">
              <PanelTabItem
                path={path}
                groupId={groupId}
                groupTabIds={tabIds}
                index={index}
                active={path === activeKey}
                canCloseGroup={canCloseGroup}
                onClose={closeTab}
              />
            </span>
          ))}
        </div>

        {tabIds.length > 1 && (
          <TabsOverflowMenu groupId={groupId} activeKey={activeKey} />
        )}
        <GroupMenu groupId={groupId} canCloseGroup={canCloseGroup} />
      </div>

      <div
        ref={bodySetRef}
        data-panel-body={groupId}
        className="relative min-h-0 flex-1"
      >
        {tabIds.length === 0 && (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            拖拽标签到这里
          </div>
        )}

        {visibleZone && (
          <div className="pointer-events-none absolute inset-0 z-20">
            {visibleZone === "center" ? (
              <div className="absolute inset-0 rounded-lg ring-2 ring-primary ring-inset" />
            ) : (
              <div
                className={cn(
                  "absolute rounded-lg bg-primary/15 ring-2 ring-primary ring-inset",
                  visibleZone === "left" && "inset-y-0 left-0 w-1/2",
                  visibleZone === "right" && "inset-y-0 right-0 w-1/2",
                  visibleZone === "up" && "inset-x-0 top-0 h-1/2",
                  visibleZone === "down" && "inset-x-0 bottom-0 h-1/2",
                )}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TabsOverflowMenu({
  groupId,
  activeKey,
}: {
  groupId: string;
  activeKey: string | null;
}) {
  const state = usePanelState();
  const tabIds = state.groups[groupId]?.tabIds ?? [];
  if (tabIds.length <= 1) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="本组全部标签"
          title="本组全部标签"
          className="shrink-0 text-muted-foreground"
        >
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          本组标签
        </DropdownMenuLabel>
        {tabIds.map((path) => {
          const meta = resolveTabMeta(path);
          const Icon = meta.icon;
          return (
            <DropdownMenuItem
              key={path}
              onSelect={() => activateTab(path)}
              className={cn(path === activeKey && "font-medium")}
            >
              <Icon />
              <span className="truncate">{meta.title}</span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function GroupMenu({
  groupId,
  canCloseGroup,
}: {
  groupId: string;
  canCloseGroup: boolean;
}) {
  const state = usePanelState();
  const group = state.groups[groupId];
  const activeKey = group?.activeTabId ?? null;
  const activeMeta = activeKey ? resolveTabMeta(activeKey) : null;
  const groupHasClosable = (group?.tabIds ?? []).some(
    (path) => path !== HOME_PATH,
  );
  const hasAnyClosable = allTabKeys(state).some((path) => path !== HOME_PATH);
  const otherGroups = panelGroupIds(state).filter((id) => id !== groupId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="分组操作"
          title="分组操作"
          className="shrink-0 text-muted-foreground"
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {activeKey && activeMeta && (
          <>
            <DropdownMenuLabel className="truncate text-xs text-muted-foreground">
              {activeMeta.title}
            </DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => reloadTab(activeKey)}>
              <RefreshCw />
              重新加载当前标签
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => void copyPageLink(activeKey)}
            >
              <Link2 />
              复制当前页面链接
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {otherGroups.length > 0 && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Layers />
              合并到分组
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {otherGroups.map((id) => (
                <DropdownMenuItem
                  key={id}
                  onSelect={() => moveGroup(groupId, id, "center")}
                >
                  {groupLabel(state, id)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        <DropdownMenuItem
          disabled={panelGroupIds(state).length <= 1}
          onSelect={mergeAllGroups}
        >
          <Layers />
          合并所有分组
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        {canCloseGroup && groupHasClosable && (
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => closeGroup(groupId)}
          >
            <Trash2 />
            关闭整个分组
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          variant="destructive"
          disabled={!hasAnyClosable}
          onSelect={closeAllTabs}
        >
          <Trash2 />
          关闭全部标签
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ---------------------------------------------------------------------------
// 内容层
// ---------------------------------------------------------------------------

interface TabSlot {
  left: number;
  top: number;
  width: number;
  height: number;
}

function sameSlots(
  a: Record<string, TabSlot>,
  b: Record<string, TabSlot>,
): boolean {
  const keys = Object.keys(b);
  if (Object.keys(a).length !== keys.length) return false;
  for (const key of keys) {
    const x = a[key];
    const y = b[key];
    if (!x) return false;
    if (
      x.left !== y.left ||
      x.top !== y.top ||
      x.width !== y.width ||
      x.height !== y.height
    ) {
      return false;
    }
  }
  return true;
}

/**
 * 所有标签内容在面板根部渲染一次，再按各组车身矩形绝对定位。
 * 标签换组只改坐标，不换 React 父节点，页面状态不会因拖拽而丢失。
 */
function PanelContentLayer({ state }: { state: PanelState }) {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const version = useSyncExternalStore(
    subscribePanelBodies,
    panelBodiesVersion,
    panelBodiesVersion,
  );
  useTabRuntimeVersion();
  const [slots, setSlots] = useState<Record<string, TabSlot>>({});

  const stateRef = useRef(state);
  useLayoutEffect(() => {
    stateRef.current = state;
  });

  const measure = useCallback((): void => {
    const layer = layerRef.current;
    if (!layer) return;
    const base = layer.getBoundingClientRect();
    const bodies = panelBodies();
    setSlots((prev) => {
      const next: Record<string, TabSlot> = {};
      for (const [path, owner] of tabOwners(stateRef.current)) {
        const rect = bodies.get(owner.groupId)?.getBoundingClientRect();
        if (rect && rect.width > 0 && rect.height > 0) {
          next[path] = {
            left: rect.left - base.left,
            top: rect.top - base.top,
            width: rect.width,
            height: rect.height,
          };
        } else if (prev[path]) {
          // 刚拆出的组还没量到矩形时沿用上一次落位，避免内容被卸载重挂
          next[path] = prev[path];
        }
      }
      return sameSlots(prev, next) ? prev : next;
    });
  }, []);

  // 每次提交后重量一遍：拆分 / 拖分隔条 / 页面尺寸变化都能覆盖到
  useLayoutEffect(measure);

  useLayoutEffect(() => {
    const observer = new ResizeObserver(() => measure());
    for (const el of panelBodies().values()) observer.observe(el);
    const onWindowResize = (): void => measure();
    window.addEventListener("resize", onWindowResize);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onWindowResize);
    };
  }, [measure, version]);

  const draggingTab = useDragLayer(
    (monitor) =>
      monitor.isDragging() && monitor.getItemType() === PANEL_TAB_TYPE,
  );

  const owners = tabOwners(state);
  // 按 path 固定顺序渲染：标签换组 / 换位只改定位，不在 DOM 里搬动节点，
  // 否则 Monaco 这类自带 DOM 观察器的编辑器会在节点被移出再插回时出问题。
  const paths = allTabKeys(state).sort();

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-0 z-0">
      {paths.map((path) => {
        const runtime = getTabRuntime(path);
        if (!runtime?.mounted) return null;
        const owner = owners.get(path);
        const slot = slots[path];
        const Page = getPageComponent(path);
        // 分组车身刚挂载、还没量到矩形时保持挂载并隐藏，绝不返回 null：
        // 卸载再挂载会丢掉页面状态，也会让编辑器在 StrictMode 下拿到已销毁的实例。
        const visible = !!owner?.active && !!slot;
        return (
          <div
            key={`${path}#${runtime.reloadKey}`}
            style={
              slot
                ? {
                    left: slot.left,
                    top: slot.top,
                    width: slot.width,
                    height: slot.height,
                  }
                : undefined
            }
            className={cn(
              "absolute overflow-hidden",
              draggingTab ? "pointer-events-none" : "pointer-events-auto",
            )}
            hidden={!visible}
            onPointerDown={() => {
              if (owner) focusGroup(owner.groupId);
            }}
          >
            <div className="h-full w-full overflow-auto overscroll-contain">
              <Suspense fallback={<TabLoading />}>
                <Page />
              </Suspense>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 布局树
// ---------------------------------------------------------------------------

function PaneNodeView({ node }: { node: PaneNode }): ReactNode {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const split = node.type === "split" ? node : null;
  const children: PaneNode[] = split ? split.children : [node];

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex min-h-0 min-w-0 flex-1 overflow-hidden",
        split && split.direction === "row" ? "flex-row" : "flex-col",
      )}
    >
      {children.map((child, i) => (
        <Fragment key={child.id}>
          <div
            style={{
              flexGrow: split ? (split.sizes[i] ?? 1) : 1,
              flexBasis: 0,
            }}
            className="flex min-h-0 min-w-0"
          >
            {child.type === "leaf" ? (
              <PanelGroupView groupId={child.groupId} />
            ) : (
              <PaneNodeView node={child} />
            )}
          </div>
          {split && i < children.length - 1 && (
            <Splitter split={split} index={i} containerRef={containerRef} />
          )}
        </Fragment>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// 根
// ---------------------------------------------------------------------------

export function PanelView() {
  const state = usePanelState();
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border/60 bg-muted/20">
      <PaneNodeView node={state.layout} />
      <PanelContentLayer state={state} />
    </div>
  );
}

function TabLoading() {
  return (
    <div className="flex h-full min-h-40 items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  );
}
