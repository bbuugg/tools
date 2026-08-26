import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Banknote, Check, Copy, TriangleAlert } from "lucide-react";
import { useMemo, useState } from "react";

import { convertAmount } from "@/lib/rmb-uppercase";
import { cn } from "@/lib/utils";

// ─── 页面 ────────────────────────────────────────────────────

const EXAMPLES = [
  { label: "报销单常见", value: "1234.56" },
  { label: "不足一元", value: "0.52" },
  { label: "中间有零", value: "6007.14" },
  { label: "元位带零", value: "1680.32" },
  { label: "整数", value: "80000" },
  { label: "大额", value: "108400500.88" },
];

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return { copied, copy };
}

export default function RmbUppercasePage() {
  const [amount, setAmount] = useState("1234.56");
  const { copied, copy } = useCopy();

  const result = useMemo(() => convertAmount(amount), [amount]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="flex items-center gap-2 text-xl font-semibold">
        <Banknote className="size-5 text-primary" />
        数字金额大写
      </h1>

      {/* 输入 */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <label className="text-sm font-medium">小写金额</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-muted-foreground select-none">¥</span>
          <Input
            inputMode="decimal"
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={cn("pl-9 h-12 text-lg font-mono", !result && amount.trim() !== "" && "border-destructive")}
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map((e) => (
            <button
              key={e.value}
              onClick={(ev) => {
                setAmount(e.value);
                ev.currentTarget.blur();
              }}
              className="rounded-full border border-border px-2.5 py-1 text-xs transition-colors hover:bg-accent"
            >
              {e.label} <span className="font-mono text-muted-foreground">{e.value}</span>
            </button>
          ))}
        </div>

        {result?.rounded && (
          <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
            <TriangleAlert className="size-3.5 shrink-0" />
            输入超过两位小数，已按四舍五入保留到分。
          </p>
        )}
        {!result && amount.trim() !== "" && (
          <p className="text-xs text-destructive">无法识别的金额：请输入有效数字（最多 16 位整数，支持负号与千分位逗号）。</p>
        )}
      </div>

      {/* 结果 */}
      {result && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="text-xs text-muted-foreground">中文大写</div>
              <div className="break-all text-2xl leading-relaxed font-semibold tracking-wide">{result.text}</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => copy(result.text)} className="gap-1.5 shrink-0">
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "已复制" : "复制"}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-px bg-border rounded-lg overflow-hidden border border-border text-sm">
            <div className="bg-card px-3 py-2.5 min-w-0">
              <span className="text-xs text-muted-foreground mr-2">票据写法</span>
              <span>人民币{result.text}</span>
            </div>
            <div className="bg-card px-3 py-2.5 min-w-0">
              <span className="text-xs text-muted-foreground mr-2">小写</span>
              <span className="font-mono tabular-nums break-all">¥{result.formatted}</span>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            按《正确填写票据和结算凭证的基本规定》处理：到元为止写「整」，连续多个零只写一个「零」，
            元位为零且角位非零时在元后补「零」。金额上限约 9999 兆。
          </p>
        </div>
      )}
    </div>
  );
}
