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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle2,
  Copy,
  Download,
  Eye,
  KeyRound,
  Lock,
  TriangleAlert,
  XCircle
} from "lucide-react";
import { useState } from "react";

import MonacoEditor from "@/components/MonacoEditor"

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const base64UrlEncode = (data: Uint8Array) =>
  btoa(String.fromCharCode(...data)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

const base64UrlDecode = (str: string): Uint8Array => {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binStr = atob(padded);
  return Uint8Array.from(binStr, (c) => c.charCodeAt(0));
};

const strToBase64Url = (str: string) => base64UrlEncode(textEncoder.encode(str));
const base64UrlToStr = (str: string) => textDecoder.decode(base64UrlDecode(str));

const importKey = async (secret: string, alg: string) =>
  window.crypto.subtle.importKey("raw", textEncoder.encode(secret), {
    name: "HMAC",
    hash: { name: alg === "HS256" ? "SHA-256" : alg === "HS384" ? "SHA-384" : "SHA-512" },
  }, false, ["sign", "verify"]);

const signJWT = async (header: string, payload: string, secret: string, alg: string) => {
  const key = await importKey(secret, alg);
  const data = textEncoder.encode(`${header}.${payload}`);
  const sig = await window.crypto.subtle.sign("HMAC", key, data);
  return base64UrlEncode(new Uint8Array(sig));
};

const verifyJWT = async (token: string, secret: string) => {
  const [h, p, s] = token.split(".");
  if (!h || !p || !s) return false;
  let alg = "HS256";
  try { const hdr = JSON.parse(base64UrlToStr(h)); if (["HS256", "HS384", "HS512"].includes(hdr.alg)) alg = hdr.alg; } catch { }
  const key = await importKey(secret, alg);
  return window.crypto.subtle.verify("HMAC", key, base64UrlDecode(s).buffer as ArrayBuffer, textEncoder.encode(`${h}.${p}`));
};

export default function JwtPage() {
  const [mode, setMode] = useState("encode");

  // Encode
  const [header, setHeader] = useState(JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2));
  const [payload, setPayload] = useState(JSON.stringify({ sub: "1234567890", name: "John Doe", iat: Math.floor(Date.now() / 1000) }, null, 2));
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [alg, setAlg] = useState("HS256");
  const [token, setToken] = useState("");
  const [encodeError, setEncodeError] = useState("");

  // Decode
  const [decodeToken, setDecodeToken] = useState("");
  const [decodedHeader, setDecodedHeader] = useState("");
  const [decodedPayload, setDecodedPayload] = useState("");
  const [decodeSecret, setDecodeSecret] = useState("");
  const [decodeError, setDecodeError] = useState("");
  const [verifyResult, setVerifyResult] = useState<"valid" | "invalid" | null>(null);

  const handleGenerate = async () => {
    setEncodeError("");
    try {
      const h = strToBase64Url(JSON.stringify(JSON.parse(header)));
      const p = strToBase64Url(JSON.stringify(JSON.parse(payload)));
      const s = await signJWT(h, p, secret, alg);
      setToken(`${h}.${p}.${s}`);
    } catch (e) {
      setEncodeError((e as Error).message || "生成失败");
    }
  };

  const handleDecode = async () => {
    setDecodeError("");
    setDecodedHeader("");
    setDecodedPayload("");
    setVerifyResult(null);
    const parts = decodeToken.trim().split(".");
    if (parts.length !== 3) { setDecodeError("JWT 格式无效，应为 header.payload.signature"); return; }
    try {
      const h = JSON.stringify(JSON.parse(base64UrlToStr(parts[0])), null, 2);
      const p = JSON.stringify(JSON.parse(base64UrlToStr(parts[1])), null, 2);
      setDecodedHeader(h);
      setDecodedPayload(p);

      // 如果提供了密钥，则验证签名
      if (decodeSecret) {
        try {
          const valid = await verifyJWT(decodeToken.trim(), decodeSecret);
          setVerifyResult(valid ? "valid" : "invalid");
        } catch {
          setVerifyResult("invalid");
        }
      }
    } catch {
      setDecodeError("解码失败，请检查 Token 是否正确");
    }
  };

  return (
    <>
      <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

          <Tabs value={mode} onValueChange={setMode}>
            <TabsList className="w-full max-w-xs">
              <TabsTrigger value="encode" className="flex-1"><Lock className="size-4" /> 编码</TabsTrigger>
              <TabsTrigger value="decode" className="flex-1"><Eye className="size-4" /> 解码</TabsTrigger>
            </TabsList>

            {/* Encode */}
            <TabsContent value="encode" className="mt-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">Header</Label>
                  <div className="h-[200px]"><MonacoEditor value={header} onChange={setHeader} language="json" height="100%" showLineNumbersToggle showWordWrapToggle /></div>
                  <Label className="text-sm font-medium">Payload</Label>
                  <div className="h-[200px]"><MonacoEditor value={payload} onChange={setPayload} language="json" height="100%" showLineNumbersToggle showWordWrapToggle /></div>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">密钥与算法</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-500 mb-1 block">密钥</Label>
                      <Input className="bg-white" value={secret} onChange={(e) => setSecret(e.target.value)} />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">算法</Label>
                      <Select value={alg} onValueChange={setAlg}>
                        <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HS256">HS256</SelectItem>
                          <SelectItem value="HS384">HS384</SelectItem>
                          <SelectItem value="HS512">HS512</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button onClick={handleGenerate} disabled={!header || !payload}><Lock className="size-4" /> 生成 Token</Button>
                  {encodeError && <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"><TriangleAlert className="size-4 shrink-0" />{encodeError}</div>}
                  {token && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">生成的 Token</Label>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(token)}><Copy className="size-3.5" /> 复制</Button>
                          <Button variant="outline" size="sm" onClick={() => { const b = new Blob([token], { type: "text/plain" }); const u = URL.createObjectURL(b); const a = document.createElement("a"); a.href = u; a.download = "token.jwt"; a.click(); }}><Download className="size-3.5" /> 下载</Button>
                        </div>
                      </div>
                      <div className="rounded-lg border border-green-200 bg-green-50 p-3 max-h-48 overflow-auto">
                        <p className="font-mono text-xs text-green-700 break-all">{token}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Decode */}
            <TabsContent value="decode" className="mt-4">
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm font-medium">JWT Token</Label>
                  <Textarea
                    className="w-full rounded-lg border border-gray-200 p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
                    rows={4}
                    value={decodeToken}
                    onChange={(e) => setDecodeToken(e.target.value)}
                    placeholder="粘贴 JWT Token..."
                  />
                  <div className="flex items-center gap-3">
                    <Input className="flex-1 bg-white" placeholder="密钥（可选，用于验证签名）" value={decodeSecret} onChange={(e) => setDecodeSecret(e.target.value)} />
                    <Button onClick={handleDecode} disabled={!decodeToken}><Eye className="size-4" /> 解码</Button>
                  </div>
                </div>
                {decodeError && <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"><TriangleAlert className="size-4 shrink-0" />{decodeError}</div>}
                {verifyResult && (
                  <div className={`flex items-center gap-3 rounded-lg border p-4 ${verifyResult === "valid" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                    {verifyResult === "valid" ? <CheckCircle2 className="size-5 shrink-0" /> : <XCircle className="size-5 shrink-0" />}
                    <div>
                      <p className="font-medium">{verifyResult === "valid" ? "签名验证通过" : "签名验证不通过"}</p>
                      <p className="text-xs mt-1 opacity-80">{verifyResult === "valid" ? "Token 的签名与提供的密钥匹配" : "Token 的签名与提供的密钥不匹配"}</p>
                    </div>
                  </div>
                )}
                {(decodedHeader || decodedPayload) && (
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-medium">Header</Label>
                      <div className="h-[280px]"><MonacoEditor value={decodedHeader} readOnly language="json" height="100%" showCopyButton showWordWrapToggle /></div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-sm font-medium">Payload</Label>
                      <div className="h-[280px]"><MonacoEditor value={decodedPayload} readOnly language="json" height="100%" showCopyButton showWordWrapToggle /></div>
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
