import { Spinner } from '@/components/ui/spinner'
import NotFound from '@/pages/not-found'
import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './components/layout/Layout'
import { Toaster } from './components/ui/sonner'
import { TOOL_ROUTES } from './lib/routes'

const Home = lazy(() => import('./pages/home'))

/** 预创建所有懒加载组件 */
const lazyComponents = TOOL_ROUTES.map((route) => ({
  path: route.path,
  meta: route.meta,
  Component: lazy(route.lazy),
}))

function Loading() {
  return (
    <div className="flex h-full items-center justify-center">
      <Spinner className='size-8' />
    </div>
  )
}

/** 路由树：使用 createBrowserRouter 标准格式注册 */
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Suspense fallback={<Loading />}><Home /></Suspense> },
      ...lazyComponents.map(({ path, meta, Component }) => ({
        path,
        element: (
          <Suspense fallback={<Loading />}>
            <Component />
          </Suspense>
        ),
        handle: { meta },
      })),
      { path: '*', element: <NotFound /> },
    ],
  },
])

function App() {
  return <>
    <RouterProvider router={router} />
    <Toaster />
  </>
}

export default App
