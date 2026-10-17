import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/lib/pwa";

/** 顶栏「安装到主屏」按钮：不可安装时不渲染 */
export function InstallButton() {
  const { canInstall, install } = usePwaInstall();

  if (!canInstall) return null;

  return (
    <Button
      variant="ghost"
      size="icon-lg"
      aria-label="安装到主屏"
      title="安装到主屏"
      onClick={() => void install()}
    >
      <Download className="size-[18px]" />
      <span className="sr-only">安装到主屏</span>
    </Button>
  );
}