import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** 贷款类型：commercial=商业贷款 fund=公积金贷款 combined=组合贷款 */
type LoanType = "commercial" | "fund" | "combined";
/** 还款方式：annuity=等额本息 principal=等额本金 */
type RepayMethod = "annuity" | "principal";

interface ScheduleRow {
  /** 期数（第几月） */
  period: number;
  /** 月供 */
  payment: number;
  /** 当期本金 */
  principal: number;
  /** 当期利息 */
  interest: number;
  /** 剩余本金 */
  remain: number;
}

interface LoanResult {
  schedule: ScheduleRow[];
  firstPayment: number;
  lastPayment: number;
  /** 等额本金每期递减额 */
  monthlyDecrease: number;
  totalInterest: number;
  totalPayment: number;
}

interface LoanPart {
  name: string;
  amount: number;
  rate: number;
}

const LOAN_TYPES: { value: LoanType; label: string }[] = [
  { value: "commercial", label: "商业贷款" },
  { value: "fund", label: "公积金贷款" },
  { value: "combined", label: "组合贷款" },
];

const REPAY_METHODS: { value: RepayMethod; label: string }[] = [
  { value: "annuity", label: "等额本息" },
  { value: "principal", label: "等额本金" },
];

/** 快捷金额（展示文案 → 实际元数） */
const AMOUNT_CHIPS: [string, string][] = [
  ["50万", "500000"],
  ["100万", "1000000"],
  ["150万", "1500000"],
  ["200万", "2000000"],
  ["300万", "3000000"],
];

/** 常见年利率参考（可手动修改，以实际批贷为准） */
const RATE_PRESETS: Record<Exclude<LoanType, "combined">, string[]> = {
  commercial: ["3.05", "3.33", "3.6"],
  fund: ["2.6", "2.85", "3.1"],
};

/** 首付比例选项 */
const DOWN_PAYMENT_OPTIONS: [string, string][] = [
  ["20", "两成（20%）"],
  ["30", "三成（30%）"],
  ["40", "四成（40%）"],
  ["50", "五成（50%）"],
  ["60", "六成（60%）"],
  ["70", "七成（70%）"],
  ["80", "八成（80%）"],
];

/**
 * 构建单笔贷款的完整还款计划。
 * 等额本息：M = P·r·(1+r)^n / ((1+r)^n − 1)，每月还款额固定；
 * 等额本金：每月还固定本金 P/n + 剩余本金的利息，月供逐月递减。
 * 尾期待次对齐剩余本金，消除浮点累计误差。
 */
function buildLoan(P: number, annualRatePct: number, months: number, method: RepayMethod): LoanResult | null {
  if (!(P > 0) || !Number.isFinite(annualRatePct) || annualRatePct < 0 || !(months >= 1)) return null;
  const r = annualRatePct / 100 / 12;
  const rows: ScheduleRow[] = [];
  let remain = P;

  if (method === "annuity") {
    const pow = Math.pow(1 + r, months);
    const monthly = pow === 1 ? P / months : (P * r * pow) / (pow - 1);
    for (let i = 1; i <= months; i++) {
      const interest = remain * r;
      const principal = i === months ? remain : monthly - interest;
      remain -= principal;
      rows.push({
        period: i,
        payment: interest + principal,
        principal,
        interest,
        remain: Math.max(remain, 0),
      });
    }
  } else {
    const basePrincipal = P / months;
    for (let i = 1; i <= months; i++) {
      const interest = remain * r;
      const principal = i === months ? remain : basePrincipal;
      remain -= principal;
      rows.push({
        period: i,
        payment: interest + principal,
        principal,
        interest,
        remain: Math.max(remain, 0),
      });
    }
  }

  const totalInterest = rows.reduce((s, x) => s + x.interest, 0);
  return {
    schedule: rows,
    firstPayment: rows[0].payment,
    lastPayment: rows[rows.length - 1].payment,
    monthlyDecrease: (P / months) * r,
    totalInterest,
    totalPayment: P + totalInterest,
  };
}

/** 组合贷：两笔贷款按期数合并（年限相同，行数一致） */
function mergeSchedules(a: ScheduleRow[], b: ScheduleRow[]): ScheduleRow[] {
  return a.map((row, i) => ({
    period: row.period,
    payment: row.payment + b[i].payment,
    principal: row.principal + b[i].principal,
    interest: row.interest + b[i].interest,
    remain: row.remain + b[i].remain,
  }));
}

