import { Button } from "@/components/ui/button";
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
import { Download, TriangleAlert } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** 页签：salary=工资薪金（累计预扣） bonus=全年一次性奖金 */
type Tab = "salary" | "bonus";

interface Bracket {
  /** 上限（含）；Infinity 表示无上界 */
  limit: number;
  rate: number;
  /** 速算扣除数 */
  quick: number;
}

/** 综合所得年度税率表 */
const ANNUAL_BRACKETS: Bracket[] = [
  { limit: 36000, rate: 0.03, quick: 0 },
  { limit: 144000, rate: 0.1, quick: 2520 },
  { limit: 300000, rate: 0.2, quick: 16920 },
  { limit: 420000, rate: 0.25, quick: 31920 },
  { limit: 660000, rate: 0.3, quick: 52920 },
  { limit: 960000, rate: 0.35, quick: 85920 },
  { limit: Infinity, rate: 0.45, quick: 181920 },
];

/** 按月换算税率表（年终奖单独计税用） */
const MONTHLY_BRACKETS: Bracket[] = [
  { limit: 3000, rate: 0.03, quick: 0 },
  { limit: 12000, rate: 0.1, quick: 210 },
  { limit: 25000, rate: 0.2, quick: 1410 },
  { limit: 35000, rate: 0.35, quick: 2660 },
  { limit: Infinity, rate: 0.45, quick: 4440 },
];

function findBracket(brackets: Bracket[], amount: number): Bracket {
  return brackets.find((b) => amount <= b.limit)!;
}

/** 应纳税所得额 → 年度应纳所得税额 */
function annualTax(taxable: number): number {
  if (taxable <= 0) return 0;
  const b = findBracket(ANNUAL_BRACKETS, taxable);
  return taxable * b.rate - b.quick;
}

/** 年终奖「盲区」：多发反而少拿的临界区间（lo 不含，hi 含） */
const BONUS_TRAP_ZONES: { lo: number; hi: number }[] = [
  { lo: 36000, hi: 38566.67 },
  { lo: 144000, hi: 160500 },
  { lo: 300000, hi: 318333.33 },
  { lo: 420000, hi: 447500 },
  { lo: 660000, hi: 706538.46 },
  { lo: 960000, hi: 1120000 },
];

const TABS: { value: Tab; label: string }[] = [
  { value: "salary", label: "工资薪金" },
  { value: "bonus", label: "年终奖" },
];

/** 常见专项附加扣除快捷项 */
const ADDITIONAL_CHIPS: [string, string][] = [
  ["房贷利息", "1000"],
  ["住房租金", "1500"],
  ["子女教育", "2000"],
  ["赡养老人", "3000"],
];

const fmtMoney = (n: number): string =>
  n.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtWan = (n: number): string =>
  `${(n / 10000).toLocaleString("zh-CN", { maximumFractionDigits: 2 })} 万`;

const fmtRate = (rate: number): string => `${(rate * 100).toFixed(0)}%`;

/** 分段切换按钮组 */
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

interface MonthRow {
  month: number;
  gross: number;
  social: number;
  cumTaxable: number;
  rate: number;
  cumTax: number;
  monthTax: number;
  net: number;
}

