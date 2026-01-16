process.env.LANG = "zh_CN.UTF-8";
process.env.LC_ALL = "zh_CN.UTF-8";

// Windows 特殊处理
if (process.platform === "win32") {
  process.stdout.setDefaultEncoding("utf8");
  process.stderr.setDefaultEncoding("utf8");
}

import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "path";
import net from "net";
import fs from "fs";
import { fileURLToPath } from "url";
import { Agent as HttpAgent } from "http";
import { Agent as HttpsAgent } from "https";
import axios from "axios";
import Database from "better-sqlite3";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  // 根据环境确定图标路径
  const iconPath =
    process.env.NODE_ENV === "development"
      ? path.join(__dirname, "../public/logo.png")
      : path.join(process.resourcesPath, "app.asar", "public/logo.png");

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    minWidth: 1000,
    minHeight: 600,
    frame: false, // 移除默认窗口框架
    titleBarStyle: "hidden", // 隐藏标题栏
    icon: iconPath,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Check if we're in development mode
  if (process.env.NODE_ENV === "development") {
    // In development, connect to the Vite dev server
    // Try to read the port from Vite's output or use default
    let vitePort = 5173;

    // Try common ports
    const commonPorts = [5173, 5174, 5175, 5176];
    for (const port of commonPorts) {
      if (isPortOpenSync(port)) {
        vitePort = port;
        break;
      }
    }

    console.log(`Loading from Vite dev server on port ${vitePort}`);
    mainWindow.loadURL(`http://localhost:${vitePort}`);

    // Open DevTools in development mode
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built files
    const indexPath = path.join(__dirname, "../dist/index.html");
    if (fs.existsSync(indexPath)) {
      mainWindow.loadFile(indexPath);
    } else {
      console.error("Could not find index.html in dist folder");
      // Fallback to a simple HTML page
      mainWindow.loadURL(
        'data:text/html,<h1>Application not built yet</h1><p>Run "npm run build" to build the application</p>'
      );
    }
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // 调用 shell.openExternal() 用「系统默认浏览器」打开链接
    shell.openExternal(url);
    // 返回 { action: 'deny' } 禁止 Electron 自身打开新窗口
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Function to check if a port is open (synchronous version)
function isPortOpenSync(port) {
  try {
    const client = new net.Socket();
    client.setTimeout(1000);

    const result = new Promise((resolve) => {
      client.connect(port, "localhost", () => {
        client.destroy();
        resolve(true);
      });

      client.on("error", () => {
        client.destroy();
        resolve(false);
      });

      client.on("timeout", () => {
        client.destroy();
        resolve(false);
      });
    });

    return result;
  } catch (error) {
    return false;
  }
}

app.whenReady().then(() => {
  // Create the main window
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

// HTTP请求IPC处理程序
ipcMain.handle("http-request", async (event, options) => {
  try {
    const { url, method, headers, body } = options;
    
    // 创建axios请求配置
    const config = {
      url,
      method,
      headers: headers || {},
      data: body,
      // 配置代理以处理SSL证书问题
      httpAgent: new HttpAgent({ rejectUnauthorized: false }),
      httpsAgent: new HttpsAgent({ rejectUnauthorized: false }),
      // 设置超时时间
      timeout: 30000,
      // 允许重定向
      maxRedirects: 5,
      // 不需要通过代理服务器
      proxy: false,
      // 返回完整的响应信息
      validateStatus: (status) => status >= 200 && status < 600,
    };
    
    const response = await axios(config);
    
    // 返回响应数据
    return {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
    };
  } catch (error) {
    // 错误处理
    if (error.response) {
      // 服务器返回了错误状态码
      return {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: error.response.headers,
        data: error.response.data,
      };
    } else if (error.request) {
      // 请求已发出但没有收到响应
      return {
        status: 0,
        statusText: error.message || 'Network Error',
        headers: {},
        data: null,
      };
    } else {
      // 其他错误
      return {
        status: 0,
        statusText: error.message || 'Unknown Error',
        headers: {},
        data: null,
      };
    }
  }
});

// 数据库IPC处理程序
let db = null;

// 初始化数据库
function initDatabase() {
  if (db) {
    return db;
  }

  // 在开发环境中使用相对路径，在生产环境中使用用户数据目录
  let dbPath;
  if (process.env.NODE_ENV === "development") {
    dbPath = path.join(process.cwd(), 'data', 'app.db');
  } else {
    const userDataPath = app.getPath('userData');
    dbPath = path.join(userDataPath, 'app.db');
  }

  // 确保目录存在
  const dir = path.dirname(dbPath);
  fs.mkdirSync(dir, { recursive: true });

  db = new Database(dbPath);

  // 设置 WAL 模式以支持并发读取
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA synchronous = NORMAL;');
  db.exec('PRAGMA cache_size = 10000;');
  db.exec('PRAGMA locking_mode = NORMAL;');

  console.log(`Database initialized at: ${dbPath}`);

  return db;
}

// 数据库查询IPC处理程序
ipcMain.handle('db-query', async (event, sql, params = []) => {
  try {
    const database = initDatabase();
    const stmt = database.prepare(sql);
    const result = stmt.all(...params);
    return { success: true, data: result };
  } catch (error) {
    console.error('Database query error:', error);
    return { success: false, error: error.message };
  }
});

// 数据库执行IPC处理程序
ipcMain.handle('db-execute', async (event, sql, params = []) => {
  try {
    const database = initDatabase();
    const stmt = database.prepare(sql);
    const result = stmt.run(...params);
    return { success: true, data: { changes: result.changes, lastInsertRowid: result.lastInsertRowid } };
  } catch (error) {
    console.error('Database execute error:', error);
    return { success: false, error: error.message };
  }
});

// 数据库表创建IPC处理程序
ipcMain.handle('db-create-table', async (event, tableName, columns) => {
  try {
    const columnDefs = Object.entries(columns)
      .map(([name, type]) => `${name} ${type}`)
      .join(', ');
    
    const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefs})`;
    const database = initDatabase();
    const stmt = database.prepare(sql);
    const result = stmt.run();
    
    return { success: true, data: { changes: result.changes, lastInsertRowid: result.lastInsertRowid } };
  } catch (error) {
    console.error('Database create table error:', error);
    return { success: false, error: error.message };
  }
});

// 窗口控制IPC处理程序
ipcMain.handle("window-minimize", () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle("window-maximize", () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle("window-close", () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

ipcMain.handle("window-is-maximized", () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});
