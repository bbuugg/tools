import {
  CheckOutlined,
  ClearOutlined,
  CopyOutlined,
  DownloadOutlined,
  InfoCircleOutlined,
  LoadingOutlined,
  ReloadOutlined,
  SettingOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Collapse,
  Input,
  Row,
  Select,
  Space,
  Tooltip,
  Typography,
  type InputRef,
} from "antd";
import { useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

const { Title, Text, Paragraph } = Typography;

// 格式转换函数
function jsonToXml(
  jsonString: string,
  options?: { rootName?: string }
): string {
  try {
    const jsonObj = JSON.parse(jsonString);
    const rootName = options?.rootName || "root";

    // XML头部
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';

    // 递归转换JSON对象为XML
    const jsonObjToXml = (
      obj: unknown,
      nodeName: string,
      indent = ""
    ): string => {
      if (obj === null || obj === undefined) {
        return `${indent}<${nodeName}></${nodeName}>\n`;
      }

      if (typeof obj !== "object") {
        // 处理基本类型
        return `${indent}<${nodeName}>${escapeXml(
          String(obj)
        )}</${nodeName}>\n`;
      }

      if (Array.isArray(obj)) {
        // 处理数组：每个元素都使用相同的节点名
        return obj.map((item) => jsonObjToXml(item, nodeName, indent)).join("");
      }

      // 处理对象
      let result = `${indent}<${nodeName}>\n`;

      // 遍历对象属性
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = (obj as Record<string, unknown>)[key];
          result += jsonObjToXml(value, key, indent + "  ");
        }
      }

      result += `${indent}</${nodeName}>\n`;
      return result;
    };

    // 转换JSON对象并添加到XML字符串
    xml += jsonObjToXml(jsonObj, rootName);

    return xml;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`JSON转XML失败: ${error.message}`);
    }
    throw new Error("JSON转XML失败");
  }
}

function xmlToJson(xmlString: string): string {
  try {
    // 创建DOM解析器
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    // 检查解析错误
    const parseError = xmlDoc.getElementsByTagName("parsererror");
    if (parseError.length > 0) {
      throw new Error("XML解析错误：无效的XML格式");
    }

    // 递归处理XML节点
    const processNode = (node: Element): unknown => {
      // 如果节点没有子元素，返回节点的文本内容
      if (
        node.childNodes.length === 0 ||
        (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3)
      ) {
        const text = node.textContent || "";

        // 尝试转换为数字或布尔值
        if (text === "true") return true;
        if (text === "false") return false;
        if (!isNaN(Number(text)) && text.trim() !== "") return Number(text);
        return text;
      }

      // 处理有子元素的节点
      const result: Record<string, unknown> = {};
      const childElements = Array.from(node.children);

      // 对每个子元素类型进行分组，检测数组
      const elementCounts: Record<string, Element[]> = {};

      childElements.forEach((child) => {
        if (!elementCounts[child.nodeName]) {
          elementCounts[child.nodeName] = [];
        }
        elementCounts[child.nodeName].push(child);
      });

      // 处理每种子元素
      for (const [nodeName, elements] of Object.entries(elementCounts)) {
        if (elements.length === 1) {
          // 单个元素
          result[nodeName] = processNode(elements[0]);
        } else {
          // 多个同名元素，作为数组处理
          result[nodeName] = elements.map(processNode);
        }
      }

      return result;
    };

    // 处理XML文档的根元素
    const root = xmlDoc.documentElement;
    const jsonObj = processNode(root);

    // 将对象转换为格式化的JSON字符串
    return JSON.stringify(jsonObj, null, 2);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`XML转JSON失败: ${error.message}`);
    }
    throw new Error("XML转JSON失败");
  }
}

