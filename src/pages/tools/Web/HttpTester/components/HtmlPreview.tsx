import { Alert, Card, Tabs } from "antd";
import React from "react";

const { TabPane } = Tabs;

interface HtmlPreviewProps {
  htmlContent: string;
  rawContent: string;
}

const HtmlPreview: React.FC<HtmlPreviewProps> = ({
  htmlContent,
  rawContent,
}) => {
  return (
    <div>
      <Tabs defaultActiveKey="preview" size="small">
        <TabPane tab="预览" key="preview">
          <iframe
            height={600}
            width={"100%"}
            srcDoc={htmlContent}
            sandbox="allow-same-origin allow-scripts"
            title="HTML Preview"
          />
        </TabPane>
        <TabPane tab="源码" key="source">
          <Card
            style={{
              height: "400px",
              overflow: "auto",
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
              fontSize: "13px",
              lineHeight: "1.5",
              backgroundColor: "#1d1d1d",
              borderRadius: "4px",
              border: "1px solid #303030",
              color: "#f5f5f5",
              padding: "8px",
            }}
          >
            <pre
              style={{
                margin: 0,
                whiteSpace: "pre-wrap",
                wordWrap: "break-word",
              }}
            >
              {rawContent}
            </pre>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default HtmlPreview;
