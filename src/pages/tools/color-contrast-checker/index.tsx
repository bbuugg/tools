import { ColorPickerField } from "@/components/ui/color-picker-field";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Check, Contrast, X } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

// ─── 颜色解析与 WCAG 计算 ─────────────────────────────────────

interface RGB {
  r: number;
  g: number;
  b: number;
}
interface HSL {
  h: number;
  s: number;
  l: number;
}

/** 解析 #RGB / #RRGGBB，非法输入返回 null */
function parseHex(hex: string): RGB | null {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const s = m[1];
  const full = s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

const toHex = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
function rgbToHex({ r, g, b }: RGB): string {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/** WCAG 相对亮度（WCAG 2.x 定义） */
function relativeLuminance({ r, g, b }: RGB): number {
  const ch = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

/** WCAG 对比度：较亮者 +0.05 除以较暗者 +0.05，范围 1–21 */
function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function rgbToHsl({ r, g, b }: RGB): HSL {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h, s, l };
}

function hslToRgb({ h, s, l }: HSL): RGB {
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  if (s === 0) return { r: l * 255, g: l * 255, b: l * 255 };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return { r: hue2rgb(p, q, h + 1 / 3) * 255, g: hue2rgb(p, q, h) * 255, b: hue2rgb(p, q, h - 1 / 3) * 255 };
}

// ─── WCAG 阈值 ───────────────────────────────────────────────

const AA_NORMAL = 4.5; // 正常文本 AA
const AAA_NORMAL = 7; // 正常文本 AAA
const AA_LARGE = 3; // 大号文本 AA（≥24px，或 ≥18.66px 粗体）
const AAA_LARGE = 4.5; // 大号文本 AAA
const AA_UI = 3; // UI 组件与图形边界（非文本对比度）

/**
 * 在保持色相/饱和度不变的前提下，按整数亮度步长寻找达到 target
 * 对比度的最小调整；两个方向取更近者。无法达标返回 null。
 */
function nearestPassing(rgb: RGB, other: RGB, target: number): string | null {
  const base = rgbToHsl(rgb);
  const ratioAt = (l: number) =>
    contrastRatio(hslToRgb({ ...base, l: Math.max(0, Math.min(1, l)) }), other);
  for (let step = 1; step <= 100; step++) {
    const up = base.l + step / 100 <= 1 ? ratioAt(base.l + step / 100) : 0;
    const down = base.l - step / 100 >= 0 ? ratioAt(base.l - step / 100) : 0;
    if (up >= target || down >= target) {
      // 同步长内两方向都达标时取调整后更接近原色的（此处相等），默认选提亮
      const l = up >= target ? Math.min(base.l + step / 100, 1) : base.l - step / 100;
      return rgbToHex(hslToRgb({ ...base, l }));
    }
  }
  return null;
}

// ─── 页面局部组件 ────────────────────────────────────────────

function Field({ label, children, extra }: { label: ReactNode; children: ReactNode; extra?: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        {extra && <span className="font-mono text-xs text-muted-foreground tabular-nums">{extra}</span>}
      </div>
      {children}
    </div>
  );
}

function VerdictBadge({ pass, children }: { pass: boolean; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        pass ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400",
      )}
    >
      {pass ? <Check className="size-3" /> : <X className="size-3" />}
      {children}
    </span>
  );
}

// ─── 页面 ────────────────────────────────────────────────────

const PRESETS = [
  { name: "正文黑 / 白", fg: "#1A1A1A", bg: "#FFFFFF" },
  { name: "灰字 / 白（常见反例）", fg: "#A3A3A3", bg: "#FFFFFF" },
  { name: "白字 / 蓝按钮", fg: "#FFFFFF", bg: "#3B82F5" },
  { name: "深棕 / 浅黄卡片", fg: "#713F12", bg: "#FEF9C3" },
];

