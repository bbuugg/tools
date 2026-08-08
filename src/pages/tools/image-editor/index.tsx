import { useState, useRef, useEffect, useCallback } from "react";
import {
  Sun,
  Type,
  Image as ImageIcon,
  FlipHorizontal2,
  FlipVertical2,
  RotateCw,
  Eraser,
  Download,
  RotateCcw,
  Plus,
  Trash2,
  X,
  Check,
  Move,
  Square,
  Loader2,
} from "lucide-react";



import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { UploadDropZone } from "@/components/ui/upload-dropzone";
import { type SiteDefination } from "@/lib/site";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface Adjustments {
  brightness: number; // -100..100
  contrast: number; // -100..100
  saturation: number; // -100..100
  warmth: number; // -100..100 (warm + / cool -)
  highlight: number; // -100..100
  fade: number; // 0..100
  hslH: number; // -180..180
  hslS: number; // -100..100
  hslL: number; // -100..100
  sharpen: number; // 0..100
  blur: number; // 0..20 (px)
}

interface Geometry {
  scale: number; // 0.1..3
  rotate: number; // -180..180 (deg)
  mirrorH: boolean;
  flipV: boolean;
  crop: CropFrac | null;
}

interface CropFrac {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ColorReplace {
  enabled: boolean;
  from: string;
  to: string;
  tolerance: number; // 0..255
}

interface TextItem {
  id: string;
  text: string;
  x: number; // fraction of width (center anchor)
  y: number; // fraction of height
  size: number; // fraction of height
  color: string;
  bold: boolean;
  font: string;
}

interface MosaicItem {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  block: number; // px in output
}

interface Watermark {
  enabled: boolean;
  text: string;
  color: string;
  opacity: number; // 0..1
  size: number; // fraction of height
  angle: number; // deg
  tiled: boolean;
  x: number; // fraction (corner mode)
  y: number;
}

const DEFAULT_ADJ: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  highlight: 0,
  fade: 0,
  hslH: 0,
  hslS: 0,
  hslL: 0,
  sharpen: 0,
  blur: 0,
};

const DEFAULT_GEO: Geometry = {
  scale: 1,
  rotate: 0,
  mirrorH: false,
  flipV: false,
  crop: null,
};

const DEFAULT_CR: ColorReplace = {
  enabled: false,
  from: "#ffffff",
  to: "#000000",
  tolerance: 40,
};

const DEFAULT_WM: Watermark = {
  enabled: false,
  text: "小禾笔记",
  color: "#ffffff",
  opacity: 0.35,
  size: 0.04,
  angle: -30,
  tiled: true,
  x: 0.5,
  y: 0.5,
};

const PREVIEW_MAX = 1100;
const EXPORT_MAX = 4096;

// ─────────────────────────────────────────────────────────────
// Color helpers
// ─────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  const v =
    m.length === 3
      ? m
          .split("")
          .map((c) => c + c)
          .join("")
      : m;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return [h * 360, s, l];
}

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360;
  let r: number;
  let g: number;
  let b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

// ─────────────────────────────────────────────────────────────
// Pixel passes
// ─────────────────────────────────────────────────────────────

function applyHsl(data: Uint8ClampedArray, dsPct: number, dlPct: number) {
  if (dsPct === 0 && dlPct === 0) return;
  const ds = dsPct / 100;
  const dl = dlPct / 100;
  for (let i = 0; i < data.length; i += 4) {
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    const ns = Math.min(1, Math.max(0, s + ds));
    const nl = Math.min(1, Math.max(0, l + dl));
    const [r, g, b] = hslToRgb(h, ns, nl);
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
}

function applyColorReplace(
  data: Uint8ClampedArray,
  cr: ColorReplace,
) {
  if (!cr.enabled) return;
  const [fr, fg, fb] = hexToRgb(cr.from);
  const [tr, tg, tb] = hexToRgb(cr.to);
  const tol2 = cr.tolerance * cr.tolerance;
  for (let i = 0; i < data.length; i += 4) {
    const dr = data[i] - fr;
    const dg = data[i + 1] - fg;
    const db = data[i + 2] - fb;
    if (dr * dr + dg * dg + db * db <= tol2) {
      data[i] = tr;
      data[i + 1] = tg;
      data[i + 2] = tb;
    }
  }
}

function applySharpen(
  data: Uint8ClampedArray,
  W: number,
  H: number,
  amount: number,
) {
  if (amount <= 0) return;
  const strength = (amount / 100) * 2;
  const src = new Uint8ClampedArray(data);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      for (let c = 0; c < 3; c++) {
        let sum = 0;
        let cnt = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
            sum += src[(ny * W + nx) * 4 + c];
            cnt++;
          }
        }
        const avg = sum / cnt;
        data[i + c] = src[i + c] + strength * (src[i + c] - avg);
      }
    }
  }
}

