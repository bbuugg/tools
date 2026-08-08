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
import { type SiteDefination } from "@/lib/site";
import { JSONPath } from "jsonpath-plus";
import {
  ArrowLeftRight,
  Braces,
  Check,
  Code2,
  Copy,
  Download,
  Eraser,
  FileSpreadsheet,
  FileText,
  Filter,
  KeyRound,
  Settings2,
  Star,
  TriangleAlert,
} from "lucide-react";
import { useMemo, useState } from "react";
import * as XLSX from "xlsx";

import MonacoEditor from "@/components/MonacoEditor"

// ─── Types ───────────────────────────────────────────────────────

type ToolId = "format" | "convert" | "excel" | "extract";

interface ComputeResult {
  output: string;
  error: string;
  excelBlob: Blob | null;
  previewData: Record<string, unknown>[];
  previewHeaders: string[];
  stats: { size: number; lines: number; keys: number; depth: number } | null;
}

const EMPTY_RESULT: ComputeResult = {
  output: "",
  error: "",
  excelBlob: null,
  previewData: [],
  previewHeaders: [],
  stats: null,
};

// ─── Shared helpers ──────────────────────────────────────────────

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

function downloadFile(content: string | Blob, filename: string, mime = "text/plain") {
  const blob = typeof content === "string" ? new Blob([content], { type: mime }) : content;
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
// Pure conversion functions
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

function escapeXml(unsafe: string): string {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function escapeCSV(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
function escapeYaml(value: string): string {
  if (/^[-:?!,[\\]{}#&*!|>'"%@`]|^[0-9]/.test(value) || /^(true|false|null|y|n|yes|no|on|off)$/i.test(value) || value.includes("\n") || value.includes(" ")) return `'${value.replace(/'/g, "''")}'`;
  return value;
}

function jsonToXml(jsonString: string, rootName = "root"): string {
  const jsonObj = JSON.parse(jsonString);
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  const convert = (obj: unknown, nodeName: string, indent = ""): string => {
    if (obj === null || obj === undefined) return `${indent}<${nodeName}></${nodeName}>\n`;
    if (typeof obj !== "object") return `${indent}<${nodeName}>${escapeXml(String(obj))}</${nodeName}>\n`;
    if (Array.isArray(obj)) return obj.map((item) => convert(item, nodeName, indent)).join("");
    let result = `${indent}<${nodeName}>\n`;
    for (const key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) result += convert((obj as any)[key], key, indent + "  "); }
    return result + `${indent}</${nodeName}>\n`;
  };
  return xml + convert(jsonObj, rootName);
}

function xmlToJson(xmlString: string): string {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");
  if (xmlDoc.getElementsByTagName("parsererror").length > 0) throw new Error("XML 解析错误");
  const processNode = (node: Element): unknown => {
    if (node.childNodes.length === 0 || (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3)) {
      const text = node.textContent || "";
      if (text === "true") return true;
      if (text === "false") return false;
      if (!isNaN(Number(text)) && text.trim() !== "") return Number(text);
      return text;
    }
    const result: Record<string, unknown> = {};
    const counts: Record<string, Element[]> = {};
    Array.from(node.children).forEach((child) => { (counts[child.nodeName] ||= []).push(child); });
    for (const [name, els] of Object.entries(counts)) result[name] = els.length === 1 ? processNode(els[0]) : els.map(processNode);
    return result;
  };
  return JSON.stringify(processNode(xmlDoc.documentElement), null, 2);
}

function jsonToCsv(jsonString: string, delimiter = ","): string {
  const jsonObj = JSON.parse(jsonString);
  const arr = Array.isArray(jsonObj) ? jsonObj : [jsonObj];
  if (arr.length === 0) return "";
  const fields = Array.from(new Set(arr.flatMap((item: any) => typeof item === "object" && item ? Object.keys(item) : [])));
  let csv = fields.map(escapeCSV).join(delimiter) + "\n";
  arr.forEach((item: any) => { csv += fields.map((f) => { const v = item?.[f]; return v !== null && typeof v === "object" ? escapeCSV(JSON.stringify(v)) : escapeCSV(String(v ?? "")); }).join(delimiter) + "\n"; });
  return csv;
}

function csvToJson(csvString: string, delimiter = ","): string {
  const lines = csvString.trim().split(/\r?\n/);
  if (lines.length === 0) return "[]";
  const parseLine = (line: string): string[] => {
    const result: string[] = []; let current = ""; let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { if (i + 1 < line.length && line[i + 1] === '"') { current += '"'; i++; } else inQ = !inQ; }
      else if (c === delimiter && !inQ) { result.push(current); current = ""; }
      else current += c;
    }
    result.push(current); return result;
  };
  const headers = parseLine(lines[0]);
  const result: Record<string, unknown>[] = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseLine(lines[i]);
    const obj: Record<string, unknown> = {};
    headers.forEach((h, j) => { const v = (values[j] || "").trim(); obj[h] = v === "true" ? true : v === "false" ? false : !isNaN(Number(v)) && v !== "" ? Number(v) : v; });
    result.push(obj);
  }
  return JSON.stringify(result, null, 2);
}

function jsonToYaml(jsonString: string): string {
  const jsonObj = JSON.parse(jsonString);
  const convert = (obj: unknown, indent = 0): string => {
    if (obj === null || obj === undefined) return "null";
    const sp = " ".repeat(indent);
    if (typeof obj !== "object") return typeof obj === "string" ? escapeYaml(obj) : String(obj);
    if (Array.isArray(obj)) { if (obj.length === 0) return "[]"; return obj.map((item) => typeof item === "object" && item !== null ? `${sp}- ${convert(item, indent + 2).trimStart()}` : `${sp}- ${convert(item, indent)}`).join("\n"); }
    if (Object.keys(obj).length === 0) return "{}";
    return Object.entries(obj).map(([k, v]) => { const yk = /^[a-zA-Z0-9_]+$/.test(k) ? k : `'${k}'`; return typeof v === "object" && v !== null ? `${sp}${yk}:\n${convert(v, indent + 2)}` : `${sp}${yk}: ${convert(v, indent)}`; }).join("\n");
  };
  return convert(jsonObj);
}

function yamlToJson(yamlString: string): string {
  const lines = yamlString.split(/\r?\n/);
  const getIndent = (line: string) => { let i = 0; while (i < line.length && line[i] === " ") i++; return i; };
  const parseScalar = (v: string): unknown => {
    if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) return v.substring(1, v.length - 1);
    if (v === "null" || v === "~" || v === "") return null;
    if (v === "true" || v === "yes" || v === "on") return true;
    if (v === "false" || v === "no" || v === "off") return false;
    if (!isNaN(Number(v))) return Number(v);
    return v;
  };
  const splitKV = (line: string): [string, string] => { const ci = line.indexOf(":"); if (ci === -1) return [line, ""]; let key = line.substring(0, ci).trim(); if ((key.startsWith("'") && key.endsWith("'")) || (key.startsWith('"') && key.endsWith('"'))) key = key.substring(1, key.length - 1); return [key, line.substring(ci + 1)]; };
  const parse = (idx: number, minIndent: number): [unknown, number] => {
    let result: any = null; let i = idx; const curIndent = getIndent(lines[i]); let isArr = lines[i].trimStart().startsWith("-");
    if (isArr) {
      result = [];
      while (i < lines.length) { const line = lines[i]; if (!line.trim()) { i++; continue; } const li = getIndent(line); if (li < minIndent) break; if (line.trimStart().startsWith("-")) { const txt = line.trim().substring(1).trimStart(); if (txt.includes(":")) { const [k, vp] = splitKV(txt); const item: any = {}; if (vp.trim()) item[k] = parseScalar(vp.trim()); else if (i + 1 < lines.length && getIndent(lines[i + 1]) > li) { const [n, ni] = parse(i + 1, li + 2); item[k] = n; i = ni - 1; } else item[k] = null; result.push(item); } else if (txt) result.push(parseScalar(txt)); else if (i + 1 < lines.length && getIndent(lines[i + 1]) > li) { const [n, ni] = parse(i + 1, li + 2); result.push(n); i = ni - 1; } else result.push(null); } else if (li === curIndent) break; i++; }
    } else {
      result = {};
      while (i < lines.length) { const line = lines[i]; if (!line.trim()) { i++; continue; } const li = getIndent(line); if (li < minIndent) break; if (li === minIndent) { if (line.trimStart().startsWith("-")) break; if (line.includes(":")) { const [k, vp] = splitKV(line.trim()); if (vp.trim()) result[k] = parseScalar(vp.trim()); else if (i + 1 < lines.length && getIndent(lines[i + 1]) > li) { const [n, ni] = parse(i + 1, li + 2); result[k] = n; i = ni - 1; } else result[k] = null; } } i++; }
    }
    return [result, i];
  };
  return JSON.stringify(parse(0, 0)[0], null, 2);
}

/** Serialize non-primitive values (objects/arrays) to JSON strings for display/export. */
function serializeValue(v: unknown): unknown {
  if (v !== null && typeof v === "object") return JSON.stringify(v);
  return v;
}

function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, unknown> {
  return Object.entries(obj).reduce((acc, [key, val]) => {
    const nk = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === "object" && !Array.isArray(val)) Object.assign(acc, flattenObject(val as Record<string, unknown>, nk));
    else acc[nk] = serializeValue(val);
    return acc;
  }, {} as Record<string, unknown>);
}

