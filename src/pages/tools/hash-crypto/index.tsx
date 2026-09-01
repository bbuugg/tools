import { Eye, EyeOff } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import TextToolLayout from "@/components/TextToolLayout";
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
import { Switch } from "@/components/ui/switch";
import {
  aesDecrypt,
  aesEncrypt,
  computeHash,
  computeHmac,
  type AesMode,
  type AesPadding,
  type CaseMode,
  type HashAlgo,
  type KeyFormat,
  type OutputFormat,
} from "@/lib/crypto";

type CryptoType = "md5" | "sha1" | "sha256" | "sha512" | "hmac" | "aes";
type AesDirection = "encrypt" | "decrypt";

const CRYPTO_TYPES: { value: CryptoType; label: string }[] = [
  { value: "md5", label: "MD5" },
  { value: "sha1", label: "SHA1" },
  { value: "sha256", label: "SHA256" },
  { value: "sha512", label: "SHA512" },
  { value: "hmac", label: "HMAC" },
  { value: "aes", label: "AES" },
];

const HASH_ALGOS: { value: HashAlgo; label: string }[] = [
  { value: "md5", label: "MD5" },
  { value: "sha1", label: "SHA1" },
  { value: "sha256", label: "SHA256" },
  { value: "sha512", label: "SHA512" },
];

const AES_MODES: { value: AesMode; label: string }[] = [
  { value: "CBC", label: "CBC" },
  { value: "ECB", label: "ECB" },
  { value: "CTR", label: "CTR" },
  { value: "CFB", label: "CFB" },
  { value: "OFB", label: "OFB" },
];

const AES_PADDINGS: { value: AesPadding; label: string }[] = [
  { value: "Pkcs7", label: "PKCS7" },
  { value: "ZeroPadding", label: "ZeroPadding" },
  { value: "NoPadding", label: "NoPadding" },
  { value: "Iso10126", label: "ISO10126" },
  { value: "AnsiX923", label: "AnsiX923" },
];

const FORMATS: { value: OutputFormat; label: string }[] = [
  { value: "hex", label: "Hex" },
  { value: "base64", label: "Base64" },
];

const CASES: { value: CaseMode; label: string }[] = [
  { value: "lower", label: "小写" },
  { value: "upper", label: "大写" },
];

const KEY_FORMATS: { value: KeyFormat; label: string }[] = [
  { value: "text", label: "文本" },
  { value: "hex", label: "Hex" },
];

const EXAMPLE = "Hello, World!";

/** 一行带标签的控件 */
function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Label className="shrink-0 text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function SizedSelect({
  value,
  onChange,
  options,
  className = "h-8 w-28",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function KeyInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex items-center gap-1.5">
      <Input
        // 关键：用普通文本框（type=text）+ CSS 字符掩码模拟密码框，
        // 而不是 type=password。这样浏览器不会把它识别为登录密码框，
        // 从而彻底禁止密码管理器自动回填 / 保存密钥（也不会误填搜索框）。
        type="text"
        autoComplete="off"
        style={
          show ? undefined : ({ WebkitTextSecurity: "disc" } as React.CSSProperties)
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 w-48"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => setShow((s) => !s)}
        title={show ? "隐藏" : "显示"}
      >
        {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </Button>
    </div>
  );
}

