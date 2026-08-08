import Editor from "@monaco-editor/react";
import { loader } from "@monaco-editor/react";
import {
  Braces,
  Check,
  Code,
  Copy,
  Download,
  Hash,
  Lock,
  WrapText
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ── 本地化 Monaco Editor ─────────────────────────────────────────
// 默认情况下 @monaco-editor/react 会从 CDN（cdn.jsdelivr.net）加载
// Monaco Editor 资源。这里通过 loader.config({ paths }) 将加载路径
// 指向 public/monaco-editor/vs（由 scripts/copy-monaco.js 生成），
// 实现完全本地化。Monaco 的 AMD loader 会自动处理 worker 的创建。
loader.config({
  paths: {
    vs: "/monaco-editor/vs",
  },
});

/** 常用语言列表，用于语言切换下拉框 */
export const MONACO_LANGUAGES = [
  { value: "plaintext", label: "Plain Text" },
  { value: "json", label: "JSON" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "xml", label: "XML" },
  { value: "markdown", label: "Markdown" },
  { value: "yaml", label: "YAML" },
  { value: "ini", label: "Properties / INI" },
  { value: "shell", label: "Shell" },
  { value: "sql", label: "SQL" },
  { value: "python", label: "Python" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
];

interface MonacoEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  /** 默认语言，当 showLanguageSelector 为 true 时作为初始值 */
  language?: string;
  height?: string | number;
  readOnly?: boolean;
  /** 是否显示语言切换下拉框，默认 false */
  showLanguageSelector?: boolean;
  /** 语言切换时的回调 */
  onLanguageChange?: (language: string) => void;
  /** 工具栏左侧自定义内容 */
  toolbar?: React.ReactNode;
  /** 工具栏右侧自定义内容 */
  actions?: React.ReactNode;
  /** 是否显示行号切换按钮 */
  showLineNumbersToggle?: boolean;
  /** 是否显示自动换行切换按钮 */
  showWordWrapToggle?: boolean;
  /** 是否显示复制按钮 */
  showCopyButton?: boolean;
  /** 是否显示下载按钮 */
  showDownloadButton?: boolean;
  /** 下载回调 */
  onDownload?: () => void;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value = "",
  onChange,
  language = "json",
  height = "400px",
  readOnly = false,
  showLanguageSelector = false,
  onLanguageChange,
  toolbar,
  actions,
  showLineNumbersToggle = false,
  showWordWrapToggle = false,
  showCopyButton = false,
  showDownloadButton = false,
  onDownload,
}) => {
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wordWrap, setWordWrap] = useState<"on" | "off">("on");
  const [copied, setCopied] = useState(false);

  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument").run();
    }
  };

  useEffect(() => {
    setCurrentLanguage(language);
  }, [language]);

  const handleLanguageChange = (lang: string) => {
    setCurrentLanguage(lang);
    onLanguageChange?.(lang);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-100 bg-gray-50/80 px-3 py-1.5">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {showLanguageSelector ? (
            <Select value={currentLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger className="h-7 w-auto gap-1 border-none bg-transparent px-1.5 text-xs font-medium shadow-none hover:bg-gray-100">
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
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-gray-500">
              <Braces className="size-3" />
              {currentLanguage.toUpperCase()}
            </span>
          )}

          {toolbar}

          {/* Built-in toggles */}
          {showLineNumbersToggle && (
            <Button
              variant="ghost"
              size="icon-xs"
              className={cn(!showLineNumbers && "opacity-40")}
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              title="切换行号"
            >
              <Hash className="size-3" />
            </Button>
          )}
          {showWordWrapToggle && (
            <Button
              variant="ghost"
              size="icon-xs"
              className={cn(wordWrap === "off" && "opacity-40")}
              onClick={() => setWordWrap(wordWrap === "on" ? "off" : "on")}
              title="切换自动换行"
            >
              <WrapText className="size-3" />
            </Button>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-1.5">
          {actions}

          {!readOnly && editorRef.current && <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleFormat}
            title="格式化"
          >
            <Code className="size-3" />
          </Button>}

          {showCopyButton && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleCopy}
              disabled={!value}
              title="复制"
            >
              {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
            </Button>
          )}
          {showDownloadButton && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onDownload}
              disabled={!value}
              title="下载"
            >
              <Download className="size-3" />
            </Button>
          )}

          {readOnly && (
            <span className="inline-flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
              <Lock className="size-2.5" />
              只读
            </span>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="min-h-0 flex-1">
        <Editor
          height={height}
          language={currentLanguage}
          theme="vs"
          value={value}
          onMount={handleEditorDidMount}
          onChange={(v) => onChange && onChange(v || "")}
          options={{
            fontSize: 13,
            mouseWheelZoom: true,
            minimap: { enabled: false },
            readOnly,
            wordWrap,
            lineNumbers: showLineNumbers ? "on" : "off",
            automaticLayout: true,
            scrollBeyondLastLine: false,
            folding: true,
            renderLineHighlight: "all",
            fontFamily:
              "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
};

export default MonacoEditor;