/** 金额格式化：千分位 + 两位小数 */
function fmtMoney(n: number): string {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** 万元格式化 */
function fmtWan(n: number): string {
  return `${(n / 10000).toLocaleString("zh-CN", { maximumFractionDigits: 2 })} 万`;
}

/** 分段切换按钮组 */
function Segmented<T extends string>({
  options,
  value,
  onChange,
  compact,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  compact?: boolean;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-card p-1 gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md font-medium transition-colors",
            compact ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm",
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

export default function MortgageCalculatorPage() {
  const [loanType, setLoanType] = useState<LoanType>("commercial");
  const [priceMode, setPriceMode] = useState<"amount" | "price">("amount");
  const [amount, setAmount] = useState("1000000");
  const [housePrice, setHousePrice] = useState("1500000");
  const [downRate, setDownRate] = useState("30");
  const [years, setYears] = useState("30");
  const [commAmount, setCommAmount] = useState("700000");
  const [fundAmount, setFundAmount] = useState("300000");
  const [commRate, setCommRate] = useState("3.05");
  const [fundRate, setFundRate] = useState("2.6");
  const [method, setMethod] = useState<RepayMethod>("annuity");

  const isCombined = loanType === "combined";

  const calc = useMemo(() => {
    const yearsN = parseFloat(years);
    const months = Math.round(yearsN * 12);

    let parts: LoanPart[];
    if (!isCombined) {
      const rate = loanType === "fund" ? parseFloat(fundRate) : parseFloat(commRate);
      const amt =
        priceMode === "amount"
          ? parseFloat(amount)
          : parseFloat(housePrice) * (1 - parseFloat(downRate) / 100);
      parts = [{ name: loanType === "fund" ? "公积金贷款" : "商业贷款", amount: amt, rate }];
    } else {
      parts = [
        { name: "商业贷款", amount: parseFloat(commAmount), rate: parseFloat(commRate) },
        { name: "公积金贷款", amount: parseFloat(fundAmount), rate: parseFloat(fundRate) },
      ];
    }

    const valid =
      parts.every((p) => Number.isFinite(p.amount) && p.amount > 0 && Number.isFinite(p.rate) && p.rate >= 0) &&
      months >= 1 &&
      months <= 360;
    if (!valid) return null;

    const loans = parts.map((p) => buildLoan(p.amount, p.rate, months, method));
    if (loans.some((l) => l === null)) return null;
    const results = loans as LoanResult[];

    const schedule =
      results.length === 1
        ? results[0].schedule
        : mergeSchedules(results[0].schedule, results[1].schedule);

    return {
      parts,
      months,
      loans: results,
      schedule,
      loanTotal: parts.reduce((s, p) => s + p.amount, 0),
      firstPayment: schedule[0].payment,
      lastPayment: schedule[schedule.length - 1].payment,
      monthlyDecrease: results.reduce((s, l) => s + l.monthlyDecrease, 0),
      totalInterest: results.reduce((s, l) => s + l.totalInterest, 0),
      totalPayment: results.reduce((s, l) => s + l.totalPayment, 0),
    };
  }, [loanType, priceMode, amount, housePrice, downRate, years, commAmount, fundAmount, commRate, fundRate, method, isCombined]);

  const exportCsv = () => {
    if (!calc) return;
    const lines = ["期数,月供(元),本金(元),利息(元),剩余本金(元)"];
    for (const row of calc.schedule) {
      lines.push(
        `${row.period},${row.payment.toFixed(2)},${row.principal.toFixed(2)},${row.interest.toFixed(2)},${row.remain.toFixed(2)}`,
      );
    }
    // BOM 保证 Excel 正确识别 UTF-8 中文
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `房贷还款计划表_${years}年_${method === "annuity" ? "等额本息" : "等额本金"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const methodName = method === "annuity" ? "等额本息" : "等额本金";
  const typeName = LOAN_TYPES.find((t) => t.value === loanType)!.label;

  const tiles: { label: string; value: number; hint?: string }[] = calc
    ? method === "annuity"
      ? [
          { label: "每月月供", value: calc.firstPayment, hint: `共 ${calc.months} 期 · 每月固定` },
          { label: "支付利息总额", value: calc.totalInterest, hint: `约 ${fmtWan(calc.totalInterest)}` },
          { label: "还款总额", value: calc.totalPayment, hint: "本金 + 利息" },
          {
            label: "贷款金额",
            value: calc.loanTotal,
            hint: isCombined ? "商贷 + 公积金" : undefined,
          },
        ]
      : [
          {
            label: "首月月供",
            value: calc.firstPayment,
            hint: `此后每月递减 ${fmtMoney(calc.monthlyDecrease)} 元`,
          },
          { label: "末月月供", value: calc.lastPayment, hint: `共 ${calc.months} 期` },
          { label: "支付利息总额", value: calc.totalInterest, hint: `约 ${fmtWan(calc.totalInterest)}` },
          { label: "还款总额", value: calc.totalPayment, hint: "本金 + 利息" },
        ]
    : [];

  const singleRate = loanType === "fund" ? fundRate : commRate;
  const setSingleRate = loanType === "fund" ? setFundRate : setCommRate;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 贷款类型 */}
      <Segmented options={LOAN_TYPES} value={loanType} onChange={setLoanType} />

      {/* 参数输入 */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        {/* 计算方式（单笔贷款支持按房价倒推） */}
        {!isCombined ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-muted-foreground">计算方式</span>
            <Segmented
              compact
              options={[
                { value: "amount", label: "按贷款总额" },
                { value: "price", label: "按房屋总价" },
              ]}
              value={priceMode}
              onChange={setPriceMode}
            />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            组合贷款请分别输入商贷与公积金部分的金额和利率，两部分共用同一贷款年限。
          </p>
        )}

        <div className="flex flex-wrap items-end gap-4">
          {!isCombined && priceMode === "amount" && (
            <Field label="贷款金额（元）" className="flex-1 min-w-[200px]">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="如 1000000"
                className="h-10 text-lg font-mono"
                step="any"
                min="0"
              />
            </Field>
          )}

          {!isCombined && priceMode === "price" && (
            <>
              <Field label="房屋总价（元）" className="flex-1 min-w-[200px]">
                <Input
                  type="number"
                  value={housePrice}
                  onChange={(e) => setHousePrice(e.target.value)}
                  placeholder="如 1500000"
                  className="h-10 text-lg font-mono"
                  step="any"
                  min="0"
                />
              </Field>
              <Field label="首付比例">
                <Select value={downRate} onValueChange={setDownRate}>
                  <SelectTrigger className="w-36 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOWN_PAYMENT_OPTIONS.map(([v, label]) => (
                      <SelectItem key={v} value={v}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </>
          )}

          {isCombined && (
            <>
              <Field label="商贷部分（元）">
                <Input
                  type="number"
                  value={commAmount}
                  onChange={(e) => setCommAmount(e.target.value)}
                  placeholder="商贷金额"
                  className="h-10 w-40 font-mono"
                  step="any"
                  min="0"
                />
              </Field>
              <Field label="商贷利率（%）">
                <Input
                  type="number"
                  value={commRate}
                  onChange={(e) => setCommRate(e.target.value)}
                  placeholder="年利率"
                  className="h-10 w-28 font-mono"
                  step="0.01"
                  min="0"
                />
              </Field>
              <Field label="公积金部分（元）">
                <Input
                  type="number"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  placeholder="公积金金额"
                  className="h-10 w-40 font-mono"
                  step="any"
                  min="0"
                />
              </Field>
              <Field label="公积金利率（%）">
                <Input
                  type="number"
                  value={fundRate}
                  onChange={(e) => setFundRate(e.target.value)}
                  placeholder="年利率"
                  className="h-10 w-28 font-mono"
                  step="0.01"
                  min="0"
                />
              </Field>
            </>
          )}

          {!isCombined && (
            <Field label="年利率（%）">
              <Input
                type="number"
                value={singleRate}
                onChange={(e) => setSingleRate(e.target.value)}
                placeholder="年利率"
                className="h-10 w-28 font-mono"
                step="0.01"
                min="0"
              />
            </Field>
          )}

          <Field label="贷款年限（年）">
            <Input
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              placeholder="1-30"
              className="h-10 w-24 font-mono"
              step="1"
              min="1"
              max="30"
            />
          </Field>
        </div>

        {/* 快捷输入 */}
        {!isCombined && priceMode === "amount" && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">快捷金额</span>
            {AMOUNT_CHIPS.map(([label, v]) => (
              <button
                key={v}
                className="rounded-md border border-border px-2.5 py-1 text-xs font-mono text-muted-foreground hover:border-primary/50 hover:bg-accent transition-colors"
                onClick={() => setAmount(v)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {!isCombined && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">参考利率</span>
            {RATE_PRESETS[loanType].map((r) => (
              <button
                key={r}
                className="rounded-md border border-border px-2.5 py-1 text-xs font-mono text-muted-foreground hover:border-primary/50 hover:bg-accent transition-colors"
                onClick={() => setSingleRate(r)}
              >
                {r}%
              </button>
            ))}
          </div>
        )}

        {priceMode === "price" && !isCombined && calc && (
          <p className="text-xs text-muted-foreground">
            首付款约 {fmtWan(calc.loanTotal / (1 - parseFloat(downRate) / 100) - calc.loanTotal)} ·{" "}
            贷款金额 {fmtWan(calc.loanTotal)}（{fmtMoney(calc.loanTotal)} 元）
          </p>
        )}

        {/* 还款方式 */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <span className="text-xs font-medium text-muted-foreground">还款方式</span>
          <Segmented options={REPAY_METHODS} value={method} onChange={setMethod} />
          <span className="text-xs text-muted-foreground">
            {method === "annuity"
              ? "每月还款额固定，便于安排家庭支出"
              : "前期月供较高、逐月递减，总利息更少"}
          </span>
        </div>
      </div>

      {/* 结果 */}
      {calc ? (
        <>
          {/* 还款概览 */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium">还款概览</span>
              <span className="text-xs text-muted-foreground">
                {typeName} · {years} 年（{calc.months} 期） · {methodName}
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
              {tiles.map((t) => (
                <div key={t.label} className="bg-card px-4 py-3.5">
                  <div className="text-xs text-muted-foreground">{t.label}</div>
                  <div className="mt-1 text-lg font-semibold tabular-nums truncate" title={fmtMoney(t.value)}>
                    {fmtMoney(t.value)}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">元</span>
                  </div>
                  {t.hint && <div className="mt-0.5 text-xs text-muted-foreground">{t.hint}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* 组合贷分项明细 */}
          {isCombined && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <span className="text-sm font-medium">分项明细</span>
              </div>
              <div className="divide-y divide-border">
                {calc.parts.map((part, i) => {
                  const loan = calc.loans[i];
                  return (
                    <div
                      key={part.name}
                      className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-3 hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{part.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{fmtWan(part.amount)}</span>
                        <span className="text-xs text-muted-foreground">年利率 {part.rate}%</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm tabular-nums">
                        <span className="text-muted-foreground">
                          月供 <span className="text-foreground">{fmtMoney(loan.firstPayment)}</span> 元
                        </span>
                        <span className="text-muted-foreground">
                          利息约 <span className="text-foreground">{fmtWan(loan.totalInterest)}</span>
                        </span>
                        <span className="text-muted-foreground">
                          合计 <span className="text-foreground">{fmtWan(loan.totalPayment)}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 还款计划表 */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium">还款计划表</span>
              <Button variant="outline" size="sm" onClick={exportCsv}>
                <Download className="size-3.5 mr-1.5" />
                导出 CSV
              </Button>
            </div>
            <div className="max-h-[480px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10 shadow-[0_1px_0_0_hsl(var(--border))]">
                  <TableRow>
                    <TableHead className="w-16">期数</TableHead>
                    <TableHead className="text-right">月供（元）</TableHead>
                    <TableHead className="text-right">本金（元）</TableHead>
                    <TableHead className="text-right">利息（元）</TableHead>
                    <TableHead className="text-right">剩余本金（元）</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calc.schedule.map((row) => (
                    <TableRow key={row.period}>
                      <TableCell>{row.period}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtMoney(row.payment)}</TableCell>
                      <TableCell className="text-right tabular-nums">{fmtMoney(row.principal)}</TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {fmtMoney(row.interest)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-muted-foreground">
                        {fmtMoney(row.remain)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-sm text-muted-foreground">
          请输入有效的贷款参数（金额大于 0，年限 1–30 年）
        </div>
      )}
    </div>
  );
}
