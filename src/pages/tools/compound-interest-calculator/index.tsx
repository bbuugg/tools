import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMemo, useState, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tab = "plan" | "goal";

const TABS: { value: Tab; label: string }[] = [
  { value: "plan", label: "复利测算" },
  { value: "goal", label: "存款目标倒推" },
];

/** 常用年利率参考（%） */
const RATE_CHIPS = ["2", "3", "5", "8"];
/** 常见年限（年） */
const YEARS_CHIPS = ["3", "5", "10", "20", "30"];

interface SeriesPoint {
  /** 月序号，从 0 开始 */
  month: number;
  invested: number;
  balance: number;
}

/**
 * 复利增长序列：每期先按月利率计息、月末存入定投（普通年金）。
 * 余额_m = 余额_{m-1} × (1+r) + 月投；闭式解 PV(1+r)^n + P·((1+r)^n−1)/r
 */
function buildSeries(initial: number, monthly: number, annualRatePct: number, years: number): SeriesPoint[] {
  const months = Math.round(years * 12);
  const r = annualRatePct / 100 / 12;
  let balance = initial;
  let invested = initial;
  const rows: SeriesPoint[] = [{ month: 0, invested, balance }];
  for (let m = 1; m <= months; m++) {
    balance = balance * (1 + r) + monthly;
    invested += monthly;
    rows.push({ month: m, invested, balance });
  }
  return rows;
}

/** 目标倒推：达到 target 所需的每月定投额（与 buildSeries 同口径：普通年金） */
function solveMonthly(target: number, initial: number, annualRatePct: number, years: number): number {
  const months = Math.round(years * 12);
  const r = annualRatePct / 100 / 12;
  if (months <= 0) return NaN;
  if (r === 0) return Math.max((target - initial) / months, 0);
  const fvFactor = (Math.pow(1 + r, months) - 1) / r; // 定投终值系数（期末存入）
  return Math.max((target - initial * Math.pow(1 + r, months)) / fvFactor, 0);
}

const fmtMoney = (n: number): string =>
  n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtInt = (n: number): string => Math.round(n).toLocaleString("zh-CN");

/** 坐标轴紧凑金额 */
function fmtAxis(v: number): string {
  if (v >= 1e8) return `${+(v / 1e8).toFixed(1)} 亿`;
  if (v >= 1e4) {
    const w = v / 1e4;
    return `${w >= 100 ? Math.round(w) : +w.toFixed(1)} 万`;
  }
  return fmtInt(v);
}

