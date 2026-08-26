import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeftRight, Check, Copy, Download, TriangleAlert } from "lucide-react";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";

import { cn } from "@/lib/utils";

// ─── SVG 生成 ────────────────────────────────────────────────

const escapeXml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]!);

/** CJK 等宽字符（区段 U+2E80–9FFF、U+F900–FAFF、U+FF00–FFEF）按 1 个字宽计，其余按 0.56，估算文字实际宽度 */
function textWidthUnits(text: string): number {
  let units = 0;
  for (const ch of text) units += /[⺀-鿿豈-﫿＀-￯]/.test(ch) ? 1 : 0.56;
  return units || 1;
}

/** 自动字号：不超过短边的 22%，且保证文字占宽度 86% 以内 */
function fitFontSize(text: string, w: number, h: number): number {
  const eff = textWidthUnits(text);
  return Math.max(Math.min((Math.min(w, h) * 0.22), (w * 0.86) / eff), 4);
}

function buildSvg(w: number, h: number, bg: string, fg: string, text: string): string {
  const fontSize = fitFontSize(text, w, h);
  // y=50% + dy=.35em 的基线补偿在所有渲染器（含 canvas 栅格化）中比 dominant-baseline 更稳
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
    `<rect width="100%" height="100%" fill="${bg}"/>` +
    `<text x="50%" y="50%" dy=".35em" text-anchor="middle" fill="${fg}" ` +
    `font-family="system-ui,-apple-system,'Segoe UI',Roboto,sans-serif" font-size="${fontSize}" font-weight="500">` +
    `${escapeXml(text)}` +
    `</text></svg>`
  );
}

/** SVG 源码 → data URI（encodeURIComponent 形式比 base64 更短且可读） */
const svgToDataUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

/** SVG 栅格化为 PNG Blob（data URI 不引入外部资源，画布不会被污染） */
async function svgToPngBlob(svg: string, w: number, h: number): Promise<Blob | null> {
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("SVG 解码失败"));
    img.src = svgToDataUri(svg);
  });
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
}

function download(href: string, filename: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
}

// ─── 预设 ────────────────────────────────────────────────────

const SIZE_PRESETS = [
  { w: 320, h: 240 },
  { w: 640, h: 360 },
  { w: 800, h: 600 },
  { w: 1024, h: 768 },
  { w: 1200, h: 630 }, // OG 分享图
  { w: 1920, h: 1080 },
];

const PALETTES: { bg: string; fg: string; name: string }[] = [
  { name: "浅灰", bg: "#cccccc", fg: "#666666" },
  { name: "深色", bg: "#1f2937", fg: "#9ca3af" },
  { name: "蓝", bg: "#2563eb", fg: "#ffffff" },
  { name: "绿", bg: "#059669", fg: "#ffffff" },
  { name: "红", bg: "#dc2626", fg: "#ffffff" },
  { name: "琥珀", bg: "#d97706", fg: "#ffffff" },
];

const MIN_PX = 1;
const MAX_PX = 8000;

/** 解析并钳制尺寸输入；非法返回 null */
function parseSize(s: string): number | null {
  if (!/^\d{1,5}$/.test(s.trim())) return null;
  const v = Number(s);
  if (v < MIN_PX || v > MAX_PX) return null;
  return v;
}

