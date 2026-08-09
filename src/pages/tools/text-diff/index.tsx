import {
  ArrowLeftRight,
  Copy,
  Download,
  Eraser,
  FileDiff,
  GitCompareArrows,
  Star,
  TriangleAlert,
} from "lucide-react";
import { Fragment, useMemo, useState } from "react";



import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// ─── Types ───────────────────────────────────────────────────────

type OpType = "equal" | "del" | "ins";
interface Op {
  type: OpType;
  value: string;
}

type Mode = "line" | "word";
type View = "split" | "unified";

interface DiffRow {
  left: string | null;
  right: string | null;
  leftNo: number | null;
  rightNo: number | null;
}

interface DiffResult {
  ops: Op[];
  delCount: number;
  insCount: number;
  tooLarge: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────

function normalize(text: string, ignoreWs: boolean, ignoreCase: boolean): string {
  let t = text;
  if (ignoreWs) t = t.replace(/\s+/g, "");
  if (ignoreCase) t = t.toLowerCase();
  return t;
}

function tokenizeLine(text: string): string[] {
  return text.split("\n");
}

function tokenizeWord(text: string): string[] {
  const m = text.match(/[A-Za-z0-9]+|[\u4e00-\u9fff]|\s+|[^\s]/g);
  return m ?? [];
}

/** 经典 LCS 差分，返回 equal/del/ins 操作序列。 */
function diffTokens(a: string[], b: string[]): Op[] {
  const n = a.length;
  const m = b.length;
  // 限制规模，避免超大输入卡死
  if (n * m > 64_000_000) {
    // 退回为整段替换，保证不崩溃
    return [...a.map((v) => ({ type: "del" as OpType, value: v })), ...b.map((v) => ({ type: "ins" as OpType, value: v }))];
  }
  const dp: Int32Array[] = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ type: "equal", value: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: "del", value: a[i] });
      i++;
    } else {
      ops.push({ type: "ins", value: b[j] });
      j++;
    }
  }
  while (i < n) ops.push({ type: "del", value: a[i++] });
  while (j < m) ops.push({ type: "ins", value: b[j++] });
  return ops;
}

/** 把差分结果对齐成并排行（用于行模式分屏）。 */
function alignRows(ops: Op[]): DiffRow[] {
  const rows: DiffRow[] = [];
  let dels: { text: string; no: number }[] = [];
  let inss: { text: string; no: number }[] = [];
  let lno = 0;
  let rno = 0;
  const flush = () => {
    const max = Math.max(dels.length, inss.length);
    for (let k = 0; k < max; k++) {
      const d = dels[k];
      const ins = inss[k];
      rows.push({
        left: d ? d.text : null,
        right: ins ? ins.text : null,
        leftNo: d ? d.no : null,
        rightNo: ins ? ins.no : null,
      });
    }
    dels = [];
    inss = [];
  };
  for (const op of ops) {
    if (op.type === "equal") {
      flush();
      lno++;
      rno++;
      rows.push({ left: op.value, right: op.value, leftNo: lno, rightNo: rno });
    } else if (op.type === "del") {
      lno++;
      dels.push({ text: op.value, no: lno });
    } else {
      rno++;
      inss.push({ text: op.value, no: rno });
    }
  }
  flush();
  return rows;
}

/** 生成可复制/下载的统一差异文本。 */
function toDiffText(ops: Op[], mode: Mode): string {
  if (mode === "line") {
    return ops.map((o) => (o.type === "del" ? "- " : o.type === "ins" ? "+ " : "  ") + o.value).join("\n");
  }
  return ops
    .map((o) =>
      o.type === "equal"
        ? o.value
        : o.type === "del"
          ? `⟨删:${o.value}⟩`
          : `⟨增:${o.value}⟩`,
    )
    .join("");
}

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
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
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Copy className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "已复制" : "复制差异"}
    </Button>
  );
}

// ─── Renderers ───────────────────────────────────────────────────

function gutterClass(type: OpType): string {
  if (type === "del") return "text-red-500";
  if (type === "ins") return "text-green-600";
  return "text-gray-300";
}

