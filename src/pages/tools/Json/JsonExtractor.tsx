import { useState, useEffect, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { JSONPath } from "jsonpath-plus";
import {
  CheckOutlined,
  CopyOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  StarOutlined,
  FileTextOutlined,
  FilterOutlined,
  KeyOutlined,
  AppstoreOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Tabs,
  Input,
  Switch,
  Tag,
  Select,
  Divider,
  Typography,
  Checkbox,
  Space,
} from "antd";

import { useCopy } from "@/hooks/useCopy";

const { TextArea } = Input;
const { Text } = Typography;

type Mode = "path" | "field" | "keys";
type OutputFormat = "array" | "list";

const JsonExtractor = () => {
  const intl = useIntl();
  const copy = useCopy();

  const [mode, setMode] = useState<Mode>("path");
  const [inputJson, setInputJson] = useState("");
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [isValidJson, setIsValidJson] = useState(false);
  const [jsonError, setJsonError] = useState("");

  const [jsonPath, setJsonPath] = useState("$");

  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [preserveStructure, setPreserveStructure] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(false);

  const [keysMode, setKeysMode] = useState<"keys" | "values">("keys");
  const [includeNested, setIncludeNested] = useState(true);
  const [sortResults, setSortResults] = useState(true);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("array");

  const [extractedData, setExtractedData] = useState<any>(null);
  const [extractionError, setExtractionError] = useState("");

  const quickPaths = [
    { label: "$", desc: "Root" },
    { label: "$.*", desc: "All Props" },
    { label: "$[0]", desc: "First" },
    { label: "$[*]", desc: "All Items" },
    { label: "$[-1]", desc: "Last" },
    { label: "$..id", desc: "Recursive" },
  ];

  useEffect(() => {
    setJsonError("");
    setIsValidJson(false);
    setParsedJson(null);
    if (!inputJson.trim()) return;
    try {
      const parsed = JSON.parse(inputJson);
      setParsedJson(parsed);
      setIsValidJson(true);
      analyzeFields(parsed);
    } catch (err: any) {
      setJsonError(err.message);
    }
  }, [inputJson]);

  useEffect(() => {
    if (!isValidJson || !parsedJson) return;
    setExtractionError("");
    try {
      if (mode === "path" && jsonPath.trim()) {
        const results = JSONPath({ path: jsonPath, json: parsedJson, wrap: false });
        setExtractedData(results);
      } else if (mode === "field" && selectedFields.length > 0) {
        extractFields();
      } else if (mode === "keys") {
        extractKeysValues();
      }
    } catch (err: any) {
      setExtractionError(err.message);
      setExtractedData(null);
    }
  }, [mode, jsonPath, selectedFields, preserveStructure, removeEmpty, keysMode, includeNested, sortResults, outputFormat, parsedJson, isValidJson]);

  const analyzeFields = (data: any) => {
    const fields = new Set<string>();
    const traverse = (obj: any, prefix = "") => {
      if (Array.isArray(obj)) {
        obj.forEach(item => {
          if (typeof item === "object" && item !== null) traverse(item, prefix);
        });
      } else if (obj !== null && typeof obj === "object") {
        Object.keys(obj).forEach(key => {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          fields.add(fullKey);
          if (typeof obj[key] === "object" && obj[key] !== null) traverse(obj[key], fullKey);
        });
      }
    };
    traverse(data);
    setAvailableFields(Array.from(fields).sort());
  };

  const extractFields = () => {
    if (!parsedJson) return;
    const dataArray = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
    const result = dataArray.map((item: any) => {
      const extracted: any = {};
      selectedFields.forEach(field => {
        const getNestedValue = (obj: any, keys: string[]): any => {
          if (keys.length === 0) return obj;
          const [head, ...rest] = keys;
          if (obj === null || obj === undefined) return undefined;
          if (Array.isArray(obj)) {
            const results = obj.map(el => getNestedValue(el, keys)).filter(v => v !== undefined);
            return results.length > 0 ? results : undefined;
          }
          return getNestedValue(obj[head], rest);
        };
        const value = getNestedValue(item, field.split("."));
        if (removeEmpty && (value === null || value === undefined || value === "")) return;
        if (preserveStructure) {
          const keys = field.split(".");
          let current = extracted;
          for (let i = 0; i < keys.length - 1; i++) {
            current[keys[i]] = current[keys[i]] || {};
            current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = value;
        } else {
          extracted[field] = value;
        }
      });
      return extracted;
    });
    setExtractedData(Array.isArray(parsedJson) ? result : result[0]);
  };

  const extractKeysValues = () => {
    if (!parsedJson) return;
    if (keysMode === "keys") {
      const keys = new Set<string>();
      const traverse = (obj: any, path = "") => {
        if (Array.isArray(obj)) {
          obj.forEach(item => {
            if (typeof item === "object" && item !== null) traverse(item, path);
          });
        } else if (obj !== null && typeof obj === "object") {
          Object.keys(obj).forEach(key => {
            const fullPath = includeNested && path ? `${path}.${key}` : key;
            keys.add(fullPath);
            if (typeof obj[key] === "object" && obj[key] !== null) traverse(obj[key], fullPath);
          });
        }
      };
      traverse(parsedJson);
      let keysArray = Array.from(keys);
      if (sortResults) keysArray.sort();
      setExtractedData(outputFormat === "list" ? keysArray.join("\n") : keysArray);
    } else {
      const values: any[] = [];
      const traverse = (obj: any) => {
        if (Array.isArray(obj)) {
          obj.forEach(item => {
            if (typeof item === "object" && item !== null) traverse(item);
            else values.push(item);
          });
        } else if (obj !== null && typeof obj === "object") {
          Object.values(obj).forEach(value => {
            if (typeof value === "object" && value !== null) traverse(value);
            else values.push(value);
          });
        }
      };
      traverse(parsedJson);
      const uniqueValues = Array.from(new Set(values));
      if (sortResults) uniqueValues.sort();
      setExtractedData(outputFormat === "list" ? uniqueValues.join("\n") : uniqueValues);
    }
  };

  const formattedOutput = useMemo(() => {
    if (extractedData === null || extractedData === undefined) return "";
    if (typeof extractedData === "string") return extractedData;
    try {
      return JSON.stringify(extractedData, null, 2);
    } catch {
      return String(extractedData);
    }
  }, [extractedData]);

  const loadExample = () => {
    const example = [
      { id: 1, name: "John Doe", email: "john@example.com", address: { city: "New York", country: "USA" } },
      { id: 2, name: "Jane Smith", email: "jane@example.com", address: { city: "London", country: "UK" } },
      { id: 3, name: "Bob Johnson", email: "bob@example.com", address: { city: "Tokyo", country: "Japan" } },
    ];
    setInputJson(JSON.stringify(example, null, 2));
    setJsonPath("$[*].name");
  };

  const handleDownload = () => {
    if (!formattedOutput) return;
    const blob = new Blob([formattedOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `extracted_${mode}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const tabItems = [
    {
      key: "path",
      label: <span className="flex items-center gap-1.5"><AppstoreOutlined />Path</span>,
      children: (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">JSONPath Expression</label>
            <Input
              value={jsonPath}
              onChange={(e) => setJsonPath(e.target.value)}
              placeholder="$.store.book[*].author"
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-400">Quick Paths</label>
            <div className="flex flex-wrap gap-2">
              {quickPaths.map((qp) => (
                <Button key={qp.label} size="small" onClick={() => setJsonPath(qp.label)} className="font-mono text-xs">
                  {qp.label}<span className="ml-1.5 text-gray-400">· {qp.desc}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "field",
      label: <span className="flex items-center gap-1.5"><FilterOutlined />Fields</span>,
      children: (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Available Fields ({availableFields.length})</label>
              <Space size="small">
                <Button size="small" type="link" onClick={() => setSelectedFields([...availableFields])}>All</Button>
                <Button size="small" type="link" onClick={() => setSelectedFields([])}>None</Button>
              </Space>
            </div>
            <div className="h-48 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 p-3">
              {availableFields.length > 0 ? (
                <div className="space-y-2">
                  {availableFields.map((field) => (
                    <div key={field} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedFields.includes(field)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFields([...selectedFields, field]);
                          } else {
                            setSelectedFields(selectedFields.filter(f => f !== field));
                          }
                        }}
                      />
                      <span className="text-sm font-mono cursor-pointer flex-1">{field}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  No fields detected
                </div>
              )}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Text className="text-sm">Preserve Structure</Text>
              <Switch checked={preserveStructure} onChange={setPreserveStructure} size="small" />
            </div>
            <div className="flex items-center justify-between">
              <Text className="text-sm">Remove Empty Values</Text>
              <Switch checked={removeEmpty} onChange={setRemoveEmpty} size="small" />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "keys",
      label: <span className="flex items-center gap-1.5"><KeyOutlined />Keys</span>,
      children: (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Extract</label>
            <div className="grid grid-cols-2 gap-2">
              <Button type={keysMode === "keys" ? "primary" : "default"} onClick={() => setKeysMode("keys")} block>Keys</Button>
              <Button type={keysMode === "values" ? "primary" : "default"} onClick={() => setKeysMode("values")} block>Values</Button>
            </div>
          </div>
          <div className="space-y-3">
            {keysMode === "keys" && (
              <div className="flex items-center justify-between">
                <Text className="text-sm">Include Nested Paths</Text>
                <Switch checked={includeNested} onChange={setIncludeNested} size="small" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <Text className="text-sm">Sort Results</Text>
              <Switch checked={sortResults} onChange={setSortResults} size="small" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Output Format</label>
              <Select
                value={outputFormat}
                onChange={(v) => setOutputFormat(v as OutputFormat)}
                className="w-full"
                options={[
                  { value: "array", label: "Array" },
                  { value: "list", label: "List (Line-separated)" },
                ]}
              />
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="grid gap-6 lg:grid-cols-2 h-[calc(100vh-10rem)]">
        {/* Left: Input */}
        <Card
          className="rounded-2xl flex flex-col"
          styles={{ body: { display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", padding: "16px 24px 24px" } }}
        >
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center gap-2">
              <FileTextOutlined className="text-primary text-lg" />
              <span className="text-lg font-semibold">
                <FormattedMessage id="tools.jsonExtractor.inputSection.title" />
              </span>
            </div>
            <Space>
              <Button size="small" icon={<StarOutlined />} onClick={loadExample}>Example</Button>
              <Button size="small" onClick={() => { setInputJson(""); setExtractedData(null); }}>Clear</Button>
            </Space>
          </div>

          <div className="flex-1 flex flex-col min-h-0 space-y-2">
            <label className="text-sm font-medium">JSON Data</label>
            <TextArea
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              placeholder='{"name": "John", "age": 30}'
              className="font-mono text-sm resize-none"
              spellCheck={false}
              style={{ flex: 1, minHeight: 0 }}
            />
            {inputJson.trim() && (
              <div className="flex items-center gap-2">
                {isValidJson ? (
                  <Tag color="success" icon={<CheckOutlined />}>Valid JSON</Tag>
                ) : (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
                    <ExclamationCircleOutlined className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Invalid JSON</p>
                      <p className="text-xs mt-1 opacity-90">{jsonError}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <Divider className="my-3" />

          <div className="shrink-0">
            <Tabs activeKey={mode} onChange={(v) => setMode(v as Mode)} items={tabItems} size="small" />
          </div>
        </Card>

        {/* Right: Output */}
        <Card
          className="rounded-2xl flex flex-col"
          styles={{ body: { display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", padding: "16px 24px 24px" } }}
        >
          <div className="flex items-center justify-between mb-2 shrink-0">
            <span className="text-lg font-semibold">
              <FormattedMessage id="tools.jsonExtractor.outputSection.title" />
            </span>
            {extractedData && (
              <Space>
                <Button size="small" icon={<CopyOutlined />} onClick={() => copy(formattedOutput)}>Copy</Button>
                <Button size="small" icon={<DownloadOutlined />} onClick={handleDownload}>Download</Button>
              </Space>
            )}
          </div>
          {extractedData && (
            <div className="mb-3 shrink-0">
              <Text type="secondary" className="text-sm">
                {Array.isArray(extractedData) ? `${extractedData.length} items extracted` : "Object extracted"}
              </Text>
            </div>
          )}

          <div className="flex-1 min-h-0">
            {!isValidJson ? (
              <div className="flex flex-1 h-full flex-col items-center justify-center rounded-lg border-2 border-dashed text-gray-400">
                <FileTextOutlined style={{ fontSize: 48 }} className="mb-4 opacity-50" />
                <p className="text-sm">Waiting for valid JSON...</p>
              </div>
            ) : extractionError ? (
              <div className="flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400">
                <ExclamationCircleOutlined className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Extraction Error</p>
                  <p className="text-sm mt-1 opacity-90">{extractionError}</p>
                </div>
              </div>
            ) : !extractedData ? (
              <div className="flex flex-1 h-full flex-col items-center justify-center rounded-lg border-2 border-dashed text-gray-400">
                <FilterOutlined style={{ fontSize: 48 }} className="mb-4 opacity-50" />
                <p className="text-sm">Configure extraction settings</p>
              </div>
            ) : (
              <TextArea
                value={formattedOutput}
                readOnly
                className="font-mono text-sm resize-none h-full"
                style={{ flex: 1, minHeight: 0, height: "100%", backgroundColor: "var(--color-muted)" }}
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default JsonExtractor;
