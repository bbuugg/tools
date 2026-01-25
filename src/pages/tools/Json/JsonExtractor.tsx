import { useCopy } from "@/hooks/useCopy";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Input,
  Radio,
  Row,
  Segmented,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import { JSONPath } from "jsonpath-plus";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

// Types
type Mode = "path" | "field" | "keys";
type KeysMode = "keys" | "values";

interface FieldOptions {
  preserveStructure: boolean;
  removeEmpty: boolean;
  flattenNested: boolean;
}

interface KeysOptions {
  includeNested: boolean;
  sortKeys: boolean;
  includeArrayIndices: boolean;
  outputFormat: "array" | "list" | "tree";
}

const PathExtractor: React.FC = () => {
  const intl = useIntl();
  const copy = useCopy();

  // -------------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------------

  // Modes
  const [mode, setMode] = useState<Mode>("path");
  const [keysMode, setKeysMode] = useState<KeysMode>("keys");

  // Data
  const [inputJson, setInputJson] = useState("");
  const [parsedJson, setParsedJson] = useState<any>(null);
  const [isValidJson, setIsValidJson] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  // Errors
  const [jsonError, setJsonError] = useState("");
  const [extractionError, setExtractionError] = useState("");

  // Path Mode State
  const [jsonPath, setJsonPath] = useState("");

  // Field Mode State
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [fieldOptions, setFieldOptions] = useState<FieldOptions>({
    preserveStructure: true,
    removeEmpty: false,
    flattenNested: false,
  });

  // Keys Mode State
  const [keysOptions, setKeysOptions] = useState<KeysOptions>({
    includeNested: true,
    sortKeys: true,
    includeArrayIndices: false,
    outputFormat: "array",
  });

  // -------------------------------------------------------------------------
  // Constants / Configuration
  // -------------------------------------------------------------------------

  const quickPaths = [
    {
      key: "root",
      path: "$",
      label: intl.formatMessage({
        id: "tools.jsonExtractor.quickPaths.root",
        defaultMessage: "Root ($)",
      }),
    },
    {
      key: "allProperties",
      path: "$.*",
      label: intl.formatMessage({
        id: "tools.jsonExtractor.quickPaths.all",
        defaultMessage: "All Properties ($.*)",
      }),
    },
    {
      key: "firstArrayItem",
      path: "$[0]",
      label: intl.formatMessage({
        id: "tools.jsonExtractor.quickPaths.first",
        defaultMessage: "First Item ($[0])",
      }),
    },
    {
      key: "allArrayItems",
      path: "$[*]",
      label: intl.formatMessage({
        id: "tools.jsonExtractor.quickPaths.allItem",
        defaultMessage: "All Items ($[*])",
      }),
    },
    {
      key: "lastArrayItem",
      path: "$[-1]",
      label: intl.formatMessage({
        id: "tools.jsonExtractor.quickPaths.last",
        defaultMessage: "Last Item ($[-1])",
      }),
    },
    {
      key: "arraySlice",
      path: "$[0:3]",
      label: intl.formatMessage({
        id: "tools.jsonExtractor.quickPaths.slice",
        defaultMessage: "Slice ($[0:3])",
      }),
    },
    {
      key: "recursiveMatch",
      path: "$..id",
      label: intl.formatMessage({
        id: "tools.jsonExtractor.quickPaths.recursive",
        defaultMessage: "Recursive Id ($..id)",
      }),
    },
    {
      key: "filterExpression",
      path: "$[?(@.id < 10)]",
      label: intl.formatMessage({
        id: "tools.jsonExtractor.quickPaths.filter",
        defaultMessage: "Filter (id < 10)",
      }),
    },
  ];

  // -------------------------------------------------------------------------
  // Helpers - JSON & Analysis
  // -------------------------------------------------------------------------

  const validateJson = useCallback((jsonStr: string) => {
    setJsonError("");
    setIsValidJson(false);
    setParsedJson(null);
    setAvailableFields([]);
    // We don't clear selectedFields or path immediately to preserve user intent if they fix typo

    if (!jsonStr.trim()) return;

    try {
      const parsed = JSON.parse(jsonStr);
      setParsedJson(parsed);
      setIsValidJson(true);

      // Analyze fields for Field mode (always analyze to have ready)
      analyzeFields(parsed);
    } catch (err: any) {
      setJsonError(err.message);
    }
  }, []);

  // Re-run validation when input changes
  useEffect(() => {
    validateJson(inputJson);
  }, [inputJson, validateJson]);

  // Auto-extract when relevant dependencies change
  useEffect(() => {
    if (!isValidJson || !parsedJson) return;

    if (mode === "path") {
      if (jsonPath.trim()) extractPath();
    } else if (mode === "field") {
      if (selectedFields.length > 0) extractFields();
    } else if (mode === "keys") {
      extractKeysValues();
    }
  }, [
    mode,
    keysMode,
    parsedJson,
    isValidJson, // Main triggers
    jsonPath, // Path triggers
    selectedFields,
    fieldOptions, // Field triggers
    keysOptions, // Keys triggers
  ]);

  // -------------------------------------------------------------------------
  // Logic - Path Mode
  // -------------------------------------------------------------------------

  const extractPath = () => {
    setExtractionError("");
    setExtractedData(null);

    if (!parsedJson || !jsonPath.trim()) return;

    try {
      const results = JSONPath({
        path: jsonPath,
        json: parsedJson,
        wrap: false,
      });
      if (
        results === undefined ||
        (Array.isArray(results) && results.length === 0)
      ) {
        // jsonpath-plus might return undefined or empty array for no matches depending on config/version
        // Let's treat empty array as valid result but maybe user considers it "no match"
        // The Vue code treated undefined as "No Matches".
        // We'll set it as result.
        setExtractedData(results !== undefined ? results : []);
        if (
          results === undefined ||
          (Array.isArray(results) && results.length === 0)
        ) {
          // Optional: set info message 'No matches found'?
          // Accessing 'length' on undefined is bad, so check definition.
        }
      } else {
        setExtractedData(results);
      }
    } catch (err: any) {
      setExtractionError(err.message);
    }
  };

  const handleQuickPath = (path: string) => {
    setJsonPath(path);
    // Effect will trigger extraction
  };

  // -------------------------------------------------------------------------
  // Logic - Field Mode
  // -------------------------------------------------------------------------

  const getAllKeys = (obj: any, prefix = ""): Set<string> => {
    const keys = new Set<string>();
    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        if (typeof item === "object" && item !== null) {
          getAllKeys(item, prefix).forEach((k) => keys.add(k));
        }
      });
    } else if (obj !== null && typeof obj === "object") {
      Object.keys(obj).forEach((key) => {
        const fullKey = prefix ? `${prefix}.${key} ` : key;
        keys.add(fullKey);
        if (
          typeof obj[key] === "object" &&
          obj[key] !== null &&
          !Array.isArray(obj[key])
        ) {
          getAllKeys(obj[key], fullKey).forEach((k) => keys.add(k));
        }
      });
    }
    return keys;
  };

  const analyzeFields = (data: any) => {
    try {
      const allKeys = new Set<string>();
      if (Array.isArray(data)) {
        data.forEach((item) => {
          if (typeof item === "object" && item !== null) {
            getAllKeys(item).forEach((k) => allKeys.add(k));
          }
        });
      } else if (typeof data === "object" && data !== null) {
        getAllKeys(data).forEach((k) => allKeys.add(k));
      }
      setAvailableFields(Array.from(allKeys).sort());
    } catch (err) {
      console.error("Error analyzing fields", err);
    }
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  };

  const extractFields = () => {
    setExtractionError("");
    setExtractedData(null);

    if (!parsedJson) return;

    try {
      let dataArray: any[] = Array.isArray(parsedJson)
        ? parsedJson
        : [parsedJson];

      const result = dataArray.map((item: any) => {
        if (fieldOptions.preserveStructure) {
          const extracted: any = {};
          selectedFields.forEach((field) => {
            const value = getNestedValue(item, field);
            if (
              fieldOptions.removeEmpty &&
              (value === null || value === undefined || value === "")
            )
              return;

            if (fieldOptions.flattenNested) {
              extracted[field] = value;
            } else {
              const keys = field.split(".");
              let current = extracted;
              for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = current[keys[i]] || {};
                current = current[keys[i]];
              }
              current[keys[keys.length - 1]] = value;
            }
          });
          return extracted;
        } else {
          return selectedFields.map((field) => getNestedValue(item, field));
        }
      });

      if (Array.isArray(parsedJson)) {
        setExtractedData(result);
      } else {
        setExtractedData(result[0] || {});
      }

      // Update JsonPath to match selection (Visual cue)
      updateJsonPathFromFields();
    } catch (err: any) {
      setExtractionError(err.message);
    }
  };

  const updateJsonPathFromFields = () => {
    if (selectedFields.length === 0) {
      // Don't clear path if switching modes, maybe? Logic in Vue cleared it.
      // setJsonPath('');
    } else if (selectedFields.length === 1) {
      setJsonPath(`$[*].${selectedFields[0]} `);
    } else {
      const fields = selectedFields.map((f) => `$[*].${f} `).join(", ");
      setJsonPath(`[${fields}]`);
    }
  };

  // -------------------------------------------------------------------------
  // Logic - Keys Mode
  // -------------------------------------------------------------------------

  const getAllKeysForExtraction = (
    obj: any,
    path = "",
    keys: Set<string> = new Set()
  ): Set<string> => {
    if (Array.isArray(obj)) {
      obj.forEach((item, index) => {
        const arrayPath = keysOptions.includeArrayIndices
          ? `${path} [${index}]`
          : path;
        if (typeof item === "object" && item !== null) {
          getAllKeysForExtraction(item, arrayPath, keys);
        }
      });
    } else if (obj !== null && typeof obj === "object") {
      Object.keys(obj).forEach((key) => {
        const fullPath = path ? `${path}.${key} ` : key;
        if (keysOptions.includeNested) {
          keys.add(fullPath);
        } else {
          keys.add(key);
        }
        if (typeof obj[key] === "object" && obj[key] !== null) {
          getAllKeysForExtraction(obj[key], fullPath, keys);
        }
      });
    }
    return keys;
  };

  const getAllValuesForExtraction = (obj: any, values: any[] = []): any[] => {
    if (Array.isArray(obj)) {
      obj.forEach((item) => {
        if (typeof item === "object" && item !== null) {
          getAllValuesForExtraction(item, values);
        } else {
          values.push(item);
        }
      });
    } else if (obj !== null && typeof obj === "object") {
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === "object" && obj[key] !== null) {
          getAllValuesForExtraction(obj[key], values);
        } else {
          values.push(obj[key]);
        }
      });
    }
    return values;
  };

  const createTreeStructure = (keys: string[]): any => {
    const tree: any = {};
    keys.forEach((key) => {
      const parts = key.split(".");
      let current = tree;
      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = index === parts.length - 1 ? null : {};
        }
        if (current[part] !== null) {
          current = current[part];
        }
      });
    });
    return tree;
  };

  const extractKeysValues = () => {
    setExtractionError("");
    setExtractedData(null);
    if (!parsedJson) return;

    try {
      let output: any;

      if (keysMode === "keys") {
        const keysSet = getAllKeysForExtraction(parsedJson);
        let keys = Array.from(keysSet);
        if (keysOptions.sortKeys) keys.sort();

        switch (keysOptions.outputFormat) {
          case "list":
            output = keys.join("\n");
            break;
          case "tree":
            output = createTreeStructure(keys);
            break;
          case "array":
          default:
            output = keys;
            break;
        }
      } else {
        const values = getAllValuesForExtraction(parsedJson);
        // Unique values
        const uniqueValues = Array.from(new Set(values));
        if (keysOptions.sortKeys) uniqueValues.sort();

        switch (keysOptions.outputFormat) {
          case "list":
            output = uniqueValues.join("\n");
            break;
          case "array":
          default:
            output = uniqueValues;
            break;
          // Tree not supported for values really, fallback to array
        }
      }
      setExtractedData(output);
    } catch (err: any) {
      setExtractionError(err.message);
    }
  };

  // -------------------------------------------------------------------------
  // Output Formatting
  // -------------------------------------------------------------------------

  const formattedOutput = useMemo(() => {
    if (extractedData === null || extractedData === undefined) return "";
    if (typeof extractedData === "string") return extractedData; // For 'list' format
    try {
      return JSON.stringify(extractedData, null, 2);
    } catch {
      return String(extractedData);
    }
  }, [extractedData]);

  // -------------------------------------------------------------------------
  // Actions common
  // -------------------------------------------------------------------------

  const handleLoadExample = (type: "array" | "object") => {
    const exampleData =
      type === "array"
        ? [
            { id: 1, name: "John Doe", address: { city: "NY" }, tags: ["dev"] },
            {
              id: 2,
              name: "Jane Smith",
              address: { city: "SF" },
              tags: ["lead"],
            },
          ]
        : {
            id: 1,
            name: "John Doe",
            address: { city: "NY" },
            tags: ["dev"],
          };
    const str = JSON.stringify(exampleData, null, 2);
    setInputJson(str);
    if (type === "array") setJsonPath("$[*].name");
    else setJsonPath("$.name");
    // setMode('path');
  };

  const handleDownload = () => {
    if (!formattedOutput) return;
    const blob = new Blob([formattedOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `extracted_${mode}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <Title level={1} className="text-white mb-2">
          <FormattedMessage id="tools.jsonExtractor.name" />
        </Title>
        <Text className="text-slate-400 text-lg">
          <FormattedMessage id="tools.jsonExtractor.description" />
        </Text>
      </div>
      <Row gutter={[24, 24]}>
        {/* ------------------- LEFT COLUMN: INPUT ------------------- */}
        <Col xs={24} lg={12}>
          <Card
            className="border-none bg-white/5 h-full"
            title={
              <FormattedMessage
                id="tools.jsonExtractor.inputSection.title"
                defaultMessage="Input"
              />
            }
            extra={
              <Space>
                <Button
                  size="small"
                  onClick={() => handleLoadExample("array")}
                  className="border-none hover:text-white"
                >
                  <FormattedMessage
                    id="common.exampleArray"
                    defaultMessage="Array Ex."
                  />
                </Button>
                <Button
                  size="small"
                  onClick={() => handleLoadExample("object")}
                  className="border-none hover:text-white"
                >
                  <FormattedMessage
                    id="common.exampleObject"
                    defaultMessage="Object Ex."
                  />
                </Button>
                <Button
                  size="small"
                  onClick={() => {
                    setInputJson("");
                    setParsedJson(null);
                    setExtractedData(null);
                  }}
                  icon={<DeleteOutlined />}
                  className="border-none hover:text-white"
                >
                  <FormattedMessage id="common.clear" defaultMessage="Clear" />
                </Button>
              </Space>
            }
          >
            {/* JSON Input */}
            <div className="mb-4">
              <Text strong className="mb-1 block">
                <FormattedMessage
                  id="tools.jsonExtractor.jsonData"
                  defaultMessage="JSON Data"
                />
              </Text>
              <TextArea
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                placeholder={intl.formatMessage({
                  id: "tools.jsonExtractor.jsonPlaceholder",
                  defaultMessage: "Paste your JSON here...",
                })}
                className="font-mono text-sm border-slate-700/50 text-slate-100 placeholder-slate-500 rounded-lg"
                style={{ minHeight: "200px", resize: "vertical" }}
                spellCheck={false}
              />
              {/* Validation Status */}
              {inputJson.trim() && (
                <div className="mt-2">
                  {isValidJson ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      <FormattedMessage
                        id="tools.jsonExtractor.validJson"
                        defaultMessage="Valid JSON"
                      />
                    </Tag>
                  ) : (
                    <Alert
                      type="error"
                      showIcon
                      message={
                        <FormattedMessage
                          id="tools.jsonExtractor.invalidJson"
                          defaultMessage="Invalid JSON"
                        />
                      }
                      description={jsonError}
                      className="bg-red-500/10 border-red-500/30 text-red-200"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Mode Switcher */}
            <div className="mb-4">
              <Segmented<string>
                options={[
                  {
                    label: (
                      <FormattedMessage
                        id="tools.jsonExtractor.mode.path"
                        defaultMessage="Path"
                      />
                    ),
                    value: "path",
                  },
                  {
                    label: (
                      <FormattedMessage
                        id="tools.jsonExtractor.mode.field"
                        defaultMessage="Fields"
                      />
                    ),
                    value: "field",
                  },
                  {
                    label: (
                      <FormattedMessage
                        id="tools.jsonExtractor.mode.keys"
                        defaultMessage="Keys/Values"
                      />
                    ),
                    value: "keys",
                  },
                ]}
                onChange={(value) => setMode(value as Mode)}
              />
            </div>

            {/* ---------------- MODE SPECIFIC INPUTS ---------------- */}

            {/* PATH MODE */}
            {mode === "path" && (
              <div className="animate-fade-in">
                <Text strong className="mb-1 block">
                  <FormattedMessage
                    id="tools.jsonExtractor.jsonPathExpression"
                    defaultMessage="JSONPath Expression"
                  />
                </Text>
                <Input
                  value={jsonPath}
                  onChange={(e) => setJsonPath(e.target.value)}
                  placeholder="$.store.book[*].author"
                  className="border-slate-700/50 text-slate-100 placeholder-slate-500 rounded-lg mb-4 font-mono"
                  suffix={
                    jsonPath && (
                      <CloseCircleOutlined
                        className="text-slate-500 cursor-pointer hover:text-white"
                        onClick={() => setJsonPath("")}
                      />
                    )
                  }
                />

                <div className="mb-4">
                  <Text type="secondary" className="text-xs mb-2 block">
                    <FormattedMessage
                      id="tools.jsonExtractor.quickPaths"
                      defaultMessage="Quick Paths:"
                    />
                  </Text>
                  <div className="flex flex-wrap gap-2">
                    {quickPaths.map((qp) => (
                      <Button
                        key={qp.key}
                        size="small"
                        onClick={() => handleQuickPath(qp.path)}
                        className="border-slate-700 text-slate-400 hover:text-green-400 hover:border-green-400 text-xs font-mono"
                      >
                        {qp.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Collapse
                  ghost
                  className="border border-slate-700/30 rounded-lg"
                >
                  <Panel
                    header={
                      <FormattedMessage
                        id="tools.jsonExtractor.syntaxGuide"
                        defaultMessage="Syntax Guide"
                      />
                    }
                    key="1"
                  >
                    <div className="text-sm space-y-1">
                      <p>
                        <code className="text-green-700">$</code> : Root
                        object/element
                      </p>
                      <p>
                        <code className="text-green-700">@</code> : Current
                        object/element
                      </p>
                      <p>
                        <code className="text-green-700">. or []</code> : Child
                        operator
                      </p>
                      <p>
                        <code className="text-green-700">..</code> : Recursive
                        descent
                      </p>
                      <p>
                        <code className="text-green-700">*</code> : Wildcard
                      </p>
                      <p>
                        <code className="text-green-700">[start:end:step]</code>{" "}
                        : Array slice
                      </p>
                      <p>
                        <code className="text-green-700">[?(expr)]</code> :
                        Filter expression
                      </p>
                    </div>
                  </Panel>
                </Collapse>
              </div>
            )}

            {/* FIELD MODE */}
            {mode === "field" && (
              <div className="animate-fade-in">
                <div className="flex justify-between items-center mb-2">
                  <Text strong className="text-slate-300">
                    <FormattedMessage
                      id="tools.jsonExtractor.availableFields"
                      defaultMessage="Available Fields"
                    />
                  </Text>
                  <Space size="small">
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        setSelectedFields([...availableFields]);
                      }}
                      className="text-green-400 p-0"
                    >
                      <FormattedMessage id="common.all" defaultMessage="All" />
                    </Button>
                    <Button
                      type="link"
                      size="small"
                      onClick={() => {
                        setSelectedFields([]);
                      }}
                      className="text-slate-400 p-0"
                    >
                      <FormattedMessage
                        id="common.none"
                        defaultMessage="None"
                      />
                    </Button>
                  </Space>
                </div>
                <div className="max-h-48 overflow-y-auto border border-slate-700/30 rounded-lg p-3 mb-4">
                  {availableFields.length > 0 ? (
                    <Checkbox.Group
                      className="w-full"
                      value={selectedFields}
                      onChange={(checked) =>
                        setSelectedFields(checked as string[])
                      }
                    >
                      <Row gutter={[8, 8]}>
                        {availableFields.map((f) => (
                          <Col span={12} key={f}>
                            <Checkbox
                              value={f}
                              className="text-xs w-full truncate"
                            >
                              <span title={f}>{f}</span>
                            </Checkbox>
                          </Col>
                        ))}
                      </Row>
                    </Checkbox.Group>
                  ) : (
                    <div className="text-slate-500 text-center py-4">
                      <FormattedMessage
                        id="tools.jsonExtractor.noFieldsDetected"
                        defaultMessage="No fields detected"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Checkbox
                    checked={fieldOptions.preserveStructure}
                    onChange={(e) =>
                      setFieldOptions({
                        ...fieldOptions,
                        preserveStructure: e.target.checked,
                      })
                    }
                    className="text-slate-300"
                  >
                    <FormattedMessage
                      id="tools.jsonExtractor.options.preserveStructure"
                      defaultMessage="Preserve Structure"
                    />
                  </Checkbox>
                  <Checkbox
                    checked={fieldOptions.removeEmpty}
                    onChange={(e) =>
                      setFieldOptions({
                        ...fieldOptions,
                        removeEmpty: e.target.checked,
                      })
                    }
                    className="text-slate-300"
                  >
                    <FormattedMessage
                      id="tools.jsonExtractor.options.removeEmpty"
                      defaultMessage="Remove Empty"
                    />
                  </Checkbox>
                  <Checkbox
                    checked={fieldOptions.flattenNested}
                    onChange={(e) =>
                      setFieldOptions({
                        ...fieldOptions,
                        flattenNested: e.target.checked,
                      })
                    }
                    className="text-slate-300"
                  >
                    <FormattedMessage
                      id="tools.jsonExtractor.options.flattenNested"
                      defaultMessage="Flatten Nested"
                    />
                  </Checkbox>
                </div>
              </div>
            )}

            {/* KEYS MODE */}
            {mode === "keys" && (
              <Space orientation="vertical" className="animate-fade-in w-full">
                <Radio.Group
                  size="small"
                  value={keysMode}
                  onChange={(e) => setKeysMode(e.target.value)}
                  className="mb-4 w-full"
                  buttonStyle="solid"
                >
                  <Radio.Button value="keys" className="w-1/2 text-center">
                    <FormattedMessage
                      id="tools.jsonExtractor.keysMode.keys"
                      defaultMessage="Keys"
                    />
                  </Radio.Button>
                  <Radio.Button value="values" className="w-1/2 text-center">
                    <FormattedMessage
                      id="tools.jsonExtractor.keysMode.values"
                      defaultMessage="Values"
                    />
                  </Radio.Button>
                </Radio.Group>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex flex-col gap-2">
                    {keysMode === "keys" && (
                      <>
                        <Checkbox
                          checked={keysOptions.includeNested}
                          onChange={(e) =>
                            setKeysOptions({
                              ...keysOptions,
                              includeNested: e.target.checked,
                            })
                          }
                          className="text-slate-300"
                        >
                          <FormattedMessage
                            id="tools.jsonExtractor.options.includeNested"
                            defaultMessage="Include Nested"
                          />
                        </Checkbox>
                        <Checkbox
                          checked={keysOptions.includeArrayIndices}
                          onChange={(e) =>
                            setKeysOptions({
                              ...keysOptions,
                              includeArrayIndices: e.target.checked,
                            })
                          }
                          className="text-slate-300"
                        >
                          <FormattedMessage
                            id="tools.jsonExtractor.options.includeArrayIndices"
                            defaultMessage="Include Indices"
                          />
                        </Checkbox>
                      </>
                    )}
                    <Checkbox
                      checked={keysOptions.sortKeys}
                      onChange={(e) =>
                        setKeysOptions({
                          ...keysOptions,
                          sortKeys: e.target.checked,
                        })
                      }
                      className="text-slate-300"
                    >
                      <FormattedMessage
                        id="tools.jsonExtractor.options.sortResults"
                        defaultMessage="Sort Results"
                      />
                    </Checkbox>
                  </div>
                  <div>
                    <Text className="text-xs mb-1 block">
                      <FormattedMessage
                        id="tools.jsonExtractor.outputFormat"
                        defaultMessage="Output Format"
                      />
                    </Text>
                    <Select
                      value={keysOptions.outputFormat}
                      onChange={(val) =>
                        setKeysOptions({ ...keysOptions, outputFormat: val })
                      }
                      className="w-full"
                      popupClassName=""
                    >
                      <Option value="array">
                        <FormattedMessage
                          id="tools.jsonExtractor.outputFormat.array"
                          defaultMessage="Array"
                        />
                      </Option>
                      <Option value="list">
                        <FormattedMessage
                          id="tools.jsonExtractor.outputFormat.list"
                          defaultMessage="List"
                        />
                      </Option>
                      {keysMode === "keys" && (
                        <Option value="tree">
                          <FormattedMessage
                            id="tools.jsonExtractor.outputFormat.tree"
                            defaultMessage="Tree"
                          />
                        </Option>
                      )}
                    </Select>
                  </div>
                </div>
              </Space>
            )}
          </Card>
        </Col>

        {/* ------------------- RIGHT COLUMN: OUTPUT ------------------- */}
        <Col xs={24} lg={12}>
          <Card
            className="border-none bg-white/5 h-full"
            title={
              <FormattedMessage
                id="tools.jsonExtractor.outputSection.title"
                defaultMessage="Results"
              />
            }
            extra={
              <Space>
                {extractedData && (
                  <>
                    <Button
                      size="small"
                      onClick={() => copy(formattedOutput)}
                      icon={<CopyOutlined />}
                      type="dashed"
                    >
                      <FormattedMessage
                        id="common.copy"
                        defaultMessage="Copy"
                      />
                    </Button>
                    <Button
                      size="small"
                      onClick={handleDownload}
                      icon={<DownloadOutlined />}
                      type="dashed"
                    >
                      <FormattedMessage
                        id="common.download"
                        defaultMessage="Download"
                      />
                    </Button>
                  </>
                )}
              </Space>
            }
          >
            {!isValidJson ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700/30 rounded-xl">
                <div className="text-4xl mb-4">⌨️</div>
                <p>
                  <FormattedMessage
                    id="tools.jsonExtractor.waitingInput"
                    defaultMessage="Waiting for valid JSON..."
                  />
                </p>
              </div>
            ) : extractionError ? (
              <Alert
                title={
                  <FormattedMessage
                    id="tools.jsonExtractor.extractionError"
                    defaultMessage="Extraction Error"
                  />
                }
                description={extractionError}
                type="error"
                showIcon
                className="bg-red-500/10 border-red-500/30 text-red-200"
              />
            ) : !extractedData ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-700/30 rounded-xl">
                <div className="text-4xl mb-4">🎯</div>
                <p>
                  <FormattedMessage
                    id="tools.jsonExtractor.noResults"
                    defaultMessage="No results yet"
                  />
                </p>
              </div>
            ) : (
              <div className="animate-fade-in relative">
                <div className="absolute top-2 right-2 z-10">
                  <Tag color="green">
                    {Array.isArray(extractedData)
                      ? `${extractedData.length} items`
                      : "Object"}
                  </Tag>
                </div>
                <TextArea
                  value={formattedOutput}
                  readOnly
                  className="font-mono text-sm border-slate-700 text-green-400 rounded-lg"
                  style={{
                    height: "calc(100vh - 400px)",
                    minHeight: "400px",
                    resize: "none",
                  }}
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PathExtractor;
