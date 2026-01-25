import { type ToolConfig } from "@/types/tool";
import { VideoCameraOutlined, FontSizeOutlined } from "@ant-design/icons";
import React from "react";

const tools: ToolConfig[] = [
  {
    id: "clipboard",
    name: "Clipboard",
    description:
      "Convert videos to animated GIFs with time range selection and text overlay",
    icon: <VideoCameraOutlined />,
    category: "Other",
    component: React.lazy(() => import("./Clipboard")),
    path: "/other/clipboard",
  },
  {
    id: "stringGenerator",
    name: "String Generator",
    description: "Generate UUID, ULID and random strings",
    icon: <FontSizeOutlined />,
    category: "Other",
    component: React.lazy(() => import("./StringGenerator")),
    path: "/other/string-generator",
  },
];

export default tools;
