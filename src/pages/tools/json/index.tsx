import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { JSONPath } from "jsonpath-plus";
import {
  ArrowLeftRight,
  Braces,
  Check,
  Code2,
  Copy,
  Download,
  Eraser,
  FileText,
  Filter,
  KeyRound,
  Star,
  TriangleAlert,
} from "lucide-react";
import { useMemo, useState } from "react";

import MonacoEditor from "@/components/MonacoEditor"

// ─── Types ───────────────────────────────────────────────────────

type ToolId = "format" | "extract";

interface ComputeResult {
  output: string;
  error: string;
  stats: { size: number; lines: number; keys: number; depth: number } | null;
}

const EMPTY_RESULT: ComputeResult = {
  output: "",
  error: "",
  stats: null,
};

// ─── Shared helpers ──────────────────────────────────────────────

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

function downloadFile(content: string, filename: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// ─── CopyButton ──────────────────────────────────────────────────

function CopyButton({ text, disabled }: { text: string; disabled?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled || !text}
      onClick={() => {
        copyToClipboard(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "已复制" : "复制"}
    </Button>
  );
}

// ═════════════════════════════════════════════════════════════════
// Pure helper functions
// ═════════════════════════════════════════════════════════════════

function getDepth(obj: any, d = 0): number {
  if (typeof obj !== "object" || obj === null) return d;
  if (Array.isArray(obj)) {
    if (obj.length === 0) return d + 1;
    return Math.max(...obj.map((item) => getDepth(item, d + 1)));
  }
  const vals = Object.values(obj);
  if (vals.length === 0) return d + 1;
  return Math.max(...vals.map((v) => getDepth(v, d + 1)));
}

function countKeys(obj: any): number {
  if (typeof obj !== "object" || obj === null) return 0;
  if (Array.isArray(obj)) return obj.reduce((acc, v) => acc + countKeys(v), 0);
  return Object.keys(obj).length + Object.values(obj).reduce((acc: number, v) => acc + countKeys(v), 0);
}

function processJson(parsed: any, opts: { sortKeys: boolean }): any {
  if (typeof parsed !== "object" || parsed === null) return parsed;
  if (Array.isArray(parsed)) return parsed.map((v) => processJson(v, opts));
  let entries = Object.entries(parsed).map(([k, v]) => [k, processJson(v, opts)]);
  if (opts.sortKeys) entries = entries.sort(([a], [b]) => a.localeCompare(b));
  return Object.fromEntries(entries);
}

// ─── Examples ────────────────────────────────────────────────────

const FORMATTER_EXAMPLE = `{"name":"Tools","version":"1.0.0","description":"开发者工具集","features":["JSON格式化","JSON提取","Excel转换"],"config":{"theme":"dark","language":"zh-CN","indent":2},"active":true,"count":42}`;

const EXTRACTOR_EXAMPLE = JSON.stringify([
  { id: 1, name: "John Doe", email: "john@example.com", address: { city: "New York", country: "USA" } },
  { id: 2, name: "Jane Smith", email: "jane@example.com", address: { city: "London", country: "UK" } },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", address: { city: "Tokyo", country: "Japan" } },
], null, 2);

const quickPaths = [
  { label: "$", desc: "Root" }, { label: "$.*", desc: "All" }, { label: "$[0]", desc: "First" },
  { label: "$[*]", desc: "All Items" }, { label: "$[-1]", desc: "Last" }, { label: "$..id", desc: "Recursive" },
];

// ═════════════════════════════════════════════════════════════════
// Main Page
// ═════════════════════════════════════════════════════════════════

export default function JsonToolsPage() {
  // ── Shared state ───────────────────────────────────────────────
  const [input, setInput] = useState("");
  const [activeTool, setActiveTool] = useState<ToolId>("format");
  const [overrideOutput, setOverrideOutput] = useState<string | null>(null);

  // ── Formatter state ────────────────────────────────────────────
  const [indent, setIndent] = useState("2");
  const [compact, setCompact] = useState(false);
  const [sortKeys, setSortKeys] = useState(false);
  const [escapeUnicode, setEscapeUnicode] = useState(false);

  // ── Extractor state ────────────────────────────────────────────
  const [mode, setMode] = useState<"path" | "field" | "keys">("path");
  const [jsonPath, setJsonPath] = useState("$");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [preserveStructure, setPreserveStructure] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(false);
  const [keysMode, setKeysMode] = useState<"keys" | "values">("keys");
  const [includeNested, setIncludeNested] = useState(true);
  const [sortResults, setSortResults] = useState(true);
  const [outputFormat, setOutputFormat] = useState<"array" | "list">("array");

  // ── Clear override on input / tool change ──────────────────────
  const handleInputChange = (val: string) => {
    setOverrideOutput(null);
    setInput(val);
  };

  const handleToolChange = (tool: string) => {
    setOverrideOutput(null);
    setActiveTool(tool as ToolId);
  };

  // ── Available fields (for Extractor) ───────────────────────────
  const availableFields = useMemo(() => {
    if (!input.trim()) return [];
    try {
      const p = JSON.parse(input);
      const fields = new Set<string>();
      const traverse = (obj: any, prefix = "") => {
        if (Array.isArray(obj)) obj.forEach((item) => { if (typeof item === "object" && item) traverse(item, prefix); });
        else if (obj !== null && typeof obj === "object") Object.keys(obj).forEach((key) => { const fk = prefix ? `${prefix}.${key}` : key; fields.add(fk); if (typeof obj[key] === "object" && obj[key] !== null) traverse(obj[key], fk); });
      };
      traverse(p);
      return Array.from(fields).sort();
    } catch { return []; }
  }, [input]);

  // ── Compute: Formatter ─────────────────────────────────────────
  const formatResult = useMemo<ComputeResult | null>(() => {
    if (activeTool !== "format") return null;
    if (!input.trim()) return EMPTY_RESULT;
    try {
      let p = JSON.parse(input);
      p = processJson(p, { sortKeys });
      const indentVal = compact ? 0 : parseInt(indent);
      let out = JSON.stringify(p, null, indentVal);
      if (escapeUnicode) out = out.replace(/[\u0080-\uffff]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`);
      return { output: out, error: "", stats: { size: new Blob([out]).size, lines: out.split("\n").length, keys: countKeys(p), depth: getDepth(p) } };
    } catch (e: any) {
      return { ...EMPTY_RESULT, error: e.message };
    }
  }, [activeTool, input, indent, compact, sortKeys, escapeUnicode]);

  // ── Compute: Extractor ─────────────────────────────────────────
  const extractResult = useMemo<ComputeResult | null>(() => {
    if (activeTool !== "extract") return null;
    if (!input.trim()) return EMPTY_RESULT;
    try {
      const parsed = JSON.parse(input);
      let extracted: any = null;
      if (mode === "path" && jsonPath.trim()) {
        extracted = JSONPath({ path: jsonPath, json: parsed, wrap: false });
      } else if (mode === "field" && selectedFields.length > 0) {
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        const result = arr.map((item: any) => {
          const ext: any = {};
          selectedFields.forEach((field) => {
            const getNested = (obj: any, keys: string[]): any => { if (!keys.length) return obj; const [h, ...r] = keys; if (obj == null) return undefined; if (Array.isArray(obj)) return obj.map((e) => getNested(e, keys)).filter((v) => v !== undefined) || undefined; return getNested(obj[h], r); };
            const v = getNested(item, field.split("."));
            if (removeEmpty && (v === null || v === undefined || v === "")) return;
            if (preserveStructure) { const keys = field.split("."); let cur = ext; for (let i = 0; i < keys.length - 1; i++) { cur[keys[i]] = cur[keys[i]] || {}; cur = cur[keys[i]]; } cur[keys[keys.length - 1]] = v; }
            else ext[field] = v;
          });
          return ext;
        });
        extracted = Array.isArray(parsed) ? result : result[0];
      } else if (mode === "keys") {
        if (keysMode === "keys") {
          const keys = new Set<string>();
          const traverse = (obj: any, path = "") => {
            if (Array.isArray(obj)) obj.forEach((item) => { if (typeof item === "object" && item) traverse(item, path); });
            else if (obj !== null && typeof obj === "object") Object.keys(obj).forEach((key) => { const fp = includeNested && path ? `${path}.${key}` : key; keys.add(fp); if (typeof obj[key] === "object" && obj[key] !== null) traverse(obj[key], fp); });
          };
          traverse(parsed);
          let ka = Array.from(keys); if (sortResults) ka.sort();
          extracted = outputFormat === "list" ? ka.join("\n") : ka;
        } else {
          const values: any[] = [];
          const traverse = (obj: any) => { if (Array.isArray(obj)) obj.forEach((item) => { if (typeof item === "object" && item) traverse(item); else values.push(item); }); else if (obj !== null && typeof obj === "object") Object.values(obj).forEach((v) => { if (typeof v === "object" && v !== null) traverse(v); else values.push(v); }); };
          traverse(parsed);
          let uv = Array.from(new Set(values)); if (sortResults) uv.sort();
          extracted = outputFormat === "list" ? uv.join("\n") : uv;
        }
      }
      let out = "";
      if (extracted !== null && extracted !== undefined) {
        out = typeof extracted === "string" ? extracted : JSON.stringify(extracted, null, 2);
      }
      return { output: out, error: "", stats: null };
    } catch (e: any) {
      return { ...EMPTY_RESULT, error: e.message };
    }
  }, [activeTool, input, mode, jsonPath, selectedFields, preserveStructure, removeEmpty, keysMode, includeNested, sortResults, outputFormat]);

  // ── Active result ──────────────────────────────────────────────
  const result = formatResult ?? extractResult ?? EMPTY_RESULT;
  const displayOutput = overrideOutput ?? result.output;

  // ── Handlers ───────────────────────────────────────────────────
  const handleExample = () => {
    setOverrideOutput(null);
    if (activeTool === "format") setInput(FORMATTER_EXAMPLE);
    else if (activeTool === "extract") { setInput(EXTRACTOR_EXAMPLE); setJsonPath("$[*].name"); }
  };

  const handleClear = () => {
    setOverrideOutput(null);
    setInput("");
  };

  const handleDownload = () => {
    if (activeTool === "extract") downloadFile(displayOutput, "extracted.json", "application/json");
    else downloadFile(displayOutput, "formatted.json", "application/json");
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <>
      <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

          {/* Input + Output */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Input */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between h-10">
                <Label className="text-sm font-medium">输入 (JSON)</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExample}><Star className="size-3.5" /> 示例</Button>
                  <Button variant="outline" size="sm" onClick={handleClear} disabled={!input}><Eraser className="size-3.5" /> 清空</Button>
                </div>
              </div>
              <div className="h-[340px]">
                <MonacoEditor value={input} onChange={handleInputChange} language="json" height="100%" showLineNumbersToggle showWordWrapToggle />
              </div>
            </div>

            {/* Output */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between h-10">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">输出</Label>
                  {/* Stats (Formatter only) */}
                  {result.stats && (
                    <div className="flex flex-wrap gap-1">
                      {[
                        { label: "大小", value: formatSize(result.stats.size) },
                        { label: "行", value: result.stats.lines },
                        { label: "键", value: result.stats.keys },
                        { label: "深", value: result.stats.depth },
                      ].map((s) => (
                        <span key={s.label} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{s.label}: {s.value}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {displayOutput && <CopyButton text={displayOutput} />}
                  {displayOutput && (
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="size-3.5" /> 下载
                    </Button>
                  )}
                </div>
              </div>
              <div className="h-[340px]">
                {result.error ? (
                  <div className="flex h-full flex-col items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    <TriangleAlert className="size-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">处理出错</p>
                      <p className="text-xs mt-1 opacity-90 break-all">{result.error}</p>
                    </div>
                  </div>
                ) : displayOutput ? (
                  <MonacoEditor value={displayOutput} readOnly language="json" height="100%" showCopyButton showDownloadButton showWordWrapToggle onDownload={handleDownload} />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center rounded-lg border border-gray-200 bg-white text-sm text-gray-400">
                    <FileText className="size-10 opacity-30 mb-3" />
                    {input.trim() ? "等待处理..." : "输入内容后自动处理"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tool Tabs + Options */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <Tabs value={activeTool} onValueChange={handleToolChange}>
              <TabsList className="w-full rounded-none border-b border-gray-100 bg-gray-50/50">
                <TabsTrigger value="format" className="flex-1"><Braces className="size-4" /> 格式化</TabsTrigger>
                <TabsTrigger value="extract" className="flex-1"><Filter className="size-4" /> 提取</TabsTrigger>
              </TabsList>

              {/* ── Formatter Options ───────────────────────────── */}
              <TabsContent value="format" className="p-5">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-gray-500">缩进</Label>
                    <Select value={indent} onValueChange={setIndent} disabled={compact}>
                      <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 空格</SelectItem>
                        <SelectItem value="2">2 空格</SelectItem>
                        <SelectItem value="4">4 空格</SelectItem>
                        <SelectItem value="8">8 空格</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={compact} onCheckedChange={setCompact} />
                    <Label className="text-xs cursor-pointer" onClick={() => setCompact(!compact)}>压缩</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={sortKeys} onCheckedChange={setSortKeys} />
                    <Label className="text-xs cursor-pointer" onClick={() => setSortKeys(!sortKeys)}>排序 Key</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={escapeUnicode} onCheckedChange={setEscapeUnicode} />
                    <Label className="text-xs cursor-pointer" onClick={() => setEscapeUnicode(!escapeUnicode)}>转义 Unicode</Label>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <Button size="sm" disabled={!input.trim()} onClick={() => setOverrideOutput(null)}>
                      <Code2 className="size-3.5" /> 重新格式化
                    </Button>
                    <Button variant="outline" size="sm" disabled={!input.trim()} onClick={() => setOverrideOutput(JSON.stringify(input))}>
                      <ArrowLeftRight className="size-3.5" /> 转义字符串
                    </Button>
                    <Button variant="outline" size="sm" disabled={!input.trim()} onClick={() => {
                      try {
                        const u = JSON.parse(input);
                        if (typeof u === "string") { setOverrideOutput(u); return; }
                      } catch { }
                      setOverrideOutput(input.replace(/\\\\/g, "\\").replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\t/g, "\t").replace(/\\r/g, "\r"));
                    }}>
                      <ArrowLeftRight className="size-3.5" /> 反转义字符串
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* ── Extractor Options ───────────────────────────── */}
              <TabsContent value="extract" className="p-5">
                <Tabs value={mode} onValueChange={(v) => setMode(v as "path" | "field" | "keys")}>
                  <TabsList>
                    <TabsTrigger value="path"><Code2 className="size-3.5" /> JSONPath</TabsTrigger>
                    <TabsTrigger value="field"><Filter className="size-3.5" /> 字段提取</TabsTrigger>
                    <TabsTrigger value="keys"><KeyRound className="size-3.5" /> 键值提取</TabsTrigger>
                  </TabsList>

                  <TabsContent value="path" className="mt-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Input value={jsonPath} onChange={(e) => setJsonPath(e.target.value)} placeholder="$.store.book[*].author" className="font-mono flex-1" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quickPaths.map((qp) => (
                        <Button key={qp.label} variant="outline" size="xs" className="font-mono" onClick={() => setJsonPath(qp.label)}>
                          {qp.label}<span className="text-gray-400 ml-1">· {qp.desc}</span>
                        </Button>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="field" className="mt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-gray-500">可用字段 ({availableFields.length})</Label>
                      <div className="flex gap-1">
                        <Button variant="link" size="xs" onClick={() => setSelectedFields([...availableFields])}>全选</Button>
                        <Button variant="link" size="xs" onClick={() => setSelectedFields([])}>清空</Button>
                      </div>
                    </div>
                    <div className="h-40 overflow-y-auto rounded-lg border border-gray-200 p-2 space-y-1">
                      {availableFields.length > 0 ? availableFields.map((field) => (
                        <div key={field} className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedFields.includes(field)}
                            onCheckedChange={(c) => {
                              if (c) setSelectedFields([...selectedFields, field]);
                              else setSelectedFields(selectedFields.filter((f) => f !== field));
                            }}
                          />
                          <span className="text-xs font-mono cursor-pointer flex-1">{field}</span>
                        </div>
                      )) : <div className="flex h-full items-center justify-center text-xs text-gray-400">暂无字段</div>}
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <Switch checked={preserveStructure} onCheckedChange={setPreserveStructure} />
                        <Label className="text-xs cursor-pointer" onClick={() => setPreserveStructure(!preserveStructure)}>保持结构</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={removeEmpty} onCheckedChange={setRemoveEmpty} />
                        <Label className="text-xs cursor-pointer" onClick={() => setRemoveEmpty(!removeEmpty)}>移除空值</Label>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="keys" className="mt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 max-w-xs">
                      <Button variant={keysMode === "keys" ? "default" : "outline"} size="sm" onClick={() => setKeysMode("keys")}>提取键</Button>
                      <Button variant={keysMode === "values" ? "default" : "outline"} size="sm" onClick={() => setKeysMode("values")}>提取值</Button>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {keysMode === "keys" && (
                        <div className="flex items-center gap-2">
                          <Switch checked={includeNested} onCheckedChange={setIncludeNested} />
                          <Label className="text-xs cursor-pointer" onClick={() => setIncludeNested(!includeNested)}>包含嵌套路径</Label>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Switch checked={sortResults} onCheckedChange={setSortResults} />
                        <Label className="text-xs cursor-pointer" onClick={() => setSortResults(!sortResults)}>排序结果</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-gray-500">输出格式</Label>
                        <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as "array" | "list")}>
                          <SelectTrigger className="w-40 h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="array">数组</SelectItem>
                            <SelectItem value="list">列表 (换行分隔)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
