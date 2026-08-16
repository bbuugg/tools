import { useState, useRef } from "react";
import {
  Stamp,
  Upload,
  Download,
  Eraser,
  Eye,
  Trash2,
  X,
} from "lucide-react";
import JSZip from "jszip";



import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ColorPickerField } from "@/components/ui/color-picker-field";
import { UploadDropZone } from "@/components/ui/upload-dropzone";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProcessedImage {
  id: string; file: File; name: string; preview: string;
  originalSize: number; dimensions: { width: number; height: number };
  status: "pending" | "processing" | "completed" | "error";
  processedBlob?: Blob; processedUrl?: string;
}

const formatSize = (b: number) => {
  if (b === 0) return "0 B";
  const k = 1024; const i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(1)) + " " + ["B", "KB", "MB", "GB"][i];
};

const getDims = (file: File): Promise<{ width: number; height: number }> =>
  new Promise((res, rej) => { const img = new Image(); img.onload = () => res({ width: img.width, height: img.height }); img.onerror = rej; img.src = URL.createObjectURL(file); });

export default function ImageWatermarkPage() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [wmType, setWmType] = useState<"text" | "image">("text");
  const [wmText, setWmText] = useState("Watermark");
  const [fontSize, setFontSize] = useState(24);
  const [color, setColor] = useState("#ffffff");
  const [fontFamily, setFontFamily] = useState("Arial");
  const [wmImage, setWmImage] = useState<string>("");
  const [wmWidth, setWmWidth] = useState(100);
  const [opacity, setOpacity] = useState(80);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState("bottom-right");
  const [margin, setMargin] = useState(20);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewItem, setPreviewItem] = useState<ProcessedImage | null>(null);
  const wmFileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      const dims = await getDims(file);
      const preview = await new Promise<string>((res) => { const r = new FileReader(); r.onload = (e) => res(e.target?.result as string); r.readAsDataURL(file); });
      setImages((p) => [...p, { id: Math.random().toString(36).substr(2, 9), file, name: file.name, preview, originalSize: file.size, dimensions: dims, status: "pending" }]);
    }
  };

  const getCoords = (cw: number, ch: number, w: number, h: number) => {
    const m = margin;
    const map: Record<string, [number, number]> = {
      "top-left": [m, m], "top-center": [(w - cw) / 2, m], "top-right": [w - cw - m, m],
      "center-left": [m, (h - ch) / 2], "center": [(w - cw) / 2, (h - ch) / 2], "center-right": [w - cw - m, (h - ch) / 2],
      "bottom-left": [m, h - ch - m], "bottom-center": [(w - cw) / 2, h - ch - m], "bottom-right": [w - cw - m, h - ch - m],
    };
    return map[position] || [w - cw - m, h - ch - m];
  };

  const processOne = async (id: string) => {
    const img = images.find((i) => i.id === id);
    if (!img) return;
    setImages((p) => p.map((i) => i.id === id ? { ...i, status: "processing" } : i));
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const mainImg = new Image();
      await new Promise((res) => { mainImg.onload = res; mainImg.src = img.preview; });
      canvas.width = mainImg.width; canvas.height = mainImg.height;
      ctx.drawImage(mainImg, 0, 0);

      const alpha = opacity / 100;
      if (wmType === "text") {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = color;
        ctx.textBaseline = "top";
        const tw = ctx.measureText(wmText).width;
        const [x, y] = getCoords(tw, fontSize, canvas.width, canvas.height);
        ctx.translate(x + tw / 2, y + fontSize / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.fillText(wmText, -tw / 2, -fontSize / 2);
        ctx.restore();
      } else if (wmType === "image" && wmImage) {
        const wmImg = new Image();
        await new Promise((res) => { wmImg.onload = res; wmImg.src = wmImage; });
        const wmH = (wmImg.height / wmImg.width) * wmWidth;
        const [x, y] = getCoords(wmWidth, wmH, canvas.width, canvas.height);
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(x + wmWidth / 2, y + wmH / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(wmImg, -wmWidth / 2, -wmH / 2, wmWidth, wmH);
        ctx.restore();
      }

      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), img.file.type));
      const url = URL.createObjectURL(blob);
      setImages((p) => p.map((i) => i.id === id ? { ...i, status: "completed", processedBlob: blob, processedUrl: url } : i));
    } catch {
      setImages((p) => p.map((i) => i.id === id ? { ...i, status: "error" } : i));
    }
  };

  const processAll = async () => {
    setIsProcessing(true);
    for (const img of images.filter((i) => i.status === "pending" || i.status === "error")) await processOne(img.id);
    setIsProcessing(false);
  };

  const handleDownload = (id: string) => {
    const img = images.find((i) => i.id === id);
    if (!img?.processedBlob) return;
    const url = URL.createObjectURL(img.processedBlob);
    const a = document.createElement("a"); a.href = url;
    const n = img.name.substring(0, img.name.lastIndexOf(".")); const ext = img.name.split(".").pop();
    a.download = `${n}_watermarked.${ext}`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = async () => {
    const done = images.filter((i) => i.status === "completed" && i.processedBlob);
    if (!done.length) return;
    const zip = new JSZip();
    done.forEach((i) => { const n = i.name.substring(0, i.name.lastIndexOf(".")); const ext = i.name.split(".").pop(); zip.file(`${n}_watermarked.${ext}`, i.processedBlob!); });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `watermarked_${Date.now()}.zip`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
            <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

          {/* Upload */}
          <UploadDropZone
            multiple
            accept="image/*"
            onFiles={handleUpload}
            className="rounded-xl"
            emptyHint="点击或拖拽图片到此处"
            emptySubHint="支持 PNG, JPG, WebP"
          />

          {/* Options */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">水印类型</Label>
              <div className="flex gap-2">
                <Button variant={wmType === "text" ? "default" : "outline"} size="sm" onClick={() => setWmType("text")}>文字水印</Button>
                <Button variant={wmType === "image" ? "default" : "outline"} size="sm" onClick={() => setWmType("image")}>图片水印</Button>
              </div>
            </div>

            {wmType === "text" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="col-span-2"><Label className="text-xs text-muted-foreground mb-1 block">文字内容</Label><Input value={wmText} onChange={(e) => setWmText(e.target.value)} /></div>
                <div><Label className="text-xs text-muted-foreground mb-1 block">字号</Label><Input type="number" min={10} max={200} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} /></div>
                <div><Label className="text-xs text-muted-foreground mb-1 block">颜色</Label><ColorPickerField value={color} onChange={setColor} /></div>
                <div className="col-span-2"><Label className="text-xs text-muted-foreground mb-1 block">字体</Label><Select value={fontFamily} onValueChange={setFontFamily}><SelectTrigger className="h-9"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Arial">Arial</SelectItem><SelectItem value="Verdana">Verdana</SelectItem><SelectItem value="Times New Roman">Times New Roman</SelectItem><SelectItem value="Courier New">Courier New</SelectItem></SelectContent></Select></div>
              </div>
            )}

            {wmType === "image" && (
              <div>
                <input ref={wmFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = (ev) => setWmImage(ev.target?.result as string); r.readAsDataURL(f); } }} />
                {!wmImage ? (
                  <Button variant="outline" size="sm" onClick={() => wmFileRef.current?.click()}><Upload className="size-3.5" /> 选择水印图片</Button>
                ) : (
                  <div className="flex items-center gap-3">
                    <img src={wmImage} alt="" className="h-16 object-contain rounded border border-border" />
                    <Button variant="ghost" size="sm" onClick={() => setWmImage("")}><X className="size-3" /> 移除</Button>
                    <div className="flex-1"><Label className="text-xs text-muted-foreground mb-1 block">宽度 (px)</Label><Input type="number" min={20} max={1000} value={wmWidth} onChange={(e) => setWmWidth(Number(e.target.value))} /></div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">位置</Label>
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top-left">左上</SelectItem><SelectItem value="top-center">上中</SelectItem><SelectItem value="top-right">右上</SelectItem>
                    <SelectItem value="center-left">左中</SelectItem><SelectItem value="center">居中</SelectItem><SelectItem value="center-right">右中</SelectItem>
                    <SelectItem value="bottom-left">左下</SelectItem><SelectItem value="bottom-center">下中</SelectItem><SelectItem value="bottom-right">右下</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs text-muted-foreground mb-1 block">边距 (px)</Label><Input type="number" min={0} max={500} value={margin} onChange={(e) => setMargin(Number(e.target.value))} /></div>
              <div><Label className="text-xs text-muted-foreground mb-1 block">透明度: {opacity}%</Label><Slider min={0} max={100} value={[opacity]} onValueChange={(v) => setOpacity(v[0])} className="mt-2" /></div>
              <div><Label className="text-xs text-muted-foreground mb-1 block">旋转: {rotation}°</Label><Slider min={0} max={360} value={[rotation]} onValueChange={(v) => setRotation(v[0])} className="mt-2" /></div>
            </div>
          </div>

          {images.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">{images.length} 张图片</span>
                <div className="flex gap-2">
                  <Button size="sm" onClick={processAll} disabled={isProcessing}><Stamp className="size-3.5" /> {isProcessing ? "处理中..." : "全部处理"}</Button>
                  <Button variant="outline" size="sm" onClick={handleDownloadAll}><Download className="size-3.5" /> 下载全部</Button>
                  <Button variant="outline" size="sm" onClick={() => setImages([])}><Eraser className="size-3.5" /> 清空</Button>
                </div>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {images.map((img) => (
                  <div key={img.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <img src={img.preview} alt="" className="w-14 h-14 object-cover rounded shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{img.name}</p>
                      <p className="text-xs text-muted-foreground">{img.dimensions.width}×{img.dimensions.height} · {formatSize(img.originalSize)}</p>
                      {img.status === "completed" && <p className="text-xs text-green-600 mt-0.5">已完成</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon-xs" onClick={() => processOne(img.id)} disabled={isProcessing}><Stamp className="size-3.5" /></Button>
                      <Button variant="ghost" size="icon-xs" onClick={() => setPreviewItem(img)} disabled={img.status !== "completed"}><Eye className="size-3.5" /></Button>
                      <Button variant="ghost" size="icon-xs" onClick={() => handleDownload(img.id)} disabled={img.status !== "completed"}><Download className="size-3.5" /></Button>
                      <Button variant="ghost" size="icon-xs" onClick={() => setImages((p) => p.filter((i) => i.id !== img.id))}><Trash2 className="size-3.5 text-red-400" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Dialog open={!!previewItem} onOpenChange={(o) => { if (!o) setPreviewItem(null); }}>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>预览</DialogTitle></DialogHeader>
              {previewItem?.processedUrl && (
                <div className="flex justify-center bg-muted rounded-lg border p-4">
                  <img src={previewItem.processedUrl} alt="" className="max-w-full max-h-[60vh] object-contain" />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
          </>
  );
}