function jsonToCsv(
  jsonString: string,
  options?: { delimiter?: string; header?: boolean }
): string {
  try {
    const jsonObj = JSON.parse(jsonString);
    const delimiter = options?.delimiter || ",";
    const includeHeader = options?.header !== false;

    // 处理数组数据
    if (Array.isArray(jsonObj)) {
      if (jsonObj.length === 0) {
        return "";
      }

      // 提取所有可能的字段
      const fields = new Set<string>();
      jsonObj.forEach((item) => {
        if (typeof item === "object" && item !== null) {
          Object.keys(item).forEach((key) => fields.add(key));
        }
      });

      const fieldNames = Array.from(fields);

      // 生成CSV头
      let csv = includeHeader
        ? fieldNames.map(escapeCSV).join(delimiter) + "\n"
        : "";

      // 生成CSV数据行
      jsonObj.forEach((item) => {
        const row = fieldNames.map((field) => {
          const value = (item as Record<string, unknown>)[field];

          // 处理嵌套对象或数组
          if (value !== null && typeof value === "object") {
            return escapeCSV(JSON.stringify(value));
          }

          return value !== undefined ? escapeCSV(String(value)) : "";
        });

        csv += row.join(delimiter) + "\n";
      });

      return csv;
    } else if (typeof jsonObj === "object" && jsonObj !== null) {
      // 如果是单个对象，将其转换为单行CSV
      const fields = Object.keys(jsonObj);
      let csv = includeHeader
        ? fields.map(escapeCSV).join(delimiter) + "\n"
        : "";

      // 生成数据行
      const row = fields.map((field) => {
        const value = (jsonObj as Record<string, unknown>)[field];

        // 处理嵌套对象或数组
        if (value !== null && typeof value === "object") {
          return escapeCSV(JSON.stringify(value));
        }

        return value !== undefined ? escapeCSV(String(value)) : "";
      });

      csv += row.join(delimiter) + "\n";
      return csv;
    } else {
      throw new Error("无法转换为CSV：JSON必须是对象或数组");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`JSON转CSV失败: ${error.message}`);
    }
    throw new Error("JSON转CSV失败");
  }
}

function csvToJson(
  csvString: string,
  options?: { delimiter?: string; header?: boolean }
): string {
  try {
    const delimiter = options?.delimiter || ",";
    const hasHeader = options?.header !== false;

    // 分割CSV行
    const lines = csvString.trim().split(/\r?\n/);
    if (lines.length === 0) {
      return "[]";
    }

    // 解析CSV行，处理引号内的分隔符
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          // 引号处理：检查是否为转义的引号
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++; // 跳过下一个引号
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          // 找到分隔符且不在引号内
          result.push(current);
          current = "";
        } else {
          current += char;
        }
      }

      // 添加最后一个字段
      result.push(current);
      return result;
    };

    let headers: string[];
    let startIndex: number;

    if (hasHeader) {
      // 使用第一行作为字段名
      headers = parseCSVLine(lines[0]);
      startIndex = 1;
    } else {
      // 自动生成字段名
      const firstLine = parseCSVLine(lines[0]);
      headers = firstLine.map((_, index) => `field${index}`);
      startIndex = 0;
    }

    // 处理CSV数据行
    const result: Record<string, unknown>[] = [];
    for (let i = startIndex; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // 跳过空行

      const values = parseCSVLine(lines[i]);
      const obj: Record<string, unknown> = {};

      // 将每个值与相应的字段名匹配
      for (let j = 0; j < headers.length; j++) {
        if (j < values.length) {
          const value = values[j].trim();

          // 尝试转换为合适的数据类型
          if (value === "true") obj[headers[j]] = true;
          else if (value === "false") obj[headers[j]] = false;
          else if (!isNaN(Number(value)) && value !== "")
            obj[headers[j]] = Number(value);
          else obj[headers[j]] = value;
        } else {
          obj[headers[j]] = "";
        }
      }

      result.push(obj);
    }

    return JSON.stringify(result, null, 2);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`CSV转JSON失败: ${error.message}`);
    }
    throw new Error("CSV转JSON失败");
  }
}

