import { ref, watch, onMounted } from 'vue'

export type Theme = 'light' | 'dark'

const theme = ref<Theme>('dark')
const THEME_STORAGE_KEY = 'app-theme'

export function useTheme() {
  // 初始化主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    theme.value = savedTheme || (prefersDark ? 'dark' : 'light')
    applyTheme(theme.value)
  }

  // 应用主题到 DOM
  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  // 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  // 设置主题
  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
  }

  // 监听主题变化
  watch(theme, (newTheme) => {
    applyTheme(newTheme)
    localStorage.setItem(THEME_STORAGE_KEY, newTheme)
  })

  onMounted(() => {
    initTheme()
  })

  return {
    theme,
    toggleTheme,
    setTheme,
    initTheme,
  }
}
