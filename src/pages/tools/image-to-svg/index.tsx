import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { UploadDropZone } from "@/components/ui/upload-dropzone";
import {
  Copy,
  Download,
  Eraser,
  Loader2,
  Wand2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
// @ts-expect-error — imagetracerjs has no type definitions
import ImageTracer from "imagetracerjs";

/** 预设方案 */
const PRESETS = [
  { value: "default", label: "默认" },
  { value: "posterized1", label: "海报化 (2色)" },
  { value: "posterized2", label: "海报化 (4色)" },
  { value: "posterized3", label: "海报化 (3色蓝白)" },
  { value: "curvy", label: "曲线" },
  { value: "sharp", label: "锐利" },
  { value: "detailed", label: "细节 (64色)" },
  { value: "smoothed", label: "平滑" },
  { value: "grayscale", label: "灰度 (7色)" },
  { value: "artistic1", label: "艺术 1" },
  { value: "artistic2", label: "艺术 2" },
  { value: "artistic3", label: "艺术 3" },
  { value: "artistic4", label: "艺术 4" },
] as const;

interface SvgResult {
  svg: string;
  blob: Blob;
  url: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageToSvgPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("image");
  const [originalSize, setOriginalSize] = useState(0);
  const [preset, setPreset] = useState<string>("default");
  const [numColors, setNumColors] = useState(16);
  const [blurRadius, setBlurRadius] = useState(0);
  const [pathOmit, setPathOmit] = useState(8);
  const [scale, setScale] = useState(1);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<SvgResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"preview" | "code">("preview");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const handleUpload = useCallback((files: File[]) => {
    const file = files[0];
    if (!file) return;
    setFileName(file.name.split(".")[0] || "image");
    setOriginalSize(file.size);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // 加载图片到 canvas
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;
      // 限制最大尺寸以提高性能
      const maxDim = 800;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = maxDim / Math.max(width, height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const convert = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setIsConverting(true);
    setResult(null);

    // 使用 setTimeout 让 UI 有时间更新到加载状态
    await new Promise((r) => setTimeout(r, 50));

    try {
      const ctx = canvas.getContext("2d")!;
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const options =
        preset !== "default"
          ? {
              ...ImageTracer.optionpresets[preset],
              numberofcolors: numColors,
              blurradius: blurRadius,
              pathomit: pathOmit,
              scale: scale,
              viewbox: true,
            }
          : {
              numberofcolors: numColors,
              blurradius: blurRadius,
              pathomit: pathOmit,
              scale: scale,
              viewbox: true,
            };

      const svgStr = ImageTracer.imagedataToSVG(imgData, options);
      const blob = new Blob([svgStr], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      setResult({ svg: svgStr, blob, url });
    } catch {
      // 忽略转换错误
    } finally {
      setIsConverting(false);
    }
  }, [preset, numColors, blurRadius, pathOmit, scale]);

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `${fileName}.svg`;
    a.click();
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.svg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 忽略
    }
  };

  const handleReset = () => {
    setImageSrc(null);
    setResult(null);
    setFileName("image");
    setOriginalSize(0);
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {!imageSrc ? (
          <UploadDropZone
            accept="image/png,image/jpeg,image/jpg,image/gif,image/bmp,image/webp"
            onFiles={handleUpload}
            className="rounded-xl h-[280px]"
            emptyHint="点击上传或粘贴图片"
            emptySubHint="支持 PNG, JPG, GIF, BMP, WebP（最大 10MB）"
          />
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {/* 原图预览 */}
            <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">原始图片</Label>
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <X className="size-3.5" /> 移除
                </Button>
              </div>
              <div className="flex items-center justify-center bg-muted rounded-lg overflow-hidden" style={{ minHeight: "300px" }}>
                <img src={imageSrc} alt="原图" className="max-w-full max-h-[400px] object-contain" />
              </div>
              {/* 隐藏的 canvas，用于获取 ImageData */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* 参数面板 */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">预设方案</Label>
                <Select value={preset} onValueChange={setPreset}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESETS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  颜色数量: {numColors}
                </Label>
                <Slider
                  min={2}
                  max={128}
                  value={[numColors]}
                  onValueChange={(v) => setNumColors(v[0])}
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  模糊半径: {blurRadius}
                </Label>
                <Slider
                  min={0}
                  max={5}
                  value={[blurRadius]}
                  onValueChange={(v) => setBlurRadius(v[0])}
                />
                <p className="text-[10px] text-muted-foreground mt-1">预处理高斯模糊，可减少噪点</p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  路径过滤: {pathOmit}
                </Label>
                <Slider
                  min={0}
                  max={50}
                  value={[pathOmit]}
                  onValueChange={(v) => setPathOmit(v[0])}
                />
                <p className="text-[10px] text-muted-foreground mt-1">丢弃短于此值的路径以降噪</p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  缩放比例: {scale}x
                </Label>
                <Slider
                  min={1}
                  max={10}
                  value={[scale]}
                  onValueChange={(v) => setScale(v[0])}
                />
              </div>

              <Button
                className="w-full"
                onClick={convert}
                disabled={isConverting}
              >
                {isConverting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Wand2 className="size-4" />
                )}
                {isConverting ? "转换中..." : "转换为 SVG"}
              </Button>
            </div>
          </div>
        )}

        {/* 结果区域 */}
        {result && (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium">转换结果</Label>
                <span className="text-xs text-muted-foreground">
                  原始: {formatSize(originalSize)} → SVG: {formatSize(result.blob.size)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={view === "preview" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("preview")}
                >
                  预览
                </Button>
                <Button
                  variant={view === "code" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setView("code")}
                >
                  代码
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="size-3.5" />
                  {copied ? "已复制" : "复制"}
                </Button>
                <Button size="sm" onClick={handleDownload}>
                  <Download className="size-3.5" /> 下载 SVG
                </Button>
                <Button variant="outline" size="sm" onClick={() => setResult(null)}>
                  <Eraser className="size-3.5" /> 清除
                </Button>
              </div>
            </div>

            {view === "preview" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2 text-center">原图</p>
                  <div className="flex items-center justify-center bg-muted rounded-lg overflow-hidden border border-border" style={{ minHeight: "300px" }}>
                    {imageSrc && (
                      <img src={imageSrc} alt="原图" className="max-w-full max-h-[400px] object-contain" />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2 text-center">SVG 矢量图</p>
                  <div
                    className="flex items-center justify-center bg-muted rounded-lg overflow-hidden border border-border"
                    style={{ minHeight: "300px" }}
                    dangerouslySetInnerHTML={{ __html: result.svg }}
                  />
                </div>
              </div>
            ) : (
              <Textarea
                readOnly
                value={result.svg}
                className="font-mono text-xs h-[400px] resize-none"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
