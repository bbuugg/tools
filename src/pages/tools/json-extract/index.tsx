/* eslint-disable @typescript-eslint/no-explicit-any -- JSON 动态遍历需要使用 any */
import { JSONPath } from "jsonpath-plus";
import { Checkbox } from "@/components/ui/checkbox";
import { Code2, Filter, KeyRound } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JsonToolLayout from "@/components/JsonToolLayout";

const EXTRACTOR_EXAMPLE = JSON.stringify(
  [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      address: { city: "New York", country: "USA" },
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      address: { city: "London", country: "UK" },
    },
    {
      id: 3,
      name: "Bob Johnson",
      email: "bob@example.com",
      address: { city: "Tokyo", country: "Japan" },
    },
  ],
  null,
  2,
);

const quickPaths = [
  { label: "$", desc: "Root" },
  { label: "$.*", desc: "All" },
  { label: "$[0]", desc: "First" },
  { label: "$[*]", desc: "All Items" },
  { label: "$[-1]", desc: "Last" },
  { label: "$..id", desc: "Recursive" },
];

export default function JsonExtractPage() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"path" | "field" | "keys">("path");
  const [jsonPath, setJsonPath] = useState("$");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [preserveStructure, setPreserveStructure] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(false);
  const [keysMode, setKeysMode] = useState<"keys" | "values">("keys");
  const [includeNested, setIncludeNested] = useState(true);
  const [sortResults, setSortResults] = useState(true);
  const [outputFormat, setOutputFormat] = useState<"array" | "list">("array");

  const availableFields = useMemo(() => {
    if (!input.trim()) return [];
    try {
      const p = JSON.parse(input);
      const fields = new Set<string>();
      const traverse = (obj: any, prefix = "") => {
        if (Array.isArray(obj))
          obj.forEach((item) => {
            if (typeof item === "object" && item) traverse(item, prefix);
          });
        else if (obj !== null && typeof obj === "object")
          Object.keys(obj).forEach((key) => {
            const fk = prefix ? `${prefix}.${key}` : key;
            fields.add(fk);
            if (typeof obj[key] === "object" && obj[key] !== null)
              traverse(obj[key], fk);
          });
      };
      traverse(p);
      return Array.from(fields).sort();
    } catch {
      return [];
    }
  }, [input]);

  const result = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      const parsed = JSON.parse(input);
      let extracted: any = null;
      if (mode === "path" && jsonPath.trim()) {
        extracted = JSONPath({ path: jsonPath, json: parsed, wrap: false });
      } else if (mode === "field" && selectedFields.length > 0) {
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        const res = arr.map((item: any) => {
          const ext: any = {};
          selectedFields.forEach((field) => {
            const getNested = (obj: any, keys: string[]): any => {
              if (!keys.length) return obj;
              const [h, ...r] = keys;
              if (obj == null) return undefined;
              if (Array.isArray(obj))
                return obj.map((e) => getNested(e, keys)).filter((v) => v !== undefined) ||
                  undefined;
              return getNested(obj[h], r);
            };
            const v = getNested(item, field.split("."));
            if (removeEmpty && (v === null || v === undefined || v === "")) return;
            if (preserveStructure) {
              const keys = field.split(".");
              let cur = ext;
              for (let i = 0; i < keys.length - 1; i++) {
                cur[keys[i]] = cur[keys[i]] || {};
                cur = cur[keys[i]];
              }
              cur[keys[keys.length - 1]] = v;
            } else ext[field] = v;
          });
          return ext;
        });
        extracted = Array.isArray(parsed) ? res : res[0];
      } else if (mode === "keys") {
        if (keysMode === "keys") {
          const keys = new Set<string>();
          const traverse = (obj: any, path = "") => {
            if (Array.isArray(obj))
              obj.forEach((item) => {
                if (typeof item === "object" && item) traverse(item, path);
              });
            else if (obj !== null && typeof obj === "object")
              Object.keys(obj).forEach((key) => {
                const fp = includeNested && path ? `${path}.${key}` : key;
                keys.add(fp);
                if (typeof obj[key] === "object" && obj[key] !== null)
                  traverse(obj[key], fp);
              });
          };
          traverse(parsed);
          const ka = Array.from(keys);
          if (sortResults) ka.sort();
          extracted = outputFormat === "list" ? ka.join("\n") : ka;
        } else {
          const values: any[] = [];
          const traverse = (obj: any) => {
            if (Array.isArray(obj))
              obj.forEach((item) => {
                if (typeof item === "object" && item) traverse(item);
                else values.push(item);
              });
            else if (obj !== null && typeof obj === "object")
              Object.values(obj).forEach((v) => {
                if (typeof v === "object" && v !== null) traverse(v);
                else values.push(v);
              });
          };
          traverse(parsed);
          const uv = Array.from(new Set(values));
          if (sortResults) uv.sort();
          extracted = outputFormat === "list" ? uv.join("\n") : uv;
        }
      }
      let out = "";
      if (extracted !== null && extracted !== undefined) {
        out =
          typeof extracted === "string"
            ? extracted
            : JSON.stringify(extracted, null, 2);
      }
      return { output: out, error: "" };
    } catch (e: any) {
      return { output: "", error: e.message };
    }
  }, [
    input,
    mode,
    jsonPath,
    selectedFields,
    preserveStructure,
    removeEmpty,
    keysMode,
    includeNested,
    sortResults,
    outputFormat,
  ]);

  const options = (
    <div className="p-5">
      <Tabs value={mode} onValueChange={(v) => setMode(v as "path" | "field" | "keys")}>
        <TabsList>
          <TabsTrigger value="path">
            <Code2 className="size-3.5" /> JSONPath
          </TabsTrigger>
          <TabsTrigger value="field">
            <Filter className="size-3.5" /> 字段提取
          </TabsTrigger>
          <TabsTrigger value="keys">
            <KeyRound className="size-3.5" /> 键值提取
          </TabsTrigger>
        </TabsList>

        <TabsContent value="path" className="mt-4 space-y-3">
          <div className="flex items-center gap-2">
            <Input
              value={jsonPath}
              onChange={(e) => setJsonPath(e.target.value)}
              placeholder="$.store.book[*].author"
              className="font-mono flex-1"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {quickPaths.map((qp) => (
              <Button
                key={qp.label}
                variant="outline"
                size="xs"
                className="font-mono"
                onClick={() => setJsonPath(qp.label)}
              >
                {qp.label}
                <span className="text-muted-foreground ml-1">· {qp.desc}</span>
              </Button>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="field" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">
              可用字段 ({availableFields.length})
            </Label>
            <div className="flex gap-1">
              <Button
                variant="link"
                size="xs"
                onClick={() => setSelectedFields([...availableFields])}
              >
                全选
              </Button>
              <Button variant="link" size="xs" onClick={() => setSelectedFields([])}>
                清空
              </Button>
            </div>
          </div>
          <div className="h-40 overflow-y-auto rounded-lg border border-border p-2 space-y-1">
            {availableFields.length > 0 ? (
              availableFields.map((field) => (
                <div key={field} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedFields.includes(field)}
                    onCheckedChange={(c) => {
                      if (c) setSelectedFields([...selectedFields, field]);
                      else
                        setSelectedFields(selectedFields.filter((f) => f !== field));
                    }}
                  />
                  <span className="text-xs font-mono cursor-pointer flex-1">
                    {field}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                暂无字段
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={preserveStructure}
                onCheckedChange={setPreserveStructure}
              />
              <Label
                className="text-xs cursor-pointer"
                onClick={() => setPreserveStructure(!preserveStructure)}
              >
                保持结构
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={removeEmpty} onCheckedChange={setRemoveEmpty} />
              <Label
                className="text-xs cursor-pointer"
                onClick={() => setRemoveEmpty(!removeEmpty)}
              >
                移除空值
              </Label>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="keys" className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 max-w-xs">
            <Button
              variant={keysMode === "keys" ? "default" : "outline"}
              size="sm"
              onClick={() => setKeysMode("keys")}
            >
              提取键
            </Button>
            <Button
              variant={keysMode === "values" ? "default" : "outline"}
              size="sm"
              onClick={() => setKeysMode("values")}
            >
              提取值
            </Button>
          </div>
          <div className="flex flex-wrap gap-4">
            {keysMode === "keys" && (
              <div className="flex items-center gap-2">
                <Switch checked={includeNested} onCheckedChange={setIncludeNested} />
                <Label
                  className="text-xs cursor-pointer"
                  onClick={() => setIncludeNested(!includeNested)}
                >
                  包含嵌套路径
                </Label>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Switch checked={sortResults} onCheckedChange={setSortResults} />
              <Label
                className="text-xs cursor-pointer"
                onClick={() => setSortResults(!sortResults)}
              >
                排序结果
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">输出格式</Label>
              <Select
                value={outputFormat}
                onValueChange={(v) => setOutputFormat(v as "array" | "list")}
              >
                <SelectTrigger className="w-40 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="array">数组</SelectItem>
                  <SelectItem value="list">列表 (换行分隔)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <JsonToolLayout
      input={input}
      onInputChange={setInput}
      output={result.output}
      error={result.error}
      options={options}
      onExample={() => {
        setInput(EXTRACTOR_EXAMPLE);
        setJsonPath("$[*].name");
      }}
      downloadName="extracted.json"
    />
  );
}
