import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, TriangleAlert } from "lucide-react";
import { Fragment, useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

// ─── IPv4 核心算法 ───────────────────────────────────────────
// 统一用无符号 32 位整数表示 IP，位运算后必须 >>> 0 归一化。

/** 点分十进制 → uint32，严格校验每段 0-255 */
function parseIp(s: string): number | null {
  const parts = s.trim().split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const v = Number(p);
    if (v > 255) return null;
    n = n * 256 + v;
  }
  return n >>> 0;
}

const ipToStr = (n: number) => [n >>> 24, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");

/** 前缀长度 → 掩码（/0 时移位会回绕，需特判） */
function maskOf(prefix: number): number {
  return prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
}

/** 掩码 → 前缀长度；要求 1 位必须连续（形如 111…000），否则返回 null */
function prefixOfMask(mask: number): number | null {
  const wild = (~mask) >>> 0;
  // 合法掩码取反后必为低 k 位连续 1（2^k−1 形式）；wild+1 溢出到 33 位时按 0 处理恰好通过
  if ((wild & (wild + 1)) !== 0) return null;
  let p = 0;
  for (let i = 31; i >= 0 && (mask >>> i) & 1; i--) p++;
  return p;
}

/** 解析 CIDR 输入：支持 `a.b.c.d/nn`、`a.b.c.d/m.m.m.m`、裸 IP（按 /32） */
function parseCidr(s: string): { ip: number; prefix: number } | null {
  const t = s.trim();
  if (!t) return null;
  const slash = t.indexOf("/");
  const ip = parseIp(slash === -1 ? t : t.slice(0, slash));
  if (ip === null) return null;
  const rest = slash === -1 ? "" : t.slice(slash + 1).trim();
  if (!rest) return { ip, prefix: 32 };
  if (/^\d{1,2}$/.test(rest)) {
    const p = Number(rest);
    return p <= 32 ? { ip, prefix: p } : null;
  }
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(rest)) {
    const m = parseIp(rest);
    const p = m === null ? null : prefixOfMask(m);
    return p === null ? null : { ip, prefix: p };
  }
  return null;
}

// ─── 分析结果 ────────────────────────────────────────────────

interface SubnetInfo {
  cidrStr: string;
  maskStr: string;
  wildStr: string;
  net: number;
  bcast: number | null; // /31、/32 没有广播地址
  first: number;
  last: number;
  total: number;
  usable: number;
  usableNote?: string; // /31、/32 的口径说明
  classLabel: string;
  tags: string[];
}

function analyze(ip: number, prefix: number): SubnetInfo {
  const mask = maskOf(prefix);
  const wild = (~mask) >>> 0;
  const net = (ip & mask) >>> 0;

  let bcast: number | null;
  let first: number;
  let last: number;
  let usable: number;
  let usableNote: string | undefined;

  if (prefix >= 31) {
    // RFC 3021：/31 点对点两台可用；/32 单机路由
    if (prefix === 31) {
      bcast = null;
      first = net;
      last = (net + 1) >>> 0;
      usable = 2;
      usableNote = "RFC 3021 点对点链路，无广播地址";
    } else {
      bcast = null;
      first = net;
      last = net;
      usable = 1;
      usableNote = "单机路由（主机位为 0）";
    }
  } else {
    bcast = (net | wild) >>> 0;
    first = (net + 1) >>> 0;
    last = (bcast - 1) >>> 0;
    usable = 2 ** (32 - prefix) - 2;
  }

  const o = ip >>> 24;
  const classLabel = o < 128 ? "A 类" : o < 192 ? "B 类" : o < 224 ? "C 类" : o < 240 ? "D 类（组播）" : "E 类（保留）";

  const inBlock = (base: string, p: number) => {
    const b = parseIp(base);
    return b !== null && (ip & maskOf(p)) >>> 0 === b;
  };

  const tags: string[] = [];
  if (inBlock("127.0.0.0", 8)) tags.push("回环地址");
  if (inBlock("10.0.0.0", 8) || inBlock("172.16.0.0", 12) || inBlock("192.168.0.0", 16)) tags.push("私有地址 RFC1918");
  if (inBlock("100.64.0.0", 10)) tags.push("CGNAT 运营商级 NAT");
  if (inBlock("169.254.0.0", 16)) tags.push("链路本地 APIPA");
  if (o >= 224 && o < 240) tags.push("组播地址");
  if (o >= 240) tags.push("保留地址");
  if (o === 0) tags.push("0.0.0.0/8 本网络段");
  if (!tags.length) tags.push("公网地址");

  return {
    cidrStr: `${ipToStr(net)}/${prefix}`,
    maskStr: ipToStr(mask),
    wildStr: ipToStr(wild),
    net,
    bcast,
    first,
    last,
    total: 2 ** (32 - prefix),
    usable,
    usableNote,
    classLabel,
    tags,
  };
}

