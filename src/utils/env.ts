/**
 * 检测是否在 Electron 环境中运行
 * @returns {boolean} 如果在 Electron 环境中返回 true，否则返回 false
 */
export const isElectron = (): boolean => {
  // 方法1: 检查 window.electron (通过 preload 暴露)
  if (typeof window !== 'undefined' && window.electron) {
    return true;
  }
  
  // 方法2: 检查 user agent
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
  if (userAgent.indexOf('electron') > -1) {
    return true;
  }
  
  // 方法3: 检查 window.process
  if (typeof window !== 'undefined' && window.process && window.process.type) {
    return true;
  }
  
  return false;
};

/**
 * 检测是否在开发环境
 */
export const isDev = (): boolean => {
  return import.meta.env.DEV;
};

/**
 * 检测是否在生产环境
 */
export const isProd = (): boolean => {
  return import.meta.env.PROD;
};

/**
 * 检测是否在 macOS 系统中运行
 * @returns {boolean} 如果在 macOS 系统中返回 true，否则返回 false
 */
export const isMacOs = (): boolean => {
  return /Mac OS X/.test(navigator.userAgent)
};