function parseInputForExcel(input: string, flatten: boolean): { data: Record<string, unknown>[]; headers: string[] } | null {
  try {
    const parsed = JSON.parse(input);
    let arr: Record<string, unknown>[] = Array.isArray(parsed) ? parsed.filter((i) => typeof i === "object" && i !== null) : typeof parsed === "object" && parsed !== null ? [parsed] : [];
    if (arr.length === 0) return null;
    const data = flatten
      ? arr.map((r) => flattenObject(r))
      : arr.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, serializeValue(v)])));
    const headers = Array.from(new Set(data.flatMap((r) => Object.keys(r))));
    return { data, headers };
  } catch { return null; }
}

function toCSV2(data: Record<string, unknown>[], headers: string[], delimiter: string, includeHeaders: boolean): string {
  const esc = (v: unknown) => { const s = String(v ?? ""); return s.includes(delimiter) || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s; };
  const rows: string[] = [];
  if (includeHeaders) rows.push(headers.map(esc).join(delimiter));
  for (const row of data) rows.push(headers.map((h) => esc(row[h])).join(delimiter));
  return rows.join("\n");
}

function toSQL(data: Record<string, unknown>[], headers: string[], tableName: string, sqlType: "INSERT" | "CREATE_TABLE", batch: boolean): string {
  const escVal = (v: unknown) => { if (v === null || v === undefined) return "NULL"; if (typeof v === "number" || typeof v === "boolean") return String(v); return `'${String(v).replace(/'/g, "''")}'`; };
  const cols = headers.map((h) => `\`${h}\``).join(", ");
  if (sqlType === "CREATE_TABLE") {
    const colDefs = headers.map((h) => { const sample = data.find((r) => r[h] !== null && r[h] !== undefined)?.[h]; const type = typeof sample === "number" ? "DECIMAL(10,2)" : typeof sample === "boolean" ? "BOOLEAN" : "VARCHAR(255)"; return `  \`${h}\` ${type}`; }).join(",\n");
    const inserts = data.map((row) => `INSERT INTO \`${tableName}\` (${cols}) VALUES (${headers.map((h) => escVal(row[h])).join(", ")});`).join("\n");
    return `CREATE TABLE \`${tableName}\` (\n${colDefs}\n);\n\n${inserts}`;
  }
  if (batch) { const values = data.map((row) => `  (${headers.map((h) => escVal(row[h])).join(", ")})`).join(",\n"); return `INSERT INTO \`${tableName}\` (${cols}) VALUES\n${values};`; }
  return data.map((row) => `INSERT INTO \`${tableName}\` (${cols}) VALUES (${headers.map((h) => escVal(row[h])).join(", ")});`).join("\n");
}

