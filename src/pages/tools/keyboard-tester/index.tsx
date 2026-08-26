import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { cn } from "@/lib/utils";

// ─── 键位布局定义（event.code 为准，ANSI 104 布局） ───────────
//
// event.code 只描述物理位置，与操作系统无关：
// Mac 的 ⌘ Command 即 MetaLeft/MetaRight，⌥ Option 即 AltLeft/AltRight，
// 因此 Win / Mac 两套布局共享全部键码，仅键帽标签不同；
// 唯一的物理差异是 Mac 键盘没有 ContextMenu（菜单）键。

interface KeyDef {
  code: string;
  /** 键帽主字符 */
  label: string;
  /** 上标字符（Shift 位） */
  sub?: string;
  /** 宽度（单位 u，默认 1） */
  w?: number;
}

type Cell = KeyDef | { gap: number };
const isGap = (c: Cell): c is { gap: number } => "gap" in c;

const k = (code: string, label: string, opts?: Partial<KeyDef>): KeyDef => ({ code, label, ...opts });

/** 主键区 */
const MAIN_ROWS: Cell[][] = [
  [
    k("Escape", "Esc"),
    { gap: 1 },
    k("F1", "F1"), k("F2", "F2"), k("F3", "F3"), k("F4", "F4"),
    { gap: 0.5 },
    k("F5", "F5"), k("F6", "F6"), k("F7", "F7"), k("F8", "F8"),
    { gap: 0.5 },
    k("F9", "F9"), k("F10", "F10"), k("F11", "F11"), k("F12", "F12"),
  ],
  [
    k("Backquote", "`", { sub: "~" }),
    k("Digit1", "1", { sub: "!" }), k("Digit2", "2", { sub: "@" }), k("Digit3", "3", { sub: "#" }),
    k("Digit4", "4", { sub: "$" }), k("Digit5", "5", { sub: "%" }), k("Digit6", "6", { sub: "^" }),
    k("Digit7", "7", { sub: "&" }), k("Digit8", "8", { sub: "*" }), k("Digit9", "9", { sub: "(" }),
    k("Digit0", "0", { sub: ")" }),
    k("Minus", "-", { sub: "_" }), k("Equal", "=", { sub: "+" }),
    k("Backspace", "⌫", { w: 2 }),
  ],
  [
    k("Tab", "Tab", { w: 1.5 }),
    ..."QWERTYUIOP".split("").map((c) => k(`Key${c}`, c)),
    k("BracketLeft", "[", { sub: "{" }), k("BracketRight", "]", { sub: "}" }),
    k("Backslash", "\\", { sub: "|", w: 1.5 }),
  ],
  [
    k("CapsLock", "Caps", { w: 1.75 }),
    ..."ASDFGHJKL".split("").map((c) => k(`Key${c}`, c)),
    k("Semicolon", ";", { sub: ":" }), k("Quote", "'", { sub: '"' }),
    k("Enter", "⏎ Enter", { w: 2.25 }),
  ],
  [
    k("ShiftLeft", "⇧ Shift", { w: 2.25 }),
    ..."ZXCVBNM".split("").map((c) => k(`Key${c}`, c)),
    k("Comma", ",", { sub: "<" }), k("Period", ".", { sub: ">" }), k("Slash", "/", { sub: "?" }),
    k("ShiftRight", "⇧ Shift", { w: 2.75 }),
  ],
];

/** 布局类型 */
type Layout = "win" | "mac";

/** 修饰键键帽标签（键码一致，标签随布局切换） */
const MOD_LABELS: Record<Layout, Record<string, string>> = {
  win: { ControlLeft: "Ctrl", MetaLeft: "Win", AltLeft: "Alt", AltRight: "Alt", MetaRight: "Win", ControlRight: "Ctrl" },
  mac: {
    ControlLeft: "⌃ Control", MetaLeft: "⌘ Command", AltLeft: "⌥ Option",
    AltRight: "⌥ Option", MetaRight: "⌘ Command", ControlRight: "⌃ Control",
  },
};

