import JSZip from "jszip";
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Download,
  Film,
  Image as ImageIcon,
  Info,
  Loader2,
  Music,
  Shuffle,
  Trash2,
  TriangleAlert
} from "lucide-react";
import { useEffect, useRef, useState } from "react";



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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExtractedImage { url: string; blob: Blob }
interface SelectedImage { file: File; url: string; name: string }

const getMimeType = (format: string) => format === "png" ? "image/png" : format === "jpg" ? "image/jpeg" : "image/webp";
const formatDuration = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;

/**
 * MediaRecorder 产出的 WebM 常常没有正确写入 Duration（缺失或写为 0/哨兵值），
 * 导致下载后的文件在很多播放器里无法播放或进度条错乱（浏览器内流式预览不受影响，
 * 所以看起来"最早能播"）。这里把 Duration 元素补成真实秒数：
 * 默认 TimecodeScale = 1,000,000ns，因此 Duration(毫秒) = seconds * 1000。
 * Duration 可能是 8 字节双精度(0x88)或 4 字节单精度(0x84)，两者都处理。
 */
async function fixWebmDuration(blob: Blob, durationSeconds: number): Promise<Blob> {
  try {
    const buf = await blob.arrayBuffer();
    const data = new Uint8Array(buf);
    // 定位 Duration 元素：id = 0x4489，后接 size 字节
    let idx = -1;
    let sizeByte = 0;
    for (let i = 0; i < data.length - 2; i++) {
      if (data[i] === 0x44 && data[i + 1] === 0x89) {
        sizeByte = data[i + 2];
        idx = i + 3;
        break;
      }
    }
    if (idx === -1) return blob;
    const view = new DataView(buf);
    const val = durationSeconds * 1000; // 毫秒
    if (sizeByte === 0x88) {
      view.setFloat64(idx, val, false); // EBML 浮点为大端 double
    } else if (sizeByte === 0x84) {
      view.setFloat32(idx, val, false); // EBML 浮点为大端 float
    } else {
      return blob;
    }
    return new Blob([buf], { type: blob.type });
  } catch {
    return blob;
  }
}

/* ─── Video to Image ─── */

