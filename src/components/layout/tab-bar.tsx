import { useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  ChevronsLeft,
  ChevronsRight,
  Link2,
  MoreHorizontal,
  RotateCw,
  Trash2,
  X,
} from "lucide-react";
import { useTabs } from "@/components/layout/tabs-context";
import type { TabItem } from "@/components/layout/tabs-context";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/** header 下方的多标签栏：切换 / 中键关闭 / 右键菜单 / 更多操作 */
export function TabBar() {
  const { tabs, activePath, activate, close } = useTabs();
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLDivElement>());

  // 激活的标签始终滚动到可视区域内
  useEffect(() => {
    const list = listRef.current;
    const item = itemRefs.current.get(activePath);
    if (!list || !item) return;
    const left = item.offsetLeft;
    const right = left + item.offsetWidth;
    if (left < list.scrollLeft) {
      list.scrollLeft = Math.max(0, left - 8);
    } else if (right > list.scrollLeft + list.clientWidth) {
      list.scrollLeft = right - list.clientWidth + 8;
    }
  }, [activePath, tabs.length]);

  return (
    <div className="flex h-11 items-center gap-2 border-b border-border/60 px-2 sm:px-3">
      <div
        ref={listRef}
        role="tablist"
        aria-label="已打开的工具标签"
        className="relative flex min-w-0 flex-1 items-center gap-1 overflow-x-auto no-scrollbar"
      >
        {tabs.map((tab) => {
          const Icon = tab.meta.icon;
          return (
            <ContextMenu key={tab.path}>
              <ContextMenuTrigger asChild>
                <div
                  ref={(el) => {
                    if (el) itemRefs.current.set(tab.path, el);
                    else itemRefs.current.delete(tab.path);
                  }}
                  role="tab"
                  aria-selected={tab.active}
                  aria-haspopup="menu"
                  tabIndex={tab.active ? 0 : -1}
                  title={`${tab.meta.title}（右键查看更多操作）`}
                  onClick={() => activate(tab.path)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      activate(tab.path);
                    }
                  }}
                  onAuxClick={(e) => {
                    // 鼠标中键关闭
                    if (e.button === 1) {
                      e.preventDefault();
                      close(tab.path);
                    }
                  }}
                  className={cn(
                    "group flex h-8 max-w-52 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg pl-2.5 pr-1.5 text-sm transition-colors select-none",
                    tab.active
                      ? "bg-accent font-medium text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground data-[state=open]:bg-accent/70 data-[state=open]:text-foreground",
                  )}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="truncate">{tab.meta.title}</span>
                  {!tab.pinned && (
                    <button
                      type="button"
                      aria-label={`关闭 ${tab.meta.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        close(tab.path);
                      }}
                      className="ml-0.5 flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
              </ContextMenuTrigger>
              <TabContextMenu tab={tab} />
            </ContextMenu>
          );
        })}
      </div>
      <TabBarMenu />
    </div>
  );
}

/** 复制指定路径的完整页面地址到剪贴板 */
async function copyPageLink(path: string) {
  const url = window.location.origin + path;
  try {
    await navigator.clipboard.writeText(url);
    toast.success("已复制页面链接", { description: url });
  } catch {
    // 非安全上下文 / 用户拒绝授权时降级为手动复制
    toast.error("复制失败", { description: "浏览器拒绝了剪贴板访问" });
  }
}

/** 单个标签的右键菜单 */
function TabContextMenu({ tab }: { tab: TabItem }) {
  const { tabs, reload, close, closeOthers, closeLeft, closeRight, closeAll } =
    useTabs();

  const index = tabs.findIndex((t) => t.path === tab.path);
  const closable = tabs.filter((t) => !t.pinned);
  const hasLeft = tabs.slice(0, index).some((t) => !t.pinned);
  const hasRight = tabs.slice(index + 1).some((t) => !t.pinned);
  const othersCount = closable.length - (tab.pinned ? 0 : 1);

  return (
    <ContextMenuContent className="w-48">
      <ContextMenuLabel className="truncate font-medium">
        {tab.meta.title}
      </ContextMenuLabel>
      <ContextMenuSeparator />
      <ContextMenuItem onSelect={() => reload(tab.path)}>
        <RotateCw />
        重新加载
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => copyPageLink(tab.path)}>
        <Link2 />
        复制页面链接
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        disabled={tab.pinned}
        onSelect={() => close(tab.path)}
      >
        <X />
        关闭
      </ContextMenuItem>
      <ContextMenuItem
        disabled={othersCount <= 0}
        onSelect={() => closeOthers(tab.path)}
      >
        <X />
        关闭其他标签
      </ContextMenuItem>
      <ContextMenuItem disabled={!hasLeft} onSelect={() => closeLeft(tab.path)}>
        <ChevronsLeft />
        关闭左侧标签
      </ContextMenuItem>
      <ContextMenuItem
        disabled={!hasRight}
        onSelect={() => closeRight(tab.path)}
      >
        <ChevronsRight />
        关闭右侧标签
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem
        variant="destructive"
        disabled={closable.length === 0}
        onSelect={closeAll}
      >
        <Trash2 />
        关闭全部标签
      </ContextMenuItem>
    </ContextMenuContent>
  );
}

function TabBarMenu() {
  const { activePath, reload, closeOthers, closeAll } = useTabs();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="标签操作"
          className="shrink-0"
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onSelect={() => reload(activePath)}>
          <RotateCw />
          重新加载当前标签
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => copyPageLink(activePath)}>
          <Link2 />
          复制当前页面链接
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => closeOthers(activePath)}>
          <X />
          关闭其他标签
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={closeAll}>
          <Trash2 />
          关闭全部标签
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
