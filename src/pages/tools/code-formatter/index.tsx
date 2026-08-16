import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Check,
    Code2,
    Copy,
    Download,
    Eraser,
    Loader2,
    Star,
    TriangleAlert,
} from "lucide-react";
import * as prettier from "prettier";
import parserBabel from "prettier/plugins/babel";
import parserEstree from "prettier/plugins/estree";
import parserGraphql from "prettier/plugins/graphql";
import parserHtml from "prettier/plugins/html";
import parserMarkdown from "prettier/plugins/markdown";
import parserPostcss from "prettier/plugins/postcss";
import parserTypescript from "prettier/plugins/typescript";
import parserYaml from "prettier/plugins/yaml";
import { useState } from "react";

type CodeLanguage =
    | "javascript" | "typescript" | "jsx" | "tsx"
    | "html" | "css" | "json" | "markdown" | "yaml" | "graphql" | "sql";

const LANGUAGES: Record<CodeLanguage, { name: string; parser: string; tabWidth: number }> = {
    javascript: { name: "JavaScript", parser: "babel", tabWidth: 2 },
    typescript: { name: "TypeScript", parser: "typescript", tabWidth: 2 },
    jsx: { name: "JSX", parser: "babel", tabWidth: 2 },
    tsx: { name: "TSX", parser: "typescript", tabWidth: 2 },
    html: { name: "HTML", parser: "html", tabWidth: 2 },
    css: { name: "CSS", parser: "css", tabWidth: 2 },
    json: { name: "JSON", parser: "json", tabWidth: 2 },
    markdown: { name: "Markdown", parser: "markdown", tabWidth: 2 },
    yaml: { name: "YAML", parser: "yaml", tabWidth: 2 },
    graphql: { name: "GraphQL", parser: "graphql", tabWidth: 2 },
    sql: { name: "SQL", parser: "sql", tabWidth: 2 },
};

const PRETTIER_PLUGINS = [
    parserBabel, parserEstree, parserHtml, parserPostcss,
    parserTypescript, parserMarkdown, parserYaml, parserGraphql,
];

const FORMAT_OPTIONS = {
    printWidth: 80, tabWidth: 2, useTabs: false,
    semi: true, singleQuote: false, trailingComma: "es5" as const,
    bracketSpacing: true, arrowParens: "always" as const, proseWrap: "preserve" as const,
};

const EXAMPLES: Record<CodeLanguage, string> = {
    javascript: `function add(a,b) {return a+b;}\nconst x={foo:"bar",baz:42,qux:true};\nconsole.log(add(1,2));`,
    typescript: `function greet(name: string): string {return "Hello, " + name;}\ninterface User {id: number; name: string; isActive: boolean;}\nconst user: User = {id: 1,name: "John",isActive: true};`,
    jsx: `function App() {return (<div className="container"><header><h1>Hello World</h1></header><main><p>Welcome to my app</p></main></div>);}`,
    tsx: `interface Props {name: string;}\nfunction Greeting({name}: Props) {return <h1>Hello, {name}!</h1>;}\nconst App = () => (<div><Greeting name="World" /><p>Welcome to TypeScript and React</p></div>);`,
    html: `<!DOCTYPE html><html><head><title>Document</title></head><body><div><h1>Hello World</h1><p>This is a paragraph</p></div></body></html>`,
    css: `.container { width: 100%; max-width: 1200px; margin: 0 auto; }\n.header { background-color: #f0f0f0; padding: 20px; }\n.button { display: inline-block; padding: 10px 15px; background: #4285f4; color: white; border-radius: 4px; }`,
    json: `{"name":"John","age":30,"isStudent":false,"courses":["Math","English","Science"],"address":{"street":"123 Main St","city":"Anytown","zip":"12345"}}`,
    markdown: `# Heading\n## Subheading\nThis is a paragraph with **bold** and *italic* text.\n- List item 1\n- List item 2\n> This is a blockquote.\n\`\`\`\ncode block\n\`\`\``,
    yaml: `server:\n  port: 8080\n  host: localhost\ndatabase:\n  url: jdbc:mysql://localhost:3306/mydb\n  username: root\n  password: secret`,
    graphql: `type Query {\n  user(id: ID!): User\n  users: [User!]!\n}\n\ntype User {\n  id: ID!\n  name: String!\n  email: String\n}`,
    sql: `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.status = 'active' AND o.created_at >= '2023-01-01' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 0 ORDER BY order_count DESC LIMIT 10;`,
};

const EXTENSIONS: Record<CodeLanguage, string> = {
    javascript: ".js", typescript: ".ts", jsx: ".jsx", tsx: ".tsx",
    html: ".html", css: ".css", json: ".json", markdown: ".md",
    yaml: ".yaml", graphql: ".graphql", sql: ".sql",
};

