import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import * as CryptoJS from "crypto-js";
import * as yaml from "js-yaml";
import {
  ArrowLeftRight,
  Check,
  Copy,
  Download,
  Eraser,
  FileCog,
  FileText,
  Info,
  Link2,
  Lock,
  Scissors,
  Star,
  TriangleAlert,
  Type,
} from "lucide-react";
import { useMemo, useState } from "react";

import MonacoEditor from "@/components/MonacoEditor";

// ─── Types ───────────────────────────────────────────────────────

type ToolId = "encode" | "crypto" | "strip" | "ymlprops";

type EncodeType = "url" | "base64" | "base64url" | "unicode" | "htmlEntity" | "htmlEscape" | "quotedPrintable";
type EncodeDir = "encode" | "decode";

type CryptoType = "md5" | "sha1" | "sha256" | "sha512" | "aes";
type CryptoDir = "encrypt" | "decrypt";

type StripOption = "both" | "start" | "end" | "all" | "newlines";

type YmlDir = "yml_to_properties" | "properties_to_yml";

interface ComputeResult {
  output: string;
  error: string;
}

const EMPTY_RESULT: ComputeResult = { output: "", error: "" };

// ─── Helpers ─────────────────────────────────────────────────────

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── CopyButton ──────────────────────────────────────────────────

function CopyButton({ text, disabled }: { text: string; disabled?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={disabled || !text}
      onClick={() => {
        copyToClipboard(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "已复制" : "复制"}
    </Button>
  );
}

// ─── Text Metadata (TextCounter replacement) ─────────────────────

interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  chineseCharacters: number;
  englishWords: number;
  chineseWords: number;
  totalWords: number;
  sentences: number;
  paragraphs: number;
  lines: number;
}

function computeStats(text: string): TextStats {
  if (!text) {
    return {
      characters: 0,
      charactersNoSpaces: 0,
      chineseCharacters: 0,
      englishWords: 0,
      chineseWords: 0,
      totalWords: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
    };
  }
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const chineseCharacters = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = text.match(/[a-zA-Z]+/g)?.length || 0;
  const chineseText = text.match(/[\u4e00-\u9fa5]+/g)?.join("") || "";
  const chineseWords = Math.ceil(chineseText.length / 2);
  const totalWords = englishWords + chineseWords;
  const sentences =
    (text.match(/[.!?。！？]+/g) || []).length || (text.length > 0 ? 1 : 0);
  const paragraphs =
    text.split(/\n\s*\n/).filter(Boolean).length || (text.length > 0 ? 1 : 0);
  const lines = text.split("\n").length;
  return {
    characters,
    charactersNoSpaces,
    chineseCharacters,
    englishWords,
    chineseWords,
    totalWords,
    sentences,
    paragraphs,
    lines,
  };
}

function TextStatsPopover({ text }: { text: string }) {
  const stats = useMemo(() => computeStats(text), [text]);
  const items = [
    { label: "总字符", value: stats.characters, color: "text-blue-600" },
    { label: "不含空格", value: stats.charactersNoSpaces, color: "text-blue-600" },
    { label: "中文字符", value: stats.chineseCharacters, color: "text-purple-600" },
    { label: "总词数", value: stats.totalWords, color: "text-amber-600" },
    { label: "英文单词", value: stats.englishWords, color: "text-cyan-600" },
    { label: "中文词数", value: stats.chineseWords, color: "text-orange-600" },
    { label: "句子", value: stats.sentences, color: "text-red-600" },
    { label: "段落", value: stats.paragraphs, color: "text-indigo-600" },
    { label: "行数", value: stats.lines, color: "text-pink-600" },
  ];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          title="文本统计"
          disabled={!text}
        >
          <Info className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3">
        <div className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Type className="size-3.5" />
          文本统计
        </div>
        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-md bg-muted px-2 py-1.5 text-center"
            >
              <div className={`text-base font-bold ${item.color}`}>
                {item.value}
              </div>
              <div className="text-[10px] text-muted-foreground">{item.label}</div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ═════════════════════════════════════════════════════════════════
// Encoding / Decoding functions
// ═════════════════════════════════════════════════════════════════

function encodeText(type: EncodeType, input: string): string {
  switch (type) {
    case "url":
      return encodeURIComponent(input);
    case "base64":
      return btoa(unescape(encodeURIComponent(input)));
    case "base64url":
      return btoa(unescape(encodeURIComponent(input))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    case "unicode":
      return Array.from(input)
        .map((char) => {
          const code = char.charCodeAt(0);
          if (code > 127) return `\\u${code.toString(16).padStart(4, "0")}`;
          return char;
        })
        .join("");
    case "htmlEntity":
      return Array.from(input)
        .map((char) => `&#x${char.codePointAt(0)?.toString(16).toLowerCase()};`)
        .join("");
    case "htmlEscape": {
      const el = document.createElement("div");
      el.textContent = input;
      return el.innerHTML;
    }
    case "quotedPrintable":
      return quotedPrintableEncode(input);
  }
}

function decodeText(type: EncodeType, input: string): string {
  switch (type) {
    case "url":
      return decodeURIComponent(input);
    case "base64":
      return decodeURIComponent(escape(atob(input)));
    case "base64url": {
      let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4) b64 += "=";
      return decodeURIComponent(escape(atob(b64)));
    }
    case "unicode":
      return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, g) =>
        String.fromCharCode(parseInt(g, 16)),
      );
    case "htmlEntity":
      return input.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
        String.fromCodePoint(parseInt(hex, 16)),
      );
    case "htmlEscape": {
      const el = document.createElement("div");
      el.innerHTML = input;
      return el.textContent || "";
    }
    case "quotedPrintable":
      return quotedPrintableDecode(input);
  }
}

