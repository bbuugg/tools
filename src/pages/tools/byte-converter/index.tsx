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
import { Check, Copy, Eraser } from "lucide-react";
import { useMemo, useState } from "react";

// ─── Unit definitions ───────────────────────────────────────────

interface UnitDef {
  id: string;
  name: string;
  symbol: string;
  /** exponent of the base (1000 or 1024): Byte = 0, KB = 1, MB = 2, … */
  exp: number;
}

const UNITS: UnitDef[] = [
  { id: "bit", name: "比特", symbol: "b", exp: 0 },
  { id: "byte", name: "字节", symbol: "B", exp: 0 },
  { id: "kb", name: "千字节", symbol: "KB", exp: 1 },
  { id: "mb", name: "兆字节", symbol: "MB", exp: 2 },
  { id: "gb", name: "千兆字节", symbol: "GB", exp: 3 },
  { id: "tb", name: "太字节", symbol: "TB", exp: 4 },
];

/** Convert a unit to its size in bits. base = 1000 (decimal) or 1024 (binary). */
function bitsPerUnit(unit: UnitDef, base: number): number {
  if (unit.id === "bit") return 1;
  return 8 * Math.pow(base, unit.exp);
}

/** Format a number with smart precision + grouping */
function formatNumber(n: number): string {
  if (!isFinite(n)) return "∞";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  // Very large or very small → exponential
  if (abs >= 1e21 || (abs < 1e-7 && abs > 0)) return n.toExponential(6);
  // Integer-ish → no decimals
  if (Number.isInteger(n)) return n.toLocaleString("en-US");
  // Otherwise → up to 6 significant digits, strip trailing zeros
  const fixed = parseFloat(n.toPrecision(12));
  return fixed.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

// ─── Copy hook ──────────────────────────────────────────────────

function useCopy() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  return { copiedId, copy };
}

// ═════════════════════════════════════════════════════════════════
// Main Page
// ═════════════════════════════════════════════════════════════════

export default function ByteConverterPage() {
  const [inputValue, setInputValue] = useState("1");
  const [fromUnit, setFromUnit] = useState("mb");
  const [binary, setBinary] = useState(true); // false = decimal (1000), true = binary (1024)

  const { copiedId, copy } = useCopy();

  const base = binary ? 1024 : 1000;

  // ── Compute all conversions ───────────────────────────────────
  const results = useMemo(() => {
    const value = parseFloat(inputValue);
    if (isNaN(value)) return null;

    const sourceUnit = UNITS.find((u) => u.id === fromUnit)!;
    const sourceBits = bitsPerUnit(sourceUnit, base);
    const totalBits = value * sourceBits;

    return UNITS.map((unit) => {
      const factor = bitsPerUnit(unit, base);
      const converted = totalBits / factor;
      return { ...unit, value: converted, formatted: formatNumber(converted) };
    });
  }, [inputValue, fromUnit, base]);

  const handleClear = () => {
    setInputValue("");
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Input section */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
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
            <Label className="text-sm font-medium">单位</Label>
            <Select value={fromUnit} onValueChange={setFromUnit}>
              <SelectTrigger className="w-40 h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name} ({u.symbol})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium">进位制</Label>
            <div className="flex items-center gap-2 h-10 rounded-md border border-gray-200 px-3">
              <span className={`text-sm ${!binary ? "text-primary font-medium" : "text-gray-400"}`}>十进制 (1000)</span>
              <Switch checked={binary} onCheckedChange={setBinary} />
              <span className={`text-sm ${binary ? "text-primary font-medium" : "text-gray-400"}`}>二进制 (1024)</span>
            </div>
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10" onClick={handleClear} disabled={!inputValue} title="清空">
            <Eraser className="size-4" />
          </Button>
        </div>

        {/* Quick chips */}
        <div className="flex flex-wrap gap-2">
          {["1", "8", "1024", "1048576"].map((v) => (
            <button
              key={v}
              className="rounded-md border border-gray-200 px-2.5 py-1 text-xs font-mono text-gray-600 hover:border-primary/50 hover:bg-gray-50 transition-colors"
              onClick={() => setInputValue(v)}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {results ? (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium">转换结果</span>
            <span className="text-xs text-gray-400">
              {binary ? "1 KB = 1024 B" : "1 KB = 1000 B"}
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {results.map((r) => {
              const isSource = r.id === fromUnit;
              return (
                <div
                  key={r.id}
                  className={`flex items-center justify-between px-5 py-3 transition-colors ${isSource ? "bg-primary/5" : "hover:bg-gray-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-gray-900">{r.name}</span>
                      <span className="text-xs text-gray-400 font-mono">({r.symbol})</span>
                      {isSource && (
                        <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">输入</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-900 tabular-nums">{r.formatted}</span>
                    <button
                      className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
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
        <div className="rounded-xl border border-gray-200 bg-white p-12 flex flex-col items-center justify-center text-sm text-gray-400">
          请输入有效的数值
        </div>
      )}

      {/* Unit reference */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="text-sm font-medium mb-3">单位换算参考</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
          {(binary
            ? [
                ["1 B", "8 b"],
                ["1 KB", "1024 B (8192 b)"],
                ["1 MB", "1024 KB"],
                ["1 GB", "1024 MB"],
                ["1 TB", "1024 GB"],
              ]
            : [
                ["1 B", "8 b"],
                ["1 KB", "1000 B (8000 b)"],
                ["1 MB", "1000 KB"],
                ["1 GB", "1000 MB"],
                ["1 TB", "1000 GB"],
              ]
          ).map(([left, right]) => (
            <div key={left} className="flex items-center gap-2 font-mono">
              <span className="text-gray-900 font-medium">{left}</span>
              <span className="text-gray-400">=</span>
              <span>{right}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
