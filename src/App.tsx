import NotFound from '@/pages/not-found'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/layout/Layout'
import { Toaster } from './components/ui/sonner'
import { TOOL_ROUTES } from './lib/routes'
import ChatWidget from '@/components/ChatWidget'

/** 首页懒加载（路由级 lazy：加载期间进入 navigation.loading 状态，由 Layout 显示加载态） */
const homeRoute = {
  index: true as const,
  lazy: async () => {
    const m = await import('./pages/home')
    return { Component: m.default }
  },
}

/** 路由树：使用 createBrowserRouter 标准格式注册，页面组件走「路由级 lazy」 */
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      homeRoute,
      ...TOOL_ROUTES.map((route) => ({
        path: route.path,
        lazy: async () => {
          const m = await route.lazy()
          return { Component: m.default }
        },
        handle: { meta: route.meta },
      })),
      { path: '*', element: <NotFound /> },
    ],
  },
])

function App() {
  return <>
    <RouterProvider router={router} />
    <ChatWidget />
    <Toaster />
  </>
}

export default App