// ─── Quoted-Printable (RFC 2045 / MIME) ──────────────────────────
// Encodes UTF-8 bytes; printable ASCII stays literal, everything else
// becomes =XX (uppercase hex). Lines are wrapped at 76 chars with soft
// breaks ("=\r\n"). Trailing whitespace is encoded to stay standards-compliant.

function quotedPrintableEncode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let result = "";
  let lineLen = 0;

  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];

    // Hard line breaks (CRLF / LF) are emitted literally.
    if (b === 0x0d || b === 0x0a) {
      result += b === 0x0d ? "\r\n" : "\n";
      if (b === 0x0d && bytes[i + 1] === 0x0a) i++;
      lineLen = 0;
      continue;
    }

    let token: string;
    const isPlain =
      (b >= 0x21 && b <= 0x3c) || // ! through <
      (b >= 0x3e && b <= 0x7e) || // > through ~
      b === 0x09 || // tab
      b === 0x20; // space

    if (isPlain) {
      // Space / tab must be encoded if it sits before a line break or EOF.
      const nextIsBreak =
        bytes[i + 1] === 0x0d || bytes[i + 1] === 0x0a || i === bytes.length - 1;
      if ((b === 0x09 || b === 0x20) && nextIsBreak) {
        token = "=" + b.toString(16).toUpperCase().padStart(2, "0");
      } else {
        token = String.fromCharCode(b);
      }
    } else {
      token = "=" + b.toString(16).toUpperCase().padStart(2, "0");
    }

    // Soft line break when the token would exceed the 76-char limit.
    if (lineLen + token.length > 76) {
      result += "=\r\n";
      lineLen = 0;
    }
    result += token;
    lineLen += token.length;
  }

  return result;
}

function quotedPrintableDecode(input: string): string {
  // Strip soft line breaks first.
  const cleaned = input.replace(/=\r?\n/g, "");
  const bytes: number[] = [];
  const re = /=(?:([0-9A-Fa-f]{2})|$)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cleaned)) !== null) {
    const segment = cleaned.slice(lastIndex, m.index);
    for (let i = 0; i < segment.length; i++) bytes.push(segment.charCodeAt(i));
    if (m[1]) bytes.push(parseInt(m[1], 16));
    lastIndex = re.lastIndex;
  }
  const rest = cleaned.slice(lastIndex);
  for (let i = 0; i < rest.length; i++) bytes.push(rest.charCodeAt(i));
  return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
}


