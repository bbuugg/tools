import { loader, useMonaco } from "@monaco-editor/react";
import type { MonacoDiffEditor } from "@monaco-editor/react";
import {
  ArrowLeftRight,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Eraser,
  FileDiff,
  FileText,
  FileUp,
  GitCompareArrows,
  Lock,
  Pencil,
  Star,
  WrapText,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { toast } from "sonner";

import { MONACO_LANGUAGES } from "@/components/MonacoEditor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

// ── 本地化 Monaco Editor ─────────────────────────────────────────
// 与 @/components/MonacoEditor 保持一致：从 public/monaco-editor/vs 加载，
// 避免运行时依赖 CDN。
loader.config({
  paths: {
    vs: "/monaco-editor/vs",
  },
});

// ─── Types ───────────────────────────────────────────────────────

/** 与 monaco 的 ILineChange 等价，避免页面直接依赖 monaco 命名空间 */
interface LineChange {
  oStart: number;
  oEnd: number;
  mStart: number;
  mEnd: number;
}

type Side = "left" | "right";

// ─── Constants ───────────────────────────────────────────────────

const MAX_FILE_SIZE = 8 * 1024 * 1024;

/** 扩展名 → Monaco 语言（仅收录 MONACO_LANGUAGES 中已列出的语言） */
const EXT_TO_LANG: Record<string, string> = {
  txt: "plaintext",
  log: "plaintext",
  csv: "plaintext",
  json: "json",
  jsonc: "json",
  json5: "json",
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  mts: "typescript",
  cts: "typescript",
  html: "html",
  htm: "html",
  vue: "html",
  css: "css",
  xml: "xml",
  svg: "xml",
  plist: "xml",
  md: "markdown",
  markdown: "markdown",
  yml: "yaml",
  yaml: "yaml",
  ini: "ini",
  properties: "ini",
  env: "ini",
  cfg: "ini",
  conf: "ini",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
  sql: "sql",
  py: "python",
  go: "go",
  rs: "rust",
  java: "java",
  c: "cpp",
  h: "cpp",
  cc: "cpp",
  cpp: "cpp",
  hpp: "cpp",
};

const EXAMPLE_LEFT = `小禾笔记是一个面向开发者的工具集合。
我们提供 JSON 格式化、代码高亮、正则测试等功能。

目标是让日常开发更加高效。
欢迎提出你的建议！`;

const EXAMPLE_RIGHT = `小禾笔记是一个面向开发者的在线工具集合。
我们提供 JSON 格式化、代码高亮、正则测试、时间转换等功能。

目标是让日常开发更加高效、顺手。
如果你喜欢，欢迎分享给同事！`;

// ─── Helpers ─────────────────────────────────────────────────────

function detectLanguage(filename: string): string | null {
  const m = /\.([a-z0-9]+)$/i.exec(filename);
  if (!m) return null;
  return EXT_TO_LANG[m[1].toLowerCase()] ?? null;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

async function readTextFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`文件过大（${formatSize(file.size)}），单个文件上限 ${formatSize(MAX_FILE_SIZE)}`);
  }
  const text = await file.text();
  if (text.includes("\0")) {
    throw new Error(`「${file.name}」看起来是二进制文件，无法作为文本对比`);
  }
  return text;
}

/** 把 Monaco 的 ILineChange 归一化为本地结构 */
function toLineChange(c: {
  originalStartLineNumber: number;
  originalEndLineNumber: number;
  modifiedStartLineNumber: number;
  modifiedEndLineNumber: number;
}): LineChange {
  return {
    oStart: c.originalStartLineNumber,
    oEnd: c.originalEndLineNumber,
    mStart: c.modifiedStartLineNumber,
    mEnd: c.modifiedEndLineNumber,
  };
}