/** 底部修饰键行（行宽恒为 15u；Mac 无 ContextMenu，右侧三键加宽补齐） */
function buildModRow(layout: Layout): KeyDef[] {
  const L = MOD_LABELS[layout];
  return [
    k("ControlLeft", L.ControlLeft, { w: 1.25 }), k("MetaLeft", L.MetaLeft, { w: 1.25 }), k("AltLeft", L.AltLeft, { w: 1.25 }),
    k("Space", "", { w: 6.25 }),
    ...(layout === "win"
      ? [
          k("AltRight", L.AltRight, { w: 1.25 }), k("MetaRight", L.MetaRight, { w: 1.25 }),
          k("ContextMenu", "☰", { w: 1.25 }), k("ControlRight", L.ControlRight, { w: 1.25 }),
        ]
      : [
          k("MetaRight", L.MetaRight, { w: 1.75 }), k("AltRight", L.AltRight, { w: 1.75 }), k("ControlRight", L.ControlRight, { w: 1.5 }),
        ]),
  ];
}

/** 编辑/导航区 */
const NAV_KEYS: KeyDef[] = [
  k("PrintScreen", "PrtSc"), k("ScrollLock", "ScrLk"), k("Pause", "Pause"),
  k("Insert", "Ins"), k("Home", "Home"), k("PageUp", "PgUp"),
  k("Delete", "Del"), k("End", "End"), k("PageDown", "PgDn"),
];

/** 方向键区（T 形，用 grid 摆放） */
const ARROW_KEYS: (KeyDef & { col: number; row: number })[] = [
  { ...k("ArrowUp", "↑"), col: 2, row: 1 },
  { ...k("ArrowLeft", "←"), col: 1, row: 2 },
  { ...k("ArrowDown", "↓"), col: 2, row: 2 },
  { ...k("ArrowRight", "→"), col: 3, row: 2 },
];

/** 小键盘区（grid 摆放，含跨行/跨列） */
const NUMPAD_KEYS: (KeyDef & { col: number; row: number; rs?: number; cs?: number })[] = [
  { ...k("NumLock", "Num"), col: 1, row: 1 }, { ...k("NumpadDivide", "/"), col: 2, row: 1 },
  { ...k("NumpadMultiply", "*"), col: 3, row: 1 }, { ...k("NumpadSubtract", "-"), col: 4, row: 1 },
  { ...k("Numpad7", "7"), col: 1, row: 2 }, { ...k("Numpad8", "8"), col: 2, row: 2 },
  { ...k("Numpad9", "9"), col: 3, row: 2 }, { ...k("NumpadAdd", "+"), col: 4, row: 2, rs: 2 },
  { ...k("Numpad4", "4"), col: 1, row: 3 }, { ...k("Numpad5", "5"), col: 2, row: 3 },
  { ...k("Numpad6", "6"), col: 3, row: 3 },
  { ...k("Numpad1", "1"), col: 1, row: 4 }, { ...k("Numpad2", "2"), col: 2, row: 4 },
  { ...k("Numpad3", "3"), col: 3, row: 4 }, { ...k("NumpadEnter", "⏎"), col: 4, row: 4, rs: 2 },
  { ...k("Numpad0", "0"), col: 1, row: 5, cs: 2 }, { ...k("NumpadDecimal", "."), col: 3, row: 5 },
];

/** 固定区域键码（主键区不含修饰键行；Fn 键不产生浏览器事件，不在其中） */
const STATIC_CODES = [
  ...MAIN_ROWS.flatMap((row) => row.filter((c) => !isGap(c)).map((c) => (c as KeyDef).code)),
  ...NAV_KEYS.map((x) => x.code),
  ...ARROW_KEYS.map((x) => x.code),
  ...NUMPAD_KEYS.map((x) => x.code),
];

/** 某布局下的全部键码集合 */
function codesOf(layout: Layout): Set<string> {
  return new Set([...STATIC_CODES, ...buildModRow(layout).map((d) => d.code)]);
}
const LAYOUT_TOTALS: Record<Layout, number> = { win: codesOf("win").size, mac: codesOf("mac").size };

// ─── 事件日志 ────────────────────────────────────────────────

interface LogEntry {
  id: number;
  time: string;
  type: "keydown" | "keyup";
  key: string;
  code: string;
  keyCode: number;
}

interface KeyEventInfo {
  key: string;
  code: string;
  keyCode: number;
  location: number;
}

function fmtTime(d: Date): string {
  return `${d.toLocaleTimeString("zh-CN", { hour12: false })}.${String(d.getMilliseconds()).padStart(3, "0")}`;
}

/** 分段切换（选中后立即失焦，避免空格/回车在测试时误触按钮） */
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

// ─── 页面 ────────────────────────────────────────────────────

