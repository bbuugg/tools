import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleAlert, PiggyBank } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

// ─── 还款模拟 ────────────────────────────────────────────────
// 约定：前 k 期按原计划正常还款，第 k 期扣款后立即一次性偿还 A，
// 新计划自第 k+1 期开始。与房贷计算器的口径一致。

type RepayMethod = "annuity" | "principal";

interface Row {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

const EPS = 1e-6;

/** 等额本息月供 */
function annuityPay(P: number, r: number, n: number): number {
  if (r === 0) return P / n;
  const pow = Math.pow(1 + r, n);
  return (P * r * pow) / (pow - 1);
}

/**
 * 等额本息模拟。给定 payOverride（缩短年限时=原月供）则忽略 n 的约束，
 * 还清即止（末期金额自动调小），用于计算实际缩短期数。
 */
function runAnnuity(P: number, r: number, n: number, payOverride?: number): Row[] {
  const pay = payOverride ?? annuityPay(P, r, n);
  const maxM = payOverride ? 720 : n; // 上限保护：60 年
  const rows: Row[] = [];
  let bal = P;
  for (let m = 1; m <= maxM && bal > EPS; m++) {
    const interest = bal * r;
    let principal = pay - interest;
    let payment = pay;
    if (principal >= bal - EPS) {
      principal = bal;
      payment = interest + bal;
    }
    bal -= principal;
    rows.push({ month: m, payment, interest, principal, balance: Math.max(bal, 0) });
  }
  return rows;
}

/**
 * 等额本金模拟。ppmOverride 为每月固定还本额：
 * 缩短年限时沿用原值，减少月供时改为 P1/(n−k)。
 */
function runPrincipal(P: number, r: number, n: number, ppmOverride?: number): Row[] {
  const ppm = ppmOverride ?? P / n;
  const rows: Row[] = [];
  let bal = P;
  for (let m = 1; m <= 720 && bal > EPS; m++) {
    const interest = bal * r;
    const principal = Math.min(ppm, bal);
    const payment = principal + interest;
    bal -= principal;
    rows.push({ month: m, payment, interest, principal, balance: Math.max(bal, 0) });
  }
  return rows;
}

// ─── 提前还款测算 ────────────────────────────────────────────

export interface PrepayResult {
  origFirstPay: number; // 原首期月供
  origMonths: number;
  origFuturePay: number; // 第 k+1 期起的剩余总还款
  origFutureInterest: number;
  fullPayoff: boolean;
  newRows: Row[];
  newInterest: number;
  newFirstPay: number | null; // 减月供时的新月供；缩短年限时=null（不变）
  newMonthsAfterPrepay: number; // 新计划期数
  savedInterest: number;
  savedMonths: number;
  balanceAtK: number;
}

function computePrepay(
  P0: number,
  annualRatePct: number,
  months0: number,
  k: number,
  prepayAmount: number,
  method: RepayMethod,
  mode: "shorten" | "reduce",
): PrepayResult | null {
  if (!(P0 > 0) || !Number.isFinite(annualRatePct) || annualRatePct < 0 || annualRatePct >= 36) return null;
  if (!(months0 >= 2) || !(k >= 1) || k >= months0) return null;
  if (!(prepayAmount > 0)) return null;

  const r = annualRatePct / 100 / 12;
  const origRows = method === "annuity" ? runAnnuity(P0, r, months0) : runPrincipal(P0, r, months0);
  if (k >= origRows.length) return null;

  const origFirstPay = origRows[0].payment;
  const origFuturePay = origRows.slice(k).reduce((s, x) => s + x.payment, 0);
  const origFutureInterest = origRows.slice(k).reduce((s, x) => s + x.interest, 0);
  const balanceAtK = origRows[k - 1].balance;

  const fullPayoff = prepayAmount >= balanceAtK - EPS;
  let newRows: Row[] = [];
  let newFirstPay: number | null = null;

  if (!fullPayoff) {
    const P1 = balanceAtK - prepayAmount;
    const remainN = months0 - k;
    if (method === "annuity") {
      if (mode === "shorten") {
        newRows = runAnnuity(P1, r, remainN, origFirstPay); // 月供不变
      } else {
        const newPay = annuityPay(P1, r, remainN);
        newFirstPay = newPay;
        newRows = runAnnuity(P1, r, remainN, newPay);
      }
    } else {
      if (mode === "shorten") {
        newRows = runPrincipal(P1, r, remainN, P0 / months0); // 每月还本额不变
      } else {
        newRows = runPrincipal(P1, r, remainN, P1 / remainN);
      }
      newFirstPay = newRows[0]?.payment ?? null;
    }
  }

  const newInterest = newRows.reduce((s, x) => s + x.interest, 0);
  const savedInterest = origFutureInterest - newInterest;
  const savedMonths = origRows.length - k - newRows.length;

  return {
    origFirstPay,
    origMonths: origRows.length,
    origFuturePay,
    origFutureInterest,
    fullPayoff,
    newRows,
    newInterest,
    newFirstPay,
    newMonthsAfterPrepay: newRows.length,
    savedInterest,
    savedMonths,
    balanceAtK,
  };
}

// ─── 格式化 ──────────────────────────────────────────────────

function fmtMoney(n: number): string {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtWan(n: number): string {
  return `${(n / 10000).toLocaleString("zh-CN", { maximumFractionDigits: 2 })} 万`;
}

/** 期数 → 「X 年 Y 个月」 */
function fmtDur(months: number): string {
  if (months <= 0) return "0 个月";
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} 个月`;
  return m === 0 ? `${y} 年` : `${y} 年 ${m} 个月`;
}

// ─── 页面局部组件 ────────────────────────────────────────────

function Field({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
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
          onClick={(e) => {
            onChange(o.value);
            e.currentTarget.blur();
          }}
          className={cn(
            "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
            o.value === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Chip({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={(e) => {
        onClick();
        e.currentTarget.blur();
      }}
      className="rounded-md border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  );
}

// ─── 页面 ────────────────────────────────────────────────────

export default function PrepaymentCalculatorPage() {
  const [method, setMethod] = useState<RepayMethod>("annuity");
  const [balanceWan, setBalanceWan] = useState("100"); // 剩余本金（万元）
  const [ratePct, setRatePct] = useState("3.6");
  const [yearsLeft, setYearsLeft] = useState("20"); // 剩余期限（年，可小数）
  const [prepayAfter, setPrepayAfter] = useState("12"); // 第 X 期后提前还款
  const [prepayWan, setPrepayWan] = useState("20"); // 提前还款金额（万元）
  const [mode, setMode] = useState<"shorten" | "reduce">("shorten");

  const result = useMemo(() => {
    const P0 = parseFloat(balanceWan) * 10000;
    const ratePctNum = parseFloat(ratePct);
    const months0 = Math.round(parseFloat(yearsLeft) * 12);
    const k = parseInt(prepayAfter, 10);
    const amount = parseFloat(prepayWan) * 10000;
    if (![P0, ratePctNum, months0, k, amount].every(Number.isFinite)) return null;
    return computePrepay(P0, ratePctNum, months0, k, amount, method, mode);
  }, [balanceWan, ratePct, yearsLeft, prepayAfter, prepayWan, method, mode]);

  const errorText =
    result === null
      ? "请检查输入：剩余本金需大于 0，年利率 0–36，剩余期限至少 2 期，提前还款时点须在期限内且早于到期，金额需大于 0。"
      : null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <PiggyBank className="size-5 text-primary" />
          提前还贷计算器
        </h1>
        <Segmented<RepayMethod>
          options={[
            { value: "annuity", label: "等额本息" },
            { value: "principal", label: "等额本金" },
          ]}
          value={method}
          onChange={setMethod}
        />
      </div>

      {/* 输入区 */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Field label="剩余本金（万元）">
            <Input inputMode="decimal" value={balanceWan} onChange={(e) => setBalanceWan(e.target.value)} placeholder="100" />
          </Field>
          <Field label="年利率（%）">
            <Input inputMode="decimal" value={ratePct} onChange={(e) => setRatePct(e.target.value)} placeholder="3.6" />
          </Field>
          <Field label="剩余期限（年）">
            <Input inputMode="decimal" value={yearsLeft} onChange={(e) => setYearsLeft(e.target.value)} placeholder="20" />
          </Field>
          <Field label="第几期后提前还款">
            <Input inputMode="numeric" value={prepayAfter} onChange={(e) => setPrepayAfter(e.target.value)} placeholder="12" />
          </Field>
          <Field label="提前还款（万元）">
            <Input inputMode="decimal" value={prepayWan} onChange={(e) => setPrepayWan(e.target.value)} placeholder="20" />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>快速金额：</span>
            {[10, 20, 30, 50].map((w) => (
              <Chip key={w} onClick={() => setPrepayWan(String(w))}>
                {w} 万
              </Chip>
            ))}
            <Chip onClick={() => setPrepayWan(result ? (result.balanceAtK / 10000).toFixed(2) : "")}>
              全部结清（{result ? fmtWan(result.balanceAtK) : "—"}）
            </Chip>
          </div>
          {!result?.fullPayoff && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">部分还款后：</span>
              <Segmented<"shorten" | "reduce">
                options={[
                  { value: "shorten", label: "缩短期限（月供基本不变）" },
                  { value: "reduce", label: "减少月供（期限不变）" },
                ]}
                value={mode}
                onChange={setMode}
              />
            </div>
          )}
        </div>

        {errorText && (
          <p className="flex items-center gap-1.5 text-sm text-destructive">
            <CircleAlert className="size-4 shrink-0" />
            {errorText}
          </p>
        )}
      </div>

      {result && (
        <>
          {/* 结论横幅 */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
            <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
              <div>
                <div className="text-xs text-muted-foreground">可节省利息</div>
                <div className="mt-0.5 font-mono text-3xl font-bold text-primary tabular-nums">
                  ¥{fmtMoney(Math.max(result.savedInterest, 0))}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">
                  {result.fullPayoff ? "结清方式" : "缩短期限"}
                </div>
                <div className="mt-1 font-semibold">
                  {result.fullPayoff
                    ? `一次性结清剩余本金 ${fmtMoney(result.balanceAtK)} 元`
                    : fmtDur(result.savedMonths)}
                </div>
              </div>
              {!result.fullPayoff && (
                <div>
                  <div className="text-xs text-muted-foreground">
                    {mode === "reduce" ? "新首期月供" : "月供"}
                  </div>
                  <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums">
                    ¥{fmtMoney(mode === "reduce" && result.newFirstPay !== null ? result.newFirstPay : result.origFirstPay)}
                    {method === "principal" && <span className="ml-1 text-xs font-normal text-muted-foreground">起，逐月递减</span>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 对比表 */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <span className="text-sm font-medium">方案对比（从提前还款后一期起算）</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b border-border">
                  <th className="px-5 py-2.5 font-medium">项目</th>
                  <th className="px-5 py-2.5 font-medium">原方案 · 继续还款</th>
                  <th className="px-5 py-2.5 font-medium">
                    {result.fullPayoff ? "提前结清" : `提前还 ${fmtWan(parseFloat(prepayWan) || 0)} · ${mode === "shorten" ? "缩短期限" : "减少月供"}`}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/60">
                  <td className="px-5 py-2.5 text-muted-foreground">月供</td>
                  <td className="px-5 py-2.5 font-mono">
                    ¥{fmtMoney(result.origFirstPay)}
                    {method === "principal" && <span className="ml-1 text-xs text-muted-foreground">起</span>}
                  </td>
                  <td className="px-5 py-2.5 font-mono">
                    {result.fullPayoff
                      ? "—"
                      : `¥${fmtMoney(mode === "reduce" && result.newFirstPay !== null ? result.newFirstPay : result.origFirstPay)}${method === "principal" ? " 起" : ""}`}
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-5 py-2.5 text-muted-foreground">剩余期数</td>
                  <td className="px-5 py-2.5 font-mono">{result.origMonths} 期（{fmtDur(result.origMonths)}）</td>
                  <td className="px-5 py-2.5 font-mono">
                    {result.fullPayoff ? "当期结清" : `${result.newMonthsAfterPrepay} 期（${fmtDur(result.newMonthsAfterPrepay)}）`}
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-5 py-2.5 text-muted-foreground">剩余总还款*</td>
                  <td className="px-5 py-2.5 font-mono">¥{fmtMoney(result.origFuturePay)}</td>
                  <td className="px-5 py-2.5 font-mono">
                    {result.fullPayoff
                      ? `${fmtMoney(result.balanceAtK)}（结清本金）`
                      : `¥${fmtMoney(result.newRows.reduce((s, x) => s + x.payment, 0))}`}
                  </td>
                </tr>
                <tr className="border-b border-border/60">
                  <td className="px-5 py-2.5 text-muted-foreground">剩余总利息</td>
                  <td className="px-5 py-2.5 font-mono">¥{fmtMoney(result.origFutureInterest)}</td>
                  <td className="px-5 py-2.5 font-mono">¥{fmtMoney(result.newInterest)}</td>
                </tr>
                <tr>
                  <td className="px-5 py-2.5 text-muted-foreground">节省利息</td>
                  <td className="px-5 py-2.5 text-muted-foreground">—</td>
                  <td className="px-5 py-2.5 font-mono font-semibold text-primary">
                    ¥{fmtMoney(Math.max(result.savedInterest, 0))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 text-xs leading-relaxed text-muted-foreground space-y-1">
            <p>
              * 口径说明：「剩余总还款 / 总利息」均从提前还款的下一期起算（此前已还部分两种方案完全相同，不影响比较）。
              缩短期限时等额本息沿用原月供、等额本金沿用原每月还本额，末期金额自动调小；
              减少月供时保持剩余期限不变重新摊销。全部结清指偿还第 {prepayAfter} 期扣款后的剩余本金{" "}
              {fmtMoney(result.balanceAtK)} 元，此后不再产生利息。
            </p>
            <p>
              实际办理以贷款银行约定为准：部分银行对提前还款设有次数、最低金额或违约金限制，还款日与扣款日差异也会带来小额利息出入。
            </p>
          </div>
        </>
      )}
    </div>
  );
}