/** 把任意上界取整到干净刻度（返回步长与 4 格刻度上限） */
function niceScale(maxValue: number): { step: number; max: number } {
  if (!(maxValue > 0)) return { step: 1, max: 4 };
  const raw = maxValue / 4;
  const exp = Math.floor(Math.log10(raw));
  const base = Math.pow(10, exp);
  const n = raw / base;
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * base;
  return { step, max: step * 4 };
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-card p-1 gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
            o.value === value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Field({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}

// ─── 增长曲线图 ──────────────────────────────────────────────

/** 图表系列色（分类槽位 1/2，已通过明暗两种卡面校验） */
const CHART_STYLE = `
.ci-chart{--ci-s1:#2a78d6;--ci-s2:#eb6834;}
.dark .ci-chart{--ci-s1:#3987e5;--ci-s2:#d95926;}
`;

const CW = 720;
const CH = 300;
const PAD = { l: 60, r: 20, t: 20, b: 34 };
const INNER_W = CW - PAD.l - PAD.r;
const INNER_H = CH - PAD.t - PAD.b;

function GrowthChart({ rows }: { rows: SeriesPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const months = rows.length - 1;
  const { step: yStep, max: yMax } = niceScale(Math.max(...rows.map((r) => r.balance)));
  const x = (m: number) => PAD.l + (m / months) * INNER_W;
  const y = (v: number) => PAD.t + (1 - v / yMax) * INNER_H;

  const toPath = (key: "balance" | "invested") =>
    rows.map((r, i) => `${i === 0 ? "M" : "L"}${x(r.month).toFixed(2)},${y(r[key]).toFixed(2)}`).join(" ");
  const balancePath = toPath("balance");
  const investedPath = toPath("invested");
  const areaPath = `${balancePath}L${x(months).toFixed(2)},${y(0)}L${PAD.l},${y(0)}Z`;

  const yTicks = Array.from({ length: 5 }, (_, i) => yStep * i);
  const yearStep = Math.max(1, Math.ceil(Math.round(months / 12) / 6));
  const yearTicks: number[] = [];
  for (let yr = 0; yr <= Math.round(months / 12); yr += yearStep) yearTicks.push(yr);

  const locate = (clientX: number, el: SVGSVGElement) => {
    const rect = el.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * CW;
    const frac = (sx - PAD.l) / INNER_W;
    return Math.min(Math.max(Math.round(frac * months), 0), months);
  };

  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    setHover((prev) => {
      const cur = prev ?? months;
      if (e.key === "ArrowLeft") return Math.max(cur - 1, 0);
      if (e.key === "ArrowRight") return Math.min(cur + 1, months);
      if (e.key === "Home") return 0;
      return months;
    });
  };

  const hovered = hover !== null ? rows[hover] : null;
  // 提示框锚点（容器百分比坐标），横向收进边界
  const tipLeftFrac = hovered ? Math.min(Math.max(x(hovered.month) / CW, 0.14), 0.86) : 0;
  const tipTopFrac = hovered ? Math.min(y(Math.max(hovered.balance, hovered.invested)) / CH, 0.6) : 0;

  return (
    <div className="ci-chart relative">
      <style>{CHART_STYLE}</style>
      {/* 图例 */}
      <div className="absolute right-3 top-2 z-10 flex items-center gap-4 text-xs">
        {[
          { color: "var(--ci-s1)", label: "账户余额" },
          { color: "var(--ci-s2)", label: "累计投入" },
        ].map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="inline-block w-3.5 h-0.5 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${CW} ${CH}`}
        className="w-full h-auto select-none"
        role="img"
        aria-label="复利增长曲线：账户余额与累计投入随时间变化"
        tabIndex={0}
        onPointerMove={(e) => setHover(locate(e.clientX, e.currentTarget))}
        onPointerLeave={() => setHover(null)}
        onFocus={() => setHover((prev) => prev ?? months)}
        onBlur={() => setHover(null)}
        onKeyDown={onKeyDown}
      >
        {/* 网格线与 Y 轴刻度 */}
        {yTicks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.l}
              x2={CW - PAD.r}
              y1={y(t)}
              y2={y(t)}
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />
            <text
              x={PAD.l - 8}
              y={y(t) + 3.5}
              textAnchor="end"
              fontSize="11"
              fill="hsl(var(--muted-foreground))"
            >
              {fmtAxis(t)}
            </text>
          </g>
        ))}

        {/* X 轴年份刻度 */}
        {yearTicks.map((yr) => (
          <text
            key={yr}
            x={x(yr * 12)}
            y={CH - 12}
            textAnchor="middle"
            fontSize="11"
            fill="hsl(var(--muted-foreground))"
          >
            {yr === 0 ? "0" : `${yr}年`}
          </text>
        ))}

        {/* 收益面积水洗（余额系列，10% 不透明度） */}
        <path d={areaPath} fill="var(--ci-s1)" opacity="0.1" />

        {/* 折线（2px，圆角连接） */}
        <path d={investedPath} fill="none" stroke="var(--ci-s2)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <path d={balancePath} fill="none" stroke="var(--ci-s1)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* 十字线与悬停点（带 2px 卡面色外环） */}
        {hovered && (
          <g>
            <line
              x1={x(hovered.month)}
              x2={x(hovered.month)}
              y1={PAD.t}
              y2={PAD.t + INNER_H}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="1"
              opacity="0.5"
            />
            <circle cx={x(hovered.month)} cy={y(hovered.invested)} r="4" fill="var(--ci-s2)" stroke="hsl(var(--card))" strokeWidth="2" />
            <circle cx={x(hovered.month)} cy={y(hovered.balance)} r="4" fill="var(--ci-s1)" stroke="hsl(var(--card))" strokeWidth="2" />
          </g>
        )}

        {/* 终点标记 */}
        {!hovered && (
          <g>
            <circle cx={x(months)} cy={y(rows[months].invested)} r="4" fill="var(--ci-s2)" stroke="hsl(var(--card))" strokeWidth="2" />
            <circle cx={x(months)} cy={y(rows[months].balance)} r="4" fill="var(--ci-s1)" stroke="hsl(var(--card))" strokeWidth="2" />
          </g>
        )}
      </svg>

      {/* 悬停提示：数值为主、系列名为辅 */}
      {hovered && (
        <div
          className="pointer-events-none absolute z-20 rounded-lg border border-border bg-popover px-3 py-2 shadow-md text-xs whitespace-nowrap"
          style={{ left: `${tipLeftFrac * 100}%`, top: `${tipTopFrac * 100}%`, transform: "translate(-50%, -110%)" }}
        >
          <div className="text-muted-foreground mb-1">
            第 {Math.floor(hovered.month / 12)} 年 {hovered.month % 12} 个月
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3.5 h-0.5 rounded-full shrink-0" style={{ background: "var(--ci-s1)" }} />
              <span className="font-semibold tabular-nums">{fmtMoney(hovered.balance)}</span>
              <span className="text-muted-foreground">账户余额</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3.5 h-0.5 rounded-full shrink-0" style={{ background: "var(--ci-s2)" }} />
              <span className="font-semibold tabular-nums">{fmtMoney(hovered.invested)}</span>
              <span className="text-muted-foreground">累计投入</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 结果视图 ────────────────────────────────────────────────

function ResultView({
  initial,
  monthly,
  rate,
  years,
}: {
  initial: number;
  monthly: number;
  rate: number;
  years: number;
}) {
  const rows = useMemo(() => buildSeries(initial, monthly, rate, years), [initial, monthly, rate, years]);
  const final = rows[rows.length - 1];
  const profit = final.balance - final.invested;
  const profitRate = final.invested > 0 ? (profit / final.invested) * 100 : 0;

  // 年度明细（每年年末一行，含最后一月）
  const yearly = rows.filter((r) => r.month % 12 === 0 || r.month === rows.length - 1);
  const yearLabel = (m: number) => (m % 12 === 0 ? `${m / 12} 年末` : `${Math.ceil(m / 12)} 年第 ${m % 12} 月`);

  const tiles = [
    { label: "到期本息合计", value: `${fmtMoney(final.balance)} 元`, hint: `约 ${(final.balance / 1e4).toLocaleString("zh-CN", { maximumFractionDigits: 2 })} 万` },
    { label: "累计投入本金", value: `${fmtMoney(final.invested)} 元`, hint: monthly > 0 ? `其中定投 ${fmtMoney(final.invested - initial)} 元` : undefined },
    { label: "预计收益", value: `${fmtMoney(profit)} 元`, hint: `占总资产 ${(final.balance > 0 ? (profit / final.balance) * 100 : 0).toFixed(1)}%` },
    { label: "本金收益率", value: `${profitRate.toFixed(1)} %`, hint: `${years} 年累计` },
  ];

  return (
    <>
      {/* 结果概览 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
          {tiles.map((t) => (
            <div key={t.label} className="bg-card px-4 py-3.5">
              <div className="text-xs text-muted-foreground">{t.label}</div>
              <div className="mt-1 text-lg font-semibold truncate">{t.value}</div>
              {t.hint && <div className="mt-0.5 text-xs text-muted-foreground">{t.hint}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* 增长曲线 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 pt-4 pb-1 border-b border-border">
          <span className="text-sm font-medium">增长曲线</span>
          <p className="text-xs text-muted-foreground mt-0.5 mb-3">悬停或用 ←/→ 键查看各时点的余额与投入明细</p>
        </div>
        <div className="px-2 pb-2 pt-8">
          <GrowthChart rows={rows} />
        </div>
      </div>

      {/* 年度明细表 */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <span className="text-sm font-medium">年度明细</span>
        </div>
        <div className="max-h-[380px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10 shadow-[0_1px_0_0_hsl(var(--border))]">
              <TableRow>
                <TableHead>时间点</TableHead>
                <TableHead className="text-right">累计投入（元）</TableHead>
                <TableHead className="text-right">账户余额（元）</TableHead>
                <TableHead className="text-right">累计收益（元）</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {yearly.map((r) => (
                <TableRow key={r.month}>
                  <TableCell>{yearLabel(r.month)}</TableCell>
                  <TableCell className="text-right tabular-nums">{fmtInt(r.invested)}</TableCell>
                  <TableCell className="text-right tabular-nums font-medium">{fmtInt(r.balance)}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {fmtInt(r.balance - r.invested)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}

// ─── 页面 ────────────────────────────────────────────────────

export default function CompoundInterestCalculatorPage() {
  const [tab, setTab] = useState<Tab>("plan");
  // 共用输入
  const [initial, setInitial] = useState("50000");
  const [rate, setRate] = useState("3");
  const [years, setYears] = useState("10");
  // 测算独有
  const [monthly, setMonthly] = useState("2000");
  // 目标倒推独有
  const [target, setTarget] = useState("1000000");

  const parsed = useMemo(() => {
    const initN = parseFloat(initial);
    const rateN = parseFloat(rate);
    const yearsN = parseFloat(years);
    const validCommon =
      Number.isFinite(initN) && initN >= 0 &&
      Number.isFinite(rateN) && rateN >= 0 && rateN <= 30 &&
      Number.isFinite(yearsN) && yearsN > 0 && yearsN <= 50;
    if (!validCommon) return null;
    if (tab === "plan") {
      const monthlyN = parseFloat(monthly);
      if (!Number.isFinite(monthlyN) || monthlyN < 0 || !(initN + monthlyN > 0)) return null;
      return { initial: initN, monthly: monthlyN, rate: rateN, years: yearsN };
    }
    const targetN = parseFloat(target);
    if (!Number.isFinite(targetN) || !(targetN > 0)) return null;
    const needMonthly = solveMonthly(targetN, initN, rateN, yearsN);
    return { initial: initN, monthly: needMonthly, rate: rateN, years: yearsN };
  }, [tab, initial, monthly, rate, years, target]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 计算模式 */}
      <Segmented options={TABS} value={tab} onChange={setTab} />

      {/* 参数输入 */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          {tab === "plan" ? (
            <>
              <Field label="初始本金（元）">
                <Input
                  type="number"
                  value={initial}
                  onChange={(e) => setInitial(e.target.value)}
                  placeholder="如 50000"
                  className="h-10 w-36 font-mono"
                  step="any"
                  min="0"
                />
              </Field>
              <Field label="每月定投（元）" className="flex-1 min-w-[160px]">
                <Input
                  type="number"
                  value={monthly}
                  onChange={(e) => setMonthly(e.target.value)}
                  placeholder="如 2000"
                  className="h-10 text-lg font-mono"
                  step="any"
                  min="0"
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="目标金额（元）" className="flex-1 min-w-[180px]">
                <Input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="如 1000000"
                  className="h-10 text-lg font-mono"
                  step="any"
                  min="0"
                />
              </Field>
              <Field label="现有本金（元）">
                <Input
                  type="number"
                  value={initial}
                  onChange={(e) => setInitial(e.target.value)}
                  placeholder="已存金额"
                  className="h-10 w-36 font-mono"
                  step="any"
                  min="0"
                />
              </Field>
            </>
          )}
          <Field label="年利率（%）">
            <Input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="如 3"
              className="h-10 w-24 font-mono"
              step="0.01"
              min="0"
            />
          </Field>
          <Field label="期限（年）">
            <Input
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              placeholder="如 10"
              className="h-10 w-24 font-mono"
              step="1"
              min="1"
              max="50"
            />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">利率</span>
            {RATE_CHIPS.map((r) => (
              <button
                key={r}
                onClick={() => setRate(r)}
                className="rounded-md border border-border px-2.5 py-1 text-xs font-mono text-muted-foreground hover:border-primary/50 hover:bg-accent transition-colors"
              >
                {r}%
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">年限</span>
            {YEARS_CHIPS.map((y) => (
              <button
                key={y}
                onClick={() => setYears(y)}
                className="rounded-md border border-border px-2.5 py-1 text-xs font-mono text-muted-foreground hover:border-primary/50 hover:bg-accent transition-colors"
              >
                {y} 年
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {tab === "plan"
            ? "按月复利、定投月末存入计算；收益随时间加速增长，曲线与投入线的开口即为复利效应。"
            : "根据目标金额倒推每月需投入额度；若现有本金按复利即可达成，所需定投会相应减少。"}
        </p>
      </div>

      {/* 结果 */}
      {parsed ? (
        tab === "plan" ? (
          <ResultView {...parsed} />
        ) : (
          <>
            <div className="rounded-xl border border-primary/40 bg-primary/5 px-5 py-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-sm text-muted-foreground">达到目标，每月需要投入</span>
              <span className="text-2xl font-semibold tabular-nums">{fmtMoney(parsed.monthly)}</span>
              <span className="text-sm text-muted-foreground">元</span>
            </div>
            <ResultView {...parsed} />
          </>
        )
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-sm text-muted-foreground">
          请输入有效的参数（年限 1–50 年，利率 0–30%，金额不小于 0 且不全为 0）
        </div>
      )}
    </div>
  );
}
