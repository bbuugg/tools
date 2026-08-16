import { useState, useEffect } from "react";
import {
  ImagePlus,
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
  Film,
} from "lucide-react";
// @ts-expect-error No type definitions available for gif.js
import GIF from "gif.js";



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

interface SelectedImage {
  id: string;
  file: File;
  url: string;
  name: string;
  delay: number;
}

const QUALITY_MAP: Record<string, number> = { high: 1, medium: 10, low: 20 };

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function ImageToGifPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedGif, setGeneratedGif] = useState("");
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [error, setError] = useState("");
  const [width, setWidth] = useState(300);
  const [quality, setQuality] = useState("medium");
  const [loopCount, setLoopCount] = useState(0);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.url));
      if (generatedGif) URL.revokeObjectURL(generatedGif);
    };
  }, []);

  const addImageFiles = (files: File[]) => {
    const newImages: SelectedImage[] = files
      .filter((f) => f.type.startsWith("image/"))
      .map((file) => ({ id: Math.random().toString(36).substr(2, 9), file, url: URL.createObjectURL(file), name: file.name, delay: 1.0 }));
    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
      setError("");
    }
  };

  const removeImage = (id: string) => {
    const img = images.find((i) => i.id === id);
    if (img) URL.revokeObjectURL(img.url);
    setImages((prev) => prev.filter((i) => i.id !== id));
  };

  const clearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.url));
    setImages([]);
    if (generatedGif) { URL.revokeObjectURL(generatedGif); setGeneratedGif(""); }
    setProgress(0);
    setError("");
  };

  const updateDelay = (id: string, delay: number) => {
    setImages((prev) => prev.map((img) => img.id === id ? { ...img, delay: isNaN(delay) ? 0 : delay } : img));
  };

  const moveUp = () => { if (images.length <= 1) return; const arr = [...images]; const f = arr.shift(); if (f) { arr.push(f); setImages(arr); } };
  const moveDown = () => { if (images.length <= 1) return; const arr = [...images]; const l = arr.pop(); if (l) { arr.unshift(l); setImages(arr); } };
  const reverseImages = () => images.length > 1 && setImages((prev) => [...prev].reverse());
  const shuffleImages = () => {
    if (images.length <= 1) return;
    const s = [...images];
    for (let i = s.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [s[i], s[j]] = [s[j], s[i]]; }
    setImages(s);
  };

  const generateGif = async () => {
    if (images.length === 0) { setError("请先添加图片"); return; }
    setIsProcessing(true);
    setProgress(0);
    setError("");

    try {
      await new Promise<void>((resolve, reject) => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("无法获取 Canvas 上下文")); return; }
        canvas.width = width;
        canvas.height = width;

        const gif = new GIF({ workers: 2, quality: QUALITY_MAP[quality], width: canvas.width, height: canvas.height, workerScript: "/gif.worker.js" });

        const total = images.length;
        let processed = 0;

        const processNext = (index: number) => {
          if (index >= images.length) {
            if (processed === 0) { reject(new Error("没有可处理的图片")); return; }
            gif.on("finished", (blob: Blob) => { setGeneratedGif(URL.createObjectURL(blob)); setProgress(100); resolve(); });
            gif.on("abort", () => reject(new Error("已取消")));
            gif.on("error", (e: Error) => reject(new Error("生成错误: " + e.message)));
            try { gif.render(); } catch (e) { reject(new Error("渲染失败: " + (e as Error).message)); }
            return;
          }
          const img = new Image();
          img.onload = () => {
            try {
              const aspect = img.height / img.width;
              canvas.height = Math.round(canvas.width * aspect);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              gif.addFrame(canvas, { copy: true, delay: Math.round(images[index].delay * 1000) });
              processed++;
              setProgress(Math.round((processed / total) * 100));
            } catch { /* skip */ }
            processNext(index + 1);
          };
          img.onerror = () => processNext(index + 1);
          img.src = images[index].url;
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
    a.href = generatedGif; a.download = `image-to-gif-${Date.now()}.gif`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <>
            <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

          {/* Upload & Settings */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <UploadDropZone
              multiple
              accept="image/*"
              onFiles={addImageFiles}
              className="rounded-lg"
              emptyHint="点击或拖拽上传多张图片"
              emptySubHint="可多选"
              icon={<ImagePlus className="size-10 opacity-40" />}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">宽度 (px)</Label>
                <Input type="number" value={width} onChange={(e) => { const v = e.target.value; setWidth(v === "" ? 0 : Number(v)); }} onBlur={() => { if (!width || width < 100) setWidth(100); if (width > 800) setWidth(800); }} min={100} max={800} className="h-9" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">质量</Label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">高</SelectItem>
                    <SelectItem value="medium">中</SelectItem>
                    <SelectItem value="low">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">循环次数 (0=无限)</Label>
                <Input type="number" value={loopCount} onChange={(e) => setLoopCount(Number(e.target.value))} min={0} max={100} className="h-9" />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              <TriangleAlert className="size-4 shrink-0" />{error}
            </div>
          )}

          {/* Image List */}
          {images.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">已选图片 ({images.length})</Label>
                <div className="flex flex-wrap gap-1">
                  <Button variant="outline" size="sm" onClick={moveUp} disabled={images.length <= 1}><ChevronUp className="size-3.5" /></Button>
                  <Button variant="outline" size="sm" onClick={moveDown} disabled={images.length <= 1}><ChevronDown className="size-3.5" /></Button>
                  <Button variant="outline" size="sm" onClick={reverseImages} disabled={images.length <= 1}><ArrowLeftRight className="size-3.5" /></Button>
                  <Button variant="outline" size="sm" onClick={shuffleImages} disabled={images.length <= 1}><Shuffle className="size-3.5" /></Button>
                </div>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {images.map((img) => (
                  <div key={img.id} className="flex items-center gap-3 p-2 border border-border rounded-lg">
                    <div className="w-12 h-12 shrink-0 rounded overflow-hidden border border-border">
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{img.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(img.file.size)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Input type="number" value={img.delay} onChange={(e) => { const v = e.target.value; updateDelay(img.id, v === "" ? 0 : Number(v)); }} onBlur={() => { if (!img.delay || img.delay <= 0) updateDelay(img.id, 0.1); if (img.delay > 10) updateDelay(img.id, 10); }} min={0.1} max={10} step={0.1} className="h-8 w-16 text-xs" />
                      <span className="text-xs text-muted-foreground">s</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeImage(img.id)} className="text-red-500 hover:text-red-600"><Trash2 className="size-3.5" /></Button>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Button onClick={generateGif} disabled={isProcessing} className="flex-1">
                  {isProcessing ? <><Loader2 className="size-4 animate-spin" /> 生成中... {progress}%</> : <><Film className="size-4" /> 生成 GIF</>}
                </Button>
                <Button variant="outline" onClick={clearAll}><Eraser className="size-4" /> 清空</Button>
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

          {/* Tips */}
          <div className="rounded-xl border border-border bg-muted p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="size-4 text-muted-foreground" />
              <Label className="text-sm font-medium">使用说明</Label>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
              <li>上传多张图片（支持拖拽、粘贴、多选）</li>
              <li>设置 GIF 宽度、质量和循环次数</li>
              <li>调整每张图片的显示时间（秒）</li>
              <li>可使用上移、下移、反转、打乱调整顺序</li>
              <li>点击生成 GIF 并下载</li>
            </ol>
          </div>
        </div>
      </div>
          </>
  );
}
