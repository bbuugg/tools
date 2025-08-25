import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import net from 'net'
import fs from 'fs'
import { fileURLToPath } from 'url'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    frame: false, // 移除默认窗口框架
    titleBarStyle: 'hidden', // 隐藏标题栏
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // Check if we're in development mode
  if (process.env.NODE_ENV === 'development') {
    // In development, connect to the Vite dev server
    // Try to read the port from Vite's output or use default
    let vitePort = 5173

    // Try common ports
    const commonPorts = [5173, 5174, 5175, 5176]
    for (const port of commonPorts) {
      if (isPortOpenSync(port)) {
        vitePort = port
        break
      }
    }

    console.log(`Loading from Vite dev server on port ${vitePort}`)
    mainWindow.loadURL(`http://localhost:${vitePort}`)

    // Open DevTools in development mode
    mainWindow.webContents.openDevTools()
  } else {
    // In production, load the built files
    const indexPath = path.join(__dirname, '../dist/index.html')
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath)
    } else {
      console.error('Could not find index.html in dist folder')
      // Fallback to a simple HTML page
      mainWindow.loadURL(
        'data:text/html,<h1>Application not built yet</h1><p>Run "npm run build" to build the application</p>',
      )
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Function to check if a port is open (synchronous version)
function isPortOpenSync(port) {
  try {
    const client = new net.Socket()
    client.setTimeout(1000)

    const result = new Promise((resolve) => {
      client.connect(port, 'localhost', () => {
        client.destroy()
        resolve(true)
      })

      client.on('error', () => {
        client.destroy()
        resolve(false)
      })

      client.on('timeout', () => {
        client.destroy()
        resolve(false)
      })
    })

    return result
  } catch (error) {
    return false
  }
}

app.whenReady().then(() => {
  // Create the main window
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

// 窗口控制IPC处理程序
ipcMain.handle('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize()
  }
})

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize()
    } else {
      mainWindow.maximize()
    }
  }
})

ipcMain.handle('window-close', () => {
  if (mainWindow) {
    mainWindow.close()
  }
})

ipcMain.handle('window-is-maximized', () => {
  return mainWindow ? mainWindow.isMaximized() : false
})
