import { useEffect, useState } from "react"

/** 移动端断点（与 useSidebarCollapse / useResizableSidebar 保持一致） */
const MOBILE_BREAKPOINT = 768

/**
 * 响应式移动端检测 hook。
 *
 * - 初次渲染时根据 `window.innerWidth < 768` 判断
 * - 监听 `resize` 事件，视口宽度变化时实时更新
 * - SSR 安全（`window` 不存在时返回 `false`）
 *
 * @example
 * ```tsx
 * import { useIsMobile } from "@/hooks/use-is-mobile"
 *
 * function MyComponent() {
 *   const isMobile = useIsMobile()
 *   return <div>{isMobile ? "移动端" : "桌面端"}</div>
 * }
 * ```
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return window.innerWidth < MOBILE_BREAKPOINT
  })

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return isMobile
}
