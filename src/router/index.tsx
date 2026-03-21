import { Spin } from "antd";
import React, { Suspense } from "react";
import { BrowserRouter, HashRouter, useRoutes } from "react-router";
import { isElectron } from "@/utils/env";
import { routes } from "./routes";

// Routes component
const AppRoutes: React.FC = () => {
  const element = useRoutes(routes);
  return element;
};

// Router wrapper
const AppRouter: React.FC = () => {
  // 根据环境选择路由类型
  // Electron 环境使用 HashRouter，Web 环境使用 BrowserRouter
  const Router = isElectron() ? HashRouter : BrowserRouter;

  return (
    <Router>
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-screen">
            <Spin size="large" />
          </div>
        }
      >
        <AppRoutes />
      </Suspense>
    </Router>
  );
};

export default AppRouter;