function jsonToYaml(jsonString: string): string {
  try {
    const jsonObj = JSON.parse(jsonString);

    // 递归转换JSON对象为YAML
    const convertToYaml = (obj: unknown, indent = 0): string => {
      if (obj === null || obj === undefined) {
        return "null";
      }

      const spaces = " ".repeat(indent);

      if (typeof obj !== "object") {
        // 处理基本类型
        if (typeof obj === "string") {
          // 使用转义函数
          return escapeYaml(obj);
        }
        return String(obj);
      }

      if (Array.isArray(obj)) {
        // 如果是空数组
        if (obj.length === 0) {
          return "[]";
        }

        // 处理数组：每个元素前加-号
        return obj
          .map((item) => {
            if (typeof item === "object" && item !== null) {
              return `${spaces}- ${convertToYaml(
                item,
                indent + 2
              ).trimStart()}`;
            } else {
              return `${spaces}- ${convertToYaml(item, indent)}`;
            }
          })
          .join("\n");
      }

      // 如果是空对象
      if (Object.keys(obj as Record<string, unknown>).length === 0) {
        return "{}";
      }

      // 处理对象
      return Object.entries(obj as Record<string, unknown>)
        .map(([key, value]) => {
          const yamlKey = /^[a-zA-Z0-9_]+$/.test(key) ? key : `'${key}'`;

          if (typeof value === "object" && value !== null) {
            return `${spaces}${yamlKey}:\n${convertToYaml(value, indent + 2)}`;
          } else {
            return `${spaces}${yamlKey}: ${convertToYaml(value, indent)}`;
          }
        })
        .join("\n");
    };

    return convertToYaml(jsonObj);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`JSON转YAML失败: ${error.message}`);
    }
    throw new Error("JSON转YAML失败");
  }
}

