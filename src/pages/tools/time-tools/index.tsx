import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  Copy,
  Check,
  RefreshCw,
  CalendarDays,
  Plus,
  Minus,
  ArrowDownUp,
  Globe,
} from "lucide-react";



import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DatePickerTime } from "@/components/ui/date-picker-time";

/* ============================================================
 * Shared helpers
 * ============================================================ */

const pad = (n: number) => String(n).padStart(2, "0");

const formatDate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const formatDateTime = (d: Date, withSeconds = true) => {
  const hms = withSeconds
    ? `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    : `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return `${formatDate(d)} ${hms}`;
};

const toLocalInputValue = (d: Date) =>
  `${formatDate(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

/* ============================================================
 * Copy Button helper component
 * ============================================================ */
function CopyBtn({
  value,
  size = "sm",
}: {
  value: string;
  size?: "sm" | "default";
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size={size}
      disabled={!value}
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "已复制" : "复制"}
    </Button>
  );
}

/* ============================================================
 * Tab 1 — Timestamp Converter
 * ============================================================ */
function TimestampConverter() {
  const [nowTs, setNowTs] = useState("");
  const [timestamp, setTimestamp] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [formattedDT, setFormattedDT] = useState("");
  const [unit, setUnit] = useState<"s" | "ms">("s");

  const commonTimestamps = useMemo(() => {
    if (!nowTs) return [];
    const d = new Date(parseInt(nowTs) * 1000);
    return [
      { label: "当前时间", value: Math.floor(d.getTime() / 1000) },
      { label: "今天零点", value: Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 1000) },
      { label: "本周一", value: Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7)).getTime() / 1000) },
      { label: "本月初", value: Math.floor(new Date(d.getFullYear(), d.getMonth(), 1).getTime() / 1000) },
      { label: "本年初", value: Math.floor(new Date(d.getFullYear(), 0, 1).getTime() / 1000) },
    ];
  }, [nowTs]);

  // Live clock
  useEffect(() => {
    const tick = () => setNowTs(Math.floor(Date.now() / 1000).toString());
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const tsToDt = (raw: string, tsUnit: "s" | "ms") => {
    if (!raw.trim()) {
      setDateTime("");
      setFormattedDT("");
      return;
    }
    let n = parseInt(raw);
    if (isNaN(n)) {
      setDateTime("");
      setFormattedDT("");
      return;
    }
    // If seconds unit but input looks like ms (>=13 digits), auto-detect
    if (tsUnit === "s" && raw.length >= 13) n = Math.floor(n / 1000);
    const d = tsUnit === "ms" ? new Date(n) : new Date(n * 1000);
    if (isNaN(d.getTime())) return;
    setDateTime(toLocalInputValue(d));
    setFormattedDT(formatDateTime(d));
  };

  const dtToTs = (raw: string, tsUnit: "s" | "ms") => {
    if (!raw.trim()) {
      setTimestamp("");
      return;
    }
    const d = new Date(raw);
    if (isNaN(d.getTime())) return;
    setTimestamp(tsUnit === "ms" ? d.getTime().toString() : Math.floor(d.getTime() / 1000).toString());
  };

  const useNowTs = () => {
    const ts = unit === "ms" ? Date.now().toString() : Math.floor(Date.now() / 1000).toString();
    setTimestamp(ts);
    tsToDt(ts, unit);
  };

  const useNowDt = () => {
    const d = new Date();
    const val = toLocalInputValue(d);
    setDateTime(val);
    setFormattedDT(formatDateTime(d));
    setTimestamp(unit === "ms" ? d.getTime().toString() : Math.floor(d.getTime() / 1000).toString());
  };

  return (
    <div className="space-y-4">
      {/* Live clock */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="size-4" />
        <span>当前 Unix 时间戳：</span>
        <code className="rounded bg-muted px-2 py-0.5 font-mono text-primary">
          {nowTs}
        </code>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Timestamp → DateTime */}
        <div className="space-y-3 rounded-lg border border-border bg-card p-5">
          <Label className="text-sm font-semibold">Unix 时间戳</Label>
          <div className="flex gap-2">
            <Input
              value={timestamp}
              onChange={(e) => {
                setTimestamp(e.target.value);
                tsToDt(e.target.value, unit);
              }}
              placeholder="输入时间戳，如 1700000000"
            />
            <Button variant="outline" size="icon" onClick={useNowTs} title="使用当前时间">
              <RefreshCw className="size-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-border p-0.5">
              <button
                className={cn("rounded px-3 py-1 text-xs font-medium transition-colors", unit === "s" ? "bg-primary text-white" : "text-muted-foreground hover:bg-accent")}
                onClick={() => { setUnit("s"); if (timestamp) tsToDt(timestamp, "s"); }}
              >秒 (10位)</button>
              <button
                className={cn("rounded px-3 py-1 text-xs font-medium transition-colors", unit === "ms" ? "bg-primary text-white" : "text-muted-foreground hover:bg-accent")}
                onClick={() => { setUnit("ms"); if (timestamp) tsToDt(timestamp, "ms"); }}
              >毫秒 (13位)</button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {commonTimestamps.map((ts) => (
              <Button
                key={ts.label}
                variant="outline"
                size="sm"
                onClick={() => {
                  const v = unit === "ms" ? ts.value * 1000 : ts.value;
                  setTimestamp(v.toString());
                  tsToDt(v.toString(), unit);
                }}
              >
                {ts.label}
              </Button>
            ))}
          </div>

          {timestamp && (
            <div className="flex items-center justify-between gap-2">
              <code className="flex-1 truncate rounded bg-muted px-3 py-2 text-sm">
                {timestamp}
              </code>
              <CopyBtn value={timestamp} />
            </div>
          )}
        </div>

        {/* DateTime → Timestamp */}
        <div className="space-y-3 rounded-lg border border-border bg-card p-5">
          <Label className="text-sm font-semibold">日期时间</Label>
          <div className="flex gap-2">
            <DatePickerTime
              value={dateTime}
              onChange={(v) => {
                setDateTime(v);
                const d = new Date(v);
                if (!isNaN(d.getTime())) setFormattedDT(formatDateTime(d));
                dtToTs(v, unit);
              }}
              placeholder="选择日期时间"
            />
            <Button variant="outline" size="icon" onClick={useNowDt} title="使用当前时间">
              <RefreshCw className="size-4" />
            </Button>
          </div>

          {formattedDT && (
            <div className="flex items-center justify-between gap-2">
              <code className="flex-1 truncate rounded bg-muted px-3 py-2 text-sm">
                {formattedDT}
              </code>
              <CopyBtn value={formattedDT} />
            </div>
          )}
        </div>
      </div>

      {/* Help */}
      <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
        <p className="mb-2 font-medium text-foreground">使用说明</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>输入 Unix 时间戳会自动转换为日期时间，支持 10 位（秒）和 13 位（毫秒）</li>
          <li>输入日期时间会自动转换为 Unix 时间戳（秒级）</li>
          <li>点击刷新按钮可快速填入当前时间</li>
          <li>常用时间戳可一键填入</li>
        </ul>
      </div>
    </div>
  );
}

/* ============================================================
 * Tab 2 — Date Calculator
 * ============================================================ */
type TimeUnit = "years" | "months" | "weeks" | "days" | "hours" | "minutes";

const UNIT_LABELS: Record<TimeUnit, string> = {
  years: "年",
  months: "月",
  weeks: "周",
  days: "天",
  hours: "小时",
  minutes: "分钟",
};

const UNITS: TimeUnit[] = ["years", "months", "weeks", "days", "hours", "minutes"];

function DateCalculator() {
  const [mode, setMode] = useState<"diff" | "add">("diff");

  // diff states
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return toLocalInputValue(d);
  });
  const [endDate, setEndDate] = useState(() => toLocalInputValue(new Date()));

  // add states
  const [baseDate, setBaseDate] = useState(() => toLocalInputValue(new Date()));
  const [amount, setAmount] = useState(1);
  const [unit, setUnit] = useState<TimeUnit>("days");
  const [operation, setOperation] = useState<"add" | "subtract">("add");

  const diffResult = useMemo(() => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return null;
    const diffMs = e.getTime() - s.getTime();
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    let months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    const years = Math.floor(months / 12);
    return { years, months, weeks, days, hours, minutes, seconds, milliseconds: diffMs };
  }, [startDate, endDate]);

  const addResult = useMemo(() => {
    const base = new Date(baseDate);
    if (isNaN(base.getTime()) || isNaN(amount)) return "";
    const d = new Date(base);
    const sign = operation === "add" ? 1 : -1;
    switch (unit) {
      case "years": d.setFullYear(d.getFullYear() + sign * amount); break;
      case "months": d.setMonth(d.getMonth() + sign * amount); break;
      case "weeks": d.setDate(d.getDate() + sign * amount * 7); break;
      case "days": d.setDate(d.getDate() + sign * amount); break;
      case "hours": d.setHours(d.getHours() + sign * amount); break;
      case "minutes": d.setMinutes(d.getMinutes() + sign * amount); break;
    }
    return formatDateTime(d);
  }, [baseDate, amount, unit, operation]);

  const setNowDiff = (which: "start" | "end") => {
    const val = toLocalInputValue(new Date());
    if (which === "start") setStartDate(val);
    else setEndDate(val);
  };

  const swapDates = () => {
    setStartDate(endDate);
    setEndDate(startDate);
  };

  const diffRows: { label: string; value: number; unit: string }[] = diffResult
    ? [
        { label: "年", value: diffResult.years, unit: "年" },
        { label: "月", value: diffResult.months, unit: "月" },
        { label: "周", value: diffResult.weeks, unit: "周" },
        { label: "天", value: diffResult.days, unit: "天" },
        { label: "小时", value: diffResult.hours, unit: "小时" },
        { label: "分钟", value: diffResult.minutes, unit: "分钟" },
        { label: "秒", value: diffResult.seconds, unit: "秒" },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border border-border bg-card p-1">
        <button
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
            mode === "diff" ? "bg-primary text-white" : "text-muted-foreground hover:bg-accent",
          )}
          onClick={() => setMode("diff")}
        >
          日期差值计算
        </button>
        <button
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
            mode === "add" ? "bg-primary text-white" : "text-muted-foreground hover:bg-accent",
          )}
          onClick={() => setMode("add")}
        >
          日期加减
        </button>
      </div>

      {mode === "diff" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4 rounded-lg border border-border bg-card p-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">开始日期</Label>
              <div className="flex gap-2">
                <DatePickerTime
                  value={startDate}
                  onChange={(v) => setStartDate(v)}
                />
                <Button variant="outline" size="sm" onClick={() => setNowDiff("start")}>
                  现在
                </Button>
              </div>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" size="sm" onClick={swapDates}>
                <ArrowDownUp className="size-3.5" /> 交换日期
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">结束日期</Label>
              <div className="flex gap-2">
                <DatePickerTime
                  value={endDate}
                  onChange={(v) => setEndDate(v)}
                />
                <Button variant="outline" size="sm" onClick={() => setNowDiff("end")}>
                  现在
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <Label className="mb-3 block text-sm font-semibold">计算结果</Label>
            {diffResult ? (
              <div className="space-y-1">
                {diffRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between border-b border-border py-2 last:border-0"
                  >
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {row.value} {row.unit}
                      </span>
                      <CopyBtn value={row.value.toString()} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                请输入有效的日期
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4 rounded-lg border border-border bg-card p-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">基准日期</Label>
              <div className="flex gap-2">
                <DatePickerTime
                  value={baseDate}
                  onChange={(v) => setBaseDate(v)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBaseDate(toLocalInputValue(new Date()))}
                >
                  现在
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">操作</Label>
              <div className="flex gap-2">
                <Button
                  variant={operation === "add" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOperation("add")}
                >
                  <Plus className="size-3.5" /> 加
                </Button>
                <Button
                  variant={operation === "subtract" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setOperation("subtract")}
                >
                  <Minus className="size-3.5" /> 减
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">数量</Label>
              <Input
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">单位</Label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {UNITS.map((u) => (
                  <Button
                    key={u}
                    variant={unit === u ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUnit(u)}
                  >
                    {UNIT_LABELS[u]}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <Label className="mb-3 block text-sm font-semibold">计算结果</Label>
            {addResult ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="mb-1 text-sm text-muted-foreground">
                    {operation === "add" ? "加" : "减"} {amount} {UNIT_LABELS[unit]} 后
                  </p>
                  <p className="text-lg font-semibold">{addResult}</p>
                </div>
                <div className="flex justify-center">
                  <CopyBtn value={addResult} size="default" />
                </div>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                请输入有效的日期和数量
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * Tab 3 — Timezone Converter
 * ============================================================ */

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Moscow",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Singapore",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Australia/Sydney",
  "Pacific/Auckland",
  "America/Sao_Paulo",
];

const TIMEZONE_GROUPS: { name: string; zones: { label: string; value: string; offset: string }[] }[] = [
  {
    name: "亚太地区",
    zones: [
      { label: "中国", value: "Asia/Shanghai", offset: "+08:00" },
      { label: "日本", value: "Asia/Tokyo", offset: "+09:00" },
      { label: "韩国", value: "Asia/Seoul", offset: "+09:00" },
      { label: "新加坡", value: "Asia/Singapore", offset: "+08:00" },
      { label: "印度", value: "Asia/Kolkata", offset: "+05:30" },
      { label: "澳大利亚悉尼", value: "Australia/Sydney", offset: "+10:00/+11:00" },
    ],
  },
  {
    name: "欧洲",
    zones: [
      { label: "英国", value: "Europe/London", offset: "+00:00/+01:00" },
      { label: "法国", value: "Europe/Paris", offset: "+01:00/+02:00" },
      { label: "德国", value: "Europe/Berlin", offset: "+01:00/+02:00" },
      { label: "俄罗斯", value: "Europe/Moscow", offset: "+03:00" },
    ],
  },
  {
    name: "美洲",
    zones: [
      { label: "美国东部", value: "America/New_York", offset: "-05:00/-04:00" },
      { label: "美国中部", value: "America/Chicago", offset: "-06:00/-05:00" },
      { label: "美国西部", value: "America/Los_Angeles", offset: "-08:00/-07:00" },
      { label: "巴西", value: "America/Sao_Paulo", offset: "-03:00/-02:00" },
    ],
  },
];

const getTzLongName = (tz: string, date: Date): string => {
  try {
    const parts = new Intl.DateTimeFormat("zh-CN", { timeZoneName: "long", timeZone: tz }).formatToParts(date);
    const tzPart = parts.find((p) => p.type === "timeZoneName");
    return tzPart?.value || tz;
  } catch {
    return tz;
  }
};

function TimezoneConverter() {
  const [dtString, setDtString] = useState(() => toLocalInputValue(new Date()));
  const [srcTz, setSrcTz] = useState("Asia/Shanghai");
  const [tgtTz, setTgtTz] = useState("America/New_York");
  const [copied, setCopied] = useState(false);

  const { convertedTime, details } = useMemo(() => {
    if (!dtString) return { convertedTime: "", details: "" };
    const d = new Date(dtString);
    if (isNaN(d.getTime())) return { convertedTime: "无效日期", details: "请输入有效的日期时间" };

    const fmt = (tz: string) =>
      new Intl.DateTimeFormat("zh-CN", {
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: false, timeZone: tz,
      }).format(d).replace(/\//g, "-");

    const srcFmt = fmt(srcTz);
    const tgtFmt = fmt(tgtTz);
    const srcName = getTzLongName(srcTz, d);
    const tgtName = getTzLongName(tgtTz, d);

    const text =
      `源时间: ${srcFmt} (${srcName})\n` +
      `目标时间: ${tgtFmt} (${tgtName})\n` +
      `时间戳: ${Math.floor(d.getTime() / 1000)}\n` +
      `ISO 格式: ${d.toISOString()}`;

    return { convertedTime: tgtFmt, details: text };
  }, [dtString, srcTz, tgtTz]);

  const useNow = () => setDtString(toLocalInputValue(new Date()));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-4 rounded-lg border border-border bg-card p-5">
        <div className="space-y-2">
          <Label className="text-sm font-semibold">日期时间</Label>
          <div className="flex gap-2">
            <DatePickerTime
              value={dtString}
              onChange={(v) => setDtString(v)}
            />
            <Button variant="outline" size="sm" onClick={useNow}>
              现在
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">源时区</Label>
            <Select value={srcTz} onValueChange={setSrcTz}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent className="max-w-[320px]">
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz} className="whitespace-normal break-all">
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold">目标时区</Label>
            <Select value={tgtTz} onValueChange={setTgtTz}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent className="max-w-[320px]">
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz} className="whitespace-normal break-all">
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">转换结果</Label>
            <Button
              variant="outline"
              size="sm"
              disabled={!convertedTime}
              onClick={() => {
                navigator.clipboard.writeText(convertedTime);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "已复制" : "复制"}
            </Button>
          </div>
          {convertedTime ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-border p-3">
                <p className="text-lg font-medium text-primary">{convertedTime}</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <pre className="whitespace-pre-wrap font-mono text-xs text-muted-foreground">
                  {details}
                </pre>
              </div>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              请输入日期时间并选择时区
            </p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <Label className="mb-3 block text-sm font-semibold">常用时区参考</Label>
        <div className="space-y-3">
          {TIMEZONE_GROUPS.map((group) => (
            <div key={group.name}>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">{group.name}</p>
              <div className="space-y-1">
                {group.zones.map((zone) => (
                  <div
                    key={zone.value}
                    className="flex items-center justify-between border-b border-border py-1.5 last:border-0"
                  >
                    <span className="text-sm font-medium">{zone.label}</span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{zone.value}</span>
                      <span>{zone.offset}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * Main Page
 * ============================================================ */
export default function TimeToolsPage() {
  return (
    <>
            <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

          <Tabs defaultValue="timestamp">
            <TabsList className="w-full max-w-md">
              <TabsTrigger value="timestamp" className="flex-1">
                <Clock className="size-4" /> 时间戳转换
              </TabsTrigger>
              <TabsTrigger value="calc" className="flex-1">
                <CalendarDays className="size-4" /> 日期计算
              </TabsTrigger>
              <TabsTrigger value="timezone" className="flex-1">
                <Globe className="size-4" /> 时区转换
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timestamp" className="mt-4">
              <TimestampConverter />
            </TabsContent>
            <TabsContent value="calc" className="mt-4">
              <DateCalculator />
            </TabsContent>
            <TabsContent value="timezone" className="mt-4">
              <TimezoneConverter />
            </TabsContent>
          </Tabs>
        </div>
      </div>
          </>
  );
}
