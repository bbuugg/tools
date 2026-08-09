import {
  Code2,
  Copy,
  Eraser,
  FileText,
  Star
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";



import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import MonacoEditor from "@/components/MonacoEditor"

interface ExtractedItem { type: string; url: string; text?: string; attributes?: Record<string, string> }
interface ExtractionOptions {
  images: boolean; videos: boolean; audios: boolean; links: boolean;
  css: boolean; js: boolean; iframes: boolean; metadata: boolean;
  forms: boolean; uniqueOnly: boolean; absoluteUrls: boolean;
}

const OPTION_LABELS: Record<string, string> = {
  images: "图片", videos: "视频", audios: "音频", links: "链接",
  css: "CSS", js: "JavaScript", iframes: "Iframe", metadata: "Meta 标签",
  forms: "表单",
};

const TYPE_EMOJIS: Record<string, string> = {
  image: "🖼️", "css-background": "🎨", video: "📹", audio: "🎵",
  link: "🔗", css: "🎨", js: "📜", iframe: "🖼️", metadata: "🔍", form: "📝",
};

const EXAMPLE_HTML = `<!DOCTYPE html>
<html>
<head>
    <title>Example Page</title>
    <link rel="stylesheet" href="/css/style.css">
    <meta name="description" content="This is an example page">
</head>
<body>
    <h1>Welcome to Example Page</h1>
    <img src="/images/logo.png" alt="Logo">
    <a href="https://www.example.com">External Link</a>
    <video src="/videos/demo.mp4" controls></video>
    <audio src="/audio/music.mp3"></audio>
    <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>
    <form action="/submit" method="post">
        <input type="text" name="username">
        <button type="submit">Submit</button>
    </form>
    <script src="/js/app.js"><\/script>
</body>
</html>`;

export default function HtmlExtractorPage() {
  const [htmlInput, setHtmlInput] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [results, setResults] = useState<ExtractedItem[]>([]);
  const [options, setOptions] = useState<ExtractionOptions>({
    images: true, videos: true, audios: true, links: true,
    css: true, js: true, iframes: true, metadata: true,
    forms: true, uniqueOnly: true, absoluteUrls: false,
  });

  const makeAbsolute = useCallback((url: string, base: string) => {
    if (!url || !base || url.startsWith("http") || url.startsWith("//")) return url;
    try { return new URL(url, new URL(base)).href; } catch { return url; }
  }, []);

  const extract = useCallback(() => {
    if (!htmlInput.trim()) { setResults([]); return; }
    const doc = new DOMParser().parseFromString(htmlInput, "text/html");
    let r: ExtractedItem[] = [];
    const processUrl = (url: string | null) => {
      if (!url) return null;
      return options.absoluteUrls ? makeAbsolute(url, baseUrl) : url;
    };

    if (options.images) {
      doc.querySelectorAll("img").forEach((img) => {
        const src = processUrl(img.getAttribute("src"));
        if (src) r.push({ type: "image", url: src, text: img.getAttribute("alt") || "", attributes: { alt: img.getAttribute("alt") || "", title: img.getAttribute("title") || "" } });
      });
    }
    if (options.links) {
      doc.querySelectorAll("a[href]").forEach((link) => {
        const href = processUrl(link.getAttribute("href"));
        if (href) r.push({ type: "link", url: href, text: link.textContent?.trim() || "" });
      });
    }
    if (options.videos) {
      doc.querySelectorAll("video").forEach((v) => {
        const src = processUrl(v.getAttribute("src"));
        if (src) r.push({ type: "video", url: src });
        v.querySelectorAll("source").forEach((s) => { const src = processUrl(s.getAttribute("src")); if (src) r.push({ type: "video", url: src }); });
      });
    }
    if (options.audios) {
      doc.querySelectorAll("audio").forEach((a) => {
        const src = processUrl(a.getAttribute("src"));
        if (src) r.push({ type: "audio", url: src });
      });
    }
    if (options.css) doc.querySelectorAll('link[rel="stylesheet"]').forEach((l) => { const href = processUrl(l.getAttribute("href")); if (href) r.push({ type: "css", url: href }); });
    if (options.js) doc.querySelectorAll("script[src]").forEach((s) => { const src = processUrl(s.getAttribute("src")); if (src) r.push({ type: "js", url: src }); });
    if (options.iframes) doc.querySelectorAll("iframe").forEach((f) => { const src = processUrl(f.getAttribute("src")); if (src) r.push({ type: "iframe", url: src }); });
    if (options.metadata) doc.querySelectorAll("meta").forEach((m) => { const c = m.getAttribute("content"); const n = m.getAttribute("name") || m.getAttribute("property"); if (c && n) r.push({ type: "metadata", url: c, text: n }); });
    if (options.forms) doc.querySelectorAll("form").forEach((f) => { const action = processUrl(f.getAttribute("action")); if (action) r.push({ type: "form", url: action }); });

    if (options.uniqueOnly) {
      const seen = new Set<string>();
      r = r.filter((item) => { const key = `${item.type}-${item.url}`; if (seen.has(key)) return false; seen.add(key); return true; });
    }
    setResults(r);
  }, [htmlInput, baseUrl, options, makeAbsolute]);

  useEffect(() => { extract(); }, [extract]);

  const grouped = useMemo(() => {
    const g: Record<string, ExtractedItem[]> = {};
    results.forEach((item) => { if (!g[item.type]) g[item.type] = []; g[item.type].push(item); });
    return g;
  }, [results]);

  return (
    <>
      <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Left: Input + Options */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between h-10">
                <Label className="text-sm font-medium">输入 (HTML)</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setHtmlInput(EXAMPLE_HTML); }}><Star className="size-3.5" /> 示例</Button>
                  <Button variant="outline" size="sm" onClick={() => { setHtmlInput(""); setResults([]); }} disabled={!htmlInput}><Eraser className="size-3.5" /> 清空</Button>
                </div>
              </div>
              <Input placeholder="Base URL (可选，用于将相对路径转为绝对路径)" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} className="mb-2 bg-white" />
              <div className="h-[300px]">
                <MonacoEditor value={htmlInput} onChange={setHtmlInput} language="html" height="100%" showLineNumbersToggle showWordWrapToggle />
              </div>

              {/* Options */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-xs font-medium text-gray-500">提取内容类型</Label>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => setOptions((p) => ({ ...p, images: true, videos: true, audios: true, links: true, css: true, js: true, iframes: true, metadata: true, forms: true }))}>全选</Button>
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => setOptions((p) => ({ ...p, images: false, videos: false, audios: false, links: false, css: false, js: false, iframes: false, metadata: false, forms: false }))}>全不选</Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {Object.keys(OPTION_LABELS).map((key) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={(options as any)[key]} onCheckedChange={(c) => setOptions({ ...options, [key]: c === true })} />
                      <span className="text-xs">{OPTION_LABELS[key]}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-4 pt-3 border-t border-gray-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={options.uniqueOnly} onCheckedChange={(c) => setOptions({ ...options, uniqueOnly: c === true })} />
                    <span className="text-xs">仅保留唯一项</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={options.absoluteUrls} onCheckedChange={(c) => setOptions({ ...options, absoluteUrls: c === true })} />
                    <span className="text-xs">转为绝对 URL</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right: Results */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between h-10">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">结果</Label>
                  {results.length > 0 && <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">{results.length} 项</span>}
                </div>
                {results.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(results.map((i) => `${i.type}: ${i.url}`).join("\n"))}>
                    <Copy className="size-3.5" /> 复制全部
                  </Button>
                )}
              </div>
              <div className="h-[460px] overflow-y-auto rounded-lg border border-gray-200 bg-white">
                {results.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-gray-400">
                    <FileText className="size-10 opacity-30 mb-3" /> 输入 HTML 后自动提取
                  </div>
                ) : (
                  <div className="p-4 space-y-3">
                    {Object.entries(grouped).map(([type, items]) => (
                      <div key={type} className="rounded-lg border border-gray-100 overflow-hidden">
                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                          <span>{TYPE_EMOJIS[type] || "📄"}</span>
                          <span className="text-xs font-medium uppercase">{type}</span>
                          <span className="text-xs text-gray-400">{items.length}</span>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {items.map((item, i) => (
                            <div key={i} className="p-3 hover:bg-gray-50">
                              <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline break-all font-mono">{item.url}</a>
                              {item.text && <p className="text-xs text-gray-400 mt-1">{item.text}</p>}
                              {item.attributes && Object.keys(item.attributes).length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {Object.entries(item.attributes).filter(([, v]) => v).map(([k, v]) => (
                                    <span key={k} className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{k}: {v}</span>
                                  ))}
                                </div>
                              )}
                              {(item.type === "image" || item.type === "css-background") && (
                                <img src={item.url} alt="" className="mt-2 max-w-full max-h-32 rounded" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
