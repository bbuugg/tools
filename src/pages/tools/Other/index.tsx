import { type ToolConfig } from "@/types/tool";
import { VideoCameraOutlined } from "@ant-design/icons";
import React from "react";

const tools: ToolConfig[] = [
  {
    id: "clipboard",
    name: "Clipboard",
    description:
      "Convert videos to animated GIFs with time range selection and text overlay",
    icon: <VideoCameraOutlined />,
    category: "Media",
    component: React.lazy(() => import("./Clipboard")),
    path: "/other/clipboard",
  },
];

export default tools;
