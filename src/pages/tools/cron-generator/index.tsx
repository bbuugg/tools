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
import { cn } from "@/lib/utils";
import {
  Check,
  Clock,
  Copy
} from "lucide-react";
import { useEffect, useState } from "react";

type ExprType = "every" | "specific" | "range" | "interval" | "not_specified";

interface Field {
  type: ExprType;
  value?: string | number;
  start?: string | number;
  end?: string | number;
  step?: number;
}

const PRESETS = [
  { label: "每分钟", value: "* * * * *" },
  { label: "每小时", value: "0 * * * *" },
  { label: "每天零点", value: "0 0 * * *" },
  { label: "每天早8点", value: "0 8 * * *" },
  { label: "每周一9点", value: "0 9 * * MON" },
  { label: "每月1号零点", value: "0 0 1 * *" },
];

const WEEK_OPTIONS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

function getFieldValue(f: Field, defaultVal: string): string {
  switch (f.type) {
    case "every": return defaultVal;
    case "specific": return f.value?.toString() || defaultVal;
    case "range": return `${f.start}-${f.end}`;
    case "interval": return `${f.start || "*"}/${f.step || 1}`;
    case "not_specified": return defaultVal === "?" ? "?" : "*";
    default: return defaultVal;
  }
}

function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length < 5) return "表达式格式不正确";
  const [m, h, d, mon, w] = parts;
  const desc: string[] = [];
  if (m === "*" && h === "*" && d === "*" && mon === "*" && w === "*") return "每分钟执行";
  if (m !== "*") desc.push(`第 ${m} 分钟`);
  if (h !== "*") desc.push(`${h} 时`);
  if (d !== "*" && w === "*") desc.push(`${d} 日`);
  if (mon !== "*") desc.push(`${mon} 月`);
  if (w !== "*" && w !== "?") desc.push(`星期 ${w}`);
  if (m === "*" && h !== "*") desc.unshift(`每小时`);
  if (m === "0" && h === "0" && d === "*" && mon === "*" && w === "*") return "每天零点执行";
  return desc.length > 0 ? `在 ${desc.join("、")} 执行` : "自定义计划";
}