function applyMosaic(
  data: Uint8ClampedArray,
  m: MosaicItem,
  W: number,
  H: number,
) {
  const x0 = Math.max(0, Math.floor(m.x * W));
  const y0 = Math.max(0, Math.floor(m.y * H));
  const x1 = Math.min(W, Math.floor((m.x + m.w) * W));
  const y1 = Math.min(H, Math.floor((m.y + m.h) * H));
  const block = Math.max(1, Math.round(m.block));
  for (let by = y0; by < y1; by += block) {
    for (let bx = x0; bx < x1; bx += block) {
      const ex = Math.min(bx + block, x1);
      const ey = Math.min(by + block, y1);
      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let yy = by; yy < ey; yy++) {
        for (let xx = bx; xx < ex; xx++) {
          const idx = (yy * W + xx) * 4;
          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
          n++;
        }
      }
      if (n === 0) continue;
      r = Math.round(r / n);
      g = Math.round(g / n);
      b = Math.round(b / n);
      for (let yy = by; yy < ey; yy++) {
        for (let xx = bx; xx < ex; xx++) {
          const idx = (yy * W + xx) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
        }
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Render pipeline
// ─────────────────────────────────────────────────────────────

interface RenderOpts {
  image: HTMLImageElement;
  adj: Adjustments;
  geo: Geometry;
  cr: ColorReplace;
  texts: TextItem[];
  mosaics: MosaicItem[];
  wm: Watermark;
  maxDim: number;
}

function drawText(
  ctx: CanvasRenderingContext2D,
  t: TextItem,
  W: number,
  H: number,
) {
  const x = t.x * W;
  const y = t.y * H;
  const fontSize = Math.max(4, t.size * H);
  ctx.save();
  ctx.fillStyle = t.color;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${t.bold ? "bold " : ""}${fontSize}px ${t.font}`;
  const lines = t.text.split("\n");
  const lh = fontSize * 1.25;
  lines.forEach((line, i) =>
    ctx.fillText(line, x, y + (i - (lines.length - 1) / 2) * lh),
  );
  ctx.restore();
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  wm: Watermark,
  W: number,
  H: number,
) {
  if (!wm.enabled) return;
  ctx.save();
  ctx.globalAlpha = wm.opacity;
  ctx.fillStyle = wm.color;
  const fontSize = Math.max(4, wm.size * H);
  ctx.font = `${fontSize}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (wm.tiled) {
    ctx.translate(W / 2, H / 2);
    ctx.rotate((wm.angle * Math.PI) / 180);
    ctx.translate(-W / 2, -H / 2);
    const stepX = fontSize * 5;
    const stepY = fontSize * 3.2;
    for (let y = -H; y < 2 * H; y += stepY) {
      for (let x = -W; x < 2 * W; x += stepX) {
        ctx.fillText(wm.text, x, y);
      }
    }
  } else {
    ctx.fillText(wm.text, wm.x * W, wm.y * H);
  }
  ctx.restore();
}

function renderToCanvas(
  canvas: HTMLCanvasElement,
  opts: RenderOpts,
): { width: number; height: number } {
  const { image, adj, geo, cr, texts, mosaics, wm, maxDim } = opts;
  const sw = image.naturalWidth;
  const sh = image.naturalHeight;
  const scale = geo.scale;
  const w1 = sw * scale;
  const h1 = sh * scale;
  const rad = (geo.rotate * Math.PI) / 180;

  const W = Math.max(
    1,
    Math.round(Math.abs(w1 * Math.cos(rad)) + Math.abs(h1 * Math.sin(rad))),
  );
  const H = Math.max(
    1,
    Math.round(Math.abs(w1 * Math.sin(rad)) + Math.abs(h1 * Math.cos(rad))),
  );

  // Cap dimension for performance
  let cap = 1;
  if (Math.max(W, H) > maxDim) cap = maxDim / Math.max(W, H);
  const outW = Math.max(1, Math.round(W * cap));
  const outH = Math.max(1, Math.round(H * cap));

  const temp = document.createElement("canvas");
  temp.width = outW;
  temp.height = outH;
  const tctx = temp.getContext("2d", { willReadFrequently: true });
  if (!tctx) return { width: 0, height: 0 };

  tctx.clearRect(0, 0, outW, outH);
  tctx.save();
  tctx.translate(outW / 2, outH / 2);
  tctx.rotate(rad);
  if (geo.mirrorH) tctx.scale(-1, 1);
  if (geo.flipV) tctx.scale(1, -1);
  tctx.scale(scale * cap, scale * cap);
  const filters: string[] = [
    `brightness(${1 + adj.brightness / 100})`,
    `contrast(${1 + adj.contrast / 100})`,
    `saturate(${1 + adj.saturation / 100})`,
  ];
  if (adj.blur > 0) filters.push(`blur(${adj.blur}px)`);
  if (adj.hslH !== 0) filters.push(`hue-rotate(${adj.hslH}deg)`);
  tctx.filter = filters.join(" ");
  tctx.drawImage(image, -sw / 2, -sh / 2);
  tctx.filter = "none";
  tctx.restore();

  // Pixel-level passes
  const imgData = tctx.getImageData(0, 0, outW, outH);
  const d = imgData.data;
  applyHsl(d, adj.hslS, adj.hslL);
  applyColorReplace(d, cr);
  applySharpen(d, outW, outH, adj.sharpen);
  for (const m of mosaics) applyMosaic(d, m, outW, outH);
  tctx.putImageData(imgData, 0, 0);

  // Composite tint overlays
  if (adj.warmth !== 0) {
    const col = adj.warmth > 0 ? "255,138,0" : "30,144,255";
    tctx.save();
    tctx.globalCompositeOperation = "overlay";
    tctx.globalAlpha = (Math.abs(adj.warmth) / 100) * 0.5;
    tctx.fillStyle = `rgb(${col})`;
    tctx.fillRect(0, 0, outW, outH);
    tctx.restore();
  }
  if (adj.highlight !== 0) {
    const col = adj.highlight > 0 ? "255,255,255" : "0,0,0";
    tctx.save();
    tctx.globalCompositeOperation = "overlay";
    tctx.globalAlpha = (Math.abs(adj.highlight) / 100) * 0.5;
    tctx.fillStyle = `rgb(${col})`;
    tctx.fillRect(0, 0, outW, outH);
    tctx.restore();
  }
  if (adj.fade !== 0) {
    tctx.save();
    tctx.globalCompositeOperation = "soft-light";
    tctx.globalAlpha = (adj.fade / 100) * 0.6;
    tctx.fillStyle = "rgb(128,128,128)";
    tctx.fillRect(0, 0, outW, outH);
    tctx.restore();
  }

  // Overlays
  for (const t of texts) drawText(tctx, t, outW, outH);
  drawWatermark(tctx, wm, outW, outH);

  // Final copy (apply crop)
  if (geo.crop) {
    const cx = Math.round(geo.crop.x * outW);
    const cy = Math.round(geo.crop.y * outH);
    const cw = Math.max(1, Math.round(geo.crop.w * outW));
    const ch = Math.max(1, Math.round(geo.crop.h * outH));
    canvas.width = cw;
    canvas.height = ch;
    const c = canvas.getContext("2d");
    if (c) c.drawImage(temp, cx, cy, cw, ch, 0, 0, cw, ch);
  } else {
    canvas.width = outW;
    canvas.height = outH;
    const c = canvas.getContext("2d");
    if (c) c.drawImage(temp, 0, 0);
  }
  return { width: canvas.width, height: canvas.height };
}

// ─────────────────────────────────────────────────────────────
// UI helpers
// ─────────────────────────────────────────────────────────────

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  defaultValue,
  onChange,
  onReset,
  suffix = "",
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  defaultValue: number;
  onChange: (v: number) => void;
  onReset: () => void;
  suffix?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-gray-600">{label}</Label>
        <div className="flex items-center gap-1.5">
          <span className="text-xs tabular-nums text-gray-400">
            {value > 0 ? "+" : ""}
            {value}
            {suffix}
          </span>
          {value !== defaultValue && (
            <button
              type="button"
              onClick={onReset}
              title="重置"
              className="text-gray-300 hover:text-gray-500"
            >
              <RotateCcw className="size-3" />
            </button>
          )}
        </div>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-gray-900 mb-3">{children}</h3>
  );
}

let idSeq = 0;
const uid = () => `id_${Date.now()}_${idSeq++}`;

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────

export default function ImageEditorPage({
  title,
  description,
}: SiteDefination) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [fileName, setFileName] = useState("");
  const [naturalSize, setNaturalSize] = useState({ w: 0, h: 0 });
  const [exportSize, setExportSize] = useState({ w: 0, h: 0 });

  const [adj, setAdj] = useState<Adjustments>(DEFAULT_ADJ);
  const [geo, setGeo] = useState<Geometry>(DEFAULT_GEO);
  const [cr, setCr] = useState<ColorReplace>(DEFAULT_CR);
  const [texts, setTexts] = useState<TextItem[]>([]);
  const [mosaics, setMosaics] = useState<MosaicItem[]>([]);
  const [wm, setWm] = useState<Watermark>(DEFAULT_WM);

  const [exporting, setExporting] = useState(false);
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [quality, setQuality] = useState(0.92);

  // Interaction modes
  const [cropMode, setCropMode] = useState(false);
  const [cropDraft, setCropDraft] = useState<CropFrac>({
    x: 0.1,
    y: 0.1,
    w: 0.8,
    h: 0.8,
  });
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [mosaicDraw, setMosaicDraw] = useState(false);
  const dragRef = useRef<{
    mode: "crop-move" | "crop-resize" | "text" | "mosaic";
    sx: number;
    sy: number;
    start: CropFrac;
    rect?: DOMRect;
  } | null>(null);

  // ── Load image ───────────────────────────────────────────
  const loadFile = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = url;
      imgRef.current = img;
      setFileName(file.name);
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      // reset geometry & effects on new image
      setGeo(DEFAULT_GEO);
      setAdj(DEFAULT_ADJ);
      setCr(DEFAULT_CR);
      setTexts([]);
      setMosaics([]);
      setWm(DEFAULT_WM);
      setSelectedTextId(null);
      setCropMode(false);
    };
    img.src = url;
  }, []);

  // ── Render effect ────────────────────────────────────────
  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    const { width, height } = renderToCanvas(canvas, {
      image: img,
      adj,
      geo,
      cr,
      texts,
      mosaics,
      wm,
      maxDim: PREVIEW_MAX,
    });
    setExportSize({ w: width, h: height });
  }, [adj, geo, cr, texts, mosaics, wm]);

  // cleanup
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  // ── Export ───────────────────────────────────────────────
  const handleExport = useCallback(async () => {
    const img = imgRef.current;
    if (!img) return;
    setExporting(true);
    try {
      const off = document.createElement("canvas");
      renderToCanvas(off, {
        image: img,
        adj,
        geo,
        cr,
        texts,
        mosaics,
        wm,
        maxDim: EXPORT_MAX,
      });
      const mime =
        format === "png"
          ? "image/png"
          : format === "jpeg"
            ? "image/jpeg"
            : "image/webp";
      const needsBg = format !== "png";
      let canvasToExport = off;
      if (needsBg) {
        const bg = document.createElement("canvas");
        bg.width = off.width;
        bg.height = off.height;
        const bctx = bg.getContext("2d");
        if (bctx) {
          bctx.fillStyle = "#ffffff";
          bctx.fillRect(0, 0, bg.width, bg.height);
          bctx.drawImage(off, 0, 0);
          canvasToExport = bg;
        }
      }
      const blob: Blob | null = await new Promise((res) =>
        canvasToExport.toBlob(
          res,
          mime,
          format === "png" ? undefined : quality,
        ),
      );
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `edited-${Date.now()}.${format === "jpeg" ? "jpg" : format}`;
      link.href = url;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } finally {
      setExporting(false);
    }
  }, [adj, geo, cr, texts, mosaics, wm, format, quality]);

  // ── Reset helpers ────────────────────────────────────────
  const resetAll = () => {
    setAdj(DEFAULT_ADJ);
    setGeo(DEFAULT_GEO);
    setCr(DEFAULT_CR);
    setTexts([]);
    setMosaics([]);
    setWm(DEFAULT_WM);
    setSelectedTextId(null);
    setCropMode(false);
  };

  // ── Pointer handlers for crop / text / mosaic ────────────
  const fracFromEvent = (e: PointerEvent | React.PointerEvent) => {
    const rect = wrapRef.current!.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    return { x, y, rect };
  };

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const { x, y } = fracFromEvent(e);
      const dx = x - drag.sx;
      const dy = y - drag.sy;
      if (drag.mode === "crop-move") {
        let nx = drag.start.x + dx;
        let ny = drag.start.y + dy;
        nx = Math.min(Math.max(0, nx), 1 - drag.start.w);
        ny = Math.min(Math.max(0, ny), 1 - drag.start.h);
        setCropDraft({ ...drag.start, x: nx, y: ny });
      } else if (drag.mode === "crop-resize") {
        const nw = Math.min(Math.max(0.05, drag.start.w + dx), 1 - drag.start.x);
        const nh = Math.min(Math.max(0.05, drag.start.h + dy), 1 - drag.start.y);
        setCropDraft({ ...drag.start, w: nw, h: nh });
      } else if (drag.mode === "text" && selectedTextId) {
        const nx = Math.min(Math.max(0, x), 1);
        const ny = Math.min(Math.max(0, y), 1);
        setTexts((prev) =>
          prev.map((t) => (t.id === selectedTextId ? { ...t, x: nx, y: ny } : t)),
        );
      } else if (drag.mode === "mosaic") {
        const x0 = Math.min(drag.sx, x);
        const y0 = Math.min(drag.sy, y);
        const w = Math.abs(x - drag.sx);
        const h = Math.abs(y - drag.sy);
        setCropDraft({ x: x0, y: y0, w, h });
      }
    };
    const onUp = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      if (drag.mode === "mosaic") {
        const { x, y } = fracFromEvent(e);
        const w = Math.abs(x - drag.sx);
        const h = Math.abs(y - drag.sy);
        if (w > 0.01 && h > 0.01) {
          setMosaics((prev) => [
            ...prev,
            { id: uid(), x: drag.start.x, y: drag.start.y, w, h, block: 12 },
          ]);
        }
        setMosaicDraw(false);
        setCropDraft({ x: 0, y: 0, w: 1, h: 1 });
      }
      dragRef.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [selectedTextId]);

  const startCropMove = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = fracFromEvent(e);
    dragRef.current = {
      mode: "crop-move",
      sx: x,
      sy: y,
      start: { ...cropDraft },
    };
  };
  const startCropResize = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { x, y } = fracFromEvent(e);
    dragRef.current = {
      mode: "crop-resize",
      sx: x,
      sy: y,
      start: { ...cropDraft },
    };
  };
  const onWrapperPointerDown = (e: React.PointerEvent) => {
    if (cropMode) return;
    const { x, y } = fracFromEvent(e);
    if (mosaicDraw) {
      dragRef.current = {
        mode: "mosaic",
        sx: x,
        sy: y,
        start: { x, y, w: 0, h: 0 },
      };
      setCropDraft({ x, y, w: 0, h: 0 });
    } else if (selectedTextId) {
      dragRef.current = {
        mode: "text",
        sx: x,
        sy: y,
        start: { x, y, w: 1, h: 1 },
      };
    }
  };

  const applyCrop = () => {
    setGeo((g) => ({ ...g, crop: { ...cropDraft } }));
    setCropMode(false);
  };
  const cancelCrop = () => {
    setCropMode(false);
    setCropDraft({ x: 0, y: 0, w: 1, h: 1 });
  };

  const hasImage = !!imgRef.current;

  return (
    <>
            <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
          {/* Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
              <ImageIcon className="size-5" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            {/* ── Left: Preview ── */}
            <div className="lg:sticky lg:top-22 self-start space-y-3">
              <div className="rounded-xl border border-gray-200 bg-white p-4 flex justify-center items-center">
                {!hasImage ? (
                  <div className="min-h-[420px] w-full flex items-center justify-center">
                    <UploadDropZone
                      onFiles={(files) => files[0] && loadFile(files[0])}
                      accept="image/*"
                      className="w-full max-w-md min-h-[360px]"
                    />
                  </div>
                ) : (
                  <div
                    ref={wrapRef}
                    className="relative inline-block max-w-full mx-auto overflow-hidden"
                    style={{
                      backgroundImage:
                        "repeating-conic-gradient(#e5e7eb 0% 25%, #ffffff 0% 50%)",
                      backgroundSize: "20px 20px",
                      touchAction: "none",
                    }}
                    onPointerDown={onWrapperPointerDown}
                  >
                    <canvas
                      ref={canvasRef}
                      className="block max-w-full max-h-[68vh] w-auto h-auto rounded-md shadow-sm"
                    />

                    {/* Crop overlay */}
                    {cropMode && (
                      <div
                        className="absolute cursor-move"
                        style={{
                          left: `${cropDraft.x * 100}%`,
                          top: `${cropDraft.y * 100}%`,
                          width: `${cropDraft.w * 100}%`,
                          height: `${cropDraft.h * 100}%`,
                          boxShadow: "0 0 0 9999px rgba(0,0,0,0.45)",
                          outline: "1px solid #fff",
                        }}
                        onPointerDown={startCropMove}
                      >
                        <div
                          onPointerDown={startCropResize}
                          className="absolute -bottom-1 -right-1 size-4 bg-white border border-indigo-500 rounded-sm cursor-se-resize"
                        />
                      </div>
                    )}

                    {/* Mosaic draw preview */}
                    {mosaicDraw && cropDraft.w > 0 && (
                      <div
                        className="absolute pointer-events-none border border-dashed border-indigo-500 bg-indigo-500/10"
                        style={{
                          left: `${cropDraft.x * 100}%`,
                          top: `${cropDraft.y * 100}%`,
                          width: `${cropDraft.w * 100}%`,
                          height: `${cropDraft.h * 100}%`,
                        }}
                      />
                    )}
                  </div>
                )}
              </div>

              {hasImage && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500 truncate max-w-[180px]" title={fileName}>
                    {fileName}
                  </span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">
                    原图 {naturalSize.w}×{naturalSize.h}
                  </span>
                  <span className="text-xs text-gray-300">·</span>
                  <span className="text-xs text-gray-400">
                    输出 {exportSize.w}×{exportSize.h}
                  </span>
                  <div className="flex-1" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (objectUrlRef.current)
                        URL.revokeObjectURL(objectUrlRef.current);
                      imgRef.current = null;
                      setFileName("");
                    }}
                  >
                    <Trash2 className="size-3.5" /> 清除
                  </Button>
                  <Button variant="outline" size="sm" onClick={resetAll}>
                    <RotateCcw className="size-3.5" /> 重置全部
                  </Button>
                </div>
              )}
            </div>

            {/* ── Right: Controls ── */}
            <div className="space-y-4">
              {!hasImage && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-400">
                  先上传一张图片，即可开始编辑。
                </div>
              )}

              {hasImage && (
                <Tabs defaultValue="adjust" className="space-y-3">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                    <TabsTrigger value="adjust">
                      <Sun className="size-3.5" /> 调整
                    </TabsTrigger>
                    <TabsTrigger value="transform">
                      <RotateCw className="size-3.5" /> 变换
                    </TabsTrigger>
                    <TabsTrigger value="text">
                      <Type className="size-3.5" /> 文字水印
                    </TabsTrigger>
                    <TabsTrigger value="mosaic">
                      <Eraser className="size-3.5" /> 马赛克
                    </TabsTrigger>
                  </TabsList>

                  {/* ── Adjust ── */}
                  <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
                    <TabsContent value="adjust" className="space-y-4 mt-0">
                      <SliderRow
                        label="亮度"
                        value={adj.brightness}
                        min={-100}
                        max={100}
                        defaultValue={0}
                        onChange={(v) => setAdj((a) => ({ ...a, brightness: v }))}
                        onReset={() => setAdj((a) => ({ ...a, brightness: 0 }))}
                      />
                      <SliderRow
                        label="对比度"
                        value={adj.contrast}
                        min={-100}
                        max={100}
                        defaultValue={0}
                        onChange={(v) => setAdj((a) => ({ ...a, contrast: v }))}
                        onReset={() => setAdj((a) => ({ ...a, contrast: 0 }))}
                      />
                      <SliderRow
                        label="饱和度"
                        value={adj.saturation}
                        min={-100}
                        max={100}
                        defaultValue={0}
                        onChange={(v) => setAdj((a) => ({ ...a, saturation: v }))}
                        onReset={() => setAdj((a) => ({ ...a, saturation: 0 }))}
                      />
                      <SliderRow
                        label="冷暖色调"
                        value={adj.warmth}
                        min={-100}
                        max={100}
                        defaultValue={0}
                        onChange={(v) => setAdj((a) => ({ ...a, warmth: v }))}
                        onReset={() => setAdj((a) => ({ ...a, warmth: 0 }))}
                      />
                      <SliderRow
                        label="高光"
                        value={adj.highlight}
                        min={-100}
                        max={100}
                        defaultValue={0}
                        onChange={(v) => setAdj((a) => ({ ...a, highlight: v }))}
                        onReset={() => setAdj((a) => ({ ...a, highlight: 0 }))}
                      />
                      <SliderRow
                        label="色彩淡化"
                        value={adj.fade}
                        min={0}
                        max={100}
                        defaultValue={0}
                        onChange={(v) => setAdj((a) => ({ ...a, fade: v }))}
                        onReset={() => setAdj((a) => ({ ...a, fade: 0 }))}
                      />
                      <SliderRow
                        label="锐化"
                        value={adj.sharpen}
                        min={0}
                        max={100}
                        defaultValue={0}
                        onChange={(v) => setAdj((a) => ({ ...a, sharpen: v }))}
                        onReset={() => setAdj((a) => ({ ...a, sharpen: 0 }))}
                      />
                      <SliderRow
                        label="虚化"
                        value={adj.blur}
                        min={0}
                        max={20}
                        step={0.5}
                        defaultValue={0}
                        suffix="px"
                        onChange={(v) => setAdj((a) => ({ ...a, blur: v }))}
                        onReset={() => setAdj((a) => ({ ...a, blur: 0 }))}
                      />
                      <Separator className="my-2" />
                      <SectionTitle>HSL 色彩调整</SectionTitle>
                      <SliderRow
                        label="色相 H"
                        value={adj.hslH}
                        min={-180}
                        max={180}
                        defaultValue={0}
                        onChange={(v) => setAdj((a) => ({ ...a, hslH: v }))}
                        onReset={() => setAdj((a) => ({ ...a, hslH: 0 }))}
                      />
                      <SliderRow
                        label="饱和度 S"
                        value={adj.hslS}
                        min={-100}
                        max={100}
                        defaultValue={0}
                        onChange={(v) => setAdj((a) => ({ ...a, hslS: v }))}
                        onReset={() => setAdj((a) => ({ ...a, hslS: 0 }))}
                      />
                      <SliderRow
                        label="明度 L"
                        value={adj.hslL}
                        min={-100}
                        max={100}
                        defaultValue={0}
                        onChange={(v) => setAdj((a) => ({ ...a, hslL: v }))}
                        onReset={() => setAdj((a) => ({ ...a, hslL: 0 }))}
                      />

                      <Separator className="my-2" />
                      <SectionTitle>颜色替换</SectionTitle>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-gray-600">启用替换</Label>
                        <Switch
                          checked={cr.enabled}
                          onCheckedChange={(v) =>
                            setCr((c) => ({ ...c, enabled: v }))
                          }
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">原颜色</Label>
                          <input
                            type="color"
                            value={cr.from}
                            onChange={(e) =>
                              setCr((c) => ({ ...c, from: e.target.value }))
                            }
                            className="h-9 w-full cursor-pointer rounded-md border border-gray-200 bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">目标颜色</Label>
                          <input
                            type="color"
                            value={cr.to}
                            onChange={(e) =>
                              setCr((c) => ({ ...c, to: e.target.value }))
                            }
                            className="h-9 w-full cursor-pointer rounded-md border border-gray-200 bg-white"
                          />
                        </div>
                      </div>
                      <SliderRow
                        label="容差"
                        value={cr.tolerance}
                        min={0}
                        max={200}
                        defaultValue={40}
                        onChange={(v) => setCr((c) => ({ ...c, tolerance: v }))}
                        onReset={() => setCr((c) => ({ ...c, tolerance: 40 }))}
                      />
                    </TabsContent>

                    {/* ── Transform ── */}
                    <TabsContent value="transform" className="space-y-4 mt-0">
                      <SliderRow
                        label="缩放"
                        value={geo.scale}
                        min={0.1}
                        max={3}
                        step={0.01}
                        defaultValue={1}
                        suffix="x"
                        onChange={(v) => setGeo((g) => ({ ...g, scale: v }))}
                        onReset={() => setGeo((g) => ({ ...g, scale: 1 }))}
                      />
                      <div className="flex gap-2">
                        {[0.5, 1, 2].map((s) => (
                          <Button
                            key={s}
                            variant={geo.scale === s ? "default" : "outline"}
                            size="sm"
                            className="flex-1"
                            onClick={() => setGeo((g) => ({ ...g, scale: s }))}
                          >
                            {s}x
                          </Button>
                        ))}
                      </div>

                      <SliderRow
                        label="旋转"
                        value={geo.rotate}
                        min={-180}
                        max={180}
                        defaultValue={0}
                        suffix="°"
                        onChange={(v) => setGeo((g) => ({ ...g, rotate: v }))}
                        onReset={() => setGeo((g) => ({ ...g, rotate: 0 }))}
                      />
                      <div className="flex gap-2">
                        {[90, 180, 270].map((r) => (
                          <Button
                            key={r}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() =>
                              setGeo((g) => ({
                                ...g,
                                rotate: ((g.rotate + r + 180) % 360) - 180,
                              }))
                            }
                          >
                            <RotateRounded r={r} />
                          </Button>
                        ))}
                      </div>

                      <Separator className="my-1" />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setGeo((g) => ({ ...g, mirrorH: !g.mirrorH }))
                          }
                          className={`flex-1 flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm transition-colors ${
                            geo.mirrorH
                              ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <FlipHorizontal2 className="size-4" /> 镜像
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setGeo((g) => ({ ...g, flipV: !g.flipV }))
                          }
                          className={`flex-1 flex items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-sm transition-colors ${
                            geo.flipV
                              ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          <FlipVertical2 className="size-4" /> 翻转
                        </button>
                      </div>

                      <Separator className="my-1" />
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-gray-600">裁剪</Label>
                          <Switch
                            checked={cropMode}
                            onCheckedChange={(v) => {
                              if (v) {
                                setCropDraft(
                                  geo.crop ?? { x: 0.1, y: 0.1, w: 0.8, h: 0.8 },
                                );
                              }
                              setCropMode(v);
                            }}
                          />
                        </div>
                        {cropMode && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={applyCrop}
                            >
                              <Check className="size-3.5" /> 应用
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={cancelCrop}
                            >
                              <X className="size-3.5" /> 取消
                            </Button>
                          </div>
                        )}
                        {geo.crop && !cropMode && (
                          <button
                            type="button"
                            onClick={() => setGeo((g) => ({ ...g, crop: null }))}
                            className="text-xs text-gray-400 hover:text-red-500"
                          >
                            清除已应用的裁剪
                          </button>
                        )}
                        {cropMode && (
                          <p className="text-xs text-gray-400">
                            在左侧图片上拖动选框与右下角手柄调整裁剪范围。
                          </p>
                        )}
                      </div>
                    </TabsContent>

                    {/* ── Text & Watermark ── */}
                    <TabsContent value="text" className="space-y-4 mt-0">
                      <SectionTitle>文字</SectionTitle>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          const id = uid();
                          setTexts((prev) => [
                            ...prev,
                            {
                              id,
                              text: "双击修改文字",
                              x: 0.5,
                              y: 0.5,
                              size: 0.06,
                              color: "#ffffff",
                              bold: true,
                              font: "sans-serif",
                            },
                          ]);
                          setSelectedTextId(id);
                        }}
                      >
                        <Plus className="size-3.5" /> 添加文字
                      </Button>

                      <div className="space-y-2">
                        {texts.map((t) => (
                          <div
                            key={t.id}
                            className={`rounded-lg border p-2.5 space-y-2 ${
                              selectedTextId === t.id
                                ? "border-indigo-400 bg-indigo-50/40"
                                : "border-gray-100"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedTextId((id) =>
                                    id === t.id ? null : t.id,
                                  )
                                }
                                className="text-xs text-gray-500 hover:text-indigo-600"
                                title="选中后在画布上拖拽定位"
                              >
                                <Move className="size-3.5" />
                              </button>
                              <Input
                                value={t.text}
                                onChange={(e) =>
                                  setTexts((prev) =>
                                    prev.map((x) =>
                                      x.id === t.id
                                        ? { ...x, text: e.target.value }
                                        : x,
                                    ),
                                  )
                                }
                                className="h-8 text-sm flex-1"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setTexts((prev) =>
                                    prev.filter((x) => x.id !== t.id),
                                  );
                                  if (selectedTextId === t.id)
                                    setSelectedTextId(null);
                                }}
                                className="text-gray-300 hover:text-red-500"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <Label className="text-[11px] text-gray-500">
                                  大小 {Math.round(t.size * 100)}%
                                </Label>
                                <Slider
                                  value={[t.size * 100]}
                                  min={2}
                                  max={30}
                                  step={0.5}
                                  onValueChange={(v) =>
                                    setTexts((prev) =>
                                      prev.map((x) =>
                                        x.id === t.id
                                          ? { ...x, size: v[0] / 100 }
                                          : x,
                                      ),
                                    )
                                  }
                                />
                              </div>
                              <div className="flex items-end justify-between gap-2">
                                <div className="space-y-1">
                                  <Label className="text-[11px] text-gray-500">
                                    颜色
                                  </Label>
                                  <input
                                    type="color"
                                    value={t.color}
                                    onChange={(e) =>
                                      setTexts((prev) =>
                                        prev.map((x) =>
                                          x.id === t.id
                                            ? { ...x, color: e.target.value }
                                            : x,
                                        ),
                                      )
                                    }
                                    className="h-8 w-full cursor-pointer rounded-md border border-gray-200 bg-white"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setTexts((prev) =>
                                      prev.map((x) =>
                                        x.id === t.id
                                          ? { ...x, bold: !x.bold }
                                          : x,
                                      ),
                                    )
                                  }
                                  className={`rounded-md border px-2 py-1.5 text-xs ${
                                    t.bold
                                      ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                                      : "border-gray-200 text-gray-600"
                                  }`}
                                >
                                  B
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {texts.length === 0 && (
                          <p className="text-xs text-gray-400">
                            还没有文字。点击「添加文字」后，可在画布上拖拽定位。
                          </p>
                        )}
                      </div>

                      <Separator className="my-2" />
                      <SectionTitle>水印</SectionTitle>
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-gray-600">启用水印</Label>
                        <Switch
                          checked={wm.enabled}
                          onCheckedChange={(v) =>
                            setWm((w) => ({ ...w, enabled: v }))
                          }
                        />
                      </div>
                      <Input
                        value={wm.text}
                        onChange={(e) =>
                          setWm((w) => ({ ...w, text: e.target.value }))
                        }
                        placeholder="水印文字"
                        className="h-8 text-sm"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-500">颜色</Label>
                          <input
                            type="color"
                            value={wm.color}
                            onChange={(e) =>
                              setWm((w) => ({ ...w, color: e.target.value }))
                            }
                            className="h-9 w-full cursor-pointer rounded-md border border-gray-200 bg-white"
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setWm((w) => ({ ...w, tiled: !w.tiled }))
                            }
                            className={`rounded-md border px-2 py-1.5 text-xs ${
                              wm.tiled
                                ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                                : "border-gray-200 text-gray-600"
                            }`}
                          >
                            {wm.tiled ? "平铺" : "单个"}
                          </button>
                        </div>
                      </div>
                      <SliderRow
                        label="不透明度"
                        value={Math.round(wm.opacity * 100)}
                        min={5}
                        max={100}
                        defaultValue={35}
                        suffix="%"
                        onChange={(v) =>
                          setWm((w) => ({ ...w, opacity: v / 100 }))
                        }
                        onReset={() => setWm((w) => ({ ...w, opacity: 0.35 }))}
                      />
                      <SliderRow
                        label="大小"
                        value={Math.round(wm.size * 100)}
                        min={2}
                        max={20}
                        defaultValue={4}
                        suffix="%"
                        onChange={(v) =>
                          setWm((w) => ({ ...w, size: v / 100 }))
                        }
                        onReset={() => setWm((w) => ({ ...w, size: 0.04 }))}
                      />
                      {!wm.tiled && (
                        <SliderRow
                          label="位置 X"
                          value={Math.round(wm.x * 100)}
                          min={0}
                          max={100}
                          defaultValue={50}
                          suffix="%"
                          onChange={(v) => setWm((w) => ({ ...w, x: v / 100 }))}
                          onReset={() => setWm((w) => ({ ...w, x: 0.5 }))}
                        />
                      )}
                    </TabsContent>

                    {/* ── Mosaic ── */}
                    <TabsContent value="mosaic" className="space-y-4 mt-0">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant={mosaicDraw ? "default" : "outline"}
                          onClick={() => setMosaicDraw((v) => !v)}
                          className="flex-1"
                        >
                          <Square className="size-3.5" />
                          {mosaicDraw ? "绘制中…取消" : "在图上框选"}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-400">
                        开启后在左侧图片上按住拖动，框选区域将打码。
                      </p>
                      <div className="space-y-2">
                        {mosaics.map((m, i) => (
                          <div
                            key={m.id}
                            className="flex items-center gap-2 rounded-lg border border-gray-100 p-2"
                          >
                            <span className="text-xs text-gray-500 flex-1">
                              马赛克 {i + 1}
                            </span>
                            <div className="flex items-center gap-1 w-28">
                              <Slider
                                value={[m.block]}
                                min={4}
                                max={40}
                                step={1}
                                onValueChange={(v) =>
                                  setMosaics((prev) =>
                                    prev.map((x) =>
                                      x.id === m.id ? { ...x, block: v[0] } : x,
                                    ),
                                  )
                                }
                              />
                              <span className="text-[11px] text-gray-400 w-6 text-right">
                                {m.block}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setMosaics((prev) =>
                                  prev.filter((x) => x.id !== m.id),
                                )
                              }
                              className="text-gray-300 hover:text-red-500"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        ))}
                        {mosaics.length === 0 && (
                          <p className="text-xs text-gray-400">
                            暂无马赛克区域。
                          </p>
                        )}
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              )}

              {/* ── Export ── */}
              {hasImage && (
                <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                  <SectionTitle>导出</SectionTitle>
                  <div className="grid grid-cols-3 gap-2">
                    {(["png", "jpeg", "webp"] as const).map((f) => (
                      <Button
                        key={f}
                        size="sm"
                        variant={format === f ? "default" : "outline"}
                        onClick={() => setFormat(f)}
                        className="uppercase"
                      >
                        {f}
                      </Button>
                    ))}
                  </div>
                  {format !== "png" && (
                    <SliderRow
                      label="质量"
                      value={Math.round(quality * 100)}
                      min={10}
                      max={100}
                      defaultValue={92}
                      suffix="%"
                      onChange={(v) => setQuality(v / 100)}
                      onReset={() => setQuality(0.92)}
                    />
                  )}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleExport}
                    disabled={exporting}
                  >
                    {exporting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Download className="size-4" />
                    )}
                    {exporting ? "生成中…" : "生成并下载"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
          </>
  );
}

// small inline helper to render rotate button label
function RotateRounded({ r }: { r: number }) {
  return (
    <span className="flex items-center gap-1">
      <RotateCw className="size-3.5" />
      {r}°
    </span>
  );
}
