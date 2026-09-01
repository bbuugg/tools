import { useEffect, useRef } from "react";
import { MoreHorizontal, RotateCw, Trash2, X } from "lucide-react";
import { useTabs } from "@/components/layout/tabs-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/** header 下方的多标签栏：切换 / 中键关闭 / 更多操作 */
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
        className="relative flex min-w-0 flex-1 items-center gap-1 overflow-x-auto"
      >
        {tabs.map((tab) => {
          const Icon = tab.meta.icon;
          return (
            <div
              key={tab.path}
              ref={(el) => {
                if (el) itemRefs.current.set(tab.path, el);
                else itemRefs.current.delete(tab.path);
              }}
              role="tab"
              aria-selected={tab.active}
              tabIndex={tab.active ? 0 : -1}
              title={tab.meta.description || tab.meta.title}
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
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
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
          );
        })}
      </div>
      <TabBarMenu />
    </div>
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
