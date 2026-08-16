import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UploadDropZone } from "@/components/ui/upload-dropzone";
import "cropperjs/dist/cropper.css";
import JSZip from "jszip";
import {
  Download,
  Eraser,
  Loader2,
  Scissors
} from "lucide-react";
import { useRef, useState } from "react";
import Cropper, { type ReactCropperElement } from "react-cropper";

interface FaviconResult { size: number; format: string; dataUrl: string; blob: Blob; filename: string }

const SIZES = [16, 32, 48, 64, 128];

export default function FaviconGeneratorPage() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("favicon");
  const [outputFormat, setOutputFormat] = useState("ico");
  const [selectedSizes, setSelectedSizes] = useState<number[]>([16, 32, 48]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<FaviconResult[]>([]);
  const cropperRef = useRef<ReactCropperElement>(null);

  const handleFileChange = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => { setImageSrc(reader.result as string); setFileName(file.name.split(".")[0] || "favicon"); setResults([]); };
    reader.readAsDataURL(file);
  };

  const generate = async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper || !imageSrc || !selectedSizes.length) return;
    setIsGenerating(true); setResults([]);
    try {
      const source = cropper.getCroppedCanvas();
      if (!source) return;
      const res: FaviconResult[] = [];
      for (const size of selectedSizes) {
        const canvas = document.createElement("canvas");
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(source, 0, 0, size, size);
        const mime = outputFormat === "ico" ? "image/png" : `image/${outputFormat}`;
        const ext = outputFormat === "ico" ? "ico" : outputFormat;
        const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), mime, 0.9));
        res.push({ size, format: outputFormat, dataUrl: canvas.toDataURL(mime, 0.9), blob, filename: `${fileName}-${size}x${size}.${ext}` });
      }
      setResults(res);
    } finally { setIsGenerating(false); }
  };

  const downloadSingle = (fav: FaviconResult) => { const a = document.createElement("a"); a.href = fav.dataUrl; a.download = fav.filename; a.click(); };

  const downloadAll = async () => {
    if (!results.length) return;
    const zip = new JSZip();
    results.forEach((f) => zip.file(f.filename, f.blob));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${fileName}-favicons.zip`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

          {!imageSrc ? (
            <UploadDropZone
              accept="image/*"
              onFiles={(files) => files[0] && handleFileChange(files[0])}
              className="rounded-xl"
              emptyHint="点击上传或粘贴图片"
              emptySubHint="支持 PNG, JPG, WebP, SVG"
            />
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">裁剪区域 (1:1)</Label>
                  <Button variant="outline" size="sm" onClick={() => { setImageSrc(null); setResults([]); setFileName("favicon"); }}><Eraser className="size-3.5" /> 重置</Button>
                </div>
                <div className="h-[400px] overflow-hidden rounded-lg">
                  <Cropper src={imageSrc} style={{ height: "100%", width: "100%" }} aspectRatio={1} guides viewMode={1} dragMode="move" responsive background={false} ref={cropperRef} key={imageSrc} />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">输出格式</Label>
                  <Select value={outputFormat} onValueChange={setOutputFormat}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="ico">ICO (标准)</SelectItem><SelectItem value="png">PNG</SelectItem><SelectItem value="jpg">JPG</SelectItem></SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">尺寸</Label>
                  <div className="space-y-2">
                    {SIZES.map((s) => (
                      <label key={s} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={selectedSizes.includes(s)} onCheckedChange={(c) => setSelectedSizes((p) => c ? [...p, s] : p.filter((x) => x !== s))} />
                        <span className="text-xs">{s}×{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button className="w-full" onClick={generate} disabled={isGenerating || !selectedSizes.length}>
                  {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Scissors className="size-4" />} {isGenerating ? "生成中..." : "生成"}
                </Button>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <Label className="text-sm font-medium">生成结果 ({results.length})</Label>
                <Button size="sm" onClick={downloadAll}><Download className="size-3.5" /> 下载全部 ZIP</Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.map((fav, i) => (
                  <div key={i} className="flex flex-col items-center border border-border rounded-lg p-3">
                    <div className="w-16 h-16 flex items-center justify-center mb-2">
                      <img src={fav.dataUrl} alt="" style={{ width: Math.min(fav.size, 48), height: Math.min(fav.size, 48) }} className="image-render-pixelated" />
                    </div>
                    <p className="text-xs font-mono">{fav.size}×{fav.size}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">{fav.format}</p>
                    <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => downloadSingle(fav)}><Download className="size-3" /> 保存</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
