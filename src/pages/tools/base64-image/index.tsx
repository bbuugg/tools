import {
    Check,
    Copy,
    Download,
    Eraser,
    FileText,
    Image as ImageIcon,
    Star,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";

import logoImage from "@/assets/logo.webp";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { UploadDropZone } from "@/components/ui/upload-dropzone";
import { type SiteDefination } from "@/lib/site";

function inferMime(base64: string): string {
    const f = base64.substring(0, 4);
    if (f.startsWith("/9j/")) return "image/jpeg";
    if (f.startsWith("iVBO") || f.startsWith("IVBO")) return "image/png";
    if (f.startsWith("R0lG")) return "image/gif";
    if (f.startsWith("UklG")) return "image/webp";
    if (f.startsWith("PHN2")) return "image/svg+xml";
    return "image/png";
}

function mimeToExt(mime: string): string {
    const map: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif", "image/bmp": "bmp", "image/svg+xml": "svg", "image/webp": "webp" };
    return map[mime] || "png";
}

export default function Base64ImagePage({ title, description }: SiteDefination) {
    const [mode, setMode] = useState("decode");

    // Base64 → Image
    const [base64Input, setBase64Input] = useState("");
    const [imageOutput, setImageOutput] = useState<string | null>(null);
    const [mimeType, setMimeType] = useState("");
    const [fileName, setFileName] = useState("image.png");
    const [copied, setCopied] = useState(false);

    // Image → Base64
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [base64Output, setBase64Output] = useState("");
    const [rawBase64, setRawBase64] = useState("");
    const [withPrefix, setWithPrefix] = useState(true);

    useEffect(() => {
        if (!base64Input.trim()) { setImageOutput(null); setMimeType(""); return; }
        const input = base64Input.trim();
        if (input.startsWith("data:")) {
            const m = input.match(/^data:([^;]+);base64,/);
            if (m) { setMimeType(m[1]); setImageOutput(input); setFileName(`image.${mimeToExt(m[1])}`); }
        } else {
            const mime = inferMime(input);
            setMimeType(mime);
            setImageOutput(`data:${mime};base64,${input}`);
            setFileName(`image.${mimeToExt(mime)}`);
        }
    }, [base64Input]);

    // 将项目 Logo 转为 Base64 作为示例
    const handleExample = async () => {
        try {
            const res = await fetch(logoImage);
            const blob = await res.blob();
            const reader = new FileReader();
            reader.onload = () => {
                const dataUrl = reader.result as string;
                setBase64Input(dataUrl.split(",")[1] ?? "");
            };
            reader.readAsDataURL(blob);
        } catch {
            // ignore
        }
    };

    const handleUpload = (files: File[]) => {
        const file = files[0];
        if (!file) return;
        setUploadedFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => {
            const result = ev.target?.result as string;
            setUploadedImage(result);
            const raw = result.split(",")[1];
            setRawBase64(raw);
            setBase64Output(withPrefix ? result : raw);
        };
        reader.readAsDataURL(file);
    };

    const togglePrefix = () => {
        const next = !withPrefix;
        setWithPrefix(next);
        setBase64Output(next ? (uploadedImage || "") : rawBase64);
    };

    return (
        <>
                        <div>
                <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
                            <ImageIcon className="size-5" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                            <p className="text-sm text-gray-500">{description}</p>
                        </div>
                    </div>

                    <Tabs value={mode} onValueChange={setMode}>
                        <TabsList className="w-full max-w-xs">
                            <TabsTrigger value="decode" className="flex-1">Base64 → 图片</TabsTrigger>
                            <TabsTrigger value="encode" className="flex-1">图片 → Base64</TabsTrigger>
                        </TabsList>

                        {/* Base64 → Image */}
                        <TabsContent value="decode" className="mt-4">
                            <div className="grid gap-4 lg:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between h-10">
                                        <Label className="text-sm font-medium">Base64 输入</Label>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" onClick={handleExample}><Star className="size-3.5" /> 示例</Button>
                                            <Button variant="outline" size="sm" onClick={() => { setBase64Input(""); setImageOutput(null); }} disabled={!base64Input}><Eraser className="size-3.5" /> 清空</Button>
                                            {base64Input && <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(base64Input); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} 复制</Button>}
                                        </div>
                                    </div>
                                    <Textarea
                                        className="w-full bg-white! h-[340px] rounded-lg border border-gray-200 p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                                        value={base64Input}
                                        onChange={(e) => setBase64Input(e.target.value)}
                                        placeholder="粘贴 Base64 字符串..."
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center h-10">
                                        <Label className="text-sm font-medium">图片预览{mimeType && ` (${mimeType})`}</Label>
                                    </div>
                                    <div className="h-[340px] flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white">
                                        {imageOutput ? <img src={imageOutput} alt="Preview" className="max-w-full max-h-full object-contain" /> : <ImageIcon className="size-12 opacity-20" />}
                                    </div>
                                    {imageOutput && (
                                        <div className="flex items-center gap-2">
                                            <Input value={fileName} onChange={(e) => setFileName(e.target.value)} className="flex-1" />
                                            <Button onClick={() => { const a = document.createElement("a"); a.href = imageOutput; a.download = fileName; a.click(); }}><Download className="size-4" /> 下载</Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* Image → Base64 */}
                        <TabsContent value="encode" className="mt-4">
                            <div className="grid gap-4 lg:grid-cols-2">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center h-10">
                                        <Label className="text-sm font-medium">选择图片</Label>
                                    </div>
                                    <UploadDropZone
                                        accept="image/*"
                                        maxSize={10 * 1024 * 1024}
                                        onFiles={handleUpload}
                                        className="h-[280px]"
                                        emptyHint="点击选择图片"
                                        emptySubHint="支持 PNG, JPG, GIF, SVG, WebP（最大 10MB）"
                                    >
                                        {uploadedImage ? (
                                            <div className="flex flex-col items-center gap-2">
                                                <img src={uploadedImage} alt="" className="max-h-36 max-w-full object-contain" />
                                                <span className="text-xs text-gray-500">{uploadedFile?.name}</span>
                                                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setUploadedImage(null); setBase64Output(""); }}><X className="size-3" /> 移除</Button>
                                            </div>
                                        ) : null}
                                    </UploadDropZone>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between h-10">
                                        <Label className="text-sm font-medium">Base64 输出</Label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <Switch checked={withPrefix} onCheckedChange={togglePrefix} />
                                            <span className="text-xs text-gray-500">包含 Data URL 前缀</span>
                                        </label>
                                    </div>
                                    {base64Output ? (
                                        <>
                                            <Textarea className="w-full h-[280px] rounded-lg border border-gray-200 p-3 font-mono text-xs" value={base64Output} readOnly />
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(base64Output)}><Copy className="size-3.5" /> 复制</Button>
                                                <Button variant="outline" size="sm" onClick={() => { const b = new Blob([base64Output], { type: "text/plain" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = `${uploadedFile?.name || "image"}.txt`; a.click(); }}><Download className="size-3.5" /> 保存为文件</Button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-[280px] flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-white text-gray-400">
                                            <FileText className="size-10 opacity-30" /> 上传图片后显示 Base64
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
                    </>
    );
}
