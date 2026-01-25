import {
  CheckOutlined,
  CopyOutlined,
  FileTextOutlined,
  GlobalOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { Button, Card, Space, Tabs, Tag, Typography, message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import type { HttpMethod, HttpResponse, NetworkType } from "../types";
import { generateMarkdownDoc } from "../utils";
import HtmlPreview from "./HtmlPreview";
import JsonRenderer from "./JsonRenderer";
import MarkdownPreview from "./MarkdownPreview";

const { Text } = Typography;

interface ResponseDisplayProps {
  response: HttpResponse | null;
  url: string;
  method: HttpMethod;
  headers: { key: string; value: string; id: string }[];
  body: string;
  bodyFormat: "json" | "text" | "form";
  formFields: { key: string; value: string; id: string }[];
  networkType: NetworkType;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  response,
  url,
  method,
  headers,
  body,
  bodyFormat,
  formFields,
  networkType,
}) => {
  const intl = useIntl();
  const [responseTab, setResponseTab] = useState<"body" | "headers" | "info">(
    "body"
  );
  const [copiedJson, setCopiedJson] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 美化JSON
  const formatJson = (json: string): string => {
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  };

  // 检测内容是否为JSON
  const isJsonContent = (data: unknown): boolean => {
    // 检查响应头中的Content-Type
    if (
      response?.headers &&
      response.headers["content-type"]?.includes("application/json")
    ) {
      return true;
    }

    // 对于对象类型的数据，直接判定为JSON
    if (typeof data === "object" && data !== null) {
      return true;
    }

    // 尝试解析字符串
    if (typeof data === "string") {
      try {
        JSON.parse(data);
        return true;
      } catch {
        return false;
      }
    }

    return false;
  };

  // 复制响应内容
  const copyResponse = async () => {
    if (!response) return;

    const textToCopy =
      responseTab === "body"
        ? typeof response.data === "string"
          ? response.data
          : JSON.stringify(response.data, null, 2)
        : Object.entries(response.headers)
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n");

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedJson(true);
      message.success(intl.formatMessage({ id: "tools.httpTester.copied" }));
      setTimeout(() => setCopiedJson(false), 2000);
    } catch (err) {
      console.error(
        intl.formatMessage({ id: "tools.httpTester.copy_failed" }),
        err
      );
      message.error(intl.formatMessage({ id: "tools.httpTester.copy_failed" }));
    }
  };

  // 生成并显示Markdown接口文档
  const handleGenerateMarkdown = () => {
    if (!response) return;

    const markdownDoc = generateMarkdownDoc(
      url,
      method,
      headers,
      body,
      bodyFormat,
      formFields,
      response,
      networkType
    );

    setMarkdownContent(markdownDoc);
    setShowMarkdownPreview(true);
  };

  // 关闭Markdown预览窗口
  const handleCloseMarkdownPreview = () => {
    setShowMarkdownPreview(false);
  };

  // 调整响应区域高度以适应可用空间并跟随内容变化
  useEffect(() => {
    if (!response) return;

    const adjustHeight = () => {
      if (!containerRef.current || !contentRef.current) return;

      // 计算可用的视窗高度
      const viewportHeight = window.innerHeight;
      // 获取容器到视窗顶部的距离
      const containerTop = containerRef.current.getBoundingClientRect().top;
      // 设置底部边距
      const bottomMargin = 40;
      // 计算容器可用的最大高度（视口高度限制）
      const maxViewportHeight = viewportHeight - containerTop - bottomMargin;

      // 获取内容实际高度
      const contentHeight = contentRef.current.scrollHeight;

      // 设置容器初始高度为视口可用高度
      let targetHeight = Math.max(600, maxViewportHeight);

      // 如果内容高度超过初始高度，则让容器跟随内容增高
      // 最小高度600px，最大不超过内容高度+100px（为头部和边距预留空间）
      if (contentHeight > targetHeight - 100) {
        targetHeight = Math.min(contentHeight + 100, 2000); // 设置一个最大值2000px，防止过长
      }

      // 应用高度
      containerRef.current.style.minHeight = `${targetHeight}px`;
    };

    // 初始调整
    adjustHeight();

    // 设置一个延时调整，确保内容渲染完成后再次计算高度
    const timeoutId = setTimeout(adjustHeight, 100);

    // 监听窗口大小变化
    window.addEventListener("resize", adjustHeight);

    return () => {
      window.removeEventListener("resize", adjustHeight);
      clearTimeout(timeoutId);
    };
  }, [response, responseTab]);

  const { TabPane } = Tabs;

  return (
    <Card
      title={<FormattedMessage id="tools.httpTester.response_result" />}
      style={{ height: "100%" }}
      ref={containerRef}
    >
      {response ? (
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          {/* 响应头部 */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Space>
              <Tag
                color={
                  response.status >= 200 && response.status < 300
                    ? "success"
                    : response.status >= 400
                    ? "error"
                    : "warning"
                }
              >
                {response.status} {response.statusText}
              </Tag>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {response.size} bytes | {response.time}ms
              </Text>
            </Space>

            <Space>
              <Button
                size="small"
                icon={copiedJson ? <CheckOutlined /> : <CopyOutlined />}
                onClick={copyResponse}
                title={intl.formatMessage({ id: "tools.httpTester.copy" })}
              >
                {copiedJson
                  ? intl.formatMessage({ id: "tools.httpTester.copied" })
                  : intl.formatMessage({ id: "tools.httpTester.copy" })}
              </Button>

              <Button
                size="small"
                icon={<FileTextOutlined />}
                onClick={handleGenerateMarkdown}
                title={intl.formatMessage({
                  id: "tools.httpTester.generate_doc",
                })}
              >
                <FormattedMessage id="tools.httpTester.generate_doc" />
              </Button>
            </Space>
          </div>

          {/* 响应标签页 */}
          <Tabs
            activeKey={responseTab}
            onChange={(key) =>
              setResponseTab(key as "body" | "headers" | "info")
            }
            style={{ flex: 1, display: "flex", flexDirection: "column" }}
          >
            <TabPane
              tab={<FormattedMessage id="tools.httpTester.response_body" />}
              key="body"
            >
              <div ref={contentRef} style={{ overflow: "auto", flex: 1 }}>
                {responseTab === "body" && (
                  <div style={{ height: "100%" }}>
                    {(() => {
                      // 检测响应类型
                      const contentType =
                        response.headers?.["content-type"] ||
                        response.headers?.["Content-Type"] ||
                        "";

                      if (
                        typeof response.data === "string" &&
                        (contentType.includes("text/html") ||
                          contentType.includes("application/xhtml+xml") ||
                          response.data
                            .toLowerCase()
                            .includes("<!doctype html") ||
                          response.data.toLowerCase().includes("<html>"))
                      ) {
                        // HTML内容
                        return (
                          <HtmlPreview
                            htmlContent={response.data}
                            rawContent={response.data}
                          />
                        );
                      } else if (isJsonContent(response.data)) {
                        // JSON内容
                        return <JsonRenderer data={response.data} />;
                      } else {
                        // 其他文本内容
                        return (
                          <div
                            style={{
                              fontFamily:
                                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                              fontSize: "13px",
                              lineHeight: "1.5",
                              overflowX: "auto",
                              padding: "8px",
                              backgroundColor: "#1d1d1d",
                              borderRadius: "4px",
                              border: "1px solid #303030",
                              color: "#f5f5f5",
                              height: "100%",
                              whiteSpace: "pre-wrap",
                              wordWrap: "break-word",
                            }}
                          >
                            {typeof response.data === "string"
                              ? response.data
                              : formatJson(JSON.stringify(response.data))}
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}
              </div>
            </TabPane>

            <TabPane
              tab={<FormattedMessage id="tools.httpTester.response_headers" />}
              key="headers"
            >
              <div ref={contentRef} style={{ overflow: "auto", flex: 1 }}>
                {responseTab === "headers" &&
                  Object.entries(response.headers).map(([key, value]) => (
                    <div key={key} style={{ marginBottom: 4 }}>
                      <Text strong style={{ color: "#722ed1" }}>
                        {key}
                      </Text>
                      : {value}
                    </div>
                  ))}
              </div>
            </TabPane>

            <TabPane
              tab={<FormattedMessage id="tools.httpTester.request_info" />}
              key="info"
            >
              <div ref={contentRef} style={{ overflow: "auto", flex: 1 }}>
                {responseTab === "info" && (
                  <div style={{ padding: "8px 0" }}>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong style={{ color: "#722ed1" }}>
                        <FormattedMessage id="tools.httpTester.network_mode" />:
                      </Text>{" "}
                      {networkType === "local"
                        ? intl.formatMessage({
                            id: "tools.httpTester.network_mode_local",
                          })
                        : intl.formatMessage({
                            id: "tools.httpTester.network_mode_public",
                          })}
                      {networkType === "local" && (
                        <span
                          style={{
                            marginLeft: 8,
                            color: "#faad14",
                            fontSize: "12px",
                          }}
                        >
                          <InfoCircleOutlined style={{ marginRight: 4 }} />
                          <FormattedMessage id="tools.httpTester.cors_description" />
                        </span>
                      )}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong style={{ color: "#722ed1" }}>
                        <FormattedMessage id="tools.httpTester.request_url" />:
                      </Text>{" "}
                      {url}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong style={{ color: "#722ed1" }}>
                        <FormattedMessage id="tools.httpTester.request_method" />
                        :
                      </Text>{" "}
                      {method}
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong style={{ color: "#722ed1" }}>
                        <FormattedMessage id="tools.httpTester.response_time" />
                        :
                      </Text>{" "}
                      {response.time}ms
                    </div>
                    <div style={{ marginBottom: 8 }}>
                      <Text strong style={{ color: "#722ed1" }}>
                        <FormattedMessage id="tools.httpTester.response_size" />
                        :
                      </Text>{" "}
                      {response.size} bytes
                    </div>
                    {headers.filter((h) => h.key && h.value).length > 0 && (
                      <div style={{ marginTop: 16 }}>
                        <Text
                          strong
                          style={{
                            color: "#722ed1",
                            display: "block",
                            marginBottom: 8,
                          }}
                        >
                          <FormattedMessage id="tools.httpTester.request_headers" />
                        </Text>
                        <div
                          style={{
                            backgroundColor: "rgba(0, 0, 0, 0.3)",
                            padding: "12px",
                            borderRadius: "4px",
                            fontSize: "12px",
                          }}
                        >
                          {headers
                            .filter((h) => h.key && h.value)
                            .map((header, index) => (
                              <div key={header.id || index}>
                                {header.key}: {header.value}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    {["POST", "PUT", "PATCH"].includes(method) && (
                      <div style={{ marginTop: 16 }}>
                        <Text
                          strong
                          style={{
                            color: "#722ed1",
                            display: "block",
                            marginBottom: 8,
                          }}
                        >
                          <FormattedMessage id="tools.httpTester.request_body" />
                        </Text>
                        <div
                          style={{
                            backgroundColor: "rgba(0, 0, 0, 0.3)",
                            padding: "12px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            wordBreak: "break-all",
                            fontFamily: "monospace",
                          }}
                        >
                          {bodyFormat === "json"
                            ? formatJson(body)
                            : bodyFormat === "form"
                            ? formFields
                                .filter((f) => f.key && f.value)
                                .map((field) => `${field.key}=${field.value}`)
                                .join("&")
                            : body}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabPane>
          </Tabs>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            padding: 20,
          }}
        >
          <GlobalOutlined
            style={{ fontSize: "48px", color: "#722ed1", marginBottom: 16 }}
          />
          <Text type="secondary">
            <FormattedMessage id="tools.httpTester.enter_url" />
          </Text>
        </div>
      )}

      {/* Markdown预览模态窗口 */}
      <MarkdownPreview
        markdown={markdownContent}
        isOpen={showMarkdownPreview}
        onClose={handleCloseMarkdownPreview}
      />
    </Card>
  );
};

export default ResponseDisplay;
