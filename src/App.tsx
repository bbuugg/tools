import { lazy, Suspense, useEffect, useMemo } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Layout from './components/layout/Layout'
import { TOOL_ROUTES } from './lib/routes'
import { pageTitle } from './lib/site'

const Home = lazy(() => import('./pages/home'))

/** 预创建所有懒加载组件 */
const lazyComponents = TOOL_ROUTES.map((route) => ({
  path: route.path,
  title: route.title,
  description: route.description,
  Component: lazy(route.lazy),
}))

function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="text-gray-500">页面不存在</p>
      <Link to="/" className="text-primary hover:underline">返回首页</Link>
    </div>
  )
}

/** 根据当前路径动态更新 document.title */
function useDocumentTitle() {
  const location = useLocation()
  const title = useMemo(() => {
    if (location.pathname === '/') return pageTitle('工具')
    const route = TOOL_ROUTES.find((r) => r.path === location.pathname)
    return route ? pageTitle(route.title) : '工具站'
  }, [location.pathname])

  useEffect(() => {
    document.title = title
  }, [title])
}

function App() {
  useDocumentTitle()

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          {lazyComponents.map(({ path, title, description, Component }) => (
            <Route
              key={path}
              path={path}
              element={
                <Suspense fallback={<Loading />}>
                  <Component title={title} description={description} />
                </Suspense>
              }
            />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App
