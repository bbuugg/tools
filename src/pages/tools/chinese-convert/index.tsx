import { Button } from "@/components/ui/button";
import { ArrowLeftRight, Check, Copy, Eraser, Sparkles } from "lucide-react";
import * as OpenCC from "opencc-js";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

// ─── 转换模式 ────────────────────────────────────────────────

type Mode = "s2t" | "s2tw" | "s2hk" | "t2s";

/** 各模式对应的 OpenCC locale（twp = 含词汇级转换） */
const CONVERT_OPTIONS: Record<Mode, { from: string; to: string }> = {
  s2t: { from: "cn", to: "t" },
  s2tw: { from: "cn", to: "twp" },
  s2hk: { from: "cn", to: "hk" },
  t2s: { from: "twp", to: "cn" },
};

const MODES: { key: Mode; label: string; desc: string }[] = [
  { key: "s2t", label: "简 → 繁", desc: "通用繁体，仅做字形转换" },
  { key: "s2tw", label: "简 → 台", desc: "台湾正体，含词汇转换（软件→軟體、内存→記憶體）" },
  { key: "s2hk", label: "简 → 港", desc: "香港繁体习惯用字" },
  { key: "t2s", label: "繁 → 简", desc: "转为大陆通行简体，兼容台湾词汇（軟體→软件）" },
];

const SAMPLE_S = "软件里显示的内存占用不对，鼠标点击设置后没有反应，头发都要愁白了。";
const SAMPLE_T = "軟體裡顯示的記憶體佔用不對，滑鼠點選設定後沒有反應，頭髮都要愁白了。";

// ─── 页面 ────────────────────────────────────────────────────

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return { copied, copy };
}

export default function ChineseConvertPage() {
  const [mode, setMode] = useState<Mode>("s2t");
  const [input, setInput] = useState(SAMPLE_S);
  const { copied, copy } = useCopy();

  // 词典转换器较重，仅在模式变化时重建
  const converter = useMemo(() => OpenCC.Converter(CONVERT_OPTIONS[mode]), [mode]);

  const output = useMemo(() => (input ? converter(input) : ""), [input, converter]);

  const activeMode = MODES.find((m) => m.key === mode)!;

  const swap = () => {
    setInput(output);
    setMode(mode === "t2s" ? "s2t" : "t2s");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* 方向选择 */}
      <div className="flex flex-wrap gap-1.5">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={(e) => {
              setMode(m.key);
              e.currentTarget.blur();
            }}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm transition-colors",
              mode === m.key ? "border-primary/50 bg-primary/5 font-medium" : "border-border hover:bg-accent",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      <p className="-mt-4 text-xs text-muted-foreground">{activeMode.desc}</p>

      <div className="grid md:grid-cols-2 gap-4 items-stretch">
        {/* 输入 */}
        <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col min-w-0">
          <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium">{mode === "t2s" ? "繁体原文" : "简体原文"}</span>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">{input.length} 字</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "t2s" ? "粘贴繁体文本…" : "粘贴简体文本…"}
            spellCheck={false}
            className="w-full flex-1 min-h-56 resize-y bg-transparent px-4 py-3 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/60"
          />
        </div>

        {/* 输出 */}
        <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col min-w-0">
          <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
            <span className="text-sm font-medium">
              {mode === "t2s" ? "简体结果" : mode === "s2tw" ? "台湾正体结果" : mode === "s2hk" ? "香港繁体结果" : "繁体结果"}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1" onClick={() => copy(output)}>
                {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                {copied ? "已复制" : "复制"}
              </Button>
            </div>
          </div>
          <textarea
            readOnly
            value={output}
            spellCheck={false}
            className="w-full flex-1 min-h-56 resize-y bg-muted/40 px-4 py-3 text-sm leading-relaxed outline-none select-all"
          />
        </div>
      </div>

      {/* 工具行 */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={swap} className="gap-1.5">
          <ArrowLeftRight className="size-3.5" />
          结果转回输入
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setInput("")}>
          <Eraser className="size-3.5" />
          清空
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setInput(mode === "t2s" ? SAMPLE_T : SAMPLE_S)}
        >
          <Sparkles className="size-3.5" />
          示例文本
        </Button>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground max-w-3xl">
        采用 OpenCC 词典做词组级映射，能正确处理单字一对多的情况：
        「头发」→「頭髮」、「出发」→「出發」、「干净」→「乾淨」、「干部」→「幹部」。
        台湾正体模式额外做地区词汇适配（内存→記憶體、网络→網路）。数据全部内置于浏览器，文本不会上传。
      </p>
    </div>
  );
}
