import { useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Wrench } from "lucide-react"
import { TOOL_CATEGORIES } from "@/lib/routes"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

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
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">工具站</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* 搜索框 - 折叠为图标时隐藏 */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupContent>
            <SidebarInput
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索工具…"
            />
          </SidebarGroupContent>
        </SidebarGroup>
        {/* 工具分类列表 */}
        {filteredCategories.map((category) => (
          <SidebarGroup key={category.name}>
            <SidebarGroupLabel>{category.name}</SidebarGroupLabel>
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
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
