/**
 * 条码 / 二维码识别（ZXing，浏览器端本地解码，不出网）。
 *
 * ZXing 体积较大，这里用动态 import 按需加载，只有进入识别页才会下载。
 * 识别策略：先快速扫一遍（原图 + 2 倍放大），失败后再走深度扫描
 * （多倍率 × 旋转 × 反色 × TRY_HARDER），并对已命中的码做遮罩以实现一图多码。
 */

import type { Result } from "@zxing/library";

export interface RecognizedBarcode {
  /** 条码内容 */
  text: string;
  /** 码制，如 CODE_128 / EAN_13 */
  format: string;
  /** 码制中文名 */
  formatLabel: string;
  /** 命中的预处理策略，便于排查 */
  via: string;
}

export interface RecognizeOutcome {
  results: RecognizedBarcode[];
  /** 累计解码尝试次数 */
  attempts: number;
  error?: string;
}

type ZXing = typeof import("@zxing/library");

let zxingPromise: Promise<ZXing> | null = null;

/** 加载 ZXing（仅首次触发网络请求） */
export function loadZXing(): Promise<ZXing> {
  zxingPromise ??= import("@zxing/library");
  return zxingPromise;
}

// ─── 码制中文名 ──────────────────────────────────────────────

const FORMAT_LABELS: Record<string, string> = {
  AZTEC: "Aztec",
  CODABAR: "Codabar",
  CODE_39: "Code 39",
  CODE_93: "Code 93",
  CODE_128: "Code 128",
  DATA_MATRIX: "Data Matrix",
  EAN_8: "EAN-8",
  EAN_13: "EAN-13",
  ITF: "ITF（交叉二五）",
  MAXICODE: "MaxiCode",
  PDF_417: "PDF417",
  QR_CODE: "QR Code",
  RSS_14: "GS1 DataBar-14",
  RSS_EXPANDED: "GS1 DataBar Expanded",
  UPC_A: "UPC-A",
  UPC_E: "UPC-E",
  UPC_EAN_EXTENSION: "UPC/EAN 附加码",
};

export function formatLabel(format: string): string {
  return FORMAT_LABELS[format] ?? format;
}

// ─── 解码核心 ────────────────────────────────────────────────

/**
 * RGBA 像素 → 单通道灰度矩阵。
 *
 * ⚠️ 必须手动转换：@zxing/library 的 RGBLuminanceSource 对 Uint8ClampedArray
 * 输入不做任何换算，会直接把 w*h*4 长度的 RGBA 缓冲当作 w*h 的灰度矩阵用，
 * 喂原始 imageData 会得到乱码导致永远 NotFoundException。
 * 透明像素按白色背景合成，与识别画布补的静区底色一致。
 */
function toGrayscale(data: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const out = new Uint8ClampedArray(width * height);
  for (let px = 0, i = 0; px < out.length; px++, i += 4) {
    const a = data[i + 3] / 255;
    const r = data[i] * a + 255 * (1 - a);
    const g = data[i + 1] * a + 255 * (1 - a);
    const b = data[i + 2] * a + 255 * (1 - a);
    // ITU-R BT.601 亮度加权
    out[px] = 0.299 * r + 0.587 * g + 0.114 * b;
  }
  return out;
}

/** 支持的码制：覆盖常见一维码与主流二维码 */
function buildHints(zxing: ZXing, tryHarder: boolean): Map<number, unknown> {
  const { BarcodeFormat, DecodeHintType } = zxing;
  const hints = new Map<number, unknown>();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [
    BarcodeFormat.EAN_13,
    BarcodeFormat.EAN_8,
    BarcodeFormat.UPC_A,
    BarcodeFormat.UPC_E,
    BarcodeFormat.UPC_EAN_EXTENSION,
    BarcodeFormat.CODE_128,
    BarcodeFormat.CODE_93,
    BarcodeFormat.CODE_39,
    BarcodeFormat.ITF,
    BarcodeFormat.CODABAR,
    BarcodeFormat.RSS_14,
    BarcodeFormat.RSS_EXPANDED,
    BarcodeFormat.QR_CODE,
    BarcodeFormat.DATA_MATRIX,
    BarcodeFormat.PDF_417,
    BarcodeFormat.AZTEC,
  ]);
  hints.set(DecodeHintType.TRY_HARDER, tryHarder);
  hints.set(DecodeHintType.RETURN_CODABAR_START_END, false);
  hints.set(DecodeHintType.CHARACTER_SET, "UTF-8");
  return hints;
}

