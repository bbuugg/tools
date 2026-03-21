import { type ToolConfig } from "@/types/tool";
import { CodeOutlined, CopyOutlined } from "@ant-design/icons";
import React from "react";

const tools: ToolConfig[] = [
  {
    id: "jsonExtractor",
    name: "JSON Extractor",
    description:
      "Advanced JSON extraction using fields, keys, or JSONPath queries",
    icon: <CopyOutlined />,
    category: "Text",
    component: React.lazy(() => import("./JsonExtractor")),
    path: "/tools/json-extractor",
  },
  {
    id: "jsonFormatter",
    name: "JSON Formatter",
    description: "Format, validate, and minify JSON data",
    icon: <CopyOutlined />,
    category: "Text",
    component: React.lazy(() => import("./JsonFormatter")),
    path: "/tools/json-formatter",
  },
  {
    id: "jsonToExcel",
    name: "JSON to Excel/CSV/SQL",
    description: "Convert JSON data to Excel, CSV, or SQL formats",
    icon: <CopyOutlined />,
    category: "Text",
    component: React.lazy(() => import("./JsonToExcel")),
    path: "/tools/json-to-excel",
  },
  {
    id: "excelToJson",
    name: "Excel/Text to JSON",
    description: "Convert Excel, CSV, or Text data to JSON",
    icon: <CopyOutlined />,
    category: "Text",
    component: React.lazy(() => import("./ExcelToJson")),
    path: "/tools/excel-to-json",
  },
  {
    id: "jsonConverter",
    name: "JSON Converter",
    description: "Convert JSON to/from XML, CSV, and YAML formats",
    icon: <CodeOutlined />,
    category: "Web",
    component: React.lazy(() => import("./JsonConverter")),
    path: "/tools/json-converter",
  },
];

export default tools;
