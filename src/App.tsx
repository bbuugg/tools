import { lazy, Suspense } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import Layout from './components/layout/Layout'

const Home = lazy(() => import('./pages/home'))

const toolImports: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'audio-studio': lazy(() => import('./pages/tools/audio-studio')),
  'base64-image': lazy(() => import('./pages/tools/base64-image')),
  'code-formatter': lazy(() => import('./pages/tools/code-formatter')),
  'color-picker': lazy(() => import('./pages/tools/color-picker')),
  'cron-generator': lazy(() => import('./pages/tools/cron-generator')),
  'css-gradient-generator': lazy(() => import('./pages/tools/css-gradient-generator')),
  'excel2json': lazy(() => import('./pages/tools/excel2json')),
  'favicon-generator': lazy(() => import('./pages/tools/favicon-generator')),
  'file-renamer': lazy(() => import('./pages/tools/file-renamer')),
  'gif-editor': lazy(() => import('./pages/tools/gif-editor')),
  'html-extractor': lazy(() => import('./pages/tools/html-extractor')),
  'html-markdown-converter': lazy(() => import('./pages/tools/html-markdown-converter')),
  'image-compressor': lazy(() => import('./pages/tools/image-compressor')),
  'image-editor': lazy(() => import('./pages/tools/image-editor')),
  'image-list-processor': lazy(() => import('./pages/tools/image-list-processor')),
  'image-to-gif': lazy(() => import('./pages/tools/image-to-gif')),
  'image-watermark': lazy(() => import('./pages/tools/image-watermark')),
  'json': lazy(() => import('./pages/tools/json')),
  'jwt': lazy(() => import('./pages/tools/jwt')),
  'live-photo': lazy(() => import('./pages/tools/live-photo')),
  'markdown-pdf-converter': lazy(() => import('./pages/tools/markdown-pdf-converter')),
  'markdown-word-converter': lazy(() => import('./pages/tools/markdown-word-converter')),
  'number-base-converter': lazy(() => import('./pages/tools/number-base-converter')),
  'php-serialize': lazy(() => import('./pages/tools/php-serialize')),
  'qr-code': lazy(() => import('./pages/tools/qr-code')),
  'regex-tester': lazy(() => import('./pages/tools/regex-tester')),
  'string-generator': lazy(() => import('./pages/tools/string-generator')),
  'text-diff': lazy(() => import('./pages/tools/text-diff')),
  'text-processor': lazy(() => import('./pages/tools/text-processor')),
  'time-tools': lazy(() => import('./pages/tools/time-tools')),
  'video-image-converter': lazy(() => import('./pages/tools/video-image-converter')),
  'video-to-gif': lazy(() => import('./pages/tools/video-to-gif')),
  'websocket': lazy(() => import('./pages/tools/websocket')),
  'wechat-chat': lazy(() => import('./pages/tools/wechat-chat')),
}

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

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          {Object.entries(toolImports).map(([slug, Component]) => (
            <Route
              key={slug}
              path={`/tools/${slug}`}
              element={
                <Suspense fallback={<Loading />}>
                  <Component />
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