// YML ↔ Properties conversion functions
// ═════════════════════════════════════════════════════════════════

function flattenObject(obj: unknown, prefix = "", result: Record<string, string> = {}) {
  if (obj !== null && typeof obj === "object" && !Array.isArray(obj)) {
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      flattenObject((obj as Record<string, unknown>)[key], newKey, result);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const newKey = `${prefix}[${index}]`;
      flattenObject(item, newKey, result);
    });
  } else {
    result[prefix] = obj === null || obj === undefined ? "" : String(obj);
  }
  return result;
}

function ymlToProperties(ymlContent: string, opts: { delimiter: string; escapeUnicode: boolean; sortKeys: boolean }): string {
  const parsed = yaml.load(ymlContent);
  if (parsed === null || parsed === undefined) return "";
  if (typeof parsed !== "object") return String(parsed);
  const flat = flattenObject(parsed);
  let keys = Object.keys(flat);
  if (opts.sortKeys) keys = keys.sort();
  const delim = opts.delimiter === "colon" ? ":" : "=";
  const lines: string[] = [];
  for (const key of keys) {
    let val = flat[key];
    if (opts.escapeUnicode) {
      val = val.replace(/[\u0080-\uffff]/g, (ch) => {
        const code = ch.charCodeAt(0);
        return `\\u${code.toString(16).padStart(4, "0")}`;
      });
    }
    lines.push(`${key}${delim}${val}`);
  }
  return lines.join("\n");
}

function unflattenObject(flat: Record<string, string>): unknown {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(flat)) {
    const parts = key.split(".");
    let current: Record<string, unknown> = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === undefined || current[part] === null) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }
    const lastPart = parts[parts.length - 1];
    const value = flat[key];
    // Try to infer type
    if (value === "true" || value === "false") {
      current[lastPart] = value === "true";
    } else if (value === "null" || value === "") {
      current[lastPart] = null;
    } else if (/^-?\d+$/.test(value)) {
      current[lastPart] = parseInt(value, 10);
    } else if (/^-?\d+\.\d+$/.test(value)) {
      current[lastPart] = parseFloat(value);
    } else {
      current[lastPart] = value;
    }
  }
  return result;
}

function propertiesToYml(propsContent: string, opts: { indent: number; quoteStrings: boolean; sortKeys: boolean }): string {
  const flat: Record<string, string> = {};
  const lines = propsContent.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("!")) continue;
    const eqIdx = trimmed.indexOf("=");
    const colonIdx = trimmed.indexOf(":");
    let sepIdx = -1;
    // Use = if present, otherwise : if it comes before any =
    if (eqIdx !== -1 && (colonIdx === -1 || eqIdx < colonIdx)) {
      sepIdx = eqIdx;
    } else if (colonIdx !== -1) {
      sepIdx = colonIdx;
    }
    if (sepIdx === -1) continue;
    const key = trimmed.substring(0, sepIdx).trim();
    const value = trimmed.substring(sepIdx + 1).trim();
    if (key) flat[key] = value;
  }
  let obj = unflattenObject(flat);
  if (opts.sortKeys && typeof obj === "object" && obj !== null) {
    obj = sortObjectKeys(obj as Record<string, unknown>);
  }
  return yaml.dump(obj, { indent: opts.indent, lineWidth: 120, forceQuotes: opts.quoteStrings });
}

function sortObjectKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    const val = obj[key];
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      sorted[key] = sortObjectKeys(val as Record<string, unknown>);
    } else {
      sorted[key] = val;
    }
  }
  return sorted;
}

// ─── Examples ────────────────────────────────────────────────────

