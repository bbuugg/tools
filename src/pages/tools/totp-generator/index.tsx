import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Check, Copy, Plus, Trash2, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

// ─── Base32 与 TOTP 核心（RFC 4648 / RFC 4226 / RFC 6238） ────

const B32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** 宽松 Base32 解码：忽略大小写、空格、连字符与填充符 */
function base32Decode(s: string): Uint8Array<ArrayBuffer> | null {
  const clean = s.toUpperCase().replace(/[\s-=]/g, "");
  if (!clean.length) return null;
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = B32_ALPHABET.indexOf(ch);
    if (idx === -1) return null;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

type Algo = "SHA-1" | "SHA-256" | "SHA-512";

/** HOTP：HMAC(counter) → 动态截断 → 十进制取模（RFC 4226 §5.3） */
async function hotp(bytes: Uint8Array<ArrayBuffer>, counter: number, algo: Algo, digits: number): Promise<string> {
  const key = await crypto.subtle.importKey("raw", bytes, { name: "HMAC", hash: algo }, false, ["sign"]);
  const buf = new ArrayBuffer(8);
  new DataView(buf).setUint32(4, counter); // 高 32 位恒 0，counter 远小于 2^32
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", key, buf));
  const off = mac[mac.length - 1] & 0x0f;
  const bin =
    ((mac[off] & 0x7f) << 24) | ((mac[off + 1] & 0xff) << 16) | ((mac[off + 2] & 0xff) << 8) | (mac[off + 3] & 0xff);
  return (bin % 10 ** digits).toString().padStart(digits, "0");
}

const ALGO_PARAM_MAP: Record<string, Algo> = {
  SHA1: "SHA-1",
  "SHA-1": "SHA-1",
  SHA256: "SHA-256",
  "SHA-256": "SHA-256",
  SHA512: "SHA-512",
  "SHA-512": "SHA-512",
};

interface ParsedTotp {
  bytes: Uint8Array<ArrayBuffer>;
  algo: Algo;
  digits: number;
  period: number;
  issuer: string;
  account: string;
}

type ParseResult = { ok: true; parsed: ParsedTotp } | { ok: false; error: string };

/** 解析输入：otpauth://totp/… URI 或裸 Base32 密钥 */
function parseInput(raw: string): ParseResult {
  const t = raw.trim();
  if (!t) return { ok: false, error: "" }; // 空输入不算错误，走空闲态

  if (/^otpauth:\/\//i.test(t)) {
    let url: URL;
    try {
      url = new URL(t);
    } catch {
      return { ok: false, error: "otpauth 链接格式无效" };
    }
    if (!/^totp$/i.test(url.host)) {
      return { ok: false, error: "仅支持 otpauth://totp 类型链接" };
    }
    const secret = url.searchParams.get("secret") ?? "";
    const bytes = base32Decode(secret);
    if (!bytes || !bytes.length) return { ok: false, error: "链接中的 secret 不是合法 Base32 密钥" };

    const label = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
    const colon = label.indexOf(":");
    const labelIssuer = colon > 0 ? label.slice(0, colon).trim() : "";
    const account = colon > 0 ? label.slice(colon + 1).trim() : label.trim();

    const algoParam = url.searchParams.get("algorithm");
    const digitsParam = Number(url.searchParams.get("digits"));
    const periodParam = Number(url.searchParams.get("period"));

    return {
      ok: true,
      parsed: {
        bytes,
        algo: (algoParam && ALGO_PARAM_MAP[algoParam.toUpperCase()]) || "SHA-1",
        digits: [6, 8].includes(digitsParam) ? digitsParam : 6,
        period: Number.isInteger(periodParam) && periodParam >= 1 && periodParam <= 300 ? periodParam : 30,
        issuer: url.searchParams.get("issuer") || labelIssuer,
        account,
      },
    };
  }

  const bytes = base32Decode(t.replace(/-/g, ""));
  if (!bytes || !bytes.length) return { ok: false, error: "密钥含非法字符（Base32 仅允许 A-Z、2-7）" };
  return {
    ok: true,
    parsed: { bytes, algo: "SHA-1", digits: 6, period: 30, issuer: "", account: "" },
  };
}

// ─── 账户保存 ────────────────────────────────────────────────

interface SavedAccount {
  id: string;
  label: string;
  b32: string;
  algo: Algo;
  digits: number;
  period: number;
}

const STORAGE_KEY = "totp-accounts";

function loadAccounts(): SavedAccount[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

const maskSecret = (s: string) => {
  const c = s.toUpperCase().replace(/[\s-=]/g, "");
  return c.length > 10 ? `${c.slice(0, 4)}••••${c.slice(-4)}` : c;
};

// ─── 页面局部组件 ────────────────────────────────────────────

function Field({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-border bg-card p-1 gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={(e) => {
            onChange(o.value);
            e.currentTarget.blur();
          }}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap",
            o.value === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── 页面 ────────────────────────────────────────────────────

export default function TotpGeneratorPage() {
  const [input, setInput] = useState("");
  const parse = useMemo(() => parseInput(input), [input]);
  const parsed = parse.ok ? parse.parsed : null;

  // 参数可手动微调（URI 解析结果作为初始值）
  const [algoOverride, setAlgoOverride] = useState<Algo>("SHA-1");
  const [digitsOverride, setDigitsOverride] = useState("6");
  const [periodOverride, setPeriodOverride] = useState("30");

  useEffect(() => {
    if (parsed) {
      setAlgoOverride(parsed.algo);
      setDigitsOverride(String(parsed.digits));
      setPeriodOverride(String(parsed.period));
    }
  }, [parsed]);

  const algo = algoOverride;
  const digits = Number(digitsOverride) === 8 ? 8 : 6;
  const period = Math.min(Math.max(Number(periodOverride) || 30, 1), 300);

  // 计时器
  const [nowMs, setNowMs] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const counter = Math.floor(nowMs / 1000 / period);
  const remaining = period - (Math.floor(nowMs / 1000) % period);

  const [codes, setCodes] = useState<{ current: string; next: string } | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);
  const runIdRef = useRef(0);

  useEffect(() => {
    if (!parsed) {
      setCodes(null);
      setCalcError(null);
      return;
    }
    const id = ++runIdRef.current;
    let alive = true;
    (async () => {
      try {
        const cur = await hotp(parsed.bytes, counter, algo, digits);
        const nxt = await hotp(parsed.bytes, counter + 1, algo, digits);
        if (alive && id === runIdRef.current) {
          setCodes({ current: cur, next: nxt });
          setCalcError(null);
        }
      } catch {
        if (alive && id === runIdRef.current) setCalcError("WebCrypto 不可用（需要 HTTPS 或 localhost 环境）");
      }
    })();
    return () => {
      alive = false;
    };
  }, [parsed, counter, algo, digits]);

  const [copied, setCopied] = useState(false);
  const copyCode = async () => {
    if (!codes) return;
    try {
      await navigator.clipboard.writeText(codes.current);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  // 已保存账户
  const [accounts, setAccounts] = useState<SavedAccount[]>(loadAccounts);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);
  const [labelDraft, setLabelDraft] = useState("");

  const saveCurrent = () => {
    if (!parse.ok || !parse.parsed) return;
    const p = parse.parsed;
    const label = labelDraft.trim() || p.issuer || p.account || "未命名账户";
    setAccounts((prev) => [
      ...prev.filter((a) => !(a.b32 === input.trim() && a.algo === algo && a.digits === digits && a.period === period)),
      {
        id: crypto.randomUUID(),
        label,
        b32: input.trim(),
        algo,
        digits,
        period,
      },
    ]);
    setLabelDraft("");
  };

  const loadAccount = (a: SavedAccount) => {
    setInput(a.b32);
    // 参数由 parse → effect 自动回填
  };

  const groupCode = (c: string) =>
    c.length === 6 ? `${c.slice(0, 3)} ${c.slice(3)}` : c.length === 8 ? `${c.slice(0, 4)} ${c.slice(4)}` : c;

  const expiringSoon = codes !== null && remaining <= 5;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
        {/* 左侧：输入与参数 */}
        <div className="space-y-6 min-w-0">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <Field label="密钥 / otpauth 链接">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={"JBSWY3DPEHPK3PXP\n或 otpauth://totp/GitHub:user?secret=…&issuer=GitHub"}
                rows={3}
                className="font-mono text-xs"
                spellCheck={false}
              />
            </Field>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>试用：</span>
              <button
                onClick={(e) => {
                  setInput("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"); // RFC 6238 附录 B 测试密钥
                  e.currentTarget.blur();
                }}
                className="rounded-md border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                RFC 示例密钥
              </button>
            </div>

            {!parse.ok && parse.error && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <TriangleAlert className="size-4 shrink-0" />
                {parse.error}
              </p>
            )}

            {parsed && (
              <>
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground font-mono">
                    {parsed.bytes.length} 字节
                  </span>
                  {parsed.issuer && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">{parsed.issuer}</span>
                  )}
                  {parsed.account && (
                    <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">{parsed.account}</span>
                  )}
                </div>

                <div className="space-y-3">
                  <Field label="算法">
                    <Segmented<Algo>
                      options={[
                        { value: "SHA-1", label: "SHA1" },
                        { value: "SHA-256", label: "SHA256" },
                        { value: "SHA-512", label: "SHA512" },
                      ]}
                      value={algo}
                      onChange={setAlgoOverride}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="位数">
                      <Segmented<"6" | "8">
                        options={[
                          { value: "6", label: "6 位" },
                          { value: "8", label: "8 位" },
                        ]}
                        value={digitsOverride === "8" ? "8" : "6"}
                        onChange={setDigitsOverride}
                      />
                    </Field>
                    <Field label="周期">
                      <Segmented<"15" | "30" | "60">
                        options={[
                          { value: "15", label: "15s" },
                          { value: "30", label: "30s" },
                          { value: "60", label: "60s" },
                        ]}
                        value={["15", "60"].includes(periodOverride) ? (periodOverride as "15" | "60") : "30"}
                        onChange={setPeriodOverride}
                      />
                    </Field>
                  </div>
                </div>

                {/* 保存为账户 */}
                <div className="flex items-center gap-2 border-t border-border pt-4">
                  <Input
                    value={labelDraft}
                    onChange={(e) => setLabelDraft(e.target.value)}
                    placeholder={parsed.issuer || parsed.account || "账户名称（可选）"}
                    maxLength={40}
                  />
                  <Button variant="outline" size="sm" onClick={saveCurrent} disabled={!codes}>
                    <Plus className="size-3.5 mr-1" />
                    保存
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* 已保存账户 */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-medium">已保存账户</span>
              <span className="text-xs text-muted-foreground">仅存于本浏览器</span>
            </div>
            {accounts.length ? (
              <ul className="divide-y divide-border/60 max-h-[280px] overflow-auto">
                {accounts.map((a) => (
                  <li key={a.id}>
                    <button
                      onClick={() => loadAccount(a)}
                      className="w-full px-5 py-2.5 flex items-center justify-between gap-3 text-left hover:bg-accent/50 transition-colors"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-medium truncate">{a.label}</span>
                        <span className="block text-xs text-muted-foreground font-mono truncate">
                          {maskSecret(a.b32)} · {a.algo.replace("-", "")} · {a.digits}位 · {a.period}s
                        </span>
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        aria-label="删除"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAccounts((prev) => prev.filter((x) => x.id !== a.id));
                        }}
                        onKeyDown={(e) => e.key === "Enter" && e.stopPropagation()}
                        className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-6 text-center text-xs text-muted-foreground">
                输入有效密钥后可保存常用账户，下次打开免粘贴。密钥以明文存于 localStorage，共享设备请勿保存。
              </p>
            )}
          </div>
        </div>

        {/* 右侧：动态码展示 */}
        <div className="rounded-xl border border-border bg-card p-6 md:p-8 space-y-6 min-w-0">
          {codes ? (
            <>
              <div className="flex flex-col items-center gap-4">
                <div
                  className={cn(
                    "font-mono font-bold tracking-[0.12em] tabular-nums leading-none select-all",
                    "text-5xl sm:text-6xl md:text-7xl",
                    expiringSoon ? "text-amber-500" : "",
                  )}
                >
                  {groupCode(codes.current)}
                </div>
                <Button size="sm" variant="outline" onClick={copyCode}>
                  {copied ? <Check className="size-3.5 mr-1.5 text-primary" /> : <Copy className="size-3.5 mr-1.5" />}
                  {copied ? "已复制" : "复制验证码"}
                </Button>
              </div>

              {/* 周期进度 */}
              <div className="space-y-2">
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-250 ease-linear",
                      expiringSoon ? "bg-amber-500" : "bg-primary",
                    )}
                    style={{ width: `${(((period - remaining) / period) * 100).toFixed(2)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>第 {counter} 个周期</span>
                  <span className={cn("tabular-nums", expiringSoon && "text-amber-500 font-medium")}>
                    {remaining}s 后刷新
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5 text-sm">
                <span className="text-muted-foreground">下一组</span>
                <span className="font-mono font-semibold tabular-nums tracking-wider">{groupCode(codes.next)}</span>
              </div>
            </>
          ) : calcError ? (
            <p className="flex items-center gap-1.5 text-sm text-destructive justify-center py-16">
              <TriangleAlert className="size-4 shrink-0" />
              {calcError}
            </p>
          ) : (
            <div className="py-16 text-center space-y-3">
              <KeyHint />
              <p className="text-sm text-muted-foreground">
                粘贴密钥后此处实时显示验证码；
                <br />
                可点击左侧「RFC 示例密钥」快速体验。
              </p>
            </div>
          )}

          <p className="text-xs text-muted-foreground border-t border-border pt-4 leading-relaxed">
            算法说明：TOTP = Trunc(HMAC-{algo}(secret, floor(unixTime / {period}s))) 取模{" "}
            {`10^${digits}`}（RFC 6238）。验证码基于 Unix 时间对齐，设备时钟偏差超过 ±1 个周期会导致校验失败，
            请保持系统时间准确。保存的账户明文存储在浏览器 localStorage，敏感账户建议用完即删。
          </p>
        </div>
      </div>
    </div>
  );
}

function KeyHint() {
  return (
    <div className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-border px-8 py-5 font-mono text-3xl text-muted-foreground/50 select-none">
      ••• •••
    </div>
  );
}