function VideoToImage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [extracted, setExtracted] = useState<ExtractedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [frameInterval, setFrameInterval] = useState(1);
  const [imageFormat, setImageFormat] = useState("png");
  const [quality, setQuality] = useState(0.9);
  const [dragOver, setDragOver] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      extracted.forEach((img) => URL.revokeObjectURL(img.url));
    };
  }, []);

  const handleVideo = (file: File) => {
    if (!file.type.startsWith("video/")) { setError("请上传视频文件"); return; }
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(URL.createObjectURL(file));
    setExtracted([]);
    setError("");
  };

  const extractFrames = async () => {
    const video = videoRef.current;
    if (!video || !videoUrl) { setError("请先上传视频"); return; }
    setIsProcessing(true);
    setExtracted([]);
    setError("");

    try {
      const interval = frameInterval;
      const frameCount = Math.floor(video.duration / interval);
      const frames: ExtractedImage[] = [];

      for (let i = 0; i < frameCount; i++) {
        const time = i * interval;
        video.currentTime = time;
        await new Promise<void>((resolve, reject) => {
          const onSeeked = () => { video.removeEventListener("seeked", onSeeked); resolve(); };
          const onError = () => { video.removeEventListener("error", onError); reject(new Error("seek 失败")); };
          video.addEventListener("seeked", onSeeked);
          video.addEventListener("error", onError);
          setTimeout(() => { video.removeEventListener("seeked", onSeeked); video.removeEventListener("error", onError); reject(new Error("seek 超时")); }, 2000);
        });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => b ? resolve(b) : reject(new Error("生成失败")), getMimeType(imageFormat), quality);
        });
        frames.push({ url: URL.createObjectURL(blob), blob });
      }
      setExtracted(frames);
    } catch (e) {
      setError("提取帧失败: " + (e as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAll = async () => {
    if (extracted.length === 0) return;
    const zip = new JSZip();
    extracted.forEach((img, i) => zip.file(`frame-${i + 1}.${imageFormat}`, img.blob));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `extracted-frames-${Date.now()}.zip`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadOne = (img: ExtractedImage, i: number) => {
    const a = document.createElement("a");
    a.href = img.url;
    a.download = `frame-${i + 1}.${imageFormat}`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <div className="space-y-4">
      <div
        className={`rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50 hover:bg-gray-50"}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleVideo(f); }}
      >
        <Film className="size-10 mx-auto text-gray-400 mb-3" />
        <p className="text-sm font-medium text-gray-600">点击或拖拽上传视频文件</p>
        <p className="text-xs text-gray-400 mt-1">支持 MP4、WebM 等格式</p>
        <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideo(f); }} />
      </div>

      {videoUrl && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
          <video ref={videoRef} src={videoUrl} controls className="w-full max-h-96 rounded-lg" onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)} />
          <p className="text-xs text-gray-400">视频时长: {formatDuration(duration)}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">帧间隔 (秒)</Label>
              <Input type="number" value={frameInterval} onChange={(e) => setFrameInterval(Number(e.target.value))} min={0.1} max={10} step={0.1} className="h-9" />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">图片格式</Label>
              <Select value={imageFormat} onValueChange={setImageFormat}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="png">PNG</SelectItem><SelectItem value="jpg">JPEG</SelectItem><SelectItem value="webp">WebP</SelectItem></SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">质量 ({Math.round(quality * 100)}%)</Label>
              <Slider min={0.1} max={1} step={0.1} value={[quality]} onValueChange={(v) => setQuality(v[0])} className="mt-2" />
            </div>
          </div>

          <Button onClick={extractFrames} disabled={isProcessing} className="w-full">
            {isProcessing ? <><Loader2 className="size-4 animate-spin" /> 提取中...</> : <><ImageIcon className="size-4" /> 提取帧</>}
          </Button>
        </div>
      )}

      {extracted.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium">提取的帧 ({extracted.length})</Label>
            <Button size="sm" onClick={downloadAll}><Download className="size-3.5" /> 下载全部 ZIP</Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {extracted.map((img, i) => (
              <div key={i} className="rounded-lg overflow-hidden border border-gray-100">
                <button
                  type="button"
                  onClick={() => setPreviewIndex(i)}
                  className="block w-full aspect-square flex items-center justify-center bg-gray-50 cursor-zoom-in"
                  title="点击预览"
                >
                  <img src={img.url} alt={`帧 ${i + 1}`} className="object-contain max-h-32" />
                </button>
                <div className="flex items-center justify-between gap-1 p-2">
                  <span className="text-xs text-gray-400">帧 {i + 1}</span>
                  <button
                    type="button"
                    onClick={() => downloadOne(img, i)}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
                    title="下载此帧"
                  >
                    <Download className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {previewIndex !== null && extracted[previewIndex] && (
        <Dialog open onOpenChange={(open) => { if (!open) setPreviewIndex(null); }}>
          <DialogContent className="max-w-3xl w-[92vw] p-2">
            <DialogHeader className="pr-6">
              <DialogTitle className="text-sm">帧 {previewIndex + 1}</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center bg-gray-50 rounded-md max-h-[70vh] overflow-auto p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={extracted[previewIndex].url}
                alt={`帧 ${previewIndex + 1}`}
                className="object-contain max-h-[68vh] w-auto"
              />
            </div>
            <div className="flex justify-end p-2 pt-0">
              <Button size="sm" onClick={() => downloadOne(extracted[previewIndex!], previewIndex!)}>
                <Download className="size-3.5" /> 下载此帧
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {error && <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"><TriangleAlert className="size-4 shrink-0" />{error}</div>}
    </div>
  );
}

/* ─── Image to Video ─── */

function ImageToVideo() {
  const audioInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [audio, setAudio] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [durationPerImage, setDurationPerImage] = useState(2);
  const [resolution, setResolution] = useState("1080p");

  useEffect(() => {
    return () => { images.forEach((img) => URL.revokeObjectURL(img.url)); };
  }, []);

  const addImages = (files: File[]) => {
    const newImages = files.filter((f) => f.type.startsWith("image/")).map((file) => ({ file, url: URL.createObjectURL(file), name: file.name }));
    if (newImages.length > 0) { setImages((prev) => [...prev, ...newImages]); setError(""); }
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index].url);
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const moveUp = () => { if (images.length <= 1) return; const arr = [...images]; const f = arr.shift(); if (f) { arr.push(f); setImages(arr); } };
  const moveDown = () => { if (images.length <= 1) return; const arr = [...images]; const l = arr.pop(); if (l) { arr.unshift(l); setImages(arr); } };
  const reverseImages = () => images.length > 1 && setImages((prev) => [...prev].reverse());
  const shuffleImages = () => images.length > 1 && setImages((prev) => [...prev].sort(() => Math.random() - 0.5));

  const generateVideo = async () => {
    if (images.length === 0) { setError("请先添加图片"); return; }
    setIsProcessing(true);
    setError("");
    // Note: Real video generation requires ffmpeg.wasm or similar.
    // This is a placeholder that creates a webm using MediaRecorder + Canvas.
    try {
      const resMap: Record<string, [number, number]> = { "720p": [1280, 720], "1080p": [1920, 1080], "4k": [3840, 2160] };
      const [w, h] = resMap[resolution] || [1920, 1080];
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("无法获取 Canvas 上下文");

      const stream = canvas.captureStream(30);
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5000000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      const done = new Promise<Blob>((resolve) => { recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" })); });
      recorder.start();

      for (const img of images) {
        const bitmap = await createImageBitmap(img.file);
        // fit cover
        const scale = Math.max(w / bitmap.width, h / bitmap.height);
        const dw = bitmap.width * scale, dh = bitmap.height * scale;
        const dx = (w - dw) / 2, dy = (h - dh) / 2;
        ctx.fillStyle = "#000"; ctx.fillRect(0, 0, w, h);
        ctx.drawImage(bitmap, dx, dy, dw, dh);
        await new Promise((r) => setTimeout(r, durationPerImage * 1000));
        bitmap.close();
      }
      recorder.stop();
      const rawBlob = await done;
      const expectedDuration = images.length * durationPerImage;
      const blob = await fixWebmDuration(rawBlob, expectedDuration);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `images-to-video-${Date.now()}.webm`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      setError("生成失败: " + (e as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <UploadDropZone
        multiple
        accept="image/*"
        onFiles={addImages}
        className="rounded-lg"
        emptyHint="点击或拖拽上传多张图片"
        emptySubHint="可多选"
        icon={<ImageIcon className="size-10 opacity-40" />}
      />

      {/* Audio */}
      <div className="flex items-center gap-3">
        <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setAudio(f); }} />
        <Button variant="outline" size="sm" onClick={() => audioInputRef.current?.click()}><Music className="size-3.5" /> {audio ? audio.name : "添加音频（可选）"}</Button>
        {audio && <Button variant="ghost" size="sm" onClick={() => setAudio(null)} className="text-red-500"><Trash2 className="size-3.5" /></Button>}
      </div>

      {/* Settings */}
      {images.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">每张图片时长 (秒)</Label>
              <Input type="number" value={durationPerImage} onChange={(e) => setDurationPerImage(Number(e.target.value))} min={0.1} max={10} step={0.1} className="h-9" />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">分辨率</Label>
              <Select value={resolution} onValueChange={setResolution}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="720p">720p</SelectItem><SelectItem value="1080p">1080p</SelectItem><SelectItem value="4k">4K</SelectItem></SelectContent>
              </Select>
            </div>
          </div>

          {/* Image grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden border border-gray-100 group">
                <div className="aspect-square flex items-center justify-center bg-gray-50">
                  <img src={img.url} alt={img.name} className="object-contain max-h-32" />
                </div>
                <p className="p-2 text-xs text-gray-400 truncate">{img.name}</p>
                <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={moveUp} disabled={images.length <= 1}><ChevronUp className="size-3.5" /> 上移</Button>
            <Button variant="outline" size="sm" onClick={moveDown} disabled={images.length <= 1}><ChevronDown className="size-3.5" /> 下移</Button>
            <Button variant="outline" size="sm" onClick={reverseImages} disabled={images.length <= 1}><ArrowLeftRight className="size-3.5" /> 反转</Button>
            <Button variant="outline" size="sm" onClick={shuffleImages} disabled={images.length <= 1}><Shuffle className="size-3.5" /> 打乱</Button>
          </div>

          <Button onClick={generateVideo} disabled={isProcessing} className="w-full">
            {isProcessing ? <><Loader2 className="size-4 animate-spin" /> 生成中...</> : <><Film className="size-4" /> 生成视频 (WebM)</>}
          </Button>
          <p className="text-xs text-gray-400 text-center">使用 Canvas + MediaRecorder 生成 WebM 格式视频</p>
        </div>
      )}

      {error && <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"><TriangleAlert className="size-4 shrink-0" />{error}</div>}
    </div>
  );
}

/* ─── Page ─── */

export default function VideoImageConverterPage() {
  return (
    <>
            <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

          <Tabs defaultValue="v2i">
            <TabsList className="w-full max-w-xs">
              <TabsTrigger value="v2i" className="flex-1"><Film className="size-4" /> 视频转图片</TabsTrigger>
              <TabsTrigger value="i2v" className="flex-1"><ImageIcon className="size-4" /> 图片转视频</TabsTrigger>
            </TabsList>

            <TabsContent value="v2i" className="mt-4"><VideoToImage /></TabsContent>
            <TabsContent value="i2v" className="mt-4"><ImageToVideo /></TabsContent>
          </Tabs>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="size-4 text-gray-400" />
              <Label className="text-sm font-medium">使用说明</Label>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-600">
              <li>视频转图片：上传视频，设置帧间隔和格式，提取帧并下载 ZIP</li>
              <li>图片转视频：上传多张图片，设置每张时长和分辨率，生成 WebM 视频并自动下载</li>
              <li>图片转视频使用浏览器原生 Canvas + MediaRecorder，无需后端</li>
            </ol>
          </div>
        </div>
      </div>
          </>
  );
}
