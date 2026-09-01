/* eslint-disable @typescript-eslint/no-explicit-any -- JSON 动态遍历需要使用 any */
import { ArrowLeftRight, Code2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import JsonToolLayout, {
  type JsonStats,
} from "@/components/JsonToolLayout";

const FORMATTER_EXAMPLE = `{"name":"Tools","version":"1.0.0","description":"开发者工具集","features":["JSON格式化","JSON提取","Excel转换"],"config":{"theme":"dark","language":"zh-CN","indent":2},"active":true,"count":42}`;

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
  if (Array.isArray(obj))
    return obj.reduce((acc, v) => acc + countKeys(v), 0);
  return (
    Object.keys(obj).length +
    Object.values(obj).reduce(
      (acc: number, v) => acc + countKeys(v),
      0,
    )
  );
}

function processJson(parsed: any, opts: { sortKeys: boolean }): any {
  if (typeof parsed !== "object" || parsed === null) return parsed;
  if (Array.isArray(parsed)) return parsed.map((v) => processJson(v, opts));
  let entries = Object.entries(parsed).map(([k, v]) => [k, processJson(v, opts)]);
  if (opts.sortKeys) entries = entries.sort(([a], [b]) => a.localeCompare(b));
  return Object.fromEntries(entries);
}

export default function JsonFormatPage() {
  const [input, setInput] = useState("");
  const [overrideOutput, setOverrideOutput] = useState<string | null>(null);

  const [indent, setIndent] = useState("2");
  const [compact, setCompact] = useState(false);
  const [sortKeys, setSortKeys] = useState(false);
  const [escapeUnicode, setEscapeUnicode] = useState(false);

  const result = useMemo(() => {
    if (!input.trim()) return { output: "", error: "", stats: null as JsonStats | null };
    try {
      let p = JSON.parse(input);
      p = processJson(p, { sortKeys });
      const indentVal = compact ? 0 : parseInt(indent);
      let out = JSON.stringify(p, null, indentVal);
      if (escapeUnicode)
        out = out.replace(
          /[\u0080-\uffff]/g,
          (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`,
        );
      return {
        output: out,
        error: "",
        stats: {
          size: new Blob([out]).size,
          lines: out.split("\n").length,
          keys: countKeys(p),
          depth: getDepth(p),
        },
      };
    } catch (e: any) {
      return { output: "", error: e.message, stats: null as JsonStats | null };
    }
  }, [input, indent, compact, sortKeys, escapeUnicode]);

  const displayOutput = overrideOutput ?? result.output;

  const options = (
    <div className="p-5">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">缩进</Label>
          <Select value={indent} onValueChange={setIndent} disabled={compact}>
            <SelectTrigger className="w-28 h-8">
              <SelectValue />
            </SelectTrigger>
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
          <Label className="text-xs cursor-pointer" onClick={() => setCompact(!compact)}>
            压缩
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={sortKeys} onCheckedChange={setSortKeys} />
          <Label className="text-xs cursor-pointer" onClick={() => setSortKeys(!sortKeys)}>
            排序 Key
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={escapeUnicode} onCheckedChange={setEscapeUnicode} />
          <Label
            className="text-xs cursor-pointer"
            onClick={() => setEscapeUnicode(!escapeUnicode)}
          >
            转义 Unicode
          </Label>
        </div>
        <div className="ml-auto flex gap-2">
          <Button
            size="sm"
            disabled={!input.trim()}
            onClick={() => setOverrideOutput(null)}
          >
            <Code2 className="size-3.5" /> 重新格式化
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!input.trim()}
            onClick={() => setOverrideOutput(JSON.stringify(input))}
          >
            <ArrowLeftRight className="size-3.5" /> 转义字符串
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!input.trim()}
            onClick={() => {
              try {
                const u = JSON.parse(input);
                if (typeof u === "string") {
                  setOverrideOutput(u);
                  return;
                }
              } catch {
                /* 忽略解析错误，按纯字符串处理 */
              }
              setOverrideOutput(
                input
                  .replace(/\\\\/g, "\\")
                  .replace(/\\"/g, '"')
                  .replace(/\\n/g, "\n")
                  .replace(/\\t/g, "\t")
                  .replace(/\\r/g, "\r"),
              );
            }}
          >
            <ArrowLeftRight className="size-3.5" /> 反转义字符串
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <JsonToolLayout
      input={input}
      onInputChange={(v) => {
        setOverrideOutput(null);
        setInput(v);
      }}
      output={displayOutput}
      error={overrideOutput ? "" : result.error}
      stats={result.stats}
      options={options}
      onExample={() => {
        setOverrideOutput(null);
        setInput(FORMATTER_EXAMPLE);
      }}
      downloadName="formatted.json"
    />
  );
}
