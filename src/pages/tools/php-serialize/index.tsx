import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeftRight,
  Braces,
  Check,
  Copy,
  FileCode2,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import MonacoEditor from "@/components/MonacoEditor"

// ── Buffer polyfill ───────────────────────────────────────────────
// php-serialize's `unserialize` uses Node.js `Buffer` internally (in the
// Parser class). The browser doesn't have Buffer natively, so we install
// the `buffer` npm package and assign it to the global scope before any
// php-serialize function is called.
import { Buffer } from "buffer";
if (typeof globalThis !== "undefined" && !(globalThis as any).Buffer) {
  (globalThis as any).Buffer = Buffer;
}

// Now safe to import php-serialize — its functions are only called at
// runtime (not at import time), so the global Buffer will be available.
import { isSerialized, serialize as phpSerialize, unserialize as phpUnserialize } from "php-serialize";

const SAMPLE_JSON = JSON.stringify(
  {
    name: "测试用户",
    age: 28,
    active: true,
    tags: ["admin", "vip"],
    address: null,
    balance: 99.95,
  },
  null,
  2,
);

const SAMPLE_PHP = `a:6:{s:4:"name";s:12:"测试用户";s:3:"age";i:28;s:6:"active";b:1;s:4:"tags";a:2:{i:0;s:5:"admin";i:1;s:3:"vip";}s:7:"address";N;s:7:"balance";d:99.95;}`;

