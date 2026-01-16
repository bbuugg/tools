import axios from "axios";
import type {
  HttpMethod,
  HttpResponse,
  NetworkType,
  RequestHeader,
  ResponseData,
} from "./types";

// 检查是否在Electron环境中
const isElectron = () => {
  return typeof window !== "undefined" && window.electronAPI;
};

// 代理响应接口
interface ProxyResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: ResponseData;
  time?: number;
  size?: number;
}

/**
 * 发送HTTP请求
 * @param url 请求URL
 * @param method 请求方法
 * @param headers 请求头
 * @param body 请求体
 * @param bodyFormat 请求体格式
 * @param formFields 表单字段
 * @param networkType 网络类型（公网/本地）
 */
export const sendHttpRequest = async (
  url: string,
  method: HttpMethod,
  headers: RequestHeader[],
  body: string,
  bodyFormat: "json" | "text" | "form",
  formFields: RequestHeader[],
  networkType: NetworkType = "public"
): Promise<{ response: HttpResponse | null; error: string | null }> => {
  try {
    if (!url.trim()) {
      return { response: null, error: "URL不能为空" };
    }

    // 准备请求头
    const headerObj: Record<string, string> = {};
    headers.forEach((h) => {
      if (h.key.trim() && h.value.trim()) {
        headerObj[h.key] = h.value;
      }
    });

    // 准备请求体
    let requestBody: string | FormData | undefined;
    if (["POST", "PUT", "PATCH"].includes(method)) {
      if (bodyFormat === "json") {
        try {
          // 尝试验证JSON格式
          if (body.trim()) {
            JSON.parse(body);
          }
          requestBody = body;
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          // 忽略具体错误，只返回格式无效的消息
          return { response: null, error: "请求体不是有效的JSON格式" };
        }
      } else if (bodyFormat === "form") {
        try {
          // 使用表单字段构建请求体
          const formData = new URLSearchParams();

          formFields.forEach((field) => {
            if (field.key.trim() && field.value.trim()) {
              formData.append(field.key, field.value);
            }
          });

          if (Array.from(formData.keys()).length === 0) {
            return { response: null, error: "表单至少需要一个有效的字段" };
          }

          requestBody = formData.toString();
          // 设置适当的Content-Type
          headerObj["Content-Type"] = "application/x-www-form-urlencoded";
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          // 忽略具体错误，只返回处理失败的消息
          return {
            response: null,
            error: "表单数据处理失败，请检查输入的字段值",
          };
        }
      } else {
        requestBody = body;
      }
    }

    const startTime = performance.now();

    // 根据网络类型决定发送请求的方式
    let responseData: ProxyResponse;
    let clientTime: number;

    // 如果在Electron环境中，使用主进程发送HTTP请求
    if (isElectron()) {
      try {
        // 通过Electron主进程发送HTTP请求，绕过浏览器跨域限制
        const electronResponse = await window.electronAPI.httpRequest({
          url,
          method,
          headers: headerObj,
          body: ["POST", "PUT", "PATCH"].includes(method)
            ? requestBody
            : undefined,
        });

        const endTime = performance.now();
        clientTime = Math.round(endTime - startTime);

        // 尝试解析响应体
        let data: ResponseData;
        const contentType =
          electronResponse.headers["content-type"] ||
          electronResponse.headers["Content-Type"] ||
          "";

        // 如果响应是对象且包含JSON数据，则保持原样，否则尝试作为文本处理
        if (typeof electronResponse.data === "object") {
          data = electronResponse.data;
        } else if (contentType.includes("application/json")) {
          try {
            data = JSON.parse(electronResponse.data || "{}");
          } catch {
            data = electronResponse.data || "";
          }
        } else {
          data = electronResponse.data || "";
        }

        // 计算响应大小
        const bodyText = typeof data === "string" ? data : JSON.stringify(data);
        const size = new Blob([bodyText || ""]).size;

        responseData = {
          status: electronResponse.status,
          statusText: electronResponse.statusText,
          headers: electronResponse.headers,
          data,
          time: clientTime,
          size,
        };
      } catch (error) {
        return {
          response: null,
          error: `Electron请求失败: ${(error as Error).message}`,
        };
      }
    } else {
      // 如果是本地/局域网请求，直接发送请求（不通过代理）
      if (networkType === "local") {
        try {
          // 直接使用fetch API发送请求到目标地址
          const response = await fetch(url, {
            method,
            headers: headerObj,
            body: ["POST", "PUT", "PATCH"].includes(method)
              ? requestBody
              : undefined,
          });

          const endTime = performance.now();
          clientTime = Math.round(endTime - startTime);

          // 获取响应头
          const headers: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            headers[key] = value;
          });

          // 尝试解析响应体
          let data: ResponseData;
          const contentType = response.headers.get("content-type") || "";

          if (contentType.includes("application/json")) {
            data = await response.json();
          } else {
            data = await response.text();
          }

          // 计算响应大小
          const bodyText =
            typeof data === "string" ? data : JSON.stringify(data);
          const size = new Blob([bodyText]).size;

          responseData = {
            status: response.status,
            statusText: response.statusText,
            headers,
            data,
            time: clientTime,
            size,
          };
        } catch (error) {
          return {
            response: null,
            error: `本地请求失败: ${
              (error as Error).message
            }。请确保目标服务器已配置CORS，允许跨域请求。`,
          };
        }
      } else {
        // 通过后端代理发送请求，避免跨域问题
        const proxyResponse = await axios.post<ProxyResponse>("/api/proxy", {
          url,
          method,
          headers: headerObj,
          body: requestBody,
        });

        const endTime = performance.now();
        clientTime = Math.round(endTime - startTime);

        responseData = proxyResponse.data;
      }
    }

    return {
      response: {
        status: responseData.status,
        statusText: responseData.statusText,
        headers: responseData.headers,
        data: responseData.data,
        // 使用服务器计算的响应时间或客户端时间
        time: responseData.time || clientTime,
        size: responseData.size || 0,
      },
      error: null,
    };
  } catch (error) {
    console.error("请求错误", error);
    return {
      response: null,
      error: (error as Error).message || "请求失败",
    };
  }
};