export default function ColorContrastCheckerPage() {
  const [fg, setFg] = useState("#1A1A1A");
  const [bg, setBg] = useState("#FFFFFF");

  const fgRgb = useMemo(() => parseHex(fg), [fg]);
  const bgRgb = useMemo(() => parseHex(bg), [bg]);

  const calc = useMemo(() => {
    if (!fgRgb || !bgRgb) return null;
    const ratio = contrastRatio(fgRgb, bgRgb);
    const fixTarget = (t: number) => ({
      fg: nearestPassing(fgRgb, bgRgb, t),
      bg: nearestPassing(bgRgb, fgRgb, t),
    });
    return {
      ratio,
      luminanceFg: relativeLuminance(fgRgb),
      luminanceBg: relativeLuminance(bgRgb),
      aaNormal: ratio >= AA_NORMAL,
      aaaNormal: ratio >= AAA_NORMAL,
      aaLarge: ratio >= AA_LARGE,
      aaaLarge: ratio >= AAA_LARGE,
      aaUi: ratio >= AA_UI,
      fixes: {
        aa: ratio < AA_NORMAL ? fixTarget(AA_NORMAL) : null,
        aaa: ratio >= AA_NORMAL && ratio < AAA_NORMAL ? fixTarget(AAA_NORMAL) : null,
      },
    };
  }, [fgRgb, bgRgb]);

  const grade =
    !calc ? null : calc.ratio >= AAA_NORMAL
      ? { text: "AAA", pass: true }
      : calc.ratio >= AA_NORMAL
        ? { text: "AA", pass: true }
        : calc.ratio >= AA_LARGE
          ? { text: "仅大字号 AA", pass: true }
          : { text: "未通过", pass: false };

  const swap = () => {
    setFg(bg);
    setBg(fg);
  };

  const applyFix = (part: "fg" | "bg", hex: string) => (part === "fg" ? setFg(hex) : setBg(hex));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-xl font-semibold">
          <Contrast className="size-5 text-primary" />
          颜色对比度检查器
        </h1>
        <span className="text-xs text-muted-foreground">依据 WCAG 2.x 相对亮度公式</span>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* 左侧输入 */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 min-w-0">
          <Field
            label="前景色（文字）"
            extra={calc && `相对亮度 ${calc.luminanceFg.toFixed(3)}`}
          >
            <ColorPickerField value={fg} onChange={setFg} />
          </Field>

          <div className="flex justify-center">
            <Button variant="ghost" size="sm" onClick={swap} className="gap-1.5 text-xs">
              <ArrowLeftRight className="size-3.5" />
              交换颜色
            </Button>
          </div>

          <Field
            label="背景色"
            extra={calc && `相对亮度 ${calc.luminanceBg.toFixed(3)}`}
          >
            <ColorPickerField value={bg} onChange={setBg} />
          </Field>

          <Field label="示例组合">
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={(e) => {
                    setFg(p.fg);
                    setBg(p.bg);
                    e.currentTarget.blur();
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs transition-colors hover:bg-accent",
                    fg.toUpperCase() === p.fg.toUpperCase() && bg.toUpperCase() === p.bg.toUpperCase() && "border-primary/50 bg-primary/5",
                  )}
                >
                  <span className="size-3 rounded-sm border border-border" style={{ background: p.bg }}>
                    <span className="block size-full rounded-sm" style={{ background: p.fg, clipPath: "inset(0 0 55% 0)" }} />
                  </span>
                  {p.name}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* 右侧结果 */}
        <div className="space-y-6 min-w-0">
          {!calc ? (
            <div className="rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              请输入有效的 HEX 颜色（如 #1A1A1A）
            </div>
          ) : (
            <>
              {/* 核心指标 */}
              <div className="grid sm:grid-cols-[auto_1fr] gap-px bg-border rounded-xl border border-border overflow-hidden">
                <div className="bg-card px-6 py-4 flex flex-col justify-center">
                  <div className="text-xs text-muted-foreground">对比度</div>
                  <div className="mt-0.5 font-mono text-4xl font-bold tabular-nums">{calc.ratio.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">满分 21 : 1</div>
                </div>
                <div className="bg-card px-5 py-4 flex flex-col justify-center gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <VerdictBadge pass={calc.aaNormal}>AA 正常文本 ≥{AA_NORMAL}:1</VerdictBadge>
                    <VerdictBadge pass={calc.aaaNormal}>AAA 正常文本 ≥{AAA_NORMAL}:1</VerdictBadge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <VerdictBadge pass={calc.aaLarge}>AA 大号文本 ≥{AA_LARGE}:1</VerdictBadge>
                    <VerdictBadge pass={calc.aaaLarge}>AAA 大号文本 ≥{AAA_LARGE}:1</VerdictBadge>
                  </div>
                  {grade && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      综合评级：
                      <span className={cn("font-semibold", grade.pass ? (calc.aaaNormal ? "text-emerald-600 dark:text-emerald-400" : "text-primary") : "text-destructive")}>
                        {grade.text}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 达标矩阵 */}
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="px-5 py-3 border-b border-border text-sm font-medium">WCAG 达标矩阵</div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-muted-foreground border-b border-border/60">
                      <th className="px-5 py-2 font-normal text-left">适用场景</th>
                      <th className="px-5 py-2 font-normal w-28">AA 级</th>
                      <th className="px-5 py-2 font-normal w-28">AAA 级</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr>
                      <td className="px-5 py-2.5">
                        正常文本
                        <span className="block text-xs text-muted-foreground">＜18pt 常规 或 ＜14pt 粗体</span>
                      </td>
                      <td className="px-5 py-2.5"><MatrixCell pass={calc.aaNormal} /></td>
                      <td className="px-5 py-2.5"><MatrixCell pass={calc.aaaNormal} /></td>
                    </tr>
                    <tr>
                      <td className="px-5 py-2.5">
                        大号文本
                        <span className="block text-xs text-muted-foreground">≥18pt（24px）常规，或 ≥14pt（18.66px）粗体</span>
                      </td>
                      <td className="px-5 py-2.5"><MatrixCell pass={calc.aaLarge} /></td>
                      <td className="px-5 py-2.5"><MatrixCell pass={calc.aaaLarge} /></td>
                    </tr>
                    <tr>
                      <td className="px-5 py-2.5">
                        UI 组件与图形
                        <span className="block text-xs text-muted-foreground">输入框边框、图标、图表元素等非文本内容</span>
                      </td>
                      <td className="px-5 py-2.5"><MatrixCell pass={calc.aaUi} /></td>
                      <td className="px-5 py-2.5 text-xs text-muted-foreground text-center">无要求</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 实时预览 */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="px-5 py-3 border-b border-border text-sm font-medium bg-card">实时预览</div>
                <div style={{ backgroundColor: bg }} className="px-6 py-6 space-y-4 min-h-44">
                  <div style={{ color: fg }} className="text-2xl font-bold leading-snug">
                    大标题 24px 粗体
                  </div>
                  <div style={{ color: fg }} className="text-base leading-relaxed max-w-prose">
                    正文 16px：可访问性（Accessibility）要求文本与背景保持足够对比度，
                    让低视力、色觉障碍用户以及在强光下使用屏幕的人也能顺畅阅读。
                  </div>
                  <div style={{ color: fg }} className="text-[13px] leading-relaxed max-w-prose">
                    辅助小字 13px：注释、说明与占位文字同样需要满足对应级别的对比度要求。
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      style={{ backgroundColor: fg, color: bg }}
                      className="rounded-md px-4 py-1.5 text-sm font-medium cursor-default"
                    >
                      实心按钮
                    </button>
                    <button
                      type="button"
                      style={{ borderColor: fg, color: fg }}
                      className="rounded-md border px-4 py-1.5 text-sm font-medium cursor-default"
                    >
                      描边按钮
                    </button>
                  </div>
                </div>
              </div>

              {/* 一键修正建议 */}
              {(calc.fixes.aa || calc.fixes.aaa) && (
                <div className="rounded-xl border border-border bg-card p-5 space-y-3">
                  <div className="text-sm font-medium">一键修正建议</div>
                  {(["aa", "aaa"] as const).map((level) => {
                    const fix = calc.fixes[level];
                    const target = level === "aa" ? AA_NORMAL : AAA_NORMAL;
                    const label = level === "aa" ? `AA（≥${target}:1）` : `AAA（≥${target}:1）`;
                    if (!fix || (!fix.fg && !fix.bg)) return null;
                    return (
                      <div key={level} className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-xs text-muted-foreground w-28 shrink-0">调整至 {label}</span>
                        {fix.fg && (
                          <button
                            onClick={() => applyFix("fg", fix.fg!)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs transition-colors hover:bg-accent"
                          >
                            <span className="size-4 rounded-sm border border-border shrink-0" style={{ background: fix.fg }} />
                            前景改为 <span className="font-mono">{fix.fg}</span> → {contrastRatio(parseHex(fix.fg)!, bgRgb!).toFixed(2)}:1
                          </button>
                        )}
                        {fix.bg && (
                          <button
                            onClick={() => applyFix("bg", fix.bg!)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs transition-colors hover:bg-accent"
                          >
                            <span className="size-4 rounded-sm border border-border shrink-0" style={{ background: fix.bg }} />
                            背景改为 <span className="font-mono">{fix.bg}</span> → {contrastRatio(fgRgb!, parseHex(fix.bg)!).toFixed(2)}:1
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <p className="text-xs text-muted-foreground">
                    保持色相与饱和度不变，微调明度到恰好达标的最近颜色，点击即应用。
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MatrixCell({ pass }: { pass: boolean }) {
  return pass ? (
    <span className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400">
      <Check className="size-4" /> 通过
    </span>
  ) : (
    <span className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400">
      <X className="size-4" /> 未通过
    </span>
  );
}
