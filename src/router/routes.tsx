import React from "react";
import { type RouteObject } from "react-router";
import MainLayout from "@/layouts/MainLayout";
import { allTools } from "@/utils/toolList";

// Lazy load pages
const HomePage = React.lazy(() => import("@/pages/HomePage"));
const Desktop = React.lazy(() => import("@/pages/Desktop"));
const Iframe = React.lazy(() => import("@/pages/Iframe"));
const NotFound = React.lazy(() => import("@/pages/NotFound"));

/**
 * Application Routes Configuration
 * 
 * Route Structure:
 * - /desktop - Desktop mode (no layout)
 * - / - Home page (with layout)
 * - /tools/* - All tool pages (dynamically generated from allTools)
 * - /iframe - Iframe page (with layout)
 * - * - 404 Not Found page (with layout)
 */
export const routes: RouteObject[] = [
  // Desktop route (no layout)
  {
    path: "/desktop",
    element: <Desktop />,
  },
  
  // Main layout routes
  {
    element: <MainLayout />,
    children: [
      // Home page
      {
        path: "/",
        element: <HomePage />,
      },
      
      // Dynamic tool routes
      // All tools are automatically registered from:
      // - src/pages/tools/Json/index.tsx
      // - src/pages/tools/Web/index.tsx
      // - src/pages/tools/Media/index.tsx
      // - src/pages/tools/Other/index.tsx
      ...allTools.map((tool) => ({
        path: tool.path,
        element: <tool.component />,
      })),
      
      // Iframe page
      {
        path: "/iframe",
        element: <Iframe />,
      },
      
      // 404 Not Found (catch all)
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
];

/**
 * Tool Routes Summary:
 * 
 * JSON Tools:
 * - /tools/json-extractor
 * - /tools/json-formatter
 * - /tools/json-to-excel
 * - /tools/excel-to-json
 * - /tools/json-converter
 * 
 * Web Tools:
 * - /tools/html-extractor
 * - /tools/jwt-tool
 * - /tools/ws-tool
 * - /tools/favicon-generator
 * - /tools/text-processor
 * - /tools/base64-image-converter
 * - /tools/timestamp-converter
 * - /tools/timezone-converter
 * - /tools/regex-tester
 * - /tools/password-generator
 * - /tools/file-to-markdown-converter
 * - /tools/cron-generator
 * - /tools/css-gradient-generator
 * - /tools/code-formatter
 * - /tools/date-calculator
 * - /tools/number-base-converter
 * - /tools/text-counter
 * - /tools/yml-properties-converter
 * - /tools/text-space-stripper
 * - /tools/crypto-tools
 * - /tools/icon-designer
 * - /tools/http-tester
 * - /tools/monaco-editor
 * 
 * Media Tools:
 * - /tools/image-list-processor
 * - /tools/qr-code
 * - /tools/color-picker
 * - /tools/file-renamer
 * - /tools/live-photo-utility
 * - /tools/image-compressor
 * - /tools/image-watermark
 * - /tools/image-to-gif-converter
 * - /tools/universal-video-player
 * - /tools/image-base64-converter
 * 
 * Other Tools:
 * - /tools/string-generator
 */
