import { useState, useEffect } from "react";
import {
  Film,
  Download,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowLeftRight,
  Shuffle,
  Eraser,
  Loader2,
  TriangleAlert,
  Info,
} from "lucide-react";
// @ts-expect-error No type definitions available for gif.js
import GIF from "gif.js";
import { parseGIF, decompressFrames } from "gifuct-js";



import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadDropZone } from "@/components/ui/upload-dropzone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectedGif {
  file: File;
  url: string;
  name: string;
  width: number;
  height: number;
}

interface GifFrame {
  dataUrl: string;
  delay: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

const QUALITY_MAP: Record<string, number> = { high: 1, medium: 10, low: 20 };

export default function GifEditorPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedGif, setGeneratedGif] = useState("");
  const [selectedGif, setSelectedGif] = useState<SelectedGif | null>(null);
  const [frames, setFrames] = useState<GifFrame[]>([]);
  const [error, setError] = useState("");
  const [quality, setQuality] = useState("medium");

  useEffect(() => {
    return () => {
      if (selectedGif?.url) URL.revokeObjectURL(selectedGif.url);
      if (generatedGif) URL.revokeObjectURL(generatedGif);
    };
  }, [selectedGif, generatedGif]);

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth || 0, height: img.naturalHeight || 0 });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = URL.createObjectURL(file);
    });
  };

  const parseGifFrames = async (file: File, gifWidth: number, gifHeight: number) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const gif = parseGIF(arrayBuffer);
      // Try to get dimensions from lsd, fallback to passed-in values
      const w = gif?.lsd?.width || gifWidth || 0;
      const h = gif?.lsd?.height || gifHeight || 0;

      const decompressedFrames = decompressFrames(gif, true);
      const newFrames: GifFrame[] = [];

      for (const frame of decompressedFrames) {
        if (frame.dims.width <= 0 || frame.dims.height <= 0) continue;
        const canvas = document.createElement("canvas");
        canvas.width = w || frame.dims.width;
        canvas.height = h || frame.dims.height;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          const imageData = new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height);
          ctx.putImageData(imageData, frame.dims.left || 0, frame.dims.top || 0);
          newFrames.push({
            dataUrl: canvas.toDataURL("image/png"),
            delay: frame.delay,
            left: frame.dims.left || 0,
            top: frame.dims.top || 0,
            width: frame.dims.width,
            height: frame.dims.height,
          });
        }
      }
      setFrames(newFrames);

      const finalW = w || newFrames[0]?.width || 0;
      const finalH = h || newFrames[0]?.height || 0;
      setSelectedGif((prev) => prev ? { ...prev, width: finalW, height: finalH } : prev);
    } catch {
      setError("GIF 帧解析失败");
    }
  };

  const handleGifFile = async (file: File) => {
    setError("");
    if (file.type !== "image/gif") { setError("请上传 GIF 格式文件"); return; }
    if (file.size > 50 * 1024 * 1024) { setError("文件大小不能超过 50MB"); return; }
    clearAll();
    const url = URL.createObjectURL(file);
    // Get dimensions from Image element (more reliable than GIF parsing)
    const { width, height } = await getImageDimensions(file);
    setSelectedGif({ file, url, name: file.name, width, height });
    await parseGifFrames(file, width, height);
  };

  const removeFrame = (index: number) => setFrames((prev) => prev.filter((_, i) => i !== index));

  const clearAll = () => {
    if (selectedGif?.url) URL.revokeObjectURL(selectedGif.url);
    if (generatedGif) URL.revokeObjectURL(generatedGif);
    setSelectedGif(null);
    setFrames([]);
    setGeneratedGif("");
    setProgress(0);
    setError("");
  };

  const updateFrameDelay = (index: number, delay: number) => {
    if (!isNaN(delay) && delay >= 20) {
      setFrames((prev) => prev.map((f, i) => i === index ? { ...f, delay } : f));
    }
  };

  const moveFrameUp = () => {
    if (frames.length <= 1) return;
    const arr = [...frames]; const first = arr.shift();
    if (first) { arr.push(first); setFrames(arr); }
  };

  const moveFrameDown = () => {
    if (frames.length <= 1) return;
    const arr = [...frames]; const last = arr.pop();
    if (last) { arr.unshift(last); setFrames(arr); }
  };

  const reverseFrames = () => frames.length > 1 && setFrames((prev) => [...prev].reverse());

  const shuffleFrames = () => {
    if (frames.length <= 1) return;
    const shuffled = [...frames];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setFrames(shuffled);
  };

  const generateGif = async () => {
    if (!selectedGif || frames.length === 0) { setError("没有可用的帧"); return; }
    if (!selectedGif.width || !selectedGif.height) { setError("GIF 尺寸无效"); return; }
    setIsProcessing(true);
    setProgress(0);
    setError("");

    try {
      await new Promise<void>((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) { reject(new Error("无法获取 Canvas 上下文")); return; }
        canvas.width = selectedGif.width;
        canvas.height = selectedGif.height;

        const gif = new GIF({
          workers: 2, quality: QUALITY_MAP[quality],
          width: selectedGif.width, height: selectedGif.height,
          workerScript: "/gif.worker.js", transparent: 0x00000000,
        });

        const total = frames.length;
        let processed = 0;

        const processNext = (index: number) => {
          if (index >= frames.length) {
            if (processed === 0) { reject(new Error("没有可处理的帧")); return; }
            gif.on("finished", (blob: Blob) => {
              setGeneratedGif(URL.createObjectURL(blob));
              setProgress(100);
              resolve();
            });
            gif.on("abort", () => reject(new Error("已取消")));
            gif.on("error", (e: Error) => reject(new Error("生成错误: " + e.message)));
            try { gif.render(); } catch (e) { reject(new Error("渲染失败: " + (e as Error).message)); }
            return;
          }
          const img = new Image();
          img.onload = () => {
            try {
              if (img.width > 0 && img.height > 0) {
                ctx.drawImage(img, 0, 0);
                gif.addFrame(canvas, { copy: true, delay: frames[index].delay });
                processed++;
                setProgress(Math.round((processed / total) * 100));
              }
            } catch { /* skip */ }
            processNext(index + 1);
          };
          img.onerror = () => processNext(index + 1);
          img.src = frames[index].dataUrl;
        };
        processNext(0);
      });
    } catch (e) {
      setError((e as Error).message || "生成失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadGif = () => {
    if (!generatedGif) return;
    const a = document.createElement("a");
    a.href = generatedGif; a.download = `edited-gif-${Date.now()}.gif`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <>
            <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

          {/* Upload */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <UploadDropZone
              accept="image/gif"
              maxSize={50 * 1024 * 1024}
              onError={setError}
              onFiles={(files) => files[0] && handleGifFile(files[0])}
              className="rounded-lg"
              emptyHint="点击或拖拽上传 GIF 文件"
              emptySubHint="最大 50MB"
            />

            {/* Settings */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-muted-foreground">质量</Label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {selectedGif && (
                <span className="text-xs text-muted-foreground">原始尺寸: {selectedGif.width}×{selectedGif.height}</span>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              <TriangleAlert className="size-4 shrink-0" />{error}
            </div>
          )}

          {/* Preview & Frames */}
          {selectedGif && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4">
                <Label className="text-sm font-medium mb-3 block">原始 GIF</Label>
                <div className="flex items-center justify-center h-64 rounded-lg border border-border bg-muted">
                  <img src={selectedGif.url} alt={selectedGif.name} className="max-h-full max-w-full object-contain" />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">帧列表 ({frames.length})</Label>
                  <div className="flex flex-wrap gap-1">
                    <Button variant="outline" size="sm" onClick={moveFrameUp} disabled={frames.length <= 1}><ChevronUp className="size-3.5" /></Button>
                    <Button variant="outline" size="sm" onClick={moveFrameDown} disabled={frames.length <= 1}><ChevronDown className="size-3.5" /></Button>
                    <Button variant="outline" size="sm" onClick={reverseFrames} disabled={frames.length <= 1}><ArrowLeftRight className="size-3.5" /></Button>
                    <Button variant="outline" size="sm" onClick={shuffleFrames} disabled={frames.length <= 1}><Shuffle className="size-3.5" /></Button>
                  </div>
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {frames.map((frame, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 border border-border rounded-lg">
                      <div className="w-12 h-12 shrink-0 rounded overflow-hidden border border-border">
                        <img src={frame.dataUrl} alt={`帧 ${index + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs text-muted-foreground w-12">帧 {index + 1}</span>
                      <div className="flex items-center gap-1">
                        <Input type="number" value={frame.delay} onChange={(e) => updateFrameDelay(index, Number(e.target.value))} min={20} max={5000} step={10} className="h-8 w-16 text-xs" />
                        <span className="text-xs text-muted-foreground">ms</span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeFrame(index)} className="ml-auto text-red-500 hover:text-red-600"><Trash2 className="size-3.5" /></Button>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button onClick={generateGif} disabled={frames.length === 0 || isProcessing} className="flex-1">
                    {isProcessing ? <><Loader2 className="size-4 animate-spin" /> 生成中... {progress}%</> : <><Film className="size-4" /> 生成 GIF</>}
                  </Button>
                  <Button variant="outline" onClick={clearAll}><Eraser className="size-4" /> 清空</Button>
                </div>
              </div>
            </div>
          )}

          {/* Result */}
          {generatedGif && (
            <div className="rounded-xl border border-border bg-card p-5">
              <Label className="text-sm font-medium mb-3 block">生成结果</Label>
              <div className="text-center">
                <img src={generatedGif} alt="生成的 GIF" className="max-w-full h-auto mx-auto rounded-lg mb-4" style={{ maxHeight: "400px" }} />
                <div className="flex justify-center gap-2">
                  <Button onClick={downloadGif}><Download className="size-4" /> 下载 GIF</Button>
                  <Button variant="outline" onClick={clearAll}>重新开始</Button>
                </div>
              </div>
            </div>
          )}

          {/* How to use */}
          <div className="rounded-xl border border-border bg-muted p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="size-4 text-muted-foreground" />
              <Label className="text-sm font-medium">使用说明</Label>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
              <li>上传一个 GIF 文件（支持拖拽和粘贴）</li>
              <li>查看解析出的所有帧，可调整每帧的延迟时间</li>
              <li>使用上移、下移、反转、打乱等操作调整帧顺序</li>
              <li>删除不需要的帧后点击生成 GIF</li>
            </ol>
          </div>
        </div>
      </div>
          </>
  );
}
