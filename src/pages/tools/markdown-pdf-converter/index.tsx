import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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

import MonacoEditor from "@/components/MonacoEditor"

type Mode = "md2pdf" | "pdf2md";

const MARKDOWN_EXAMPLE = `# Markdown 转 PDF

本文档演示 **Markdown 转 PDF** 功能，导出的 PDF 可直接打印或分享。

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

> 提示：导出的 PDF 由浏览器端生成，文本与排版与预览一致。

[了解更多 Markdown 语法](https://www.markdownguide.org/)
`;

// 独立的打印样式：全部使用十六进制颜色与系统字体，
// 避免 html2canvas 解析 Tailwind v4 的 oklch() 颜色时报错。
const PDF_STYLES = `
  .md-pdf-export { box-sizing: border-box; padding: 24px 28px; font-family: 'Microsoft YaHei','PingFang SC','Hiragino Sans GB','Segoe UI',sans-serif; font-size: 14px; line-height: 1.75; color: #1f2328; }
  .md-pdf-export * { box-sizing: border-box; }
  .md-pdf-export h1 { font-size: 26px; line-height: 1.3; margin: 0 0 16px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; color: #111827; }
  .md-pdf-export h2 { font-size: 21px; line-height: 1.3; margin: 24px 0 12px; color: #111827; }
  .md-pdf-export h3 { font-size: 17px; margin: 20px 0 10px; color: #111827; }
  .md-pdf-export h4, .md-pdf-export h5, .md-pdf-export h6 { font-size: 15px; margin: 16px 0 8px; color: #111827; }
  .md-pdf-export p { margin: 0 0 12px; }
  .md-pdf-export a { color: #2563eb; text-decoration: underline; word-break: break-all; }
  .md-pdf-export strong { font-weight: 700; }
  .md-pdf-export em { font-style: italic; }
  .md-pdf-export del { text-decoration: line-through; }
  .md-pdf-export code { font-family: 'Consolas','SFMono-Regular',monospace; font-size: 12.5px; background: #f3f4f6; color: #b91c1c; padding: 1px 5px; border-radius: 4px; }
  .md-pdf-export pre { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; overflow-x: auto; margin: 0 0 14px; }
  .md-pdf-export pre code { background: transparent; color: #0f172a; padding: 0; font-size: 12.5px; }
  .md-pdf-export blockquote { border-left: 4px solid #cbd5e1; margin: 0 0 14px; padding: 4px 16px; color: #475569; background: #f8fafc; border-radius: 0 6px 6px 0; }
  .md-pdf-export ul, .md-pdf-export ol { margin: 0 0 12px; padding-left: 24px; }
  .md-pdf-export li { margin: 4px 0; }
  .md-pdf-export hr { border: none; border-top: 1px solid #e5e7eb; margin: 20px 0; }
  .md-pdf-export img { max-width: 100%; border-radius: 6px; }
  .md-pdf-export table { border-collapse: collapse; width: 100%; margin: 0 0 14px; font-size: 13px; }
  .md-pdf-export th, .md-pdf-export td { border: 1px solid #cbd5e1; padding: 7px 10px; text-align: left; }
  .md-pdf-export th { background: #f1f5f9; font-weight: 700; color: #111827; }
`;

// pdfjs 文本项的本地类型（pdfjs 自带类型在过滤后需要收窄）
interface PdfTextItem {
  str: string;
  transform: number[];
  height: number;
  width: number;
  fontName?: string;
}

const EDITOR_HEIGHT = 460;

