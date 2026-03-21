import { useState } from "react";
import { useIntl } from "react-intl";
import * as XLSX from "xlsx";
import {
  Download,
  Trash2,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCopy } from "@/hooks/useCopy";

type ConversionType = "excel" | "csv" | "sql";

interface Options {
  conversionType: ConversionType;
  includeHeaders: boolean;
  autoFitColumns: boolean;
  sheetName: string;
  delimiter: string;
  flattenNested: boolean;
  tableName: string;
  sqlType: "INSERT" | "CREATE_TABLE";
  batchInsert: boolean;
}

const EXAMPLE_JSON = `[
  { "id": 1, "name": "Alice", "age": 28, "city": "Beijing" },
  { "id": 2, "name": "Bob", "age": 34, "city": "Shanghai" },
  { "id": 3, "name": "Charlie", "age": 22, "city": "Guangzhou" }
]`;

function flattenObject(
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, unknown> {
  return Object.entries(obj).reduce(
    (acc, [key, val]) => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (val && typeof val === "object" && !Array.isArray(val)) {
        Object.assign(acc, flattenObject(val as Record<string, unknown>, newKey));
      } else {
        acc[newKey] = val;
      }
      return acc;
    },
    {} as Record<string, unknown>
  );
}

function parseInput(
  input: string,
  flatten: boolean
): { data: Record<string, unknown>[]; headers: string[] } | null {
  try {
    const parsed = JSON.parse(input);
    let arr: Record<string, unknown>[] = [];
    if (Array.isArray(parsed)) {
      arr = parsed.filter((i) => typeof i === "object" && i !== null);
    } else if (typeof parsed === "object" && parsed !== null) {
      arr = [parsed];
    } else {
      return null;
    }
    const data = flatten ? arr.map((r) => flattenObject(r)) : arr;
    const headers = Array.from(new Set(data.flatMap((r) => Object.keys(r))));
    return { data, headers };
  } catch {
    return null;
  }
}

function toCSV(
  data: Record<string, unknown>[],
  headers: string[],
  delimiter: string,
  includeHeaders: boolean
): string {
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return s.includes(delimiter) || s.includes('"') || s.includes("\
")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const rows: string[] = [];
  if (includeHeaders) rows.push(headers.map(escape).join(delimiter));
  for (const row of data) {
    rows.push(headers.map((h) => escape(row[h])).join(delimiter));
  }
  return rows.join("\
");
}

function toSQL(
  data: Record<string, unknown>[],
  headers: string[],
  tableName: string,
  sqlType: "INSERT" | "CREATE_TABLE",
  batchInsert: boolean
): string {
  const escVal = (v: unknown) => {
    if (v === null || v === undefined) return "NULL";
    if (typeof v === "number" || typeof v === "boolean") return String(v);
    return `\'${String(v).replace(/\'/g, "\\\'\\\'")}\'`;
  };
  const cols = headers.map((h) => `\`${h}\``).join(", ");
  if (sqlType === "CREATE_TABLE") {
    const colDefs = headers
      .map((h) => {
        const sample = data.find((r) => r[h] !== null && r[h] !== undefined)?.[h];
        const type =
          typeof sample === "number"
            ? "DECIMAL(10,2)"
            : typeof sample === "boolean"
            ? "BOOLEAN"
            : "VARCHAR(255)";
        return `  \`${h}\` ${type}`;
      })
      .join(",\
");
    const inserts = data
      .map(
        (row) =>
          `INSERT INTO \`${tableName}\` (${cols}) VALUES (${headers
            .map((h) => escVal(row[h]))
            .join(", ")});`
      )
      .join("\
");
    return `CREATE TABLE \`${tableName}\` (\
${colDefs}\
);\
\
${inserts}`;
  }
  if (batchInsert) {
    const values = data
      .map((row) => `  (${headers.map((h) => escVal(row[h])).join(", ")})`)
      .join(",\
");
    return `INSERT INTO \`${tableName}\` (${cols}) VALUES\
${values};`;
  }
  return data
    .map(
      (row) =>
        `INSERT INTO \`${tableName}\` (${cols}) VALUES (${headers
          .map((h) => escVal(row[h]))
          .join(", ")});`
    )
    .join("\
");
}

