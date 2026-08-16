"use client";

import { useState, useRef, useEffect } from "react";
import {
  Images,
  Film,
  Download,
  Upload,
  Scissors,
  Loader2,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { findSequence, downloadBlob } from "./utils";
import type { UnpackedResult } from "./utils";

function LivePhotoUnpacker() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<UnpackedResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (result) {
        URL.revokeObjectURL(result.imageUrl);
        URL.revokeObjectURL(result.videoUrl);
      }
    };
  }, [result]);

  const processFile = async (file: File) => {
    setLoading(true);
    setError("");
    if (result) {
      URL.revokeObjectURL(result.imageUrl);
      URL.revokeObjectURL(result.videoUrl);
    }
    setResult(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      const seqMp42 = [0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32];
      const seqIsom = [0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d];

      let matchIndex = findSequence(bytes, seqMp42);
      if (matchIndex === -1) matchIndex = findSequence(bytes, seqIsom);

      if (matchIndex === -1) {
        setError("未在文件中找到视频数据，请确认上传的是 Live Photo");
        setLoading(false);
        return;
      }

      const videoStartIndex = matchIndex - 4;
      if (videoStartIndex < 0) {
        setError("文件格式无效");
        setLoading(false);
        return;
      }

      const imageBytes = bytes.slice(0, videoStartIndex);
      const videoBytes = bytes.slice(videoStartIndex);

      const imageBlob = new Blob([imageBytes], { type: "image/jpeg" });
      const videoBlob = new Blob([videoBytes], { type: "video/mp4" });

      setResult({
        imageBlob,
        videoBlob,
        imageUrl: URL.createObjectURL(imageBlob),
        videoUrl: URL.createObjectURL(videoBlob),
        originalName: file.name.replace(/\.[^/.]+$/, ""),
      });
    } catch {
      setError("处理失败");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="space-y-4">
      <div
        className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50 hover:bg-accent"}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {loading ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">正在处理...</p>
          </div>
        ) : (
          <>
            <Upload className="size-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-muted-foreground">点击或拖拽上传 Live Photo 文件</p>
            <p className="text-xs text-muted-foreground mt-1">支持 Google Motion Photo / Android Live Photo（.jpg）</p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          <TriangleAlert className="size-4 shrink-0" />{error}
        </div>
      )}

      {result && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Images className="size-4 text-primary" />
                <Label className="text-sm font-medium">提取的图片</Label>
              </div>
              <Button variant="outline" size="sm" onClick={() => downloadBlob(result.imageBlob, `${result.originalName}.jpg`)}>
                <Download className="size-3.5" /> 下载
              </Button>
            </div>
            <img src={result.imageUrl} alt="提取的图片" className="w-full h-auto rounded-lg" style={{ maxHeight: "400px", objectFit: "contain" }} />
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Film className="size-4 text-primary" />
                <Label className="text-sm font-medium">提取的视频</Label>
              </div>
              <Button variant="outline" size="sm" onClick={() => downloadBlob(result.videoBlob, `${result.originalName}.mp4`)}>
                <Download className="size-3.5" /> 下载
              </Button>
            </div>
            <video src={result.videoUrl} controls className="w-full h-auto rounded-lg" style={{ maxHeight: "400px" }} />
          </div>
        </div>
      )}

      {!loading && !result && !error && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Scissors className="size-10 opacity-30 mb-2" />
          <p className="text-sm">上传 Live Photo 文件后在此显示结果</p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-muted p-5">
        <Label className="text-sm font-medium mb-3 block">使用说明</Label>
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
          <li>将 Google Motion Photo 或 Android Live Photo（.jpg 格式）上传到上方区域</li>
          <li>工具会自动识别并拆分文件中的图片和视频</li>
          <li>分别下载提取的图片和视频文件</li>
        </ol>
        <p className="text-xs text-muted-foreground mt-3">仅支持 Google Motion Photo 和 Android Live Photo 格式，不支持 Apple Live Photo（HEIC）</p>
      </div>
    </div>
  );
}

export default LivePhotoUnpacker;
