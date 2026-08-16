import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Settings,
  Star,
  Trash2
} from "lucide-react";
import { useEffect, useState } from "react";

const BASE_OPTIONS = [
  { id: "2", name: "二进制" },
  { id: "8", name: "八进制" },
  { id: "10", name: "十进制" },
  { id: "16", name: "十六进制" },
  { id: "custom", name: "自定义" },
];

const EXAMPLES: Record<string, string> = {
  "2": "10101010",
  "8": "777",
  "10": "255",
  "16": "FF",
};

export default function NumberBaseConverterPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [fromBase, setFromBase] = useState("10");
  const [toBase, setToBase] = useState("2");
  const [customFrom, setCustomFrom] = useState("10");
  const [customTo, setCustomTo] = useState("2");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [useUppercase, setUseUppercase] = useState(true);
  const [addPrefix, setAddPrefix] = useState(false);
  const [groupDigits, setGroupDigits] = useState(false);

  const convert = (value: string, from: string, to: string): string => {
    const fromInt = parseInt(from, 10);
    const toInt = parseInt(to, 10);
    if (fromInt < 2 || fromInt > 36 || toInt < 2 || toInt > 36) {
      throw new Error("进制范围必须在 2-36 之间");
    }
    const clean = value.replace(/^0[bxo]|[\s_]/gi, "");
    const decimal = parseInt(clean, fromInt);
    if (isNaN(decimal)) throw new Error("输入值无效，请检查输入格式");

    let result = decimal.toString(toInt);
    if (useUppercase && toInt > 10) result = result.toUpperCase();
    if (addPrefix) {
      if (toInt === 2) result = "0b" + result;
      else if (toInt === 8) result = "0o" + result;
      else if (toInt === 16) result = "0x" + result;
    }
    if (groupDigits) {
      if (toInt === 2) {
        const stripped = result.replace(/^0b/i, "");
        const grouped = stripped.match(/.{1,8}/g)?.join("_") || stripped;
        result = addPrefix ? "0b" + grouped : grouped;
      } else if (toInt === 16) {
        const stripped = result.replace(/^0x/i, "");
        const grouped = stripped.match(/.{1,4}/g)?.join("_") || stripped;
        result = addPrefix ? "0x" + grouped : grouped;
      }
    }
    return result;
  };

  useEffect(() => {
    if (!input.trim()) { setOutput(""); setError(""); return; }
    try {
      const result = convert(
        input,
        fromBase === "custom" ? customFrom : fromBase,
        toBase === "custom" ? customTo : toBase,
      );
      setOutput(result);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "转换错误");
      setOutput("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, fromBase, toBase, customFrom, customTo, useUppercase, addPrefix, groupDigits]);

  return (
    <>
      <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

          <div className="space-y-4 rounded-lg border border-border bg-card p-5">
            {/* Base selectors */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">源进制</Label>
                <div className="flex flex-wrap gap-1.5">
                  {BASE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      className={cn(
                        "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                        fromBase === opt.id ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-accent"
                      )}
                      onClick={() => setFromBase(opt.id)}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
                {fromBase === "custom" && (
                  <Input type="number" min={2} max={36} value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="w-32" placeholder="2-36" />
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">目标进制</Label>
                <div className="flex flex-wrap gap-1.5">
                  {BASE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      className={cn(
                        "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                        toBase === opt.id ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-accent"
                      )}
                      onClick={() => setToBase(opt.id)}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
                {toBase === "custom" && (
                  <Input type="number" min={2} max={36} value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="w-32" placeholder="2-36" />
                )}
              </div>
            </div>

            {/* Advanced options */}
            <button
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings className="size-3.5" />
              高级选项
              {showAdvanced ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>
            {showAdvanced && (
              <div className="grid grid-cols-1 gap-3 rounded-md bg-muted p-4 sm:grid-cols-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <Checkbox checked={useUppercase} onCheckedChange={(c) => setUseUppercase(c === true)} />
                  大写字母
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <Checkbox checked={addPrefix} onCheckedChange={(c) => setAddPrefix(c === true)} />
                  添加前缀
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <Checkbox checked={groupDigits} onCheckedChange={(c) => setGroupDigits(c === true)} />
                  分组显示
                </label>
              </div>
            )}

            {/* Input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">输入值</Label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="请输入要转换的数值"
                rows={4}
                className="font-mono"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => {
                const cur = fromBase === "custom" ? customFrom : fromBase;
                setInput(EXAMPLES[cur] || EXAMPLES["10"]);
              }}>
                <Star className="size-3.5" /> 示例
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setInput(""); setOutput(""); setError(""); }} className="text-red-500">
                <Trash2 className="size-3.5" /> 清空
              </Button>
            </div>

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}

            {/* Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">转换结果</Label>
                {output && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(output);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copied ? "已复制" : "复制"}
                  </Button>
                )}
              </div>
              <Textarea value={output} readOnly placeholder="转换结果" rows={4} className="font-mono" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
