import { createApp, ref } from 'vue'
import Toast, { type ToastProps } from '@/components/Toast.vue'
import { useI18n } from 'vue-i18n'

interface ToastItem extends ToastProps {
  id: string
}

const toasts = ref<ToastItem[]>([])

let toastIdCounter = 0

export function useToast() {
  const { t } = useI18n()

  function showToast(options: Omit<ToastProps, 'onClose'>) {
    const id = `toast-${++toastIdCounter}`

    const toast: ToastItem = {
      ...options,
      id,
      onClose: () => removeToast(id),
    }

    toasts.value.push(toast)

    // Create and mount toast component
    const app = createApp(Toast, {
      ...toast,
      onClose: () => {
        removeToast(id)
        app.unmount()
      },
    })

    const container = document.createElement('div')
    document.body.appendChild(container)
    app.mount(container)

    return id
  }

  function removeToast(id: string) {
    const index = toasts.value.findIndex((toast) => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  function success(message: string, title?: string) {
    return showToast({
      type: 'success',
      title: title || t('toast.success'),
      message,
    })
  }

  function error(message: string, title?: string) {
    return showToast({
      type: 'error',
      title: title || t('toast.error'),
      message,
    })
  }

  function warning(message: string, title?: string) {
    return showToast({
      type: 'warning',
      title: title || t('toast.warning'),
      message,
    })
  }

  function info(message: string, title?: string) {
    return showToast({
      type: 'info',
      title: title || t('toast.info'),
      message,
    })
  }

  // Convenience methods that replace alert functionality
  function copySuccess() {
    success(t('toast.copied'))
  }

  function copyError() {
    error(t('toast.copyFailed'))
  }

  function downloadSuccess() {
    success(t('toast.downloadSuccess'))
  }

  return {
    toasts,
    showToast,
    success,
    error,
    warning,
    info,
    copySuccess,
    copyError,
    downloadSuccess,
    removeToast,
  }
}
