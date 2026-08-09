import {
  Check,
  Copy,
  Palette,
  Plus,
  Shuffle,
  Trash2,
} from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerEyeDropper,
  ColorPickerOutput,
  ColorPickerFormat,
  type ColorPickerProps,
} from "@/components/ui/color-picker";

type ColorPickerOnChangeValue = Parameters<NonNullable<ColorPickerProps["onChange"]>>[0];
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type GradientType = "linear" | "radial";
type LinearDir = "0deg" | "45deg" | "90deg" | "135deg" | "180deg" | "225deg" | "270deg" | "315deg" | "custom";
type RadialShape = "circle" | "ellipse";

interface Stop { id: string; color: string; position: number }

const PRESETS: string[][] = [
  ["#6366F1", "#8B5CF6"],
  ["#F472B6", "#EC4899"],
  ["#10B981", "#059669"],
  ["#3B82F6", "#2563EB"],
  ["#F59E0B", "#F97316"],
  ["#6B7280", "#374151"],
  ["#1E293B", "#0F172A"],
];

const DIRS: LinearDir[] = ["225deg", "270deg", "315deg", "180deg", "0deg", "135deg", "90deg", "45deg"];
const DIR_ICONS: Record<string, string> = {
  "0deg": "→", "45deg": "↗", "90deg": "↑", "135deg": "↖",
  "180deg": "←", "225deg": "↙", "270deg": "↓", "315deg": "↘",
};
const RADIAL_POSITIONS = [
  "top left", "top", "top right",
  "left", "center", "right",
  "bottom left", "bottom", "bottom right",
];

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

function randomColor() {
  return "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0").toUpperCase();
}

