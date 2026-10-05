import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

/**
 * PWA 相关能力：Service Worker 注册 / 新版本提示 / 安装到主屏。
 * 缓存策略本体在 public/sw.js（静态文件，浏览器直接下载，不进构建产物）。
 */

/** Chrome 的 beforeinstallprompt 事件未进入 TS DOM lib，这里自定义最小结构 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** 只在生产构建注册：dev 下 SW 会把 vite 的模块缓存住，热更新直接失效 */
export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (!import.meta.env.PROD) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((registration) => {
        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            // 页面已被旧 SW 控制 + 新 SW 安装完成 => 有新版本可用
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              toast("发现新版本", {
                description: "刷新后生效",
                action: { label: "刷新", onClick: () => applyUpdate(installing) },
              });
            }
          });
        });
      })
      .catch((error: unknown) => {
        console.warn("[pwa] service worker 注册失败", error);
      });
  });
}

/** 让等待中的新 SW 立即接管页面，并刷新一次 */
function applyUpdate(worker: ServiceWorker) {
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloaded) return;
    reloaded = true;
    window.location.reload();
  });
  worker.postMessage({ type: "SKIP_WAITING" });
}

/** 「安装到主屏」按钮用：浏览器判定可安装时才会拿到 prompt 事件 */
export function usePwaInstall() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      // 阻止浏览器默认的迷你信息条，改由顶栏按钮触发
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setPromptEvent(null);
      toast("已添加到主屏");
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    // 一个 prompt 事件只能用一次，无论用户是否接受
    setPromptEvent(null);
  }, [promptEvent]);

  return { canInstall: promptEvent !== null, install };
}