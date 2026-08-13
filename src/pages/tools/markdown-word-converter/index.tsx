import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { asBlob } from "html-docx-js-typescript";
import {
  ArrowLeftRight,
  Check,
  Copy,
  Download,
  Eraser,
  FileText,
  FileUp,
  Loader2,
  Star,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { marked } from "marked";
import { useEffect, useRef, useState } from "react";
import TurndownService from "turndown";

import MonacoEditor from "@/components/MonacoEditor";

type Mode = "md2word" | "word2md";

const MARKDOWN_EXAMPLE = `# Markdown 转 Word

本文档演示 **Markdown 转 Word** 功能。

## 功能特点

- 标题、**加粗**、*斜体* 和 \`行内代码\`
- 有序和无序列表
- 表格、引用和链接

## 示例表格

| 姓名   | 角色     | 分数 |
| ------ | -------- | ---- |
| 张三   | 工程师   | 95   |
| 李四   | 设计师   | 88   |

## 代码块

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

> 提示：导出的文件可直接用 Microsoft Word 或 WPS 打开。

[了解更多 Markdown 语法](https://www.markdownguide.org/)
`;

const WORD_STYLES = `
  body { font-family: 'Calibri', 'Microsoft YaHei', sans-serif; font-size: 12pt; line-height: 1.6; color: #000; }
  h1 { font-size: 22pt; } h2 { font-size: 18pt; } h3 { font-size: 15pt; }
  h4, h5, h6 { font-size: 12pt; }
  code { font-family: 'Consolas', monospace; background: #f5f5f5; padding: 1px 4px; }
  pre { font-family: 'Consolas', monospace; background: #f5f5f5; padding: 10px; border: 1px solid #ddd; white-space: pre-wrap; }
  blockquote { border-left: 4px solid #ccc; margin-left: 0; padding-left: 12px; color: #555; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #999; padding: 6px 10px; }
  th { background: #f0f0f0; }
  img { max-width: 100%; }
`;

const EDITOR_HEIGHT = 460;

export default function MarkdownWordConverterPage() {
  const [mode, setMode] = useState<Mode>("md2word");
  // md → word
  const [mdInput, setMdInput] = useState("");
  const [html, setHtml] = useState("");
  // word → md
  const [wordFileName, setWordFileName] = useState<string | null>(null);
  const [mdOutput, setMdOutput] = useState("");
  // shared
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [converting, setConverting] = useState(false);

  const mdFileInputRef = useRef<HTMLInputElement>(null);
  const wordFileInputRef = useRef<HTMLInputElement>(null);

  // Real-time markdown → html preview
  useEffect(() => {
    if (mode !== "md2word") return;
    if (!mdInput.trim()) {
      setHtml("");
      return;
    }
    try {
      const result = marked.parse(mdInput, { async: false }) as string;
      setHtml(result);
    } catch {
      setHtml("");
    }
  }, [mdInput, mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === "md2word" ? "word2md" : "md2word"));
    setError(null);
  };

  // ---------- md → word ----------
  const handleSelectMdFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setMdInput((ev.target?.result as string) ?? "");
      setError(null);
    };
    reader.onerror = () => setError("读取文件失败");
    reader.readAsText(file);
    // Reset input so the same file can be re-selected
    e.target.value = "";
  };

  const exportToWord = async () => {
    if (!html) return;
    setExporting(true);
    try {
      const source = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>${WORD_STYLES}</style></head><body>${html}</body></html>`;
      const blob = (await asBlob(source, {
        orientation: "portrait",
        margins: { top: 720, right: 720, bottom: 720, left: 720 },
      })) as Blob;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "markdown-document.docx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      setError("导出 Word 文档失败");
    } finally {
      setExporting(false);
    }
  };

  const copyHtml = () => {
    if (!html) return;
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ---------- word → md ----------
  const handleWordFile = async (file: File) => {
    if (!/\.docx$/i.test(file.name)) {
      setError("请选择 .docx 格式的 Word 文件");
      return;
    }
    setConverting(true);
    setError(null);
    setWordFileName(file.name);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const mammothModule = await import("mammoth");
      // @ts-ignore
      const mammoth = mammothModule.default?.convertToHtml ? mammothModule.default : mammothModule;
      const result = await mammoth.convertToHtml({ arrayBuffer });
      const td = new TurndownService({
        headingStyle: "atx",
        codeBlockStyle: "fenced",
      });
      const markdown = td.turndown(result.value);
      setMdOutput(markdown);
    } catch (e) {
      setError(`Word 文档解析失败: ${e instanceof Error ? e.message : String(e)}`);
      setMdOutput("");
      setWordFileName(null);
    } finally {
      setConverting(false);
    }
  };

  const handleSelectWordFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleWordFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (mode !== "word2md") return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleWordFile(file);
  };

  const copyMarkdown = () => {
    if (!mdOutput) return;
    navigator.clipboard.writeText(mdOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    if (!mdOutput) return;
    const blob = new Blob([mdOutput], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(wordFileName || "document").replace(/\.docx$/i, "")}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ---------- shared ----------
  const loadExample = () => {
    if (mode === "md2word") {
      setMdInput(MARKDOWN_EXAMPLE);
      setError(null);
    }
  };

  const clearAll = () => {
    setError(null);
    if (mode === "md2word") {
      setMdInput("");
      setHtml("");
    } else {
      setMdOutput("");
      setWordFileName(null);
    }
  };

  const clearDisabled =
    mode === "md2word" ? !mdInput : !mdOutput && !wordFileName;

  return (
    <>
      <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              <TriangleAlert className="size-4 shrink-0" />
              {error}
            </div>
          )}

          <input
            ref={mdFileInputRef}
            type="file"
            accept=".md,.markdown,.txt"
            className="hidden"
            onChange={handleSelectMdFile}
          />
          <input
            ref={wordFileInputRef}
            type="file"
            accept=".docx"
            className="hidden"
            onChange={handleSelectWordFile}
          />

          <div className="grid gap-4 lg:grid-cols-2 items-start">
            {/* Input */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-md border border-gray-200 p-0.5">
                    <button
                      className={cn(
                        "rounded px-2.5 py-0.5 text-xs font-medium transition-colors",
                        mode === "md2word"
                          ? "bg-primary text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                      onClick={() => setMode("md2word")}
                    >
                      MD → Word
                    </button>
                    <button
                      className={cn(
                        "rounded px-2.5 py-0.5 text-xs font-medium transition-colors",
                        mode === "word2md"
                          ? "bg-primary text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                      onClick={() => setMode("word2md")}
                    >
                      Word → MD
                    </button>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" onClick={toggleMode} title="切换方向">
                    <ArrowLeftRight className="size-3.5" />
                  </Button>
                  {mode === "md2word" ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => mdFileInputRef.current?.click()}
                      >
                        <Upload className="size-3.5" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={loadExample}>
                        <Star className="size-3.5" /> 示例
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => wordFileInputRef.current?.click()}
                    >
                      <FileUp className="size-3.5" /> 选择文件
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                    disabled={clearDisabled}
                    className="text-red-500"
                  >
                    <Eraser className="size-3.5" /> 清空
                  </Button>
                </div>
              </div>

              {mode === "md2word" ? (
                <div style={{ height: EDITOR_HEIGHT }}>
                  <MonacoEditor
                    value={mdInput}
                    onChange={setMdInput}
                    language="markdown"
                    height="100%"
                    showLineNumbersToggle
                    showWordWrapToggle
                  />
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 text-center transition-colors hover:border-primary/50 hover:bg-gray-50 cursor-pointer"
                  style={{ height: EDITOR_HEIGHT }}
                  onClick={() => wordFileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  {converting ? (
                    <>
                      <Loader2 className="size-8 animate-spin text-primary" />
                      <p className="text-sm text-gray-500">正在解析 Word 文档…</p>
                    </>
                  ) : wordFileName ? (
                    <>
                      <FileText className="size-8 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {wordFileName}
                        </p>
                        <p className="text-xs text-gray-500">点击重新选择文件</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <FileUp className="size-8 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          点击选择或拖拽 .docx 文件
                        </p>
                        <p className="text-xs text-gray-400">
                          支持 Microsoft Word（.docx）格式
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Output */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {mode === "md2word" ? "预览" : "Markdown 输出"}
                </Label>
                <div className="flex gap-1.5">
                  {mode === "md2word" ? (
                    <>
                      <Button variant="outline" size="sm" onClick={copyHtml} disabled={!html}>
                        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                        {copied ? "已复制" : "复制 HTML"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={exportToWord}
                        disabled={!html || exporting}
                      >
                        {exporting ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <Download className="size-3.5" />
                        )}
                        导出 Word
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyMarkdown}
                        disabled={!mdOutput}
                      >
                        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                        {copied ? "已复制" : "复制"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={downloadMarkdown}
                        disabled={!mdOutput}
                      >
                        <Download className="size-3.5" /> 下载 .md
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {mode === "md2word" ? (
                <div
                  className="markdown-body max-w-none overflow-y-auto overflow-x-hidden rounded-lg border border-gray-200 bg-white p-4"
                  style={{ height: EDITOR_HEIGHT }}
                  dangerouslySetInnerHTML={{
                    __html:
                      html ||
                      `<span style="color:#999">输入 Markdown 后这里会显示预览</span>`,
                  }}
                />
              ) : (
                <div style={{ height: EDITOR_HEIGHT }}>
                  <MonacoEditor
                    value={mdOutput}
                    readOnly
                    language="markdown"
                    height="100%"
                    showLineNumbersToggle
                    showWordWrapToggle
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
