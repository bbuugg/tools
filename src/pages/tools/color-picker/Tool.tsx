import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import type { ColorLike } from "color";
import {
  Palette,
  Pipette,
  Image as ImageIcon,
  Copy,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { UploadDropZone } from "@/components/ui/upload-dropzone";
import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerOutput,
  ColorPickerFormat,
} from "@/components/ui/color-picker";
import { type SiteDefination } from "@/lib/site";

// ─── Helpers ──────────────────────────────────────────────────────

function rgbToCmyk(r: number, g: number, b: number) {
  const rN = r / 255;
  const gN = g / 255;
  const bN = b / 255;

  const k = Math.min(1 - rN, 1 - gN, 1 - bN);
  const c = (1 - rN - k) / (1 - k) || 0;
  const m = (1 - gN - k) / (1 - k) || 0;
  const y = (1 - bN - k) / (1 - k) || 0;

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));

const toHex = (r: number, g: number, b: number) =>
  "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);

const HEX_RE = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;
const HEX_RE_SHORT = /^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i;

const parseHex = (hex: string): { r: number; g: number; b: number } | null => {
  const trimmed = hex.trim();
  const match = HEX_RE.exec(trimmed) || HEX_RE_SHORT.exec(trimmed);
  if (!match) return null;

  const rHex = match[1];
  const gHex = match[2];
  const bHex = match[3];

  const r = parseInt(rHex.length === 1 ? rHex + rHex : rHex, 16);
  const g = parseInt(gHex.length === 1 ? gHex + gHex : gHex, 16);
  const b = parseInt(bHex.length === 1 ? bHex + bHex : bHex, 16);

  return { r, g, b };
};

const RGB_RE = /^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+)\s*)?\)$/i;

const parseRgb = (rgb: string): { r: number; g: number; b: number; a?: number } | null => {
  const trimmed = rgb.trim();
  const match = RGB_RE.exec(trimmed);
  if (!match) return null;

  return {
    r: parseInt(match[1], 10),
    g: parseInt(match[2], 10),
    b: parseInt(match[3], 10),
    a: match[4] ? parseFloat(match[4]) : undefined,
  };
};

const CMYK_RE = /^cmyk\s*\(\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)$/i;

const cmykToRgb = (c: number, m: number, y: number, k: number): { r: number; g: number; b: number } => {
  const cN = c / 100;
  const mN = m / 100;
  const yN = y / 100;
  const kN = k / 100;

  const r = Math.round(255 * (1 - cN) * (1 - kN));
  const g = Math.round(255 * (1 - mN) * (1 - kN));
  const b = Math.round(255 * (1 - yN) * (1 - kN));

  return { r, g, b };
};

const parseCmyk = (cmyk: string): { r: number; g: number; b: number } | null => {
  const trimmed = cmyk.trim();
  const match = CMYK_RE.exec(trimmed);
  if (!match) return null;

  const c = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const y = parseInt(match[3], 10);
  const k = parseInt(match[4], 10);

  return cmykToRgb(c, m, y, k);
};

const commonColors = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#64748b",
  "#000000",
  "#ffffff",
  "#f4f4f5",
];

// ─── Single value row with copy button ───────────────────────────

function ValueRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange?: (newValue: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  // Update input when external value changes (but only if not focused)
  useEffect(() => {
    if (!isFocused) {
      setInputValue(value);
    }
  }, [value, isFocused]);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="w-12 shrink-0 font-mono text-xs text-gray-400">
        {label}
      </span>
      <Input
        value={inputValue}
        onChange={onChange ? handleChange : undefined}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setInputValue(value);
        }}
        className="flex-1 font-mono"
        placeholder={onChange ? "输入颜色值..." : undefined}
      />
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        {copied ? "已复制" : "复制"}
      </Button>
    </div>
  );
}

// ─── Main tool ────────────────────────────────────────────────────

