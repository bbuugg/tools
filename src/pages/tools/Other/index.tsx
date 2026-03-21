import { type ToolConfig } from "@/types/tool";
import { FontSizeOutlined } from "@ant-design/icons";
import React from "react";

const tools: ToolConfig[] = [
  {
    id: "stringGenerator",
    name: "String Generator",
    description: "Generate UUID, ULID and random strings",
    icon: <FontSizeOutlined />,
    category: "Other",
    component: React.lazy(() => import("./StringGenerator")),
    path: "/tools/string-generator",
  },
];

export default tools;
