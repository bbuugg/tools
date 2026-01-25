// 定义HTTP方法类型
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// 定义请求头类型
export type RequestHeader = {
  key: string;
  value: string;
  id: string;
};

// 定义历史记录项类型
export type HistoryItem = {
  url: string;
  method: HttpMethod;
  timestamp: Date;
};

// 定义响应数据类型
export type ResponseData = string | Record<string, unknown>;

// 定义响应类型
export type HttpResponse = {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: ResponseData;
  time: number;
  size: number;
  error?: string;
};

// 定义表单字段类型 (与请求头结构相同)
export type FormField = RequestHeader;

// 定义网络类型（本地/公网）
export type NetworkType = 'public' | 'local'; 