export default function ColorPickerTool({
  title,
  description,
}: SiteDefination) {
  const [rgb, setRgb] = useState({ r: 22, g: 119, b: 255, a: 1 });

  // Image picker
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isPicking, setIsPicking] = useState(false);

  // Controlled value fed to the ColorPicker (keeps two-way sync with
  // image picking / swatches). Alpha is preserved via rgba().
  const colorValue = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;

  // ColorPicker onChange → [r, g, b, a] (a in 0..1)
  const handleColorChange = useCallback((value: ColorLike) => {
    const arr = value as ArrayLike<number>;
    setRgb({
      r: clamp(Math.round(arr[0] ?? 0), 0, 255),
      g: clamp(Math.round(arr[1] ?? 0), 0, 255),
      b: clamp(Math.round(arr[2] ?? 0), 0, 255),
      a: arr[3] ?? 1,
    });
  }, []);

  // External color set (image pick / swatch)
  const setColorFromRgb = (r: number, g: number, b: number) => {
    setRgb({
      r: clamp(Math.round(r), 0, 255),
      g: clamp(Math.round(g), 0, 255),
      b: clamp(Math.round(b), 0, 255),
      a: 1,
    });
  };

  const setColorFromHex = (raw: string) => {
    const m = HEX_RE.exec(raw);
    if (!m) return;
    setColorFromRgb(
      parseInt(m[1], 16),
      parseInt(m[2], 16),
      parseInt(m[3], 16),
    );
  };

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setImageUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  // Paste an image from the clipboard anywhere on the page
  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => setImageUrl(ev.target?.result as string);
          reader.readAsDataURL(file);
        }
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const pickColor = (e: MouseEvent) => {
    if (!isPicking || !imageRef.current) return;
    const img = imageRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);

    const rect = img.getBoundingClientRect();
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const p = ctx.getImageData(x, y, 1, 1).data;
    setColorFromRgb(p[0], p[1], p[2]);
  };

  const hex = toHex(rgb.r, rgb.g, rgb.b);
  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
  const rgbaString = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`;

  return (
    <>
      <div>
        <div className="max-w-6xl mx-auto space-y-4 px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
              <Palette className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* LEFT COLUMN */}
            <div className="space-y-4">
              {/* MAIN PICKER */}
              <Card>
                <CardHeader>
                  <CardTitle>颜色选择</CardTitle>
                </CardHeader>
                <CardContent>
                  <ColorPicker value={colorValue} onChange={handleColorChange}>
                    <ColorPickerSelection className="h-44 rounded-lg" />
                    <ColorPickerHue />
                    <ColorPickerAlpha />
                    <div className="flex items-center gap-2">
                      <ColorPickerEyeDropper />
                      <ColorPickerOutput />
                      <ColorPickerFormat className="flex-1" />
                    </div>
                  </ColorPicker>
                </CardContent>
              </Card>

              {/* IMAGE PICKER */}
              <Card>
                <CardHeader>
                  <CardTitle>从图片取色</CardTitle>
                </CardHeader>
                <CardContent>
                  {!imageUrl ? (
                    <UploadDropZone
                      accept="image/*"
                      onFiles={handleFiles}
                      emptyHint="点击或拖拽图片到此处"
                      emptySubHint="支持粘贴图片取色"
                      icon={<ImageIcon className="size-8 opacity-50" />}
                    />
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setIsPicking(!isPicking)}
                          className={
                            isPicking ? "" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                          }
                          variant={isPicking ? "default" : "outline"}
                        >
                          <Pipette className="size-3.5" />
                          {isPicking ? "停止取色" : "从图片取色"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setImageUrl(null)}
                        >
                          清除图片
                        </Button>
                      </div>
                      <div className="flex justify-center overflow-hidden rounded-lg border border-gray-200">
                        <img
                          ref={imageRef}
                          src={imageUrl}
                          alt="待取色的图片"
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                          className={`max-h-96 object-contain ${isPicking ? "cursor-crosshair" : ""}`}
                          onClick={pickColor}
                        />
                      </div>
                      {isPicking && (
                        <p className="text-xs text-gray-500">
                          点击图片任意位置即可取色
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-4">
              {/* VALUES */}
              <Card>
                <CardHeader>
                  <CardTitle>颜色值</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <ValueRow
                      label="HEX"
                      value={hex.toUpperCase()}
                      onChange={(newValue) => {
                        const parsed = parseHex(newValue);
                        if (parsed) {
                          setColorFromRgb(parsed.r, parsed.g, parsed.b);
                        }
                      }}
                    />
                    <ValueRow
                      label="RGB"
                      value={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`}
                      onChange={(newValue) => {
                        const parsed = parseRgb(newValue);
                        if (parsed) {
                          setRgb({
                            r: clamp(parsed.r, 0, 255),
                            g: clamp(parsed.g, 0, 255),
                            b: clamp(parsed.b, 0, 255),
                            a: parsed.a ?? 1,
                          });
                        }
                      }}
                    />
                    <ValueRow
                      label="RGBA"
                      value={rgbaString}
                      onChange={(newValue) => {
                        const parsed = parseRgb(newValue);
                        if (parsed) {
                          setRgb({
                            r: clamp(parsed.r, 0, 255),
                            g: clamp(parsed.g, 0, 255),
                            b: clamp(parsed.b, 0, 255),
                            a: parsed.a ?? 1,
                          });
                        }
                      }}
                    />
                    <ValueRow
                      label="CMYK"
                      value={`cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`}
                      onChange={(newValue) => {
                        const parsed = parseCmyk(newValue);
                        if (parsed) {
                          setColorFromRgb(parsed.r, parsed.g, parsed.b);
                        }
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* PREVIEW */}
              <Card>
                <CardHeader>
                  <CardTitle>预览</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex h-24 items-center justify-center rounded-lg border border-gray-300 bg-white">
                        <div
                          className="h-16 w-16 rounded"
                          style={{ backgroundColor: rgbaString }}
                        />
                      </div>
                      <p className="mt-2 text-center text-xs text-gray-400">
                        浅色背景
                      </p>
                    </div>
                    <div>
                      <div className="flex h-24 items-center justify-center rounded-lg bg-black">
                        <div
                          className="h-16 w-16 rounded"
                          style={{ backgroundColor: rgbaString }}
                        />
                      </div>
                      <p className="mt-2 text-center text-xs text-gray-400">
                        深色背景
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* COMMON COLORS */}
              <Card>
                <CardHeader>
                  <CardTitle>常用颜色</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-6 gap-3">
                    {commonColors.map((color) => (
                      <div
                        key={color}
                        className="h-10 w-10 cursor-pointer rounded-lg border border-white/10 transition-transform hover:scale-110"
                        style={{ backgroundColor: color }}
                        onClick={() => setColorFromHex(color)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