function ranges(c: LineChange) {
  // Monaco sets `end === 0` for an empty side (pure insert / pure delete);
  // in that case start is already the 0-based insert position, so no -1.
  const isInsert = c.oEnd === 0;
  const isDelete = c.mEnd === 0;

  const os = Math.max(0, isInsert ? c.oStart : c.oStart - 1);
  const oe = isInsert ? os : Math.max(os, c.oEnd);
  const ms = Math.max(0, isDelete ? c.mStart : c.mStart - 1);
  const me = isDelete ? ms : Math.max(ms, c.mEnd);

  return { os, oe, ms, me };
}

function countStats(changes: LineChange[]) {
  let deleted = 0;
  let inserted = 0;
  for (const c of changes) {
    const { os, oe, ms, me } = ranges(c);
    deleted += oe - os;
    inserted += me - ms;
  }
  return { deleted, inserted, count: changes.length };
}

function isSameChanges(a: LineChange[], b: LineChange[]) {
  return (
    a.length === b.length &&
    a.every(
      (c, i) =>
        c.oStart === b[i].oStart &&
        c.oEnd === b[i].oEnd &&
        c.mStart === b[i].mStart &&
        c.mEnd === b[i].mEnd,
    )
  );
}

/** 基于 Monaco 计算出的变更区间生成 unified diff（可直接被 git apply / patch 使用） */
function buildUnifiedDiff(
  original: string,
  modified: string,
  changes: LineChange[],
  originalName: string,
  modifiedName: string,
  context = 3,
): string {
  const oLines = original.split("\n");
  const mLines = modified.split("\n");
  const out: string[] = [`--- ${originalName}`, `+++ ${modifiedName}`];

  const spans = changes.map(ranges);
  let oCursor = 0;
  let mCursor = 0;
  let idx = 0;

  while (idx < spans.length) {
    // 上下文区间重叠的变更合并进同一个 hunk
    const start = idx;
    let end = spans[idx].oe;
    while (idx + 1 < spans.length && spans[idx + 1].os - end <= context * 2) {
      idx++;
      end = spans[idx].oe;
    }
    const group = spans.slice(start, idx + 1);
    idx++;

    const os = group[0].os;
    const oe = group[group.length - 1].oe;
    const me = group[group.length - 1].me;

    const ctxFrom = Math.min(os, Math.max(oCursor, os - context));
    const mCtxFrom = Math.max(0, mCursor - (oCursor - ctxFrom));
    const ctxTo = Math.max(oe, Math.min(oLines.length, oe + context));

    let deleted = 0;
    let inserted = 0;
    for (const s of group) {
      deleted += s.oe - s.os;
      inserted += s.me - s.ms;
    }
    const oLen = ctxTo - ctxFrom;
    const mLen = oLen - deleted + inserted;
    out.push(`@@ -${ctxFrom + 1},${oLen} +${mCtxFrom + 1},${mLen} @@`);

    let cursor = ctxFrom;
    for (const s of group) {
      for (let k = cursor; k < s.os; k++) out.push(` ${oLines[k]}`);
      for (let k = s.os; k < s.oe; k++) out.push(`-${oLines[k]}`);
      for (let k = s.ms; k < s.me; k++) out.push(`+${mLines[k]}`);
      cursor = s.oe;
    }
    for (let k = cursor; k < ctxTo; k++) out.push(` ${oLines[k]}`);

    oCursor = ctxTo;
    mCursor = me + (ctxTo - oe);
  }

  return out.join("\n");
}

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function hasFiles(e: DragEvent): boolean {
  return Array.from(e.dataTransfer.types).includes("Files");
}

