import React, { useState } from "react";
import { Modal, Button, Space, message, Typography } from "antd";
import {
  CopyOutlined,
  CheckOutlined,
  DownloadOutlined,
  LinkOutlined,
} from "@ant-design/icons";
import { FormattedMessage, useIntl } from "react-intl";

interface MarkdownPreviewProps {
  markdown: string;
  isOpen: boolean;
  onClose: () => void;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({
  markdown,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const intl = useIntl();

  // 处理复制文档内容
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      message.success(intl.formatMessage({ id: "tools.httpTester.copied" }));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(
        intl.formatMessage({ id: "tools.httpTester.copy_failed" }),
        err
      );
      message.error(intl.formatMessage({ id: "tools.httpTester.copy_failed" }));
    }
  };

  // 处理下载文档
  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // 使用固定的文件名
    const fileName = "api_document.md";

    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal
      centered
      title="API Documentation"
      open={isOpen}
      onCancel={onClose}
      footer={[
        <Space key="space">
          <Button onClick={handleDownload} icon={<DownloadOutlined />}>
            <FormattedMessage id="tools.httpTester.download_doc" />
          </Button>
          <Button
            type="primary"
            icon={copied ? <CheckOutlined /> : <CopyOutlined />}
            onClick={handleCopy}
          >
            {copied
              ? intl.formatMessage({ id: "tools.httpTester.copied" })
              : intl.formatMessage({ id: "tools.httpTester.copy" })}
          </Button>
        </Space>,
      ]}
      width={800}
    >
      <div
        style={{
          height: "350px",
          overflow: "auto",
          padding: "16px",
          color: "white",
          backgroundColor: "#1d1d1d",
          border: "1px solid #303030",
          borderRadius: "4px",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          fontSize: "13px",
          lineHeight: "1.7",
        }}
      >
        <pre style={{ margin: 0, whiteSpace: "pre", wordWrap: "break-word" }}>
          {markdown}
        </pre>
      </div>
    </Modal>
  );
};

export default MarkdownPreview;