function yamlToJson(yamlString: string): string {
  try {
    // YAML解析是复杂的，通常使用库，但这里我们简化实现
    // 主要解析简单的YAML格式：缩进表示层级，冒号分隔键值对

    const lines = yamlString.split(/\r?\n/);

    // 处理缩进
    const getIndent = (line: string): number => {
      let i = 0;
      while (i < line.length && line[i] === " ") i++;
      return i;
    };

    // 递归解析YAML
    const parseYaml = (
      currentIndex: number,
      minIndent: number
    ): [unknown, number] => {
      let result: unknown = null;
      let i = currentIndex;

      // 确定当前行的缩进级别
      const currentIndent = getIndent(lines[i]);
      let isArray = lines[i].trimStart().startsWith("-");

      if (isArray) {
        // 解析数组
        result = [];

        while (i < lines.length) {
          const line = lines[i];
          if (!line.trim()) {
            i++;
            continue; // 跳过空行
          }

          const lineIndent = getIndent(line);
          if (lineIndent < minIndent) break; // 缩进减少，退出当前层级

          if (line.trimStart().startsWith("-")) {
            // 数组项
            const itemText = line.trim().substring(1).trimStart();
            if (itemText.includes(":")) {
              // 数组项是对象
              const [key, valuePart] = splitKeyValue(itemText);
              const arrayItem: Record<string, unknown> = {};

              if (valuePart.trim()) {
                // 行内值
                arrayItem[key] = parseScalar(valuePart.trim());
              } else {
                // 子对象，下一行应该有更多缩进
                if (
                  i + 1 < lines.length &&
                  getIndent(lines[i + 1]) > lineIndent
                ) {
                  const [nestedObj, nextIndex] = parseYaml(
                    i + 1,
                    lineIndent + 2
                  );
                  arrayItem[key] = nestedObj;
                  i = nextIndex - 1; // 回退一行，下次循环会递增
                } else {
                  arrayItem[key] = null; // 键值为空
                }
              }
              (result as unknown[]).push(arrayItem);
            } else if (itemText) {
              // 简单值
              (result as unknown[]).push(parseScalar(itemText));
            } else {
              // 下一行有更多缩进
              if (
                i + 1 < lines.length &&
                getIndent(lines[i + 1]) > lineIndent
              ) {
                const [nestedObj, nextIndex] = parseYaml(i + 1, lineIndent + 2);
                (result as unknown[]).push(nestedObj);
                i = nextIndex - 1;
              } else {
                (result as unknown[]).push(null);
              }
            }
          } else if (lineIndent === currentIndent) {
            // 同一缩进级别但不是数组项，说明数组结束
            break;
          }

          i++;
        }
      } else {
        // 解析对象
        result = {};

        while (i < lines.length) {
          const line = lines[i];
          if (!line.trim()) {
            i++;
            continue; // 跳过空行
          }

          const lineIndent = getIndent(line);
          if (lineIndent < minIndent) break; // 缩进减少，退出当前层级

          if (lineIndent === minIndent) {
            if (line.trimStart().startsWith("-")) {
              // 数组开始，与对象同级
              isArray = true;
              break;
            }

            if (line.includes(":")) {
              // 键值对
              const [key, valuePart] = splitKeyValue(line.trim());

              if (valuePart.trim()) {
                // 行内值
                (result as Record<string, unknown>)[key] = parseScalar(
                  valuePart.trim()
                );
              } else {
                // 子对象或数组，下一行应该有更多缩进
                if (
                  i + 1 < lines.length &&
                  getIndent(lines[i + 1]) > lineIndent
                ) {
                  const [nestedObj, nextIndex] = parseYaml(
                    i + 1,
                    lineIndent + 2
                  );
                  (result as Record<string, unknown>)[key] = nestedObj;
                  i = nextIndex - 1; // 回退一行，下次循环会递增
                } else {
                  (result as Record<string, unknown>)[key] = null; // 键值为空
                }
              }
            }
          } else if (lineIndent > minIndent) {
            // 缩进增加，属于上一个键的子内容
            continue;
          }

          i++;
        }
      }

      return [result, i];
    };

    // 辅助函数：分割键值对
    const splitKeyValue = (line: string): [string, string] => {
      const colonIndex = line.indexOf(":");
      if (colonIndex === -1) return [line, ""];

      let key = line.substring(0, colonIndex).trim();
      // 如果键名有引号，去掉引号
      if (
        (key.startsWith("'") && key.endsWith("'")) ||
        (key.startsWith('"') && key.endsWith('"'))
      ) {
        key = key.substring(1, key.length - 1);
      }

      const value = line.substring(colonIndex + 1);
      return [key, value];
    };

    // 辅助函数：解析标量值
    const parseScalar = (value: string): unknown => {
      // 去掉引号
      if (
        (value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"'))
      ) {
        return value.substring(1, value.length - 1);
      }

      // 解析为特定类型
      if (value === "null" || value === "~" || value === "") return null;
      if (value === "true" || value === "yes" || value === "on") return true;
      if (value === "false" || value === "no" || value === "off") return false;
      if (!isNaN(Number(value))) return Number(value);

      return value;
    };

    // 开始解析
    const [result] = parseYaml(0, 0);
    return JSON.stringify(result, null, 2);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`YAML转JSON失败: ${error.message}`);
    }
    throw new Error("YAML转JSON失败");
  }
}

