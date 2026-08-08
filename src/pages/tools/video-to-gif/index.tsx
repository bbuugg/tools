import {
  Download,
  Film,
  Info,
  Loader2,
  Play,
  Plus,
  Square,
  Trash2,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
// @ts-expect-error No type definitions available for gif.js
import GIF from "gif.js";



import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type SiteDefination } from "@/lib/site";

interface TextOverlay {
  content: string;
  startTime: number;
  endTime: number;
  fontSize: number;
  color: string;
  position: "top" | "center" | "bottom";
}

const QUALITY_MAP: Record<string, number> = { high: 1, medium: 10, low: 20 };

export default function VideoToGifPage({ title, description }: SiteDefination) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedGif, setGeneratedGif] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const [width, setWidth] = useState(300);
  const [quality, setQuality] = useState("medium");
  const [fps, setFps] = useState(15);
  const [timeRange, setTimeRange] = useState({ start: 0, end: 0 });
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (generatedGif) URL.revokeObjectURL(generatedGif);
    };
  }, []);

  const handleVideoFile = (file: File) => {
    if (!file.type.startsWith("video/")) { setError("请上传视频文件"); return; }
    if (file.size > 100 * 1024 * 1024) { setError("文件大小不能超过 100MB"); return; }
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (generatedGif) { URL.revokeObjectURL(generatedGif); setGeneratedGif(""); }
    setVideoUrl(URL.createObjectURL(file));
    setProgress(0);
    setError("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleVideoFile(file);
  };

  const onVideoLoaded = () => {
    if (videoRef.current) {
      const d = videoRef.current.duration;
      setVideoDuration(d);
      setTimeRange({ start: 0, end: Math.min(d, 15) });
    }
  };

  const setStartFromCurrent = () => setTimeRange((p) => ({ ...p, start: currentTime }));
  const setEndFromCurrent = () => setTimeRange((p) => ({ ...p, end: currentTime }));

  const addTextOverlay = () => {
    setTextOverlays((prev) => [...prev, { content: "", startTime: currentTime, endTime: Math.min(currentTime + 2, videoDuration), fontSize: 24, color: "#ffffff", position: "bottom" }]);
  };
  const removeTextOverlay = (i: number) => setTextOverlays((prev) => prev.filter((_, idx) => idx !== i));
  const updateTextOverlay = (i: number, field: keyof TextOverlay, value: string | number) => {
    setTextOverlays((prev) => prev.map((o, idx) => idx === i ? { ...o, [field]: value } : o));
  };

  const startCapture = () => {
    setIsCapturing(true);
    if (videoRef.current) { videoRef.current.currentTime = timeRange.start; videoRef.current.play(); }
  };
  const stopCapture = () => { setIsCapturing(false); videoRef.current?.pause(); };

  const generateGif = async () => {
    const video = videoRef.current;
    if (!video || !videoUrl) { setError("请先上传视频"); return; }
      if (timeRange.start >= timeRange.end) { setError("时间范围无效"); return; }

    setIsProcessing(true);
    setProgress(0);
    setError("");

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("无法获取 Canvas 上下文");
      canvas.width = width;
      canvas.height = (video.videoHeight / video.videoWidth) * width;
      if (canvas.width <= 0 || canvas.height <= 0) throw new Error("视频尺寸无效");

      const gif = new GIF({ workers: 2, quality: QUALITY_MAP[quality], width: canvas.width, height: canvas.height, workerScript: "/gif.worker.js" });
      const frameInterval = 1 / fps;
      const totalFrames = Math.floor((timeRange.end - timeRange.start) * fps);
      let processed = 0;

      for (let time = timeRange.start; time < timeRange.end; time += frameInterval) {
        try {
          video.currentTime = time;
          await new Promise<void>((resolve) => {
            const onSeeked = () => { video.removeEventListener("seeked", onSeeked); resolve(); };
            video.addEventListener("seeked", onSeeked);
            setTimeout(() => { video.removeEventListener("seeked", onSeeked); resolve(); }, 500);
          });

          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          textOverlays.forEach((o) => {
            if (time >= o.startTime && time <= o.endTime && o.content) {
              ctx.save();
              ctx.fillStyle = o.color;
              ctx.font = `bold ${o.fontSize}px Arial`;
              ctx.textAlign = "center";
              ctx.strokeStyle = "rgba(0,0,0,0.8)";
              ctx.lineWidth = 2;
              let y = canvas.height / 2;
              if (o.position === "top") y = o.fontSize + 20;
              if (o.position === "bottom") y = canvas.height - 20;
              ctx.strokeText(o.content, canvas.width / 2, y);
              ctx.fillText(o.content, canvas.width / 2, y);
              ctx.restore();
            }
          });

          gif.addFrame(canvas, { copy: true, delay: frameInterval * 1000 });
          processed++;
          setProgress(Math.round((processed / totalFrames) * 80));
        } catch { /* skip */ }
      }

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("GIF 渲染超时，请减少时长、帧数或降低质量后重试")), 300000);
        gif.on("progress", (p: number) => { clearTimeout(timeout); setProgress(80 + Math.round(p * 20)); });
        gif.on("finished", (blob: Blob) => { clearTimeout(timeout); setGeneratedGif(URL.createObjectURL(blob)); setProgress(100); resolve(); });
        gif.on("abort", () => { clearTimeout(timeout); reject(new Error("已取消")); });
        gif.on("error", (e: Error) => { clearTimeout(timeout); reject(new Error("生成错误: " + e.message)); });
        try { gif.render(); } catch (e) { clearTimeout(timeout); reject(new Error("渲染失败: " + (e as Error).message)); }
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
    a.href = generatedGif; a.download = `video-to-gif-${Date.now()}.gif`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const resetTool = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (generatedGif) URL.revokeObjectURL(generatedGif);
    setVideoUrl(""); setGeneratedGif(""); setProgress(0); setTextOverlays([]);
    setTimeRange({ start: 0, end: 0 }); setVideoDuration(0); setError("");
  };

  return (
    <>
            <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center text-white">
              <Film className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>

          {/* Upload */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
            <div
              className={`rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50 hover:bg-gray-50"}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <Upload className="size-10 mx-auto text-gray-400 mb-3" />
              <p className="text-sm font-medium text-gray-600">点击或拖拽上传视频文件</p>
              <p className="text-xs text-gray-400 mt-1">支持最大 100MB</p>
              <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoFile(f); }} />
            </div>

            {/* GIF Settings */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">宽度 (px)</Label>
                <Input type="number" value={width} onChange={(e) => { const v = e.target.value; setWidth(v === "" ? 0 : Number(v)); }} onBlur={() => { if (!width || width < 100) setWidth(100); if (width > 800) setWidth(800); }} min={100} max={800} className="h-9" />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">质量</Label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="high">高</SelectItem><SelectItem value="medium">中</SelectItem><SelectItem value="low">低</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">帧率 (FPS)</Label>
                <Input type="number" value={fps} onChange={(e) => { const v = e.target.value; setFps(v === "" ? 0 : Number(v)); }} onBlur={() => { if (!fps || fps < 5) setFps(5); if (fps > 30) setFps(30); }} min={5} max={30} className="h-9" />
              </div>
            </div>
          </div>

          {error && <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"><TriangleAlert className="size-4 shrink-0" />{error}</div>}

          {/* Video Preview & Controls */}
          {videoUrl && (
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-4">
                <video ref={videoRef} src={videoUrl} controls className="w-full rounded-lg" onLoadedMetadata={onVideoLoaded} onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)} />

                {/* Time Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">时间范围（不要超过300秒）</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Input type="number" value={timeRange.start} onChange={(e) => setTimeRange((p) => ({ ...p, start: Number(e.target.value) }))} min={0} max={videoDuration} step={0.1} className="h-8 w-20" />
                      <span className="text-xs text-gray-400">s</span>
                    </div>
                    <span className="text-xs text-gray-400">~</span>
                    <div className="flex items-center gap-1">
                      <Input type="number" value={timeRange.end} onChange={(e) => setTimeRange((p) => ({ ...p, end: Number(e.target.value) }))} min={timeRange.start} max={videoDuration} step={0.1} className="h-8 w-20" />
                      <span className="text-xs text-gray-400">s</span>
                    </div>
                    <Button variant="outline" size="sm" onClick={setStartFromCurrent}>设为当前</Button>
                    <Button variant="outline" size="sm" onClick={setEndFromCurrent}>设为当前</Button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {!isCapturing ? (
                    <Button variant="outline" size="sm" onClick={startCapture} disabled={isProcessing}><Play className="size-3.5" /> 预览</Button>
                  ) : (
                    <Button variant="destructive" size="sm" onClick={stopCapture}><Square className="size-3.5" /> 停止</Button>
                  )}
                  <Button size="sm" onClick={generateGif} disabled={isProcessing}>
                    {isProcessing ? <><Loader2 className="size-3.5 animate-spin" /> 生成中... {progress}%</> : <><Film className="size-3.5" /> 生成 GIF</>}
                  </Button>
                </div>
              </div>

              {/* Text Overlays */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">文字叠加</Label>
                  <Button variant="outline" size="sm" onClick={addTextOverlay}><Plus className="size-3.5" /> 添加</Button>
                </div>

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {textOverlays.map((text, i) => (
                    <div key={i} className="border border-gray-100 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium">文字 {i + 1}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeTextOverlay(i)} className="text-red-500 h-6 px-2"><Trash2 className="size-3" /></Button>
                      </div>
                      <Input value={text.content} onChange={(e) => updateTextOverlay(i, "content", e.target.value)} placeholder="输入文字内容" className="h-8 text-sm" />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-gray-400">开始 (s)</Label>
                          <Input type="number" value={text.startTime} onChange={(e) => updateTextOverlay(i, "startTime", Number(e.target.value))} min={0} max={videoDuration} step={0.1} className="h-8 text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-400">结束 (s)</Label>
                          <Input type="number" value={text.endTime} onChange={(e) => updateTextOverlay(i, "endTime", Number(e.target.value))} min={text.startTime} max={videoDuration} step={0.1} className="h-8 text-xs" />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs text-gray-400">字号</Label>
                          <Input type="number" value={text.fontSize} onChange={(e) => updateTextOverlay(i, "fontSize", Number(e.target.value))} min={12} max={48} className="h-8 text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-400">颜色</Label>
                          <input type="color" value={text.color} onChange={(e) => updateTextOverlay(i, "color", e.target.value)} className="w-full h-8 border border-input rounded-md cursor-pointer" />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-400">位置</Label>
                          <Select value={text.position} onValueChange={(v) => updateTextOverlay(i, "position", v)}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="top">顶部</SelectItem><SelectItem value="center">居中</SelectItem><SelectItem value="bottom">底部</SelectItem></SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                  {textOverlays.length === 0 && <p className="text-xs text-gray-400 text-center py-4">点击添加按钮添加文字叠加</p>}
                </div>
              </div>
            </div>
          )}

          {/* Progress */}
          {isProcessing && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 text-center">
              <Loader2 className="size-8 animate-spin mx-auto mb-3 text-primary" />
              <p className="text-sm text-gray-500">正在生成 GIF... {progress}%</p>
              <div className="mt-3 h-2 rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          {/* Result */}
          {generatedGif && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <Label className="text-sm font-medium mb-3 block">生成结果</Label>
              <div className="text-center">
                <img src={generatedGif} alt="生成的 GIF" className="max-w-full h-auto mx-auto rounded-lg mb-4" style={{ maxHeight: "400px" }} />
                <div className="flex justify-center gap-2">
                  <Button onClick={downloadGif}><Download className="size-4" /> 下载 GIF</Button>
                  <Button variant="outline" onClick={resetTool}>重新开始</Button>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="size-4 text-gray-400" />
              <Label className="text-sm font-medium">使用说明</Label>
            </div>
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-gray-600">
              <li>上传视频文件（最大 100MB）</li>
              <li>设置 GIF 宽度、质量和帧率</li>
              <li>选择截取的时间范围</li>
              <li>可选添加文字叠加，设置内容和显示时间</li>
              <li>点击生成 GIF 并下载</li>
            </ol>
          </div>
        </div>
      </div>
          </>
  );
}
