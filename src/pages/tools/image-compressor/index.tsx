import { useMemo, useState } from "react";
import {
  ImageDown,
  Download,
  Eraser,
  Zap,
  Eye,
  Trash2,
} from "lucide-react";
import JSZip from "jszip";



import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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

interface ImageItem {
  id: string; file: File; name: string; preview: string;
  originalSize: number; compressedSize?: number;
  dimensions: { width: number; height: number };
  status: "pending" | "compressing" | "completed" | "error";
  progress: number; savedPercentage?: number; compressedBlob?: Blob;
}

const formatSize = (b: number) => {
  if (b === 0) return "0 B";
  const k = 1024; const i = Math.floor(Math.log(b) / Math.log(k));
  return parseFloat((b / Math.pow(k, i)).toFixed(1)) + " " + ["B", "KB", "MB", "GB"][i];
};

const getDims = (file: File): Promise<{ width: number; height: number }> =>
  new Promise((res, rej) => { const img = new Image(); img.onload = () => res({ width: img.width, height: img.height }); img.onerror = rej; img.src = URL.createObjectURL(file); });

export default function ImageCompressorPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState("original");
  const [maxWidth, setMaxWidth] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [previewItem, setPreviewItem] = useState<ImageItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const stats = useMemo(() => {
    const done = images.filter((i) => i.status === "completed");
    const orig = done.reduce((s, i) => s + i.originalSize, 0);
    const comp = done.reduce((s, i) => s + (i.compressedSize || 0), 0);
    return { orig, comp, saved: orig > 0 ? Math.round(((orig - comp) / orig) * 100) : 0 };
  }, [images]);

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      const dims = await getDims(file);
      setImages((p) => [...p, { id: Math.random().toString(36).substr(2, 9), file, name: file.name, preview: URL.createObjectURL(file), originalSize: file.size, dimensions: dims, status: "pending", progress: 0 }]);
    }
  };

  const compressOne = async (id: string) => {
    const img = images.find((i) => i.id === id);
    if (!img) return;
    setImages((p) => p.map((i) => i.id === id ? { ...i, status: "compressing" } : i));
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;
      const image = new Image();
      await new Promise((res) => { image.onload = res; image.src = img.preview; });
      let { width, height } = img.dimensions;
      if (maxWidth && width > maxWidth) { height = (height * maxWidth) / width; width = maxWidth; }
      canvas.width = width; canvas.height = height;
      ctx.drawImage(image, 0, 0, width, height);
      const mime = outputFormat === "original" ? img.file.type : `image/${outputFormat === "jpg" ? "jpeg" : outputFormat}`;
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b!), mime, quality / 100));
      setImages((p) => p.map((i) => i.id === id ? { ...i, status: "completed", compressedBlob: blob, compressedSize: blob.size, savedPercentage: Math.round(((i.originalSize - blob.size) / i.originalSize) * 100) } : i));
    } catch {
      setImages((p) => p.map((i) => i.id === id ? { ...i, status: "error" } : i));
    }
  };

  const compressAll = async () => {
    setIsCompressing(true);
    for (const img of images.filter((i) => i.status === "pending" || i.status === "error")) {
      await compressOne(img.id);
    }
    setIsCompressing(false);
  };

  const handleDownload = (id: string) => {
    const img = images.find((i) => i.id === id);
    if (!img?.compressedBlob) return;
    const url = URL.createObjectURL(img.compressedBlob);
    const a = document.createElement("a"); a.href = url;
    const ext = outputFormat === "original" ? img.name.split(".").pop() : outputFormat;
    a.download = `${img.name.substring(0, img.name.lastIndexOf("."))}.${ext}`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = async () => {
    const done = images.filter((i) => i.status === "completed" && i.compressedBlob);
    if (!done.length) return;
    const zip = new JSZip();
    done.forEach((i) => { const ext = outputFormat === "original" ? i.name.split(".").pop() : outputFormat; const n = i.name.substring(0, i.name.lastIndexOf(".")); zip.file(`${n}.${ext}`, i.compressedBlob!); });
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `compressed_${Date.now()}.zip`; a.click();
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
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label className="text-xs text-gray-500 mb-2 block">压缩质量: {quality}%</Label>
                <Slider min={10} max={95} value={[quality]} onValueChange={(v) => setQuality(v[0])} />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-2 block">输出格式</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="original">保持原格式</SelectItem><SelectItem value="jpg">JPG</SelectItem><SelectItem value="png">PNG</SelectItem><SelectItem value="webp">WebP</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-2 block">最大宽度 (px)</Label>
                <Input type="number" min={100} value={maxWidth ?? ""} onChange={(e) => setMaxWidth(e.target.value ? Number(e.target.value) : null)} placeholder="不限制" />
              </div>
            </div>
          </div>

          {images.length > 0 && (
            <>
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">{images.length} 张图片</span>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={compressAll} disabled={isCompressing}><Zap className="size-3.5" /> {isCompressing ? "压缩中..." : "全部压缩"}</Button>
                    <Button variant="outline" size="sm" onClick={handleDownloadAll}><Download className="size-3.5" /> 下载全部</Button>
                    <Button variant="outline" size="sm" onClick={() => setImages([])}><Eraser className="size-3.5" /> 清空</Button>
                  </div>
                </div>
                {stats.orig > 0 && (
                  <div className="grid grid-cols-3 gap-4 mb-4 p-3 rounded-lg bg-green-50 border border-green-100">
                    <div className="text-center"><div className="text-lg font-bold text-green-600">{formatSize(stats.orig)}</div><div className="text-xs text-gray-400">原始大小</div></div>
                    <div className="text-center"><div className="text-lg font-bold text-green-600">{formatSize(stats.comp)}</div><div className="text-xs text-gray-400">压缩后</div></div>
                    <div className="text-center"><div className="text-lg font-bold text-green-600">-{stats.saved}%</div><div className="text-xs text-gray-400">节省</div></div>
                  </div>
                )}
                <div className="space-y-2">
                  {images.map((img) => (
                    <div key={img.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-purple-200">
                      <img src={img.preview} alt="" className="w-14 h-14 object-cover rounded shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{img.name}</p>
                        <p className="text-xs text-gray-400">{img.dimensions.width}×{img.dimensions.height} · {formatSize(img.originalSize)}</p>
                        {img.status === "completed" && <p className="text-xs text-green-600 mt-0.5">压缩后: {formatSize(img.compressedSize!)} (-{img.savedPercentage}%)</p>}
                        {img.status === "error" && <p className="text-xs text-red-500 mt-0.5">压缩失败</p>}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon-xs" onClick={() => compressOne(img.id)} disabled={isCompressing || img.status === "completed"}><Zap className="size-3.5" /></Button>
                        <Button variant="ghost" size="icon-xs" onClick={() => { setPreviewItem(img); setPreviewUrl(img.compressedBlob ? URL.createObjectURL(img.compressedBlob) : ""); }} disabled={img.status !== "completed"}><Eye className="size-3.5" /></Button>
                        <Button variant="ghost" size="icon-xs" onClick={() => handleDownload(img.id)} disabled={img.status !== "completed"}><Download className="size-3.5" /></Button>
                        <Button variant="ghost" size="icon-xs" onClick={() => setImages((p) => p.filter((i) => i.id !== img.id))}><Trash2 className="size-3.5 text-red-400" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Dialog open={!!previewItem} onOpenChange={(o) => { if (!o) setPreviewItem(null); }}>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>预览对比</DialogTitle></DialogHeader>
              {previewItem && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-center mb-2 text-gray-500">原始 ({formatSize(previewItem.originalSize)})</p>
                    <div className="bg-gray-50 rounded-lg flex items-center justify-center h-48 border"><img src={previewItem.preview} className="max-w-full max-h-full object-contain" /></div>
                  </div>
                  <div>
                    <p className="text-xs text-center mb-2 text-green-600">压缩后 ({formatSize(previewItem.compressedSize || 0)})</p>
                    <div className="bg-gray-50 rounded-lg flex items-center justify-center h-48 border">{previewUrl && <img src={previewUrl} className="max-w-full max-h-full object-contain" />}</div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
          </>
  );
}