export default function PhpSerializePage() {
  const [mode, setMode] = useState("serialize");

  // Serialize state
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON);
  const [serializedOutput, setSerializedOutput] = useState("");
  const [serializeError, setSerializeError] = useState("");

  // Unserialize state
  const [phpInput, setPhpInput] = useState(SAMPLE_PHP);
  const [unserializedOutput, setUnserializedOutput] = useState("");
  const [unserializeError, setUnserializeError] = useState("");
  const [isValidPhp, setIsValidPhp] = useState<boolean | null>(null);

  // Copied state
  const [copied, setCopied] = useState(false);

  // 自动序列化：JSON 输入变化时自动执行
  useEffect(() => {
    if (!jsonInput.trim()) {
      setSerializedOutput("");
      setSerializeError("");
      return;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      const result = phpSerialize(parsed);
      setSerializedOutput(result);
      setSerializeError("");
    } catch (e) {
      setSerializeError(
        e instanceof Error ? e.message : "序列化失败，请检查 JSON 格式",
      );
      setSerializedOutput("");
    }
  }, [jsonInput]);

  // 自动反序列化：PHP 输入变化时自动执行
  useEffect(() => {
    const trimmed = phpInput.trim();
    if (!trimmed) {
      setUnserializedOutput("");
      setUnserializeError("");
      setIsValidPhp(null);
      return;
    }

    try {
      const valid = isSerialized(trimmed);
      setIsValidPhp(valid);

      if (!valid) {
        setUnserializeError("输入的不是有效的 PHP 序列化字符串");
        setUnserializedOutput("");
        return;
      }

      const result = phpUnserialize(trimmed);

      const json = JSON.stringify(
        result,
        (_key, value) => {
          if (typeof value === "bigint") return value.toString();
          if (value && typeof value === "object" && value.__PHP_Incomplete_Class_Name) {
            return {
              __PHP_Incomplete_Class_Name: value.__PHP_Incomplete_Class_Name,
              ...Object.fromEntries(
                Object.entries(value).filter(
                  ([k]) => k !== "__PHP_Incomplete_Class_Name",
                ),
              ),
            };
          }
          return value;
        },
        2,
      );
      setUnserializedOutput(json);
      setUnserializeError("");
    } catch (e) {
      setUnserializeError(
        e instanceof Error ? e.message : "反序列化失败，请检查 PHP 序列化格式",
      );
      setUnserializedOutput("");
    }
  }, [phpInput]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSwap = useCallback(() => {
    if (mode === "serialize" && serializedOutput) {
      setPhpInput(serializedOutput);
      setMode("unserialize");
    } else if (mode === "unserialize" && unserializedOutput) {
      setJsonInput(unserializedOutput);
      setMode("serialize");
    }
  }, [mode, serializedOutput, unserializedOutput]);

  return (
    <>
      <div className="overflow-x-hidden">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4 overflow-x-hidden">

          <Tabs value={mode} onValueChange={setMode}>
            <div className="flex items-center justify-between">
              <TabsList className="w-full max-w-xs">
                <TabsTrigger value="serialize" className="flex-1">
                  <FileCode2 className="size-4" /> 序列化
                </TabsTrigger>
                <TabsTrigger value="unserialize" className="flex-1">
                  <Braces className="size-4" /> 反序列化
                </TabsTrigger>
              </TabsList>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSwap}
                title="将结果填入另一侧输入框"
              >
                <ArrowLeftRight className="size-4" /> 交换
              </Button>
            </div>

            {/* Serialize: JSON → PHP */}
            <TabsContent value="serialize" forceMount className="mt-4 data-[state=inactive]:hidden">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="flex flex-col gap-2 min-w-0">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">JSON 输入</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setJsonInput(SAMPLE_JSON)}
                    >
                      示例
                    </Button>
                  </div>
                  <div className="h-[300px]">
                    <MonacoEditor
                      value={jsonInput}
                      onChange={setJsonInput}
                      language="json"
                      height="100%"
                      showLineNumbersToggle
                      showWordWrapToggle
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 min-w-0">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">PHP 序列化结果</Label>
                    {serializedOutput && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(serializedOutput)}
                      >
                        {copied ? (
                          <Check className="size-3.5" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}{" "}
                        复制
                      </Button>
                    )}
                  </div>
                  {serializeError ? (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                      <TriangleAlert className="size-4 shrink-0" />
                      {serializeError}
                    </div>
                  ) : (
                    <Textarea
                      className="w-full flex-1 rounded-lg border border-border p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[300px]"
                      value={serializedOutput}
                      readOnly
                      placeholder="输入 JSON 后自动生成 PHP 序列化字符串..."
                    />
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Unserialize: PHP → JSON */}
            <TabsContent value="unserialize" forceMount className="mt-4 data-[state=inactive]:hidden">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="flex flex-col gap-2 min-w-0">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      PHP 序列化字符串
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPhpInput(SAMPLE_PHP)}
                    >
                      示例
                    </Button>
                  </div>
                  <Textarea
                    className="w-full rounded-lg border border-border p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[300px] text-xs sm:text-xs break-all overflow-x-auto"
                    value={phpInput}
                    onChange={(e) => setPhpInput(e.target.value)}
                    placeholder={'粘贴 PHP serialize 格式的字符串，如 a:2:{s:4:"name";s:5:"admin";s:3:"age";i:28;}'}
                    rows={12}
                  />
                </div>

                <div className="flex flex-col gap-2 min-w-0">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">JSON 结果</Label>
                    {unserializedOutput && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(unserializedOutput)}
                      >
                        {copied ? (
                          <Check className="size-3.5" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}{" "}
                        复制
                      </Button>
                    )}
                  </div>
                  {!unserializeError && isValidPhp !== null && (
                    <div
                      className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${isValidPhp
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-red-200 bg-red-50 text-red-600"
                        }`}
                    >
                      {isValidPhp ? (
                        <Check className="size-4 shrink-0" />
                      ) : (
                        <TriangleAlert className="size-4 shrink-0" />
                      )}
                      {isValidPhp
                        ? "格式验证通过"
                        : "不是有效的 PHP 序列化字符串"}
                    </div>
                  )}
                  {unserializeError ? (
                    <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                      <TriangleAlert className="size-4 shrink-0" />
                      {unserializeError}
                    </div>
                  ) : (
                    <div className="h-[300px]">
                      {unserializedOutput && (
                        <MonacoEditor
                          value={unserializedOutput}
                          readOnly
                          language="json"
                          height="100%"
                          showCopyButton
                          showWordWrapToggle
                        />
                      )}
                      {!unserializedOutput && (
                        <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                          输入 PHP 序列化字符串后自动生成 JSON 结果
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Format reference */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              PHP Serialize 格式说明
            </h3>
            <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
                  N;
                </code>{" "}
                → null
              </div>
              <div>
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
                  b:0;
                </code>{" "}
                /{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
                  b:1;
                </code>{" "}
                → false / true
              </div>
              <div>
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
                  i:42;
                </code>{" "}
                → 整数
              </div>
              <div>
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
                  d:3.14;
                </code>{" "}
                → 浮点数
              </div>
              <div>
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
                  s:5:"hello";
                </code>{" "}
                → 字符串
              </div>
              <div>
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
                  {"a:2:{...}"}
                </code>{" "}
                → 数组
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