// ColorPicker onChange returns [r, g, b, a] (a in 0..1) — convert to a hex string
// (the gradient model stores stops as hex; alpha is not used here).
function rgbToHex(c: ArrayLike<number>) {
  const r = Math.max(0, Math.min(255, Math.round(c[0] ?? 0)));
  const g = Math.max(0, Math.min(255, Math.round(c[1] ?? 0)));
  const b = Math.max(0, Math.min(255, Math.round(c[2] ?? 0)));
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

// ─── Single color stop row ─────────────────────────────────────────
// The hex <Input> is controlled directly by stop.color (so partially-typed
// values show as the user types). The ColorPicker, however, must never
// receive an invalid color — so it reads the last *valid* hex via a ref.
function StopRow({
  stop,
  onChange,
  onRemove,
  canRemove,
}: {
  stop: Stop;
  onChange: (id: string, field: "color" | "position", value: string | number) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}) {
  // The ColorPicker must never receive an invalid color, so feed it the
  // committed hex when valid, otherwise fall back to a safe default.
  const pickerValue = HEX_RE.test(stop.color) ? stop.color : "#000000";

  // Stable reference — the ColorPicker's onChange effect depends on this,
  // so it must not change on every render (otherwise it loops).
  const handleColorChange = useCallback(
    (c: ColorPickerOnChangeValue) => onChange(stop.id, "color", rgbToHex(c as unknown as ArrayLike<number>)),
    [stop.id, onChange],
  );

  const commitHex = (raw: string) => {
    if (HEX_RE.test(raw)) {
      onChange(stop.id, "color", raw.startsWith("#") ? raw : `#${raw}`);
    } else {
      // Keep the invalid intermediate so the input reflects what the user typed.
      onChange(stop.id, "color", raw);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="选择颜色"
            className="size-9 shrink-0 cursor-pointer rounded-md border border-input"
            style={{ background: stop.color }}
          />
        </PopoverTrigger>
        <PopoverContent className="w-80 p-3" align="start">
          <ColorPicker value={pickerValue} onChange={handleColorChange}>
            <ColorPickerSelection className="h-36 rounded-lg" />
            <ColorPickerHue />
            <div className="flex items-center gap-2">
              <ColorPickerEyeDropper />
              <ColorPickerOutput />
              <ColorPickerFormat className="flex-1" />
            </div>
          </ColorPicker>
        </PopoverContent>
      </Popover>
      <Input
        value={stop.color}
        onChange={(e) => commitHex(e.target.value)}
        className="h-9 w-24 font-mono text-xs"
        spellCheck={false}
      />
      <Input
        type="number"
        min={0}
        max={100}
        value={stop.position}
        onChange={(e) => onChange(stop.id, "position", parseInt(e.target.value) || 0)}
        className="h-9 w-16"
      />
      <span className="text-sm text-gray-400">%</span>
      {canRemove && (
        <Button variant="outline" size="sm" onClick={() => onRemove(stop.id)} className="text-red-500">
          <Trash2 className="size-3.5" />
        </Button>
      )}
    </div>
  );
}

// ─── Main tool ─────────────────────────────────────────────────────
export default function CssGradientGeneratorPage() {
  const [gType, setGType] = useState<GradientType>("linear");
  const [linDir, setLinDir] = useState<LinearDir>("90deg");
  const [customAngle, setCustomAngle] = useState(90);
  const [radialShape, setRadialShape] = useState<RadialShape>("circle");
  const [radialPos, setRadialPos] = useState("center");
  const [stops, setStops] = useState<Stop[]>([
    { id: "1", color: "#6366F1", position: 0 },
    { id: "2", color: "#8B5CF6", position: 100 },
  ]);
  const [copied, setCopied] = useState(false);

  const sorted = [...stops].sort((a, b) => a.position - b.position);
  const stopsStr = sorted.map((s) => `${s.color} ${s.position}%`).join(", ");

  const direction = linDir === "custom" ? `${customAngle}deg` : linDir;
  const gradientCss = gType === "linear"
    ? `linear-gradient(${direction}, ${stopsStr})`
    : `radial-gradient(${radialShape} at ${radialPos}, ${stopsStr})`;

  const fullCss = `background: ${sorted[0]?.color};\nbackground: -webkit-${gType === "linear" ? "linear" : "radial"}-gradient(${gType === "linear" ? `${direction}, ${stopsStr}` : `${radialPos}, ${radialShape}, ${stopsStr}`});\nbackground: ${gradientCss};`;

  const addStop = () => {
    if (stops.length >= 2) {
      const sortedStops = [...stops].sort((a, b) => a.position - b.position);
      let maxGap = 0, insertPos = 50;
      for (let i = 0; i < sortedStops.length - 1; i++) {
        const gap = sortedStops[i + 1].position - sortedStops[i].position;
        if (gap > maxGap) { maxGap = gap; insertPos = sortedStops[i].position + Math.floor(gap / 2); }
      }
      setStops([...stops, { id: Date.now().toString(), color: randomColor(), position: insertPos }]);
    } else {
      setStops([...stops, { id: Date.now().toString(), color: randomColor(), position: 50 }]);
    }
  };

  const removeStop = useCallback((id: string) => {
    setStops((prev) => {
      if (prev.length <= 2) return prev;
      return prev.filter((s) => s.id !== id);
    });
  }, []);

  const updateStop = useCallback((id: string, field: "color" | "position", value: string | number) => {
    setStops((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      if (field === "position") {
        const num = typeof value === "string" ? parseInt(value, 10) : value;
        return { ...s, position: Math.max(0, Math.min(100, num)) };
      }
      return { ...s, color: value as string };
    }));
  }, []);

  const applyPreset = (colors: string[]) => {
    setStops((prev) => prev.map((s, i) => i < colors.length ? { ...s, color: colors[i] } : s));
  };

  const randomGradient = () => {
    setStops((prev) => prev.map((s) => ({ ...s, color: randomColor() })));
    setGType(Math.random() > 0.5 ? "linear" : "radial");
    if (gType === "linear") {
      setLinDir(DIRS.filter((d) => d !== "custom")[Math.floor(Math.random() * 8)] as LinearDir);
    }
  };

  return (
    <>
      <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

          <div className="grid gap-4 lg:grid-cols-2 overflow-x-hidden">
            {/* Left: Controls */}
            <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5 min-w-0">
              {/* Type */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">渐变类型</Label>
                <div className="flex gap-2">
                  <Button variant={gType === "linear" ? "default" : "outline"} size="sm" onClick={() => setGType("linear")}>线性渐变</Button>
                  <Button variant={gType === "radial" ? "default" : "outline"} size="sm" onClick={() => setGType("radial")}>径向渐变</Button>
                </div>
              </div>

              {gType === "linear" ? (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">方向</Label>
                  <div className="grid grid-cols-4 gap-1 sm:grid-cols-8 gap-2">
                    {DIRS.map((dir) => (
                      <Button
                        key={dir}
                        variant={linDir === dir ? "default" : "outline"}
                        size="sm"
                        className="h-10 text-xs sm:text-lg"
                        onClick={() => setLinDir(dir)}
                      >
                        {DIR_ICONS[dir]}
                      </Button>
                    ))}
                    <div className="flex items-center justify-center col-span-2 sm:col-span-4">
                      <div className="size-4 rounded-full bg-primary" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Slider min={0} max={359} value={[customAngle]} onValueChange={(v) => { setCustomAngle(v[0]); setLinDir("custom"); }} className="flex-1" />
                    <span className="w-8 sm:w-12 text-xs text-gray-500">{customAngle}°</span>
                    <Button variant={linDir === "custom" ? "default" : "outline"} size="sm" onClick={() => setLinDir("custom")}>应用</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">形状</Label>
                    <div className="flex gap-2">
                      <Button variant={radialShape === "circle" ? "default" : "outline"} size="sm" onClick={() => setRadialShape("circle")}>圆形</Button>
                      <Button variant={radialShape === "ellipse" ? "default" : "outline"} size="sm" onClick={() => setRadialShape("ellipse")}>椭圆</Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">位置</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {RADIAL_POSITIONS.map((pos) => (
                        <Button
                          key={pos}
                          variant={radialPos === pos ? "default" : "outline"}
                          size="sm"
                          className="h-10"
                          onClick={() => setRadialPos(pos)}
                        >
                          <div className={cn("size-3 rounded-full", radialPos === pos ? "bg-white" : "bg-current")} />
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Color stops */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">颜色控制点</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={addStop}><Plus className="size-3.5" /></Button>
                    <Button variant="outline" size="sm" onClick={randomGradient}><Shuffle className="size-3.5" /></Button>
                  </div>
                </div>
                {sorted.map((s) => (
                  <StopRow
                    key={s.id}
                    stop={s}
                    onChange={updateStop}
                    onRemove={removeStop}
                    canRemove={stops.length > 2}
                  />
                ))}
              </div>

              {/* Presets */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">预设颜色</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((colors, i) => (
                    <button
                      key={i}
                      className="size-10 rounded-lg border border-gray-200 transition-transform hover:scale-105"
                      style={{ background: `linear-gradient(to right, ${colors[0]}, ${colors[1]})` }}
                      onClick={() => applyPreset(colors)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Preview & Code - overflow-x-auto for mobile */}
            <div className="space-y-4 min-w-0">
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <Label className="text-sm font-semibold mb-3 block">预览</Label>
                <div className="h-64 rounded-lg border border-gray-300 shadow-inner" style={{ background: gradientCss }} />
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                  <Label className="text-sm font-semibold">CSS 代码</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(fullCss);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copied ? "已复制" : "复制"}
                  </Button>
                </div>
                <pre className="overflow-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                  <code>{fullCss}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
