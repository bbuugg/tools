import { useCopy } from "@/hooks/useCopy";
import {
  CloudDownloadOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Dropdown,
  Image,
  Input,
  Space,
  Typography,
  message,
} from "antd";
import JSZip from "jszip";
import React, { useCallback, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

const { TextArea } = Input;
const { Text, Title, Paragraph } = Typography;

interface ImageInfo {
  url: string;
  filename: string;
  loading: boolean;
  error: boolean;
}

const ImageListProcessor: React.FC = () => {
  const intl = useIntl();
  const copy = useCopy();
  const [inputData, setInputData] = useState("");
  const [imageList, setImageList] = useState<ImageInfo[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const extractFilename = (url: string): string => {
    try {
      const pathname = new URL(url).pathname;
      return pathname.split("/").pop() || url;
    } catch {
      return url.split("/").pop() || url;
    }
  };

  const processImages = useCallback((value: string) => {
    setInputData(value);

    if (!value.trim()) {
      setImageList([]);
      return;
    }

    const lines = value
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));

    const images: ImageInfo[] = [];

    for (const line of lines) {
      // Basic URL validation
      if (line.startsWith("http://") || line.startsWith("https://")) {
        images.push({
          url: line,
          filename: extractFilename(line),
          loading: true,
          error: false,
        });
      }
    }

    // Deduplicate
    const uniqueImages = images.filter(
      (image, index, self) =>
        index === self.findIndex((t) => t.url === image.url)
    );

    setImageList(uniqueImages);
  }, []);

  const handleClear = () => {
    setInputData("");
    setImageList([]);
  };

  const handleCopyUrls = () => {
    if (imageList.length === 0) return;
    const urls = imageList.map((img) => img.url).join("\n");
    copy(urls);
  };

  const handleLoadExample = () => {
    const example = Array.from(
      { length: 8 },
      (_, i) => `https://picsum.photos/400/300?random=${i + 1}`
    ).join("\n");
    processImages(example);
  };

  const handleDownloadAll = async () => {
    if (imageList.length === 0) return;
    setIsDownloading(true);
    try {
      const zip = new JSZip();
      const downloadPromises = imageList.map(async (img, index) => {
        try {
          const response = await fetch(img.url);
          if (!response.ok) throw new Error("Network response was not ok");
          const blob = await response.blob();

          // Try to get extension from content-type if not in URL
          let extension = img.url.split(".").pop()?.split(/[?#]/)[0] || "";
          if (!extension || extension.length > 4) {
            const contentType = response.headers.get("content-type");
            if (contentType?.includes("image/")) {
              extension = contentType.split("/")[1];
            } else {
              extension = "png";
            }
          }

          const baseName = img.filename?.split(".")[0] || `image-${index + 1}`;
          const filename = `${baseName}.${extension}`;
          zip.file(filename, blob);
        } catch (err) {
          console.error(`Failed to download ${img.url}`, err);
        }
      });

      await Promise.all(downloadPromises);

      if (Object.keys(zip.files).length === 0) {
        throw new Error("No images were successfully downloaded");
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `images-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success(
        intl.formatMessage(
          { id: "common.success" },
          { defaultMessage: "Success" }
        )
      );
    } catch (err: any) {
      console.error(err);
      message.error(
        err.message ||
          intl.formatMessage({ id: "tools.imageListProcessor.zipError" })
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleExportScript = (format: "bat" | "sh") => {
    if (imageList.length === 0) return;

    const commands = imageList.map((img, index) => {
      const fullFilename = img.filename || `image-${index + 1}.png`;

      // Split by last dot to insert index before extension
      const lastDotIndex = fullFilename.lastIndexOf(".");
      let finalFilename;
      if (lastDotIndex !== -1) {
        finalFilename = `${fullFilename.substring(
          0,
          lastDotIndex
        )}_${index + 1}${fullFilename.substring(lastDotIndex)}`;
      } else {
        finalFilename = `${fullFilename}_${index + 1}.png`;
      }

      return `curl -L -k -o "${finalFilename}" "${img.url}"`;
    });

    const content =
      format === "bat"
        ? `@echo off\necho Downloading ${imageList.length} images...\n${commands.join("\n")}\necho Done!\npause`
        : `#!/bin/bash\necho "Downloading ${imageList.length} images..."\n${commands.join("\n")}\necho "Done!"`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download =
      format === "bat" ? "download_images.bat" : "download_images.sh";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success(intl.formatMessage({ id: "common.success" }));
  };

  const handleBatchOpen = () => {
    if (imageList.length === 0) return;
    message.info(
      intl.formatMessage({ id: "tools.imageListProcessor.triggering" })
    );

    imageList.forEach((img, index) => {
      setTimeout(() => {
        const link = document.createElement("a");
        link.href = img.url;
        link.target = "_blank";
        link.setAttribute("download", img.filename || `image-${index + 1}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 300); // 300ms delay to avoid browser blocking
    });
  };

  const downloadMenuItems = [
    {
      key: "zip",
      label: intl.formatMessage({ id: "tools.imageListProcessor.downloadAll" }),
      icon: <CloudDownloadOutlined />,
      onClick: handleDownloadAll,
      disabled: isDownloading,
    },
    {
      type: "divider" as const,
    },
    {
      key: "bat",
      label: "Download Script (Windows .bat)",
      icon: <FileTextOutlined />,
      onClick: () => handleExportScript("bat"),
    },
    {
      key: "sh",
      label: "Download Script (Linux/Mac .sh)",
      icon: <FileTextOutlined />,
      onClick: () => handleExportScript("sh"),
    },
    {
      key: "browser",
      label: intl.formatMessage({ id: "tools.imageListProcessor.openUrls" }),
      icon: <DownloadOutlined />,
      onClick: handleBatchOpen,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4">
      <Space orientation="vertical" style={{ width: "100%" }}>
        <div className="text-center mb-8">
          <Title level={1} className="text-white mb-2">
            <FormattedMessage id="tools.imageListProcessor.name" />
          </Title>
          <Paragraph className="text-slate-400 text-lg">
            <FormattedMessage id="tools.imageListProcessor.description" />
          </Paragraph>
        </div>

        {/* Input Section */}
        <Card
          extra={
            <Space>
              <Button size="small" onClick={handleLoadExample}>
                <FormattedMessage id="common.loadExample" />
              </Button>
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={handleClear}
              >
                <FormattedMessage id="common.clear" />
              </Button>
              <Button
                size="small"
                type="primary"
                ghost
                icon={<CopyOutlined />}
                onClick={handleCopyUrls}
              >
                <FormattedMessage
                  id="tools.imageListProcessor.copyUrls"
                  defaultMessage="Copy URLs"
                />
              </Button>
              <Dropdown
                menu={{ items: downloadMenuItems }}
                placement="bottomRight"
                disabled={imageList.length === 0}
              >
                <Button
                  size="small"
                  type="primary"
                  icon={<DownloadOutlined />}
                  loading={isDownloading}
                >
                  <FormattedMessage
                    id="tools.imageListProcessor.batchDownload"
                    defaultMessage="Batch Download"
                  />
                </Button>
              </Dropdown>
            </Space>
          }
          className="bg-white/5 border-slate-700 mb-8"
          title={
            <>
              <FormattedMessage
                id="tools.imageListProcessor.inputTitle"
                defaultMessage="Input"
              />
              {imageList.length > 0 && (
                <span className="text-gray-700 ml-2">
                  (
                  <FormattedMessage
                    id="tools.imageListProcessor.total"
                    values={{ count: imageList.length }}
                  />
                  )
                </span>
              )}
            </>
          }
        >
          <TextArea
            value={inputData}
            onChange={(e) => processImages(e.target.value)}
            rows={8}
            placeholder={intl.formatMessage({
              id: "tools.imageListProcessor.placeholder",
            })}
            className="font-mono text-sm border-slate-700 mb-4 bg-slate-900 text-slate-200"
          />
        </Card>

        {/* Gallery Section */}
        {imageList.length > 0 && (
          <Card
            className="bg-white/5 border-slate-700 mb-8"
            title={<FormattedMessage id="tools.imageListProcessor.gallery" />}
          >
            <Image.PreviewGroup>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {imageList.map((img, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg p-2 border border-slate-700/50 group hover:border-green-500/50 transition-all"
                  >
                    <div className="aspect-square w-full rounded overflow-hidden flex items-center justify-center mb-2 relative">
                      <Image
                        referrerPolicy="no-referrer"
                        src={img.url}
                        alt={img.filename}
                        className="object-contain w-full h-full"
                        fallback="https://placeholder.com/150/000000/FFFFFF?text=Error"
                      />
                    </div>
                    <div className="px-1">
                      <Text
                        className="text-xs block truncate text-slate-300"
                        title={img.filename}
                      >
                        {img.filename}
                      </Text>
                      <Text
                        className="text-slate-500 text-[10px] block truncate"
                        title={img.url}
                      >
                        {img.url}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            </Image.PreviewGroup>
          </Card>
        )}
      </Space>
    </div>
  );
};

export default ImageListProcessor;
