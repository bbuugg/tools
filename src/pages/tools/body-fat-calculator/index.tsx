import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** 性别 */
type Gender = "male" | "female";
/** 计算方式：bmi=BMI 公式估算 navy=围度测量法（美国海军法） */
type Method = "bmi" | "navy";

interface Category {
  name: string;
  /** 展示文案 */
  label: string;
  /** 匹配下界（含） */
  lo: number;
  /** 匹配上界（不含）；缺省表示无上界 */
  hi?: number;
}

const GENDERS: { value: Gender; label: string }[] = [
  { value: "male", label: "男" },
  { value: "female", label: "女" },
];

const METHODS: { value: Method; label: string }[] = [
  { value: "bmi", label: "BMI 公式估算" },
  { value: "navy", label: "围度测量法" },
];

/** ACE 体脂率分级（区间连续，hi 不含） */
const CATEGORIES: Record<Gender, Category[]> = {
  male: [
    { name: "必需脂肪", label: "2% – 5%", lo: 0, hi: 6 },
    { name: "运动员", label: "6% – 13%", lo: 6, hi: 14 },
    { name: "健康", label: "14% – 17%", lo: 14, hi: 18 },
    { name: "平均", label: "18% – 24%", lo: 18, hi: 25 },
    { name: "肥胖", label: "≥ 25%", lo: 25 },
  ],
  female: [
    { name: "必需脂肪", label: "10% – 13%", lo: 0, hi: 14 },
    { name: "运动员", label: "14% – 20%", lo: 14, hi: 21 },
    { name: "健康", label: "21% – 24%", lo: 21, hi: 25 },
    { name: "平均", label: "25% – 31%", lo: 25, hi: 32 },
    { name: "肥胖", label: "≥ 32%", lo: 32 },
  ],
};

/** 中国成人 BMI 体重分类 */
function bmiStatus(bmi: number): string {
  if (bmi < 18.5) return "偏瘦";
  if (bmi < 24) return "正常";
  if (bmi < 28) return "超重";
  return "肥胖";
}

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
            "rounded-md px-4 py-1 text-sm font-medium transition-colors",
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