const ENCODE_EXAMPLE = "Hello 世界！This is a test 测试文本。";

const CRYPTO_EXAMPLE = "Hello, World!";

const STRIP_EXAMPLE =
  "   这是一个    带有多余空格     和换行符的文本示例。\n\n这是   第二行     内容。\n   还有第三行内容。   \n";

const YML_EXAMPLE = `# 服务器配置
server:
  port: 8080
  servlet:
    context-path: /api

# 数据库配置
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/mydb
    username: root
    password: secret
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true

# 缓存配置
cache:
  type: redis
  redis:
    host: localhost
    port: 6379
    password: null
    ttl: 300

# 日志配置
logging:
  level:
    root: INFO
    org.springframework: WARN`;

const PROPERTIES_EXAMPLE = `# 服务器配置
server.port=8080
server.servlet.context-path=/api

# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/mydb
spring.datasource.username=root
spring.datasource.password=secret
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# 缓存配置
cache.type=redis
cache.redis.host=localhost
cache.redis.port=6379
cache.redis.password=
cache.redis.ttl=300

# 日志配置
logging.level.root=INFO
logging.level.org.springframework=WARN`;

const ENCODE_TYPES: { value: EncodeType; label: string }[] = [
  { value: "url", label: "URL 编码" },
  { value: "base64", label: "Base64" },
  { value: "base64url", label: "Base64URL" },
  { value: "unicode", label: "Unicode" },
  { value: "htmlEntity", label: "HTML 实体" },
  { value: "htmlEscape", label: "HTML 转义" },
  { value: "quotedPrintable", label: "Quoted-Printable" },
];

const CRYPTO_TYPES: {
  value: CryptoType;
  label: string;
  needsKey: boolean;
  bidirectional: boolean;
}[] = [
    { value: "md5", label: "MD5", needsKey: false, bidirectional: false },
    { value: "sha1", label: "SHA1", needsKey: false, bidirectional: false },
    { value: "sha256", label: "SHA256", needsKey: false, bidirectional: false },
    { value: "sha512", label: "SHA512", needsKey: false, bidirectional: false },
    { value: "aes", label: "AES", needsKey: true, bidirectional: true },
  ];

const STRIP_OPTIONS: { value: StripOption; label: string; desc: string }[] = [
  { value: "both", label: "首尾空格", desc: "去除文本首尾空白" },
  { value: "start", label: "行首空格", desc: "去除每行行首空白" },
  { value: "end", label: "行尾空格", desc: "去除每行行尾空白" },
  { value: "all", label: "所有空格", desc: "去除所有空白字符" },
  { value: "newlines", label: "换行符", desc: "去除所有换行符" },
];

// ═════════════════════════════════════════════════════════════════
// Main Page
// ═════════════════════════════════════════════════════════════════

