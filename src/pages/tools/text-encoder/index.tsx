import { useMemo, useState } from "react";

import TextToolLayout from "@/components/TextToolLayout";
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
  decodeText,
  encodeText,
  ENCODE_TYPES,
  type EncodeDir,
  type EncodeType,
} from "@/lib/text-encoding";

const EXAMPLE = "Hello 世界！This is a test 测试文本。";

export default function TextEncoderPage() {
  const [input, setInput] = useState("");
  const [type, setType] = useState<EncodeType>("url");
  const [dir, setDir] = useState<EncodeDir>("encode");

  const result = useMemo(() => {
    if (!input) return { output: "", error: "" };
    try {
      const output =
        dir === "encode" ? encodeText(type, input) : decodeText(type, input);
      return { output, error: "" };
    } catch {
      return {
        output: "",
        error: `${dir === "encode" ? "编码" : "解码"}失败，请检查输入内容是否正确`,
      };
    }
  }, [input, type, dir]);

  const typeLabel = ENCODE_TYPES.find((t) => t.value === type)?.label ?? "";

  return (
    <TextToolLayout
      input={input}
      onInputChange={setInput}
      output={result.output}
      error={result.error}
      outputLabel={`${typeLabel} ${dir === "encode" ? "编码" : "解码"}`}
      downloadName="text-encoder-result.txt"
      onExample={() => setInput(EXAMPLE)}
      onSwap={() => {
        setInput(result.output);
        setDir((prev) => (prev === "encode" ? "decode" : "encode"));
      }}
      options={
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">类型</Label>
            <Select value={type} onValueChange={(v) => setType(v as EncodeType)}>
              <SelectTrigger className="h-8 w-36">
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

          {/* 编码 / 解码切换 */}
          <div className="flex items-center gap-2 text-sm">
            <span
              className={
                dir === "encode"
                  ? "font-medium text-primary"
                  : "text-muted-foreground"
              }
            >
              编码
            </span>
            <Switch
              size="sm"
              checked={dir === "decode"}
              onCheckedChange={(c) => setDir(c ? "decode" : "encode")}
            />
            <span
              className={
                dir === "decode"
                  ? "font-medium text-primary"
                  : "text-muted-foreground"
              }
            >
              解码
            </span>
          </div>

          <p className="ml-auto text-xs text-muted-foreground">
            {typeLabel} · {dir === "encode" ? "编码" : "解码"}
          </p>
        </div>
      }
    />
  );
}
