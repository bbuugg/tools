// 走 /browser 子路径：拿到 ESM 构建，同时让 TS 解析到浏览器端的类型声明
import bwipjs from "bwip-js/browser";
import type { RenderOptions } from "bwip-js/browser";
import JSZip from "jszip";
import {
  Barcode,
  Camera,
  CameraOff,
  Check,
  Copy,
  Download,
  FileImage,
  FileText,
  Loader2,
  RotateCcw,
  ScanBarcode,
  Sparkles,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ColorPickerField } from "@/components/ui/color-picker-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { UploadDropZone } from "@/components/ui/upload-dropzone";
import {
  BARCODE_FORMATS,
  BARCODE_GROUPS,
  checkDigitInfo,
  getFormat,
  validateText,
  type BarcodeFormatDef,
} from "@/lib/barcode";
import {
  formatLabel as toFormatLabel,
  listCameras,
  loadZXing,
  recognizeImage,
  startCameraScan,
  type CameraScanner,
  type RecognizedBarcode,
} from "@/lib/barcode-reader";
import { cn } from "@/lib/utils";

// ─── 常量 ────────────────────────────────────────────────────

const DEFAULTS = {
  scale: 2,
  height: 15,
  includetext: true,
  textsize: 10,
  textyalign: "below" as "below" | "above",
  padding: 10,
  rotate: "N" as RenderOptions["rotate"],
  barcolor: "#000000",
  backgroundcolor: "#FFFFFF",
  textcolor: "#000000",
  eclevel: 1,
};

type Style = typeof DEFAULTS;

/** 二维码在一维码之外，预览时用更紧凑的网格 */
const TWO_DIMENSIONAL = ["qrcode", "datamatrix", "pdf417", "azteccode"];

interface FileRecognition {
  id: string;
  fileName: string;
  preview?: string;
  results: RecognizedBarcode[];
  error?: string;
  pending?: boolean;
}

// ─── 渲染与导出 ──────────────────────────────────────────────

