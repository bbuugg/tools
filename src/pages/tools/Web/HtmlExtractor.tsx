import { useCopy } from "@/hooks/useCopy";
import {
  CopyOutlined,
  DeleteOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Divider,
  Empty,
  Image,
  Input,
  message,
  Row,
  Space,
  Tag,
  Typography,
} from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

const { TextArea } = Input;
const { Title, Text } = Typography;

interface ExtractedItem {
  type: string;
  url: string;
  text?: string;
  attributes?: Record<string, string>;
}

interface ExtractionOptions {
  images: boolean;
  videos: boolean;
  audios: boolean;
  links: boolean;
  css: boolean;
  js: boolean;
  iframes: boolean;
  metadata: boolean;
  forms: boolean;
  uniqueOnly: boolean;
  absoluteUrls: boolean;
}

const HtmlExtractor: React.FC = () => {
  const intl = useIntl();
  const copy = useCopy();

  // State
  const [htmlInput, setHtmlInput] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [extractedResults, setExtractedResults] = useState<ExtractedItem[]>([]);

  // Default Options
  const [options, setOptions] = useState<ExtractionOptions>({
    images: true,
    videos: true,
    audios: true,
    links: true,
    css: true,
    js: true,
    iframes: true,
    metadata: true,
    forms: true,
    uniqueOnly: true,
    absoluteUrls: false,
  });

  // -------------------------------------------------------------------------
  // Logic: Extraction
  // -------------------------------------------------------------------------

  const makeAbsolute = useCallback((url: string, base: string): string => {
    if (!url || !base || url.startsWith("http") || url.startsWith("//")) {
      return url;
    }
    try {
      const baseURL = new URL(base);
      return new URL(url, baseURL).href;
    } catch {
      return url;
    }
  }, []);

  const extractContent = useCallback(() => {
    if (!htmlInput.trim()) {
      setExtractedResults([]);
      return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlInput, "text/html");
    let results: ExtractedItem[] = [];

    // Helper to handle absolute URL option
    const processUrl = (url: string | null) => {
      if (!url) return null;
      return options.absoluteUrls ? makeAbsolute(url, baseUrl) : url;
    };

    // 1. Images
    if (options.images) {
      doc.querySelectorAll("img").forEach((img) => {
        const src = processUrl(img.getAttribute("src"));
        if (src) {
          results.push({
            type: "image",
            url: src,
            text: img.getAttribute("alt") || "",
            attributes: {
              alt: img.getAttribute("alt") || "",
              title: img.getAttribute("title") || "",
            },
          });
        }
      });

      // CSS Background Images
      doc.querySelectorAll("*").forEach((el) => {
        const style = (el as HTMLElement).style.backgroundImage;
        if (style) {
          const matches = style.match(/url\(["']?([^"')]+)["']?\)/g);
          matches?.forEach((match) => {
            const urlMatch = match.match(/url\(["']?([^"')]+)["']?\)/);
            if (urlMatch?.[1]) {
              const url = processUrl(urlMatch[1]);
              if (url) {
                results.push({
                  type: "css-background",
                  url,
                  text: "CSS Background Image",
                });
              }
            }
          });
        }
      });
    }

    // 2. Links
    if (options.links) {
      doc.querySelectorAll("a[href]").forEach((link) => {
        const href = processUrl(link.getAttribute("href"));
        if (href) {
          results.push({
            type: "link",
            url: href,
            text: link.textContent?.trim() || "",
            attributes: {
              target: link.getAttribute("target") || "",
              rel: link.getAttribute("rel") || "",
            },
          });
        }
      });
    }

    // 3. Media (Video/Audio)
    if (options.videos || options.audios) {
      // Videos
      if (options.videos) {
        doc.querySelectorAll("video").forEach((video) => {
          const src = processUrl(video.getAttribute("src"));
          if (src) {
            results.push({
              type: "video",
              url: src,
              attributes: {
                controls: video.getAttribute("controls") || "",
                autoplay: video.getAttribute("autoplay") || "",
              },
            });
          }
          video.querySelectorAll("source").forEach((source) => {
            const src = processUrl(source.getAttribute("src"));
            if (src) {
              results.push({
                type: "video",
                url: src,
                attributes: { type: source.getAttribute("type") || "" },
              });
            }
          });
        });
      }
      // Audio
      if (options.audios) {
        doc.querySelectorAll("audio").forEach((audio) => {
          const src = processUrl(audio.getAttribute("src"));
          if (src) {
            results.push({ type: "audio", url: src });
          }
          audio.querySelectorAll("source").forEach((source) => {
            const src = processUrl(source.getAttribute("src"));
            if (src) {
              results.push({
                type: "audio",
                url: src,
                attributes: { type: source.getAttribute("type") || "" },
              });
            }
          });
        });
      }
    }

    // 4. Resources (CSS/JS)
    if (options.css) {
      doc.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
        const href = processUrl(link.getAttribute("href"));
        if (href) results.push({ type: "css", url: href });
      });
    }
    if (options.js) {
      doc.querySelectorAll("script[src]").forEach((script) => {
        const src = processUrl(script.getAttribute("src"));
        if (src) results.push({ type: "js", url: src });
      });
    }

    // 5. Iframes
    if (options.iframes) {
      doc.querySelectorAll("iframe").forEach((iframe) => {
        const src = processUrl(iframe.getAttribute("src"));
        if (src) {
          results.push({
            type: "iframe",
            url: src,
            attributes: {
              title: iframe.getAttribute("title") || "",
              width: iframe.getAttribute("width") || "",
              height: iframe.getAttribute("height") || "",
            },
          });
        }
      });
    }

    // 6. Metadata
    if (options.metadata) {
      doc.querySelectorAll("meta").forEach((meta) => {
        const content = meta.getAttribute("content");
        const name = meta.getAttribute("name") || meta.getAttribute("property");
        if (content && name) {
          results.push({ type: "metadata", url: content, text: name });
        }
      });
    }

    // 7. Forms
    if (options.forms) {
      doc.querySelectorAll("form").forEach((form) => {
        const action = processUrl(form.getAttribute("action"));
        if (action) {
          results.push({
            type: "form",
            url: action,
            attributes: {
              method: form.getAttribute("method") || "get",
              enctype: form.getAttribute("enctype") || "",
            },
          });
        }
      });
    }

    // Unique Filter
    if (options.uniqueOnly) {
      const seen = new Set();
      results = results.filter((item) => {
        const key = `${item.type}-${item.url}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    setExtractedResults(results);
  }, [htmlInput, baseUrl, options, makeAbsolute]);

  // Computed Results by Type
  const resultsByType = useMemo(() => {
    const grouped: Record<string, ExtractedItem[]> = {};
    extractedResults.forEach((item) => {
      if (!grouped[item.type]) {
        grouped[item.type] = [];
      }
      grouped[item.type].push(item);
    });
    return grouped;
  }, [extractedResults]);

  const totalCount = extractedResults.length;

  // Actions
  const handleLoadExample = () => {
    setHtmlInput(`<!DOCTYPE html>
<html>
<head>
    <title>Example Page</title>
    <link rel="stylesheet" href="/css/style.css">
    <meta name="description" content="This is an example page">
</head>
<body>
    <h1>Welcome to Example Page</h1>
    <img src="/images/logo.png" alt="Logo">
    <a href="https://www.example.com">External Link</a>
    <video src="/videos/demo.mp4" controls></video>
    <audio src="/audio/music.mp3"></audio>
    <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>
    <form action="/submit" method="post">
        <input type="text" name="username">
        <button type="submit">Submit</button>
    </form>
    <script src="/js/app.js"><\/script>
</body>
</html>`);
  };

  const handleClear = () => {
    setHtmlInput("");
    setExtractedResults([]);
  };

  const handleCopyResults = () => {
    const text = extractedResults
      .map((item) => `${item.type}: ${item.url}`)
      .join("\n");
    copy(text);
    message.success(intl.formatMessage({ id: "common.copySuccess" }));
  };

  const toggleAllTypes = (checked: boolean) => {
    setOptions((prev) => ({
      ...prev,
      images: checked,
      videos: checked,
      audios: checked,
      links: checked,
      css: checked,
      js: checked,
      iframes: checked,
      metadata: checked,
      forms: checked,
    }));
  };

  // Helper for Emoji
  const getTypeEmoji = (type: string): string => {
    const emojis: Record<string, string> = {
      image: "🖼️",
      "css-background": "🎨",
      video: "📹",
      audio: "🎵",
      link: "🔗",
      css: "🎨",
      js: "📜",
      iframe: "🖼️",
      metadata: "🔍",
      form: "📝",
    };
    return emojis[type] || "📄";
  };

  useEffect(() => {
    if (htmlInput) {
      extractContent();
    }
  }, [options, htmlInput, extractContent]);

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <Title level={1} className="text-white mb-2">
          <FormattedMessage id="tools.htmlExtractor.name" />
        </Title>
        <Text className="text-slate-400 text-lg">
          <FormattedMessage id="tools.htmlExtractor.description" />
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* ----------------- LEFT: INPUT & OPTIONS ----------------- */}
        <Col xs={24} lg={12}>
          <Space orientation="vertical">
            <Card
              extra={
                <Space className="w-full justify-between">
                  <Space>
                    <Button
                      size="small"
                      onClick={handleLoadExample}
                      className="border-none hover:text-white"
                    >
                      <FormattedMessage id="common.loadExample" />
                    </Button>
                    <Button
                      size="small"
                      onClick={handleClear}
                      icon={<DeleteOutlined />}
                      danger
                      ghost
                    >
                      <FormattedMessage id="common.clear" />
                    </Button>
                  </Space>
                  <Button
                    size="small"
                    type="primary"
                    onClick={extractContent}
                    icon={<RocketOutlined />}
                  >
                    <FormattedMessage id="common.extract" />
                  </Button>
                </Space>
              }
              title={<FormattedMessage id="tools.htmlExtractor.inputTitle" />}
            >
              <div className="mb-4">
                <Text className="block mb-2">
                  <FormattedMessage id="tools.htmlExtractor.baseUrl" />
                </Text>
                <Input
                  placeholder="https://example.com"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  className="border-slate-700/50 text-slate-100"
                />
              </div>
              <TextArea
                value={htmlInput}
                onChange={(e) => setHtmlInput(e.target.value)}
                placeholder={intl.formatMessage({
                  id: "tools.htmlExtractor.placeholder",
                })}
                className="font-mono text-sm border-slate-700/50 text-slate-100 placeholder-slate-500 rounded-lg mb-4"
                style={{ minHeight: "300px", resize: "vertical" }}
                spellCheck={false}
              />
            </Card>

            <Card title={<FormattedMessage id="common.options" />}>
              <div className="flex justify-between items-center mb-4">
                <Text strong className="text-slate-300">
                  <FormattedMessage id="tools.htmlExtractor.contentTypes" />
                </Text>
                <Space size="small">
                  <Button
                    size="small"
                    type="text"
                    className="text-primary-400 hover:text-primary-300"
                    onClick={() => toggleAllTypes(true)}
                  >
                    <FormattedMessage id="common.selectAll" />
                  </Button>
                  <Button
                    size="small"
                    type="text"
                    className="text-slate-400 hover:text-slate-300"
                    onClick={() => toggleAllTypes(false)}
                  >
                    <FormattedMessage id="common.clear" />
                  </Button>
                </Space>
              </div>

              <Row gutter={[12, 12]} className="mb-6">
                {Object.keys(options)
                  .filter((k) => !["uniqueOnly", "absoluteUrls"].includes(k))
                  .map((key) => (
                    <Col span={12} key={key}>
                      <Checkbox
                        checked={(options as any)[key]}
                        onChange={(e) =>
                          setOptions({ ...options, [key]: e.target.checked })
                        }
                        className="text-slate-300"
                      >
                        <FormattedMessage
                          id={`tools.htmlExtractor.option.${key}`}
                          defaultMessage={key}
                        />
                      </Checkbox>
                    </Col>
                  ))}
              </Row>

              <Divider className="my-4" />

              <Space orientation="vertical" className="w-full">
                <Checkbox
                  checked={options.uniqueOnly}
                  onChange={(e) =>
                    setOptions({ ...options, uniqueOnly: e.target.checked })
                  }
                  className="text-slate-300"
                >
                  <FormattedMessage id="tools.htmlExtractor.option.uniqueOnly" />
                </Checkbox>
                <Checkbox
                  checked={options.absoluteUrls}
                  onChange={(e) =>
                    setOptions({ ...options, absoluteUrls: e.target.checked })
                  }
                  className="text-slate-300"
                >
                  <FormattedMessage id="tools.htmlExtractor.option.absoluteUrls" />
                </Checkbox>
              </Space>
            </Card>
          </Space>
        </Col>

        {/* ----------------- RIGHT: RESULTS ----------------- */}
        <Col xs={24} lg={12}>
          <Card
            className="border-none bg-white/5 h-full"
            title={
              <div className="flex justify-between items-center">
                <FormattedMessage id="common.result" /> ({totalCount})
                <Button
                  size="small"
                  onClick={handleCopyResults}
                  disabled={totalCount === 0}
                  icon={<CopyOutlined />}
                  type="dashed"
                >
                  <FormattedMessage id="common.copy" />
                </Button>
              </div>
            }
          >
            {totalCount === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span className="text-slate-500">
                    <FormattedMessage id="tools.htmlExtractor.noResults" />
                  </span>
                }
                className="my-12"
              />
            ) : (
              <div className="space-y-4 max-h-[100vh] overflow-y-auto pr-2 custom-scrollbar">
                {Object.entries(resultsByType).map(([type, items]) => (
                  <div
                    key={type}
                    className="border border-slate-700/50 rounded-lg overflow-hidden"
                  >
                    <div className="px-3 py-2 border-b border-slate-700/50 flex items-center justify-between">
                      <span className="font-medium text-sm flex items-center gap-2">
                        <span>{getTypeEmoji(type)}</span>
                        <span className="uppercase">{type}</span>
                        <Tag className="ml-2 border-none text-slate-400">
                          {items.length}
                        </Tag>
                      </span>
                    </div>
                    <div className="divide-y divide-slate-700/30">
                      {items.map((item, index) => (
                        <div
                          key={index}
                          className="p-3 hover:transition-colors"
                        >
                          <div className="mb-1">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-400 hover:text-primary-300 hover:underline break-all font-mono text-xs"
                            >
                              {item.url}
                            </a>
                          </div>
                          {item.text && (
                            <div className="text-slate-400 text-xs mb-1">
                              {item.text}
                            </div>
                          )}

                          {/* Attributes */}
                          {item.attributes &&
                            Object.keys(item.attributes).length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {Object.entries(item.attributes).map(
                                  ([k, v]) => (
                                    <span
                                      key={k}
                                      className="inline-block text-slate-400 px-1.5 py-0.5 rounded text-[10px]"
                                    >
                                      {k}: {v}
                                    </span>
                                  )
                                )}
                              </div>
                            )}

                          {/* Previews */}
                          {(item.type === "image" ||
                            item.type === "css-background") && (
                            <div className="mt-2 p-1 rounded inline-block">
                              <Image
                                referrerPolicy="no-referrer"
                                src={item.url}
                                alt={item.text}
                                className="max-w-full rounded"
                                loading="lazy"
                                onError={(e) =>
                                  ((
                                    e.target as HTMLImageElement
                                  ).style.display = "none")
                                }
                              />
                            </div>
                          )}
                          {item.type === "video" && (
                            <div className="mt-2 p-1 rounded inline-block">
                              <video
                                src={item.url}
                                controls
                                className="max-h-32 max-w-full rounded"
                                onError={(e) =>
                                  ((
                                    e.target as HTMLVideoElement
                                  ).style.display = "none")
                                }
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HtmlExtractor;