export default function IncomeTaxCalculatorPage() {
  const [tab, setTab] = useState<Tab>("salary");
  // 工资薪金
  const [salary, setSalary] = useState("20000");
  const [social, setSocial] = useState("3000");
  const [additional, setAdditional] = useState("1500");
  const [other, setOther] = useState("0");
  // 年终奖
  const [bonus, setBonus] = useState("60000");
  const [salaryTaxable, setSalaryTaxable] = useState("");

  /**
   * 累计预扣法：累计应纳税所得额 = 累计收入 − 累计五险一金 − 5000×月份数 − 累计附加扣除 − 其他扣除；
   * 按年度税率表算累计税额，减去上月累计已预缴即为本月税款。
   */
  const salaryCalc = useMemo(() => {
    const g = parseFloat(salary);
    const s = parseFloat(social);
    const a = parseFloat(additional);
    const o = parseFloat(other);
    if (![g, s, a].every(Number.isFinite) || !Number.isFinite(o)) return null;
    if (!(g > 0) || s < 0 || a < 0 || o < 0) return null;

    const rows: MonthRow[] = [];
    let prevCumTax = 0;
    for (let m = 1; m <= 12; m++) {
      const cumTaxable = Math.max(m * (g - s - a - o - 5000), 0);
      const bracket = findBracket(ANNUAL_BRACKETS, cumTaxable);
      const cumTax = Math.max(cumTaxable * bracket.rate - bracket.quick, 0);
      const monthTax = Math.max(cumTax - prevCumTax, 0);
      rows.push({
        month: m,
        gross: g,
        social: s,
        cumTaxable,
        rate: bracket.rate,
        cumTax,
        monthTax,
        net: g - s - monthTax,
      });
      prevCumTax = cumTax;
    }
    const yearGross = g * 12;
    const yearTax = rows.reduce((sum, r) => sum + r.monthTax, 0);
    return {
      rows,
      yearGross,
      yearTax,
      yearNet: rows.reduce((sum, r) => sum + r.net, 0),
      firstNet: rows[0].net,
      lastNet: rows[11].net,
      annualTaxable: Math.max(12 * (g - s - a - o - 5000), 0),
    };
  }, [salary, social, additional, other]);

  const bonusCalc = useMemo(() => {
    const b = parseFloat(bonus);
    if (!Number.isFinite(b) || !(b > 0)) return null;

    const bracket = findBracket(MONTHLY_BRACKETS, b / 12);
    const bonusTax = Math.max(b * bracket.rate - bracket.quick, 0);

    const trapZone = BONUS_TRAP_ZONES.find((z) => b > z.lo && b <= z.hi);

    // 选填：全年工资薪金应纳税所得额，用于对比并入综合所得
    let compare: { separateTotal: number; mergeTotal: number; mergeExtra: number } | null = null;
    const st = parseFloat(salaryTaxable);
    if (Number.isFinite(st) && st >= 0) {
      const separateTotal = annualTax(st) + bonusTax;
      const mergeTotal = annualTax(st + b);
      compare = { separateTotal, mergeTotal, mergeExtra: mergeTotal - annualTax(st) };
    }

    return { bonus: b, bonusTax, net: b - bonusTax, effRate: bonusTax / b, rate: bracket.rate, trapZone, compare };
  }, [bonus, salaryTaxable]);

  const exportCsv = () => {
    if (!salaryCalc) return;
    const lines = ["月份,税前收入(元),五险一金(元),累计应纳税所得额(元),预扣率(%),累计税额(元),当月个税(元),当月到手(元)"];
    for (const r of salaryCalc.rows) {
      lines.push(
        `${r.month},${r.gross.toFixed(2)},${r.social.toFixed(2)},${r.cumTaxable.toFixed(2)},${fmtRate(r.rate)},${r.cumTax.toFixed(2)},${r.monthTax.toFixed(2)},${r.net.toFixed(2)}`,
      );
    }
    // BOM 保证 Excel 正确识别 UTF-8 中文
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "个税测算_工资薪金_逐月明细.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const tiles: { label: string; value: string; hint?: string }[] = salaryCalc
    ? [
        { label: "首月到手", value: fmtMoney(salaryCalc.firstNet), hint: `个税 ${fmtMoney(salaryCalc.rows[0].monthTax)} 元` },
        { label: "末月到手", value: fmtMoney(salaryCalc.lastNet), hint: `个税 ${fmtMoney(salaryCalc.rows[11].monthTax)} 元` },
        {
          label: "年度纳税合计",
          value: fmtMoney(salaryCalc.yearTax),
          hint: `约 ${fmtWan(salaryCalc.yearTax)} · 月均 ${fmtMoney(salaryCalc.yearTax / 12)} 元`,
        },
        {
          label: "年度到手合计",
          value: fmtMoney(salaryCalc.yearNet),
          hint: `约占税前 ${((salaryCalc.yearNet / salaryCalc.yearGross) * 100).toFixed(1)}%`,
        },
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 计算类型 */}
      <Segmented options={TABS} value={tab} onChange={setTab} />

      {/* ─── 工资薪金 ─── */}
      {tab === "salary" && (
        <>
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <Field label="每月税前工资（元）" className="flex-1 min-w-[200px]">
                <Input
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="如 20000"
                  className="h-10 text-lg font-mono"
                  step="any"
                  min="0"
                />
              </Field>
              <Field label="五险一金（个人部分/月）">
                <Input
                  type="number"
                  value={social}
                  onChange={(e) => setSocial(e.target.value)}
                  placeholder="如 3000"
                  className="h-10 w-36 font-mono"
                  step="any"
                  min="0"
                />
              </Field>
              <Field label="专项附加扣除（月）">
                <Input
                  type="number"
                  value={additional}
                  onChange={(e) => setAdditional(e.target.value)}
                  placeholder="如 1500"
                  className="h-10 w-36 font-mono"
                  step="any"
                  min="0"
                />
              </Field>
              <Field label="其他扣除（月）">
                <Input
                  type="number"
                  value={other}
                  onChange={(e) => setOther(e.target.value)}
                  placeholder="如 企业年金"
                  className="h-10 w-32 font-mono"
                  step="any"
                  min="0"
                />
              </Field>
            </div>

            {/* 常用附加扣除 */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">常用附加扣除</span>
              {ADDITIONAL_CHIPS.map(([label, v]) => (
                <button
                  key={label}
                  className="rounded-md border border-border px-2.5 py-1 text-xs font-mono text-muted-foreground hover:border-primary/50 hover:bg-accent transition-colors"
                  onClick={() => setAdditional(v)}
                >
                  {label} {v}
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              减除费用按 5,000 元/月（起征点）计算；采用累计预扣法，随累计应纳税所得额提高，后期月份预扣率可能跳档、当月个税增加。
            </p>
          </div>

          {salaryCalc ? (
            <>
              {/* 概览 */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-medium">年度概览</span>
                  <span className="text-xs text-muted-foreground">税前年薪 {fmtWan(salaryCalc.yearGross)}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
                  {tiles.map((t) => (
                    <div key={t.label} className="bg-card px-4 py-3.5">
                      <div className="text-xs text-muted-foreground">{t.label}</div>
                      <div className="mt-1 text-lg font-semibold tabular-nums truncate">{t.value}</div>
                      {t.hint && <div className="mt-0.5 text-xs text-muted-foreground">{t.hint}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* 逐月明细 */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-medium">逐月明细（累计预扣法）</span>
                  <Button variant="outline" size="sm" onClick={exportCsv}>
                    <Download className="size-3.5 mr-1.5" />
                    导出 CSV
                  </Button>
                </div>
                <div className="max-h-[480px] overflow-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10 shadow-[0_1px_0_0_hsl(var(--border))]">
                      <TableRow>
                        <TableHead className="w-14">月份</TableHead>
                        <TableHead className="text-right">税前收入</TableHead>
                        <TableHead className="text-right">五险一金</TableHead>
                        <TableHead className="text-right">累计应纳税所得额</TableHead>
                        <TableHead className="text-right">预扣率</TableHead>
                        <TableHead className="text-right">累计税额</TableHead>
                        <TableHead className="text-right">当月个税</TableHead>
                        <TableHead className="text-right">当月到手</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salaryCalc.rows.map((r, i) => (
                        <TableRow key={r.month}>
                          <TableCell>{r.month} 月</TableCell>
                          <TableCell className="text-right tabular-nums">{fmtMoney(r.gross)}</TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">
                            {fmtMoney(r.social)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">
                            {fmtMoney(r.cumTaxable)}
                          </TableCell>
                          <TableCell
                            className={cn(
                              "text-right tabular-nums",
                              i > 0 && r.rate > salaryCalc.rows[i - 1].rate && "font-medium text-amber-600",
                            )}
                            title={i > 0 && r.rate > salaryCalc.rows[i - 1].rate ? "税率跳档" : undefined}
                          >
                            {fmtRate(r.rate)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">
                            {fmtMoney(r.cumTax)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{fmtMoney(r.monthTax)}</TableCell>
                          <TableCell className="text-right tabular-nums font-medium">
                            {fmtMoney(r.net)}
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
              请输入有效的工资信息
            </div>
          )}
        </>
      )}

      {/* ─── 年终奖 ─── */}
      {tab === "bonus" && (
        <>
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex flex-wrap items-end gap-4">
              <Field label="全年一次性奖金（元）" className="flex-1 min-w-[200px]">
                <Input
                  type="number"
                  value={bonus}
                  onChange={(e) => setBonus(e.target.value)}
                  placeholder="如 60000"
                  className="h-10 text-lg font-mono"
                  step="any"
                  min="0"
                />
              </Field>
              <Field label="全年工资应纳税所得额（选填）" className="w-56">
                <Input
                  type="number"
                  value={salaryTaxable}
                  onChange={(e) => setSalaryTaxable(e.target.value)}
                  placeholder="用于对比并入综合所得"
                  className="h-10 font-mono"
                  step="any"
                  min="0"
                />
              </Field>
            </div>

            <p className="text-xs text-muted-foreground">
              单独计税：奖金 ÷ 12 按月度税率表确定税率；政策现行有效（延至 2027 年底），每人每年只能使用一次。
            </p>
          </div>

          {bonusCalc ? (
            <>
              {/* 盲区预警 */}
              {bonusCalc.trapZone && (
                <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 px-5 py-4 flex gap-3 items-start">
                  <TriangleAlert className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm space-y-1">
                    <p className="font-medium text-amber-600 dark:text-amber-500">当前奖金处于税率「盲区」</p>
                    <p className="text-muted-foreground">
                      发 {fmtMoney(bonusCalc.trapZone.hi)} 元比发 {fmtMoney(bonusCalc.trapZone.lo)} 元到手更少——建议调整为不超过{" "}
                      {fmtMoney(bonusCalc.trapZone.lo)} 元，或提高到 {fmtMoney(bonusCalc.trapZone.hi + 0.01)} 元以上。
                    </p>
                  </div>
                </div>
              )}

              {/* 结果 */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-medium">单独计税结果</span>
                  <span className="text-xs text-muted-foreground">
                    ÷12 后适用 {fmtRate(bonusCalc.rate)} 税率档
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
                  {[
                    { label: "应缴个税", value: `${fmtMoney(bonusCalc.bonusTax)} 元`, hint: `实际税负 ${(bonusCalc.effRate * 100).toFixed(1)}%` },
                    { label: "税后奖金", value: `${fmtMoney(bonusCalc.net)} 元`, hint: `约 ${fmtWan(bonusCalc.net)}` },
                    { label: "奖金总额", value: `${fmtMoney(bonusCalc.bonus)} 元`, hint: undefined },
                    {
                      label: "平均每月",
                      value: `${fmtMoney(bonusCalc.bonus / 12)} 元`,
                      hint: "确定税率档的除以 12 口径",
                    },
                  ].map((t) => (
                    <div key={t.label} className="bg-card px-4 py-3.5">
                      <div className="text-xs text-muted-foreground">{t.label}</div>
                      <div className="mt-1 text-lg font-semibold tabular-nums truncate">{t.value}</div>
                      {t.hint && <div className="mt-0.5 text-xs text-muted-foreground">{t.hint}</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* 并入综合所得对比 */}
              {bonusCalc.compare && (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="px-5 py-3 border-b border-border">
                    <span className="text-sm font-medium">与「并入综合所得」对比</span>
                  </div>
                  <div className="divide-y divide-border">
                    {(
                      [
                        {
                          name: "方案一 · 单独计税",
                          total: bonusCalc.compare.separateTotal,
                          extra: bonusCalc.bonusTax,
                          note: "奖金部分承担",
                        },
                        {
                          name: "方案二 · 并入综合所得",
                          total: bonusCalc.compare.mergeTotal,
                          extra: bonusCalc.compare.mergeExtra,
                          note: "奖金增量部分承担",
                        },
                      ] as const
                    ).map((opt, i) => {
                      const better =
                        opt.total === Math.min(bonusCalc.compare!.separateTotal, bonusCalc.compare!.mergeTotal);
                      return (
                        <div
                          key={i}
                          className={cn(
                            "flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-5 py-3 transition-colors",
                            better ? "bg-primary/5" : "hover:bg-accent",
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{opt.name}</span>
                            {better && (
                              <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">更划算</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm tabular-nums">
                            <span className="text-muted-foreground">
                              全年总税额{" "}
                              <span className="text-foreground">{fmtMoney(opt.total)}</span> 元
                            </span>
                            <span className="text-muted-foreground">
                              {opt.note} <span className="text-foreground">{fmtMoney(opt.extra)}</span> 元
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
                    对比为静态估算：并入后奖金增量部分承担税额 = 全年总税额 − 仅工资部分税额。两种方案差额{" "}
                    {fmtMoney(Math.abs(bonusCalc.compare.separateTotal - bonusCalc.compare.mergeTotal))} 元。
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-sm text-muted-foreground">
              请输入有效的奖金额度
            </div>
          )}
        </>
      )}
    </div>
  );
}