// ─── Examples ────────────────────────────────────────────────────

const FORMATTER_EXAMPLE = `{"name":"Tools","version":"1.0.0","description":"开发者工具集","features":["JSON格式化","JSON提取","Excel转换"],"config":{"theme":"dark","language":"zh-CN","indent":2},"active":true,"count":42}`;

const CONVERTER_EXAMPLES: Record<string, { jsonTo: string; formatTo: string }> = {
  xml: {
    jsonTo: `{"person":{"name":"张三","age":28,"isStudent":false,"address":{"city":"北京","district":"海淀区"},"hobbies":["读书","旅游"]}}`,
    formatTo: `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n  <person>\n    <name>张三</name>\n    <age>28</age>\n    <isStudent>false</isStudent>\n    <address>\n      <city>北京</city>\n      <district>海淀区</district>\n    </address>\n    <hobbies>读书</hobbies>\n    <hobbies>旅游</hobbies>\n  </person>\n</root>`,
  },
  csv: {
    jsonTo: `[{"name":"张三","age":28},{"name":"李四","age":34}]`,
    formatTo: `name,age\n张三,28\n李四,34`,
  },
  yaml: {
    jsonTo: `{"person":{"name":"张三","age":28,"hobbies":["读书","编程"]}}`,
    formatTo: `person:\n  name: 张三\n  age: 28\n  hobbies:\n    - 读书\n    - 编程`,
  },
};

