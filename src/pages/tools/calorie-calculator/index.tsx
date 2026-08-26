import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Flame, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

// ─── BMR 公式 ────────────────────────────────────────────────

type Gender = "male" | "female";
type Formula = "mifflin" | "harris" | "katch";

/** Mifflin-St Jeor（1990，当前公认最准的通用估算） */
function bmrMifflin(gender: Gender, weight: number, height: number, age: number): number {
  return 10 * weight + 6.25 * height - 5 * age + (gender === "male" ? 5 : -161);
}

/** Harris-Benedict 修订版（Roza & Shizgal, 1984） */
function bmrHarris(gender: Gender, weight: number, height: number, age: number): number {
  return gender === "male"
    ? 13.397 * weight + 4.799 * height - 5.677 * age + 88.362
    : 9.247 * weight + 3.098 * height - 4.33 * age + 447.593;
}

/** Katch-McArdle：按瘦体重计算，已知体脂率时最准（与体脂率计算器配套） */
function bmrKatch(weight: number, bodyFatPct: number): number {
  const lbm = weight * (1 - bodyFatPct / 100);
  return 370 + 21.6 * lbm;
}

// ─── 活动系数与目标 ──────────────────────────────────────────

const ACTIVITIES = [
  { f: 1.2, label: "久坐", desc: "办公为主，几乎不运动" },
  { f: 1.375, label: "轻度活动", desc: "每周运动 1–3 次" },
  { f: 1.55, label: "中度活动", desc: "每周运动 3–5 次" },
  { f: 1.725, label: "高度活动", desc: "每周运动 6–7 次" },
  { f: 1.9, label: "极高强度", desc: "体力劳动，或每天两练" },
];

interface Goal {
  key: string;
  label: string;
  delta: number; // 相对 TDEE 的调整比例
  proteinPerKg: number; // 蛋白质 g/kg 体重
}

const GOALS: Goal[] = [
  { key: "cut_fast", label: "快速减脂", delta: -0.25, proteinPerKg: 2.2 },
  { key: "cut", label: "温和减脂", delta: -0.15, proteinPerKg: 2.0 },
  { key: "maintain", label: "维持体重", delta: 0, proteinPerKg: 1.5 },
  { key: "bulk", label: "温和增肌", delta: 0.1, proteinPerKg: 1.8 },
  { key: "bulk_fast", label: "快速增肌", delta: 0.2, proteinPerKg: 2.0 },
];

const FAT_RATIO = 0.3; // 脂肪供能占比
const KCAL_PER_G = { protein: 4, fat: 9, carb: 4 };

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

// ─── 页面 ────────────────────────────────────────────────────

