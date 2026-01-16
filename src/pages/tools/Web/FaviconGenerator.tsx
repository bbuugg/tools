import {
  DownloadOutlined,
  FileImageOutlined,
  ReloadOutlined,
  ScissorOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Row,
  Select,
  Space,
  Typography,
  Upload,
  message,
} from "antd";
import "cropperjs/dist/cropper.css";
import JSZip from "jszip";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import Cropper, { type ReactCropperElement } from "react-cropper";

const { Title, Text, Paragraph } = Typography;

interface FaviconResult {
  size: number;
  format: string;
  dataUrl: string;
  blob: Blob;
  filename: string;
}

const FaviconGenerator: React.FC = () => {
  const intl = useIntl();
  // State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("favicon");

  // UseRef for cropper to avoid closure staleness issues
  const cropperRef = useRef<ReactCropperElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFavicons, setGeneratedFavicons] = useState<FaviconResult[]>(
    []
  );

  // Settings
  const [outputFormat, setOutputFormat] = useState("ico");
  const [selectedSizes, setSelectedSizes] = useState<number[]>([16, 32, 48]);

  const availableSizes = [16, 32, 48, 64, 128];

  // -------------------------------------------------------------------------
  // File Handling
  // -------------------------------------------------------------------------

  const handleFileChange = (info: any) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setFileName(file.name.split(".")[0] || "favicon");
        setGeneratedFavicons([]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = useCallback((event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            setImageSrc(reader.result as string);
            setFileName("pasted_image");
            setGeneratedFavicons([]);
            message.success(intl.formatMessage({ id: "common.copySuccess" })); // Or a specific 'Image pasted' key
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const handleReset = () => {
    setImageSrc(null);
    setGeneratedFavicons([]);
    setFileName("favicon");
  };

  // -------------------------------------------------------------------------
  // Generation Logic
  // -------------------------------------------------------------------------

  const generateFavicons = async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper || !imageSrc || selectedSizes.length === 0) {
      // Debugging output if check fails
      if (!cropper) console.error("Cropper instance not found via ref");
      return;
    }

    setIsGenerating(true);
    setGeneratedFavicons([]);

    try {
      // Get cropped canvas
      const sourceCanvas = cropper.getCroppedCanvas();
      if (!sourceCanvas) {
        throw new Error(
          intl.formatMessage({ id: "tools.favicon.canvasError" })
        );
      }

      const results: FaviconResult[] = [];

      for (const size of selectedSizes) {
        // Resize
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        if (!ctx) continue;

        // High quality resize
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(sourceCanvas, 0, 0, size, size);

        // Export
        const mimeType =
          outputFormat === "ico" ? "image/png" : `image/${outputFormat}`;
        const extension = outputFormat === "ico" ? "ico" : outputFormat;

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), mimeType, 0.9);
        });

        const dataUrl = canvas.toDataURL(mimeType, 0.9);

        results.push({
          size,
          format: outputFormat,
          dataUrl,
          blob,
          filename: `${fileName}-${size}x${size}.${extension}`,
        });
      }

      setGeneratedFavicons(results);
      message.success(
        intl.formatMessage(
          { id: "tools.favicon.generateSuccess" },
          { count: results.length }
        )
      );
    } catch (err) {
      console.error(err);
      message.error(intl.formatMessage({ id: "tools.favicon.generateError" }));
    } finally {
      setIsGenerating(false);
    }
  };

  // -------------------------------------------------------------------------
  // Download Logic
  // -------------------------------------------------------------------------

  const downloadSingle = (favicon: FaviconResult) => {
    const link = document.createElement("a");
    link.href = favicon.dataUrl;
    link.download = favicon.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = async () => {
    if (generatedFavicons.length === 0) return;

    try {
      const zip = new JSZip();
      generatedFavicons.forEach((fav) => {
        zip.file(fav.filename, fav.blob);
      });

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}-favicons.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      message.success(
        intl.formatMessage({ id: "tools.favicon.downloadZipSuccess" })
      );
    } catch (err) {
      message.error(intl.formatMessage({ id: "tools.favicon.zipError" }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-8">
        <Title level={1} className="text-white mb-2">
          <FormattedMessage id="tools.faviconGenerator.name" />
        </Title>
        <Text className="text-slate-400 text-lg">
          <FormattedMessage id="tools.faviconGenerator.description" />
        </Text>
      </div>

      {!imageSrc ? (
        // Upload State
        <div className="max-w-7xl mx-auto">
          <Card className="bg-white/5 border-slate-700">
            <Upload.Dragger
              accept="image/*"
              showUploadList={false}
              customRequest={({ file, onSuccess }) => {
                handleFileChange({ file });
                setTimeout(() => onSuccess?.("ok"), 0);
              }}
              className="bg-transparent border-slate-600 hover:border-primary-500"
              style={{ padding: "40px 0" }}
            >
              <p className="ant-upload-drag-icon">
                <FileImageOutlined className="text-5xl text-slate-500" />
              </p>
              <p className="ant-upload-text text-xl font-medium mt-4">
                <FormattedMessage id="tools.favicon.uploadText" />
              </p>
              <p className="ant-upload-hint text-slate-400 mt-2">
                <FormattedMessage id="tools.favicon.uploadHint" />
              </p>
            </Upload.Dragger>
          </Card>
        </div>
      ) : (
        // Editor State
        <Space orientation="vertical" className="animate-fade-in w-full">
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <Card
                className="bg-white/5 border-slate-700"
                title={<FormattedMessage id="tools.favicon.cropTitle" />}
                extra={
                  <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={handleReset}
                  >
                    <FormattedMessage id="common.clear" />
                  </Button>
                }
              >
                <div
                  className="cropper-container rounded-lg overflow-hidden"
                  style={{ height: 500 }}
                >
                  <Cropper
                    src={imageSrc}
                    style={{ height: "100%", width: "100%" }}
                    aspectRatio={1} // Favicons are square
                    guides={true}
                    viewMode={1}
                    dragMode="move"
                    responsive={true}
                    background={false}
                    ref={cropperRef}
                    checkCrossOrigin={false}
                    key={imageSrc} // Force re-mount on image change
                  />
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={8}>
              <Card
                className="bg-white/5 border-slate-700 h-full"
                title={<FormattedMessage id="common.options" />}
              >
                <div className="space-y-6">
                  {/* Format */}
                  <div>
                    <Text className="block mb-2">
                      <FormattedMessage id="tools.favicon.outputFormat" />
                    </Text>
                    <Select
                      value={outputFormat}
                      onChange={setOutputFormat}
                      className="w-full"
                      options={[
                        { value: "ico", label: "ICO (Standard)" },
                        { value: "png", label: "PNG" },
                        { value: "jpg", label: "JPG" },
                      ]}
                    />
                  </div>

                  {/* Sizes */}
                  <div>
                    <Text className="block mb-2">
                      <FormattedMessage id="tools.favicon.sizes" />
                    </Text>
                    <div className="p-3 rounded border border-slate-700">
                      <Checkbox.Group
                        value={selectedSizes}
                        onChange={(vals) => setSelectedSizes(vals as number[])}
                        className="flex flex-col gap-2"
                      >
                        {availableSizes.map((size) => (
                          <Checkbox key={size} value={size} className="!ml-0">
                            {size}x{size}
                          </Checkbox>
                        ))}
                      </Checkbox.Group>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    block
                    size="large"
                    onClick={generateFavicons}
                    loading={isGenerating}
                    disabled={selectedSizes.length === 0}
                    icon={<ScissorOutlined />}
                  >
                    <FormattedMessage id="common.start" />
                  </Button>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Results Section */}
          {generatedFavicons.length > 0 && (
            <div className="">
              <Card
                title={<FormattedMessage id="tools.favicon.resultsTitle" />}
                extra={
                  <Button
                    size="small"
                    type="primary"
                    icon={<DownloadOutlined />}
                    onClick={downloadAll}
                  >
                    <FormattedMessage id="tools.qrCodeTool.downloadZip" />
                  </Button>
                }
              >
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {generatedFavicons.map((fav, i) => (
                    <div
                      key={i}
                      className="border border-slate-700/50 rounded-lg p-4 flex flex-col items-center hover:transition-colors"
                    >
                      <div className="w-16 h-16 flex items-center justify-center bg-transparent mb-3 border border-slate-600/30 rounded checkerboard-bg">
                        <img
                          referrerPolicy="no-referrer"
                          src={fav.dataUrl}
                          alt={`${fav.size}x${fav.size}`}
                          style={{
                            width: fav.size > 48 ? 48 : fav.size,
                            height: fav.size > 48 ? 48 : fav.size,
                          }}
                          className="image-render-pixelated"
                        />
                      </div>
                      <div className="text-center mb-2">
                        <div className="font-mono text-xs">
                          {fav.size}x{fav.size}
                        </div>
                        <div className="text-slate-500 text-[10px] uppercase">
                          {fav.format}
                        </div>
                      </div>
                      <Button
                        size="small"
                        type="dashed"
                        icon={<DownloadOutlined />}
                        block
                        onClick={() => downloadSingle(fav)}
                      >
                        <FormattedMessage id="common.save" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Title level={5}>
                    <FormattedMessage id="tools.favicon.howToUse" />
                  </Title>
                  <Row gutter={24}>
                    <Col md={12}>
                      <Paragraph className="text-slate-300">
                        <Text strong>HTML Usage:</Text>
                        <pre className="mt-2 border border-slate-700 p-3 rounded text-xs text-green-700 overflow-x-auto">
                          {`<!-- Basic -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">

<!-- Modern (PNG) -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">`}
                        </pre>
                      </Paragraph>
                    </Col>
                    <Col md={12}>
                      <Text strong>
                        <FormattedMessage id="common.options" />:
                      </Text>
                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li>
                          <FormattedMessage id="tools.favicon.tip1" />
                        </li>
                        <li>
                          <FormattedMessage id="tools.favicon.tip2" />
                        </li>
                        <li>
                          <FormattedMessage id="tools.favicon.tip3" />
                        </li>
                        <li>
                          <FormattedMessage id="tools.favicon.tip4" />
                        </li>
                      </ul>
                    </Col>
                  </Row>
                </div>
              </Card>
            </div>
          )}
        </Space>
      )}

      <style>{`
                .checkerboard-bg {
                    background-image: linear-gradient(45deg, #1e293b 25%, transparent 25%), 
                                      linear-gradient(-45deg, #1e293b 25%, transparent 25%), 
                                      linear-gradient(45deg, transparent 75%, #1e293b 75%), 
                                      linear-gradient(-45deg, transparent 75%, #1e293b 75%);
                    background-size: 20px 20px;
                    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                }
                .image-render-pixelated {
                    image-rendering: pixelated;
                }
            `}</style>
    </div>
  );
};

export default FaviconGenerator;