const fmtInt = (n: number) => n.toLocaleString("zh-CN");

// ─── 页面局部组件 ────────────────────────────────────────────

type Tab = "calc" | "divide" | "ref";

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
            "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
            o.value === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Field({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}

function Chip({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={(e) => {
        onClick();
        e.currentTarget.blur();
      }}
      className="rounded-md border border-border px-2 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {children}
    </button>
  );
}

function StatCell({
  label,
  value,
  sub,
  mono = true,
  action,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  mono?: boolean;
  action?: ReactNode;
}) {
  return (
    <div className="bg-card px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        {action}
      </div>
      <div className={cn("mt-0.5 truncate text-base font-semibold", mono && "font-mono")}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

/** 32 位二进制行：网络位加粗，前缀处画虚线分界 */
function BitsRow({ n, prefix, strong }: { n: number; prefix: number; strong?: boolean }) {
  const bits: string[] = [];
  for (let i = 31; i >= 0; i--) bits.push(String((n >>> i) & 1));
  return (
    <div className="flex items-center font-mono text-xs leading-5 whitespace-pre">
      {bits.map((b, idx) => (
        <Fragment key={idx}>
          {idx === prefix && prefix > 0 && prefix < 32 && (
            <span aria-hidden className="mx-1.5 w-px self-stretch bg-primary/60" />
          )}
          {idx > 0 && idx % 8 === 0 && <span aria-hidden className="w-2" />}
          <span
            className={cn(
              "w-[1ch] text-center",
              strong ? "text-primary font-semibold" : idx < prefix ? "font-semibold" : "text-muted-foreground",
            )}
          >
            {b}
          </span>
        </Fragment>
      ))}
    </div>
  );
}

// ─── 子网划分与速查表数据 ────────────────────────────────────

const MAX_DIVIDE_ROWS = 512;

const REF_REMARKS: Record<number, string> = {
  0: "全网段（理论值）",
  8: "A 类边界 · 10.0.0.0/8 私有段",
  10: "私有地址",
  12: "私有地址（172.16.0.0/12）",
  16: "B 类边界 · 192.168.0.0/16 私有段",
  24: "C 类 · 最常用子网",
  30: "传统点对点",
  31: "RFC 3021 点对点",
  32: "单机路由",
};

interface RefRow {
  prefix: number;
  mask: string;
  wild: string;
  total: number;
  usable: number;
}

const REF_ROWS: RefRow[] = Array.from({ length: 33 }, (_, p) => ({
  prefix: p,
  mask: ipToStr(maskOf(p)),
  wild: ipToStr((~maskOf(p)) >>> 0),
  total: 2 ** (32 - p),
  usable: p === 32 ? 1 : p === 31 ? 2 : 2 ** (32 - p) - 2,
}));

// ─── 页面 ────────────────────────────────────────────────────

export default function SubnetCalculatorPage() {
  const [tab, setTab] = useState<Tab>("calc");

  // ── 子网计算 ──
  const [input, setInput] = useState("192.168.1.0/24");
  const parsed = useMemo(() => parseCidr(input), [input]);
  const info = useMemo(() => (parsed ? analyze(parsed.ip, parsed.prefix) : null), [parsed]);

  const [copied, setCopied] = useState(false);
  const summary = info
    ? [
        `网段 ${info.cidrStr}`,
        `掩码 ${info.maskStr}`,
        `通配符 ${info.wildStr}`,
        info.bcast !== null ? `广播 ${ipToStr(info.bcast)}` : "无广播",
        `可用 ${info.usable} 台`,
        `范围 ${ipToStr(info.first)} ~ ${ipToStr(info.last)}`,
      ].join("\n")
    : "";
  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* 剪贴板不可用时静默 */
    }
  };

  // ── 子网划分 ──
  const [divInput, setDivInput] = useState("192.168.1.0/24");
  const [newPrefix, setNewPrefix] = useState(26);
  const [copiedDiv, setCopiedDiv] = useState(false);

  const divParsed = useMemo(() => parseCidr(divInput), [divInput]);
  const divError =
    divParsed === null
      ? null // 输入非法时仅提示解析错误
      : newPrefix <= divParsed.prefix
        ? `目标前缀必须大于当前前缀 /${divParsed.prefix}`
        : null;
  const divisions = useMemo(() => {
    if (!divParsed || divError) return null;
    const { ip, prefix } = divParsed;
    const size = 2 ** (32 - newPrefix);
    const count = 2 ** (newPrefix - prefix);
    const mask = ipToStr(maskOf(newPrefix));
    const list = [];
    for (let i = 0; i < Math.min(count, MAX_DIVIDE_ROWS); i++) {
      const net = (ip + i * size) >>> 0;
      const s = analyze(net, newPrefix);
      list.push({ idx: i + 1, cidr: `${ipToStr(net)}/${newPrefix}`, mask, first: ipToStr(s.first), last: ipToStr(s.last), bcast: s.bcast });
    }
    return { count, list, perUsable: analyze(divParsed.ip, newPrefix).usable };
  }, [divParsed, newPrefix, divError]);

  const copyDivList = async () => {
    if (!divisions) return;
    const lines = ["#\t子网\t起始可用\t最后可用\t广播"];
    for (const r of divisions.list) lines.push(`${r.idx}\t${r.cidr}\t${r.first}\t${r.last}\t${r.bcast === null ? "-" : ipToStr(r.bcast)}`);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopiedDiv(true);
      setTimeout(() => setCopiedDiv(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Segmented<Tab>
          options={[
            { value: "calc", label: "子网计算" },
            { value: "divide", label: "子网划分" },
            { value: "ref", label: "掩码速查" },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {/* ─── 子网计算 ─── */}
      {tab === "calc" && (
        <>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <Field label="IP / CIDR">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="如 192.168.1.0/24、172.16.5.9/255.255.240.0 或裸 IP"
                className="font-mono"
                spellCheck={false}
              />
            </Field>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>示例：</span>
              <Chip onClick={() => setInput("192.168.1.130/26")}>192.168.1.130/26</Chip>
              <Chip onClick={() => setInput("172.16.5.9/20")}>172.16.5.9/20</Chip>
              <Chip onClick={() => setInput("10.240.0.0/12")}>10.240.0.0/12</Chip>
              <Chip onClick={() => setInput("100.64.8.1/10")}>100.64.8.1/10</Chip>
            </div>
            {!parsed && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <TriangleAlert className="size-4 shrink-0" />
                无法解析：请输入合法的 IPv4 地址与前缀（0-32）或连续掩码。
              </p>
            )}
          </div>

          {info && parsed && (
            <>
              {/* 关键指标 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-xl border border-border overflow-hidden">
                <StatCell
                  label="CIDR 网段"
                  value={info.cidrStr}
                  action={
                    <button
                      onClick={copySummary}
                      title="复制完整摘要"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
                    </button>
                  }
                />
                <StatCell label="子网掩码" value={info.maskStr} />
                <StatCell label="通配符掩码" value={info.wildStr} />
                <StatCell
                  label="可用主机数"
                  value={fmtInt(info.usable)}
                  sub={info.usableNote ?? `${fmtInt(info.total)} 个地址 − 网络号与广播`}
                />
              </div>

              {/* 明细 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-xl border border-border overflow-hidden">
                <StatCell label="网络地址" value={ipToStr(info.net)} />
                <StatCell label="广播地址" value={info.bcast === null ? "—" : ipToStr(info.bcast)} />
                <StatCell label="首个可用 IP" value={ipToStr(info.first)} />
                <StatCell label="最后可用 IP" value={ipToStr(info.last)} />
                <StatCell label="地址总数" value={fmtInt(info.total)} mono={false} />
                <StatCell label="网络位 / 主机位" value={`${parsed.prefix} 位 / ${32 - parsed.prefix} 位`} mono={false} />
                <StatCell label="IP 分类" value={info.classLabel} mono={false} />
                <StatCell
                  label="地址类型"
                  mono={false}
                  value={
                    <span className="flex flex-wrap gap-1 pt-0.5">
                      {info.tags.map((t) => (
                        <span key={t} className="rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-muted-foreground">
                          {t}
                        </span>
                      ))}
                    </span>
                  }
                />
              </div>

              {/* 二进制视图 */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 overflow-x-auto">
                <div className="space-y-2 min-w-max">
                  <BitsRow n={parsed.ip} prefix={parsed.prefix} />
                  <BitsRow n={maskOf(parsed.prefix)} prefix={parsed.prefix} strong />
                  <BitsRow n={info.net} prefix={parsed.prefix} />
                  {info.bcast !== null && <BitsRow n={info.bcast} prefix={parsed.prefix} />}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-sm bg-foreground" />
                    网络位（前 {parsed.prefix} 位）
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-sm bg-muted-foreground/40" />
                    主机位（后 {32 - parsed.prefix} 位）
                  </span>
                  <span>虚线为网络位 / 主机位分界</span>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ─── 子网划分 ─── */}
      {tab === "divide" && (
        <>
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="grid md:grid-cols-[1fr_320px] gap-4 items-start">
              <Field label="基础网段">
                <Input
                  value={divInput}
                  onChange={(e) => setDivInput(e.target.value)}
                  placeholder="如 192.168.1.0/24"
                  className="font-mono"
                  spellCheck={false}
                />
              </Field>
              <Field
                label={
                  <>
                    目标前缀 <span className="ml-1 font-mono text-primary">/{divParsed ? newPrefix : "—"}</span>
                  </>
                }
              >
                <input
                  type="range"
                  min={divParsed ? divParsed.prefix + 1 : 1}
                  max={32}
                  step={1}
                  value={Math.max(newPrefix, divParsed ? divParsed.prefix + 1 : 1)}
                  disabled={!divParsed}
                  onChange={(e) => setNewPrefix(Number(e.target.value))}
                  className="w-full accent-primary mt-2.5"
                />
              </Field>
            </div>
            {divParsed ? (
              <>
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>快速划分：</span>
                  {[2, 4, 8, 16, 64, 256].map((n) => {
                    const target = divParsed.prefix + Math.log2(n);
                    return (
                      <Chip key={n} onClick={() => setNewPrefix(Math.min(target, 32))}>
                        {n} 个子网
                      </Chip>
                    );
                  })}
                </div>
                {divError ? (
                  <p className="flex items-center gap-1.5 text-sm text-destructive">
                    <TriangleAlert className="size-4 shrink-0" />
                    {divError}
                  </p>
                ) : divisions ? (
                  <p className="text-sm text-muted-foreground">
                    将 <span className="font-mono text-foreground">{divInput.trim() || "该网段"}</span> 划分为{" "}
                    <span className="font-semibold text-foreground">{fmtInt(divisions.count)}</span>{" "}
                    个 /{newPrefix} 子网，每个含 {fmtInt(2 ** (32 - newPrefix))} 个地址、
                    可用 {fmtInt(divisions.perUsable)} 台。
                  </p>
                ) : null}
              </>
            ) : (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <TriangleAlert className="size-4 shrink-0" />
                无法解析基础网段，请输入合法 CIDR。
              </p>
            )}
          </div>

          {divisions && !divError && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-3 border-b border-border flex items-center justify-between gap-3">
                <span className="text-sm font-medium">
                  子网列表
                  {divisions.count > MAX_DIVIDE_ROWS && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      共 {fmtInt(divisions.count)} 个，仅显示前 {MAX_DIVIDE_ROWS} 个
                    </span>
                  )}
                </span>
                <Button variant="outline" size="sm" onClick={copyDivList}>
                  {copiedDiv ? <Check className="size-3.5 mr-1.5 text-primary" /> : <Copy className="size-3.5 mr-1.5" />}
                  {copiedDiv ? "已复制" : "复制 TSV"}
                </Button>
              </div>
              <div className="max-h-[480px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background z-10 shadow-[0_1px_0_0_hsl(var(--border))]">
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="px-4 py-2.5 font-medium">#</th>
                      <th className="px-4 py-2.5 font-medium">子网</th>
                      <th className="px-4 py-2.5 font-medium">起始可用</th>
                      <th className="px-4 py-2.5 font-medium">最后可用</th>
                      <th className="px-4 py-2.5 font-medium">广播</th>
                      <th className="px-4 py-2.5 font-medium text-right">可用主机</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {divisions.list.map((r) => (
                      <tr key={r.idx} className="border-t border-border/60 hover:bg-accent/50 transition-colors">
                        <td className="px-4 py-2 text-muted-foreground">{r.idx}</td>
                        <td className="px-4 py-2 font-semibold">{r.cidr}</td>
                        <td className="px-4 py-2 text-muted-foreground">{r.first}</td>
                        <td className="px-4 py-2 text-muted-foreground">{r.last}</td>
                        <td className="px-4 py-2 text-muted-foreground">{r.bcast === null ? "—" : ipToStr(r.bcast)}</td>
                        <td className="px-4 py-2 text-right">{fmtInt(divisions.perUsable)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── 掩码速查 ─── */}
      {tab === "ref" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium">IPv4 掩码速查表（/0 – /32）</span>
            <span className="text-xs text-muted-foreground">高亮行为常用前缀</span>
          </div>
          <div className="max-h-[640px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-background z-10 shadow-[0_1px_0_0_hsl(var(--border))]">
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="px-4 py-2.5 font-medium">前缀</th>
                  <th className="px-4 py-2.5 font-medium">子网掩码</th>
                  <th className="px-4 py-2.5 font-medium">通配符</th>
                  <th className="px-4 py-2.5 font-medium text-right">地址总数</th>
                  <th className="px-4 py-2.5 font-medium text-right">可用主机</th>
                  <th className="px-4 py-2.5 font-medium">备注</th>
                </tr>
              </thead>
              <tbody>
                {REF_ROWS.map((r) => {
                  const highlight = [8, 16, 24].includes(r.prefix);
                  return (
                    <tr
                      key={r.prefix}
                      className={cn(
                        "border-t border-border/60 transition-colors",
                        highlight ? "bg-primary/5" : "hover:bg-accent/50",
                      )}
                    >
                      <td className={cn("px-4 py-2 font-mono font-semibold", highlight && "text-primary")}>/{r.prefix}</td>
                      <td className="px-4 py-2 font-mono">{r.mask}</td>
                      <td className="px-4 py-2 font-mono text-muted-foreground">{r.wild}</td>
                      <td className="px-4 py-2 font-mono text-right">{fmtInt(r.total)}</td>
                      <td className="px-4 py-2 font-mono text-right">{fmtInt(r.usable)}</td>
                      <td className="px-4 py-2 text-xs text-muted-foreground">{REF_REMARKS[r.prefix] ?? ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