export default function CalorieCalculatorPage() {
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState("28");
  const [height, setHeight] = useState("175");
  const [weight, setWeight] = useState("70");
  const [bodyFat, setBodyFat] = useState(""); // 可选
  const [formula, setFormula] = useState<Formula>("mifflin");
  const [activityIdx, setActivityIdx] = useState(2); // 默认中度活动
  const [goalKey, setGoalKey] = useState("cut");

  const calc = useMemo(() => {
    const a = parseFloat(age);
    const h = parseFloat(height);
    const w = parseFloat(weight);
    const bf = parseFloat(bodyFat);
    if (![a, h, w].every(Number.isFinite)) return null;
    if (!(a >= 10 && a <= 100) || !(h >= 80 && h <= 250) || !(w >= 25 && w <= 300)) return null;
    const bfValid = Number.isFinite(bf) && bf > 2 && bf < 70;
    if (formula === "katch" && !bfValid) return null;

    const bmr =
      formula === "mifflin"
        ? bmrMifflin(gender, w, h, a)
        : formula === "harris"
          ? bmrHarris(gender, w, h, a)
          : bmrKatch(w, bf!);

    const tdee = bmr * ACTIVITIES[activityIdx].f;
    return { bmr, tdee, weight: w, bfValid };
  }, [gender, age, height, weight, bodyFat, formula, activityIdx]);

  const goal = GOALS.find((g) => g.key === goalKey) ?? GOALS[2];
  const macros = useMemo(() => {
    if (!calc) return null;
    const kcal = calc.tdee * (1 + goal.delta);
    const proteinG = goal.proteinPerKg * calc.weight;
    const fatG = (kcal * FAT_RATIO) / KCAL_PER_G.fat;
    const carbKcal = Math.max(kcal - proteinG * KCAL_PER_G.protein - fatG * KCAL_PER_G.fat, 0);
    return {
      kcal,
      belowBmr: kcal < calc.bmr,
      protein: { g: proteinG, kcal: proteinG * KCAL_PER_G.protein },
      fat: { g: fatG, kcal: fatG * KCAL_PER_G.fat },
      carb: { g: carbKcal / KCAL_PER_G.carb, kcal: carbKcal },
    };
  }, [calc, goal]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <Flame className="size-5 text-primary" />
          每日热量计算（BMR / TDEE）
        </h1>
        <Segmented<Gender>
          options={[
            { value: "male", label: "男" },
            { value: "female", label: "女" },
          ]}
          value={gender}
          onChange={setGender}
        />
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* 左侧输入 */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 min-w-0">
          <div className="grid grid-cols-2 gap-3">
            <Field label="年龄">
              <Input inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
            </Field>
            <Field label="体重（kg）">
              <Input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
            </Field>
          </div>
          <Field label="身高（cm）">
            <Input inputMode="decimal" value={height} onChange={(e) => setHeight(e.target.value)} />
          </Field>

          <Field
            label={
              <>
                体脂率 %{" "}
                <span className="font-normal text-muted-foreground">（选填，</span>
                <Link to="/tools/body-fat-calculator" className="font-normal text-primary hover:underline">
                  去体脂率工具测一下
                </Link>
                <span className="font-normal text-muted-foreground">）</span>
              </>
            }
          >
            <Input inputMode="decimal" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} placeholder="如 20.5" />
          </Field>

          <Field label="BMR 公式">
            <div className="space-y-1.5">
              {(
                [
                  { v: "mifflin", name: "Mifflin-St Jeor", desc: "通用人群最准，推荐默认" },
                  { v: "harris", name: "Harris-Benedict 修订版", desc: "经典公式，略偏高" },
                  { v: "katch", name: "Katch-McArdle", desc: "需要体脂率，按瘦体重算" },
                ] as { v: Formula; name: string; desc: string }[]
              ).map((o) => (
                <button
                  key={o.v}
                  disabled={o.v === "katch" && !calc?.bfValid && !Number.isFinite(parseFloat(bodyFat))}
                  onClick={(e) => {
                    if (o.v === "katch" && !Number.isFinite(parseFloat(bodyFat))) return;
                    setFormula(o.v);
                    e.currentTarget.blur();
                  }}
                  className={cn(
                    "w-full rounded-lg border px-3 py-2 text-left transition-colors",
                    formula === o.v ? "border-primary/50 bg-primary/5" : "border-border hover:bg-accent",
                    o.v === "katch" && !Number.isFinite(parseFloat(bodyFat)) && "opacity-50",
                  )}
                >
                  <span className="block text-sm font-medium">{o.name}</span>
                  <span className="block text-xs text-muted-foreground">{o.desc}</span>
                </button>
              ))}
            </div>
          </Field>

          <Field label="活动水平">
            <div className="space-y-1.5">
              {ACTIVITIES.map((a, i) => (
                <button
                  key={a.f}
                  onClick={(e) => {
                    setActivityIdx(i);
                    e.currentTarget.blur();
                  }}
                  className={cn(
                    "flex items-center justify-between w-full rounded-lg border px-3 py-2 text-left transition-colors",
                    activityIdx === i ? "border-primary/50 bg-primary/5" : "border-border hover:bg-accent",
                  )}
                >
                  <span>
                    <span className="block text-sm font-medium">{a.label}</span>
                    <span className="block text-xs text-muted-foreground">{a.desc}</span>
                  </span>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">×{a.f}</span>
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* 右侧结果 */}
        <div className="space-y-6 min-w-0">
          {!calc || !macros ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              请填写年龄、身高、体重后查看结果
            </div>
          ) : (
            <>
              {/* 核心指标 */}
              <div className="grid grid-cols-2 gap-px bg-border rounded-xl border border-border overflow-hidden">
                <div className="bg-card px-4 py-3.5">
                  <div className="text-xs text-muted-foreground">基础代谢 BMR</div>
                  <div className="mt-0.5 font-mono text-2xl font-bold tabular-nums">{Math.round(calc.bmr).toLocaleString("zh-CN")}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">静息状态每日消耗（kcal）</div>
                </div>
                <div className="bg-card px-4 py-3.5">
                  <div className="text-xs text-muted-foreground">每日总消耗 TDEE</div>
                  <div className="mt-0.5 font-mono text-2xl font-bold text-primary tabular-nums">
                    {Math.round(calc.tdee).toLocaleString("zh-CN")}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    BMR × {ACTIVITIES[activityIdx].f}（{ACTIVITIES[activityIdx].label}）
                  </div>
                </div>
              </div>

              {/* 目标摄入 */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-medium">目标摄入建议（点击切换）</span>
                  <span className="text-xs text-muted-foreground">基于 TDEE 调整</span>
                </div>
                <div className="divide-y divide-border/60">
                  {GOALS.map((g) => {
                    const kcal = calc.tdee * (1 + g.delta);
                    const selected = g.key === goal.key;
                    return (
                      <button
                        key={g.key}
                        onClick={(e) => {
                          setGoalKey(g.key);
                          e.currentTarget.blur();
                        }}
                        className={cn(
                          "flex items-center justify-between w-full px-5 py-3 transition-colors",
                          selected ? "bg-primary/5" : "hover:bg-accent/50",
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <span className={cn("text-sm font-medium", selected && "text-primary")}>{g.label}</span>
                          <span className="font-mono text-xs text-muted-foreground tabular-nums">
                            TDEE {g.delta === 0 ? "±0" : `${g.delta > 0 ? "+" : ""}${Math.round(g.delta * 100)}%`}
                          </span>
                        </span>
                        <span className={cn("font-mono font-semibold tabular-nums", selected && "text-primary")}>
                          {Math.round(kcal).toLocaleString("zh-CN")} kcal
                        </span>
                      </button>
                    );
                  })}
                </div>
                {macros.belowBmr && (
                  <p className="px-5 py-2.5 border-t border-border flex items-center gap-1.5 text-xs text-destructive">
                    <TriangleAlert className="size-3.5 shrink-0" />
                    该摄入已低于基础代谢 {Math.round(calc.bmr)} kcal，长期执行有代谢与肌肉流失风险。
                  </p>
                )}
              </div>

              {/* 三大营养素 */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">「{goal.label}」营养素分配</span>
                  <span className="font-mono text-sm font-semibold text-primary tabular-nums">
                    {Math.round(macros.kcal).toLocaleString("zh-CN")} kcal / 天
                  </span>
                </div>

                {/* 占比条：蛋白 / 脂肪 / 碳水 */}
                <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                  <div className="bg-blue-500" style={{ width: `${(macros.protein.kcal / macros.kcal) * 100}%` }} />
                  <div className="bg-amber-500" style={{ width: `${(macros.fat.kcal / macros.kcal) * 100}%` }} />
                  <div className="bg-emerald-500" style={{ width: `${(macros.carb.kcal / macros.kcal) * 100}%` }} />
                </div>

                <div className="grid grid-cols-3 gap-px bg-border rounded-lg overflow-hidden border border-border">
                  {[
                    { name: "蛋白质", color: "bg-blue-500", m: macros.protein, note: `${goal.proteinPerKg} g/kg 体重` },
                    { name: "脂肪", color: "bg-amber-500", m: macros.fat, note: `供能 ${Math.round(FAT_RATIO * 100)}%` },
                    { name: "碳水", color: "bg-emerald-500", m: macros.carb, note: "剩余热量补足" },
                  ].map((s) => (
                    <div key={s.name} className="bg-card px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className={cn("size-2 rounded-sm shrink-0", s.color)} />
                        <span className="text-xs text-muted-foreground truncate">{s.name}</span>
                      </div>
                      <div className="mt-0.5 font-mono text-lg font-semibold tabular-nums">{Math.round(s.m.g)} g</div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        {Math.round(s.m.kcal)} kcal · {s.note}
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  结果为统计学估算：减脂期建议不低于基础代谢，女性全天摄入不建议长期低于 1200 kcal、男性 1500 kcal；
                  实际执行 2–4 周后按体重变化 ±0.5kg/周 的节奏微调。增肌期热量盈余过高主要增加脂肪。
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
