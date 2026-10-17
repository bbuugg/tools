import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import Layout from './components/layout/Layout'
import { Toaster } from './components/ui/sonner'
import ChatWidget from '@/components/ChatWidget'

/**
 * 路由只用一个通配规则：地址栏与浏览器历史交给 react-router，
 * 页面内容统一由 Layout 里的多标签容器渲染（每个标签常驻内存，切换不丢数据）。
 * 工具清单依旧只维护在 lib/routes.ts 中。
 */
const router = createBrowserRouter([
  { path: '*',  element: <Layout /> },
])

function App() {
  return (
    <DndProvider backend={HTML5Backend}>
      <RouterProvider router={router} />
      <ChatWidget />
      <Toaster />
    </DndProvider>
  )
}

export default App