import MonacoEditor from "@/components/MonacoEditor"

export default function CodeFormatterPage() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [language, setLanguage] = useState<CodeLanguage>("javascript");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const formatCode = async () => {
        if (!input.trim()) { setOutput(""); setError(""); return; }
        setError("");
        if (language === "sql") {
            const formatted = input
                .replace(/\s+/g, " ").replace(/\(\s+/g, "(").replace(/\s+\)/g, ")")
                .replace(/\s*,\s*/g, ", ").replace(/\s*=\s*/g, " = ")
                .replace(/SELECT/gi, "SELECT\n  ").replace(/FROM/gi, "\nFROM\n  ")
                .replace(/WHERE/gi, "\nWHERE\n  ").replace(/GROUP BY/gi, "\nGROUP BY\n  ")
                .replace(/HAVING/gi, "\nHAVING\n  ").replace(/ORDER BY/gi, "\nORDER BY\n  ")
                .replace(/LIMIT/gi, "\nLIMIT ").replace(/JOIN/gi, "\nJOIN\n  ")
                .replace(/AND/gi, "\n  AND").replace(/OR/gi, "\n  OR")
                .replace(/\n\s*\n/g, "\n").trim();
            setOutput(formatted);
            return;
        }
        setLoading(true);
        try {
            const formatted = await prettier.format(input, {
                parser: LANGUAGES[language].parser,
                plugins: PRETTIER_PLUGINS,
                ...FORMAT_OPTIONS,
                tabWidth: LANGUAGES[language].tabWidth,
            });
            setOutput(formatted);
        } catch (e) {
            setError((e as Error)?.message || "格式化失败");
            setOutput("");
        } finally {
            setLoading(false);
        }
    };

    const handleExample = () => { setInput(EXAMPLES[language]); setOutput(""); setError(""); };
    const handleClear = () => { setInput(""); setOutput(""); setError(""); };

    const handleCopy = () => {
        if (!output) return;
        navigator.clipboard.writeText(output);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!output) return;
        const blob = new Blob([output], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `formatted${EXTENSIONS[language]}`;
        a.click(); URL.revokeObjectURL(url);
    };

    return (
        <>
            <div>
                <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

                    <div className="grid gap-4 lg:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between h-10">
                                <div className="flex items-center gap-2">
                                    <Label className="text-sm font-medium">输入</Label>
                                    <Select value={language} onValueChange={(v) => { setLanguage(v as CodeLanguage); setOutput(""); setError(""); }}>
                                        <SelectTrigger className="h-7 w-auto gap-1 border-none bg-transparent px-1.5 text-xs shadow-none hover:bg-accent">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(LANGUAGES).map(([key, { name }]) => (
                                                <SelectItem key={key} value={key}>{name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleExample}><Star className="size-3.5" /> 示例</Button>
                                    <Button variant="outline" size="sm" onClick={handleClear} disabled={!input}><Eraser className="size-3.5" /> 清空</Button>
                                    <Button size="sm" onClick={formatCode} disabled={!input.trim() || loading}>
                                        {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Code2 className="size-3.5" />} 格式化
                                    </Button>
                                </div>
                            </div>
                            <div className="h-[400px]">
                                <MonacoEditor value={input} onChange={setInput} language={language} height="100%" showLineNumbersToggle showWordWrapToggle />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between h-10">
                                <Label className="text-sm font-medium">格式化结果</Label>
                                <div className="flex gap-2">
                                    {output && (
                                        <>
                                            <Button variant="outline" size="sm" onClick={handleCopy}>
                                                {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} 复制
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={handleDownload}><Download className="size-3.5" /> 下载</Button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="h-[400px]">
                                {loading ? (
                                    <div className="flex h-full flex-col items-center justify-center rounded-lg border border-border bg-card text-sm text-muted-foreground">
                                        <Loader2 className="size-6 animate-spin mb-2" /> 正在格式化...
                                    </div>
                                ) : error ? (
                                    <div className="flex h-full flex-col items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                                        <TriangleAlert className="size-4 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium">格式化出错</p>
                                            <p className="text-xs mt-1 opacity-90 break-all">{error}</p>
                                        </div>
                                    </div>
                                ) : output ? (
                                    <MonacoEditor value={output} readOnly language={language} height="100%" showCopyButton showDownloadButton showWordWrapToggle onDownload={handleDownload} />
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center rounded-lg border border-border bg-card text-sm text-muted-foreground">
                                        <Code2 className="size-10 opacity-30 mb-3" /> 输入代码后点击格式化
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
