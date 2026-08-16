"use client";

import { useState, useRef, useEffect } from "react";
import { Images, Film, Package, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadDropZone } from "@/components/ui/upload-dropzone";
import { downloadBlob } from "./utils";

function LivePhotoMaker() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [videoPreview, setVideoPreview] = useState("");
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [videoDragOver, setVideoDragOver] = useState(false);

  const handleImageSelect = (file: File) => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const handleVideoSelect = (file: File) => {
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    setError("");
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, []);

  const packFile = async () => {
    if (!imageFile || !videoFile) {
      setError("请同时选择图片和视频文件");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const imageBuf = await imageFile.arrayBuffer();
      const videoBuf = await videoFile.arrayBuffer();
      const combinedBlob = new Blob([imageBuf, videoBuf], { type: "image/jpeg" });
      downloadBlob(combinedBlob, `MVIMG_${Date.now()}.jpg`);
    } catch {
      setError("制作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Image */}
        <div className="rounded-xl border border-border bg-card p-4">
          <Label className="text-sm font-medium mb-3 block">选择图片</Label>
          <UploadDropZone
            accept=".jpg,.jpeg"
            onFiles={(files) => files[0] && handleImageSelect(files[0])}
            className="rounded-lg"
            emptyHint="点击或拖拽上传 JPEG 图片"
            icon={<Images className="size-8 opacity-40" />}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="预览" className="max-h-40 mx-auto rounded" />
            ) : null}
          </UploadDropZone>
        </div>

        {/* Video */}
        <div className="rounded-xl border border-border bg-card p-4">
          <Label className="text-sm font-medium mb-3 block">选择视频</Label>
          <div
            className={`rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${videoDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent"}`}
            onClick={() => videoInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setVideoDragOver(true); }}
            onDragLeave={() => setVideoDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setVideoDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleVideoSelect(f); }}
          >
            {videoPreview ? (
              <video src={videoPreview} className="max-h-40 mx-auto rounded" controls />
            ) : (
              <>
                <Film className="size-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">点击或拖拽上传 MP4 视频</p>
              </>
            )}
            <input ref={videoInputRef} type="file" accept=".mp4" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleVideoSelect(f); }} />
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          <TriangleAlert className="size-4 shrink-0" />{error}
        </div>
      )}

      <div className="text-center">
        <Button onClick={packFile} disabled={!imageFile || !videoFile || loading} size="lg">
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Package className="size-4" />}
          {loading ? "制作中..." : "制作 Live Photo"}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-muted p-5">
        <Label className="text-sm font-medium mb-3 block">使用说明</Label>
        <ol className="list-decimal list-inside space-y-1.5 text-sm text-muted-foreground">
          <li>选择一张 JPEG 图片作为 Live Photo 的封面</li>
          <li>选择一段 MP4 视频作为动态部分</li>
          <li>点击制作按钮，生成的文件会自动下载</li>
        </ol>
        <p className="text-xs text-muted-foreground mt-3">生成的文件为 Google Motion Photo 格式（MVIMG_*.jpg）</p>
      </div>
    </div>
  );
}

export default LivePhotoMaker;