export default function TextProcessorPage() {
  // ── Shared state ───────────────────────────────────────────────
  const [input, setInput] = useState("");
  const [activeTool, setActiveTool] = useState<ToolId>("encode");

  // ── Encode state ───────────────────────────────────────────────
  const [encodeType, setEncodeType] = useState<EncodeType>("url");
  const [encodeDir, setEncodeDir] = useState<EncodeDir>("encode");

  // ── Crypto state ───────────────────────────────────────────────
  const [cryptoType, setCryptoType] = useState<CryptoType>("md5");
  const [cryptoDir, setCryptoDir] = useState<CryptoDir>("encrypt");
  const [secretKey, setSecretKey] = useState("");

  // ── Strip state (multi-select) ─────────────────────────────────
  const [stripModes, setStripModes] = useState<Set<StripOption>>(new Set(["both"]));

  // ── YML/Properties state ───────────────────────────────────────
  const [ymlDir, setYmlDir] = useState<YmlDir>("yml_to_properties");
  const [ymlIndent, setYmlIndent] = useState(2);
  const [ymlQuoteStrings, setYmlQuoteStrings] = useState(false);
  const [ymlSortKeys, setYmlSortKeys] = useState(false);
  const [propsDelimiter, setPropsDelimiter] = useState("equals");
  const [propsEscapeUnicode, setPropsEscapeUnicode] = useState(false);
  const [propsSortKeys, setPropsSortKeys] = useState(false);

  // ── Compute: Encode ────────────────────────────────────────────
  const encodeResult = useMemo<ComputeResult | null>(() => {
    if (activeTool !== "encode") return null;
    if (!input) return EMPTY_RESULT;
    try {
      const output =
        encodeDir === "encode"
          ? encodeText(encodeType, input)
          : decodeText(encodeType, input);
      return { output, error: "" };
    } catch {
      return {
        output: "",
        error: `${encodeDir === "encode" ? "编码" : "解码"}失败，请检查输入内容是否正确`,
      };
    }
  }, [activeTool, input, encodeType, encodeDir]);

  // ── Compute: Crypto ────────────────────────────────────────────
  const cryptoResult = useMemo<ComputeResult | null>(() => {
    if (activeTool !== "crypto") return null;
    if (!input) return EMPTY_RESULT;
    try {
      let output = "";
      switch (cryptoType) {
        case "md5":
          output = CryptoJS.MD5(input).toString();
          break;
        case "sha1":
          output = CryptoJS.SHA1(input).toString();
          break;
        case "sha256":
          output = CryptoJS.SHA256(input).toString();
          break;
        case "sha512":
          output = CryptoJS.SHA512(input).toString();
          break;
        case "aes":
          if (!secretKey.trim()) {
            return { output: "", error: "请输入密钥" };
          }
          if (cryptoDir === "encrypt") {
            output = CryptoJS.AES.encrypt(input, secretKey).toString();
          } else {
            const decrypted = CryptoJS.AES.decrypt(input, secretKey);
            output = decrypted.toString(CryptoJS.enc.Utf8);
            if (!output) throw new Error("解密失败");
          }
          break;
      }
      return { output, error: "" };
    } catch {
      return {
        output: "",
        error:
          cryptoType === "aes"
            ? `${cryptoDir === "encrypt" ? "加密" : "解密"}失败，请检查密钥和输入内容`
            : "计算失败",
      };
    }
  }, [activeTool, input, cryptoType, cryptoDir, secretKey]);

  // ── Compute: Strip (multi-select) ──────────────────────────────
  const stripResult = useMemo<ComputeResult | null>(() => {
    if (activeTool !== "strip") return null;
    if (!input) return EMPTY_RESULT;
    let output = input;
    // Apply selected strip options in a sensible order
    if (stripModes.has("both")) {
      output = output.trim();
    }
    if (stripModes.has("start")) {
      output = output.replace(/^[ \t]+/gm, "");
    }
    if (stripModes.has("end")) {
      output = output.replace(/[ \t]+$/gm, "");
    }
    if (stripModes.has("all")) {
      output = output.replace(/\s+/g, "");
    }
    if (stripModes.has("newlines")) {
      output = output.replace(/[\r\n]+/g, "");
    }
    return { output, error: "" };
  }, [activeTool, input, stripModes]);

  // ── Compute: YML/Properties ────────────────────────────────────
  const ymlResult = useMemo<ComputeResult | null>(() => {
    if (activeTool !== "ymlprops") return null;
    if (!input.trim()) return EMPTY_RESULT;
    try {
      if (ymlDir === "yml_to_properties") {
        return { output: ymlToProperties(input, { delimiter: propsDelimiter, escapeUnicode: propsEscapeUnicode, sortKeys: propsSortKeys }), error: "" };
      } else {
        return { output: propertiesToYml(input, { indent: ymlIndent, quoteStrings: ymlQuoteStrings, sortKeys: ymlSortKeys }), error: "" };
      }
    } catch (err) {
      return {
        output: "",
        error: err instanceof Error ? err.message : "转换失败，请检查输入格式",
      };
    }
  }, [activeTool, input, ymlDir, propsDelimiter, propsEscapeUnicode, propsSortKeys, ymlIndent, ymlQuoteStrings, ymlSortKeys]);

  // ── Active result ──────────────────────────────────────────────
  const result = encodeResult ?? cryptoResult ?? stripResult ?? ymlResult ?? EMPTY_RESULT;

  // ── Derived labels ─────────────────────────────────────────────
  const inputLabel = activeTool === "ymlprops"
    ? (ymlDir === "yml_to_properties" ? "YAML" : "Properties")
    : "文本";
  const outputLabel = (() => {
    if (activeTool === "encode") {
      const t = ENCODE_TYPES.find((t) => t.value === encodeType)?.label ?? "";
      return `${t} ${encodeDir === "encode" ? "编码" : "解码"}`;
    }
    if (activeTool === "crypto") {
      const t = CRYPTO_TYPES.find((t) => t.value === cryptoType)?.label ?? "";
      if (cryptoType === "aes") return `AES ${cryptoDir === "encrypt" ? "加密" : "解密"}`;
      return `${t} 哈希`;
    }
    if (activeTool === "strip") {
      return "清理结果";
    }
    if (activeTool === "ymlprops") {
      return ymlDir === "yml_to_properties" ? "Properties" : "YAML";
    }
    return "输出";
  })();

  // ── Input language for Monaco ──────────────────────────────────
  const inputLanguage = activeTool === "ymlprops"
    ? (ymlDir === "yml_to_properties" ? "yaml" : "ini")
    : "plaintext";
  const outputLanguage = activeTool === "ymlprops"
    ? (ymlDir === "yml_to_properties" ? "ini" : "yaml")
    : "plaintext";

  // ── Handlers ───────────────────────────────────────────────────
  const handleExample = () => {
    if (activeTool === "encode") setInput(ENCODE_EXAMPLE);
    else if (activeTool === "crypto") {
      setInput(CRYPTO_EXAMPLE);
      if (cryptoType === "aes") setSecretKey("secret-key-12345");
    } else if (activeTool === "strip") setInput(STRIP_EXAMPLE);
    else if (activeTool === "ymlprops") {
      setInput(ymlDir === "yml_to_properties" ? YML_EXAMPLE : PROPERTIES_EXAMPLE);
    }
  };

  const handleClear = () => setInput("");

  const handleSwap = () => {
    if (activeTool === "ymlprops") {
      setYmlDir((prev) => (prev === "yml_to_properties" ? "properties_to_yml" : "yml_to_properties"));
      if (result.output) setInput(result.output);
    } else if (result.output) {
      setInput(result.output);
    }
  };

  const handleDownload = () => {
    if (result.output) {
      const ext = activeTool === "ymlprops"
        ? (ymlDir === "yml_to_properties" ? "properties" : "yml")
        : "txt";
      downloadFile(result.output, `text-processor-result.${ext}`);
    }
  };

  const handleToolChange = (tool: string) => setActiveTool(tool as ToolId);

  const toggleStripMode = (mode: StripOption) => {
    setStripModes((prev) => {
      const next = new Set(prev);
      if (next.has(mode)) {
        next.delete(mode);
      } else {
        next.add(mode);
      }
      return next;
    });
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <>
      <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

          {/* Input + Output */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Input */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between h-10">
                <Label className="text-sm font-medium">输入 ({inputLabel})</Label>
                <div className="flex gap-2 items-center">
                  <TextStatsPopover text={input} />
                  <Button variant="outline" size="sm" onClick={handleExample}>
                    <Star className="size-3.5" /> 示例
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    disabled={!input}
                  >
                    <Eraser className="size-3.5" /> 清空
                  </Button>
                </div>
              </div>
              <div className="h-[340px]">
                <MonacoEditor
                  value={input}
                  onChange={setInput}
                  language={inputLanguage}
                  height="100%"
                  showLineNumbersToggle
                  showWordWrapToggle
                />
              </div>
            </div>

            {/* Output */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between h-10">
                <Label className="text-sm font-medium">{outputLabel}</Label>
                <div className="flex gap-2">
                  {result.output && <CopyButton text={result.output} />}
                  {result.output && (
                    <Button variant="outline" size="sm" onClick={handleDownload}>
                      <Download className="size-3.5" /> 下载
                    </Button>
                  )}
                  {result.output &&
                    (activeTool === "encode" ||
                      (activeTool === "crypto" && cryptoType === "aes") ||
                      activeTool === "ymlprops") && (
                      <Button variant="outline" size="sm" onClick={handleSwap}>
                        <ArrowLeftRight className="size-3.5" /> 交换
                      </Button>
                    )}
                </div>
              </div>
              <div className="h-[340px]">
                {result.error ? (
                  <div className="flex h-full flex-col items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    <TriangleAlert className="size-4 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">处理出错</p>
                      <p className="text-xs mt-1 opacity-90 break-all">
                        {result.error}
                      </p>
                    </div>
                  </div>
                ) : result.output ? (
                  <MonacoEditor
                    value={result.output}
                    readOnly
                    language={outputLanguage}
                    height="100%"
                    showCopyButton
                    showDownloadButton
                    showWordWrapToggle
                    onDownload={handleDownload}
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center rounded-lg border border-border bg-card text-sm text-muted-foreground">
                    <FileText className="size-10 opacity-30 mb-3" />
                    {input ? "等待处理..." : "输入内容后自动处理"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tool Tabs + Options */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Tabs value={activeTool} onValueChange={handleToolChange}>
              <TabsList className="w-full rounded-none border-b border-border bg-muted/50">
                <TabsTrigger value="encode" className="flex-1">
                  <Link2 className="size-4" /> 编码转换
                </TabsTrigger>
                <TabsTrigger value="crypto" className="flex-1">
                  <Lock className="size-4" /> 加密哈希
                </TabsTrigger>
                <TabsTrigger value="strip" className="flex-1">
                  <Scissors className="size-4" /> 空格清理
                </TabsTrigger>
                <TabsTrigger value="ymlprops" className="flex-1">
                  <FileCog className="size-4" /> YML/Properties
                </TabsTrigger>
              </TabsList>

              {/* ── Encode Options ────────────────────────────── */}
              <TabsContent value="encode" className="p-5">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">类型</Label>
                    <Select
                      value={encodeType}
                      onValueChange={(v) => setEncodeType(v as EncodeType)}
                    >
                      <SelectTrigger className="w-36 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ENCODE_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Encode/Decode toggle */}
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className={
                        encodeDir === "encode"
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      编码
                    </span>
                    <Switch
                      size="sm"
                      checked={encodeDir === "decode"}
                      onCheckedChange={(c) =>
                        setEncodeDir(c ? "decode" : "encode")
                      }
                    />
                    <span
                      className={
                        encodeDir === "decode"
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      解码
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground ml-auto">
                    {ENCODE_TYPES.find((t) => t.value === encodeType)?.label} ·{" "}
                    {encodeDir === "encode" ? "编码" : "解码"}
                  </p>
                </div>
              </TabsContent>

              {/* ── Crypto Options ────────────────────────────── */}
              <TabsContent value="crypto" className="p-5">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">算法</Label>
                    <Select
                      value={cryptoType}
                      onValueChange={(v) => setCryptoType(v as CryptoType)}
                    >
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CRYPTO_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* AES encrypt/decrypt toggle */}
                  {cryptoType === "aes" && (
                    <>
                      <div className="flex items-center gap-2 text-sm">
                        <span
                          className={
                            cryptoDir === "encrypt"
                              ? "text-primary font-medium"
                              : "text-muted-foreground"
                          }
                        >
                          加密
                        </span>
                        <Switch
                          size="sm"
                          checked={cryptoDir === "decrypt"}
                          onCheckedChange={(c) =>
                            setCryptoDir(c ? "decrypt" : "encrypt")
                          }
                        />
                        <span
                          className={
                            cryptoDir === "decrypt"
                              ? "text-primary font-medium"
                              : "text-muted-foreground"
                          }
                        >
                          解密
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">密钥</Label>
                        <Input
                          className="w-48 h-8"
                          type="password"
                          value={secretKey}
                          onChange={(e) => setSecretKey(e.target.value)}
                          placeholder="输入密钥"
                        />
                      </div>
                    </>
                  )}

                  <p className="text-xs text-muted-foreground ml-auto">
                    {cryptoType === "aes"
                      ? `AES ${cryptoDir === "encrypt" ? "加密" : "解密"}`
                      : `${CRYPTO_TYPES.find((t) => t.value === cryptoType)?.label} 哈希（单向）`}
                  </p>
                </div>
              </TabsContent>

              {/* ── Strip Options (multi-select checkboxes) ──── */}
              <TabsContent value="strip" className="p-5">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                  <Label className="text-xs text-muted-foreground">清理模式（可多选）</Label>
                  {STRIP_OPTIONS.map((m) => (
                    <label
                      key={m.value}
                      className="flex items-center gap-1.5 text-sm cursor-pointer select-none"
                      title={m.desc}
                    >
                      <Checkbox
                        checked={stripModes.has(m.value)}
                        onCheckedChange={() => toggleStripMode(m.value)}
                      />
                      <span className={stripModes.has(m.value) ? "text-foreground font-medium" : "text-muted-foreground"}>
                        {m.label}
                      </span>
                    </label>
                  ))}
                  {stripModes.size === 0 && (
                    <p className="text-xs text-amber-500">请至少选择一个清理模式</p>
                  )}
                </div>
              </TabsContent>

              {/* ── YML/Properties Options ────────────────────── */}
              <TabsContent value="ymlprops" className="p-5">
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className={
                        ymlDir === "yml_to_properties"
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      YAML → Properties
                    </span>
                    <Switch
                      size="sm"
                      checked={ymlDir === "properties_to_yml"}
                      onCheckedChange={(c) =>
                        setYmlDir(c ? "properties_to_yml" : "yml_to_properties")
                      }
                    />
                    <span
                      className={
                        ymlDir === "properties_to_yml"
                          ? "text-primary font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      Properties → YAML
                    </span>
                  </div>
                </div>
                {/* Advanced options */}
                <div className="rounded-md bg-muted p-4 space-y-3">
                  <Label className="text-xs text-muted-foreground">高级选项</Label>
                  {ymlDir === "yml_to_properties" ? (
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">分隔符</Label>
                        <Select value={propsDelimiter} onValueChange={setPropsDelimiter}>
                          <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">= 等号</SelectItem>
                            <SelectItem value="colon">: 冒号</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                        <Checkbox checked={propsEscapeUnicode} onCheckedChange={(c) => setPropsEscapeUnicode(c === true)} />
                        <span className="text-muted-foreground">Unicode 转义</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                        <Checkbox checked={propsSortKeys} onCheckedChange={(c) => setPropsSortKeys(c === true)} />
                        <span className="text-muted-foreground">键名排序</span>
                      </label>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">缩进</Label>
                        <Input type="number" min={1} max={8} value={ymlIndent} onChange={(e) => setYmlIndent(Number(e.target.value) || 2)} className="w-16 h-8" />
                      </div>
                      <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                        <Checkbox checked={ymlQuoteStrings} onCheckedChange={(c) => setYmlQuoteStrings(c === true)} />
                        <span className="text-muted-foreground">引号包裹字符串</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-sm cursor-pointer select-none">
                        <Checkbox checked={ymlSortKeys} onCheckedChange={(c) => setYmlSortKeys(c === true)} />
                        <span className="text-muted-foreground">键名排序</span>
                      </label>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