/** 对一份 RGBA 像素做一次解码，失败返回 null */
function decodeOnce(
  zxing: ZXing,
  data: Uint8ClampedArray,
  width: number,
  height: number,
  hints: Map<number, unknown>,
): Result | null {
  const source = new zxing.RGBLuminanceSource(toGrayscale(data, width, height), width, height);
  // HybridBinarizer 对多数图更准；失败时回退 GlobalHistogramBinarizer
  // （对比度极端或渐变背景时后者更稳）
  const Binarizers = [zxing.HybridBinarizer, zxing.GlobalHistogramBinarizer];
  for (const Binarizer of Binarizers) {
    try {
      const bitmap = new zxing.BinaryBitmap(new Binarizer(source));
      const reader = new zxing.MultiFormatReader();
      const res = reader.decode(bitmap, hints as never);
      if (res) return res;
    } catch {
      // 该二值化器未命中，尝试下一个
    }
  }
  return null;
}

interface Variant {
  scale: number;
  rotate: 0 | 90 | 180 | 270;
  invert: boolean;
}

const VARIANT_LABEL = (v: Variant) => {
  const parts: string[] = [];
  if (v.scale !== 1) parts.push(`${v.scale}×`);
  if (v.rotate) parts.push(`旋转 ${v.rotate}°`);
  if (v.invert) parts.push("反色");
  return parts.length ? parts.join(" · ") : "原图";
};

/** 单张变体最多连续识别多少个码 */
const MAX_PER_VARIANT = 12;
/** 深度扫描整体时间预算（毫秒） */
const TIME_BUDGET = 9000;

/** 把图片按给定倍率 / 旋转 / 反色渲染到画布 */
function renderVariant(img: HTMLImageElement, v: Variant): HTMLCanvasElement {
  const baseW = img.naturalWidth || img.width;
  const baseH = img.naturalHeight || img.height;
  const w = Math.max(1, Math.round(baseW * v.scale));
  const h = Math.max(1, Math.round(baseH * v.scale));

  // 静区（quiet zone）扩展：ZXing 对一维码要求条码四周有约 10 个模块宽的留白，
  // 否则极易 NotFound。这里在画布四周补一圈白边，保证即使原图没有静区也能识别。
  const margin = Math.max(32, Math.round(Math.max(w, h) * 0.15));

  const canvas = document.createElement("canvas");
  const swapped = v.rotate === 90 || v.rotate === 270;
  canvas.width = (swapped ? h : w) + margin * 2;
  canvas.height = (swapped ? w : h) + margin * 2;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return canvas;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((v.rotate * Math.PI) / 180);
  ctx.drawImage(img, -w / 2, -h / 2, w, h);

  if (v.invert) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "difference";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = "source-over";
    // 反色会把四周静区也一起翻成黑色，重新把边框填白，避免破坏留白
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, margin);
    ctx.fillRect(0, canvas.height - margin, canvas.width, margin);
    ctx.fillRect(0, 0, margin, canvas.height);
    ctx.fillRect(canvas.width - margin, 0, margin, canvas.height);
  }
  return canvas;
}

/** 用白色遮住已识别的区域，便于继续找图上的其他码 */
function maskResult(ctx: CanvasRenderingContext2D, result: Result, w: number, h: number): void {
  const points = result.getResultPoints() ?? [];
  ctx.save();
  ctx.fillStyle = "#ffffff";
  if (points.length === 0) {
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    return;
  }
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.getX());
    maxX = Math.max(maxX, p.getX());
    minY = Math.min(minY, p.getY());
    maxY = Math.max(maxY, p.getY());
  }
  const padX = Math.max(8, (maxX - minX) * 0.06);
  // 一维码的定位点落在同一条扫描线上，纵向要抹掉整条带才能避免重复命中
  const padY = maxY - minY < h * 0.08 ? h * 0.14 : Math.max(8, (maxY - minY) * 0.06);
  ctx.fillRect(
    Math.max(0, minX - padX),
    Math.max(0, minY - padY),
    Math.min(w, maxX - minX + padX * 2),
    Math.min(h, maxY - minY + padY * 2),
  );
  ctx.restore();
}

/** 在单张变体上反复解码（每命中一次就遮罩），返回本次得到的所有结果 */
function sweepVariant(
  zxing: ZXing,
  canvas: HTMLCanvasElement,
  v: Variant,
  hints: Map<number, unknown>,
  counter: { attempts: number },
): { results: RecognizedBarcode[]; hit: boolean } {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { results: [], hit: false };

  const found: RecognizedBarcode[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < MAX_PER_VARIANT; i++) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    counter.attempts++;
    const result = decodeOnce(zxing, imageData.data, canvas.width, canvas.height, hints);
    if (!result) break;

    const text = result.getText() ?? "";
    const rawFormat = result.getBarcodeFormat();
    const format = zxing.BarcodeFormat[rawFormat] ?? String(rawFormat);
    // UPC/EAN 附加码不带主码信息，单独出现时没有意义
    if (text && format !== "UPC_EAN_EXTENSION") {
      const key = `${format}:${text}`;
      if (!seen.has(key)) {
        seen.add(key);
        found.push({ text, format, formatLabel: formatLabel(format), via: VARIANT_LABEL(v) });
      }
    }
    maskResult(ctx, result, canvas.width, canvas.height);
  }
  return { results: found, hit: found.length > 0 };
}