export default function MarkdownPdfConverterPage() {
  const [mode, setMode] = useState<Mode>("md2pdf");
  // md → pdf
  const [mdInput, setMdInput] = useState("");
  const [html, setHtml] = useState("");
  // pdf → md
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);
  const [mdOutput, setMdOutput] = useState("");
  // shared
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [converting, setConverting] = useState(false);

  const mdFileInputRef = useRef<HTMLInputElement>(null);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);

  // 实时 markdown → html 预览
  useEffect(() => {
    if (mode !== "md2pdf") return;
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
    setMode((prev) => (prev === "md2pdf" ? "pdf2md" : "md2pdf"));
    setError(null);
  };

  // ---------- md → pdf ----------
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
    e.target.value = "";
  };

  // 使用浏览器原生打印导出 PDF：文本为矢量、可选中，且不依赖 html2canvas/jspdf，
  // 彻底规避 Tailwind v4 的 oklch() 颜色导致 html2canvas 崩溃的问题。
  const exportToPdf = async () => {
    if (!mdInput.trim()) return;
    setError(null);
    let iframe: HTMLIFrameElement | null = null;
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      if (iframe && iframe.parentNode) {
        setTimeout(() => {
          if (iframe && iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }, 300);
      }
    };
    try {
      const rendered = marked.parse(mdInput, { async: false }) as string;
      const printLayout = `
        @page { size: A4; margin: 16mm 14mm; }
        body { margin: 0; background: #ffffff; }
        .md-pdf-export { padding: 0; }
        @media print {
          .md-pdf-export h1, .md-pdf-export h2, .md-pdf-export h3, .md-pdf-export h4 { break-after: avoid; }
          .md-pdf-export pre, .md-pdf-export table, .md-pdf-export blockquote, .md-pdf-export img { break-inside: avoid; }
          .md-pdf-export tr, .md-pdf-export li { break-inside: avoid; }
        }
      `;
      const source = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>Markdown 文档</title><style>${PDF_STYLES}${printLayout}</style></head><body><div class="md-pdf-export">${rendered}</div></body></html>`;

      iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0px";
      iframe.style.height = "0px";
      iframe.style.border = "0";
      iframe.setAttribute("aria-hidden", "true");
      document.body.appendChild(iframe);

      const w = iframe.contentWindow;
      if (!w) throw new Error("无法创建打印窗口");

      // 打印对话框关闭后清理（多数浏览器支持）
      w.onafterprint = cleanup;

      const doc = w.document;
      doc.open();
      doc.write(source);
      doc.close();

      const doPrint = () => {
        try {
          w.focus();
          w.print();
        } catch {
          // 某些浏览器 print 同步抛错则忽略，等待 onafterprint 兜底
        }
        // 兜底：若 onafterprint 未触发（部分浏览器/环境），3 秒后清理
        setTimeout(cleanup, 3000);
      };

      if (doc.readyState === "complete") {
        doPrint();
      } else {
        iframe.onload = doPrint;
        // 兜底：onload 未触发时也尝试打印
        setTimeout(() => {
          if (!cleaned) doPrint();
        }, 1000);
      }
    } catch {
      setError("导出 PDF 失败，请稍后重试");
      cleanup();
    }
  };

  const copyHtml = () => {
    if (!html) return;
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ---------- pdf → md ----------
  const handlePdfFile = async (file: File) => {
    if (!/\.pdf$/i.test(file.name)) {
      setError("请选择 .pdf 格式的 PDF 文件");
      return;
    }
    setConverting(true);
    setError(null);
    setPdfFileName(file.name);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      // 使用 public/ 下与依赖版本一致的 worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const data = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data }).promise;

      const pages: PdfTextItem[][] = [];
      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);
        const content = await page.getTextContent();
        const items: PdfTextItem[] = [];
        for (const raw of content.items) {
          if (typeof raw === "object" && raw !== null && "str" in raw) {
            items.push(raw as unknown as PdfTextItem);
          }
        }
        pages.push(items);
      }

      const markdown = pdfToMarkdown(pages);
      setMdOutput(markdown);
    } catch {
      setError("PDF 解析失败，请确认文件为有效的 PDF 格式");
      setMdOutput("");
      setPdfFileName(null);
    } finally {
      setConverting(false);
    }
  };

  // 将 pdfjs 提取的文本项转换为 Markdown（启发式：按行分组 + 字号识别标题）
  const pdfToMarkdown = (pages: PdfTextItem[][]): string => {
    // 1) 每页按行（y 坐标）分组，行内按 x 排序拼接
    const lines: { text: string; y: number; size: number }[][] = [];
    for (const items of pages) {
      const pageLines: { text: string; y: number; size: number }[] = [];
      // 按基线 y 降序（PDF 坐标 y 越大越靠上）
      const sorted = [...items].sort((a, b) => b.transform[5] - a.transform[5]);
      let current: { text: string; y: number; size: number } | null = null;
      for (const it of sorted) {
        const size = Math.abs(it.transform[3]) || it.height || 12;
        const y = it.transform[5];
        if (!current || Math.abs(current.y - y) > size * 0.5) {
          current = { text: it.str, y, size };
          pageLines.push(current);
        } else {
          current.text += it.str;
        }
      }
      lines.push(pageLines);
    }

    // 2) 计算正文基准字号（取出现最多的字号）
    const sizeCount = new Map<number, number>();
    for (const pageLines of lines) {
      for (const l of pageLines) {
        const key = Math.round(l.size);
        sizeCount.set(key, (sizeCount.get(key) ?? 0) + 1);
      }
    }
    let bodySize = 12;
    let max = 0;
    for (const [key, count] of sizeCount) {
      if (count > max) {
        max = count;
        bodySize = key;
      }
    }
    if (bodySize <= 0) bodySize = 12;

    // 3) 逐行生成 Markdown
    const out: string[] = [];
    let prevBottom = Number.POSITIVE_INFINITY;
    let firstLine = true;
    for (const pageLines of lines) {
      // 页与页之间空一行
      if (!firstLine) out.push("");
      for (const line of pageLines) {
        const text = line.text.replace(/\s+([，。、！？；：）】」』])/g, "$1").trim();
        if (!text) {
          out.push("");
          continue;
        }
        const ratio = line.size / bodySize;
        // 垂直间距较大时视为新段落
        const gap = prevBottom === Number.POSITIVE_INFINITY ? 0 : prevBottom - line.y;
        if (!firstLine && gap > bodySize * 1.4 && out[out.length - 1] !== "") {
          out.push("");
        }
        const headingLevel = ratio >= 2.0 ? 1 : ratio >= 1.6 ? 2 : ratio >= 1.35 ? 3 : ratio >= 1.18 ? 4 : 0;
        let md = text;
        if (headingLevel > 0) {
          md = `${"#".repeat(headingLevel)} ${text}`;
        } else if (/^[•·▪◦‣–—-]/.test(text)) {
          md = text.replace(/^[•·▪◦‣–—-]\s*/, "- ");
        }
        out.push(md);
        prevBottom = line.y;
        firstLine = false;
      }
    }

    // 清理多余空行
    return out
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/^\n+/, "")
      .replace(/\n+$/, "");
  };

  const handleSelectPdfFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePdfFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (mode !== "pdf2md") return;
    const file = e.dataTransfer.files?.[0];
    if (file) handlePdfFile(file);
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
    link.download = `${(pdfFileName || "document").replace(/\.pdf$/i, "")}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ---------- shared ----------
  const loadExample = () => {
    if (mode === "md2pdf") {
      setMdInput(MARKDOWN_EXAMPLE);
      setError(null);
    }
  };

  const clearAll = () => {
    setError(null);
    if (mode === "md2pdf") {
      setMdInput("");
      setHtml("");
    } else {
      setMdOutput("");
      setPdfFileName(null);
    }
  };

  const clearDisabled = mode === "md2pdf" ? !mdInput : !mdOutput && !pdfFileName;

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
            ref={pdfFileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleSelectPdfFile}
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
                        mode === "md2pdf"
                          ? "bg-primary text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                      onClick={() => setMode("md2pdf")}
                    >
                      MD → PDF
                    </button>
                    <button
                      className={cn(
                        "rounded px-2.5 py-0.5 text-xs font-medium transition-colors",
                        mode === "pdf2md"
                          ? "bg-primary text-white"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                      onClick={() => setMode("pdf2md")}
                    >
                      PDF → MD
                    </button>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" onClick={toggleMode} title="切换方向">
                    <ArrowLeftRight className="size-3.5" />
                  </Button>
                  {mode === "md2pdf" ? (
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
                      onClick={() => pdfFileInputRef.current?.click()}
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

              {mode === "md2pdf" ? (
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
                  onClick={() => pdfFileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  {converting ? (
                    <>
                      <Loader2 className="size-8 animate-spin text-primary" />
                      <p className="text-sm text-gray-500">正在解析 PDF 文档…</p>
                    </>
                  ) : pdfFileName ? (
                    <>
                      <FileText className="size-8 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {pdfFileName}
                        </p>
                        <p className="text-xs text-gray-500">点击重新选择文件</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <FileUp className="size-8 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          点击选择或拖拽 .pdf 文件
                        </p>
                        <p className="text-xs text-gray-400">
                          仅提取文本内容（图片型 PDF 可能无法识别文字）
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
                  {mode === "md2pdf" ? "预览" : "Markdown 输出"}
                </Label>
                <div className="flex gap-1.5">
                  {mode === "md2pdf" ? (
                    <>
                      <Button variant="outline" size="sm" onClick={copyHtml} disabled={!html}>
                        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                        {copied ? "已复制" : "复制 HTML"}
                      </Button>
                      <Button size="sm" onClick={exportToPdf}>
                        <Download className="size-3.5" />
                        导出 PDF
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

              {mode === "md2pdf" ? (
                <div
                  className="prose prose-sm max-w-none overflow-auto rounded-lg border border-gray-200 bg-white p-4"
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

          {mode === "md2pdf" && (
            <p className="-mt-1 text-center text-xs text-gray-400">
              点击「导出 PDF」会打开浏览器打印窗口，在目标打印机中选择「另存为 PDF」即可保存。
            </p>
          )}
        </div>
      </div>
    </>
  );
}
