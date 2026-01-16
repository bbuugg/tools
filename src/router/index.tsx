import MainLayout from "@/layouts/MainLayout";
import HomePage from "@/pages/HomePage";
import NotFound from "@/pages/NotFound";
import AsTools from "@/pages/tools/AS";
import JsonTools from "@/pages/tools/Json";
import MediaTools from "@/pages/tools/Media";
import OtherTools from "@/pages/tools/Other";
import WebTools from "@/pages/tools/Web";
import Iframe from "@/pages/Iframe";
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
      <MainLayout>
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          }
        >
          <Routes>
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
          </Routes>
        </Suspense>
      </MainLayout>
    </Router>
  );
};

export default AppRouter;