/**
 * 生成Markdown格式的接口文档
 * @param url 请求URL
 * @param method 请求方法
 * @param headers 请求头
 * @param requestBody 请求体
 * @param bodyFormat 请求体格式
 * @param formFields 表单字段
 * @param response 响应数据
 * @param networkType 网络类型（公网/本地）
 * @returns Markdown格式的接口文档
 */
export const generateMarkdownDoc = (
  url: string,
  method: HttpMethod,
  headers: RequestHeader[],
  requestBody: string,
  bodyFormat: "json" | "text" | "form",
  formFields: RequestHeader[],
  response: HttpResponse | null,
  networkType: NetworkType = "public"
): string => {
  // 准备请求体展示
  let requestBodyContent = "";
  if (["POST", "PUT", "PATCH"].includes(method)) {
    if (bodyFormat === "json" && requestBody.trim()) {
      try {
        // 美化JSON
        const parsedJson = JSON.parse(requestBody);
        requestBodyContent = JSON.stringify(parsedJson, null, 2);
      } catch {
        requestBodyContent = requestBody;
      }
    } else if (bodyFormat === "form") {
      // 构建表单内容，但不需要在这里生成请求体内容
      // 因为我们将在下面的请求参数部分直接使用表格展示
      const formData = new URLSearchParams();
      formFields.forEach((field) => {
        if (field.key.trim() && field.value.trim()) {
          formData.append(field.key, field.value);
        }
      });

      // 在表单模式下，请求体内容为空，因为我们会直接使用表格展示
      requestBodyContent = "";
    } else {
      requestBodyContent = requestBody;
    }
  }

  // 过滤有效的请求头
  const validHeaders = headers.filter((h) => h.key.trim() && h.value.trim());

  let markdown = ``;

  // 简要描述部分
  markdown += `**简要描述：** \n\n`;
  markdown += `- 自动生成的API接口文档\n\n`;

  // 请求模式部分（新增）
  markdown += `**请求模式：** \n\n`;
  markdown += `- ${networkType === "local" ? "本地/局域网" : "公网代理"} \n\n`;

  // 请求URL部分
  markdown += `**请求URL：** \n\n`;
  markdown += `- \`${url}\`\n\n`;

  // 请求方式部分
  markdown += `**请求方式：**\n\n`;
  markdown += `- ${method} \n\n`;

  // 请求头部分（如果有）
  if (validHeaders.length > 0) {
    markdown += `**请求头：** \n\n`;
    markdown += `| 参数名 | 必选 | 参数值 | 说明 |\n`;
    markdown += `| ------ | ---- | ------ | ---- |\n`;
    validHeaders.forEach((header) => {
      const isContent = header.key.toLowerCase() === "content-type";
      markdown += `| ${header.key} | ${isContent ? "是" : "否"} | ${
        header.value
      } | ${isContent ? "请求数据类型" : "-"} |\n`;
    });
    markdown += `\n`;
  }

  // 请求参数部分（针对POST、PUT等方法）
  if (
    ["POST", "PUT", "PATCH"].includes(method) &&
    (requestBodyContent || bodyFormat === "form")
  ) {
    markdown += `**请求参数：** \n\n`;

    // 针对表单格式单独处理
    if (bodyFormat === "form") {
      // 直接生成表单参数表格
      markdown += `| 参数名 | 必选 | 类型 | 说明 |\n`;
      markdown += `| ------ | ---- | ---- | ---- |\n`;

      const validFormFields = formFields.filter(
        (field) => field.key.trim() && field.value.trim()
      );

      if (validFormFields.length > 0) {
        validFormFields.forEach((field) => {
          markdown += `| ${field.key} | 是 | string | - |\n`;
        });
        markdown += `\n`;

        // 添加URL编码格式的说明
        const formData = new URLSearchParams();
        validFormFields.forEach((field) => {
          formData.append(field.key, field.value);
        });
        markdown += `**表单URL编码格式：** \n\n`;
        markdown += `\`${formData.toString()}\`\n\n`;
      } else {
        markdown += `| - | - | - | 无参数 |\n\n`;
      }
    }
    // JSON或文本格式的处理
    else {
      // 尝试解析参数并构建表格
      try {
        if (bodyFormat === "json") {
          const parsedBody = JSON.parse(requestBodyContent);
          if (typeof parsedBody === "object" && parsedBody !== null) {
            markdown += `| 参数名 | 必选 | 类型 | 说明 |\n`;
            markdown += `| ------ | ---- | ---- | ---- |\n`;

            Object.entries(parsedBody).forEach(([key, value]) => {
              const type = Array.isArray(value) ? "array" : typeof value;
              markdown += `| ${key} | 是 | ${type} | - |\n`;
            });
            markdown += `\n`;
          } else {
            markdown += `\`\`\`json
${requestBodyContent}
\`\`\`

`;
          }
        } else if (requestBodyContent.trim()) {
          markdown += `\`\`\`
${requestBodyContent}
\`\`\`

`;
        }
      } catch {
        if (requestBodyContent.trim()) {
          markdown += `\`\`\`
${requestBodyContent}
\`\`\`

`;
        }
      }
    }
  }

  // 响应结果部分
  if (response) {
    // 返回示例
    markdown += `**返回示例**\n\n`;
    if (typeof response.data === "object") {
      // 直接使用JSON.stringify的缩进参数格式化JSON
      markdown += `\`\`\`json
${JSON.stringify(response.data, null, 2)}
\`\`\`

`;
    } else if (typeof response.data === "string") {
      // 尝试检测是否为JSON字符串
      try {
        const parsedJson = JSON.parse(response.data);
        markdown += `\`\`\`json
${JSON.stringify(parsedJson, null, 2)}
\`\`\`

`;
      } catch {
        // 不是JSON字符串，直接显示
        markdown += `\`\`\`
${response.data}
\`\`\`

`;
      }
    } else {
      markdown += `\`\`\`
${response.data}
\`\`\`

`;
    }
  }

  // 备注
  markdown += `**备注** \n\n`;
  markdown += `- 此文档由HTTP测试工具自动生成\n`;
  markdown += `- 响应时间: ${response?.time || "-"}ms\n`;
  markdown += `- 响应大小: ${response?.size || "-"} bytes\n`;

  return markdown;
};