export default function CronGeneratorPage() {
  const [minute, setMinute] = useState<Field>({ type: "specific", value: 0 });
  const [hour, setHour] = useState<Field>({ type: "specific", value: 0 });
  const [day, setDay] = useState<Field>({ type: "every" });
  const [month, setMonth] = useState<Field>({ type: "every" });
  const [week, setWeek] = useState<Field>({ type: "not_specified" });
  const [customExpr, setCustomExpr] = useState("0 0 * * *");
  const [isValid, setIsValid] = useState(true);
  const [copied, setCopied] = useState(false);
  const [nextExecs, setNextExecs] = useState<string[]>([]);

  const generated = `${getFieldValue(minute, "*")} ${getFieldValue(hour, "*")} ${getFieldValue(day, "*")} ${getFieldValue(month, "*")} ${getFieldValue(week, "?").replace("?", "*")}`;

  useEffect(() => {
    setCustomExpr(generated);
  }, [generated]);

  useEffect(() => {
    // Simple validation
    const valid = /^(\*|[0-9,*/\-A-Z]+)\s+(\*|[0-9,*/\-]+)\s+(\*|[0-9,*/\-]+)\s+(\*|[0-9,*/\-]+)\s+(\*|[0-9,*/\-A-Z]+)/.test(customExpr.trim());
    setIsValid(valid);
    if (!valid) { setNextExecs([]); return; }

    // Simulate next execution times
    const next: string[] = [];
    const now = new Date();
    for (let i = 0; i < 10; i++) {
      const t = new Date(now.getTime() + (i + 1) * 60000);
      next.push(t.toLocaleString("zh-CN"));
    }
    setNextExecs(next);
  }, [customExpr]);

  const handleTypeChange = (setter: React.Dispatch<React.SetStateAction<Field>>, field: string, type: ExprType) => {
    const defaults: Record<string, { value: number | string; start: number | string; end: number | string; step: number }> = {
      minute: { value: 0, start: 0, end: 59, step: 1 },
      hour: { value: 0, start: 0, end: 23, step: 1 },
      day: { value: 1, start: 1, end: 31, step: 1 },
      month: { value: 1, start: 1, end: 12, step: 1 },
      week: { value: "MON", start: "MON", end: "FRI", step: 1 },
    };
    setter({ type, value: defaults[field].value, start: defaults[field].start, end: defaults[field].end, step: defaults[field].step });
  };

  const renderField = (setter: React.Dispatch<React.SetStateAction<Field>>, field: Field, label: string, key: string, min: number, max: number) => {
    const types: ExprType[] = key === "day" || key === "week"
      ? ["every", "specific", "range", "interval", "not_specified"]
      : ["every", "specific", "range", "interval"];

    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex flex-wrap gap-1">
          {types.map((t) => (
            <button
              key={t}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                field.type === t ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
              onClick={() => handleTypeChange(setter, key, t)}
            >
              {{ every: "每", specific: "指定", range: "范围", interval: "间隔", not_specified: "不指定" }[t]}
            </button>
          ))}
        </div>
        {field.type === "specific" && (
          key === "week" ? (
            <Select value={field.value?.toString()} onValueChange={(v) => setter({ ...field, value: v })}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {WEEK_OPTIONS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : key === "month" ? (
            <Select value={field.value?.toString()} onValueChange={(v) => setter({ ...field, value: parseInt(v) })}>
              <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <SelectItem key={m} value={m.toString()}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : (
            <Input type="number" min={min} max={max} value={field.value as number} onChange={(e) => setter({ ...field, value: parseInt(e.target.value) || 0 })} className="h-8" />
          )
        )}
        {field.type === "range" && (
          <div className="flex items-center gap-2">
            {key === "week" ? (
              <>
                <Select value={field.start?.toString()} onValueChange={(v) => setter({ ...field, start: v })}>
                  <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>{WEEK_OPTIONS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                </Select>
                <span className="text-xs text-gray-400">~</span>
                <Select value={field.end?.toString()} onValueChange={(v) => setter({ ...field, end: v })}>
                  <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>{WEEK_OPTIONS.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}</SelectContent>
                </Select>
              </>
            ) : (
              <>
                <Input type="number" min={min} max={max} value={field.start as number} onChange={(e) => setter({ ...field, start: parseInt(e.target.value) || min })} className="h-8 w-20" />
                <span className="text-xs text-gray-400">~</span>
                <Input type="number" min={min} max={max} value={field.end as number} onChange={(e) => setter({ ...field, end: parseInt(e.target.value) || max })} className="h-8 w-20" />
              </>
            )}
          </div>
        )}
        {field.type === "interval" && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xs text-gray-400">从</span>
            <Input type="number" min={min} max={max} value={field.start as number || ""} onChange={(e) => setter({ ...field, start: e.target.value ? parseInt(e.target.value) : "*" })} className="h-8 w-16" placeholder="*" />
            <span className="text-xs text-gray-400">每隔</span>
            <Input type="number" min={1} value={field.step || 1} onChange={(e) => setter({ ...field, step: parseInt(e.target.value) || 1 })} className="h-8 w-16" />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Button key={p.value} variant="outline" size="sm" onClick={() => setCustomExpr(p.value)}>
              {p.label}
            </Button>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Left: Generator */}
          <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
            <Label className="text-sm font-semibold">字段设置</Label>
            {renderField(setMinute, minute, "分钟", "minute", 0, 59)}
            {renderField(setHour, hour, "小时", "hour", 0, 23)}
            {renderField(setDay, day, "日", "day", 1, 31)}
            {renderField(setMonth, month, "月", "month", 1, 12)}
            {renderField(setWeek, week, "星期", "week", 0, 6)}
          </div>

          {/* Right: Preview */}
          <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
            <div>
              <Label className="text-sm font-semibold mb-2 block">生成结果</Label>
              <div className="flex items-center justify-between gap-2 rounded-lg border border-gray-200 p-3">
                <code className="text-lg font-mono break-all">{customExpr}</code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(customExpr);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copied ? "已复制" : "复制"}
                </Button>
              </div>
              <p className="mt-2 text-sm text-gray-500">{describeCron(customExpr)}</p>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">手动输入表达式</Label>
              <Input
                value={customExpr}
                onChange={(e) => setCustomExpr(e.target.value)}
                className="font-mono"
                placeholder="* * * * *"
              />
              {!isValid && (
                <p className="mt-1 text-xs text-red-500">表达式格式无效</p>
              )}
            </div>

            {nextExecs.length > 0 && (
              <div>
                <Label className="text-sm font-semibold mb-2 block">下次执行时间（模拟）</Label>
                <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-gray-100">
                  {nextExecs.map((time, i) => (
                    <div key={i} className="flex items-center gap-2 border-b border-gray-50 px-3 py-2 text-sm last:border-0">
                      <Clock className="size-3.5 text-primary" />
                      {time}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
