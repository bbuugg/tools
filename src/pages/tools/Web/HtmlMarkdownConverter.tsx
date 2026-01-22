import React, { useState, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Alert,
  Tooltip,
  Segmented,
} from "antd";
import {
  FileTextOutlined,
  CopyOutlined,
  CheckOutlined,
  RedoOutlined,
  SwapOutlined,
  ClearOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { useCopy } from "@/hooks/useCopy";
import { FormattedMessage, useIntl } from "react-intl";

const { Title, Text } = Typography;

declare global {
  interface Window {
    marked: {
      parse: (markdown: string, options?: Record<string, unknown>) => string;
      [key: string]: unknown;
    };
    TurndownService: {
      new (options?: Record<string, unknown>): {
        turndown: (html: string) => string;
        [key: string]: unknown;
      };
    };
  }
}

const HtmlMarkdownConverter: React.FC = () => {
  const intl = useIntl();
  const copy = useCopy();

  // Input and output
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"html2md" | "md2html">("md2html");

  // Other states
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  const [modulesLoaded, setModulesLoaded] = useState(false);

  // Load marked and turndown libraries dynamically
  useEffect(() => {
    if (typeof window !== "undefined" && !modulesLoaded) {
      setLoadingModules(true);

      const loadScripts = async () => {
        try {
          // Load Marked library
          const markedScript = document.createElement("script");
          markedScript.src = "/lib/markdown/marked.min.js";
          markedScript.async = true;

          const markedPromise = new Promise<void>((resolve, reject) => {
            markedScript.onload = () => {
              console.log("Marked library loaded successfully");
              resolve();
            };
            markedScript.onerror = (error) => {
              console.error(
                "Failed to load local Marked library, trying CDN:",
                error
              );
              // Fallback to CDN
              const cdnMarkedScript = document.createElement("script");
              cdnMarkedScript.src =
                "https://cdn.jsdelivr.net/npm/marked/marked.min.js";
              cdnMarkedScript.async = true;

              cdnMarkedScript.onload = () => {
                console.log("Successfully loaded Marked library from CDN");
                resolve();
              };

              cdnMarkedScript.onerror = (cdnError) => {
                console.error(
                  "Failed to load Marked library from CDN:",
                  cdnError
                );
                reject(new Error("Failed to load Marked library"));
              };

              document.body.appendChild(cdnMarkedScript);
            };
          });

          document.body.appendChild(markedScript);

          // Load Turndown library
          const turndownScript = document.createElement("script");
          turndownScript.src = "/lib/markdown/turndown.js";
          turndownScript.async = true;

          const turndownPromise = new Promise<void>((resolve, reject) => {
            turndownScript.onload = () => {
              console.log("Turndown library loaded successfully");
              resolve();
            };
            turndownScript.onerror = (error) => {
              console.error(
                "Failed to load local Turndown library, trying CDN:",
                error
              );
              // Fallback to CDN
              const cdnTurndownScript = document.createElement("script");
              cdnTurndownScript.src =
                "https://cdn.jsdelivr.net/npm/turndown/dist/turndown.js";
              cdnTurndownScript.async = true;

              cdnTurndownScript.onload = () => {
                console.log("Successfully loaded Turndown library from CDN");
                resolve();
              };

              cdnTurndownScript.onerror = (cdnError) => {
                console.error(
                  "Failed to load Turndown library from CDN:",
                  cdnError
                );
                reject(new Error("Failed to load Turndown library"));
              };

              document.body.appendChild(cdnTurndownScript);
            };
          });

          document.body.appendChild(turndownScript);

          // Wait for both scripts to load
          await Promise.all([markedPromise, turndownPromise]);
          console.log("All modules loaded successfully!");
          setModulesLoaded(true);
          setLoadingModules(false);
        } catch (error) {
          console.error("Failed to load libraries:", error);
          setError(
            intl.formatMessage({
              id: "tools.htmlMarkdownConverter.error_load",
            })
          );
          setLoadingModules(false);
        }
      };

      loadScripts();
    }

    return () => {
      // Cleanup function doesn't need to remove scripts, as they'll be cached and reused
    };
  }, [modulesLoaded, intl]);

  // Conversion function
  const convertContent = () => {
    if (!input.trim()) {
      setError(
        intl.formatMessage({ id: "tools.htmlMarkdownConverter.error_empty" })
      );
      setOutput("");
      return;
    }

    setIsConverting(true);
    setError(null);

    try {
      if (mode === "md2html") {
        // Markdown to HTML
        const html = window.marked.parse(input);
        setOutput(html);
      } else {
        // HTML to Markdown
        const turndownService = new window.TurndownService({
          headingStyle: "atx",
          codeBlockStyle: "fenced",
        });
        const markdown = turndownService.turndown(input);
        setOutput(markdown);
      }
      setError(null);
    } catch (err) {
      console.error("Conversion error:", err);
      const errorMsg = intl.formatMessage(
        { id: "tools.htmlMarkdownConverter.error_convert" },
        {
          error:
            err instanceof Error
              ? err.message
              : intl.formatMessage({
                  id: "tools.htmlMarkdownConverter.error_unknown",
                }),
        }
      );
      setError(errorMsg);
      setOutput("");
    } finally {
      setIsConverting(false);
    }
  };

  // Copy result
  const copyResult = () => {
    if (!output) return;

    copy(output)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error(
          intl.formatMessage({
            id: "tools.htmlMarkdownConverter.error_copy",
          }),
          err
        );
        setError(
          intl.formatMessage({ id: "tools.htmlMarkdownConverter.error_copy" })
        );
      });
  };

  // Toggle conversion mode
  const toggleMode = () => {
    // When toggling mode, swap input and output
    setMode((prevMode) => (prevMode === "md2html" ? "html2md" : "md2html"));
    setInput(output);
    setOutput(input);
    setError(null);
  };

  // Clear all content
  const clearAll = () => {
    setInput("");
    setOutput("");
    setError(null);
  };

  // Load example
  const loadExample = () => {
    if (mode === "md2html") {
      setInput(`# Example Title

This is a **bold** text and *italic* text.

## Subtitle

- List item 1
- List item 2
- List item 3

[This is a link](https://example.com)

\`\`\`javascript
// This is code
function hello() {
  console.log("Hello, world!");
}
\`\`\`

> This is a quote

---

| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`);
    } else {
      setInput(`<h1>Example Title</h1>
<p>This is a <strong>bold</strong> text and <em>italic</em> text.</p>

<h2>Subtitle</h2>

<ul>
  <li>List item 1</li>
  <li>List item 2</li>
  <li>List item 3</li>
</ul>

<p><a href="https://example.com">This is a link</a></p>

<pre><code class="language-javascript">// This is code
function hello() {
  console.log("Hello, world!");
}
</code></pre>

<blockquote>
  <p>This is a quote</p>
</blockquote>

<hr />

<table>
  <thead>
    <tr>
      <th>Header 1</th>
      <th>Header 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Cell 1</td>
      <td>Cell 2</td>
    </tr>
    <tr>
      <td>Cell 3</td>
      <td>Cell 4</td>
    </tr>
  </tbody>
</table>`);
    }
    setOutput("");
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-8">
        <Title level={1} className="text-white mb-2">
          <FormattedMessage id="tools.htmlMarkdownConverter.name" />
        </Title>
        <Text className="text-slate-400 text-lg">
          <FormattedMessage id="tools.htmlMarkdownConverter.description" />
        </Text>
      </div>

      <Card className="bg-white/5 border-slate-700">
        <div className="space-y-6">
          {/* Mode toggle and actions */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Space className="flex items-center">
              <Segmented
                options={[
                  {
                    label: (
                      <FormattedMessage id="tools.htmlMarkdownConverter.md2html" />
                    ),
                    value: "md2html",
                  },
                  {
                    label: (
                      <FormattedMessage id="tools.htmlMarkdownConverter.html2md" />
                    ),
                    value: "html2md",
                  },
                ]}
                value={mode}
                onChange={(value) => setMode(value)}
                className="rounded-r-none border-r-0"
              />
              <Tooltip
                title={intl.formatMessage({
                  id: "tools.htmlMarkdownConverter.exchange",
                })}
              >
                <Button
                  onClick={toggleMode}
                  icon={<SwapOutlined />}
                  size="small"
                  disabled={loadingModules}
                  className="bg-slate-700 text-slate-300 hover:bg-slate-600"
                />
              </Tooltip>
            </Space>

            <Space>
              <Button
                size="small"
                onClick={convertContent}
                type="primary"
                loading={isConverting}
                disabled={!input || loadingModules}
                icon={<FileTextOutlined />}
              >
                {isConverting
                  ? intl.formatMessage({
                      id: "tools.htmlMarkdownConverter.converting",
                    })
                  : intl.formatMessage({
                      id: "tools.htmlMarkdownConverter.convert",
                    })}
              </Button>
              {/* Copy button */}
              {output && (
                <div className="flex justify-end">
                  <Button
                    size="small"
                    onClick={copyResult}
                    icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                  >
                    {copied
                      ? intl.formatMessage({
                          id: "tools.htmlMarkdownConverter.copied",
                        })
                      : intl.formatMessage({
                          id: "tools.htmlMarkdownConverter.copy_result",
                        })}
                  </Button>
                </div>
              )}
              <Button
                size="small"
                onClick={loadExample}
                disabled={loadingModules}
                icon={<RedoOutlined />}
              >
                <FormattedMessage id="tools.htmlMarkdownConverter.load_example" />
              </Button>

              <Button
                size="small"
                onClick={clearAll}
                disabled={!input && !output}
                icon={<ClearOutlined />}
                danger
              >
                <FormattedMessage id="tools.htmlMarkdownConverter.clear" />
              </Button>
            </Space>
          </div>

          {/* Loading status */}
          {loadingModules && (
            <Alert
              title={
                <div className="flex items-center">
                  <InfoCircleOutlined className="mr-2" />
                  <FormattedMessage id="tools.htmlMarkdownConverter.loading_modules" />
                </div>
              }
              type="info"
              showIcon
              className="bg-purple-500/10 border-purple-500/30"
            />
          )}

          {/* Input/Output areas */}
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Text strong className="text-slate-300">
                    {mode === "md2html"
                      ? intl.formatMessage({
                          id: "tools.htmlMarkdownConverter.md_input",
                        })
                      : intl.formatMessage({
                          id: "tools.htmlMarkdownConverter.html_input",
                        })}
                  </Text>
                </div>
                <Input.TextArea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    mode === "md2html"
                      ? intl.formatMessage({
                          id: "tools.htmlMarkdownConverter.md_placeholder",
                        })
                      : intl.formatMessage({
                          id: "tools.htmlMarkdownConverter.html_placeholder",
                        })
                  }
                  rows={12}
                  className="border-slate-700 bg-slate-800 text-white"
                  disabled={loadingModules}
                />
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Text strong className="text-slate-300 mr-2">
                      {mode === "md2html"
                        ? intl.formatMessage({
                            id: "tools.htmlMarkdownConverter.html_output",
                          })
                        : intl.formatMessage({
                            id: "tools.htmlMarkdownConverter.md_output",
                          })}
                    </Text>
                  </div>
                </div>
                <Input.TextArea
                  value={output}
                  readOnly
                  placeholder={
                    mode === "md2html"
                      ? intl.formatMessage({
                          id: "tools.htmlMarkdownConverter.html_result_placeholder",
                        })
                      : intl.formatMessage({
                          id: "tools.htmlMarkdownConverter.md_result_placeholder",
                        })
                  }
                  rows={12}
                  className="border-slate-700 bg-slate-800 text-white"
                />
              </div>
            </Col>
          </Row>

          {/* Error message */}
          {error && <Alert title={error} type="error" showIcon />}
        </div>
      </Card>
    </div>
  );
};

export default HtmlMarkdownConverter;