/** 生成候选倍率：最长边放大到更易识别的尺寸，且不超过 4000px */
function scalesFor(img: HTMLImageElement): number[] {
  const long = Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height);
  const out: number[] = [1];
  for (const s of [2, 3, 4]) {
    if (long * s <= 4000) out.push(s);
  }
  return out;
}

/**
 * 识别一张图片里的所有条码 / 二维码。
 * 传入 File 或已加载的 HTMLImageElement 均可。
 */
export async function recognizeImage(source: File | HTMLImageElement): Promise<RecognizeOutcome> {
  let img: HTMLImageElement;
  try {
    img = source instanceof HTMLImageElement ? source : await loadImageFromFile(source);
  } catch {
    return { results: [], attempts: 0, error: "图片读取失败" };
  }

  const zxing = await loadZXing();
  const counter = { attempts: 0 };
  const seen = new Set<string>();
  const results: RecognizedBarcode[] = [];

  const collect = (batch: RecognizedBarcode[]) => {
    for (const r of batch) {
      const key = `${r.format}:${r.text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push(r);
    }
  };

  const scales = scalesFor(img);
  const run = (variants: Variant[], tryHarder: boolean) => {
    const hints = buildHints(zxing, tryHarder);
    let hit = false;
    for (const v of variants) {
      const canvas = renderVariant(img, v);
      const { results: batch, hit: variantHit } = sweepVariant(zxing, canvas, v, hints, counter);
      collect(batch);
      if (variantHit) hit = true;
      // 一条策略命中即停止本轮，避免无谓的耗时扫描
      if (variantHit) break;
    }
    return hit;
  };

  // 第一轮：快速扫描，原图与放大，不开 TRY_HARDER
  const quick: Variant[] = scales.map((scale) => ({ scale, rotate: 0, invert: false }));
  if (run(quick, false)) return { results, attempts: counter.attempts };

  // 第二轮：深度扫描，多倍率 × 旋转 × 反色，带时间预算
  const started = Date.now();
  const deep: Variant[] = [];
  for (const scale of scales) {
    for (const invert of [true, false]) {
      deep.push({ scale, rotate: 0, invert });
    }
  }
  for (const scale of scales) {
    for (const rotate of [90, 270, 180] as const) {
      deep.push({ scale, rotate, invert: false });
    }
  }
  for (const v of deep) {
    if (Date.now() - started > TIME_BUDGET) break;
    const hints = buildHints(zxing, true);
    const canvas = renderVariant(img, v);
    const { results: batch, hit } = sweepVariant(zxing, canvas, v, hints, counter);
    collect(batch);
    if (hit) break;
  }

  return {
    results,
    attempts: counter.attempts,
    error: results.length ? undefined : "未能识别到条码，试试裁剪出条码区域或换一张更清晰的图",
  };
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode failed"));
    };
    img.src = url;
  });
}

// ─── 摄像头实时扫描 ──────────────────────────────────────────

export interface CameraScanner {
  stop: () => void;
}

export interface CameraScanOptions {
  video: HTMLVideoElement;
  /** 指定摄像头；不传则优先使用后置摄像头 */
  deviceId?: string;
  onResult: (barcode: RecognizedBarcode) => void;
}

/** 列出可用的摄像头设备 */
export async function listCameras(): Promise<MediaDeviceInfo[]> {
  const zxing = await loadZXing();
  const reader = new zxing.BrowserMultiFormatReader();
  try {
    return await reader.listVideoInputDevices();
  } catch {
    return [];
  }
}

/** 开启摄像头持续扫描；返回的 stop() 必须调用以释放摄像头 */
export async function startCameraScan({
  video,
  deviceId,
  onResult,
}: CameraScanOptions): Promise<CameraScanner> {
  const zxing = await loadZXing();
  const reader = new zxing.BrowserMultiFormatReader(undefined, 250);
  reader.hints = buildHints(zxing, true) as never;

  await reader.decodeFromVideoDevice(deviceId ?? null, video, (result) => {
    if (!result) return;
    const text = result.getText() ?? "";
    if (!text) return;
    const rawFormat = result.getBarcodeFormat();
    const format = zxing.BarcodeFormat[rawFormat] ?? String(rawFormat);
    if (format === "UPC_EAN_EXTENSION") return;
    onResult({ text, format, formatLabel: formatLabel(format), via: "摄像头" });
  });

  return {
    stop: () => {
      reader.reset();
      const stream = video.srcObject;
      if (stream instanceof MediaStream) {
        for (const track of stream.getTracks()) track.stop();
      }
      video.srcObject = null;
    },
  };
}
