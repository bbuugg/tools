import React, { useState, useRef } from "react";
import {
  Card,
  Input,
  Button,
  Tabs,
  Typography,
  Row,
  Col,
  Alert,
  Upload,
  Switch,
} from "antd";
import {
  CopyOutlined,
  DownloadOutlined,
  UploadOutlined,
  ClearOutlined,
  PictureOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useCopy } from "@/hooks/useCopy";
import { FormattedMessage, useIntl } from "react-intl";

// Type for conversion mode
type ConversionMode = "base64_to_image" | "image_to_base64";

const Base64ImageConverter: React.FC = () => {
  const intl = useIntl();
  const copy = useCopy();

  // State management
  const [conversionMode, setConversionMode] =
    useState<ConversionMode>("base64_to_image");

  // Base64 to Image state
  const [base64Input, setBase64Input] = useState("");
  const [imageOutput, setImageOutput] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("");
  const [fileName, setFileName] = useState<string>("image.png");
  const [copied, setCopied] = useState(false);

  // Image to Base64 state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [base64Output, setBase64Output] = useState<string>("");
  const [rawBase64Output, setRawBase64Output] = useState<string>("");
  const [outputWithPrefix, setOutputWithPrefix] = useState<boolean>(true);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [base64Copied, setBase64Copied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle conversion from Base64 to image
  React.useEffect(() => {
    if (conversionMode !== "base64_to_image" || !base64Input.trim()) {
      setImageOutput(null);
      setError(null);
      setMimeType("");
      return;
    }

    try {
      // Clear possible data URL prefix
      const processedInput = base64Input.trim();

      // Check if already a complete data URL
      if (processedInput.startsWith("data:")) {
        // Extract MIME type from data URL
        const mimeMatch = processedInput.match(/^data:([^;]+);base64,/);
        if (mimeMatch) {
          setMimeType(mimeMatch[1]);
          // Use the complete data URL
          setImageOutput(processedInput);
          setError(null);

          // Set appropriate file extension based on MIME type
          updateFileNameFromMimeType(mimeMatch[1]);
        } else {
          throw new Error(
            intl.formatMessage({
              id: "tools.base64ImageConverter.invalidDataUrl",
            })
          );
        }
      } else {
        // Assume this is raw Base64, need to add data URL prefix
        // Try to infer MIME type or use default
        const inferredMimeType = inferMimeTypeFromBase64(processedInput);
        setMimeType(inferredMimeType);

        // Create complete data URL
        const dataUrl = `data:${inferredMimeType};base64,${processedInput}`;
        setImageOutput(dataUrl);
        setError(null);

        // Set appropriate file extension based on MIME type
        updateFileNameFromMimeType(inferredMimeType);
      }
    } catch (err) {
      console.error("Error processing base64:", err);
      setError(
        (err as Error).message ||
          intl.formatMessage({
            id: "tools.base64ImageConverter.processingError",
          })
      );
      setImageOutput(null);
    }
  }, [base64Input, conversionMode, intl]);

  // Infer MIME type from Base64 data
  const inferMimeTypeFromBase64 = (base64String: string): string => {
    // Default to PNG
    let mimeType = "image/png";

    // Check first few characters to try to infer type
    const firstChars = base64String.substring(0, 4);

    if (firstChars.startsWith("/9j/")) {
      mimeType = "image/jpeg";
    } else if (firstChars.startsWith("iVBO") || firstChars.startsWith("IVBO")) {
      mimeType = "image/png";
    } else if (firstChars.startsWith("R0lG")) {
      mimeType = "image/gif";
    } else if (firstChars.startsWith("UE5H")) {
      mimeType = "image/png";
    } else if (firstChars.startsWith("Qk0=")) {
      mimeType = "image/bmp";
    } else if (firstChars.startsWith("PHN2")) {
      mimeType = "image/svg+xml";
    } else if (firstChars.startsWith("AAAA")) {
      mimeType = "image/webp";
    }

    return mimeType;
  };

  // Update filename based on MIME type
  const updateFileNameFromMimeType = (mime: string) => {
    let extension = "png"; // Default extension

    // Set extension based on MIME type
    if (mime === "image/jpeg" || mime === "image/jpg") {
      extension = "jpg";
    } else if (mime === "image/png") {
      extension = "png";
    } else if (mime === "image/gif") {
      extension = "gif";
    } else if (mime === "image/bmp") {
      extension = "bmp";
    } else if (mime === "image/svg+xml") {
      extension = "svg";
    } else if (mime === "image/webp") {
      extension = "webp";
    }

    setFileName(`image.${extension}`);
  };

  // Clear inputs and outputs for Base64 to Image
  const clearBase64ToImage = () => {
    setBase64Input("");
    setImageOutput(null);
    setError(null);
    setMimeType("");
    setFileName("image.png");
  };

  // Clear inputs and outputs for Image to Base64
  const clearImageToBase64 = () => {
    setUploadedFile(null);
    setUploadedImage(null);
    setBase64Output("");
    setRawBase64Output("");
    setUploadError(null);
    setUploadSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Download image
  const downloadImage = () => {
    if (!imageOutput) return;

    const link = document.createElement("a");
    link.href = imageOutput;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load example Base64
  const loadExample = () => {
    // A simple colored gradient PNG image's Base64
    const exampleBase64 =
      "iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAABhGlDQ1BJQ0MgcHJvZmlsZQAAKJF9kT1Iw0AcxV9TtSIVByuIOGSoThZERRylikWwUNoKrTqYXPohNGlIUlwcBdeCgx+LVQcXZ10dXAVB8APE1cVJ0UVK/F9SaBHjwXE/3t173L0DhGaVqWbPOKBqlpFOxMVcflUMvCKIEMKIISgxU5+TZRm4jq97+Ph6F+NZ3uf+HANKwWSATySeY7phEW8QT29aOud94ggrSQrxOfGYQRckfuS67PIb55LDAs8MGZnUPHGEWCx1sdzFrGKoxFPEUUXVKN+fc1nhvMVZrdZZ+578hcGCtpLhOs1RJLCEJFIQIaOOCqqwEKNVI8VEmvbjHv4Rx58il0yuChg5FlCDCsnxg//B727N0uSEmxROAH0vtv0xAoR2gVbDtr+Pbbt1AgSegSut499oAjOfpDc6WuxEMPgLOP0XfH5Qk0kAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAHdElNRQfkAwsLFhFmXs50AAABhklEQVR42u3YsUrDQBQGYO99giiIgouD4OAgCOJf4OAgOKSLIIKDg4OL4CA4+AOIi4uLoCD4B04iCBaKQnETXBxc3AR3cZHNk5e3eQkh8MFHzuE7l5AEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

    setBase64Input(exampleBase64);
  };

  // Copy Base64 to clipboard
  const copyBase64 = () => {
    if (!base64Input) return;

    copy(base64Input).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Copy generated Base64 to clipboard
  const copyGeneratedBase64 = () => {
    if (!base64Output) return;

    copy(base64Output).then(() => {
      setBase64Copied(true);
      setTimeout(() => setBase64Copied(false), 2000);
    });
  };

  // Toggle conversion mode
  const toggleConversionMode = () => {
    setConversionMode((prevMode) =>
      prevMode === "base64_to_image" ? "image_to_base64" : "base64_to_image"
    );

    // Clear respective states
    clearBase64ToImage();
    clearImageToBase64();
  };

  // Handle file upload
  const handleFileChange = (info: { file: { originFileObj: File } }) => {
    const file = info.file.originFileObj;
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      setUploadError(
        intl.formatMessage({
          id: "tools.base64ImageConverter.invalidImageFile",
        })
      );
      return;
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError(
        intl.formatMessage({ id: "tools.base64ImageConverter.fileTooLarge" })
      );
      return;
    }

    setUploadedFile(file);
    setUploadError(null);

    // Read and display image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setUploadedImage(result);

      // Extract Base64 part
      const base64WithPrefix = result;
      const base64Raw = result.split(",")[1];

      setRawBase64Output(base64Raw);
      setBase64Output(outputWithPrefix ? base64WithPrefix : base64Raw);

      setUploadSuccess(
        intl.formatMessage({
          id: "tools.base64ImageConverter.conversionSuccess",
        })
      );
    };
    reader.onerror = () => {
      setUploadError(
        intl.formatMessage({
          id: "tools.base64ImageConverter.fileReadingError",
        })
      );
    };
    reader.readAsDataURL(file);
  };

  // Toggle output format
  const toggleOutputFormat = () => {
    setOutputWithPrefix(!outputWithPrefix);
    setBase64Output(outputWithPrefix ? rawBase64Output : uploadedImage || "");
  };

  // Save Base64 as text file
  const saveBase64AsTextFile = () => {
    if (!base64Output) return;

    const blob = new Blob([base64Output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = uploadedFile
      ? `${uploadedFile.name}.txt`
      : "base64_data.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Destructure antd components
  const { TextArea } = Input;
  const { Title, Text } = Typography;

  // Tab items
  const items = [
    {
      key: "base64_to_image",
      label: intl.formatMessage({
        id: "tools.base64ImageConverter.base64ToImageTab",
      }),
      children: (
        <div className="space-y-6">
          <Row gutter={24}>
            <Col span={12}>
              <Card
                title={intl.formatMessage({
                  id: "tools.base64ImageConverter.inputTitle",
                })}
                size="small"
                className="bg-white/5 border-slate-700"
              >
                <TextArea
                  className="font-mono text-xs border-slate-700"
                  rows={10}
                  value={base64Input}
                  onChange={(e) => setBase64Input(e.target.value)}
                  placeholder={intl.formatMessage({
                    id: "tools.base64ImageConverter.inputPlaceholder",
                  })}
                />

                {error && (
                  <Alert
                    message={error}
                    type="error"
                    className="mt-4 bg-red-900/10 border-red-500/30 text-red-300"
                    showIcon
                  />
                )}

                <div className="flex items-center justify-between mt-4 space-x-2">
                  <Button onClick={loadExample}>
                    {intl.formatMessage({
                      id: "tools.base64ImageConverter.loadExample",
                    })}
                  </Button>

                  <Button
                    onClick={copyBase64}
                    disabled={!base64Input}
                    icon={copied ? <CheckCircleOutlined /> : <CopyOutlined />}
                  >
                    {copied
                      ? intl.formatMessage({ id: "common.copySuccess" })
                      : intl.formatMessage({
                          id: "tools.base64ImageConverter.copy",
                        })}
                  </Button>

                  <Button
                    onClick={clearBase64ToImage}
                    icon={<ClearOutlined />}
                    danger
                  >
                    {intl.formatMessage({
                      id: "tools.base64ImageConverter.clearAll",
                    })}
                  </Button>
                </div>
              </Card>
            </Col>

            <Col span={12}>
              <Card
                title={intl.formatMessage({
                  id: "tools.base64ImageConverter.outputTitle",
                })}
                size="small"
                className="bg-white/5 border-slate-700"
              >
                <div className="rounded-lg p-4 min-h-64 flex items-center justify-center border border-purple-500/30 mt-2">
                  {imageOutput ? (
                    <img
                      src={imageOutput}
                      alt={intl.formatMessage({
                        id: "tools.base64ImageConverter.convertedImage",
                      })}
                      className="max-w-full max-h-64 object-contain"
                    />
                  ) : (
                    <div className="text-gray-500">
                      {intl.formatMessage({
                        id: "tools.base64ImageConverter.noImage",
                      })}
                    </div>
                  )}
                </div>

                {imageOutput && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <Text className="text-sm">
                        {intl.formatMessage({
                          id: "tools.base64ImageConverter.imageType",
                        })}
                        : {mimeType}
                      </Text>
                      <Input
                        className="w-48 border-slate-700"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        placeholder={intl.formatMessage({
                          id: "tools.base64ImageConverter.fileName",
                        })}
                      />
                    </div>

                    <Button
                      onClick={downloadImage}
                      icon={<DownloadOutlined />}
                      type="primary"
                      block
                    >
                      {intl.formatMessage({
                        id: "tools.base64ImageConverter.downloadImage",
                      })}
                    </Button>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
    {
      key: "image_to_base64",
      label: intl.formatMessage({
        id: "tools.base64ImageConverter.imageToBase64Tab",
      }),
      children: (
        <div className="space-y-6">
          <Row gutter={24}>
            <Col span={12}>
              <Card
                title={intl.formatMessage({
                  id: "tools.base64ImageConverter.imageInputTitle",
                })}
                extra={<Button
                size="small"
                    onClick={clearImageToBase64}
                    icon={<ClearOutlined />}
                    danger
                    disabled={!uploadedFile}
                  >
                    {intl.formatMessage({
                      id: "tools.base64ImageConverter.clearAll",
                    })}
                  </Button>}
              >
                <div className="mb-6">
                  <Text className="text-slate-400 block mb-2">
                    {intl.formatMessage({
                      id: "tools.base64ImageConverter.selectImage",
                    })}
                  </Text>
                  <Upload
                    beforeUpload={(file) => {
                      handleFileChange({ file: { originFileObj: file } });
                      return false; // Prevent default upload
                    }}
                    showUploadList={false}
                    accept="image/*"
                  >
                    <Button icon={<UploadOutlined />}>
                      {intl.formatMessage({
                        id: "tools.base64ImageConverter.chooseFile",
                      })}
                    </Button>
                  </Upload>
                  {uploadedFile && (
                    <Text className="ml-4 text-sm text-slate-300">
                      {uploadedFile.name}
                    </Text>
                  )}
                </div>

                {uploadError && (
                  <Alert
                    message={uploadError}
                    type="error"
                    className="mb-4 bg-red-900/10 border-red-500/30 text-red-300"
                    showIcon
                  />
                )}
                {uploadSuccess && (
                  <Alert
                    message={uploadSuccess}
                    type="success"
                    className="mb-4 bg-green-900/10 border-green-500/30 text-green-300"
                    showIcon
                  />
                )}

                <div className="rounded-lg p-4 min-h-64 flex items-center justify-center">
                  {uploadedImage ? (
                    <img
                      src={uploadedImage}
                      alt={intl.formatMessage({
                        id: "tools.base64ImageConverter.uploadedImage",
                      })}
                      className="max-w-full max-h-64 object-contain"
                    />
                  ) : (
                    <div className="text-gray-500">
                      {intl.formatMessage({
                        id: "tools.base64ImageConverter.noUploadedImage",
                      })}
                    </div>
                  )}
                </div>
              </Card>
            </Col>

            <Col span={12}>
              <Card
                title={intl.formatMessage({
                  id: "tools.base64ImageConverter.base64OutputTitle",
                })}
              >
                <div className="flex items-center mb-4">
                  <Switch
                    checked={outputWithPrefix}
                    onChange={toggleOutputFormat}
                    className="mr-2"
                  />
                  <Text className="text-sm">
                    {intl.formatMessage({
                      id: "tools.base64ImageConverter.includePrefix",
                    })}
                  </Text>
                </div>

                <TextArea
                  className="font-mono text-xs border-slate-700"
                  rows={10}
                  value={base64Output}
                  readOnly
                  placeholder={intl.formatMessage({
                    id: "tools.base64ImageConverter.outputPlaceholder",
                  })}
                />

                {uploadedFile && base64Output && (
                  <div className="flex items-center justify-between mt-4 space-x-2">
                    <Button
                      onClick={copyGeneratedBase64}
                      icon={
                        base64Copied ? (
                          <CheckCircleOutlined />
                        ) : (
                          <CopyOutlined />
                        )
                      }
                    >
                      {base64Copied
                        ? intl.formatMessage({ id: "common.copySuccess" })
                        : intl.formatMessage({
                            id: "tools.base64ImageConverter.copyBase64",
                          })}
                    </Button>

                    <Button
                      onClick={saveBase64AsTextFile}
                      icon={<DownloadOutlined />}
                      type="primary"
                    >
                      {intl.formatMessage({
                        id: "tools.base64ImageConverter.saveAsText",
                      })}
                    </Button>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-8">
        <Title level={1} className="text-white mb-2">
          <FormattedMessage id="tools.base64ImageConverter.name" />
        </Title>
        <Text className="text-slate-400 text-lg">
          <FormattedMessage id="tools.base64ImageConverter.description" />
        </Text>
      </div>

      <div className="flex justify-center mb-6">
        <Button
          type="primary"
          onClick={toggleConversionMode}
          icon={<PictureOutlined />}
        >
          {conversionMode === "base64_to_image"
            ? intl.formatMessage({
                id: "tools.base64ImageConverter.switchToImageToBase64",
              })
            : intl.formatMessage({
                id: "tools.base64ImageConverter.switchToBase64ToImage",
              })}
        </Button>
      </div>

      <Tabs
        activeKey={conversionMode}
        onChange={(key) => setConversionMode(key as ConversionMode)}
        items={items}
      />
    </div>
  );
};

export default Base64ImageConverter;