export default function BodyFatCalculatorPage() {
  const [gender, setGender] = useState<Gender>("male");
  const [method, setMethod] = useState<Method>("bmi");
  const [age, setAge] = useState("28");
  const [height, setHeight] = useState("175");
  const [weight, setWeight] = useState("70");
  const [neck, setNeck] = useState("38");
  const [waist, setWaist] = useState("85");
  const [hip, setHip] = useState("95");

  /**
   * BMI 法（Deurenberg）：体脂率 ≈ 1.2×BMI + 0.23×年龄 − 5.4 − 10.8×性别（男=1，女=0）
   * 围度法（U.S. Navy）：
   *   男：495 / (1.0324 − 0.19077·lg(腰−颈) + 0.15456·lg(身高)) − 450
   *   女：495 / (1.29579 − 0.35004·lg(腰+臀−颈) + 0.22100·lg(身高)) − 450
   */
  const calc = useMemo(() => {
    const h = parseFloat(height);
    const w = parseFloat(weight);
    if (![h, w].every((v) => Number.isFinite(v) && v > 0)) return null;

    const bmi = w / Math.pow(h / 100, 2);
    let bf: number;
    let whr: number | undefined;

    if (method === "bmi") {
      const a = parseFloat(age);
      if (!(a >= 1 && a <= 120)) return null;
      bf = 1.2 * bmi + 0.23 * a - 5.4 - (gender === "male" ? 10.8 : 0);
    } else {
      const n = parseFloat(neck);
      const waistN = parseFloat(waist);
      if (!(n > 0 && waistN > 0)) return null;
      if (gender === "male") {
        const d = waistN - n;
        if (!(d > 0)) return null;
        bf = 495 / (1.0324 - 0.19077 * Math.log10(d) + 0.15456 * Math.log10(h)) - 450;
        // 男士臀围选填，仅用于腰臀比
        const hipN = parseFloat(hip);
        whr = hipN > 0 ? waistN / hipN : undefined;
      } else {
        const hipN = parseFloat(hip);
        if (!(hipN > 0)) return null;
        const s = waistN + hipN - n;
        if (!(s > 0)) return null;
        bf = 495 / (1.29579 - 0.35004 * Math.log10(s) + 0.221 * Math.log10(h)) - 450;
        whr = waistN / hipN;
      }
    }

    if (!Number.isFinite(bf)) return null;
    const fatMass = (w * bf) / 100;
    return { bmi, bf, fatMass, leanMass: w - fatMass, whr };
  }, [gender, method, age, height, weight, neck, waist, hip]);

  const category = calc ? CATEGORIES[gender].find((c) => calc.bf >= c.lo && (c.hi === undefined || calc.bf < c.hi)) : undefined;
  const methodName = METHODS.find((m) => m.value === method)!.label;

  const tiles: { label: string; value: string; hint?: string }[] = calc
    ? [
        { label: "体脂率", value: `${calc.bf.toFixed(1)} %`, hint: category ? `属于「${category.name}」范围` : undefined },
        { label: "脂肪重量", value: `${calc.fatMass.toFixed(1)} kg`, hint: `约占体重 ${calc.bf.toFixed(1)}%` },
        { label: "瘦体重（去脂体重）", value: `${calc.leanMass.toFixed(1)} kg`, hint: "肌肉、骨骼与水分等" },
        { label: "BMI", value: calc.bmi.toFixed(1), hint: bmiStatus(calc.bmi) },
      ]
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 计算方式 */}
      <Segmented options={METHODS} value={method} onChange={setMethod} />

      {/* 参数输入 */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <Field label="性别">
            <div className="flex items-center h-10">
              <Segmented options={GENDERS} value={gender} onChange={setGender} />
            </div>
          </Field>

          {method === "bmi" && (
            <Field label="年龄">
              <Input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="岁"
                className="h-10 w-24 font-mono"
                step="1"
                min="1"
                max="120"
              />
            </Field>
          )}

          <Field label="身高（cm）">
            <Input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="如 175"
              className="h-10 w-28 font-mono"
              step="any"
              min="0"
            />
          </Field>
          <Field label="体重（kg）">
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="如 70"
              className="h-10 w-28 font-mono"
              step="any"
              min="0"
            />
          </Field>

          {method === "navy" && (
            <>
              <Field label="颈围（cm）">
                <Input
                  type="number"
                  value={neck}
                  onChange={(e) => setNeck(e.target.value)}
                  placeholder="喉结下方一圈"
                  className="h-10 w-28 font-mono"
                  step="any"
                  min="0"
                />
              </Field>
              <Field label="腰围（cm）">
                <Input
                  type="number"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  placeholder="肚脐水平一圈"
                  className="h-10 w-28 font-mono"
                  step="any"
                  min="0"
                />
              </Field>
              <Field label={gender === "female" ? "臀围（cm）" : "臀围（cm，选填）"}>
                <Input
                  type="number"
                  value={hip}
                  onChange={(e) => setHip(e.target.value)}
                  placeholder="最宽处一圈"
                  className="h-10 w-28 font-mono"
                  step="any"
                  min="0"
                />
              </Field>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {method === "bmi"
            ? "Deurenberg 公式：体脂率 ≈ 1.2×BMI + 0.23×年龄 − 5.4 − 10.8×性别（男=1，女=0），适合快速估算，对肌肉量异常者误差较大。"
            : "美国海军围度法：基于颈围、腰围、臀围（女）与身高的对数回归，比 BMI 法更接近真实值；建议软尺贴身水平绕一圈，同一时段空腹测量。"}
        </p>
      </div>

      {/* 结果 */}
      {calc ? (
        <>
          {/* 结果概览 */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium">结果概览</span>
              <span className="text-xs text-muted-foreground">
                {methodName} · {GENDERS.find((g) => g.value === gender)!.label}
                {calc.whr !== undefined && <> · 腰臀比 {calc.whr.toFixed(2)}</>}
              </span>
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

          {/* 体脂分级对照 */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium">体脂率分级对照</span>
              <span className="text-xs text-muted-foreground">ACE 标准 · 当前 {calc.bf.toFixed(1)}%</span>
            </div>
            <div className="divide-y divide-border">
              {CATEGORIES[gender].map((c) => {
                const isCurrent = category?.name === c.name;
                return (
                  <div
                    key={c.name}
                    className={cn(
                      "flex items-center justify-between px-5 py-3 transition-colors",
                      isCurrent ? "bg-primary/5" : "hover:bg-accent",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{c.name}</span>
                      {isCurrent && (
                        <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">当前</span>
                      )}
                    </div>
                    <span className="text-sm font-mono tabular-nums text-muted-foreground">{c.label}</span>
                  </div>
                );
              })}
            </div>
            <p className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
              以上均为估算值，仅供参考；围度测量受测量手法影响，建议多次取平均。
            </p>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-border bg-card p-12 flex flex-col items-center justify-center text-sm text-muted-foreground">
          请输入有效的身体数据
        </div>
      )}
    </div>
  );
}
