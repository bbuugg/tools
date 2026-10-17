import { useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Wrench, ChevronDown, Search } from "lucide-react"
import { TOOL_CATEGORIES } from "@/lib/routes"
import { GithubLink } from "@/components/github-link"
import { InstallButton } from "@/components/install-button"
import { ModeToggle } from "@/components/mode-toggle"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

export function AppSidebar() {
  const location = useLocation()
  const [query, setQuery] = useState("")

  const filteredCategories = useMemo(() => {
    if (!query.trim()) return TOOL_CATEGORIES
    const q = query.toLowerCase()
    return TOOL_CATEGORIES.map((cat) => ({
      ...cat,
      tools: cat.tools.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q),
      ),
    })).filter((cat) => cat.tools.length > 0)
  }, [query])

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Wrench className="size-4" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold">开发者工具</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* 搜索框 - 放在 Header 中始终置顶，折叠为图标时隐藏 */}
        <div className="relative group-data-[collapsible=icon]:hidden">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <SidebarInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索工具…"
            className="pl-8"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* 工具分类列表 - 每组支持折叠 */}
        {filteredCategories.map((category) => (
          <Collapsible
            key={category.name}
            defaultOpen
            className="group/collapsible"
          >
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                  {category.name}
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {category.tools.map((tool) => {
                      const Icon = tool.icon
                      const active = location.pathname === tool.href
                      return (
                        <SidebarMenuItem key={tool.href}>
                          <SidebarMenuButton
                            asChild
                            isActive={active}
                            tooltip={tool.title}
                          >
                            <Link to={tool.href}>
                              <Icon />
                              <span>{tool.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
      {/* 底部固定区：收起/展开 + 安装 / GitHub / 主题；折叠为图标栏时只留展开按钮 */}
      <SidebarFooter className="flex-row flex-wrap items-center gap-1 [&_[data-slot=button]:hover]:bg-sidebar-accent [&_[data-slot=button]:hover]:text-sidebar-accent-foreground">
        <SidebarTrigger className="size-9 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8" />
        <div className="ml-auto flex items-center gap-1 group-data-[collapsible=icon]:hidden">
          <InstallButton />
          <GithubLink />
          <ModeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
