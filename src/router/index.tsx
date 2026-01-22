import MainLayout from "@/layouts/MainLayout";
import Desktop from "@/pages/Desktop";
import HomePage from "@/pages/HomePage";
import Iframe from "@/pages/Iframe";
import NotFound from "@/pages/NotFound";
import AsTools from "@/pages/tools/AS";
import JsonTools from "@/pages/tools/Json";
import MediaTools from "@/pages/tools/Media";
import OtherTools from "@/pages/tools/Other";
import WebTools from "@/pages/tools/Web";
import { isElectron } from "@/utils/env";
import { Spin } from "antd";
import React, { Suspense } from "react";
import { BrowserRouter, HashRouter, Route, Routes } from "react-router-dom";

const AppRouter: React.FC = () => {
  // 根据环境选择路由类型
  // Electron 环境使用 HashRouter，Web 环境使用 BrowserRouter
  const Router = isElectron() ? HashRouter : BrowserRouter;

  return (
    <Router>
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        }
      >
        <Routes>
          {/* Layout-free route */}
          <Route path="/desktop" element={<Desktop />} />

          {/* Wrapper for routes with MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            {AsTools.map((tool) => (
              <Route
                key={tool.id}
                path={tool.path}
                element={<tool.component />}
              />
            ))}
            {JsonTools.map((tool) => (
              <Route
                key={tool.id}
                path={tool.path}
                element={<tool.component />}
              />
            ))}
            {WebTools.map((tool) => (
              <Route
                key={tool.id}
                path={tool.path}
                element={<tool.component />}
              />
            ))}
            {MediaTools.map((tool) => (
              <Route
                key={tool.id}
                path={tool.path}
                element={<tool.component />}
              />
            ))}
            {OtherTools.map((tool) => (
              <Route
                key={tool.id}
                path={tool.path}
                element={<tool.component />}
              />
            ))}
            <Route path="/iframe" element={<Iframe />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRouter;
