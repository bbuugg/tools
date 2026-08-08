import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { type SiteDefination } from "@/lib/site";
import { cn } from "@/lib/utils";
import {
  ArrowLeftRight,
  Check,
  Copy,
  FileCode2,
  Star,
  Trash2,
} from "lucide-react";
import { marked } from "marked";
import { useEffect, useState } from "react";
import TurndownService from "turndown";

import MonacoEditor from "@/components/MonacoEditor"

type Mode = "md2html" | "html2md";

const MD_EXAMPLE = `# Example Title

This is a **bold** text and *italic* text.

## Subtitle

- List item 1
- List item 2
- List item 3

[This is a link](https://example.com)

\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

> This is a quote

---

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`;

const HTML_EXAMPLE = `<h1>Example Title</h1>
<p>This is a <strong>bold</strong> text and <em>italic</em> text.</p>

<h2>Subtitle</h2>

<ul>
  <li>List item 1</li>
  <li>List item 2</li>
  <li>List item 3</li>
</ul>

<p><a href="https://example.com">This is a link</a></p>

<pre><code class="language-javascript">function hello() {
  console.log("Hello, world!");
}</code></pre>

<blockquote><p>This is a quote</p></blockquote>

<hr />

<table>
  <thead><tr><th>Header 1</th><th>Header 2</th></tr></thead>
  <tbody>
    <tr><td>Cell 1</td><td>Cell 2</td></tr>
    <tr><td>Cell 3</td><td>Cell 4</td></tr>
  </tbody>
</table>`;

const EDITOR_HEIGHT = "420px";

export default function HtmlMarkdownConverterPage({ title, description }: SiteDefination) {
  const [mode, setMode] = useState<Mode>("md2html");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Real-time auto-convert whenever input or mode changes
  useEffect(() => {
    if (!input.trim()) {
      setOutput("");
      setError(null);
      return;
    }
    try {
      if (mode === "md2html") {
        const html = marked.parse(input, { async: false }) as string;
        setOutput(html);
      } else {
        const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });
        setOutput(td.turndown(input));
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "转换失败");
      setOutput("");
    }
  }, [input, mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === "md2html" ? "html2md" : "md2html"));
    setInput(output);
    setOutput("");
    setError(null);
  };

  const loadExample = () => {
    setInput(mode === "md2html" ? MD_EXAMPLE : HTML_EXAMPLE);
    setOutput("");
    setError(null);
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  const copyResult = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
              <FileCode2 className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{title}</h1>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          <div className="grid gap-4 lg:grid-cols-2 items-start">
            {/* Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-md border border-gray-200 p-0.5">
                    <button
                      className={cn("rounded px-2.5 py-0.5 text-xs font-medium transition-colors", mode === "md2html" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100")}
                      onClick={() => setMode("md2html")}
                    >MD → HTML</button>
                    <button
                      className={cn("rounded px-2.5 py-0.5 text-xs font-medium transition-colors", mode === "html2md" ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100")}
                      onClick={() => setMode("html2md")}
                    >HTML → MD</button>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" onClick={toggleMode} title="交换">
                    <ArrowLeftRight className="size-3.5" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={loadExample}>
                    <Star className="size-3.5" /> 示例
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAll} disabled={!input && !output} className="text-red-500">
                    <Trash2 className="size-3.5" /> 清空
                  </Button>
                </div>
              </div>
              <div style={{ height: EDITOR_HEIGHT }}>
                <MonacoEditor
                  value={input}
                  onChange={setInput}
                  language={mode === "md2html" ? "markdown" : "html"}
                  height="100%"
                />
              </div>
            </div>

            {/* Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {mode === "md2html" ? "HTML 输出" : "Markdown 输出"}
                </Label>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" onClick={copyResult} disabled={!output}>
                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                    {copied ? "已复制" : "复制"}
                  </Button>
                </div>
              </div>
              <div style={{ height: EDITOR_HEIGHT }}>
                <MonacoEditor
                  value={output}
                  readOnly
                  language={mode === "md2html" ? "html" : "markdown"}
                  height="100%"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
