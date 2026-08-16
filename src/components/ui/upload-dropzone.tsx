"use client";

import { Upload } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

export interface UploadDropZoneProps {
  /** 接收通过选择/拖拽/粘贴得到的文件（已过滤） */
  onFiles: (files: File[]) => void;
  /** 原生 input 的 accept，例如 "image/*"、"image/gif"、".jpg,.jpeg" */
  accept?: string;
  /** 是否允许多选 */
  multiple?: boolean;
  /** 单文件最大字节数，超出会调用 onError */
  maxSize?: number;
  /** 自定义文件类型校验（用于拖拽/粘贴），默认接受所有 image/* */
  acceptsFile?: (file: File) => boolean;
  /** 校验失败时的回调（尺寸/类型错误） */
  onError?: (message: string) => void;
  className?: string;
  /** 自定义内容；不传时展示默认空状态 */
  children?: React.ReactNode;
  /** 默认空状态主提示 */
  emptyHint?: string;
  /** 默认空状态次提示 */
  emptySubHint?: string;
  /** 默认空状态图标 */
  icon?: React.ReactNode;
}

/**
 * 通用上传拖拽区域：
 * - 点击选择文件
 * - 拖拽上传
 * - 鼠标悬停时支持 Ctrl+V 粘贴上传（剪贴板中的图片/文件）
 */
export function UploadDropZone({
  onFiles,
  accept = "image/*",
  multiple = false,
  maxSize = 10 * 1024 * 1024,
  acceptsFile,
  onError,
  className,
  children,
  emptyHint = "点击选择、拖拽或悬停粘贴",
  emptySubHint = "支持 PNG, JPG, GIF, SVG, WebP",
  icon,
}: UploadDropZoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const hoveredRef = React.useRef(false);

  const isAccepted = React.useCallback(
    (file: File) => (acceptsFile ? acceptsFile(file) : file.type.startsWith("image/")),
    [acceptsFile],
  );

  const processFiles = React.useCallback(
    (fileList: FileList | File[]) => {
      const all = Array.from(fileList);
      const accepted: File[] = [];
      let sizeError = false;
      let typeError = false;
      for (const f of all) {
        if (!isAccepted(f)) {
          typeError = true;
          continue;
        }
        if (f.size > maxSize) {
          sizeError = true;
          continue;
        }
        accepted.push(f);
      }
      if (sizeError) onError?.(`文件大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`);
      if (typeError && accepted.length === 0) onError?.("不支持的文件类型");
      if (accepted.length > 0) onFiles(multiple ? accepted : [accepted[0]]);
    },
    [isAccepted, maxSize, multiple, onFiles, onError],
  );

  const handlePaste = React.useCallback(
    (e: ClipboardEvent) => {
      if (!hoveredRef.current) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === "file") {
          const f = items[i].getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length > 0) {
        e.preventDefault();
        processFiles(files);
      }
    },
    [processFiles],
  );

  React.useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const showDefault = !children;

  return (
    <div
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card text-center transition-colors",
        dragOver
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-accent",
        hovered && !dragOver && "border-primary/60 ring-2 ring-primary/15",
        className,
      )}
      onClick={() => inputRef.current?.click()}
      onMouseEnter={() => {
        setHovered(true);
        hoveredRef.current = true;
      }}
      onMouseLeave={() => {
        setHovered(false);
        hoveredRef.current = false;
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
      }}
    >
      {showDefault ? (
        <div className="pointer-events-none flex flex-col items-center gap-2 px-4 py-6 text-muted-foreground">
          {icon ?? <Upload className="size-8 opacity-50" />}
          <p className="text-sm font-medium text-muted-foreground">{emptyHint}</p>
          {emptySubHint && <p className="text-xs">{emptySubHint}</p>}
          <p
            className={cn(
              "text-xs transition-opacity",
              hovered ? "text-primary opacity-100" : "opacity-60",
            )}
          >
            悬停后可 Ctrl+V 粘贴
          </p>
        </div>
      ) : (
        children
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) processFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