/** 组装 bwip-js 渲染参数 */
function buildRenderOptions(def: BarcodeFormatDef, text: string, style: Style): RenderOptions {
  // BWIPP 的部分符号还有专属选项，这里补上 QR Code 的纠错等级
  const opts: RenderOptions & { eclevel?: number } = {
    bcid: def.bcid,
    text,
    scale: style.scale,
    height: style.height,
    includetext: style.includetext,
    textsize: style.textsize,
    textxalign: "center",
    textyalign: style.textyalign,
    paddingwidth: style.padding,
    paddingheight: style.padding,
    barcolor: style.barcolor,
    backgroundcolor: style.backgroundcolor,
    textcolor: style.textcolor,
    rotate: style.rotate,
  };
  // GS1-128 需要解析 ^FNC1 转义序列
  if (def.bcid === "gs1_128") {
    opts.parse = true;
    opts.parsefnc = true;
  }
  if (def.bcid === "qrcode") {
    opts.eclevel = style.eclevel;
  }
  return opts;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** 文件名安全化 */
function safeName(text: string, index: number) {
  return text.replace(/[^\w.-]+/g, "_").slice(0, 32) || `barcode-${index + 1}`;
}

/** 导出 PNG（放大 3 倍模块宽度保证清晰度） */
function downloadPng(opts: RenderOptions, filename: string, exportScale = 3) {
  const canvas = document.createElement("canvas");
  bwipjs.toCanvas(canvas, { ...opts, scale: (opts.scale ?? 2) * exportScale });
  canvas.toBlob((blob) => {
    if (blob) triggerDownload(blob, filename);
  }, "image/png");
}

/** 导出 SVG 矢量图 */
function downloadSvg(opts: RenderOptions, filename: string) {
  triggerDownload(new Blob([bwipjs.toSVG(opts)], { type: "image/svg+xml" }), filename);
}

// ─── 预览画布 ────────────────────────────────────────────────

/**
 * 预览用矢量 SVG 渲染：比 canvas 更清晰，且完全由渲染期的 props 推导，
 * 不需要 effect 同步状态。
 */
function BarcodePreview({ opts }: { opts: RenderOptions }) {
  const key = JSON.stringify(opts);
  const { uri, error } = useMemo(() => {
    try {
      let svg = bwipjs.toSVG(JSON.parse(key) as RenderOptions);
      // toSVG 只输出 viewBox，补上显式宽高，避免 <img> 在部分浏览器里尺寸塌陷
      const box = svg.match(/viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/);
      if (box) svg = svg.replace("<svg ", `<svg width="${box[1]}" height="${box[2]}" `);
      return { uri: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`, error: null };
    } catch (e) {
      // bwipp 的错误形如 "bwipp.ean13badLength#6878: EAN-13 must be 12 or 13 digits"
      const raw = e instanceof Error ? e.message : String(e);
      return { uri: null, error: raw.replace(/^bwipp\.\w+#\d+:\s*/, "") || "生成失败" };
    }
  }, [key]);

  if (!uri) {
    return (
      <p className="flex items-center gap-1 text-xs text-destructive">
        <TriangleAlert className="size-3.5 shrink-0" />
        {error}
      </p>
    );
  }
  return <img src={uri} alt="" className="h-auto max-w-full" />;
}

// ─── 小组件 ──────────────────────────────────────────────────

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {hint && <span className="text-xs tabular-nums text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback(async (text: string, tag = "default") => {
    await navigator.clipboard.writeText(text);
    setCopied(tag);
    setTimeout(() => setCopied((c) => (c === tag ? null : c)), 1500);
  }, []);
  return { copied, copy };
}

// ─── 主页面 ──────────────────────────────────────────────────

export default function BarcodePage() {
  const [mode, setMode] = useState("generate");
  const { copied, copy } = useCopy();

  // ── 生成侧 ──
  const [bcid, setBcid] = useState("code128");
  const [text, setText] = useState("CODE128-2026");
  const [batch, setBatch] = useState(false);
  const [style, setStyle] = useState<Style>(DEFAULTS);

  const def = useMemo(() => getFormat(bcid), [bcid]);

  const { items, singleError, skipped } = useMemo(() => {
    if (batch) {
      const lines = text.split("\n").map((l) => l.trim());
      const nonEmpty = lines.filter(Boolean);
      const valid = nonEmpty.filter((l) => !validateText(def, l));
      return { items: valid, singleError: null, skipped: nonEmpty.length - valid.length };
    }
    const trimmed = text.trim();
    return {
      items: trimmed && !validateText(def, trimmed) ? [trimmed] : [],
      singleError: trimmed ? validateText(def, trimmed) : null,
      skipped: 0,
    };
  }, [batch, def, text]);

  const check = useMemo(() => (batch ? null : checkDigitInfo(def, text)), [batch, def, text]);
  const patch = (next: Partial<Style>) => setStyle((s) => ({ ...s, ...next }));

  // ── 识别侧 ──
  const [files, setFiles] = useState<FileRecognition[]>([]);
  const [busy, setBusy] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [cameraId, setCameraId] = useState("");
  const [cameraState, setCameraState] = useState<"off" | "starting" | "on">("off");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<CameraScanner | null>(null);

  // 进入识别页前预拉 ZXing，避免首次上传时干等
  useEffect(() => {
    if (mode === "recognize") void loadZXing();
  }, [mode]);

  const stopCamera = useCallback(() => {
    scannerRef.current?.stop();
    scannerRef.current = null;
    setCameraState("off");
  }, []);

  useEffect(() => {
    return () => scannerRef.current?.stop();
  }, []);

  /** 切换页签时释放摄像头 */
  const handleModeChange = (value: string) => {
    if (value !== "recognize") stopCamera();
    setMode(value);
  };

  // ── 生成：打包下载 ──
  const downloadAll = async () => {
    const zip = new JSZip();
    for (let i = 0; i < items.length; i++) {
      const canvas = document.createElement("canvas");
      const opts = buildRenderOptions(def, items[i], style);
      bwipjs.toCanvas(canvas, { ...opts, scale: style.scale * 3 });
      zip.file(`${def.bcid}-${safeName(items[i], i)}.png`, canvas.toDataURL("image/png").split(",")[1], {
        base64: true,
      });
    }
    triggerDownload(await zip.generateAsync({ type: "blob" }), `barcodes-${Date.now()}.zip`);
  };

  // ── 识别：图片 ──
  const processFiles = useCallback(async (incoming: File[]) => {
    const pending: FileRecognition[] = incoming.map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      fileName: f.name,
      pending: true,
      results: [],
    }));
    setFiles((prev) => [...pending, ...prev]);
    setBusy(true);

    for (let i = 0; i < incoming.length; i++) {
      const id = pending[i].id;
      let preview: string | undefined;
      try {
        preview = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error("read failed"));
          reader.readAsDataURL(incoming[i]);
        });
      } catch {
        /* 预览失败不影响识别 */
      }
      const outcome = await recognizeImage(incoming[i]);
      setFiles((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, preview, pending: false, results: outcome.results, error: outcome.error } : item,
        ),
      );
    }
    setBusy(false);
  }, []);

  // ── 识别：摄像头 ──
  const pushCameraResult = (barcode: RecognizedBarcode) => {
    setFiles((prev) => {
      const rest = prev.filter((p) => p.id !== "camera");
      const head = prev.find((p) => p.id === "camera");
      if (!head) return [{ id: "camera", fileName: "摄像头扫描", results: [barcode] }, ...rest];
      if (head.results.some((r) => r.text === barcode.text && r.format === barcode.format)) return prev;
      return [{ ...head, results: [barcode, ...head.results].slice(0, 50) }, ...rest];
    });
  };

  const openCamera = useCallback(
    async (deviceId?: string) => {
      const video = videoRef.current;
      if (!video) return;
      setCameraError(null);
      setCameraState("starting");
      try {
        const scanner = await startCameraScan({
          video,
          deviceId: deviceId || undefined,
          onResult: pushCameraResult,
        });
        scannerRef.current = scanner;
        setCameraState("on");
        if (cameras.length === 0) {
          const list = await listCameras();
          setCameras(list);
          if (list.length && !deviceId) setCameraId(list[0].deviceId);
        }
      } catch (e) {
        setCameraState("off");
        setCameraError(
          e instanceof DOMException && e.name === "NotAllowedError"
            ? "摄像头权限被拒绝，请在浏览器地址栏左侧允许后重试"
            : "无法打开摄像头，请确认设备可用，且页面运行在 HTTPS 或 localhost 下",
        );
      }
    },
    [cameras.length],
  );

  const toggleCamera = () => {
    if (cameraState !== "off") {
      stopCamera();
      return;
    }
    void openCamera(cameraId);
  };

  /** 切换摄像头：正在扫描时先停后开，deviceId 显式传入避免读到旧状态 */
  const switchCamera = (deviceId: string) => {
    setCameraId(deviceId);
    if (cameraState === "off") return;
    stopCamera();
    setTimeout(() => void openCamera(deviceId), 150);
  };

  const recognized = files.flatMap((f) => f.results);
  const cameraOn = cameraState !== "off";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Tabs value={mode} onValueChange={handleModeChange}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Barcode className="size-5 text-primary" />
            <h1 className="text-xl font-semibold">条形码工具</h1>
            <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
              {BARCODE_FORMATS.length} 种码制
            </span>
          </div>
          <TabsList>
            <TabsTrigger value="generate">
              <Barcode className="size-4" /> 生成
            </TabsTrigger>
            <TabsTrigger value="recognize">
              <ScanBarcode className="size-4" /> 识别
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ══════════ 生成 ══════════ */}
        <TabsContent value="generate" className="mt-0">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
            {/* 左：配置 */}
            <div className="space-y-4">
              <div className="space-y-4 rounded-xl border border-border bg-card p-5">
                <Row label="码制">
                  <Select
                    value={bcid}
                    onValueChange={(v) => {
                      setBcid(v);
                      setText(getFormat(v).sample);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BARCODE_GROUPS.map((group) => (
                        <SelectGroup key={group}>
                          <SelectLabel>{group}</SelectLabel>
                          {BARCODE_FORMATS.filter((f) => f.group === group).map((f) => (
                            <SelectItem key={f.bcid} value={f.bcid}>
                              {f.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs leading-relaxed text-muted-foreground">{def.hint}</p>
                </Row>

                <Separator />

                <Row label={batch ? "内容（每行一个）" : "内容"} hint={`${text.length} 字符`}>
                  {batch ? (
                    <Textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={"12345678\n87654321"}
                      className="h-28 font-mono text-sm"
                    />
                  ) : (
                    <Input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={def.sample}
                      className="h-10 font-mono"
                    />
                  )}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <label className="flex cursor-pointer items-center gap-2">
                      <Checkbox checked={batch} onCheckedChange={(c) => setBatch(c === true)} />
                      <span className="text-xs">批量模式</span>
                    </label>
                    <div className="flex gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => setText(def.sample)}
                      >
                        <Sparkles className="size-3.5" /> 示例
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => setText("")}
                      >
                        <Trash2 className="size-3.5" /> 清空
                      </Button>
                    </div>
                  </div>
                </Row>

                {singleError && (
                  <p className="flex items-center gap-1.5 text-xs text-destructive">
                    <TriangleAlert className="size-3.5 shrink-0" />
                    {singleError}
                  </p>
                )}

                {batch && skipped > 0 && (
                  <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                    <TriangleAlert className="size-3.5 shrink-0" />
                    {skipped} 行内容不符合 {def.label} 的规则，已跳过
                  </p>
                )}

                {check && !singleError && (
                  <div
                    className={cn(
                      "flex items-start gap-2 rounded-lg border px-3 py-2 text-xs",
                      check.ok
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-400",
                    )}
                  >
                    <span className="shrink-0 font-medium">{check.label}</span>
                    {check.ok ? (
                      <span className="font-mono tabular-nums">{check.digit} ✓ 校验通过</span>
                    ) : (
                      <span className="min-w-0 flex-1">
                        <span className="font-mono tabular-nums">{check.digit}</span>
                        <span className="mx-1.5 text-muted-foreground">→</span>
                        <span className="break-all font-mono tabular-nums">{check.full}</span>
                        <button
                          className="ml-2 underline underline-offset-2 hover:no-underline"
                          onClick={() => setText(check.full)}
                        >
                          填入
                        </button>
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4 rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">样式</Label>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="gap-1 text-muted-foreground"
                    onClick={() => setStyle(DEFAULTS)}
                  >
                    <RotateCcw className="size-3" /> 重置
                  </Button>
                </div>

                <Row label="模块宽度" hint={`${style.scale} px`}>
                  <Slider
                    min={1}
                    max={8}
                    step={1}
                    value={[style.scale]}
                    onValueChange={(v) => patch({ scale: v[0] })}
                  />
                </Row>

                <Row label="条码高度" hint={`${style.height}`}>
                  <Slider
                    min={5}
                    max={60}
                    step={1}
                    value={[style.height]}
                    onValueChange={(v) => patch({ height: v[0] })}
                  />
                </Row>

                <Row label="静区（留白）" hint={`${style.padding} 模块`}>
                  <Slider
                    min={0}
                    max={40}
                    step={1}
                    value={[style.padding]}
                    onValueChange={(v) => patch({ padding: v[0] })}
                  />
                </Row>

                <Separator />

                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">显示可读文字</Label>
                  <Switch
                    checked={style.includetext}
                    onCheckedChange={(c) => patch({ includetext: c })}
                  />
                </div>

                {style.includetext && (
                  <>
                    <Row label="文字大小" hint={`${style.textsize} pt`}>
                      <Slider
                        min={6}
                        max={24}
                        step={1}
                        value={[style.textsize]}
                        onValueChange={(v) => patch({ textsize: v[0] })}
                      />
                    </Row>
                    <Row label="文字位置">
                      <div className="flex gap-2">
                        {(["below", "above"] as const).map((pos) => (
                          <Button
                            key={pos}
                            size="sm"
                            variant={style.textyalign === pos ? "default" : "outline"}
                            onClick={() => patch({ textyalign: pos })}
                          >
                            {pos === "below" ? "条码下方" : "条码上方"}
                          </Button>
                        ))}
                      </div>
                    </Row>
                  </>
                )}

                {def.bcid === "qrcode" && (
                  <Row label="纠错等级">
                    <Select
                      value={String(style.eclevel)}
                      onValueChange={(v) => patch({ eclevel: Number(v) })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">L · 约 7%</SelectItem>
                        <SelectItem value="1">M · 约 15%</SelectItem>
                        <SelectItem value="2">Q · 约 25%</SelectItem>
                        <SelectItem value="3">H · 约 30%</SelectItem>
                      </SelectContent>
                    </Select>
                  </Row>
                )}

                <Separator />

                <Row label="旋转">
                  <div className="grid grid-cols-4 gap-1.5">
                    {(
                      [
                        ["N", "0°"],
                        ["R", "90°"],
                        ["I", "180°"],
                        ["L", "270°"],
                      ] as const
                    ).map(([value, label]) => (
                      <Button
                        key={value}
                        size="sm"
                        variant={style.rotate === value ? "default" : "outline"}
                        onClick={() => patch({ rotate: value })}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </Row>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">条色</Label>
                    <ColorPickerField
                      value={style.barcolor}
                      onChange={(v) => patch({ barcolor: v })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">背景</Label>
                    <ColorPickerField
                      value={style.backgroundcolor}
                      onChange={(v) => patch({ backgroundcolor: v })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">文字色</Label>
                    <ColorPickerField
                      value={style.textcolor}
                      onChange={(v) => patch({ textcolor: v })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 右：预览 */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex h-8 items-center justify-between gap-2">
                <Label className="text-sm font-medium">
                  预览 {items.length > 0 && `(${items.length})`}
                </Label>
                {items.length > 0 && (
                  <Button size="sm" className="gap-1.5" onClick={downloadAll}>
                    <Download className="size-3.5" /> 打包下载
                  </Button>
                )}
              </div>

              {items.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Barcode className="size-12 opacity-20" />
                  <p className="text-sm">{singleError ?? "输入内容后自动生成预览"}</p>
                </div>
              ) : (
                <div
                  className={cn(
                    "grid max-h-[560px] gap-4 overflow-y-auto pr-1",
                    TWO_DIMENSIONAL.includes(def.bcid) ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1",
                  )}
                >
                  {items.map((item, i) => {
                    const opts = buildRenderOptions(def, item, style);
                    const name = `${def.bcid}-${safeName(item, i)}`;
                    return (
                      <div
                        key={`${item}-${i}`}
                        className="flex flex-col items-center gap-2 rounded-lg border border-border p-3"
                      >
                        <div
                          className="flex w-full flex-1 items-center justify-center overflow-auto p-3"
                          style={{ backgroundColor: style.backgroundcolor }}
                        >
                          <BarcodePreview opts={opts} />
                        </div>
                        <p
                          className="w-full truncate text-center font-mono text-xs text-muted-foreground"
                          title={item}
                        >
                          {item}
                        </p>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            title="复制内容"
                            onClick={() => copy(item, `text-${i}`)}
                          >
                            {copied === `text-${i}` ? (
                              <Check className="size-3" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            title="下载 PNG"
                            onClick={() => downloadPng(opts, `${name}.png`)}
                          >
                            <FileImage className="size-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            title="下载 SVG"
                            onClick={() => downloadSvg(opts, `${name}.svg`)}
                          >
                            <FileText className="size-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                PNG 按 3 倍模块宽度导出，SVG 为矢量图可无损放大。打印或贴标建议模块宽度不低于
                2px，并保留左右静区。
              </p>
            </div>
          </div>
        </TabsContent>

        {/* ══════════ 识别 ══════════ */}
        <TabsContent value="recognize" className="mt-0 space-y-4">
          <UploadDropZone
            multiple
            accept="image/*"
            onFiles={processFiles}
            className="rounded-xl"
            emptyHint="点击上传、拖拽或悬停粘贴条码图片"
            emptySubHint="支持 PNG, JPG, WebP, GIF, BMP"
            icon={<ScanBarcode className="size-8 opacity-40" />}
          />

          <div className="space-y-3 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm font-medium">摄像头扫描</Label>
              <div className="flex items-center gap-2">
                {cameras.length > 1 && (
                  <Select value={cameraId} onValueChange={switchCamera}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="选择摄像头" />
                    </SelectTrigger>
                    <SelectContent>
                      {cameras.map((c, i) => (
                        <SelectItem key={c.deviceId} value={c.deviceId}>
                          {c.label || `摄像头 ${i + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                <Button
                  variant={cameraState === "on" ? "destructive" : "outline"}
                  size="sm"
                  className="gap-1.5"
                  disabled={cameraState === "starting"}
                  onClick={toggleCamera}
                >
                  {cameraState === "starting" ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : cameraState === "on" ? (
                    <CameraOff className="size-3.5" />
                  ) : (
                    <Camera className="size-3.5" />
                  )}
                  {cameraState === "on" ? "停止" : cameraState === "starting" ? "启动中" : "开启摄像头"}
                </Button>
              </div>
            </div>

            <video
              ref={videoRef}
              playsInline
              muted
              className={cn(
                "mx-auto w-full max-w-md rounded-lg border border-border bg-black",
                !cameraOn && "hidden",
              )}
            />

            {cameraError && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <TriangleAlert className="size-3.5 shrink-0" />
                {cameraError}
              </p>
            )}
            {!cameraOn && !cameraError && (
              <p className="text-xs text-muted-foreground">
                实时扫描在本地完成，画面不会上传，需要浏览器授予摄像头权限。
              </p>
            )}
          </div>

          {files.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  识别结果 {recognized.length > 0 && `(${recognized.length})`}
                  {busy && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    disabled={recognized.length === 0}
                    onClick={() => copy(recognized.map((r) => r.text).join("\n"), "all")}
                  >
                    {copied === "all" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    复制全部
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setFiles([])}
                  >
                    <Trash2 className="size-3.5" /> 清空
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {files.map((file) => (
                  <div key={file.id} className="rounded-lg border border-border">
                    <div className="flex items-center gap-3 border-b border-border px-3 py-2">
                      {file.preview ? (
                        <img src={file.preview} alt="" className="size-9 shrink-0 rounded object-cover" />
                      ) : (
                        <Camera className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-xs font-medium">
                        {file.fileName}
                      </span>
                      {file.pending && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
                      {!file.pending && file.results.length > 0 && (
                        <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                          {file.results.length} 个
                        </span>
                      )}
                    </div>

                    {file.pending && <p className="px-3 py-2.5 text-xs text-muted-foreground">识别中…</p>}

                    {!file.pending && file.error && (
                      <p className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-destructive">
                        <TriangleAlert className="size-3.5 shrink-0" />
                        {file.error}
                      </p>
                    )}

                    {!file.pending && file.results.length > 0 && (
                      <div className="divide-y divide-border">
                        {file.results.map((r, i) => (
                          <div
                            key={`${r.format}-${r.text}-${i}`}
                            className="flex items-start gap-3 px-3 py-2.5"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="break-all font-mono text-sm">{r.text}</p>
                              <p className="mt-0.5 text-[11px] text-muted-foreground">
                                {toFormatLabel(r.format)} · {r.via}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              title="复制"
                              className="mt-0.5 shrink-0"
                              onClick={() => copy(r.text, `${file.id}-${i}`)}
                            >
                              {copied === `${file.id}-${i}` ? (
                                <Check className="size-3" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs leading-relaxed text-muted-foreground">
            识别完全在本地浏览器完成，图片不会上传。支持 EAN / UPC / Code 128 / Code 39 / Code 93 /
            ITF / Codabar / GS1 DataBar 等一维码，以及 QR Code、Data Matrix、PDF417、Aztec
            二维码。自动尝试放大、旋转与反色重试，一张图里的多个条码会全部列出。
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
