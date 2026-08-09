import { useEffect, useMemo, useState } from "react";
import {
  Hash,
  KeyRound,
  Fingerprint,
  Shuffle,
  Copy,
  Check,
  Download,
  Eraser,
  RefreshCw,
  Type,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { ulid } from "ulid";



import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ============================================================
 * Copy Button
 * ============================================================ */
function CopyBtn({ value, size = "sm" }: { value: string; size?: "sm" | "default" }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="outline"
      size={size}
      disabled={!value}
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "已复制" : "复制"}
    </Button>
  );
}

/* ============================================================
 * Result list with copy-per-line
 * ============================================================ */
function ResultList({ results }: { results: string[] }) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  if (results.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        点击生成按钮获取结果
      </p>
    );
  }
  return (
    <div className="max-h-80 space-y-1 overflow-y-auto">
      {results.map((item, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between gap-2 rounded-md border border-gray-100 px-3 py-1.5 hover:bg-gray-50"
        >
          <code className="flex-1 truncate text-sm font-mono">{item}</code>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 shrink-0"
            onClick={() => {
              navigator.clipboard.writeText(item);
              setCopiedIdx(idx);
              setTimeout(() => setCopiedIdx(null), 1500);
            }}
          >
            {copiedIdx === idx ? (
              <Check className="size-3.5 text-green-500" />
            ) : (
              <Copy className="size-3.5 text-gray-400" />
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
 * Tab 1 — UUID Generator
 * ============================================================ */
function UuidGenerator() {
  const [count, setCount] = useState(10);
  const [results, setResults] = useState<string[]>([]);

  const generate = () => {
    setResults(Array.from({ length: Math.min(Math.max(count, 1), 100) }, () => uuidv4()));
  };

  useEffect(() => { generate(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">生成数量</Label>
          <Input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value) || 1)}
            className="w-28 h-9"
          />
        </div>
        <Button onClick={generate}>
          <RefreshCw className="size-4" /> 生成
        </Button>
        <CopyBtn value={results.join("\n")} size="default" />
        <Button
          variant="outline"
          size="default"
          disabled={results.length === 0}
          onClick={() => {
            const blob = new Blob([results.join("\n")], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "uuids.txt";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="size-3.5" /> 下载
        </Button>
      </div>
      <ResultList results={results} />
    </div>
  );
}

/* ============================================================
 * Tab 2 — ULID Generator
 * ============================================================ */
function UlidGenerator() {
  const [count, setCount] = useState(10);
  const [results, setResults] = useState<string[]>([]);

  const generate = () => {
    setResults(Array.from({ length: Math.min(Math.max(count, 1), 100) }, () => ulid()));
  };

  useEffect(() => { generate(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs text-gray-500">生成数量</Label>
          <Input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value) || 1)}
            className="w-28 h-9"
          />
        </div>
        <Button onClick={generate}>
          <RefreshCw className="size-4" /> 生成
        </Button>
        <CopyBtn value={results.join("\n")} size="default" />
        <Button
          variant="outline"
          size="default"
          disabled={results.length === 0}
          onClick={() => {
            const blob = new Blob([results.join("\n")], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "ulids.txt";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="size-3.5" /> 下载
        </Button>
      </div>
      <ResultList results={results} />
    </div>
  );
}

/* ============================================================
 * Tab 3 — Random String Generator
 * ============================================================ */
function RandomStringGenerator() {
  const [length, setLength] = useState(16);
  const [count, setCount] = useState(10);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [customChars, setCustomChars] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState("");

  const generate = () => {
    let charset = customChars;
    if (!charset) {
      if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
      if (includeNumbers) charset += "0123456789";
      if (includeSymbols) charset += "!@#$%^&*()_+~`|}{[]:;?><,./-=";
    }
    if (!charset) {
      setError("请至少选择一种字符类型或输入自定义字符");
      setResults([]);
      return;
    }
    setError("");
    const len = Math.min(Math.max(length, 1), 1024);
    const cnt = Math.min(Math.max(count, 1), 100);
    setResults(
      Array.from({ length: cnt }, () => {
        let str = "";
        for (let i = 0; i < len; i++) {
          str += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return str;
      })
    );
  };

  useEffect(() => { generate(); }, []);

  const charsetOptions = [
    { key: "upper", label: "ABC (大写)", checked: includeUppercase, set: setIncludeUppercase },
    { key: "lower", label: "abc (小写)", checked: includeLowercase, set: setIncludeLowercase },
    { key: "num", label: "123 (数字)", checked: includeNumbers, set: setIncludeNumbers },
    { key: "sym", label: "#$& (符号)", checked: includeSymbols, set: setIncludeSymbols },
  ];

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Settings */}
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">字符串长度</Label>
              <Input
                type="number"
                min={1}
                max={1024}
                value={length}
                onChange={(e) => setLength(Number(e.target.value) || 16)}
                className="h-9"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">生成数量</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(Number(e.target.value) || 1)}
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">字符集</Label>
            <div className="flex flex-wrap gap-4">
              {charsetOptions.map((opt) => (
                <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={opt.checked}
                    onCheckedChange={(v) => opt.set(v === true)}
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium">自定义字符（覆盖上方选择）</Label>
            <Input
              value={customChars}
              onChange={(e) => setCustomChars(e.target.value)}
              placeholder="输入自定义字符集，如留空则使用上方选择"
              className="h-9"
            />
          </div>

          <Button onClick={generate} className="w-full">
            <RefreshCw className="size-4" /> 生成
          </Button>
        </div>

        {/* Results */}
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <Label className="text-sm font-medium">
              结果 {results.length > 0 && `(${results.length})`}
            </Label>
            <div className="flex gap-2">
              <CopyBtn value={results.join("\n")} />
              <Button
                variant="outline"
                size="sm"
                disabled={results.length === 0}
                onClick={() => {
                  const blob = new Blob([results.join("\n")], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "random-strings.txt";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="size-3.5" /> 下载
              </Button>
            </div>
          </div>
          <ResultList results={results} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * Tab 4 — Password Generator
 * ============================================================ */
const DEFAULT_SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/\\|";
const SIMILAR_CHARS = "Il1O0o";
const AMBIGUOUS_SYMBOLS = "{}[]()/\\'\"`~,;:.<>";

function escapeForRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [count, setCount] = useState(10);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeDigits, setIncludeDigits] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [forceAllSets, setForceAllSets] = useState(true);
  const [customInclude, setCustomInclude] = useState("");
  const [excludeChars, setExcludeChars] = useState(SIMILAR_CHARS);
  const [avoidSimilar, setAvoidSimilar] = useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const charset = useMemo(() => {
    let chars = "";
    if (includeUppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLowercase) chars += "abcdefghijklmnopqrstuvwxyz";
    if (includeDigits) chars += "0123456789";
    if (includeSymbols) chars += DEFAULT_SYMBOLS;
    if (customInclude) chars += customInclude;

    let excludes = excludeChars || "";
    if (avoidSimilar) excludes += SIMILAR_CHARS;
    if (avoidAmbiguous) excludes += AMBIGUOUS_SYMBOLS;

    if (excludes) {
      const excludeSet = new Set(excludes.split(""));
      chars = Array.from(new Set(chars.split("")))
        .filter((c) => !excludeSet.has(c))
        .join("");
    }
    return chars;
  }, [includeUppercase, includeLowercase, includeDigits, includeSymbols, customInclude, excludeChars, avoidSimilar, avoidAmbiguous]);

  const ensureAllSets = (candidate: string): boolean => {
    if (!forceAllSets) return true;
    const checks = [
      !includeUppercase || /[A-Z]/.test(candidate),
      !includeLowercase || /[a-z]/.test(candidate),
      !includeDigits || /[0-9]/.test(candidate),
      !includeSymbols || new RegExp(`[${escapeForRegex(DEFAULT_SYMBOLS)}]`).test(candidate),
    ];
    return checks.every(Boolean);
  };

  const generateOne = (pool: string, len: number): string => {
    if (!pool) return "";
    const array = new Uint32Array(len);
    if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < len; i++) array[i] = Math.floor(Math.random() * 0xffffffff);
    }
    return Array.from(array, (n) => pool[n % pool.length]).join("");
  };

  const generate = () => {
    const pool = charset;
    if (!pool) {
      setResults([]);
      return;
    }
    const list: string[] = [];
    const target = Math.min(Math.max(count, 1), 100);
    const len = Math.min(Math.max(length, 4), 128);
    let attempts = 0;
    while (list.length < target && attempts < target * 100) {
      attempts++;
      const candidate = generateOne(pool, len);
      if (candidate && ensureAllSets(candidate)) list.push(candidate);
    }
    setResults(list);
  };

  useEffect(() => { generate(); }, []);

  const reset = () => {
    setLength(16);
    setCount(10);
    setIncludeUppercase(true);
    setIncludeLowercase(true);
    setIncludeDigits(true);
    setIncludeSymbols(true);
    setForceAllSets(true);
    setCustomInclude("");
    setExcludeChars(SIMILAR_CHARS);
    setAvoidSimilar(true);
    setAvoidAmbiguous(false);
    setResults([]);
  };

  const charsetOptions = [
    { key: "upper", label: "大写字母 (A-Z)", checked: includeUppercase, set: setIncludeUppercase },
    { key: "lower", label: "小写字母 (a-z)", checked: includeLowercase, set: setIncludeLowercase },
    { key: "digit", label: "数字 (0-9)", checked: includeDigits, set: setIncludeDigits },
    { key: "sym", label: "特殊符号 (!@#$)", checked: includeSymbols, set: setIncludeSymbols },
  ];

  // Password strength estimation
  const strength = useMemo(() => {
    if (results.length === 0) return { label: "-", color: "text-gray-400", bars: 0 };
    const poolSize = charset.length;
    const bits = Math.log2(poolSize) * length;
    if (bits >= 100) return { label: "极强", color: "text-green-600", bars: 4 };
    if (bits >= 70) return { label: "强", color: "text-green-500", bars: 3 };
    if (bits >= 45) return { label: "中等", color: "text-yellow-500", bars: 2 };
    return { label: "弱", color: "text-red-500", bars: 1 };
  }, [results, charset, length]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Settings */}
      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
        {/* Length slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">密码长度</Label>
            <span className="text-sm font-semibold text-primary">{length}</span>
          </div>
          <Slider
            value={[length]}
            min={4}
            max={128}
            step={1}
            onValueChange={(v) => setLength(v[0])}
          />
        </div>

        {/* Count slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">生成数量</Label>
            <span className="text-sm font-semibold text-primary">{count}</span>
          </div>
          <Slider
            value={[count]}
            min={1}
            max={100}
            step={1}
            onValueChange={(v) => setCount(v[0])}
          />
        </div>

        {/* Charset options */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">字符集选项</Label>
          <div className="grid grid-cols-2 gap-2">
            {charsetOptions.map((opt) => (
              <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={opt.checked}
                  onCheckedChange={(v) => opt.set(v === true)}
                />
                <span className="text-sm">{opt.label}</span>
              </label>
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer mt-1">
            <Checkbox
              checked={forceAllSets}
              onCheckedChange={(v) => setForceAllSets(v === true)}
            />
            <span className="text-sm">强制包含所有已选字符集</span>
          </label>
        </div>

        {/* Custom include */}
        <div className="space-y-1">
          <Label className="text-sm font-medium">追加自定义字符</Label>
          <Input
            value={customInclude}
            onChange={(e) => setCustomInclude(e.target.value)}
            placeholder="追加到字符池中的额外字符"
            className="h-9"
          />
        </div>

        {/* Exclude chars */}
        <div className="space-y-1">
          <Label className="text-sm font-medium">排除字符</Label>
          <Input
            value={excludeChars}
            onChange={(e) => setExcludeChars(e.target.value)}
            placeholder="要从字符池中排除的字符"
            className="h-9"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            <Button
              variant={avoidSimilar ? "default" : "outline"}
              size="sm"
              onClick={() => setAvoidSimilar(!avoidSimilar)}
            >
              {avoidSimilar ? "已排除易混字符" : "排除易混字符 (Il1O0o)"}
            </Button>
            <Button
              variant={avoidAmbiguous ? "default" : "outline"}
              size="sm"
              onClick={() => setAvoidAmbiguous(!avoidAmbiguous)}
            >
              {avoidAmbiguous ? "已排除歧义符号" : "排除歧义符号 ({}[]()/)"}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={generate} className="flex-1">
            <RefreshCw className="size-4" /> 生成密码
          </Button>
          <Button variant="outline" onClick={reset}>
            <Eraser className="size-4" /> 重置
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Label className="text-sm font-medium">
              结果 {results.length > 0 && `(${results.length})`}
            </Label>
            {/* Strength indicator */}
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className={`h-3 w-1.5 rounded-full ${n <= strength.bars ? strength.color.replace("text-", "bg-") : "bg-gray-200"}`}
                  />
                ))}
              </div>
              <span className={`text-xs font-medium ${strength.color}`}>{strength.label}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <CopyBtn value={results.join("\n")} />
            <Button
              variant="outline"
              size="sm"
              disabled={results.length === 0}
              onClick={() => {
                const blob = new Blob([results.join("\n")], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "passwords.txt";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="size-3.5" /> 下载
            </Button>
          </div>
        </div>
        <ResultList results={results} />
      </div>
    </div>
  );
}

/* ============================================================
 * Main Page
 * ============================================================ */
export default function StringToolsPage() {
  return (
    <>
            <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

          <Tabs defaultValue="uuid">
            <TabsList className="w-full max-w-lg">
              <TabsTrigger value="uuid" className="flex-1">
                <Hash className="size-4" /> UUID
              </TabsTrigger>
              <TabsTrigger value="ulid" className="flex-1">
                <Fingerprint className="size-4" /> ULID
              </TabsTrigger>
              <TabsTrigger value="random" className="flex-1">
                <Type className="size-4" /> 随机字符串
              </TabsTrigger>
              <TabsTrigger value="password" className="flex-1">
                <KeyRound className="size-4" /> 密码
              </TabsTrigger>
            </TabsList>

            <TabsContent value="uuid" className="mt-4">
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <UuidGenerator />
              </div>
            </TabsContent>
            <TabsContent value="ulid" className="mt-4">
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <UlidGenerator />
              </div>
            </TabsContent>
            <TabsContent value="random" className="mt-4">
              <RandomStringGenerator />
            </TabsContent>
            <TabsContent value="password" className="mt-4">
              <PasswordGenerator />
            </TabsContent>
          </Tabs>
        </div>
      </div>
          </>
  );
}
