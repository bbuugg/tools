import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

type ThemeValue = "light" | "dark" | "system"

// 点击在三种状态间循环切换
const ORDER: ThemeValue[] = ["light", "dark", "system"]

const META: Record<ThemeValue, { label: string; Icon: typeof Sun }> = {
  light: { label: "浅色", Icon: Sun },
  dark: { label: "深色", Icon: Moon },
  system: { label: "跟随系统", Icon: Monitor },
}

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const current: ThemeValue =
    theme === "light" || theme === "dark" || theme === "system"
      ? theme
      : "system"
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]
  const { label, Icon } = META[current]
  const nextLabel = META[next].label

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`当前主题：${label}，点击切换到${nextLabel}`}
      title={`当前：${label} · 点击切换到${nextLabel}`}
      onClick={() => setTheme(next)}
    >
      <Icon className="size-4" />
      <span className="sr-only">切换主题</span>
    </Button>
  )
}
