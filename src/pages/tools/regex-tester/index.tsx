import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Check,
  Copy,
  Info,
  Trash2
} from "lucide-react";
import { useEffect, useState } from "react";

type MatchArray = RegExpExecArray[];

const EXAMPLES = [
  { name: "邮箱", pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}", flags: "g", testText: "test@example.com, invalid-email, another.email@domain.co.uk" },
  { name: "手机号", pattern: "1[3-9]\\d{9}", flags: "g", testText: "联系我：13800138000 或 15912345678，座机010-12345678" },
  { name: "URL", pattern: "https?://[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&//=]*)", flags: "g", testText: "访问 https://www.example.com/path?q=1 或 http://test.org 获取信息" },
  { name: "IP地址", pattern: "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b", flags: "g", testText: "服务器IP为 192.168.1.1 和 10.0.0.255，无效IP：999.999.999.999" },
  { name: "中文字符", pattern: "[\\u4e00-\\u9fa5]", flags: "g", testText: "Hello世界，你好World！中文测试test" },
];

const FLAGS = [
  { flag: "g", label: "全局" },
  { flag: "i", label: "忽略大小写" },
  { flag: "m", label: "多行" },
  { flag: "s", label: "dotAll" },
];

function escapeHtml(text: string) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testStr, setTestStr] = useState("");
  const [matches, setMatches] = useState<MatchArray>([]);
  const [regexError, setRegexError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showGroups, setShowGroups] = useState(true);

  const matchCount = matches.length;

  useEffect(() => {
    if (!pattern || !testStr) {
      setMatches([]);
      setRegexError(null);
      return;
    }
    try {
      new RegExp(pattern, flags);
      setRegexError(null);
      const all: MatchArray = [];
      if (flags.includes("g")) {
        const re = new RegExp(pattern, flags);
        let m: RegExpExecArray | null;
        while ((m = re.exec(testStr)) !== null) {
          all.push(m);
          if (m.index === re.lastIndex) re.lastIndex++;
        }
      } else {
        const re = new RegExp(pattern, flags.replace("g", ""));
        const m = re.exec(testStr);
        if (m) all.push(m);
      }
      setMatches(all);
    } catch (e) {
      setRegexError(e instanceof Error ? e.message : "正则表达式错误");
      setMatches([]);
    }
  }, [pattern, flags, testStr]);

  const toggleFlag = (f: string) => {
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, "") : prev + f));
  };

  const clearAll = () => {
    setPattern("");
    setFlags("g");
    setTestStr("");
    setMatches([]);
    setRegexError(null);
  };

  const renderHighlighted = () => {
    if (!testStr || matchCount === 0) {
      return <span className="text-gray-400">无匹配</span>;
    }
    let html = "";
    let lastIdx = 0;
    const sorted = [...matches].sort((a, b) => a.index - b.index);
    sorted.forEach((m) => {
      html += escapeHtml(testStr.substring(lastIdx, m.index));
      html += `<span style="background-color:rgba(139,92,246,0.5);color:white;font-weight:bold;padding:0 4px;border-radius:3px;">${escapeHtml(m[0])}</span>`;
      lastIdx = m.index + m[0].length;
    });
    if (lastIdx < testStr.length) html += escapeHtml(testStr.substring(lastIdx));
    return <div dangerouslySetInnerHTML={{ __html: html }} className="whitespace-pre-wrap break-words font-mono text-sm" />;
  };

  return (
    <>
      <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

          <div className="grid gap-4 lg:grid-cols-3">
            {/* Left sidebar */}
            <div className="space-y-4">
              {/* Examples */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <Label className="text-sm font-semibold mb-3 block">常用示例</Label>
                <div className="space-y-1.5">
                  {EXAMPLES.map((ex) => (
                    <Button
                      key={ex.name}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => { setPattern(ex.pattern); setFlags(ex.flags); setTestStr(ex.testText); }}
                    >
                      {ex.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Label className="text-sm font-semibold">选项</Label>
                  <Button variant="outline" size="sm" onClick={clearAll} className="text-red-500">
                    <Trash2 className="size-3.5" /> 清空
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">标志位</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {FLAGS.map((f) => (
                      <button
                        key={f.flag}
                        className={cn(
                          "rounded px-2 py-1 text-xs font-medium transition-colors",
                          flags.includes(f.flag) ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        )}
                        onClick={() => toggleFlag(f.flag)}
                      >
                        {f.flag} ({f.label})
                      </button>
                    ))}
                  </div>
                </div>
                <label className="mt-3 flex items-center gap-2 text-sm cursor-pointer select-none">
                  <Checkbox checked={showGroups} onCheckedChange={(c) => setShowGroups(c === true)} />
                  显示捕获组
                </label>
              </div>
            </div>

            {/* Right: Test area */}
            <div className="space-y-4 lg:col-span-2">
              {/* Regex input */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Label className="text-sm font-semibold">正则表达式</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pattern}
                    onClick={() => {
                      navigator.clipboard.writeText(`/${pattern}/${flags}`);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                  >
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copied ? "已复制" : "复制"}
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">/</span>
                  <Input
                    value={pattern}
                    onChange={(e) => setPattern(e.target.value)}
                    placeholder="输入正则表达式"
                    className="flex-1 border-0 font-mono focus-visible:ring-0"
                  />
                  <span className="text-gray-400">/</span>
                  <Input
                    value={flags}
                    onChange={(e) => setFlags(e.target.value)}
                    placeholder="flags"
                    className="w-16 font-mono"
                  />
                </div>
                {regexError && (
                  <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-600">{regexError}</div>
                )}
              </div>

              {/* Test text */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Label className="text-sm font-semibold">测试文本</Label>
                  <span className="text-xs text-gray-400">{testStr.length} 字符</span>
                </div>
                <Textarea
                  value={testStr}
                  onChange={(e) => setTestStr(e.target.value)}
                  placeholder="输入要测试的文本"
                  rows={6}
                  className="font-mono"
                />
              </div>

              {/* Results */}
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Label className="text-sm font-semibold">匹配结果</Label>
                  <span className="rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-600">{matchCount} 个匹配</span>
                </div>
                {testStr ? (
                  <div className="space-y-4">
                    <div className="rounded-md bg-gray-900 p-4">{renderHighlighted()}</div>
                    {showGroups && matchCount > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-500">捕获组详情</Label>
                        {matches.map((m, i) => (
                          <div key={i} className="rounded-md border border-gray-100 p-3">
                            <div className="mb-2 text-xs text-gray-400">匹配 #{i + 1}（位置：{m.index}）</div>
                            <div className="space-y-1.5">
                              <div className="flex items-start gap-2">
                                <span className="min-w-[40px] text-xs text-gray-400">完整:</span>
                                <code className="break-all rounded bg-purple-100 px-2 py-0.5 text-sm">{escapeHtml(m[0] || "")}</code>
                              </div>
                              {m.length > 1 && Array.from({ length: m.length - 1 }, (_, gi) => gi + 1).map((g) => (
                                <div key={g} className="flex items-start gap-2">
                                  <span className="min-w-[40px] text-xs text-gray-400">组 {g}:</span>
                                  <code className="break-all rounded bg-purple-100 px-2 py-0.5 text-sm">{escapeHtml(m[g] || "")}</code>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-4 text-sm text-gray-400">
                    <Info className="mr-2 size-4" />请输入测试文本
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
