import MonacoEditor from "@/components/MonacoEditor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Check,
  Copy,
  Download,
  Eraser,
  FileText,
  Star,
  TriangleAlert,
} from "lucide-react";
import { type ReactNode, useState } from "react";

export interface JsonStats {
  size: number;
  lines: number;
  keys: number;
  depth: number;
}

interface JsonIOLayoutProps {
  input: string;
  onInputChange: (value: string) => void;
  output: string;
  error: string;
  stats?: JsonStats | null;
  options?: ReactNode;
  onExample?: () => void;
  downloadName: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={!text}
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "已复制" : "复制"}
    </Button>
  );
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function JsonToolLayout({
  input,
  onInputChange,
  output,
  error,
  stats,
  options,
  onExample,
  downloadName,
}: JsonIOLayoutProps) {
  const handleDownload = () => {
    if (output) downloadFile(output, downloadName);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      {/* Input + Output */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between h-10">
            <Label className="text-sm font-medium">输入 (JSON)</Label>
            <div className="flex gap-2">
              {onExample && (
                <Button variant="outline" size="sm" onClick={onExample}>
                  <Star className="size-3.5" /> 示例
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onInputChange("")}
                disabled={!input}
              >
                <Eraser className="size-3.5" /> 清空
              </Button>
            </div>
          </div>
          <div className="h-[340px]">
            <MonacoEditor
              value={input}
              onChange={onInputChange}
              language="json"
              height="100%"
              showLineNumbersToggle
              showWordWrapToggle
            />
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">输出</Label>
              {stats && (
                <div className="flex flex-wrap gap-1">
                  {[
                    { label: "大小", value: formatSize(stats.size) },
                    { label: "行", value: stats.lines },
                    { label: "键", value: stats.keys },
                    { label: "深", value: stats.depth },
                  ].map((s) => (
                    <span
                      key={s.label}
                      className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
                    >
                      {s.label}: {s.value}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && (
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="size-3.5" /> 下载
                </Button>
              )}
            </div>
          </div>
          <div className="h-[340px]">
            {error ? (
              <div className="flex h-full flex-col items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                <TriangleAlert className="size-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">处理出错</p>
                  <p className="text-xs mt-1 opacity-90 break-all">{error}</p>
                </div>
              </div>
            ) : output ? (
              <MonacoEditor
                value={output}
                readOnly
                language="json"
                height="100%"
                showCopyButton
                showDownloadButton
                showWordWrapToggle
                onDownload={handleDownload}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-lg border border-border bg-card text-sm text-muted-foreground">
                <FileText className="size-10 opacity-30 mb-3" />
                {input.trim() ? "等待处理..." : "输入内容后自动处理"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Options */}
      {options && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {options}
        </div>
      )}
    </div>
  );
}