const EXCEL_EXAMPLE = `[
  { "id": 1, "name": "Alice", "age": 28, "city": "Beijing" },
  { "id": 2, "name": "Bob", "age": 34, "city": "Shanghai" },
  { "id": 3, "name": "Charlie", "age": 22, "city": "Guangzhou" }
]`;

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

export default function JsonToolsPage({ title, description }: SiteDefination) {
  // ── Shared state ───────────────────────────────────────────────
  const [input, setInput] = useState("");
  const [activeTool, setActiveTool] = useState<ToolId>("format");
  const [overrideOutput, setOverrideOutput] = useState<string | null>(null);

  // ── Formatter state ────────────────────────────────────────────
  const [indent, setIndent] = useState("2");
  const [compact, setCompact] = useState(false);
  const [sortKeys, setSortKeys] = useState(false);
  const [escapeUnicode, setEscapeUnicode] = useState(false);

  // ── Converter state ────────────────────────────────────────────
  const [formatType, setFormatType] = useState("xml");
  const [direction, setDirection] = useState<"json_to" | "format_to">("json_to");
  const [csvDelimiter, setCsvDelimiter] = useState(",");
  const [xmlRoot, setXmlRoot] = useState("root");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // ── Excel state ────────────────────────────────────────────────
  const [convType, setConvType] = useState<"excel" | "csv" | "sql">("excel");
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [flattenNested, setFlattenNested] = useState(true);
  const [autoFit, setAutoFit] = useState(true);
  const [sheetName, setSheetName] = useState("Sheet1");
  const [delimiter, setDelimiter] = useState(",");
  const [tableName, setTableName] = useState("my_table");
  const [sqlType, setSqlType] = useState<"INSERT" | "CREATE_TABLE">("INSERT");
  const [batchInsert, setBatchInsert] = useState(false);

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
      return { output: out, error: "", excelBlob: null, previewData: [], previewHeaders: [], stats: { size: new Blob([out]).size, lines: out.split("\n").length, keys: countKeys(p), depth: getDepth(p) } };
    } catch (e: any) {
      return { ...EMPTY_RESULT, error: e.message };
    }
  }, [activeTool, input, indent, compact, sortKeys, escapeUnicode]);

  // ── Compute: Converter ─────────────────────────────────────────
  const convertResult = useMemo<ComputeResult | null>(() => {
    if (activeTool !== "convert") return null;
    if (!input.trim()) return EMPTY_RESULT;
    try {
      let out = "";
      if (direction === "json_to") {
        JSON.parse(input);
        if (formatType === "xml") out = jsonToXml(input, xmlRoot);
        else if (formatType === "csv") out = jsonToCsv(input, csvDelimiter);
        else if (formatType === "yaml") out = jsonToYaml(input);
      } else {
        if (formatType === "xml") out = xmlToJson(input);
        else if (formatType === "csv") out = csvToJson(input, csvDelimiter);
        else if (formatType === "yaml") out = yamlToJson(input);
      }
      return { output: out, error: "", excelBlob: null, previewData: [], previewHeaders: [], stats: null };
    } catch (e: any) {
      return { ...EMPTY_RESULT, error: e.message || "转换失败" };
    }
  }, [activeTool, input, formatType, direction, csvDelimiter, xmlRoot]);

  // ── Compute: Excel ─────────────────────────────────────────────
  const excelResult = useMemo<ComputeResult | null>(() => {
    if (activeTool !== "excel") return null;
    if (!input.trim()) return EMPTY_RESULT;
    try {
      const parsed = parseInputForExcel(input, flattenNested);
      if (!parsed) throw new Error("无效的 JSON，请输入 JSON 数组或对象");
      const { data, headers } = parsed;
      if (convType === "excel") {
        const ws = XLSX.utils.json_to_sheet(data, { header: headers, skipHeader: !includeHeaders });
        if (autoFit) ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length, ...data.map((r) => String(r[h] ?? "").length)) }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName || "Sheet1");
        const blob = new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" });
        return { output: "", error: "", excelBlob: blob, previewData: data, previewHeaders: headers, stats: null };
      } else if (convType === "csv") {
        return { output: toCSV2(data, headers, delimiter, includeHeaders), error: "", excelBlob: null, previewData: data, previewHeaders: headers, stats: null };
      } else {
        return { output: toSQL(data, headers, tableName || "my_table", sqlType, batchInsert), error: "", excelBlob: null, previewData: data, previewHeaders: headers, stats: null };
      }
    } catch (e: any) {
      return { ...EMPTY_RESULT, error: e.message };
    }
  }, [activeTool, input, convType, includeHeaders, flattenNested, autoFit, sheetName, delimiter, tableName, sqlType, batchInsert]);

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
      return { output: out, error: "", excelBlob: null, previewData: [], previewHeaders: [], stats: null };
    } catch (e: any) {
      return { ...EMPTY_RESULT, error: e.message };
    }
  }, [activeTool, input, mode, jsonPath, selectedFields, preserveStructure, removeEmpty, keysMode, includeNested, sortResults, outputFormat]);

  // ── Active result ──────────────────────────────────────────────
  const result = formatResult ?? convertResult ?? excelResult ?? extractResult ?? EMPTY_RESULT;
  const displayOutput = overrideOutput ?? result.output;

  // ── Derived values ─────────────────────────────────────────────
  const inputLang = activeTool === "convert" && direction === "format_to" ? formatType : "json";
  const outputLang = activeTool === "convert"
    ? (direction === "json_to" ? formatType : "json")
    : activeTool === "excel"
      ? (convType === "sql" ? "sql" : "plaintext")
      : "json";

  const inputLabel = activeTool === "convert" && direction === "format_to" ? formatType.toUpperCase() : "JSON";
  const outputLabel = activeTool === "convert"
    ? (direction === "json_to" ? formatType.toUpperCase() : "JSON")
    : activeTool === "excel"
      ? (convType === "excel" ? "Excel 预览" : convType.toUpperCase())
      : "输出";

  const hasExcelOutput = !!result.excelBlob;
  const hasTextOutput = !hasExcelOutput && !!displayOutput;

  // ── Handlers ───────────────────────────────────────────────────
  const handleExample = () => {
    setOverrideOutput(null);
    if (activeTool === "format") setInput(FORMATTER_EXAMPLE);
    else if (activeTool === "convert") {
      const ex = CONVERTER_EXAMPLES[formatType];
      setInput(direction === "json_to" ? ex.jsonTo : ex.formatTo);
    } else if (activeTool === "excel") setInput(EXCEL_EXAMPLE);
    else if (activeTool === "extract") { setInput(EXTRACTOR_EXAMPLE); setJsonPath("$[*].name"); }
  };

  const handleClear = () => {
    setOverrideOutput(null);
    setInput("");
  };

  const handleSwap = () => {
    setOverrideOutput(null);
    // 仅在转换成功且存在结果时才把输出带到另一侧；
    // 空输入或转换失败时仍应允许切换方向，且不能覆盖用户当前输入。
    if (result.output) setInput(result.output);
    setDirection(direction === "json_to" ? "format_to" : "json_to");
  };

  const handleDownload = () => {
    if (activeTool === "excel" && result.excelBlob) downloadFile(result.excelBlob, `${sheetName || "data"}.xlsx`);
    else if (activeTool === "excel" && convType === "csv") downloadFile(displayOutput, "data.csv", "text/csv");
    else if (activeTool === "excel" && convType === "sql") downloadFile(displayOutput, "data.sql");
    else if (activeTool === "convert") downloadFile(displayOutput, `converted.${direction === "json_to" ? formatType : "json"}`);
    else if (activeTool === "extract") downloadFile(displayOutput, "extracted.json", "application/json");
    else downloadFile(displayOutput, "formatted.json", "application/json");
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <>
      <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
              <Code2 className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>

          {/* Input + Output */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Input */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between h-10">
                <Label className="text-sm font-medium">输入 ({inputLabel})</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExample}><Star className="size-3.5" /> 示例</Button>
                  <Button variant="outline" size="sm" onClick={handleClear} disabled={!input}><Eraser className="size-3.5" /> 清空</Button>
                </div>
              </div>
              <div className="h-[340px]">
                <MonacoEditor value={input} onChange={handleInputChange} language={inputLang} height="100%" showLineNumbersToggle showWordWrapToggle />
              </div>
            </div>

            {/* Output */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between h-10">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">{outputLabel}</Label>
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
                  {/* Excel row/col count */}
                  {hasExcelOutput && result.previewHeaders.length > 0 && (
                    <span className="text-xs text-green-600">{result.previewData.length} 行 · {result.previewHeaders.length} 列</span>
                  )}
                </div>
                <div className="flex gap-2">
                  {hasTextOutput && <CopyButton text={displayOutput} />}
                  {(hasTextOutput || hasExcelOutput) && (
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
                ) : hasExcelOutput ? (
                  <div className="h-full overflow-auto rounded-lg border border-gray-200 bg-white p-2">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b bg-gray-50 sticky top-0">
                          {result.previewHeaders.map((h) => (
                            <th key={h} className="px-3 py-2 text-left font-medium whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {result.previewData.slice(0, 50).map((row, i) => (
                          <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                            {result.previewHeaders.map((h) => (
                              <td key={h} className="px-3 py-2 whitespace-nowrap">{String(row[h] ?? "")}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {result.previewData.length > 50 && <p className="text-xs text-gray-400 mt-2">仅预览前 50 行</p>}
                  </div>
                ) : hasTextOutput ? (
                  <MonacoEditor value={displayOutput} readOnly language={outputLang} height="100%" showCopyButton showDownloadButton showWordWrapToggle onDownload={handleDownload} />
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
                <TabsTrigger value="convert" className="flex-1"><ArrowLeftRight className="size-4" /> 格式转换</TabsTrigger>
                <TabsTrigger value="excel" className="flex-1"><FileSpreadsheet className="size-4" /> 转 Excel</TabsTrigger>
                <TabsTrigger value="extract" className="flex-1"><Filter className="size-4" /> 提取器</TabsTrigger>
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

              {/* ── Converter Options ───────────────────────────── */}
              <TabsContent value="convert" className="p-5">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-gray-500">格式</Label>
                    <Select value={formatType} onValueChange={setFormatType}>
                      <SelectTrigger className="w-24 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xml">XML</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="yaml">YAML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className={direction === "json_to" ? "text-primary font-medium" : "text-gray-400"}>JSON → {formatType.toUpperCase()}</span>
                    <Button variant="ghost" size="icon-sm" onClick={handleSwap} title="对调转换方向"><ArrowLeftRight className="size-4" /></Button>
                    <span className={direction === "format_to" ? "text-primary font-medium" : "text-gray-400"}>{formatType.toUpperCase()} → JSON</span>
                  </div>
                  <Button variant="link" size="sm" className="ml-auto px-0 h-auto" onClick={() => setShowAdvanced(!showAdvanced)}>
                    <Settings2 className="size-3.5" /> {showAdvanced ? "收起" : "展开"}高级选项
                  </Button>
                </div>
                {showAdvanced && (
                  <div className="mt-3 flex flex-wrap items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    {formatType === "csv" && (
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-gray-500">分隔符</Label>
                        <Select value={csvDelimiter} onValueChange={setCsvDelimiter}>
                          <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value=",">逗号 (,)</SelectItem>
                            <SelectItem value=";">分号 (;)</SelectItem>
                            <SelectItem value={"\t"}>Tab</SelectItem>
                            <SelectItem value="|">管道 (|)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    {formatType === "xml" && (
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-gray-500">根元素</Label>
                        <Input className="w-32 h-8" value={xmlRoot} onChange={(e) => setXmlRoot(e.target.value)} placeholder="root" />
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* ── Excel Options ────────────────────────────────── */}
              <TabsContent value="excel" className="p-5">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-gray-500">输出格式</Label>
                    <Select value={convType} onValueChange={(v) => setConvType(v as "excel" | "csv" | "sql")}>
                      <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="sql">SQL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={includeHeaders} onCheckedChange={setIncludeHeaders} />
                    <Label className="text-xs cursor-pointer" onClick={() => setIncludeHeaders(!includeHeaders)}>包含表头</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={flattenNested} onCheckedChange={setFlattenNested} />
                    <Label className="text-xs cursor-pointer" onClick={() => setFlattenNested(!flattenNested)}>展开嵌套</Label>
                  </div>
                  {convType === "excel" && (
                    <>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-gray-500">Sheet 名</Label>
                        <Input className="w-28 h-8" value={sheetName} onChange={(e) => setSheetName(e.target.value)} placeholder="Sheet1" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={autoFit} onCheckedChange={setAutoFit} />
                        <Label className="text-xs cursor-pointer" onClick={() => setAutoFit(!autoFit)}>自动列宽</Label>
                      </div>
                    </>
                  )}
                  {convType === "csv" && (
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-gray-500">分隔符</Label>
                      <Select value={delimiter} onValueChange={setDelimiter}>
                        <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value=",">逗号 (,)</SelectItem>
                          <SelectItem value=";">分号 (;)</SelectItem>
                          <SelectItem value={"\t"}>Tab</SelectItem>
                          <SelectItem value="|">管道 (|)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {convType === "sql" && (
                    <>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-gray-500">表名</Label>
                        <Input className="w-28 h-8" value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder="my_table" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-gray-500">类型</Label>
                        <Select value={sqlType} onValueChange={(v) => setSqlType(v as "INSERT" | "CREATE_TABLE")}>
                          <SelectTrigger className="w-40 h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INSERT">INSERT</SelectItem>
                            <SelectItem value="CREATE_TABLE">CREATE + INSERT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={batchInsert} onCheckedChange={setBatchInsert} />
                        <Label className="text-xs cursor-pointer" onClick={() => setBatchInsert(!batchInsert)}>批量插入</Label>
                      </div>
                    </>
                  )}
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