function DiffUnified({ ops, mode }: { ops: Op[]; mode: Mode }) {
  if (mode === "line") {
    let lno = 0;
    let rno = 0;
    return (
      <div className="font-mono text-sm">
        {ops.map((op, i) => {
          let no = "";
          if (op.type === "equal") {
            lno++;
            rno++;
            no = String(lno);
          } else if (op.type === "del") {
            lno++;
            no = String(lno);
          } else {
            rno++;
            no = String(rno);
          }
          const lineCls =
            op.type === "del"
              ? "bg-red-50 text-red-700"
              : op.type === "ins"
                ? "bg-green-50 text-green-700"
                : "text-gray-700";
          return (
            <div key={i} className={`flex gap-2 px-3 py-0.5 ${lineCls}`}>
              <span className={`w-5 shrink-0 select-none text-center ${gutterClass(op.type)}`}>
                {op.type === "del" ? "-" : op.type === "ins" ? "+" : " "}
              </span>
              <span className="w-8 shrink-0 select-none text-right text-gray-300">{no}</span>
              <span className="whitespace-pre-wrap break-words flex-1">{op.value}</span>
            </div>
          );
        })}
      </div>
    );
  }
  // word mode: inline flow
  return (
    <div className="font-mono text-sm whitespace-pre-wrap break-words p-3 leading-relaxed">
      {ops.map((op, i) => {
        const cls =
          op.type === "del"
            ? "bg-red-100 text-red-700 line-through"
            : op.type === "ins"
              ? "bg-green-100 text-green-700"
              : "text-gray-700";
        return (
          <span key={i} className={cls}>
            {op.value}
          </span>
        );
      })}
    </div>
  );
}

function DiffSplit({ ops, mode }: { ops: Op[]; mode: Mode }) {
  if (mode === "line") {
    const rows = alignRows(ops);
    return (
      <div className="grid grid-cols-2 font-mono text-sm border border-gray-200 rounded-lg overflow-hidden">
        {rows.map((r, i) => {
          const leftCls =
            r.left === null
              ? "bg-gray-50 text-gray-300"
              : r.right === null
                ? "bg-red-50 text-red-700"
                : "bg-white text-gray-700";
          const rightCls =
            r.right === null
              ? "bg-gray-50 text-gray-300"
              : r.left === null
                ? "bg-green-50 text-green-700"
                : "bg-white text-gray-700";
          return (
            <Fragment key={i}>
              <div className={`flex gap-2 px-3 py-0.5 border-b border-gray-100 border-l-0 ${leftCls}`}>
                <span className="w-6 shrink-0 select-none text-right text-gray-300">{r.leftNo ?? ""}</span>
                <span className="whitespace-pre-wrap break-words flex-1">{r.left ?? ""}</span>
              </div>
              <div className={`flex gap-2 px-3 py-0.5 border-b border-gray-100 border-l border-gray-100 ${rightCls}`}>
                <span className="w-6 shrink-0 select-none text-right text-gray-300">{r.rightNo ?? ""}</span>
                <span className="whitespace-pre-wrap break-words flex-1">{r.right ?? ""}</span>
              </div>
            </Fragment>
          );
        })}
      </div>
    );
  }
  // word mode: 左列(原文+删除) / 右列(改后+新增) 两段内联
  return (
    <div className="grid grid-cols-2 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden font-mono text-sm">
      <div className="bg-white p-3 whitespace-pre-wrap break-words leading-relaxed">
        {ops.map((op, i) =>
          op.type !== "ins" ? (
            <span key={i} className={op.type === "del" ? "bg-red-100 text-red-700 line-through" : "text-gray-700"}>
              {op.value}
            </span>
          ) : null,
        )}
      </div>
      <div className="bg-white p-3 whitespace-pre-wrap break-words leading-relaxed border-l border-gray-100">
        {ops.map((op, i) =>
          op.type !== "del" ? (
            <span key={i} className={op.type === "ins" ? "bg-green-100 text-green-700" : "text-gray-700"}>
              {op.value}
            </span>
          ) : null,
        )}
      </div>
    </div>
  );
}

// ─── Examples ────────────────────────────────────────────────────

const EXAMPLE_LEFT = `小禾笔记是一个面向开发者的工具集合。
我们提供 JSON 格式化、代码高亮、正则测试等功能。

目标是让日常开发更加高效。
欢迎提出你的建议！`;

const EXAMPLE_RIGHT = `小禾笔记是一个面向开发者的在线工具集合。
我们提供 JSON 格式化、代码高亮、正则测试、时间转换等功能。

目标是让日常开发更加高效、顺手。
如果你喜欢，欢迎分享给同事！`;

// ─── Page ────────────────────────────────────────────────────────

