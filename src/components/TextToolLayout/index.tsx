import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowLeftRight,
  Check,
  Copy,
  Download,
  Eraser,
  FileText,
  Info,
  Star,
  TriangleAlert,
  Type,
} from "lucide-react";

import MonacoEditor from "@/components/MonacoEditor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { downloadTextFile } from "@/lib/download";
import { computeTextStats } from "@/lib/text-stats";

/** 复制按钮（带 2s 反馈） */
export function CopyButton({
  text,
  disabled,
}: {
  text: string;
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled || !text}
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

/** 文本统计气泡 */
export function TextStatsPopover({ text }: { text: string }) {
  const stats = useMemo(() => computeTextStats(text), [text]);
  const items = [
    { label: "总字符", value: stats.characters, color: "text-blue-600" },
    { label: "不含空格", value: stats.charactersNoSpaces, color: "text-blue-600" },
    { label: "中文字符", value: stats.chineseCharacters, color: "text-purple-600" },
    { label: "总词数", value: stats.totalWords, color: "text-amber-600" },
    { label: "英文单词", value: stats.englishWords, color: "text-cyan-600" },
    { label: "中文词数", value: stats.chineseWords, color: "text-orange-600" },
    { label: "句子", value: stats.sentences, color: "text-red-600" },
    { label: "段落", value: stats.paragraphs, color: "text-indigo-600" },
    { label: "行数", value: stats.lines, color: "text-pink-600" },
  ];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" title="文本统计" disabled={!text}>
          <Info className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Type className="size-3.5" />
          文本统计
        </div>
        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-md bg-muted px-2 py-1.5 text-center"
            >
              <div className={`text-base font-bold ${item.color}`}>
                {item.value}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export interface TextToolLayoutProps {
  /** 输入内容 */
  input: string;
  /** 输入变更回调 */
  onInputChange: (value: string) => void;
  /** 输入区标签，默认「文本」 */
  inputLabel?: string;
  /** 输入编辑器语言，默认 plaintext */
  inputLanguage?: string;
  /** 输出内容 */
  output: string;
  /** 输出区标签 */
  outputLabel: string;
  /** 输出编辑器语言，默认 plaintext */
  outputLanguage?: string;
  /** 错误信息（存在时替代输出区展示） */
  error?: string;
  /** 下载文件名 */
  downloadName: string;
  /** 加载示例回调，未传则不显示「示例」按钮 */
  onExample?: () => void;
  /** 交换回调（把输出送回输入），未传则不显示「交换」按钮 */
  onSwap?: () => void;
  /** 选项面板内容 */
  options?: ReactNode;
}

/**
 * 文本类工具的通用双栏布局：左侧输入 + 右侧输出（只读），底部为选项面板。
 */
export default function TextToolLayout({
  input,
  onInputChange,
  inputLabel = "文本",
  inputLanguage = "plaintext",
  output,
  outputLabel,
  outputLanguage = "plaintext",
  error,
  downloadName,
  onExample,
  onSwap,
  options,
}: TextToolLayoutProps) {
  const handleDownload = () => {
    if (output) downloadTextFile(output, downloadName);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-6">
      {/* Input + Output */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Input */}
        <div className="flex flex-col gap-2">
          <div className="flex h-10 items-center justify-between">
            <Label className="text-sm font-medium">输入（{inputLabel}）</Label>
            <div className="flex items-center gap-2">
              <TextStatsPopover text={input} />
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
              language={inputLanguage}
              height="100%"
              showLineNumbersToggle
              showWordWrapToggle
            />
          </div>
        </div>

        {/* Output */}
        <div className="flex flex-col gap-2">
          <div className="flex h-10 items-center justify-between">
            <Label className="text-sm font-medium">{outputLabel}</Label>
            <div className="flex gap-2">
              {output && <CopyButton text={output} />}
              {output && (
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="size-3.5" /> 下载
                </Button>
              )}
              {output && onSwap && (
                <Button variant="outline" size="sm" onClick={onSwap}>
                  <ArrowLeftRight className="size-3.5" /> 交换
                </Button>
              )}
            </div>
          </div>
          <div className="h-[340px]">
            {error ? (
              <div className="flex h-full flex-col items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-medium">处理出错</p>
                  <p className="mt-1 text-xs break-all opacity-90">{error}</p>
                </div>
              </div>
            ) : output ? (
              <MonacoEditor
                value={output}
                readOnly
                language={outputLanguage}
                height="100%"
                showCopyButton
                showDownloadButton
                showWordWrapToggle
                onDownload={handleDownload}
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-lg border border-border bg-card text-sm text-muted-foreground">
                <FileText className="mb-3 size-10 opacity-30" />
                {input ? "等待处理..." : "输入内容后自动处理"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Options */}
      {options && (
        <div className="rounded-xl border border-border bg-card p-5">
          {options}
        </div>
      )}
    </div>
  );
}
