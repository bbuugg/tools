import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Check, Copy, Eraser } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

interface Unit {
  id: string;
  name: string;
  symbol: string;
}

interface Category {
  id: string;
  name: string;
  note: string;
  units: Unit[];
  /** 默认选中的源单位（切换分类时复位到此） */
  defaultUnit?: string;
  /** 快捷填充数值，默认 ["1","10","100","1000"] */
  chips?: string[];
  /** 是否显示 十进制/二进制 进位制开关（字节类） */
  hasBaseToggle?: boolean;
  /** 数值 → 基准单位（base? 为进位制，字节类使用） */
  toBase: (value: number, unitId: string, base?: number) => number;
  /** 基准单位 → 数值 */
  fromBase: (baseValue: number, unitId: string, base?: number) => number;
}

// ─── Conversion factors (to base unit) ─────────────────────────
// 长度基准 = 米；px / rem 按浏览器默认根字号 16px。
const LENGTH_TO_M: Record<string, number> = {
  px: 0.0254 / 96,
  rem: (16 * 0.0254) / 96,
  mm: 0.001,
  cm: 0.01,
  m: 1,
  km: 1000,
  in: 0.0254,
  ft: 0.3048,
  yd: 0.9144,
  mi: 1609.344,
};
// 重量基准 = 千克
const WEIGHT_TO_KG: Record<string, number> = {
  mg: 1e-6,
  g: 1e-3,
  kg: 1,
  t: 1000,
  oz: 0.028349523125,
  lb: 0.45359237,
};
// 字节类：基准 = 字节(B)；KB/MB/GB/TB 的 exp
const BYTE_EXP: Record<string, number> = {
  byte: 0,
  kb: 1,
  mb: 2,
  gb: 3,
  tb: 4,
};

const CATEGORIES: Category[] = [
  {
    id: "length",
    name: "长度",
    note: "px / rem 按 1rem = 16px（浏览器默认根字号）换算",
    units: [
      { id: "px", name: "像素", symbol: "px" },
      { id: "rem", name: "根字号", symbol: "rem" },
      { id: "mm", name: "毫米", symbol: "mm" },
      { id: "cm", name: "厘米", symbol: "cm" },
      { id: "m", name: "米", symbol: "m" },
      { id: "km", name: "千米", symbol: "km" },
      { id: "in", name: "英寸", symbol: "in" },
      { id: "ft", name: "英尺", symbol: "ft" },
      { id: "yd", name: "码", symbol: "yd" },
      { id: "mi", name: "英里", symbol: "mi" },
    ],
    toBase: (v, u) => v * LENGTH_TO_M[u],
    fromBase: (b, u) => b / LENGTH_TO_M[u],
  },
  {
    id: "temperature",
    name: "温度",
    note: "摄氏度 / 华氏度 / 开尔文 互转",
    units: [
      { id: "c", name: "摄氏度", symbol: "°C" },
      { id: "f", name: "华氏度", symbol: "°F" },
      { id: "k", name: "开尔文", symbol: "K" },
    ],
    // 统一先转到开尔文再转目标单位
    toBase: (v, u) =>
      u === "c" ? v + 273.15 : u === "f" ? ((v - 32) * 5) / 9 + 273.15 : v,
    fromBase: (b, u) =>
      u === "c" ? b - 273.15 : u === "f" ? ((b - 273.15) * 9) / 5 + 32 : b,
  },
  {
    id: "weight",
    name: "重量",
    note: "毫克 / 克 / 千克 / 吨 / 盎司 / 磅 互转",
    units: [
      { id: "mg", name: "毫克", symbol: "mg" },
      { id: "g", name: "克", symbol: "g" },
      { id: "kg", name: "千克", symbol: "kg" },
      { id: "t", name: "吨", symbol: "t" },
      { id: "oz", name: "盎司", symbol: "oz" },
      { id: "lb", name: "磅", symbol: "lb" },
    ],
    toBase: (v, u) => v * WEIGHT_TO_KG[u],
    fromBase: (b, u) => b / WEIGHT_TO_KG[u],
  },
  {
    id: "byte",
    name: "字节",
    defaultUnit: "mb",
    hasBaseToggle: true,
    note: "比特(b) 与 字节(B) 并列；KB/MB/GB/TB 按所选进位制换算。bit 与 B 固定为 1:8",
    chips: ["1", "8", "1024", "1048576"],
    units: [
      { id: "bit", name: "比特", symbol: "b" },
      { id: "byte", name: "字节", symbol: "B" },
      { id: "kb", name: "千字节", symbol: "KB" },
      { id: "mb", name: "兆字节", symbol: "MB" },
      { id: "gb", name: "千兆字节", symbol: "GB" },
      { id: "tb", name: "太字节", symbol: "TB" },
    ],
    toBase: (v, u, base) => {
      const b = base ?? 1024;
      if (u === "bit") return v / 8; // 基准 = 字节
      return v * Math.pow(b, BYTE_EXP[u]);
    },
    fromBase: (bytes, u, base) => {
      const b = base ?? 1024;
      if (u === "bit") return bytes * 8;
      return bytes / Math.pow(b, BYTE_EXP[u]);
    },
  },
];

