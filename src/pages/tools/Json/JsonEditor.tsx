import { useCopy } from "@/hooks/useCopy";
import {
  CheckCircleOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Col,
  Input,
  Popconfirm,
  Row,
  Space,
  Typography,
  Upload,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { createJSONEditor } from "vanilla-jsoneditor";

const { Title, Text } = Typography;

interface JsonContent {
  json: unknown;
}

interface TextContent {
  text: string;
}

type Content = JsonContent | TextContent;

const JsonEditorTool: React.FC = () => {
  const intl = useIntl();
  const copy = useCopy();
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<ReturnType<typeof createJSONEditor> | null>(
    null
  );

  // State management
  const [content, setContent] = useState<Content>({
    json: {
      example: intl.formatMessage({ id: "tools.jsonEditor.edit_json_here" }),
    },
  });
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState("data.json");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [editorHeight, setEditorHeight] = useState(600);

  // Initialize the JSON editor
  useEffect(() => {
    if (editorRef.current && !editorInstance.current) {
      editorInstance.current = createJSONEditor({
        target: editorRef.current,
        props: {
          content,
          onChange: (updatedContent: Content) => {
            setContent(updatedContent);
          },
          onError: (error: unknown) => {
            console.error("JSON Editor Error:", error);
          },
        },
      });
    }

    // Cleanup on unmount
    return () => {
      if (editorInstance.current) {
        editorInstance.current.destroy();
        editorInstance.current = null;
      }
    };
  }, []);

  // Update editor content when state changes
  useEffect(() => {
    if (editorInstance.current) {
      editorInstance.current.updateProps({ content });
    }
  }, [content]);

  // Handle window resize to adjust editor height
  useEffect(() => {
    const handleResize = () => {
      const newHeight = Math.max(400, window.innerHeight - 400);
      setEditorHeight(newHeight);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Copy JSON to clipboard
  const copyToClipboard = () => {
    try {
      let jsonString = "";
      if ("json" in content && content.json) {
        jsonString = JSON.stringify(content.json, null, 2);
      } else if ("text" in content && content.text) {
        jsonString = content.text;
      } else {
        throw new Error(
          intl.formatMessage({ id: "tools.jsonEditor.invalid_json" })
        );
      }

      copy(jsonString).then(() => {
        setCopied(true);
        setStatusMessage({
          type: "success",
          message: intl.formatMessage({
            id: "tools.jsonEditor.copied_to_clipboard",
          }),
        });
        setTimeout(() => {
          setCopied(false);
          setStatusMessage(null);
        }, 2000);
      });
    } catch (_error: unknown) {
      setStatusMessage({
        type: "error",
        message: intl.formatMessage({ id: "tools.jsonEditor.copy_failed" }),
      });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Download JSON file
  const downloadJson = () => {
    try {
      let jsonString = "";
      if ("json" in content && content.json) {
        jsonString = JSON.stringify(content.json, null, 2);
      } else if ("text" in content && content.text) {
        jsonString = content.text;
      } else {
        throw new Error(
          intl.formatMessage({ id: "tools.jsonEditor.invalid_json" })
        );
      }

      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setStatusMessage({
        type: "success",
        message: intl
          .formatMessage({ id: "tools.jsonEditor.download_success" })
          .replace("{fileName}", fileName),
      });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (_error: unknown) {
      setStatusMessage({
        type: "error",
        message: intl.formatMessage({
          id: "tools.jsonEditor.download_failed",
        }),
      });
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const fileContent = e.target?.result as string;
        try {
          // Try to parse as JSON
          const jsonData = JSON.parse(fileContent);
          setContent({ json: jsonData });
          setStatusMessage({
            type: "success",
            message: intl
              .formatMessage({ id: "tools.jsonEditor.loaded_file" })
              .replace("{fileName}", file.name),
          });
        } catch (_parseError: unknown) {
          // If parsing fails, load as text
          setContent({ text: fileContent });
          setStatusMessage({
            type: "success",
            message: intl
              .formatMessage({ id: "tools.jsonEditor.loaded_as_text" })
              .replace("{fileName}", file.name),
          });
        }
      } catch (_error: unknown) {
        setStatusMessage({
          type: "error",
          message: intl.formatMessage({
            id: "tools.jsonEditor.read_file_failed",
          }),
        });
      }

      setTimeout(() => setStatusMessage(null), 3000);
    };

    reader.readAsText(file);
    return false; // Prevent default upload behavior
  };

  // Clear editor
  const clearEditor = () => {
    setContent({ json: {} });
    setStatusMessage({
      type: "success",
      message: intl.formatMessage({ id: "tools.jsonEditor.editor_cleared" }),
    });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Handle filename change
  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let name = e.target.value.trim();
    if (!name) name = "data.json";
    if (!name.endsWith(".json")) name += ".json";
    setFileName(name);
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-8">
        <Title level={1} className="text-white mb-2">
          <FormattedMessage id="tools.jsonEditor.name" />
        </Title>
        <Text className="text-slate-400 text-lg">
          <FormattedMessage id="tools.jsonEditor.description" />
        </Text>
      </div>

      <Row gutter={[24, 8]}>
        <Col span={24}>
          <Space className="w-full justify-between flex-wrap">
            <Space className="flex-wrap">
              <Button
                size="small"
                icon={copied ? <CheckCircleOutlined /> : <CopyOutlined />}
                onClick={copyToClipboard}
                title={intl.formatMessage({ id: "tools.jsonEditor.copy" })}
              >
                {copied
                  ? intl.formatMessage({ id: "common.copySuccess" })
                  : intl.formatMessage({ id: "tools.jsonEditor.copy" })}
              </Button>

              <Button
                size="small"
                icon={<DownloadOutlined />}
                onClick={downloadJson}
                title={intl.formatMessage({
                  id: "tools.jsonEditor.download",
                })}
              >
                <FormattedMessage id="tools.jsonEditor.download" />
              </Button>

              <Upload
                accept=".json,application/json"
                beforeUpload={handleFileUpload}
                showUploadList={false}
              >
                <Button size="small" icon={<UploadOutlined />}>
                  <FormattedMessage id="tools.jsonEditor.upload" />
                </Button>
              </Upload>

              <Popconfirm
                onConfirm={clearEditor}
                title={intl.formatMessage({ id: "tools.jsonEditor.clear" })}
              >
                <Button size="small" icon={<DeleteOutlined />} danger>
                  <FormattedMessage id="tools.jsonEditor.clear" />
                </Button>
              </Popconfirm>
            </Space>

            <Space>
              <span className="text-sm text-slate-400">
                <FormattedMessage id="tools.jsonEditor.file_name" />
              </span>
              <Input
                value={fileName}
                onChange={handleFileNameChange}
                className="w-48 border-slate-700"
                size="small"
              />
            </Space>
          </Space>
        </Col>

        <Col span={24}>
          {/* Status message */}
          {statusMessage && (
            <Alert
              message={statusMessage.message}
              type={statusMessage.type}
              showIcon
              className={
                statusMessage.type === "success"
                  ? "bg-green-900/10 border-green-500/30 text-green-300 mb-4"
                  : "bg-red-900/10 border-red-500/30 text-red-300 mb-4"
              }
            />
          )}
        </Col>

        <Col span={24}>
          {/* JSON Editor */}
          <div
            ref={editorRef}
            style={{ height: `${editorHeight}px` }}
            className="rounded-lg overflow-hidden"
          />
        </Col>
      </Row>
    </div>
  );
};

export default JsonEditorTool;
