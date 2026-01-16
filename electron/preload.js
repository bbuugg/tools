const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  // 窗口控制API
  windowMinimize: () => ipcRenderer.invoke('window-minimize'),
  windowMaximize: () => ipcRenderer.invoke('window-maximize'),
  windowClose: () => ipcRenderer.invoke('window-close'),
  windowIsMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  // HTTP请求API
  httpRequest: (options) => ipcRenderer.invoke('http-request', options),
  // 数据库API
  dbQuery: (sql, params) => ipcRenderer.invoke('db-query', sql, params),
  dbExecute: (sql, params) => ipcRenderer.invoke('db-execute', sql, params),
  dbCreateTable: (tableName, columns) => ipcRenderer.invoke('db-create-table', tableName, columns),
})