export default function HashCryptoPage() {
  const [input, setInput] = useState("");
  const [type, setType] = useState<CryptoType>("md5");

  // 哈希 / HMAC 通用
  const [outFmt, setOutFmt] = useState<OutputFormat>("hex");
  const [caseMode, setCaseMode] = useState<CaseMode>("lower");

  // HMAC
  const [hmacAlgo, setHmacAlgo] = useState<HashAlgo>("sha256");
  const [hmacKey, setHmacKey] = useState("");

  // AES
  const [aesDir, setAesDir] = useState<AesDirection>("encrypt");
  const [aesMode, setAesMode] = useState<AesMode>("CBC");
  const [aesPadding, setAesPadding] = useState<AesPadding>("Pkcs7");
  const [aesKey, setAesKey] = useState("");
  const [aesKeyFmt, setAesKeyFmt] = useState<KeyFormat>("text");
  const [aesIv, setAesIv] = useState("");
  const [aesIvFmt, setAesIvFmt] = useState<KeyFormat>("text");

  const isHash = type !== "hmac" && type !== "aes";
  const isHmac = type === "hmac";
  const isAes = type === "aes";

  const result = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      let output = "";
      if (isHash) {
        output = computeHash(type as HashAlgo, input, outFmt, caseMode);
      } else if (isHmac) {
        if (!hmacKey) return { output: "", error: "请输入 HMAC 密钥" };
        output = computeHmac(hmacAlgo, input, hmacKey, outFmt, caseMode);
      } else {
        if (!aesKey) return { output: "", error: "请输入 AES 密钥" };
        const opts = {
          key: aesKey,
          keyFmt: aesKeyFmt,
          iv: aesIv,
          ivFmt: aesIvFmt,
          mode: aesMode,
          padding: aesPadding,
          format: outFmt,
        };
        output =
          aesDir === "encrypt"
            ? aesEncrypt(input, opts)
            : aesDecrypt(input, opts);
      }
      return { output, error: "" };
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : "处理失败" };
    }
  }, [
    input,
    type,
    isHash,
    isHmac,
    outFmt,
    caseMode,
    hmacAlgo,
    hmacKey,
    aesDir,
    aesKey,
    aesKeyFmt,
    aesIv,
    aesIvFmt,
    aesMode,
    aesPadding,
  ]);

  const typeLabel = CRYPTO_TYPES.find((t) => t.value === type)?.label ?? "";
  const outputLabel = isAes
    ? `AES ${aesDir === "encrypt" ? "加密" : "解密"}`
    : isHmac
      ? `HMAC-${hmacAlgo.toUpperCase()}`
      : `${typeLabel} 哈希`;

  const loadExample = () => {
    setInput(EXAMPLE);
    if (isHmac) {
      if (!hmacKey) setHmacKey("my-secret-key");
    } else if (isAes) {
      if (!aesKey) setAesKey("my-secret-key-123");
      if (aesMode !== "ECB" && !aesIv) setAesIv("1234567890abcdef");
    }
  };

  return (
    <TextToolLayout
      input={input}
      onInputChange={setInput}
      output={result.output}
      error={result.error}
      outputLabel={outputLabel}
      downloadName="hash-crypto-result.txt"
      onExample={loadExample}
      onSwap={
        isAes
          ? () => {
              setInput(result.output);
              setAesDir((p) => (p === "encrypt" ? "decrypt" : "encrypt"));
            }
          : undefined
      }
      options={
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <Field label="算法">
              <SizedSelect
                value={type}
                onChange={(v) => setType(v as CryptoType)}
                options={CRYPTO_TYPES}
                className="h-8 w-32"
              />
            </Field>

            {/* 哈希 / HMAC 输出格式 + 大小写 */}
            {(isHash || isHmac) && (
              <>
                <Field label="输出格式">
                  <SizedSelect
                    value={outFmt}
                    onChange={(v) => setOutFmt(v as OutputFormat)}
                    options={FORMATS}
                  />
                </Field>
                <Field label="大小写">
                  <SizedSelect
                    value={caseMode}
                    onChange={(v) => setCaseMode(v as CaseMode)}
                    options={CASES}
                    className="h-8 w-20"
                  />
                </Field>
              </>
            )}
          </div>

          {/* HMAC 参数 */}
          {isHmac && (
            <div className="flex flex-wrap items-center gap-4 rounded-md bg-muted p-3">
              <Field label="HMAC 算法">
                <SizedSelect
                  value={hmacAlgo}
                  onChange={(v) => setHmacAlgo(v as HashAlgo)}
                  options={HASH_ALGOS}
                />
              </Field>
              <Field label="密钥">
                <KeyInput
                  value={hmacKey}
                  onChange={setHmacKey}
                  placeholder="输入 HMAC 密钥"
                />
              </Field>
            </div>
          )}

          {/* AES 参数 */}
          {isAes && (
            <div className="space-y-3 rounded-md bg-muted p-3">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className={
                      aesDir === "encrypt"
                        ? "font-medium text-primary"
                        : "text-muted-foreground"
                    }
                  >
                    加密
                  </span>
                  <Switch
                    size="sm"
                    checked={aesDir === "decrypt"}
                    onCheckedChange={(c) =>
                      setAesDir(c ? "decrypt" : "encrypt")
                    }
                  />
                  <span
                    className={
                      aesDir === "decrypt"
                        ? "font-medium text-primary"
                        : "text-muted-foreground"
                    }
                  >
                    解密
                  </span>
                </div>
                <Field label="模式">
                  <SizedSelect
                    value={aesMode}
                    onChange={(v) => setAesMode(v as AesMode)}
                    options={AES_MODES}
                  />
                </Field>
                <Field label="填充">
                  <SizedSelect
                    value={aesPadding}
                    onChange={(v) => setAesPadding(v as AesPadding)}
                    options={AES_PADDINGS}
                    className="h-8 w-32"
                  />
                </Field>
                <Field label={aesDir === "encrypt" ? "输出格式" : "输入格式"}>
                  <SizedSelect
                    value={outFmt}
                    onChange={(v) => setOutFmt(v as OutputFormat)}
                    options={FORMATS}
                  />
                </Field>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Field label="密钥">
                  <KeyInput
                    value={aesKey}
                    onChange={setAesKey}
                    placeholder="输入 AES 密钥"
                  />
                </Field>
                <Field label="密钥格式">
                  <SizedSelect
                    value={aesKeyFmt}
                    onChange={(v) => setAesKeyFmt(v as KeyFormat)}
                    options={KEY_FORMATS}
                    className="h-8 w-20"
                  />
                </Field>
                {aesMode !== "ECB" && (
                  <>
                    <Field label="IV">
                      <KeyInput
                        value={aesIv}
                        onChange={setAesIv}
                        placeholder="初始化向量（可选）"
                      />
                    </Field>
                    <Field label="IV 格式">
                      <SizedSelect
                        value={aesIvFmt}
                        onChange={(v) => setAesIvFmt(v as KeyFormat)}
                        options={KEY_FORMATS}
                        className="h-8 w-20"
                      />
                    </Field>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      }
    />
  );
}