const JsonToExcel = () => {
  const intl = useIntl();
  const copy = useCopy();

  const [inputJson, setInputJson] = useState("");
  const [csvOutput, setCsvOutput] = useState("");
  const [sqlOutput, setSqlOutput] = useState("");
  const [excelBlob, setExcelBlob] = useState<Blob | null>(null);
  const [error, setError] = useState("");
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [converted, setConverted] = useState(false);

  const [options, setOptions] = useState<Options>({
    conversionType: "excel",
    includeHeaders: true,
    autoFitColumns: true,
    sheetName: "Sheet1",
    delimiter: ",",
    flattenNested: true,
    tableName: "my_table",
    sqlType: "INSERT",
    batchInsert: false,
  });

  const setOpt = <K extends keyof Options>(key: K, val: Options[K]) =>
    setOptions((prev) => ({ ...prev, [key]: val }));

  const handleConvert = () => {
    setError("");
    setConverted(false);
    const result = parseInput(inputJson, options.flattenNested);
    if (!result) {
      setError("Invalid JSON. Please enter a valid JSON array or object.");
      return;
    }
    const { data, headers } = result;
    setPreviewData(data);
    setPreviewHeaders(headers);

    if (options.conversionType === "excel") {
      const ws = XLSX.utils.json_to_sheet(data, {
        header: headers,
        skipHeader: !options.includeHeaders,
      });
      if (options.autoFitColumns) {
        ws["!cols"] = headers.map((h) => ({
          wch: Math.max(h.length, ...data.map((r) => String(r[h] ?? "").length)),
        }));
      }
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, options.sheetName || "Sheet1");
      const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      setExcelBlob(new Blob([buf], { type: "application/octet-stream" }));
    } else if (options.conversionType === "csv") {
      setCsvOutput(toCSV(data, headers, options.delimiter || ",", options.includeHeaders));
    } else {
      setSqlOutput(toSQL(data, headers, options.tableName || "my_table", options.sqlType, options.batchInsert));
    }
    setConverted(true);
  };

  const handleDownload = () => {
    if (options.conversionType === "excel" && excelBlob) {
      const url = URL.createObjectURL(excelBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${options.sheetName || "data"}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (options.conversionType === "csv") {
      const blob = new Blob([csvOutput], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data.csv";
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const blob = new Blob([sqlOutput], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data.sql";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const outputText = options.conversionType === "csv" ? csvOutput : sqlOutput;
  const hasOutput = converted && (options.conversionType === "excel" ? !!excelBlob : !!outputText);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">输入 JSON</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setInputJson(EXAMPLE_JSON)}>
                    示例
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setInputJson("");
                      setError("");
                      setConverted(false);
                      setPreviewData([]);
                      setPreviewHeaders([]);
                      setCsvOutput("");
                      setSqlOutput("");
                      setExcelBlob(null);
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                placeholder={`[
  { "key": "value" },
  ...
]`}
                className="min-h-[200px] font-mono text-sm"
              />
              {error && (
                <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          <Button className="w-full" size="lg" onClick={handleConvert} disabled={!inputJson.trim()}>
            <FileSpreadsheet className="mr-2 size-4" />
            转换
          </Button>

          {hasOutput && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">转换结果</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle2 className="mr-1 size-3 text-green-500" />
                      {previewData.length} 行 · {previewHeaders.length} 列
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    {options.conversionType !== "excel" && (
                      <Button variant="outline" size="sm" onClick={() => copy(outputText)}>
                        复制
                      </Button>
                    )}
                    <Button size="sm" onClick={handleDownload}>
                      <Download className="mr-1 size-4" />
                      下载
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {options.conversionType === "excel" ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Excel 文件已生成，点击上方下载按钮保存。</p>
                    <ScrollArea className="h-64 rounded-md border">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            {previewHeaders.map((h) => (
                              <th key={h} className="px-3 py-2 text-left font-medium whitespace-nowrap">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.slice(0, 50).map((row, i) => (
                            <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                              {previewHeaders.map((h) => (
                                <td key={h} className="px-3 py-2 whitespace-nowrap">
                                  {String(row[h] ?? "")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </ScrollArea>
                    {previewData.length > 50 && (
                      <p className="text-xs text-muted-foreground">仅预览前 50 行</p>
                    )}
                  </div>
                ) : (
                  <Textarea
                    value={outputText}
                    readOnly
                    className="min-h-[240px] font-mono text-sm"
                  />
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">转换选项</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>输出格式</Label>
                <Select
                  value={options.conversionType}
                  onValueChange={(v) => setOpt("conversionType", v as ConversionType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="sql">SQL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Label htmlFor="includeHeaders">包含表头</Label>
                <Switch
                  id="includeHeaders"
                  checked={options.includeHeaders}
                  onCheckedChange={(v) => setOpt("includeHeaders", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="flattenNested">展开嵌套对象</Label>
                <Switch
                  id="flattenNested"
                  checked={options.flattenNested}
                  onCheckedChange={(v) => setOpt("flattenNested", v)}
                />
              </div>

              <Separator />

              {options.conversionType === "excel" && (
                <>
                  <div className="space-y-1.5">
                    <Label>Sheet 名称</Label>
                    <Input
                      value={options.sheetName}
                      onChange={(e) => setOpt("sheetName", e.target.value)}
                      placeholder="Sheet1"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="autoFit">自动列宽</Label>
                    <Switch
                      id="autoFit"
                      checked={options.autoFitColumns}
                      onCheckedChange={(v) => setOpt("autoFitColumns", v)}
                    />
                  </div>
                </>
              )}

              {options.conversionType === "csv" && (
                <div className="space-y-1.5">
                  <Label>分隔符</Label>
                  <Select
                    value={options.delimiter}
                    onValueChange={(v) => setOpt("delimiter", v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=",">逗号 (,)</SelectItem>
                      <SelectItem value=";">分号 (;)</SelectItem>
                      <SelectItem value={"\	"}>制表符 (Tab)</SelectItem>
                      <SelectItem value="|">管道符 (|)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {options.conversionType === "sql" && (
                <>
                  <div className="space-y-1.5">
                    <Label>表名</Label>
                    <Input
                      value={options.tableName}
                      onChange={(e) => setOpt("tableName", e.target.value)}
                      placeholder="my_table"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>SQL 类型</Label>
                    <Select
                      value={options.sqlType}
                      onValueChange={(v) => setOpt("sqlType", v as "INSERT" | "CREATE_TABLE")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INSERT">INSERT</SelectItem>
                        <SelectItem value="CREATE_TABLE">CREATE TABLE + INSERT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="batchInsert">批量 INSERT</Label>
                    <Switch
                      id="batchInsert"
                      checked={options.batchInsert}
                      onCheckedChange={(v) => setOpt("batchInsert", v)}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default JsonToExcel;
