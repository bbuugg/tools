import { useState, useCallback } from "react";
import { useIntl } from "react-intl";
import {
  Copy,
  Download,
  AlertCircle,
  CheckCircle2,
  Trash2,
  RotateCcw,
  History,
  Braces,
  ArrowRightLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useCopy } from "@/hooks/useCopy";

const EXAMPLE_JSON = `{
  "name": "As Tools",
  "version": "1.0.0",
  "description": "开发者工具集",
  "features": ["JSON格式化", "JSON提取", "Excel转换"],
  "config": {
    "theme": "dark",
    "language": "zh-CN",
    "indent": 2
  },
  "active": true,
  "count": 42
}`;

const HISTORY_KEY = "json_formatter_history";

type HistoryItem = {
  id: string;
  input: string;
  timestamp: number;
  size: number;
};

function getStats(json: string, parsed: any) {
  const lines = json.split("\n").length;
  const size = new Blob([json]).size;
  const depth = getDepth(parsed);
  const keys = countKeys(parsed);
  return { lines, size, depth, keys };
}

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
  return (
    Object.keys(obj).length +
    Object.values(obj).reduce((acc: number, v) => acc + countKeys(v), 0)
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function processJson(
  parsed: any,
  opts: { sortKeys: boolean }
): any {
  if (typeof parsed !== "object" || parsed === null) return parsed;
  if (Array.isArray(parsed)) return parsed.map((v) => processJson(v, opts));
  let entries = Object.entries(parsed).map(([k, v]) => [k, processJson(v, opts)]);
  if (opts.sortKeys) entries = entries.sort(([a], [b]) => a.localeCompare(b));
  return Object.fromEntries(entries);
}

const JsonFormatter = () => {
  const intl = useIntl();
  const copy = useCopy();

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [parsed, setParsed] = useState<any>(null);
  const [error, setError] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const [indent, setIndent] = useState("2");
  const [compact, setCompact] = useState(false);
  const [sortKeys, setSortKeys] = useState(false);
  const [escapeUnicode, setEscapeUnicode] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  });

  const saveHistory = useCallback(
    (inputJson: string) => {
      const item: HistoryItem = {
        id: Date.now().toString(),
        input: inputJson,
        timestamp: Date.now(),
        size: new Blob([inputJson]).size,
      };
      const next = [item, ...history].slice(0, 20);
      setHistory(next);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    },
    [history]
  );

  const format = useCallback(
    (
      raw: string,
      opts?: {
        compact?: boolean;
        sortKeys?: boolean;
        escapeUnicode?: boolean;
        indent?: string;
      }
    ) => {
      const o = {
        compact: opts?.compact ?? compact,
        sortKeys: opts?.sortKeys ?? sortKeys,
        escapeUnicode: opts?.escapeUnicode ?? escapeUnicode,
        indent: opts?.indent ?? indent,
      };
      if (!raw.trim()) {
        setOutput("");
        setParsed(null);
        setIsValid(null);
        setError("");
        return;
      }
      try {
        let p = JSON.parse(raw);
        p = processJson(p, { sortKeys: o.sortKeys });
        const indentVal = o.compact ? 0 : parseInt(o.indent);
        let result = JSON.stringify(p, null, indentVal);
        if (o.escapeUnicode) {
          result = result.replace(
            /[\u0080-\uffff]/g,
            (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, "0")}`
          );
        }
        setOutput(result);
        setParsed(p);
        setIsValid(true);
        setError("");
      } catch (e: any) {
        setIsValid(false);
        setError(e.message);
        setOutput("");
        setParsed(null);
      }
    },
    [compact, sortKeys, escapeUnicode, indent]
  );

  const handleInput = useCallback(
    (val: string) => {
      setInput(val);
      format(val);
    },
    [format]
  );

  const handleFormat = () => {
    format(input);
    if (input.trim()) saveHistory(input);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setParsed(null);
    setIsValid(null);
    setError("");
  };

  const handleLoadExample = () => {
    setInput(EXAMPLE_JSON);
    format(EXAMPLE_JSON);
  };

  const handleEscape = () => {
    if (!input.trim()) return;
    setOutput(JSON.stringify(input));
    setIsValid(null);
  };

  const handleUnescape = () => {
    if (!input.trim()) return;
    try {
      const unescaped = JSON.parse(input);
      if (typeof unescaped === "string") {
        setOutput(unescaped);
        setIsValid(null);
        return;
      }
    } catch {}
    setOutput(
      input
        .replace(/\\\\/g, "\\")
        .replace(/\\"/g, '"')
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\r/g, "\r")
    );
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const stats = parsed !== null && output ? getStats(output, parsed) : null;

  const indentOptions = [
    { value: "2", label: "2 spaces" },
    { value: "4", label: "4 spaces" },
    { value: "8", label: "8 spaces" },
    { value: "1", label: "1 space" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <History className="mr-1.5 size-4" />
              {intl.formatMessage({ id: "tools.jsonFormatter.history" })}
              {history.length > 0 && (
                <Badge variant="secondary" className="ml-1.5">
                  {history.length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                {intl.formatMessage({ id: "tools.jsonFormatter.history" })}
              </SheetTitle>
            </SheetHeader>
            <ScrollArea className="mt-4 h-[calc(100vh-8rem)]">
              {history.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  暂无历史记录
                </p>
              ) : (
                <div className="space-y-2 pr-4">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setInput(item.input);
                        format(item.input);
                      }}
                      className="w-full rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {formatSize(item.size)}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate font-mono text-sm">
                        {item.input.slice(0, 60)}
                        {item.input.length > 60 ? "..." : ""}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      {/* Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            {intl.formatMessage({ id: "tools.jsonFormatter.options" })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Label className="text-sm">
                {intl.formatMessage({ id: "tools.jsonFormatter.indent" })}
              </Label>
              <Select
                value={indent}
                onValueChange={(v) => {
                  setIndent(v);
                  format(input, { indent: v });
                }}
                disabled={compact}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {indentOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <Switch
                id="compact"
                checked={compact}
                onCheckedChange={(v) => {
                  setCompact(v);
                  format(input, { compact: v });
                }}
              />
              <Label htmlFor="compact" className="cursor-pointer text-sm">
                {intl.formatMessage({ id: "tools.jsonFormatter.compact" })}
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="sort-keys"
                checked={sortKeys}
                onCheckedChange={(v) => {
                  setSortKeys(v);
                  format(input, { sortKeys: v });
                }}
              />
              <Label htmlFor="sort-keys" className="cursor-pointer text-sm">
                {intl.formatMessage({ id: "tools.jsonFormatter.sortKeys" })}
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="escape-unicode"
                checked={escapeUnicode}
                onCheckedChange={(v) => {
                  setEscapeUnicode(v);
                  format(input, { escapeUnicode: v });
                }}
              />
              <Label htmlFor="escape-unicode" className="cursor-pointer text-sm">
                {intl.formatMessage({ id: "tools.jsonFormatter.escapeUnicode" })}
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor Area */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {intl.formatMessage({ id: "tools.jsonFormatter.inputTitle" })}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLoadExample}
                  className="h-7 text-xs"
                >
                  <RotateCcw className="mr-1 size-3" />
                  {intl.formatMessage({ id: "tools.jsonFormatter.load_example" })}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  disabled={!input}
                  className="h-7 text-xs"
                >
                  <Trash2 className="mr-1 size-3" />
                  {intl.formatMessage({ id: "tools.jsonFormatter.clear" })}
                </Button>
              </div>
            </div>
            {isValid !== null && (
              <div className="mt-1">
                {isValid ? (
                  <Badge
                    variant="outline"
                    className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle2 className="mr-1 size-3" />
                    {intl.formatMessage({ id: "tools.jsonFormatter.json_valid" })}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                  >
                    <AlertCircle className="mr-1 size-3" />
                    {intl.formatMessage({ id: "tools.jsonFormatter.json_invalid" })}
                  </Badge>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-3">
            <Textarea
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              placeholder={intl.formatMessage({
                id: "tools.jsonFormatter.placeholder",
              })}
              className="min-h-[360px] flex-1 resize-none font-mono text-sm"
            />
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-500" />
                <p className="break-all font-mono text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEscape}
                disabled={!input.trim()}
              >
                <ArrowRightLeft className="mr-1.5 size-3.5" />
                {intl.formatMessage({ id: "tools.jsonFormatter.escape_string" })}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnescape}
                disabled={!input.trim()}
              >
                <ArrowRightLeft className="mr-1.5 size-3.5" />
                {intl.formatMessage({
                  id: "tools.jsonFormatter.unescape_string",
                })}
              </Button>
              <Button
                size="sm"
                onClick={handleFormat}
                disabled={!input.trim()}
                className="ml-auto"
              >
                <Braces className="mr-1.5 size-4" />
                {intl.formatMessage({ id: "tools.jsonFormatter.reformat" })}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                {intl.formatMessage({ id: "tools.jsonFormatter.outputTitle" })}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copy(output)}
                  disabled={!output}
                  className="h-7 text-xs"
                >
                  <Copy className="mr-1 size-3" />
                  {intl.formatMessage({ id: "tools.jsonFormatter.copy" })}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  disabled={!output}
                  className="h-7 text-xs"
                >
                  <Download className="mr-1 size-3" />
                  下载
                </Button>
              </div>
            </div>
            {stats && (
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">
                  {intl.formatMessage({ id: "tools.jsonFormatter.stats.size" })}:{" "}
                  {formatSize(stats.size)}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {intl.formatMessage({ id: "tools.jsonFormatter.stats.lines" })}:{" "}
                  {stats.lines}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {intl.formatMessage({ id: "tools.jsonFormatter.stats.keys" })}:{" "}
                  {stats.keys}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {intl.formatMessage({ id: "tools.jsonFormatter.stats.depth" })}:{" "}
                  {stats.depth}
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex flex-1 flex-col">
            {output ? (
              <Textarea
                value={output}
                readOnly
                className="min-h-[360px] flex-1 resize-none font-mono text-sm"
              />
            ) : (
              <div className="flex min-h-[360px] flex-1 items-center justify-center rounded-md border border-dashed">
                <p className="text-sm text-muted-foreground">
                  {intl.formatMessage({
                    id: "tools.jsonFormatter.waitingInput",
                  })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JsonFormatter;
