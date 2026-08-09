import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { type SiteDefination } from "@/lib/site";
import {
  Check,
  Copy,
  Download,
  Eraser,
  FileSpreadsheet,
  FileText,
  FileUp,
  Star,
  Upload,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import MonacoEditor from "@/components/MonacoEditor";

// ─── Types ───────────────────────────────────────────────────────

type Mode = "file" | "text";
type OutputFormat = "object" | "array";

interface FileOptions {
  firstRowAsHeaders: boolean;
  skipEmptyRows: boolean;
  sheetIndex: number;
}

interface TextOptions {
  delimiter: string;
  outputFormat: OutputFormat;
  hasHeaders: boolean;
  skipEmptyLines: boolean;
  autoDetectNumbers: boolean;
  autoDetectBooleans: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────

function downloadFile(content: string, filename: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const EXAMPLE_TEXT = "name\tage\tscore\nJohn\t25\t89\nAlice\t22\t95\nBob\t30\t78";

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
// Main Page
// ═════════════════════════════════════════════════════════════════

export default function ExcelToJsonPage({ title, description }: SiteDefination) {
  // ── Mode ───────────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>("file");

  // ── File Mode State ────────────────────────────────────────────
  const [file, setFile] = useState<File | null>(null);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileOutputJson, setFileOutputJson] = useState("");
  const [fileOptions, setFileOptions] = useState<FileOptions>({
    firstRowAsHeaders: true,
    skipEmptyRows: true,
    sheetIndex: 0,
  });

  // ── Text Mode State ────────────────────────────────────────────
  const [inputText, setInputText] = useState("");
  const [textOutputJson, setTextOutputJson] = useState("");
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [textOptions, setTextOptions] = useState<TextOptions>({
    delimiter: "\t",
    outputFormat: "object",
    hasHeaders: true,
    skipEmptyLines: true,
    autoDetectNumbers: true,
    autoDetectBooleans: true,
  });

  // ── Drag state ─────────────────────────────────────────────────
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File Mode Logic ────────────────────────────────────────────

  const loadFile = useCallback(async (rawFile: File) => {
    setFile(rawFile);
    setAvailableSheets([]);
    setFileOutputJson("");
    try {
      const arrayBuffer = await rawFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      setAvailableSheets(workbook.SheetNames);
      setFileOptions((prev) => ({ ...prev, sheetIndex: 0 }));
      toast.success(`已加载 ${rawFile.name}`);
    } catch {
      toast.error("文件读取失败");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile) loadFile(droppedFile);
    },
    [loadFile],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) loadFile(selected);
  };

  const convertFileToJson = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      const sheetName = workbook.SheetNames[fileOptions.sheetIndex];
      if (!sheetName) throw new Error("未找到工作表");

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: fileOptions.firstRowAsHeaders ? undefined : 1,
        defval: "",
        blankrows: !fileOptions.skipEmptyRows,
        raw: false,
      });

      setFileOutputJson(JSON.stringify(jsonData, null, 2));
      toast.success("转换成功");
    } catch (err: any) {
      toast.error(err.message || "转换失败");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Text Mode Logic ────────────────────────────────────────────

  const parseLine = useCallback(
    (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      let i = 0;
      while (i < line.length) {
        const char = line[i];
        const nextChar = line[i + 1];
        if ((char === '"' || char === "'") && !inQuotes) {
          inQuotes = true;
          i++;
        } else if ((char === '"' || char === "'") && inQuotes) {
          if (nextChar === char) {
            current += char;
            i += 2;
          } else {
            inQuotes = false;
            i++;
          }
        } else if (char === textOptions.delimiter && !inQuotes) {
          result.push(current.trim());
          current = "";
          i++;
        } else {
          current += char;
          i++;
        }
      }
      result.push(current.trim());
      return result;
    },
    [textOptions.delimiter],
  );

  const updatePreview = useCallback(() => {
    if (!inputText.trim()) {
      setPreviewRows([]);
      setHeaders([]);
      return;
    }
    const lines = inputText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => (textOptions.skipEmptyLines ? l : true));
    if (lines.length === 0) return;

    const parsedLines = lines.map(parseLine);
    if (textOptions.hasHeaders && parsedLines.length > 0) {
      setHeaders(parsedLines[0]);
      setPreviewRows(parsedLines.slice(1));
    } else {
      const maxCols = Math.max(...parsedLines.map((r) => r.length));
      setHeaders(Array.from({ length: maxCols }, (_, i) => `Column${i + 1}`));
      setPreviewRows(parsedLines);
    }
  }, [inputText, textOptions.skipEmptyLines, textOptions.hasHeaders, parseLine]);

  useEffect(() => {
    updatePreview();
  }, [updatePreview]);

  const convertValue = (value: string): string | number | boolean => {
    if (value === "") return "";
    if (textOptions.autoDetectBooleans) {
      if (value.toLowerCase() === "true") return true;
      if (value.toLowerCase() === "false") return false;
    }
    if (textOptions.autoDetectNumbers) {
      const num = Number(value);
      if (!isNaN(num) && value.trim() !== "") return num;
    }
    return value;
  };

  const convertTextToJson = () => {
    if (!inputText.trim() || previewRows.length === 0) return;
    let result: any;
    if (textOptions.outputFormat === "object" && textOptions.hasHeaders) {
      result = previewRows.map((row) => {
        const obj: Record<string, any> = {};
        headers.forEach((h, i) => {
          obj[h] = convertValue(row[i] || "");
        });
        return obj;
      });
    } else {
      const dataRows = previewRows.map((row) => row.map(convertValue));
      result = textOptions.hasHeaders ? [headers, ...dataRows] : dataRows;
    }
    setTextOutputJson(JSON.stringify(result, null, 2));
    toast.success("转换成功");
  };

  // ── Derived ────────────────────────────────────────────────────

  const output = mode === "file" ? fileOutputJson : textOutputJson;
  const recordCount = (() => {
    if (!output) return 0;
    try {
      return JSON.parse(output).length;
    } catch {
      return 0;
    }
  })();

  const handleDownload = () => {
    if (!output) return;
    downloadFile(output, "converted.json", "application/json");
  };

  const handleClear = () => {
    if (mode === "file") {
      setFile(null);
      setAvailableSheets([]);
      setFileOutputJson("");
    } else {
      setInputText("");
      setTextOutputJson("");
    }
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <>
      <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
              <FileSpreadsheet className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>

          {/* Mode Tabs */}
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList className="w-full max-w-xs">
              <TabsTrigger value="file" className="flex-1">
                <FileSpreadsheet className="size-4" /> 文件上传
              </TabsTrigger>
              <TabsTrigger value="text" className="flex-1">
                <FileText className="size-4" /> 文本输入
              </TabsTrigger>
            </TabsList>

            {/* ── File Mode ─────────────────────────────────── */}
            <TabsContent value="file" className="mt-4">
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Input: File Upload */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between h-10">
                    <Label className="text-sm font-medium">输入</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!file}
                        onClick={handleClear}
                      >
                        <Eraser className="size-3.5" /> 清空
                      </Button>
                    </div>
                  </div>

                  {/* Dropzone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${isDragging
                      ? "border-primary bg-primary/5"
                      : "border-gray-300 bg-white hover:border-primary/50 hover:bg-gray-50"
                      }`}
                  >
                    {file ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                          <FileSpreadsheet className="size-5 text-green-600" />
                          <span className="text-sm font-medium text-gray-700">
                            {file.name}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClear();
                            }}
                            className="ml-1 rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-400">
                          点击重新选择文件
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Upload className="size-8 opacity-50" />
                        <p className="text-sm font-medium">
                          点击或拖拽文件到此处
                        </p>
                        <p className="text-xs">支持 .xlsx, .xls, .csv, .ods</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".xlsx,.xls,.csv,.ods"
                      onChange={handleFileSelect}
                    />
                  </div>

                  {/* File Options */}
                  {availableSheets.length > 0 && (
                    <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
                      <div className="flex items-center gap-3">
                        <Label className="text-xs text-gray-500 whitespace-nowrap">
                          工作表
                        </Label>
                        <Select
                          value={String(fileOptions.sheetIndex)}
                          onValueChange={(v) =>
                            setFileOptions({ ...fileOptions, sheetIndex: Number(v) })
                          }
                        >
                          <SelectTrigger className="h-8 flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {availableSheets.map((s, i) => (
                              <SelectItem key={s} value={String(i)}>
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="file-headers"
                            checked={fileOptions.firstRowAsHeaders}
                            onCheckedChange={(c) =>
                              setFileOptions({
                                ...fileOptions,
                                firstRowAsHeaders: c === true,
                              })
                            }
                          />
                          <Label
                            htmlFor="file-headers"
                            className="text-xs cursor-pointer"
                          >
                            首行为表头
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="file-skip-empty"
                            checked={fileOptions.skipEmptyRows}
                            onCheckedChange={(c) =>
                              setFileOptions({
                                ...fileOptions,
                                skipEmptyRows: c === true,
                              })
                            }
                          />
                          <Label
                            htmlFor="file-skip-empty"
                            className="text-xs cursor-pointer"
                          >
                            跳过空行
                          </Label>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={convertFileToJson}
                        disabled={isLoading}
                      >
                        <FileUp className="size-4" />
                        {isLoading ? "转换中..." : "转换为 JSON"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Output */}
                <OutputPanel
                  output={output}
                  recordCount={recordCount}
                  onCopy={() => navigator.clipboard.writeText(output)}
                  onDownload={handleDownload}
                />
              </div>
            </TabsContent>

            {/* ── Text Mode ─────────────────────────────────── */}
            <TabsContent value="text" className="mt-4">
              <div className="grid gap-4 lg:grid-cols-2">
                {/* Input: Text */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between h-10">
                    <Label className="text-sm font-medium">输入</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setInputText(EXAMPLE_TEXT);
                          setTextOptions((prev) => ({ ...prev, delimiter: "\t" }));
                        }}
                      >
                        <Star className="size-3.5" /> 示例
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!inputText}
                        onClick={handleClear}
                      >
                        <Eraser className="size-3.5" /> 清空
                      </Button>
                    </div>
                  </div>
                  <div className="h-[340px]">
                    <MonacoEditor
                      value={inputText}
                      onChange={setInputText}
                      language="plaintext"
                      height="100%"
                      showLineNumbersToggle
                      showWordWrapToggle
                    />
                  </div>

                  {/* Text Options */}
                  <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-gray-500 whitespace-nowrap">
                          分隔符
                        </Label>
                        <Select
                          value={textOptions.delimiter}
                          onValueChange={(v) =>
                            setTextOptions({ ...textOptions, delimiter: v })
                          }
                        >
                          <SelectTrigger className="h-8 flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={"\t"}>Tab</SelectItem>
                            <SelectItem value=",">逗号 (,)</SelectItem>
                            <SelectItem value=";">分号 (;)</SelectItem>
                            <SelectItem value="|">管道 (|)</SelectItem>
                            <SelectItem value={" "}>空格</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-gray-500 whitespace-nowrap">
                          输出格式
                        </Label>
                        <Select
                          value={textOptions.outputFormat}
                          onValueChange={(v) =>
                            setTextOptions({
                              ...textOptions,
                              outputFormat: v as OutputFormat,
                            })
                          }
                        >
                          <SelectTrigger className="h-8 flex-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="object">对象数组</SelectItem>
                            <SelectItem value="array">二维数组</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="text-headers"
                          checked={textOptions.hasHeaders}
                          onCheckedChange={(c) =>
                            setTextOptions({
                              ...textOptions,
                              hasHeaders: c === true,
                            })
                          }
                        />
                        <Label htmlFor="text-headers" className="text-xs cursor-pointer">
                          首行为表头
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="text-skip-empty"
                          checked={textOptions.skipEmptyLines}
                          onCheckedChange={(c) =>
                            setTextOptions({
                              ...textOptions,
                              skipEmptyLines: c === true,
                            })
                          }
                        />
                        <Label
                          htmlFor="text-skip-empty"
                          className="text-xs cursor-pointer"
                        >
                          跳过空行
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="text-numbers"
                          checked={textOptions.autoDetectNumbers}
                          onCheckedChange={(c) =>
                            setTextOptions({
                              ...textOptions,
                              autoDetectNumbers: c === true,
                            })
                          }
                        />
                        <Label htmlFor="text-numbers" className="text-xs cursor-pointer">
                          自动识别数字
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="text-booleans"
                          checked={textOptions.autoDetectBooleans}
                          onCheckedChange={(c) =>
                            setTextOptions({
                              ...textOptions,
                              autoDetectBooleans: c === true,
                            })
                          }
                        />
                        <Label
                          htmlFor="text-booleans"
                          className="text-xs cursor-pointer"
                        >
                          自动识别布尔值
                        </Label>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      onClick={convertTextToJson}
                      disabled={!inputText.trim()}
                    >
                      <FileUp className="size-4" /> 转换为 JSON
                    </Button>
                  </div>
                </div>

                {/* Output */}
                <div className="flex flex-col gap-2">
                  <OutputPanel
                    output={textOutputJson}
                    recordCount={recordCount}
                    onCopy={() => navigator.clipboard.writeText(textOutputJson)}
                    onDownload={handleDownload}
                  />

                  {/* Detected headers preview */}
                  {inputText && previewRows.length > 0 && !textOutputJson && (
                    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
                      <div className="px-3 py-2 border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider">
                        检测到 {textOptions.hasHeaders ? "表头" : "列"}:{" "}
                        {headers.length}
                      </div>
                      <div className="p-2 flex gap-2 flex-wrap">
                        {headers.map((h) => (
                          <span
                            key={h}
                            className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

// ─── Output Panel ────────────────────────────────────────────────

function OutputPanel({
  output,
  recordCount,
  onDownload,
}: {
  output: string;
  recordCount: number;
  onCopy: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between h-10">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-medium">输出 (JSON)</Label>
          {output && recordCount > 0 && (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
              {recordCount} 条记录
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {output && <CopyButton text={output} />}
          {output && (
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="size-3.5" /> 下载
            </Button>
          )}
        </div>
      </div>
      <div className="h-[340px]">
        {output ? (
          <MonacoEditor
            value={output}
            readOnly
            language="json"
            height="100%"
            showCopyButton
            showDownloadButton
            showWordWrapToggle
            onDownload={onDownload}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center rounded-lg border border-gray-200 bg-white text-sm text-gray-400">
            <FileText className="size-10 opacity-30 mb-3" />
            JSON 输出将显示在这里
          </div>
        )}
      </div>
    </div>
  );
}
