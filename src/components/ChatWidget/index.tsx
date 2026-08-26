import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import './index.css';

/**
 * AgentChat —— 把 AgentPlugin SDK 挂载进壳子后台页面的可复用组件。
 *
 * - SDK 以 UMD 形式放在 /public/vendor/agent-plugin/agent-plugin.umd.js，
 *   通过 <script> 动态引入（全局变量 AgentPlugin），无需在壳子安装其依赖。
 * - 采用「embedded 模式」：把聊天 UI 填充到本组件的容器里（而非浮动窗）。
 * - SDK 是无状态的，会话持久化 / 访客 ID / 认证令牌等「宿主层」职责在这里完成：
 *   · authToken 取壳子登录态（localStorage 的 shell_token）
 *   · conversationId / guestId 存入 sessionStorage，刷新/离开返回后能续接
 * - 主题双向同步：init 传入宿主当前主题；宿主切换 → setTheme 下发，
 *   助手内切换 → onThemeChange 回写 next-themes。
 *
 * 接口域名与智能体 ID 通过 props 覆盖，默认读取环境变量
 * VITE_AGENT_SERVER_URL / VITE_AGENT_ID（在 web/.env.<mode> 中配置）。
 */

// ── AgentPlugin UMD 全局的最小类型声明（SDK 仓库不带 TS 类型） ──
/** SDK 主题枚举：亮色 / 暗色 / 跟随系统（与 next-themes 的取值一致） */
type AgentTheme = "light" | "dark" | "system"
interface AgentChatInstance {
    newConversation: () => void
    destroy: () => void
    setMobile: (mobile: boolean) => void
    setTheme: (theme: AgentTheme) => void
}
interface AgentInitOptions {
    serverUrl: string
    agentId: string
    container?: string | HTMLElement
    conversationId?: string | null
    authToken?: string | null
    guestId?: string
    mobile?: boolean
    theme?: AgentTheme
    onConversationIdChange?: (id: string | null) => void
    onStatusChange?: (status: string) => void
    onThemeChange?: (theme: AgentTheme) => void
}
interface AgentPluginGlobal {
    init: (options: AgentInitOptions) => Promise<AgentChatInstance>
}
declare global {
    interface Window {
        AgentPlugin?: AgentPluginGlobal
    }
}

const UMD_SRC = "https://www.codeemo.cn/sdk/v0.0.1/agent-plugin.umd.js?v=0.1"

// TODO: 在 web/.env / .env.test / .env.production 中填入真实值
const AGENT_SERVER_URL =
    import.meta.env.VITE_AGENT_SERVER_URL ?? "https://your-agent-api.example.com"
const AGENT_ID = import.meta.env.VITE_AGENT_ID ?? "your-agent-uuid"

const CONV_KEY = "agent_chat_conversation_id"
const GUEST_KEY = "agent_chat_guest_id"

/** 动态加载 UMD；保证只注入一次 <script> */
function loadUmd(): Promise<void> {
    if (typeof window === "undefined") return Promise.resolve()
    if (window.AgentPlugin) return Promise.resolve()

    const existing = document.querySelector<HTMLScriptElement>(
        `script[src="${UMD_SRC}"]`,
    )
    if (existing) {
        return new Promise<void>((resolve, reject) => {
            if (window.AgentPlugin) return resolve()
            existing.addEventListener("load", () => resolve())
            existing.addEventListener("error", () =>
                reject(new Error(`Failed to load ${UMD_SRC}`)),
            )
        })
    }

    return new Promise<void>((resolve, reject) => {
        const el = document.createElement("script")
        el.src = UMD_SRC
        el.async = true
        el.onload = () => resolve()
        el.onerror = () => reject(new Error(`Failed to load ${UMD_SRC}`))
        document.head.appendChild(el)
    })
}

/** 归一化主题值：非法值回退到 system */
function normalizeTheme(t: string | undefined | null): AgentTheme {
    return t === "light" || t === "dark" || t === "system" ? t : "system"
}

/** 生成并持久化匿名访客 ID */
function getGuestId(): string {
    let id = sessionStorage.getItem(GUEST_KEY)
    if (!id) {
        id =
            crypto.randomUUID?.() ??
            `g_${Date.now()}_${Math.random().toString(36).slice(2)}`
        sessionStorage.setItem(GUEST_KEY, id)
    }
    return id
}

export interface AgentChatProps {
    serverUrl?: string
    agentId?: string
    className?: string
}

export default function AgentChat({
    serverUrl = AGENT_SERVER_URL,
    agentId = AGENT_ID,
}: AgentChatProps) {
    const instanceRef = useRef<AgentChatInstance | null>(null)
    const isMobile = useIsMobile()
    const { theme, setTheme } = useTheme()

    // init() 是异步的，闭包里捕获的值在 resolve 时可能已过期；
    // 用 ref 让异步回调总能拿到最新值（同 ainav 的做法）。
    const isMobileRef = useRef(isMobile)
    isMobileRef.current = isMobile
    const themeRef = useRef(theme)
    themeRef.current = theme
    // next-themes 的 setTheme 内部依赖 theme 状态（useCallback([theme])），
    // 每次切主题都会生成新引用；绝不能进 init effect 的依赖数组，
    // 否则切一次主题就会 destroy + 重新 init（重新请求 agent 接口）。
    const setThemeRef = useRef(setTheme)
    setThemeRef.current = setTheme

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                await loadUmd()
                if (cancelled) return
                if (!window.AgentPlugin) return

                const handle = await window.AgentPlugin.init({
                    serverUrl,
                    agentId,
                    conversationId: sessionStorage.getItem(CONV_KEY),
                    guestId: getGuestId(),
                    mobile: isMobileRef.current,
                    // 初始主题与宿主保持一致，避免先闪一下默认亮色
                    theme: normalizeTheme(themeRef.current),
                    onConversationIdChange: (id: string | null) => {
                        if (id) sessionStorage.setItem(CONV_KEY, id)
                        else sessionStorage.removeItem(CONV_KEY)
                    },
                    // 聊天助手内切换主题 → 同步到宿主（next-themes 会写入 localStorage 并切换 class）
                    onThemeChange: (t: AgentTheme) => {
                        setThemeRef.current(t)
                    },
                })

                if (cancelled) {
                    handle.destroy()
                    return
                }
                instanceRef.current = handle
                // init 异步期间宿主主题 / 视口可能已变化，用最新值补一次同步
                handle.setTheme(normalizeTheme(themeRef.current))
                handle.setMobile(isMobileRef.current)
            } catch (e) {
                if (!cancelled) {
                    console.error("[AgentChat] SDK 初始化失败", e)
                }
            }
        })()

        return () => {
            cancelled = true
            instanceRef.current?.destroy()
            instanceRef.current = null
        }
    }, [serverUrl, agentId])

    // ── 视口变化时动态切换 mobile / 桌面模式 ──
    useEffect(() => {
        instanceRef.current?.setMobile(isMobile)
    }, [isMobile])

    // ── 宿主主题变化 → 同步到聊天助手（助手内切换则由 onThemeChange 反向同步） ──
    useEffect(() => {
        instanceRef.current?.setTheme(normalizeTheme(theme))
    }, [theme])

    return (
        <></>
    )
}
