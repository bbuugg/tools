import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, ChevronDown } from "lucide-react";
import { TOOL_CATEGORIES } from "@/lib/tool-categories";

export default function Sidebar() {
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [collapsedCats, setCollapsedCats] = useState<Set<string>>(new Set());

  const filteredCategories = useMemo(() => {
    if (!query.trim()) return TOOL_CATEGORIES;
    const q = query.toLowerCase();
    return TOOL_CATEGORIES.map((cat) => ({
      ...cat,
      tools: cat.tools.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      ),
    })).filter((cat) => cat.tools.length > 0);
  }, [query]);

  const toggleCategory = (name: string) => {
    setCollapsedCats((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 bg-white md:flex md:flex-col">
      {/* 搜索框 */}
      <div className="shrink-0 p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索工具…"
            className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:bg-white focus:outline-none"
          />
        </div>
      </div>

      {/* 分类列表 - 可独立滚动 */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        {filteredCategories.length === 0 && (
          <p className="px-3 py-4 text-center text-sm text-gray-400">
            未找到匹配的工具
          </p>
        )}
        {filteredCategories.map((category) => {
          const collapsed = collapsedCats.has(category.name);
          return (
            <div key={category.name} className="mb-1">
              <button
                onClick={() => toggleCategory(category.name)}
                className="flex w-full items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 transition-colors hover:bg-gray-50"
              >
                <ChevronDown
                  className={`size-3.5 transition-transform ${
                    collapsed ? "-rotate-90" : ""
                  }`}
                />
                {category.name}
                <span className="ml-auto text-gray-300">
                  ({category.tools.length})
                </span>
              </button>
              {!collapsed && (
                <div className="mb-1">
                  {category.tools.map((tool) => {
                    const Icon = tool.icon;
                    const active = location.pathname === tool.href;
                    return (
                      <Link
                        key={tool.href}
                        to={tool.href}
                        className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                          active
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon
                          className={`size-4 shrink-0 ${
                            active ? "text-primary" : "text-gray-400 group-hover:text-gray-600"
                          }`}
                        />
                        <span className="truncate">{tool.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
