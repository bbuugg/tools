export interface DBResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  windowMinimize: () => Promise<void>;
  windowMaximize: () => Promise<void>;
  windowClose: () => Promise<void>;
  windowIsMaximized: () => Promise<boolean>;
  httpRequest: (options: unknown) => Promise<unknown>;
  dbQuery: (sql: string, params: unknown[]) => Promise<DBResult>;
  dbExecute: (sql: string, params: unknown[]) => Promise<DBResult>;
  dbCreateTable: (tableName: string, columns: { [key: string]: string }) => Promise<DBResult>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}