/** 智能精度格式化（大/小用指数，整数去小数，其余最多 6 位有效） */
function formatNumber(n: number): string {
  if (!isFinite(n)) return "∞";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  if (abs >= 1e21 || (abs < 1e-7 && abs > 0)) return n.toExponential(6);
  if (Number.isInteger(n)) return n.toLocaleString("en-US");
  const fixed = parseFloat(n.toPrecision(12));
  return fixed.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

function useCopy() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  return { copiedId, copy };
}

export default function UnitConverterPage() {
  const [categoryId, setCategoryId] = useState("length");
  const [inputValue, setInputValue] = useState("1");
  const [fromUnit, setFromUnit] = useState("m");
  const [binary, setBinary] = useState(true); // 字节类进位制：true=二进制(1024) false=十进制(1000)

  const { copiedId, copy } = useCopy();
  const category = CATEGORIES.find((c) => c.id === categoryId)!;
  const base = binary ? 1024 : 1000;
  const chips = category.chips ?? ["1", "10", "100", "1000"];

  const results = useMemo(() => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) return null;
    const b = category.toBase(value, fromUnit, category.hasBaseToggle ? base : undefined);
    return category.units.map((u) => {
      const converted = category.fromBase(b, u.id, category.hasBaseToggle ? base : undefined);
      return { ...u, value: converted, formatted: formatNumber(converted) };
    });
  }, [inputValue, fromUnit, category, base]);

  const handleCategoryChange = (id: string) => {
    setCategoryId(id);
    const cat = CATEGORIES.find((c) => c.id === id)!;
    setFromUnit(cat.defaultUnit ?? cat.units[0].id);
  };

  const handleClear = () => setInputValue("");

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Category switcher */}
      <div className="inline-flex rounded-lg border border-border bg-card p-1 gap-1">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => handleCategoryChange(c.id)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              c.id === categoryId
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent",
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Input section */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
            <Label className="text-sm font-medium">输入数值</Label>
            <Input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="输入数值"
              className="h-10 text-lg font-mono"
              step="any"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">源单位</Label>
            <Select value={fromUnit} onValueChange={setFromUnit}>
              <SelectTrigger className="w-44 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {category.units.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {category.hasBaseToggle && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">进位制</Label>
              <div className="flex items-center gap-2 h-10 rounded-md border border-border px-3">
                <span className={cn("text-sm", !binary ? "text-primary font-medium" : "text-muted-foreground")}>
                  十进制 (1000)
                </span>
                <Switch checked={binary} onCheckedChange={setBinary} />
                <span className={cn("text-sm", binary ? "text-primary font-medium" : "text-muted-foreground")}>
                  二进制 (1024)
                </span>
              </div>
            </div>
          )}
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={handleClear}
            disabled={!inputValue}
            title="清空"
          >
            <Eraser className="size-4" />
          </Button>
        </div>

        {category.note && (
          <p className="text-xs text-muted-foreground">{category.note}</p>
        )}

        {/* Quick chips */}
        <div className="flex flex-wrap gap-2">
          {chips.map((v) => (
            <button
              key={v}
              className="rounded-md border border-border px-2.5 py-1 text-xs font-mono text-muted-foreground hover:border-primary/50 hover:bg-accent transition-colors"
              onClick={() => setInputValue(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {results ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium">转换结果</span>
            <span className="text-xs text-muted-foreground">
              {category.hasBaseToggle
                ? `1 KB = ${binary ? "1024" : "1000"} B`
                : `${category.name} · 共 ${category.units.length} 个单位`}
            </span>
          </div>
          <div className="divide-y divide-border">
            {results.map((r) => {
              const isSource = r.id === fromUnit;
              return (
                <div
                  key={r.id}
                  className={cn(
                    "flex items-center justify-between px-5 py-3 transition-colors",
                    isSource ? "bg-primary/5" : "hover:bg-accent",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">
                      {r.name}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      ({r.symbol})
                    </span>
                    {isSource && (
                      <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        输入
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-foreground tabular-nums">
                      {r.formatted}
                    </span>
                    <button
                      className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-muted-foreground transition-colors"
                      onClick={() => copy(r.formatted, r.id)}
                      title="复制"
                    >
                      {copiedId === r.id ? (
                        <Check className="size-3.5 text-green-500" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-sm text-muted-foreground">
          请输入有效的数值
        </div>
      )}
    </div>
  );
}
