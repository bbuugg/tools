import React from "react";
import {
  FileSearchOutlined,
  KeyOutlined,
  ApiOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import { type ToolConfig } from "@/types/tool";

const tools: ToolConfig[] = [
  {
    id: "htmlExtractor",
    name: "HTML Extractor",
    description: "Extract assets and metadata from HTML code",
    icon: <FileSearchOutlined />,
    category: "Web",
    component: React.lazy(() => import("./HtmlExtractor")),
    path: "/web/html-extractor",
  },
  {
    id: "jwtTool",
    name: "JWT Tool",
    description: "Encode, Decode and Verify JSON Web Tokens",
    icon: <KeyOutlined />,
    category: "Web",
    component: React.lazy(() => import("./JwtTool")),
    path: "/web/jwt-tool",
  },
  {
    id: "wsTool",
    name: "WebSocket Tool",
    description: "Test and debug WebSocket connections",
    icon: <ApiOutlined />,
    category: "Web",
    component: React.lazy(() => import("./WsTool")),
    path: "/web/ws-tool",
  },
  {
    id: "faviconGenerator",
    name: "Favicon Generator",
    description: "Create multi-size favicons from any image",
    icon: <FileImageOutlined />,
    category: "Web",
    component: React.lazy(() => import("./FaviconGenerator")),
    path: "/web/favicon-generator",
  },
  {
    id: "textProcessor",
    name: "Text Processor",
    description:
      "A comprehensive text processing tool with encoding, decoding, and hashing capabilities",
    icon: <FileSearchOutlined />,
    category: "Web",
    component: React.lazy(() => import("./TextProcessor")),
    path: "/web/text-processor",
  },
];

export default tools;
