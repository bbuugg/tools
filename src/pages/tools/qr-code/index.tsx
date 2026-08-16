import { useRef, useState } from "react";
import {
  QrCode,
  ScanLine,
  Copy,
  Download,
  Eraser,
  Star,
  Trash2,
  Check,
} from "lucide-react";
import jsQR from "jsqr";
import JSZip from "jszip";
import QRCode from "qrcode";
import { QRCode as ReactQRCodeLogo } from "react-qrcode-logo";



import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UploadDropZone } from "@/components/ui/upload-dropzone";
import { ColorPickerField } from "@/components/ui/color-picker-field";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

interface GeneratedQR { text: string; dataUrl: string }
interface RecognizedResult { fileName: string; preview?: string; data?: string; error?: string; status: "success" | "error" }

const COLOR_PRESETS = [
  { bg: "#FFFFFF", fg: "#000000", label: "经典黑白" },
  { bg: "#0088CC", fg: "#FFFFFF", label: "蓝白" },
  { bg: "#EF4444", fg: "#FFFFFF", label: "红色" },
  { bg: "#10B981", fg: "#FFFFFF", label: "绿色" },
  { bg: "#6366F1", fg: "#FFFFFF", label: "紫色" },
  { bg: "#262626", fg: "#F5F5F5", label: "暗色" },
  { bg: "#FFFFFF", fg: "#F97316", label: "橙色" },
  { bg: "#FFEDD5", fg: "#7C2D12", label: "暖棕" },
];

