import { useIsMobile } from "@/hooks/use-mobile";
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
 *
 * 接口域名与智能体 ID 通过 props 覆盖，默认读取环境变量
 * VITE_AGENT_SERVER_URL / VITE_AGENT_ID（在 web/.env.<mode> 中配置）。
 */

// ── AgentPlugin UMD 全局的最小类型声明（SDK 仓库不带 TS 类型） ──
interface AgentChatInstance {
    newConversation: () => void
    destroy: () => void
    setMobile: (mobile: boolean) => void
}
interface AgentInitOptions {
    serverUrl: string
    agentId: string
    container?: string | HTMLElement
    conversationId?: string | null
    authToken?: string | null
    guestId?: string
    mobile?: boolean
    onConversationIdChange?: (id: string | null) => void
    onStatusChange?: (status: string) => void
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
                    mobile: isMobile,
                    onConversationIdChange: (id: string | null) => {
                        if (id) sessionStorage.setItem(CONV_KEY, id)
                        else sessionStorage.removeItem(CONV_KEY)
                    },
                })

                if (cancelled) {
                    handle.destroy()
                    return
                }
                instanceRef.current = handle
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

    return (
        <></>
    )
}