/** 文件拖放：返回是否悬停 + 需要绑定到容器上的拖拽事件 */
function useFileDrop(onFiles: (files: File[]) => void) {
  const [isOver, setIsOver] = useState(false);
  const depth = useRef(0);

  const onDragEnter = useCallback((e: DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    depth.current += 1;
    setIsOver(true);
  }, []);

  const onDragOver = useCallback((e: DragEvent) => {
    if (!hasFiles(e)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const onDragLeave = useCallback((e: DragEvent) => {
    if (!hasFiles(e)) return;
    depth.current -= 1;
    if (depth.current <= 0) {
      depth.current = 0;
      setIsOver(false);
    }
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth.current = 0;
      setIsOver(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length) onFiles(files);
    },
    [onFiles],
  );

  return { isOver, dropProps: { onDragEnter, onDragOver, onDragLeave, onDrop } };
}

// ─── SidePanel ───────────────────────────────────────────────────

interface SidePanelProps {
  title: string;
  value: string;
  fileName: string | null;
  onLoad: (file: File) => void;
  onClear: () => void;
}

function SidePanel({ title, value, fileName, onLoad, onClear }: SidePanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleFiles = useCallback((files: File[]) => onLoad(files[0]), [onLoad]);
  const { isOver, dropProps } = useFileDrop(handleFiles);

  const lineCount = useMemo(() => (value ? value.split("\n").length : 0), [value]);

  return (
    <div
      {...dropProps}
      className={cn(
        "rounded-xl border border-dashed bg-card px-3 py-2.5 transition-colors",
        isOver ? "border-primary bg-primary/5" : "border-border",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="size-4 shrink-0 text-muted-foreground" />
          <span className="shrink-0 text-sm font-medium">{title}</span>
          {fileName ? (
            <span className="truncate rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
              {fileName}
            </span>
          ) : (
            <span className="truncate text-xs text-muted-foreground">未选择文件</span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            <FileUp className="size-3.5" /> 选择文件
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClear}
            disabled={!value && !fileName}
            title="清空这一侧"
          >
            <Eraser className="size-3.5" />
          </Button>
        </div>
      </div>
      <p className="mt-1 truncate text-xs text-muted-foreground">
        {value
          ? `${value.length} 字符 · ${lineCount} 行`
          : "可直接拖入文件，或在下方编辑器中粘贴 / 输入"}
      </p>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onLoad(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── ToggleSwitch ────────────────────────────────────────────────

function ToggleSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2 text-sm">
      <Switch size="sm" checked={checked} onCheckedChange={onChange} />
      <span className={checked ? "font-medium text-foreground" : "text-muted-foreground"}>
        {label}
      </span>
    </label>
  );
}

// ─── Page ────────────────────────────────────────────────────────

export default function TextDiffPage() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [leftName, setLeftName] = useState<string | null>(null);
  const [rightName, setRightName] = useState<string | null>(null);

  const [language, setLanguage] = useState("plaintext");
  const [languageLocked, setLanguageLocked] = useState(false);
  const [sideBySide, setSideBySide] = useState(true);
  const [ignoreTrimWs, setIgnoreTrimWs] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [wordWrap, setWordWrap] = useState<"on" | "off">("off");
  const [editable, setEditable] = useState(true);
  const [collapseUnchanged, setCollapseUnchanged] = useState(false);

  const [changes, setChanges] = useState<LineChange[]>([]);
  const [copied, setCopied] = useState(false);

  const monaco = useMonaco();
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<MonacoDiffEditor | null>(null);
  const [ready, setReady] = useState(false);

  const { resolvedTheme } = useTheme();
  const editorTheme = resolvedTheme === "dark" ? "vs-dark" : "vs";

  // Monaco 原生不支持忽略大小写，改为把两份内容统一转小写后再交给 diff 引擎，
  // 此时编辑器临时只读，避免出现「输入的内容与显示的内容不一致」。
  const readOnly = !editable || ignoreCase;
  const displayLeft = useMemo(() => (ignoreCase ? left.toLowerCase() : left), [left, ignoreCase]);
  const displayRight = useMemo(() => (ignoreCase ? right.toLowerCase() : right), [right, ignoreCase]);

  const stats = useMemo(() => countStats(changes), [changes]);
  const hasContent = Boolean(displayLeft || displayRight);

  const editorOptions = useMemo(
    () => ({
      readOnly,
      originalEditable: !readOnly,
      renderSideBySide: sideBySide,
      ignoreTrimWhitespace: ignoreTrimWs,
      wordWrap,
      diffWordWrap: "inherit" as const,
      renderOverviewRuler: true,
      tabSize: 2,
      hideUnchangedRegions: {
        enabled: collapseUnchanged,
        contextLineCount: 3,
        minimumLineCount: 4,
        revealLineCount: 12,
      },
      experimental: { showEmptyDecorations: collapseUnchanged },
    }),
    [readOnly, sideBySide, ignoreTrimWs, wordWrap, collapseUnchanged],
  );

  // 编辑器只创建一次，初始值通过 ref 读取，避免被反复重建
  const initialRef = useRef({ left, right, language, theme: editorTheme });

  const syncChanges = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const next = (editor.getLineChanges() ?? []).map(toLineChange);
    setChanges((prev) => (isSameChanges(prev, next) ? prev : next));
  }, []);

  // ── 创建 / 销毁 diff editor ───────────────────────────────────
  useEffect(() => {
    if (!monaco || !containerRef.current) return;

    const init = initialRef.current;
    const editor = monaco.editor.createDiffEditor(containerRef.current, {
      automaticLayout: true,
      theme: init.theme,
      fontFamily: "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
      fontSize: 13,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderLineHighlight: "all",
    });

    const originalModel = monaco.editor.createModel(init.left, init.language);
    const modifiedModel = monaco.editor.createModel(init.right, init.language);
    editor.setModel({ original: originalModel, modified: modifiedModel });
    editorRef.current = editor;

    const disposables = [
      originalModel.onDidChangeContent(() => setLeft(originalModel.getValue())),
      modifiedModel.onDidChangeContent(() => setRight(modifiedModel.getValue())),
      editor.onDidUpdateDiff(syncChanges),
    ];
    setReady(true);
    syncChanges();

    return () => {
      disposables.forEach((d) => d.dispose());
      editor.dispose();
      originalModel.dispose();
      modifiedModel.dispose();
      editorRef.current = null;
      setReady(false);
    };
  }, [monaco, syncChanges]);

  // ── 外部内容（文件 / 交换 / 示例）同步到 model ──────────────────
  // 用户在编辑器里输入时 model 已是最新，这里会自动跳过回写。
  useEffect(() => {
    const model = editorRef.current?.getModel();
    if (!model || model.original.getValue() === displayLeft) return;
    model.original.setValue(displayLeft);
  }, [displayLeft, ready]);

  useEffect(() => {
    const model = editorRef.current?.getModel();
    if (!model || model.modified.getValue() === displayRight) return;
    model.modified.setValue(displayRight);
  }, [displayRight, ready]);

  useEffect(() => {
    if (!monaco) return;
    const model = editorRef.current?.getModel();
    if (!model) return;
    monaco.editor.setModelLanguage(model.original, language);
    monaco.editor.setModelLanguage(model.modified, language);
  }, [language, monaco, ready]);

  useEffect(() => {
    editorRef.current?.updateOptions(editorOptions);
  }, [editorOptions, ready]);

  useEffect(() => {
    monaco?.editor.setTheme(editorTheme);
  }, [editorTheme, monaco]);

  const loadFile = useCallback(
    async (file: File, side: Side) => {
      try {
        const text = await readTextFile(file);
        if (side === "left") {
          setLeft(text);
          setLeftName(file.name);
        } else {
          setRight(text);
          setRightName(file.name);
        }
        if (!languageLocked) {
          const lang = detectLanguage(file.name);
          if (lang) setLanguage(lang);
        }
        toast.success(`已载入 ${file.name}`);
      } catch (e) {
        toast.error((e as Error).message || "文件读取失败");
      }
    },
    [languageLocked],
  );

  // 拖入 2 个文件 → 左/右各一个；拖入 1 个文件 → 优先填空的一侧
  const handleDroppedFiles = useCallback(
    (files: File[]) => {
      if (files.length >= 2) {
        void loadFile(files[0], "left");
        void loadFile(files[1], "right");
        return;
      }
      void loadFile(files[0], !left && !leftName ? "left" : "right");
    },
    [loadFile, left, leftName],
  );

  const { isOver: isOverPage, dropProps: pageDropProps } = useFileDrop(handleDroppedFiles);

  const clearSide = useCallback((side: Side) => {
    if (side === "left") {
      setLeft("");
      setLeftName(null);
    } else {
      setRight("");
      setRightName(null);
    }
  }, []);

  const handleSwap = () => {
    setLeft(right);
    setRight(left);
    setLeftName(rightName);
    setRightName(leftName);
  };

  const handleClearAll = () => {
    setLeft("");
    setRight("");
    setLeftName(null);
    setRightName(null);
    setLanguage("plaintext");
    setLanguageLocked(false);
    setChanges([]);
  };

  const handleExample = () => {
    setLeft(EXAMPLE_LEFT);
    setRight(EXAMPLE_RIGHT);
    setLeftName("示例-原文.txt");
    setRightName("示例-改后.txt");
  };

  /** 在差异之间跳转（Monaco 未对外暴露 goToNextChange 命令，这里基于变更区间自行定位） */
  const gotoChange = (dir: 1 | -1) => {
    const editor = editorRef.current;
    if (!editor || changes.length === 0) return;

    const modified = editor.getModifiedEditor();
    const current = modified.getPosition()?.lineNumber ?? 1;
    let target: LineChange | undefined;

    if (dir === 1) {
      target = changes.find((c) => ranges(c).ms > current - 1) ?? changes[0];
    } else {
      for (let i = changes.length - 1; i >= 0; i--) {
        if (ranges(changes[i]).ms < current - 1) {
          target = changes[i];
          break;
        }
      }
      target ??= changes[changes.length - 1];
    }
    if (!target) return;

    const { os, ms } = ranges(target);
    editor.getOriginalEditor().revealLineInCenter(Math.max(1, os + 1));
    modified.revealLineInCenter(Math.max(1, ms + 1));
    modified.setPosition({ lineNumber: Math.max(1, ms + 1), column: 1 });
    modified.focus();
  };

  const diffText = useMemo(
    () => buildUnifiedDiff(left, right, changes, leftName ?? "原文", rightName ?? "对比文本"),
    [left, right, changes, leftName, rightName],
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(diffText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("差异已复制到剪贴板");
  };

  const handleDownload = () => {
    const base = (leftName ?? "diff").replace(/\.[^.]+$/, "");
    downloadText(diffText, `${base}.diff`);
  };

  return (
    <div
      {...pageDropProps}
      className={cn(
        "relative mx-auto max-w-7xl space-y-4 px-4 py-6",
        isOverPage &&
          "after:pointer-events-none after:absolute after:inset-2 after:rounded-2xl after:border-2 after:border-dashed after:border-primary",
      )}
    >
      {/* 文件来源 */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SidePanel
          title="原文"
          value={left}
          fileName={leftName}
          onLoad={(file) => void loadFile(file, "left")}
          onClear={() => clearSide("left")}
        />
        <SidePanel
          title="对比文本"
          value={right}
          fileName={rightName}
          onLoad={(file) => void loadFile(file, "right")}
          onClear={() => clearSide("right")}
        />
      </div>

      {/* 差异编辑器 */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {/* 选项栏 */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-border bg-muted/50 px-3 py-2">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">语言</Label>
            <Select
              value={language}
              onValueChange={(v) => {
                setLanguage(v);
                setLanguageLocked(true);
              }}
            >
              <SelectTrigger className="h-8 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONACO_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">视图</Label>
            <Select
              value={sideBySide ? "split" : "inline"}
              onValueChange={(v) => setSideBySide(v === "split")}
            >
              <SelectTrigger className="h-8 w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="split">并排</SelectItem>
                <SelectItem value="inline">内联</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ToggleSwitch label="忽略首尾空白" checked={ignoreTrimWs} onChange={setIgnoreTrimWs} />
          <ToggleSwitch label="忽略大小写" checked={ignoreCase} onChange={setIgnoreCase} />
          <ToggleSwitch
            label="自动换行"
            checked={wordWrap === "on"}
            onChange={(v) => setWordWrap(v ? "on" : "off")}
          />
          <ToggleSwitch label="折叠未变更区域" checked={collapseUnchanged} onChange={setCollapseUnchanged} />

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditable(!editable)}
              disabled={ignoreCase}
            >
              {editable ? <Pencil className="size-3.5" /> : <Lock className="size-3.5" />}
              {editable ? "可编辑" : "只读"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleExample}>
              <Star className="size-3.5" /> 示例
            </Button>
            <Button variant="outline" size="sm" onClick={handleSwap} disabled={!left && !right}>
              <ArrowLeftRight className="size-3.5" /> 交换
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearAll} disabled={!left && !right}>
              <Eraser className="size-3.5" /> 全部清空
            </Button>
          </div>
        </div>

        {/* 状态栏 */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <GitCompareArrows className="size-4 text-amber-500" />
            {!hasContent ? (
              <span className="text-muted-foreground">等待输入内容</span>
            ) : stats.count === 0 ? (
              <span className="text-muted-foreground">两段内容完全相同</span>
            ) : (
              <span className="flex items-center gap-2 text-xs">
                <span className="font-medium text-foreground">{stats.count} 处差异</span>
                <span className="text-red-600">删除 {stats.deleted} 行</span>
                <span className="text-green-600">新增 {stats.inserted} 行</span>
              </span>
            )}
            {ignoreCase && (
              <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                忽略大小写 · 只读预览
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={() => gotoChange(-1)} disabled={stats.count === 0}>
              <ChevronUp className="size-3.5" /> 上一处
            </Button>
            <Button variant="outline" size="sm" onClick={() => gotoChange(1)} disabled={stats.count === 0}>
              <ChevronDown className="size-3.5" /> 下一处
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy} disabled={stats.count === 0}>
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} 复制差异
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={stats.count === 0}>
              <Download className="size-3.5" /> 下载
            </Button>
          </div>
        </div>

        {/* 编辑器 */}
        <div className="relative h-[62vh] min-h-[360px]">
          <div ref={containerRef} className="h-full w-full" />
          {!monaco && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-card text-sm text-muted-foreground">
              <Spinner className="size-4" /> 正在加载编辑器…
            </div>
          )}
          {monaco && !hasContent && (
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
              <FileDiff className="size-10 opacity-30" />
              <p>拖入文件、点击上方「选择文件」，或直接在编辑器中输入内容</p>
            </div>
          )}
        </div>
      </div>

      {/* 使用说明 */}
      <div className="rounded-xl border border-border bg-muted p-5">
        <div className="mb-3 flex items-center gap-2">
          <WrapText className="size-4 text-muted-foreground" />
          <Label className="text-sm font-medium">使用说明</Label>
        </div>
        <ul className="list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
          <li>点击「选择文件」或直接把文件拖到页面上即可对比本地文件，语言会按扩展名自动识别。</li>
          <li>一次拖入两个文件时，第一个作为原文（左），第二个作为对比文本（右）。</li>
          <li>编辑器默认可直接编辑，左右两侧都能粘贴或修改，差异实时更新。</li>
          <li>「并排」左右对照、「内联」在同一列中用增删标记展示，适合长行文本。</li>
          <li>打开「折叠未变更区域」可快速浏览大文件；「忽略首尾空白」只比较行首尾之外的差异。</li>
          <li>「复制差异 / 下载」导出的是标准 unified diff，可直接用 git apply 或 patch 应用。</li>
        </ul>
      </div>
    </div>
  );
}
