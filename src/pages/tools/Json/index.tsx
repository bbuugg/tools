import { type ToolConfig } from "@/types/tool";
import { CopyOutlined } from "@ant-design/icons";
import React from "react";

const tools: ToolConfig[] = [
  {
    id: "jsonExtractor",
    name: "JSON Extractor",
    description:
      "Advanced JSON extraction using fields, keys, or JSONPath queries",
    icon: <CopyOutlined />, // Using CopyOutlined as placeholder, maybe NodeExpandOutlined or AimOutlined fits better but sticking to safe icons
    category: "Text",
    component: React.lazy(() => import("./JsonExtractor")),
    path: "/json/extractor",
  },
  {
    id: "jsonFormatter",
    name: "JSON Formatter",
    description: "Format, validate, and minify JSON data",
    icon: <CopyOutlined />,
    category: "Text",
    component: React.lazy(() => import("./JsonFormatter")),
    path: "/json/formatter",
  },
  {
    id: "jsonToExcel",
    name: "JSON to Excel/CSV/SQL",
    description: "Convert JSON data to Excel, CSV, or SQL formats",
    icon: <CopyOutlined />, // TODO: Use better icon like TableOutlined if available
    category: "Text",
    component: React.lazy(() => import("./JsonToExcel")),
    path: "/json/to-excel",
  },
  {
    id: "excelToJson",
    name: "Excel/Text to JSON",
    description: "Convert Excel, CSV, or Text data to JSON",
    icon: <CopyOutlined />, // TODO: Use better icon
    category: "Text",
    component: React.lazy(() => import("./ExcelToJson")),
    path: "/json/excel-to-json",
  },
];

export default tools;
