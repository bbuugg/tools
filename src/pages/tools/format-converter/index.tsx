import { Button } from "@/components/ui/button";
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
  ArrowLeftRight,
  Check,
  Copy,
  Download,
  Eraser,
  FileSpreadsheet,
  FileText,
  Settings2,
  Star,
  TriangleAlert,
  Upload,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import MonacoEditor from "@/components/MonacoEditor";

// ─── Types ───────────────────────────────────────────────────────

type SourceFormat = "json" | "xml" | "yaml" | "csv" | "excel";
type TargetFormat = "json" | "xml" | "yaml" | "csv" | "excel" | "sql";

interface ConvertResult {
  output: string;
  error: string;
  excelBlob: Blob | null;
  previewData: Record<string, unknown>[];
  previewHeaders: string[];
}

const EMPTY_RESULT: ConvertResult = {
  output: "",
  error: "",
  excelBlob: null,
  previewData: [],
  previewHeaders: [],
};

// ─── Helpers ─────────────────────────────────────────────────────

function downloadFile(content: string | Blob, filename: string, mime = "text/plain") {
  const blob = typeof content === "string" ? new Blob([content], { type: mime }) : content;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
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

// ═════════════════════════════════════════════════════════════════
// Conversion functions (JSON as hub format)
// ═════════════════════════════════════════════════════════════════

function escapeXml(unsafe: string): string {
  return unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function escapeYaml(value: string): string {
  if (/^[-:?!,[\\]{}#&*!|>'"%@`]|^[0-9]/.test(value) || /^(true|false|null|y|n|yes|no|on|off)$/i.test(value) || value.includes("\n") || value.includes(" ")) return `'${value.replace(/'/g, "''")}'`;
  return value;
}

// ─── XML ─────────────────────────────────────────────────────────

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

// ─── CSV ─────────────────────────────────────────────────────────

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

// ─── YAML ────────────────────────────────────────────────────────

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
    // Skip empty lines to find first content line
    let i = idx;
    while (i < lines.length && !lines[i].trim()) i++;
    if (i >= lines.length) return [null, i];

    const curIndent = getIndent(lines[i]);
    if (curIndent < minIndent) return [null, i];
    const isArr = lines[i].trimStart().startsWith("-");

    if (isArr) {
      const result: any[] = [];
      while (i < lines.length) {
        const line = lines[i];
        if (!line.trim()) { i++; continue; }
        const li = getIndent(line);
        if (li < curIndent) break;
        if (li > curIndent) { i++; continue; }
        if (!line.trimStart().startsWith("-")) break;

        const afterDash = line.trim().substring(1).trimStart();

        if (!afterDash) {
          // Just "-", check for nested content
          if (i + 1 < lines.length && getIndent(lines[i + 1]) > curIndent) {
            const [n, ni] = parse(i + 1, curIndent + 1);
            result.push(n);
            i = ni;
          } else { result.push(null); i++; }
          continue;
        }

        if (!afterDash.includes(":")) {
          // Scalar array item
          result.push(parseScalar(afterDash));
          i++;
          continue;
        }

        // `- key: value` or `- key:` — start an object, collect sibling keys
        const [k, vp] = splitKV(afterDash);
        const item: any = {};
        if (vp.trim()) {
          item[k] = parseScalar(vp.trim());
          i++;
        } else if (i + 1 < lines.length && getIndent(lines[i + 1]) > curIndent) {
          const [n, ni] = parse(i + 1, curIndent + 1);
          item[k] = n;
          i = ni;
        } else { item[k] = null; i++; }

        // Scan for sibling keys at indent curIndent + 2 (e.g. "  name: Alice" after "- id: 1")
        const sibIndent = curIndent + 2;
        while (i < lines.length) {
          const sibLine = lines[i];
          if (!sibLine.trim()) { i++; continue; }
          const sibLi = getIndent(sibLine);
          if (sibLi <= curIndent) break;          // back to array/parent level
          if (sibLi < sibIndent) { i++; continue; } // unexpected shallower indent
          if (sibLi > sibIndent) break;             // deeper nested (shouldn't reach here)
          if (sibLine.trimStart().startsWith("-")) break; // new array item
          if (sibLine.includes(":")) {
            const [sk, svp] = splitKV(sibLine.trim());
            if (svp.trim()) { item[sk] = parseScalar(svp.trim()); i++; }
            else if (i + 1 < lines.length && getIndent(lines[i + 1]) > sibLi) {
              const [n, ni] = parse(i + 1, sibLi + 1);
              item[sk] = n;
              i = ni;
            } else { item[sk] = null; i++; }
          } else { i++; }
        }
        result.push(item);
      }
      return [result, i];
    } else {
      const result: any = {};
      while (i < lines.length) {
        const line = lines[i];
        if (!line.trim()) { i++; continue; }
        const li = getIndent(line);
        if (li < curIndent) break;
        if (li > curIndent) { i++; continue; }
        if (line.trimStart().startsWith("-")) break;
        if (line.includes(":")) {
          const [k, vp] = splitKV(line.trim());
          if (vp.trim()) { result[k] = parseScalar(vp.trim()); i++; }
          else if (i + 1 < lines.length && getIndent(lines[i + 1]) > li) {
            const [n, ni] = parse(i + 1, li + 1);
            result[k] = n;
            i = ni;
          } else { result[k] = null; i++; }
        } else { i++; }
      }
      return [result, i];
    }
  };
  return JSON.stringify(parse(0, 0)[0], null, 2);
}

// ─── Tabular helpers (for Excel / CSV / SQL output) ─────────────

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

function parseInputForTable(input: string, flatten: boolean): { data: Record<string, unknown>[]; headers: string[] } | null {
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

function toCSV(data: Record<string, unknown>[], headers: string[], delimiter: string, includeHeaders: boolean): string {
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

const EXAMPLES: Record<Exclude<SourceFormat, "excel">, string> = {
  json: `[
  { "id": 1, "name": "Alice", "age": 28, "city": "Beijing" },
  { "id": 2, "name": "Bob", "age": 34, "city": "Shanghai" },
  { "id": 3, "name": "Charlie", "age": 22, "city": "Guangzhou" }
]`,
  xml: `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <person>
    <name>张三</name>
    <age>28</age>
    <address>
      <city>北京</city>
      <district>海淀区</district>
    </address>
    <hobbies>读书</hobbies>
    <hobbies>旅游</hobbies>
  </person>
</root>`,
  yaml: `students:
  - name: 张三
    age: 28
    city: 北京
  - name: 李四
    age: 34
    city: 上海
count: 2`,
  csv: `name,age,city
张三,28,北京
李四,34,上海
王五,22,广州`,
};

// ═════════════════════════════════════════════════════════════════
// Main Page
// ═════════════════════════════════════════════════════════════════

export default function FormatConverterPage() {
  // ── Format selection ───────────────────────────────────────────
  const [sourceFormat, setSourceFormat] = useState<SourceFormat>("json");
  const [targetFormat, setTargetFormat] = useState<TargetFormat>("excel");

  // ── Input state ────────────────────────────────────────────────
  const [inputText, setInputText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [excelJsonText, setExcelJsonText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Source options ─────────────────────────────────────────────
  const [csvSourceDelimiter, setCsvSourceDelimiter] = useState(",");
  const [sheetIndex, setSheetIndex] = useState(0);
  const [firstRowAsHeaders, setFirstRowAsHeaders] = useState(true);
  const [skipEmptyRows, setSkipEmptyRows] = useState(true);

  // ── Target options ─────────────────────────────────────────────
  const [xmlRoot, setXmlRoot] = useState("root");
  const [csvDelimiter, setCsvDelimiter] = useState(",");
  const [sheetName, setSheetName] = useState("Sheet1");
  const [autoFit, setAutoFit] = useState(true);
  const [flattenNested, setFlattenNested] = useState(true);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [tableName, setTableName] = useState("my_table");
  const [sqlType, setSqlType] = useState<"INSERT" | "CREATE_TABLE">("INSERT");
  const [batchInsert, setBatchInsert] = useState(false);

  // ── UI state ───────────────────────────────────────────────────
  const [showOptions, setShowOptions] = useState(true);

  // ── Excel file loading ─────────────────────────────────────────
  const loadFile = useCallback(async (rawFile: File) => {
    setFile(rawFile);
    setAvailableSheets([]);
    setExcelJsonText("");
    try {
      const arrayBuffer = await rawFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      setAvailableSheets(workbook.SheetNames);
      setSheetIndex(0);
      toast.success(`已加载 ${rawFile.name}`);
    } catch {
      toast.error("文件读取失败");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) loadFile(droppedFile);
  }, [loadFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) loadFile(selected);
  };

  // ── Parse Excel sheet to JSON text ─────────────────────────────
  useEffect(() => {
    if (!file || availableSheets.length === 0) return;
    (async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const name = workbook.SheetNames[sheetIndex];
        if (!name) return;
        const worksheet = workbook.Sheets[name];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: firstRowAsHeaders ? undefined : 1,
          defval: "",
          blankrows: !skipEmptyRows,
          raw: false,
        });
        setExcelJsonText(JSON.stringify(jsonData, null, 2));
      } catch {
        setExcelJsonText("");
      }
    })();
  }, [file, availableSheets, sheetIndex, firstRowAsHeaders, skipEmptyRows]);

  // ── Step 1: Source → JSON text ─────────────────────────────────
  const { jsonText, parseError } = useMemo<{ jsonText: string; parseError: string }>(() => {
    if (sourceFormat === "excel") return { jsonText: excelJsonText, parseError: "" };
    if (!inputText.trim()) return { jsonText: "", parseError: "" };
    try {
      if (sourceFormat === "json") return { jsonText: inputText, parseError: "" };
      if (sourceFormat === "xml") return { jsonText: xmlToJson(inputText), parseError: "" };
      if (sourceFormat === "yaml") return { jsonText: yamlToJson(inputText), parseError: "" };
      if (sourceFormat === "csv") return { jsonText: csvToJson(inputText, csvSourceDelimiter), parseError: "" };
    } catch (e: any) {
      return { jsonText: "", parseError: e.message || "解析失败" };
    }
    return { jsonText: "", parseError: "" };
  }, [sourceFormat, inputText, excelJsonText, csvSourceDelimiter]);

  // ── Step 2: JSON text → Target format ──────────────────────────
  const result = useMemo<ConvertResult>(() => {
    if (parseError) return { ...EMPTY_RESULT, error: parseError };
    if (!jsonText.trim()) return EMPTY_RESULT;
    try {
      // Validate JSON
      const parsed = JSON.parse(jsonText);

      if (targetFormat === "json") {
        return { output: JSON.stringify(parsed, null, 2), error: "", excelBlob: null, previewData: [], previewHeaders: [] };
      }
      if (targetFormat === "xml") {
        return { output: jsonToXml(jsonText, xmlRoot), error: "", excelBlob: null, previewData: [], previewHeaders: [] };
      }
      if (targetFormat === "yaml") {
        return { output: jsonToYaml(jsonText), error: "", excelBlob: null, previewData: [], previewHeaders: [] };
      }

      // Tabular outputs (CSV / Excel / SQL)
      const table = parseInputForTable(jsonText, flattenNested);
      if (!table) throw new Error("数据不是 JSON 数组或对象，无法转换为表格格式");

      if (targetFormat === "csv") {
        return { output: toCSV(table.data, table.headers, csvDelimiter, includeHeaders), error: "", excelBlob: null, previewData: table.data, previewHeaders: table.headers };
      }
      if (targetFormat === "sql") {
        return { output: toSQL(table.data, table.headers, tableName || "my_table", sqlType, batchInsert), error: "", excelBlob: null, previewData: table.data, previewHeaders: table.headers };
      }
      if (targetFormat === "excel") {
        const { data, headers } = table;
        const ws = XLSX.utils.json_to_sheet(data, { header: headers, skipHeader: !includeHeaders });
        if (autoFit) ws["!cols"] = headers.map((h) => ({ wch: Math.max(h.length, ...data.map((r) => String(r[h] ?? "").length)) }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName || "Sheet1");
        const blob = new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })], { type: "application/octet-stream" });
        return { output: "", error: "", excelBlob: blob, previewData: data, previewHeaders: headers };
      }
    } catch (e: any) {
      return { ...EMPTY_RESULT, error: e.message || "转换失败" };
    }
    return EMPTY_RESULT;
  }, [jsonText, parseError, targetFormat, xmlRoot, csvDelimiter, flattenNested, includeHeaders, tableName, sqlType, batchInsert, autoFit, sheetName]);

  // ── Derived values ─────────────────────────────────────────────
  const hasExcelOutput = !!result.excelBlob;
  const hasTextOutput = !hasExcelOutput && !!result.output;

  const isTextSource = sourceFormat !== "excel";
  const canSwap = isTextSource && targetFormat !== "excel" && targetFormat !== "sql";

  const inputLang = sourceFormat === "json" ? "json" : sourceFormat === "xml" ? "html" : sourceFormat === "yaml" ? "yaml" : "plaintext";
  const outputLang = targetFormat === "json" ? "json" : targetFormat === "xml" ? "html" : targetFormat === "yaml" ? "yaml" : targetFormat === "sql" ? "sql" : "plaintext";

  const sourceLabel = sourceFormat === "excel" ? "Excel" : sourceFormat.toUpperCase();
  const targetLabel = targetFormat === "excel" ? "Excel" : targetFormat.toUpperCase();

  const hasInput = sourceFormat === "excel" ? !!excelJsonText : !!inputText.trim();

  // ── Handlers ───────────────────────────────────────────────────
  const handleExample = () => {
    if (sourceFormat !== "excel") setInputText(EXAMPLES[sourceFormat]);
  };

  const handleClear = () => {
    if (sourceFormat === "excel") {
      setFile(null);
      setAvailableSheets([]);
      setExcelJsonText("");
    } else {
      setInputText("");
    }
  };

  const handleSwap = () => {
    if (!canSwap) return;
    // 有成功输出时把输出带到输入侧；空内容或解析失败时仅交换格式
    if (result.output && !result.error) setInputText(result.output);
    setSourceFormat(targetFormat as SourceFormat);
    setTargetFormat(sourceFormat as TargetFormat);
  };

  const handleDownload = () => {
    if (targetFormat === "excel" && result.excelBlob) downloadFile(result.excelBlob, `${sheetName || "data"}.xlsx`);
    else if (targetFormat === "csv") downloadFile(result.output, "data.csv", "text/csv");
    else if (targetFormat === "sql") downloadFile(result.output, "data.sql");
    else downloadFile(result.output, `converted.${targetFormat}`, "text/plain");
  };

  const handleSourceChange = (v: string) => setSourceFormat(v as SourceFormat);
  const handleTargetChange = (v: string) => setTargetFormat(v as TargetFormat);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
      {/* Source → Target selector */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-gray-500">源格式</Label>
          <Select value={sourceFormat} onValueChange={handleSourceChange}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="xml">XML</SelectItem>
              <SelectItem value="yaml">YAML</SelectItem>
              <SelectItem value="csv">CSV / TSV</SelectItem>
              <SelectItem value="excel">Excel 文件</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={handleSwap} disabled={!canSwap} title="交换源格式和目标格式">
          <ArrowLeftRight className="size-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Label className="text-xs text-gray-500">目标格式</Label>
          <Select value={targetFormat} onValueChange={handleTargetChange}>
            <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="xml">XML</SelectItem>
              <SelectItem value="yaml">YAML</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="excel">Excel (.xlsx)</SelectItem>
              <SelectItem value="sql">SQL</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Input + Output */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between h-10">
            <Label className="text-sm font-medium">输入 ({sourceLabel})</Label>
            <div className="flex gap-2">
              {sourceFormat !== "excel" && (
                <Button variant="outline" size="sm" onClick={handleExample}><Star className="size-3.5" /> 示例</Button>
              )}
              <Button variant="outline" size="sm" onClick={handleClear} disabled={!hasInput}>
                <Eraser className="size-3.5" /> 清空
              </Button>
            </div>
          </div>
          {sourceFormat === "excel" ? (
            <div className="space-y-2">
              {/* Dropzone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex h-[80px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-gray-300 bg-white hover:border-primary/50 hover:bg-gray-50"}`}
              >
                {file ? (
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="size-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">{file.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleClear(); }} className="ml-1 rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600">
                      <X className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Upload className="size-5 opacity-50" />
                    <p className="text-sm font-medium">点击或拖拽 Excel 文件到此处</p>
                    <p className="text-xs">(.xlsx, .xls, .csv, .ods)</p>
                  </div>
                )}
                <input ref={fileInputRef} type="file" className="hidden" accept=".xlsx,.xls,.csv,.ods" onChange={handleFileSelect} />
              </div>
              {/* Parsed JSON preview */}
              {excelJsonText ? (
                <div className="h-[248px]">
                  <MonacoEditor value={excelJsonText} readOnly language="json" height="100%" showWordWrapToggle />
                </div>
              ) : (
                <div className="h-[248px] flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white text-sm text-gray-400">
                  <FileSpreadsheet className="size-10 opacity-30 mb-3" />
                  {file ? "正在解析..." : "上传文件后自动解析为 JSON"}
                </div>
              )}
            </div>
          ) : (
            <div className="h-[340px]">
              <MonacoEditor value={inputText} onChange={setInputText} language={inputLang} height="100%" showLineNumbersToggle showWordWrapToggle />
            </div>
          )}
        </div>

        {/* Output */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between h-10">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium">输出 ({targetLabel})</Label>
              {(hasExcelOutput || (hasTextOutput && (targetFormat === "csv" || targetFormat === "sql"))) && result.previewHeaders.length > 0 && (
                <span className="text-xs text-green-600">{result.previewData.length} 行 · {result.previewHeaders.length} 列</span>
              )}
            </div>
            <div className="flex gap-2">
              {hasTextOutput && <CopyButton text={result.output} />}
              {(hasTextOutput || hasExcelOutput) && (
                <Button variant="outline" size="sm" onClick={handleDownload}><Download className="size-3.5" /> 下载</Button>
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
              <MonacoEditor value={result.output} readOnly language={outputLang} height="100%" showCopyButton showDownloadButton showWordWrapToggle onDownload={handleDownload} />
            ) : (
              <div className="flex h-full flex-col items-center justify-center rounded-lg border border-gray-200 bg-white text-sm text-gray-400">
                <FileText className="size-10 opacity-30 mb-3" />
                {hasInput ? "等待处理..." : "输入内容后自动转换"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Options Panel */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
          onClick={() => setShowOptions(!showOptions)}
        >
          <span className="flex items-center gap-2"><Settings2 className="size-4" /> 转换选项</span>
          <span className="text-xs text-gray-400">{showOptions ? "收起" : "展开"}</span>
        </button>
        {showOptions && (
          <div className="px-5 py-4 border-t border-gray-100 space-y-3">
            {/* Source options */}
            {sourceFormat === "csv" && (
              <div className="flex items-center gap-2">
                <Label className="text-xs text-gray-500">源 CSV 分隔符</Label>
                <Select value={csvSourceDelimiter} onValueChange={setCsvSourceDelimiter}>
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
            {sourceFormat === "excel" && (
              <div className="flex flex-wrap items-center gap-4">
                {availableSheets.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-gray-500">工作表</Label>
                    <Select value={String(sheetIndex)} onValueChange={(v) => setSheetIndex(Number(v))}>
                      <SelectTrigger className="w-40 h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {availableSheets.map((s, i) => (
                          <SelectItem key={s} value={String(i)}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Switch checked={firstRowAsHeaders} onCheckedChange={setFirstRowAsHeaders} />
                  <Label className="text-xs cursor-pointer" onClick={() => setFirstRowAsHeaders(!firstRowAsHeaders)}>首行为表头</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={skipEmptyRows} onCheckedChange={setSkipEmptyRows} />
                  <Label className="text-xs cursor-pointer" onClick={() => setSkipEmptyRows(!skipEmptyRows)}>跳过空行</Label>
                </div>
              </div>
            )}

            {/* Separator between source and target options */}
            {((sourceFormat === "csv" || sourceFormat === "excel") && targetFormat !== "json" && targetFormat !== "xml" && targetFormat !== "yaml") && (
              <div className="border-t border-gray-100 pt-3" />
            )}

            {/* Target options */}
            {targetFormat === "xml" && (
              <div className="flex items-center gap-2">
                <Label className="text-xs text-gray-500">XML 根元素</Label>
                <Input className="w-32 h-8" value={xmlRoot} onChange={(e) => setXmlRoot(e.target.value)} placeholder="root" />
              </div>
            )}
            {targetFormat === "csv" && (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-500">CSV 分隔符</Label>
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
                <div className="flex items-center gap-2">
                  <Switch checked={includeHeaders} onCheckedChange={setIncludeHeaders} />
                  <Label className="text-xs cursor-pointer" onClick={() => setIncludeHeaders(!includeHeaders)}>包含表头</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={flattenNested} onCheckedChange={setFlattenNested} />
                  <Label className="text-xs cursor-pointer" onClick={() => setFlattenNested(!flattenNested)}>展开嵌套</Label>
                </div>
              </div>
            )}
            {targetFormat === "excel" && (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-500">Sheet 名</Label>
                  <Input className="w-28 h-8" value={sheetName} onChange={(e) => setSheetName(e.target.value)} placeholder="Sheet1" />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={autoFit} onCheckedChange={setAutoFit} />
                  <Label className="text-xs cursor-pointer" onClick={() => setAutoFit(!autoFit)}>自动列宽</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={includeHeaders} onCheckedChange={setIncludeHeaders} />
                  <Label className="text-xs cursor-pointer" onClick={() => setIncludeHeaders(!includeHeaders)}>包含表头</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={flattenNested} onCheckedChange={setFlattenNested} />
                  <Label className="text-xs cursor-pointer" onClick={() => setFlattenNested(!flattenNested)}>展开嵌套</Label>
                </div>
              </div>
            )}
            {targetFormat === "sql" && (
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-500">表名</Label>
                  <Input className="w-28 h-8" value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder="my_table" />
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-gray-500">SQL 类型</Label>
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
                <div className="flex items-center gap-2">
                  <Switch checked={flattenNested} onCheckedChange={setFlattenNested} />
                  <Label className="text-xs cursor-pointer" onClick={() => setFlattenNested(!flattenNested)}>展开嵌套</Label>
                </div>
              </div>
            )}

            {/* No options available */}
            {!(
              (sourceFormat === "csv" || sourceFormat === "excel") ||
              (targetFormat === "xml" || targetFormat === "csv" || targetFormat === "excel" || targetFormat === "sql")
            ) && (
              <p className="text-xs text-gray-400">当前格式组合没有可配置的选项</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
