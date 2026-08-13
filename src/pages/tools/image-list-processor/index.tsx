import MonacoEditor from "@/components/MonacoEditor";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import JSZip from "jszip";
import {
  Copy,
  DownloadCloud,
  Eraser,
  FileText,
  Star
} from "lucide-react";
import { useCallback, useState } from "react";

interface ImageInfo { url: string; filename: string }

const extractFilename = (url: string): string => {
  try { return new URL(url).pathname.split("/").pop() || url; }
  catch { return url.split("/").pop() || url; }
};

export default function ImageListProcessorPage() {
  const [input, setInput] = useState("");
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const processImages = useCallback((value: string) => {
    setInput(value);
    if (!value.trim()) { setImages([]); return; }
    const lines = value.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#") && (l.startsWith("http://") || l.startsWith("https://")));
    const unique = lines.filter((url, i, self) => self.indexOf(url) === i);
    setImages(unique.map((url) => ({ url, filename: extractFilename(url) })));
  }, []);

  const handleDownloadAll = async () => {
    if (!images.length) return;
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      await Promise.all(images.map(async (img, i) => {
        try {
          const res = await fetch(img.url);
          if (!res.ok) throw new Error("fetch failed");
          const blob = await res.blob();
          let ext = img.url.split(".").pop()?.split(/[?#]/)[0] || "";
          if (!ext || ext.length > 4) { const ct = res.headers.get("content-type"); ext = ct?.includes("image/") ? ct.split("/")[1] : "png"; }
          const name = img.filename?.split(".")[0] || `image-${i + 1}`;
          zip.file(`${name}.${ext}`, blob);
        } catch { }
      }));
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `images-${Date.now()}.zip`; a.click();
      URL.revokeObjectURL(url);
    } finally { setIsDownloading(false); }
  };

  const handleExportScript = (format: "bat" | "sh") => {
    const cmds = images.map((img, i) => {
      const fn = img.filename || `image-${i + 1}.png`;
      const dot = fn.lastIndexOf(".");
      const name = dot !== -1 ? `${fn.substring(0, dot)}_${i + 1}${fn.substring(dot)}` : `${fn}_${i + 1}.png`;
      return `curl -L -k -o "${name}" "${img.url}"`;
    });
    const content = format === "bat"
      ? `@echo off\necho Downloading ${images.length} images...\n${cmds.join("\n")}\necho Done!\npause`
      : `#!/bin/bash\necho "Downloading ${images.length} images..."\n${cmds.join("\n")}\necho "Done!"`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = format === "bat" ? "download_images.bat" : "download_images.sh"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between h-10">
              <Label className="text-sm font-medium">图片 URL 列表 {images.length > 0 && `(${images.length} 张)`}</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => processImages(Array.from({ length: 8 }, (_, i) => `https://picsum.photos/400/300?random=${i + 1}`).join("\n"))}><Star className="size-3.5" /> 示例</Button>
                <Button variant="outline" size="sm" onClick={() => processImages("")} disabled={!input}><Eraser className="size-3.5" /> 清空</Button>
                {images.length > 0 && <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(images.map((i) => i.url).join("\n"))}><Copy className="size-3.5" /> 复制 URL</Button>}
              </div>
            </div>
            <div className="h-[200px]">
              <MonacoEditor value={input} onChange={processImages} language="plaintext" height="100%" showLineNumbersToggle showWordWrapToggle />
            </div>
            {images.length > 0 && (
              <div className="flex gap-2">
                <Button size="sm" onClick={handleDownloadAll} disabled={isDownloading}><DownloadCloud className="size-3.5" /> {isDownloading ? "下载中..." : "下载全部 ZIP"}</Button>
                <Button variant="outline" size="sm" onClick={() => handleExportScript("bat")}><FileText className="size-3.5" /> Windows 脚本</Button>
                <Button variant="outline" size="sm" onClick={() => handleExportScript("sh")}><FileText className="size-3.5" /> Linux 脚本</Button>
              </div>
            )}
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((img, i) => (
                <div key={i} className="rounded-lg border border-gray-200 bg-white p-2 hover:border-indigo-300 transition-colors">
                  <div className="rounded overflow-hidden bg-gray-50 flex items-center justify-center mb-2 min-h-32">
                    <img src={img.url} alt="" referrerPolicy="no-referrer" className="max-w-full max-h-48 object-contain" onError={(e) => ((e.target as HTMLImageElement).style.opacity = "0.2")} />
                  </div>
                  <p className="text-xs truncate text-gray-600" title={img.filename}>{img.filename}</p>
                  <p className="text-[10px] truncate text-gray-400" title={img.url}>{img.url}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