/** #rgb 或 #rrggbb */
const isHexColor = (s: string) => /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s.trim());

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
            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
            o.value === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ColorField({ label, color, onChange }: { label: string; color: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={isHexColor(color) ? color : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="size-9 shrink-0 cursor-pointer rounded-md border border-border bg-card p-0.5"
        />
        <Input value={color} onChange={(e) => onChange(e.target.value)} className="font-mono" spellCheck={false} />
      </div>
    </Field>
  );
}

// ─── 页面 ────────────────────────────────────────────────────

type CodeView = "svg" | "uri";

export default function PlaceholderImagePage() {
  const [wStr, setWStr] = useState("800");
  const [hStr, setHStr] = useState("600");
  const [bg, setBg] = useState("#cccccc");
  const [fg, setFg] = useState("#666666");
  const [text, setText] = useState("");
  const [codeView, setCodeView] = useState<CodeView>("svg");
  const [copied, setCopied] = useState(false);
  const [pngBusy, setPngBusy] = useState(false);

  const w = parseSize(wStr);
  const h = parseSize(hStr);
  const colorsOk = isHexColor(bg) && isHexColor(fg);
  const valid = w !== null && h !== null && colorsOk;

  // 文字留空时默认展示 W×H
  const displayText = text.trim() || (w !== null && h !== null ? `${w}×${h}` : "");
  const svg = useMemo(
    () => (valid && displayText ? buildSvg(w!, h!, bg.trim(), fg.trim(), displayText) : ""),
    [valid, displayText, w, h, bg, fg],
  );
  const dataUri = svg ? svgToDataUri(svg) : "";
  const svgKB = svg ? (new Blob([svg]).size / 1024).toFixed(2) : "0";

  const copyCurrent = async () => {
    const content = codeView === "svg" ? svg : dataUri;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 剪贴板不可用时静默 */
    }
  };

  const downloadSvg = () => {
    if (!svg) return;
    download(dataUri, `placeholder-${w}x${h}.svg`);
  };

  const downloadPng = async () => {
    if (!svg || pngBusy) return;
    setPngBusy(true);
    try {
      const blob = await svgToPngBlob(svg, w!, h!);
      if (blob) {
        const url = URL.createObjectURL(blob);
        download(url, `placeholder-${w}x${h}.png`);
        setTimeout(() => URL.revokeObjectURL(url), 3000);
      }
    } catch {
      /* 栅格化失败时静默 */
    } finally {
      setPngBusy(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">占位图生成器</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          自定义尺寸、颜色与占位文字，导出 SVG / PNG 或复制 Data URI 直接内嵌。
        </p>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* 参数面板 */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <Field label="宽度 (px)">
              <Input
                inputMode="numeric"
                value={wStr}
                onChange={(e) => setWStr(e.target.value)}
                className="font-mono"
                placeholder="800"
              />
            </Field>
            <Button
              variant="outline"
              size="icon"
              title="交换宽高"
              className="mb-0.5"
              onClick={(e) => {
                setWStr(hStr);
                setHStr(wStr);
                e.currentTarget.blur();
              }}
            >
              <ArrowLeftRight className="size-4" />
            </Button>
            <Field label="高度 (px)">
              <Input
                inputMode="numeric"
                value={hStr}
                onChange={(e) => setHStr(e.target.value)}
                className="font-mono"
                placeholder="600"
              />
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {SIZE_PRESETS.map((p) => (
              <button
                key={`${p.w}x${p.h}`}
                onClick={(e) => {
                  setWStr(String(p.w));
                  setHStr(String(p.h));
                  e.currentTarget.blur();
                }}
                className={cn(
                  "rounded-md border px-2 py-0.5 font-mono text-xs transition-colors hover:bg-accent hover:text-foreground",
                  w === p.w && h === p.h
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground",
                )}
              >
                {p.w}×{p.h}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ColorField label="背景色" color={bg} onChange={setBg} />
            <ColorField label="文字色" color={fg} onChange={setFg} />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {PALETTES.map((p) => (
              <button
                key={p.name}
                title={`${p.name} · ${p.bg}`}
                onClick={(e) => {
                  setBg(p.bg);
                  setFg(p.fg);
                  e.currentTarget.blur();
                }}
                className={cn(
                  "flex items-center gap-1 rounded-md border px-1.5 py-1 text-xs transition-colors hover:bg-accent",
                  bg.toLowerCase() === p.bg ? "border-primary/60" : "border-border",
                )}
              >
                <span className="size-4 rounded-sm border border-border/60" style={{ backgroundColor: p.bg }} />
                <span className="text-muted-foreground">{p.name}</span>
              </button>
            ))}
          </div>

          <Field label="占位文字（留空显示 W×H）">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`自动：${w ?? "?"}×${h ?? "?"}`}
              maxLength={60}
            />
          </Field>

          {!valid && (
            <p className="flex items-center gap-1.5 text-sm text-destructive">
              <TriangleAlert className="size-4 shrink-0" />
              尺寸需为 {MIN_PX}–{MAX_PX} 的整数，颜色需为合法 HEX 值。
            </p>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button variant="outline" onClick={downloadSvg} disabled={!valid}>
              <Download className="size-4 mr-1.5" />
              SVG
            </Button>
            <Button onClick={downloadPng} disabled={!valid || pngBusy}>
              <Download className="size-4 mr-1.5" />
              {pngBusy ? "生成中…" : "PNG"}
            </Button>
          </div>
        </div>

        {/* 预览 + 代码 */}
        <div className="space-y-6 min-w-0">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">预览</span>
              {valid && (
                <span className="text-xs font-mono text-muted-foreground">
                  {w} × {h} px · SVG {svgKB} KB
                </span>
              )}
            </div>
            {/* 棋盘格衬托透明与边界 */}
            <div
              className="rounded-lg border border-border overflow-hidden flex items-center justify-center p-4 min-h-[320px]"
              style={
                {
                  backgroundImage:
                    "repeating-conic-gradient(hsl(var(--muted)) 0% 25%, hsl(var(--card)) 0% 50%)",
                  backgroundSize: "20px 20px",
                } as CSSProperties
              }
            >
              {svg ? (
                <img src={dataUri} alt={`占位图 ${w}×${h}`} className="max-w-full max-h-[420px] object-contain shadow-sm" />
              ) : (
                <span className="text-sm text-muted-foreground">参数无效，无法预览</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap">
              <Segmented<CodeView>
                options={[
                  { value: "svg", label: "SVG 源码" },
                  { value: "uri", label: "Data URI" },
                ]}
                value={codeView}
                onChange={setCodeView}
              />
              <Button variant="outline" size="sm" onClick={copyCurrent} disabled={!valid}>
                {copied ? <Check className="size-3.5 mr-1.5 text-primary" /> : <Copy className="size-3.5 mr-1.5" />}
                {copied ? "已复制" : "复制"}
              </Button>
            </div>
            <pre className="px-5 py-4 max-h-[220px] overflow-auto text-xs font-mono whitespace-pre-wrap break-all text-muted-foreground">
              {valid ? (codeView === "svg" ? svg : dataUri) : "—"}
            </pre>
            <p className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
              提示：Data URI 可直接用于 &lt;img src&gt; 或 CSS background，无需托管文件；PNG 由 canvas 本地栅格化生成。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
