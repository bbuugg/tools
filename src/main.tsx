import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from 'next-themes'
import './index.css'
import './assets/github-markdown.less'
import App from './App.tsx'
import { registerServiceWorker } from '@/lib/pwa'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
)

// PWA：生产构建下注册 service worker（开发模式跳过，避免缓存住 vite 的模块）
registerServiceWorker()