// 辅助函数：转义XML特殊字符
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// 辅助函数：转义CSV字段
function escapeCSV(value: string): string {
  // 如果字段包含逗号、双引号或换行符，需要用双引号包围并处理
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    // 双引号内的双引号需要再次转义
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// 辅助函数：转义YAML特殊字符
function escapeYaml(value: string): string {
  // 如果值包含特殊字符，需要用引号包围
  if (
    /^[-:?!,[\\]{}#&*!|>'"%@`]|^[0-9]/.test(value) ||
    /^(true|false|null|y|n|yes|no|on|off)$/i.test(value) ||
    value.includes("\n") ||
    value.includes(" ")
  ) {
    // 对特殊字符进行转义
    return `'${value.replace(/'/g, "''")}'`;
  }
  return value;
}

export default function JsonConverter() {
  const intl = useIntl();

  // 格式类型选项
  const formatTypes = [
    {
      id: "xml",
      name: intl.formatMessage({
        id: "tools.jsonConverter.format_types.xml.name",
      }),
      description: intl.formatMessage({
        id: "tools.jsonConverter.format_types.xml.description",
      }),
    },
    {
      id: "csv",
      name: intl.formatMessage({
        id: "tools.jsonConverter.format_types.csv.name",
      }),
      description: intl.formatMessage({
        id: "tools.jsonConverter.format_types.csv.description",
      }),
    },
    {
      id: "yaml",
      name: intl.formatMessage({
        id: "tools.jsonConverter.format_types.yaml.name",
      }),
      description: intl.formatMessage({
        id: "tools.jsonConverter.format_types.yaml.description",
      }),
    },
  ];

  // 状态管理
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [formatType, setFormatType] = useState("xml");
  const [direction, setDirection] = useState<
    "json_to_format" | "format_to_json"
  >("json_to_format");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [advancedOptions, setAdvancedOptions] = useState(false);
  const [csvDelimiter, setCsvDelimiter] = useState(",");
  const [csvHeader, setCsvHeader] = useState(true);
  const [xmlRootName, setXmlRootName] = useState("root");

  // 引用
  const inputRef = useRef<InputRef>(null);
  const outputRef = useRef<InputRef>(null);

  // 执行转换
  const performConversion = () => {
    if (!inputText.trim()) {
      setOutputText("");
      setError("");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      let result = "";
      const options = {
        delimiter: csvDelimiter,
        header: csvHeader,
        rootName: xmlRootName,
      };

      if (direction === "json_to_format") {
        // 首先验证输入是有效的JSON
        try {
          JSON.parse(inputText);
        } catch {
          throw new Error(
            intl.formatMessage({
              id: "tools.jsonConverter.errors.invalid_json",
            })
          );
        }

        // JSON 转换为其他格式
        if (formatType === "xml") {
          result = jsonToXml(inputText, options);
        } else if (formatType === "csv") {
          result = jsonToCsv(inputText, options);
        } else if (formatType === "yaml") {
          result = jsonToYaml(inputText);
        }
      } else {
        // 其他格式转换为JSON
        if (formatType === "xml") {
          result = xmlToJson(inputText);
        } else if (formatType === "csv") {
          result = csvToJson(inputText, options);
        } else if (formatType === "yaml") {
          result = yamlToJson(inputText);
        }
      }

      setOutputText(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          intl.formatMessage({
            id: "tools.jsonConverter.errors.conversion_error",
          })
        );
      }
      setOutputText("");
    } finally {
      setIsProcessing(false);
    }
  };

  // 复制输出内容到剪贴板
  const copyToClipboard = () => {
    if (!outputText) return;

    navigator.clipboard
      .writeText(outputText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error(
          intl.formatMessage({ id: "tools.jsonConverter.errors.copy_failed" }),
          err
        );
        setError(
          intl.formatMessage({
            id: "tools.jsonConverter.errors.clipboard_error",
          })
        );
      });
  };

  // 下载输出结果
  const downloadOutput = () => {
    if (!outputText) return;

    let extension = "txt";
    let mimeType = "text/plain";

    if (direction === "json_to_format") {
      if (formatType === "xml") {
        extension = "xml";
        mimeType = "application/xml";
      } else if (formatType === "csv") {
        extension = "csv";
        mimeType = "text/csv";
      } else if (formatType === "yaml") {
        extension = "yaml";
        mimeType = "application/x-yaml";
      }
    } else {
      extension = "json";
      mimeType = "application/json";
    }

    const blob = new Blob([outputText], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `converted.${extension}`;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  // 清空输入和输出
  const clearAll = () => {
    setInputText("");
    setOutputText("");
    setError("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // 交换方向
  const swapDirection = () => {
    setDirection(
      direction === "json_to_format" ? "format_to_json" : "json_to_format"
    );
    // 交换输入和输出的内容
    setInputText(outputText);
    setOutputText("");
    setError("");
  };

  // 加载示例
  const loadExample = () => {
    const jsonExample = `{
  "person": {
    "name": "张三",
    "age": 28,
    "isStudent": false,
    "address": {
      "city": "北京",
      "district": "海淀区",
      "postal": "100000"
    },
    "hobbies": ["读书", "旅游", "编程"]
  }
}`;

    const xmlExample = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <person>
    <n>张三</n>
    <age>28</age>
    <isStudent>false</isStudent>
    <address>
      <city>北京</city>
      <district>海淀区</district>
      <postal>100000</postal>
    </address>
    <hobbies>读书</hobbies>
    <hobbies>旅游</hobbies>
    <hobbies>编程</hobbies>
  </person>
</root>`;

    const csvExample = `name,age,isStudent,city,district,postal,hobbies
张三,28,false,北京,海淀区,100000,"读书,旅游,编程"`;

    const yamlExample = `person:
  name: 张三
  age: 28
  isStudent: false
  address:
    city: 北京
    district: 海淀区
    postal: '100000'
  hobbies:
    - 读书
    - 旅游
    - 编程`;

    // 根据当前格式和方向加载示例
    if (direction === "json_to_format") {
      setInputText(jsonExample);
    } else {
      if (formatType === "xml") {
        setInputText(xmlExample);
      } else if (formatType === "csv") {
        setInputText(csvExample);
      } else if (formatType === "yaml") {
        setInputText(yamlExample);
      }
    }

    setOutputText("");
    setError("");
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <Title level={2}>
        <FormattedMessage id="tools.jsonConverter.name" />
      </Title>
      <Paragraph className="text-gray-500 dark:text-gray-400 mb-6">
        <FormattedMessage id="tools.jsonConverter.description" />
      </Paragraph>

      <Card>
        <Space orientation="vertical" size="large" className="w-full">
          {/* 格式类型选择 */}
          <div>
            <Text strong className="block mb-3">
              <FormattedMessage id="tools.jsonConverter.select_format_type" />
            </Text>
            <Row gutter={[16, 16]}>
              {formatTypes.map((type) => (
                <Col xs={24} md={8} key={type.id}>
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${formatType === type.id
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-500"
                      }`}
                    onClick={() => setFormatType(type.id)}
                  >
                    <Text strong>{type.name}</Text>
                    <br />
                    <Text type="secondary" className="text-sm">
                      {type.description}
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          {/* 转换方向选择 */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <Text
                className={
                  direction === "json_to_format"
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-500"
                }
              >
                <FormattedMessage id="tools.jsonConverter.direction.json_to_format" />
              </Text>

              <Tooltip
                title={
                  <FormattedMessage id="tools.jsonConverter.actions.swap_direction" />
                }
              >
                <Button
                  onClick={swapDirection}
                  icon={<SwapOutlined />}
                  shape="circle"
                  className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-800/30"
                />
              </Tooltip>

              <Text
                className={
                  direction === "format_to_json"
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-500"
                }
              >
                <FormattedMessage
                  id="tools.jsonConverter.direction.format_to_json"
                  values={{ format: formatType.toUpperCase() }}
                />
              </Text>
            </div>

            <div className="flex gap-2">
              <Tooltip
                title={
                  <FormattedMessage id="tools.jsonConverter.actions.load_example" />
                }
              >
                <Button icon={<ReloadOutlined />} onClick={loadExample}>
                  <FormattedMessage id="tools.jsonConverter.actions.example" />
                </Button>
              </Tooltip>

              <Button
                type="primary"
                icon={
                  isProcessing ? <LoadingOutlined /> : <SwapOutlined />
                }
                onClick={performConversion}
                disabled={!inputText || isProcessing}
                loading={isProcessing}
              >
                {isProcessing ? (
                  <FormattedMessage id="tools.jsonConverter.actions.converting" />
                ) : (
                  <FormattedMessage id="tools.jsonConverter.actions.convert" />
                )}
              </Button>

              <Button
                icon={<ClearOutlined />}
                onClick={clearAll}
                disabled={!inputText}
                danger
              >
                <FormattedMessage id="tools.jsonConverter.actions.clear" />
              </Button>
            </div>
          </div>

          {/* 高级选项切换 */}
          <div>
            <Button
              type="link"
              icon={<SettingOutlined />}
              onClick={() => setAdvancedOptions(!advancedOptions)}
              className="p-0 h-auto"
            >
              {advancedOptions ? (
                <FormattedMessage id="tools.jsonConverter.advanced_options.hide" />
              ) : (
                <FormattedMessage id="tools.jsonConverter.advanced_options.show" />
              )}
            </Button>

            {/* 高级选项面板 */}
            {advancedOptions && (
              <Card className="mt-3">
                {formatType === "csv" && (
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <div>
                        <Text className="block mb-2">
                          <FormattedMessage id="tools.jsonConverter.advanced_options.csv.delimiter" />
                        </Text>
                        <Select
                          value={csvDelimiter}
                          onChange={setCsvDelimiter}
                          className="w-full"
                          options={[
                            {
                              value: ",",
                              label: intl.formatMessage({
                                id: "tools.jsonConverter.advanced_options.csv.delimiters.comma",
                              }),
                            },
                            {
                              value: ";",
                              label: intl.formatMessage({
                                id: "tools.jsonConverter.advanced_options.csv.delimiters.semicolon",
                              }),
                            },
                            {
                              value: "\t",
                              label: intl.formatMessage({
                                id: "tools.jsonConverter.advanced_options.csv.delimiters.tab",
                              }),
                            },
                            {
                              value: "|",
                              label: intl.formatMessage({
                                id: "tools.jsonConverter.advanced_options.csv.delimiters.pipe",
                              }),
                            },
                          ]}
                        />
                      </div>
                    </Col>

                    <Col xs={24} md={12}>
                      <div>
                        <Text className="block mb-2">
                          <FormattedMessage id="tools.jsonConverter.advanced_options.csv.include_header" />
                        </Text>
                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={csvHeader}
                              onChange={(e) => setCsvHeader(e.target.checked)}
                              className="mr-2"
                            />
                            <Text>
                              {direction === "json_to_format" ? (
                                <FormattedMessage id="tools.jsonConverter.advanced_options.csv.generate_header" />
                              ) : (
                                <FormattedMessage id="tools.jsonConverter.advanced_options.csv.parse_header" />
                              )}
                            </Text>
                          </label>
                        </div>
                      </div>
                    </Col>
                  </Row>
                )}

                {formatType === "xml" && (
                  <div>
                    <Text className="block mb-2">
                      <FormattedMessage id="tools.jsonConverter.advanced_options.xml.root_element" />
                    </Text>
                    <Input
                      value={xmlRootName}
                      onChange={(e) => setXmlRootName(e.target.value)}
                      placeholder={intl.formatMessage({
                        id: "tools.jsonConverter.advanced_options.xml.root_placeholder",
                      })}
                    />
                  </div>
                )}

                <div className="mt-4 flex items-start">
                  <InfoCircleOutlined className="text-tertiary mr-2 mt-0.5" />
                  <Text type="secondary" className="text-sm">
                    <FormattedMessage id="tools.jsonConverter.advanced_options.description" />
                  </Text>
                </div>
              </Card>
            )}
          </div>

          {/* 转换区域 */}
          <Row gutter={[24, 24]}>
            {/* 输入框 */}
            <Col xs={24} md={12}>
              <div className="space-y-3">
                <Text strong>
                  {direction === "json_to_format" ? (
                    <FormattedMessage id="tools.jsonConverter.input.json" />
                  ) : (
                    <FormattedMessage
                      id="tools.jsonConverter.input.format"
                      values={{ format: formatType.toUpperCase() }}
                    />
                  )}
                </Text>
                <Input.TextArea
                  ref={inputRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    direction === "json_to_format"
                      ? intl.formatMessage({
                        id: "tools.jsonConverter.input.json_placeholder",
                      })
                      : intl.formatMessage(
                        {
                          id: "tools.jsonConverter.input.format_placeholder",
                        },
                        { format: formatType.toUpperCase() }
                      )
                  }
                  rows={15}
                  autoSize={{ minRows: 15, maxRows: 30 }}
                />
              </div>
            </Col>

            {/* 输出框 */}
            <Col xs={24} md={12}>
              <div className="space-y-3">
                <Text strong>
                  {direction === "json_to_format" ? (
                    <FormattedMessage
                      id="tools.jsonConverter.output.format"
                      values={{ format: formatType.toUpperCase() }}
                    />
                  ) : (
                    <FormattedMessage id="tools.jsonConverter.output.json" />
                  )}
                </Text>

                {isProcessing ? (
                  <div className="flex items-center justify-center min-h-[200px]">
                    <LoadingOutlined className="text-2xl text-green-500" spin />
                  </div>
                ) : (
                  <>
                    <Input.TextArea
                      ref={outputRef}
                      value={outputText}
                      readOnly
                      placeholder={
                        direction === "json_to_format"
                          ? intl.formatMessage(
                            {
                              id: "tools.jsonConverter.output.format_placeholder",
                            },
                            { format: formatType.toUpperCase() }
                          )
                          : intl.formatMessage({
                            id: "tools.jsonConverter.output.json_placeholder",
                          })
                      }
                      rows={15}
                      autoSize={{ minRows: 15, maxRows: 30 }}
                    />

                    {/* 错误信息 */}
                    {error && <Alert message={error} type="error" showIcon />}

                    {/* 操作按钮 */}
                    {outputText && (
                      <div className="flex justify-end gap-2">
                        <Tooltip
                          title={
                            <FormattedMessage id="tools.jsonConverter.actions.copy" />
                          }
                        >
                          <Button
                            icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                            onClick={copyToClipboard}
                          >
                            {copied ? (
                              <FormattedMessage id="tools.jsonConverter.actions.copied" />
                            ) : (
                              <FormattedMessage id="tools.jsonConverter.actions.copy" />
                            )}
                          </Button>
                        </Tooltip>

                        <Tooltip
                          title={
                            <FormattedMessage id="tools.jsonConverter.actions.download" />
                          }
                        >
                          <Button
                            icon={<DownloadOutlined />}
                            onClick={downloadOutput}
                          >
                            <FormattedMessage id="tools.jsonConverter.actions.download" />
                          </Button>
                        </Tooltip>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Col>
          </Row>

          {/* 说明部分 */}
          <Collapse>
            <Collapse.Panel
              header={
                <span>
                  <InfoCircleOutlined className="mr-2" />
                  <FormattedMessage id="tools.jsonConverter.notes.title" />
                </span>
              }
              key="notes"
            >
              {formatType === "xml" && (
                <div>
                  <Text strong className="block mb-2">
                    <FormattedMessage id="tools.jsonConverter.notes.xml.title" />
                  </Text>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <FormattedMessage id="tools.jsonConverter.notes.xml.items.0" />
                    </li>
                    <li>
                      <FormattedMessage id="tools.jsonConverter.notes.xml.items.1" />
                    </li>
                    <li>
                      <FormattedMessage id="tools.jsonConverter.notes.xml.items.2" />
                    </li>
                  </ul>
                </div>
              )}

              {formatType === "csv" && (
                <div>
                  <Text strong className="block mb-2">
                    <FormattedMessage id="tools.jsonConverter.notes.csv.title" />
                  </Text>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <FormattedMessage id="tools.jsonConverter.notes.csv.items.0" />
                    </li>
                    <li>
                      <FormattedMessage id="tools.jsonConverter.notes.csv.items.1" />
                    </li>
                    <li>
                      <FormattedMessage id="tools.jsonConverter.notes.csv.items.2" />
                    </li>
                  </ul>
                </div>
              )}

              {formatType === "yaml" && (
                <div>
                  <Text strong className="block mb-2">
                    <FormattedMessage id="tools.jsonConverter.notes.yaml.title" />
                  </Text>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <FormattedMessage id="tools.jsonConverter.notes.yaml.items.0" />
                    </li>
                    <li>
                      <FormattedMessage id="tools.jsonConverter.notes.yaml.items.1" />
                    </li>
                    <li>
                      <FormattedMessage id="tools.jsonConverter.notes.yaml.items.2" />
                    </li>
                  </ul>
                </div>
              )}
            </Collapse.Panel>
          </Collapse>
        </Space>
      </Card>
    </div>
  );
}