export default function KeyboardTesterPage() {
  // 布局记忆在本地，Mac 用户无需每次切换
  const [layout, setLayout] = useState<Layout>(() =>
    localStorage.getItem("kb-tester-layout") === "mac" ? "mac" : "win",
  );
  useEffect(() => {
    localStorage.setItem("kb-tester-layout", layout);
  }, [layout]);

  const [tested, setTested] = useState<Set<string>>(new Set());
  const [pressed, setPressed] = useState<Set<string>>(new Set());
  const [lastEvent, setLastEvent] = useState<KeyEventInfo | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const logIdRef = useRef(0);

  useEffect(() => {
    // 测试页无输入框：拦截所有按键的浏览器默认行为（F5 刷新、空格滚动、Tab 焦点等）
    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.repeat) return; // 长按重复不重复记录
      setPressed((prev) => new Set(prev).add(e.code));
      setTested((prev) => (prev.has(e.code) ? prev : new Set(prev).add(e.code)));
      setLastEvent({ key: e.key, code: e.code, keyCode: e.keyCode, location: e.location });
      const entry: LogEntry = {
        id: ++logIdRef.current,
        time: fmtTime(new Date()),
        type: "keydown",
        key: e.key,
        code: e.code,
        keyCode: e.keyCode,
      };
      setLog((prev) => [entry, ...prev].slice(0, 40));
    };

    const onKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      setPressed((prev) => {
        if (!prev.has(e.code)) return prev;
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
      const entry: LogEntry = {
        id: ++logIdRef.current,
        time: fmtTime(new Date()),
        type: "keyup",
        key: e.key,
        code: e.code,
        keyCode: e.keyCode,
      };
      setLog((prev) => [entry, ...prev].slice(0, 40));
    };

    // 失焦时清掉「按住」高亮，避免切窗口后残留
    const onBlur = () => setPressed(new Set());

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  const reset = () => {
    setTested(new Set());
    setPressed(new Set());
    setLog([]);
    setLastEvent(null);
  };

  // 进度只统计当前布局中存在的键（切布局后另一布局的记录不丢，也不计入）
  const layoutCodes = useMemo(() => codesOf(layout), [layout]);
  const total = LAYOUT_TOTALS[layout];
  const testedCount = useMemo(() => {
    let n = 0;
    tested.forEach((c) => layoutCodes.has(c) && n++);
    return n;
  }, [tested, layoutCodes]);
  const pct = Math.round((testedCount / total) * 100);

  const keyStateClass = (code: string) =>
    cn(
      "relative flex flex-col items-center justify-center rounded-md border h-[var(--u)] text-xs font-medium select-none transition-colors duration-75 overflow-hidden",
      tested.has(code)
        ? "border-primary/40 bg-primary/10"
        : "border-border bg-card",
      pressed.has(code) && "bg-primary border-primary text-primary-foreground scale-[0.96]",
    );

  const renderKey = (def: KeyDef, extra?: string) => (
    <div
      key={def.code}
      style={{ width: `calc(var(--u) * ${def.w ?? 1})` }}
      className={cn(keyStateClass(def.code), extra)}
      title={def.code}
    >
      {/* 已点亮角标 */}
      <span
        className={cn(
          "absolute right-1 top-1 size-1 rounded-full transition-colors",
          pressed.has(def.code) ? "bg-primary-foreground" : tested.has(def.code) ? "bg-primary" : "bg-transparent",
        )}
      />
      {def.sub && <span className="text-[9px] leading-none opacity-70 self-end mr-1">{def.sub}</span>}
      <span className={cn("leading-tight px-0.5 truncate", def.code === "Space" && "opacity-0")}>{def.label}</span>
      {/* Space 键显示提示文字 */}
      {def.code === "Space" && <span className="absolute text-[10px] text-muted-foreground">Space</span>}
    </div>
  );

  const renderGaps = (cells: Cell[]) =>
    cells.map((c, i) => (isGap(c) ? <div key={`g${i}`} className="shrink-0" style={{ width: `calc(var(--u) * ${c.gap})` }} /> : renderKey(c)));

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 进度与操作 */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-medium">测试进度</span>
            <span className="text-lg font-semibold tabular-nums">
              {testedCount}
              <span className="text-sm font-normal text-muted-foreground"> / {total} 键</span>
            </span>
            {!log.length && lastEvent === null && (
              <span className="text-sm text-muted-foreground animate-pulse">按下键盘任意键开始…</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Segmented<Layout>
              options={[
                { value: "win", label: "Windows 键盘" },
                { value: "mac", label: "Mac 键盘" },
              ]}
              value={layout}
              onChange={setLayout}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                reset();
                e.currentTarget.blur();
              }}
            >
              <RotateCcw className="size-3.5 mr-1.5" />
              重置
            </Button>
          </div>
        </div>
        {/* 进度条 */}
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-xs text-muted-foreground">
          点亮的键表示已成功触发；始终灰暗的键可能存在故障。Win / Mac 切换只改变键帽显示与统计口径——
          event.code 按物理位置定义（Mac 的 ⌘ 即 Meta、⌥ 即 Alt），两个平台完全一致。部分系统级快捷键（Win/Cmd、Ctrl+W、Alt+F4
          等）无法被浏览器拦截，请留意误触；Fn 键不产生浏览器事件，无法测试。
        </p>
      </div>

      {/* 可视化键盘 */}
      <div
        className="rounded-xl border border-border bg-card p-4 overflow-x-auto"
        style={{ "--u": "clamp(26px, 3.2vw, 44px)" } as CSSProperties}
      >
        <div className="flex gap-4 min-w-max">
          {/* 主键区 */}
          <div className="space-y-1.5">
            {[...MAIN_ROWS, buildModRow(layout)].map((row, i) => (
              <div key={i} className="flex gap-1.5">
                {renderGaps(row)}
              </div>
            ))}
          </div>

          {/* 导航区 + 方向键 */}
          <div className="flex flex-col justify-between">
            <div
              className="grid gap-1.5"
              style={{ gridTemplateColumns: "repeat(3, var(--u))" }}
            >
              {NAV_KEYS.map((d) => renderKey(d))}
            </div>
            <div className="flex justify-end">
              <div
                className="grid gap-1.5"
                style={{
                  gridTemplateColumns: "repeat(3, var(--u))",
                  gridTemplateRows: "var(--u) var(--u)",
                }}
              >
                {ARROW_KEYS.map((d) => (
                  <div key={d.code} style={{ gridColumn: d.col, gridRow: d.row }}>
                    {renderKey({ ...d })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 小键盘 */}
          <div
            className="grid gap-1.5"
            style={{
              gridTemplateColumns: "repeat(4, var(--u))",
              gridAutoRows: "var(--u)",
            }}
          >
            {NUMPAD_KEYS.map((d) => (
              <div
                key={d.code}
                style={{ gridColumn: `${d.col} / span ${d.cs ?? 1}`, gridRow: `${d.row} / span ${d.rs ?? 1}` }}
                className={cn(d.rs === 2 && "[&>div]:h-full")}
              >
                {renderKey({ ...d })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 按键信息 + 日志 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium">最近按键</span>
            <span className="text-xs text-muted-foreground">aria-live 实时更新</span>
          </div>
          {lastEvent ? (
            <div aria-live="polite" className="grid grid-cols-2 gap-px bg-border">
              {[
                { label: "key", value: lastEvent.key || '""' },
                { label: "code", value: lastEvent.code },
                { label: "keyCode", value: String(lastEvent.keyCode), mono: true },
                {
                  label: "location",
                  value: ["标准", "左侧", "右侧", "小键盘"][lastEvent.location] ?? String(lastEvent.location),
                  mono: true,
                },
              ].map((t) => (
                <div key={t.label} className="bg-card px-4 py-3">
                  <div className="text-xs text-muted-foreground">{t.label}</div>
                  <div className={cn("mt-0.5 text-lg font-semibold truncate", t.mono && "font-mono")}>{t.value}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-sm text-muted-foreground">等待按键输入…</div>
          )}
          <p className="px-5 py-3 border-t border-border text-xs text-muted-foreground">
            提示：keyCode 已被规范废弃，仅部分浏览器保留，新代码请使用 <code className="font-mono">KeyboardEvent.code</code>。
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium">事件日志</span>
            <span className="text-xs text-muted-foreground">最近 40 条 · 新事件在上</span>
          </div>
          <div className="max-h-[280px] overflow-auto p-3 font-mono text-xs space-y-1">
            {log.length ? (
              log.map((e) => (
                <div key={e.id} className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-muted-foreground tabular-nums">{e.time}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] shrink-0",
                      e.type === "keydown" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {e.type}
                  </span>
                  <span className="font-semibold">key={e.key === " " ? '" "' : e.key}</span>
                  <span className="text-muted-foreground">code={e.code}</span>
                  <span className="text-muted-foreground">keyCode={e.keyCode}</span>
                </div>
              ))
            ) : (
              <div className="h-24 flex items-center justify-center text-muted-foreground">暂无事件</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