export default function QrCodePage() {
  const [mode, setMode] = useState("generate");

  // Generate
  const [text, setText] = useState("");
  const [batchMode, setBatchMode] = useState(false);
  const [generated, setGenerated] = useState<GeneratedQR[]>([]);
  const [qrSize, setQrSize] = useState(300);
  const [qrBgColor, setQrBgColor] = useState("#FFFFFF");
  const [qrFgColor, setQrFgColor] = useState("#000000");
  const [qrMargin, setQrMargin] = useState(2);
  const [qrStyle, setQrStyle] = useState<"squares" | "dots">("squares");
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoWidth, setLogoWidth] = useState(60);
  const [logoHeight, setLogoHeight] = useState(60);
  const [logoOpacity, setLogoOpacity] = useState(1);
  const [removeQrCodeBehindLogo, setRemoveQrCodeBehindLogo] = useState(true);
  const [copied, setCopied] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Recognize
  const [results, setResults] = useState<RecognizedResult[]>([]);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    try {
      if (batchMode) {
        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
        const qrs: GeneratedQR[] = [];
        for (const line of lines) {
          const dataUrl = await QRCode.toDataURL(line, { width: qrSize, margin: qrMargin, color: { dark: qrFgColor, light: qrBgColor } });
          qrs.push({ text: line, dataUrl });
        }
        setGenerated(qrs);
      } else {
        const dataUrl = await QRCode.toDataURL(text.trim(), { width: qrSize, margin: qrMargin, color: { dark: qrFgColor, light: qrBgColor } });
        setGenerated([{ text: text.trim(), dataUrl }]);
      }
    } catch {}
  };

  const generateWithSettings = async (t: string) =>
    QRCode.toDataURL(t, { width: qrSize, margin: qrMargin, color: { dark: qrFgColor, light: qrBgColor }, errorCorrectionLevel: "H" });

  const downloadSingle = async (qr: GeneratedQR, i: number) => {
    const url = await generateWithSettings(qr.text);
    const a = document.createElement("a"); a.href = url; a.download = `qr-code-${i + 1}.png`; a.click();
  };

  const downloadAll = async () => {
    if (!generated.length) return;
    const zip = new JSZip();
    for (let i = 0; i < generated.length; i++) {
      const url = await generateWithSettings(generated[i].text);
      zip.file(`qr-code-${i + 1}.png`, url.split(",")[1], { base64: true });
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `qr-codes-${Date.now()}.zip`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = (ev) => setLogoImage(ev.target?.result as string); r.readAsDataURL(f);
  };

  const processFiles = async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    const rs: RecognizedResult[] = [];
    for (const file of imageFiles) {
      const res: RecognizedResult = { fileName: file.name, status: "error" };
      try {
        const preview = await new Promise<string>((res, rej) => { const r = new FileReader(); r.onload = (e) => res(e.target?.result as string); r.onerror = rej; r.readAsDataURL(file); });
        res.preview = preview;
        const img = new Image(); img.src = preview; await new Promise((res) => { img.onload = res; });
        const canvas = document.createElement("canvas"); canvas.width = img.width; canvas.height = img.height;
        const ctx = canvas.getContext("2d")!; ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) { res.data = code.data; res.status = "success"; } else { res.error = "未找到二维码"; }
      } catch { res.error = "识别失败"; }
      rs.push(res);
    }
    setResults((p) => [...p, ...rs]);
  };

  return (
    <>
            <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

          <Tabs value={mode} onValueChange={setMode}>
            <TabsList className="w-full max-w-xs">
              <TabsTrigger value="generate" className="flex-1"><QrCode className="size-4" /> 生成</TabsTrigger>
              <TabsTrigger value="recognize" className="flex-1"><ScanLine className="size-4" /> 识别</TabsTrigger>
            </TabsList>

            {/* Generate */}
            <TabsContent value="generate" className="mt-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-3 h-8">
                      <Label className="text-sm font-medium">输入文本</Label>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setText("https://www.example.com")}><Star className="size-3.5" /> 示例</Button>
                        <Button variant="outline" size="sm" onClick={() => { setText(""); setGenerated([]); }}><Eraser className="size-3.5" /> 清空</Button>
                      </div>
                    </div>
                    <Textarea className="w-full h-24 rounded-lg p-3 text-sm" value={text} onChange={(e) => setText(e.target.value)} placeholder="输入要生成二维码的内容..." />
                    <div className="flex items-center justify-between mt-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox checked={batchMode} onCheckedChange={(c) => setBatchMode(c === true)} />
                        <span className="text-xs">批量模式（每行一个）</span>
                      </label>
                      <Button onClick={handleGenerate} disabled={!text.trim()}><QrCode className="size-4" /> 生成</Button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">尺寸: {qrSize}px</Label>
                      <Slider min={100} max={500} step={10} value={[qrSize]} onValueChange={(v) => setQrSize(v[0])} />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">边距: {qrMargin}px</Label>
                      <Slider min={0} max={50} value={[qrMargin]} onValueChange={(v) => setQrMargin(v[0])} />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">点阵样式</Label>
                      <div className="flex gap-2">
                        <Button variant={qrStyle === "squares" ? "default" : "outline"} size="sm" onClick={() => setQrStyle("squares")}>方块</Button>
                        <Button variant={qrStyle === "dots" ? "default" : "outline"} size="sm" onClick={() => setQrStyle("dots")}>圆点</Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-xs text-muted-foreground mb-1 block">背景色</Label><ColorPickerField value={qrBgColor} onChange={setQrBgColor} /></div>
                      <div><Label className="text-xs text-muted-foreground mb-1 block">前景色</Label><ColorPickerField value={qrFgColor} onChange={setQrFgColor} /></div>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-2 block">配色预设</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {COLOR_PRESETS.map((p, i) => (
                          <button key={i} className="p-2 border rounded-md hover:border-slate-500 transition-all" onClick={() => { setQrBgColor(p.bg); setQrFgColor(p.fg); }}>
                            <div className="w-4 h-4 rounded-sm mx-auto mb-1" style={{ backgroundColor: p.fg, border: `1px solid ${p.bg}` }} />
                            <span className="text-[10px] block truncate">{p.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Logo */}
                    <div className="pt-3 border-t border-border">
                      <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                      <div className="flex items-center gap-2 mb-2">
                        <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>上传 Logo</Button>
                        {logoImage && <Button variant="ghost" size="sm" onClick={() => setLogoImage(null)}><Trash2 className="size-3" /> 移除</Button>}
                      </div>
                      {logoImage && (
                        <>
                          <div className="bg-muted rounded p-2 mb-3 flex justify-center"><img src={logoImage} alt="" className="max-h-16" /></div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><Label className="text-xs text-muted-foreground mb-1 block">Logo 宽: {logoWidth}px</Label><Slider min={20} max={150} value={[logoWidth]} onValueChange={(v) => setLogoWidth(v[0])} /></div>
                            <div><Label className="text-xs text-muted-foreground mb-1 block">Logo 高: {logoHeight}px</Label><Slider min={20} max={150} value={[logoHeight]} onValueChange={(v) => setLogoHeight(v[0])} /></div>
                          </div>
                          <div className="mt-2"><Label className="text-xs text-muted-foreground mb-1 block">不透明度: {Math.round(logoOpacity * 100)}%</Label><Slider min={0} max={1} step={0.1} value={[logoOpacity]} onValueChange={(v) => setLogoOpacity(v[0])} /></div>
                          <label className="flex items-center gap-2 mt-2 cursor-pointer"><Checkbox checked={removeQrCodeBehindLogo} onCheckedChange={(c) => setRemoveQrCodeBehindLogo(c === true)} /><span className="text-xs">Logo 后方去除二维码</span></label>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-center justify-between mb-3 h-8">
                    <Label className="text-sm font-medium">生成结果 {generated.length > 0 && `(${generated.length})`}</Label>
                    {generated.length > 0 && <Button size="sm" onClick={downloadAll}><Download className="size-3.5" /> 下载全部</Button>}
                  </div>
                  {generated.length === 0 ? (
                    <div className="flex h-64 items-center justify-center text-muted-foreground"><QrCode className="size-12 opacity-20" /></div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
                      {generated.map((qr, i) => (
                        <div key={i} className="text-center border border-border rounded-lg p-3">
                          <div className="bg-card p-2 rounded mb-2 flex justify-center">
                            <ReactQRCodeLogo value={qr.text} size={Math.min(qrSize, 200)} bgColor={qrBgColor} fgColor={qrFgColor} logoImage={logoImage || undefined} logoWidth={logoWidth} logoHeight={logoHeight} logoOpacity={logoOpacity} removeQrCodeBehindLogo={removeQrCodeBehindLogo} qrStyle={qrStyle === "dots" ? "dots" : "squares"} quietZone={qrMargin} ecLevel="H" />
                          </div>
                          <p className="text-xs truncate mb-2" title={qr.text}>{qr.text}</p>
                          <div className="flex justify-center gap-1">
                            <Button variant="ghost" size="icon-xs" onClick={() => { navigator.clipboard.writeText(qr.text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? <Check className="size-3" /> : <Copy className="size-3" />}</Button>
                            <Button variant="ghost" size="icon-xs" onClick={() => downloadSingle(qr, i)}><Download className="size-3" /></Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Recognize */}
            <TabsContent value="recognize" className="mt-4">
              <div className="space-y-4">
                <UploadDropZone
                  multiple
                  accept="image/*"
                  onFiles={processFiles}
                  className="rounded-xl"
                  emptyHint="点击上传或悬停粘贴二维码图片"
                  icon={<ScanLine className="size-8 opacity-40" />}
                />

                {results.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-sm font-medium">识别结果 ({results.length})</Label>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(results.filter((r) => r.status === "success" && r.data).map((r) => r.data).join("\n"))}><Copy className="size-3.5" /> 复制全部</Button>
                        <Button variant="outline" size="sm" onClick={() => setResults([])}><Eraser className="size-3.5" /> 清空</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {results.map((r, i) => (
                        <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${r.status === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                          {r.preview && <img src={r.preview} alt="" className="w-12 h-12 object-cover rounded shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground">{r.fileName}</p>
                            {r.status === "success" ? <p className="text-sm text-green-700 font-mono break-all mt-1">{r.data}</p> : <p className="text-xs text-red-500 mt-1">{r.error}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
          </>
  );
}