export default function TextDiffPage() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");
  const [mode, setMode] = useState<Mode>("line");
  const [view, setView] = useState<View>("split");
  const [ignoreWs, setIgnoreWs] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const result: DiffResult | null = useMemo(() => {
    if (!left && !right) return null;
    const a = normalize(left, ignoreWs, ignoreCase);
    const b = normalize(right, ignoreWs, ignoreCase);
    const aTokens = mode === "line" ? tokenizeLine(a) : tokenizeWord(a);
    const bTokens = mode === "line" ? tokenizeLine(b) : tokenizeWord(b);
    if (aTokens.length > 8000 || bTokens.length > 8000) {
      return { ops: [], delCount: 0, insCount: 0, tooLarge: true };
    }
    const ops = diffTokens(aTokens, bTokens);
    const delCount = ops.filter((o) => o.type === "del").length;
    const insCount = ops.filter((o) => o.type === "ins").length;
    return { ops, delCount, insCount, tooLarge: false };
  }, [left, right, mode, ignoreWs, ignoreCase]);

  const handleSwap = () => {
    setLeft(right);
    setRight(left);
  };
  const handleClear = () => {
    setLeft("");
    setRight("");
  };
  const handleExample = () => {
    setLeft(EXAMPLE_LEFT);
    setRight(EXAMPLE_RIGHT);
  };

  const hasDiff = result && (result.delCount > 0 || result.insCount > 0);

  return (
    <>
      <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

          {/* Two inputs */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between h-9">
                <Label className="text-sm font-medium">原文（左侧）</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setLeft("")} disabled={!left}>
                    <Eraser className="size-3.5" /> 清空
                  </Button>
                </div>
              </div>
              <Textarea
                value={left}
                onChange={(e) => setLeft(e.target.value)}
                placeholder="在此粘贴原始文本…"
                className="bg-white h-64 font-mono text-sm resize-y"
                spellCheck={false}
              />
              <p className="text-xs text-gray-400 text-right">{left.length} 字符</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between h-9">
                <Label className="text-sm font-medium">对比文本（右侧）</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setRight("")} disabled={!right}>
                    <Eraser className="size-3.5" /> 清空
                  </Button>
                </div>
              </div>
              <Textarea
                value={right}
                onChange={(e) => setRight(e.target.value)}
                placeholder="在此粘贴修改后的文本…"
                className="bg-white h-64 font-mono text-sm resize-y"
                spellCheck={false}
              />
              <p className="text-xs text-gray-400 text-right">{right.length} 字符</p>
            </div>
          </div>

          {/* Options */}
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs text-gray-500">对比模式</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as Mode)}>
                  <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">按行</SelectItem>
                    <SelectItem value="word">按词</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-xs text-gray-500">视图</Label>
                <Select value={view} onValueChange={(v) => setView(v as View)}>
                  <SelectTrigger className="w-28 h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="split">并排</SelectItem>
                    <SelectItem value="unified">统一</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <Switch size="sm" checked={ignoreWs} onCheckedChange={setIgnoreWs} />
                <span className={ignoreWs ? "text-gray-900 font-medium" : "text-gray-500"}>忽略空白</span>
              </label>

              <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <Switch size="sm" checked={ignoreCase} onCheckedChange={setIgnoreCase} />
                <span className={ignoreCase ? "text-gray-900 font-medium" : "text-gray-500"}>忽略大小写</span>
              </label>

              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={handleExample}>
                  <Star className="size-3.5" /> 示例
                </Button>
                <Button variant="outline" size="sm" onClick={handleSwap} disabled={!left && !right}>
                  <ArrowLeftRight className="size-3.5" /> 交换
                </Button>
                <Button variant="outline" size="sm" onClick={handleClear} disabled={!left && !right}>
                  <Eraser className="size-3.5" /> 全部清空
                </Button>
              </div>
            </div>
          </div>

          {/* Result */}
          <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <GitCompareArrows className="size-4 text-amber-500" />
                差异结果
              </div>
              <div className="flex items-center gap-3">
                {result && !result.tooLarge && (
                  <div className="flex items-center gap-2 text-xs">
                    {hasDiff ? (
                      <>
                        <span className="text-red-600">删除 {result.delCount}</span>
                        <span className="text-green-600">新增 {result.insCount}</span>
                      </>
                    ) : (
                      <span className="text-gray-400">两段文本完全相同</span>
                    )}
                  </div>
                )}
                {result && !result.tooLarge && hasDiff && (
                  <>
                    <CopyButton text={toDiffText(result.ops, mode)} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadText(toDiffText(result.ops, mode), `diff-${mode}.txt`)}
                    >
                      <Download className="size-3.5" /> 下载
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="max-h-[60vh] overflow-auto">
              {!result ? (
                <div className="flex h-48 flex-col items-center justify-center text-sm text-gray-400">
                  <FileDiff className="size-10 opacity-30 mb-3" />
                  在上方输入或粘贴两段文本后自动对比
                </div>
              ) : result.tooLarge ? (
                <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-amber-600 px-4 text-center">
                  <TriangleAlert className="size-5" />
                  文本过大，已超出对比上限（每行/词超过 8000）。请减少内容后重试。
                </div>
              ) : (
                (view === "split" ? <DiffSplit ops={result.ops} mode={mode} /> : <DiffUnified ops={result.ops} mode={mode} />)
              )}
            </div>
          </div>

          {/* Usage note */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <GitCompareArrows className="size-4 text-gray-400" />
              <Label className="text-sm font-medium">使用说明</Label>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-sm text-gray-600">
              <li>左侧粘贴原文、右侧粘贴修改后的文本，工具会实时计算差异。</li>
              <li>「按行」以整行为单位对比；「按词」以词/字为粒度，适合段落级微调高亮。</li>
              <li>「并排」左右对照查看增删；「统一」以 + / - 行内标记展示。</li>
              <li>开启「忽略空白 / 忽略大小写」可只看内容实质变化。</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
