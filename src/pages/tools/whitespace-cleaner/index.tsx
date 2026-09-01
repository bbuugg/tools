import { useMemo, useState } from "react";

import TextToolLayout from "@/components/TextToolLayout";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type StripOption = "both" | "start" | "end" | "all" | "newlines" | "blankLines" | "collapse";

const STRIP_OPTIONS: { value: StripOption; label: string; desc: string }[] = [
  { value: "both", label: "首尾空格", desc: "去除文本首尾空白" },
  { value: "start", label: "行首空格", desc: "去除每行行首空白" },
  { value: "end", label: "行尾空格", desc: "去除每行行尾空白" },
  { value: "collapse", label: "合并空格", desc: "连续空格 / 制表符合并为一个空格" },
  { value: "blankLines", label: "空行", desc: "去除只含空白字符的空行" },
  { value: "all", label: "所有空格", desc: "去除所有空白字符" },
  { value: "newlines", label: "换行符", desc: "去除所有换行符" },
];

const EXAMPLE =
  "   这是一个    带有多余空格     和换行符的文本示例。\n\n这是   第二行     内容。\n   还有第三行内容。   \n";

export default function WhitespaceCleanerPage() {
  const [input, setInput] = useState("");
  const [modes, setModes] = useState<Set<StripOption>>(new Set(["both"]));

  const output = useMemo(() => {
    if (!input) return "";
    let text = input;
    // 按合理顺序依次应用所选清理模式
    if (modes.has("both")) text = text.trim();
    if (modes.has("start")) text = text.replace(/^[ \t]+/gm, "");
    if (modes.has("end")) text = text.replace(/[ \t]+$/gm, "");
    if (modes.has("collapse")) text = text.replace(/[ \t]{2,}/g, " ");
    if (modes.has("blankLines")) text = text.replace(/^[ \t]*\r?\n/gm, "");
    if (modes.has("all")) text = text.replace(/\s+/g, "");
    if (modes.has("newlines")) text = text.replace(/[\r\n]+/g, "");
    return text;
  }, [input, modes]);

  const toggleMode = (mode: StripOption) => {
    setModes((prev) => {
      const next = new Set(prev);
      if (next.has(mode)) next.delete(mode);
      else next.add(mode);
      return next;
    });
  };

  return (
    <TextToolLayout
      input={input}
      onInputChange={setInput}
      output={output}
      outputLabel="清理结果"
      downloadName="whitespace-cleaner-result.txt"
      onExample={() => setInput(EXAMPLE)}
      onSwap={() => setInput(output)}
      options={
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Label className="text-xs text-muted-foreground">
            清理模式（可多选）
          </Label>
          {STRIP_OPTIONS.map((m) => (
            <label
              key={m.value}
              className="flex cursor-pointer items-center gap-1.5 text-sm select-none"
              title={m.desc}
            >
              <Checkbox
                checked={modes.has(m.value)}
                onCheckedChange={() => toggleMode(m.value)}
              />
              <span
                className={
                  modes.has(m.value)
                    ? "font-medium text-foreground"
                    : "text-muted-foreground"
                }
              >
                {m.label}
              </span>
            </label>
          ))}
          {modes.size === 0 && (
            <p className="text-xs text-amber-500">请至少选择一个清理模式</p>
          )}
        </div>
      }
    />
  );
}
