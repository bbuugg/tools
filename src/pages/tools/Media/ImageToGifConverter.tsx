import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  Button,
  Typography,
  InputNumber,
  Select,
  message,
  Space,
  Row,
  Col,
  Tag,
  Alert,
} from "antd";
import { FormattedMessage, useIntl } from "react-intl";
import {
  DownloadOutlined,
  DeleteOutlined,
  UpOutlined,
  DownOutlined,
  SwapOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
// @ts-expect-error No type definitions available for gif.js
import GIF from "gif.js";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface SelectedImage {
  id: string;
  file: File;
  url: string;
  name: string;
  delay: number;
}

interface GifSettings {
  width: number;
  quality: "high" | "medium" | "low";
  fps: number;
  loopCount: number;
}

const ImageToGifConverter: React.FC = () => {
  const intl = useIntl();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [generatedGif, setGeneratedGif] = useState("");
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);

  const gifSettings = useRef<GifSettings>({
    width: 300,
    quality: "medium",
    fps: 2,
    loopCount: 0, // 0 = infinite
  }).current;

  // Handle paste event for image files
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("image") !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            // Create a File object from the blob
            const file = new File([blob], `pasted-image-${Date.now()}.png`, {
              type: blob.type,
            });
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        addImageFiles(imageFiles);
        message.success(
          intl.formatMessage(
            { id: "tools.imageToGifConverter.messages.filesPasted" },
            { count: imageFiles.length }
          )
        );
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [intl]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      // Clean up object URLs for selected images
      selectedImages.forEach((image) => {
        URL.revokeObjectURL(image.url);
      });

      // Clean up generated GIF URL
      if (generatedGif) {
        URL.revokeObjectURL(generatedGif);
      }
    };
  }, [selectedImages, generatedGif]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Add image files to the list
  const addImageFiles = (files: File[]) => {
    try {
      const newImages: SelectedImage[] = [];

      for (const file of files) {
        const url = URL.createObjectURL(file);
        newImages.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          url,
          name: file.name,
          delay: 1.0, // Default 1 second delay
        });
      }

      setSelectedImages((prev) => [...prev, ...newImages]);
      message.success(
        intl.formatMessage(
          { id: "tools.imageToGifConverter.messages.filesAdded" },
          { count: files.length }
        )
      );
    } catch (err) {
      console.error("Error adding image files:", err);
      message.error(
        intl.formatMessage({
          id: "tools.imageToGifConverter.errors.fileProcessing",
        })
      );
    }
  };

  // Handle file drop
  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );
      if (imageFiles.length > 0) {
        addImageFiles(imageFiles);
      } else {
        message.error(
          intl.formatMessage({
            id: "tools.imageToGifConverter.errors.noImages",
          })
        );
      }
    }
  };

  // Handle file select
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );
      if (imageFiles.length > 0) {
        addImageFiles(imageFiles);
      } else {
        message.error(
          intl.formatMessage({
            id: "tools.imageToGifConverter.errors.noImages",
          })
        );
      }
    }

    // Reset input to allow selecting the same file again
    if (event.target) {
      event.target.value = "";
    }
  };

  // Remove an image
  const removeImage = (id: string) => {
    const imageIndex = selectedImages.findIndex((img) => img.id === id);
    if (imageIndex !== -1) {
      const image = selectedImages[imageIndex];
      URL.revokeObjectURL(image.url);
      setSelectedImages((prev) => prev.filter((img) => img.id !== id));
    }
  };

  // Clear all images and reset
  const clearAll = () => {
    // Revoke all object URLs
    selectedImages.forEach((image) => {
      URL.revokeObjectURL(image.url);
    });
    setSelectedImages([]);

    if (generatedGif) {
      URL.revokeObjectURL(generatedGif);
      setGeneratedGif("");
    }

    message.success(
      intl.formatMessage({ id: "tools.imageToGifConverter.messages.cleared" })
    );
  };

  // Update image delay
  const updateImageDelay = (id: string, delay: number) => {
    if (!isNaN(delay) && delay > 0) {
      setSelectedImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, delay } : img))
      );
    }
  };

  // Move image up in the list
  const moveImageUp = () => {
    if (selectedImages.length <= 1) return;

    const newImages = [...selectedImages];
    const first = newImages.shift();
    if (first) {
      newImages.push(first);
      setSelectedImages(newImages);
    }
  };

  // Move image down in the list
  const moveImageDown = () => {
    if (selectedImages.length <= 1) return;

    const newImages = [...selectedImages];
    const last = newImages.pop();
    if (last) {
      newImages.unshift(last);
      setSelectedImages(newImages);
    }
  };

  // Reverse the order of images
  const reverseImages = () => {
    if (selectedImages.length <= 1) return;
    setSelectedImages((prev) => [...prev].reverse());
  };

  // Shuffle images
  const shuffleImages = () => {
    if (selectedImages.length <= 1) return;

    const shuffled = [...selectedImages];
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setSelectedImages(shuffled);
  };

  // Generate GIF from images
  const generateGif = async () => {
    if (selectedImages.length === 0) {
      message.error(
        intl.formatMessage({
          id: "tools.imageToGifConverter.errors.noImagesSelected",
        })
      );
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      await createGifFromImages();
      message.success(
        intl.formatMessage({
          id: "tools.imageToGifConverter.messages.gifGenerated",
        })
      );
    } catch (err) {
      console.error("Error generating GIF:", err);
      message.error(
        intl.formatMessage({
          id: "tools.imageToGifConverter.errors.processingFailed",
        }) +
          ": " +
          (err as Error).message
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Create GIF from selected images
  const createGifFromImages = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(
          new Error(
            "Unable to get canvas context. Your browser may not support this feature."
          )
        );
        return;
      }

      // Set canvas dimensions
      canvas.width = gifSettings.width;
      canvas.height = gifSettings.width; // Square by default, will adjust based on images

      // Configure GIF quality based on settings
      const qualityMap = {
        high: 1,
        medium: 10,
        low: 20,
      };

      // Create GIF
      const gif = new GIF({
        workers: 2,
        quality: qualityMap[gifSettings.quality],
        width: canvas.width,
        height: canvas.height,
        workerScript: "/gif.worker.js",
      });

      const totalImages = selectedImages.length;
      let processedImages = 0;

      // Process each image sequentially using promises
      const processNextImage = (index: number) => {
        if (index >= selectedImages.length) {
          // All images processed, render the GIF
          gif.on("finished", (blob: Blob) => {
            const url = URL.createObjectURL(blob);
            setGeneratedGif(url);
            setProcessingProgress(100);
            resolve();
          });

          gif.on("abort", () => {
            reject(new Error("GIF generation was aborted"));
          });

          gif.on("error", (error: Error) => {
            reject(new Error("GIF generation error: " + error.message));
          });

          try {
            gif.render();
          } catch (error) {
            reject(
              new Error(
                "Failed to start GIF rendering: " + (error as Error).message
              )
            );
          }
          return;
        }

        const image = selectedImages[index];
        const img = new Image();

        img.onload = () => {
          try {
            // Adjust canvas height based on image aspect ratio
            const aspectRatio = img.height / img.width;
            canvas.height = Math.round(canvas.width * aspectRatio);

            // Draw image on canvas
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Add frame to GIF with delay in milliseconds
            const delayMs = Math.round(image.delay * 1000);
            gif.addFrame(canvas, { copy: true, delay: delayMs });

            processedImages++;
            setProcessingProgress(
              Math.round((processedImages / totalImages) * 100)
            );

            // Process next image
            processNextImage(index + 1);
          } catch (err) {
            console.error("Error processing image:", image.name, err);
            // Continue with next image instead of stopping the whole process
            processNextImage(index + 1);
          }
        };

        img.onerror = () => {
          console.error("Error loading image:", image.name);
          // Continue with next image instead of stopping the whole process
          processNextImage(index + 1);
        };

        img.src = image.url;
      };

      // Start processing from the first image
      processNextImage(0);
    });
  };

  // Download the generated GIF
  const downloadGif = () => {
    if (!generatedGif) return;

    const link = document.createElement("a");
    link.href = generatedGif;
    link.download = `image-to-gif-${Date.now()}.gif`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset the tool
  const resetTool = () => {
    clearAll();
    setProcessingProgress(0);

    // Reset settings to defaults
    gifSettings.width = 300;
    gifSettings.quality = "medium" as const;
    gifSettings.fps = 2;
    gifSettings.loopCount = 0;

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <Title level={1} className="text-white mb-4">
          <FormattedMessage id="tools.imageToGifConverter.name" />
        </Title>
        <Text className="text-lg">
          <FormattedMessage id="tools.imageToGifConverter.description" />
        </Text>
      </div>

      <Space orientation="vertical" style={{ width: "100%" }}>
        {/* How to use */}
        <Card className="bg-white/5 border-slate-700 mb-8">
          <Alert
            message={
              <div>
                <strong>
                  <FormattedMessage id="tools.imageToGifConverter.howToUse.title" />
                </strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>
                    <FormattedMessage id="tools.imageToGifConverter.howToUse.step1" />
                  </li>
                  <li>
                    <FormattedMessage id="tools.imageToGifConverter.howToUse.step2" />
                  </li>
                  <li>
                    <FormattedMessage id="tools.imageToGifConverter.howToUse.step3" />
                  </li>
                  <li>
                    <FormattedMessage id="tools.imageToGifConverter.howToUse.step4" />
                  </li>
                </ol>
              </div>
            }
            type="info"
            className="bg-primary-500/10 border-primary-500/20"
          />
        </Card>

        {/* Upload Section */}
        <Card
          className="bg-white/5 border-slate-700 mb-8"
          title={
            <FormattedMessage id="tools.imageToGifConverter.upload.title" />
          }
        >
          {/* File Upload */}
          <div className="mb-6">
            <div
              onDrop={handleFileDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary-500 bg-primary-500/10"
                  : "border-slate-600 hover:border-primary-500"
              }`}
            >
              <div className="text-slate-400 text-4xl mb-4">🖼️</div>
              <p className="mb-4">
                <FormattedMessage id="tools.imageToGifConverter.upload.dragDrop" />
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                multiple
                className="hidden"
              />
              <Button className="px-6 py-2">
                <FormattedMessage id="tools.imageToGifConverter.upload.selectFile" />
              </Button>
              <p className="text-xs text-slate-400 mt-2">
                <FormattedMessage id="tools.imageToGifConverter.upload.supportedFormats" />
              </p>
            </div>
          </div>

          {/* GIF Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <div className="mb-2">
                <FormattedMessage id="tools.imageToGifConverter.settings.width" />
              </div>
              <InputNumber
                value={gifSettings.width}
                onChange={(value) => {
                  if (value !== null && value >= 100 && value <= 800) {
                    gifSettings.width = value;
                  }
                }}
                min={100}
                max={800}
                className="w-full"
              />
            </div>
            <div>
              <div className="mb-2">
                <FormattedMessage id="tools.imageToGifConverter.settings.quality" />
              </div>
              <Select
                value={gifSettings.quality}
                onChange={(value) => {
                  gifSettings.quality = value;
                }}
                className="w-full"
              >
                <Option value="high">
                  <FormattedMessage id="tools.imageToGifConverter.settings.qualityOptions.high" />
                </Option>
                <Option value="medium">
                  <FormattedMessage id="tools.imageToGifConverter.settings.qualityOptions.medium" />
                </Option>
                <Option value="low">
                  <FormattedMessage id="tools.imageToGifConverter.settings.qualityOptions.low" />
                </Option>
              </Select>
            </div>
            <div>
              <div className="mb-2">
                <FormattedMessage id="tools.imageToGifConverter.settings.fps" />
              </div>
              <InputNumber
                value={gifSettings.fps}
                onChange={(value) => {
                  if (value !== null && value >= 1 && value <= 30) {
                    gifSettings.fps = value;
                  }
                }}
                min={1}
                max={30}
                className="w-full"
              />
            </div>
          </div>
        </Card>

        {/* Image Preview Section */}
        {selectedImages.length > 0 && (
          <Card
            className="bg-white/5 border-slate-700 mb-8"
            title={
              <FormattedMessage id="tools.imageToGifConverter.preview.title" />
            }
          >
            <Row gutter={[24, 24]}>
              {/* Image List */}
              <Col xs={24} lg={16}>
                <div className="mb-4">
                  <h4 className="text-md font-semibold mb-3">
                    <FormattedMessage
                      id="tools.imageToGifConverter.preview.selectedImages"
                      values={{ count: selectedImages.length }}
                    />
                  </h4>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedImages.map((image) => (
                      <div
                        key={image.id}
                        className="flex items-center p-3 border border-slate-600 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-16 h-16 bg-slate-800 rounded-md overflow-hidden">
                          <img
                            referrerPolicy="no-referrer"
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-3 flex-grow min-w-0">
                          <Text className="text-sm font-medium truncate">
                            {image.name}
                          </Text>
                          <Text className="text-xs text-slate-500">
                            {formatFileSize(image.file.size)}
                          </Text>
                        </div>
                        <div className="flex items-center">
                          <InputNumber
                            value={image.delay}
                            onChange={(value) => {
                              if (value !== null) {
                                updateImageDelay(image.id, value);
                              }
                            }}
                            min={0.1}
                            max={10}
                            step={0.1}
                            className="w-20 text-xs"
                          />
                          <span className="ml-1 text-xs text-slate-500">s</span>
                          <Button
                            onClick={() => removeImage(image.id)}
                            className="ml-2"
                            danger
                            size="small"
                            icon={<DeleteOutlined />}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      onClick={moveImageUp}
                      disabled={selectedImages.length <= 1}
                      icon={<UpOutlined />}
                    >
                      <FormattedMessage id="tools.imageToGifConverter.preview.moveUp" />
                    </Button>
                    <Button
                      onClick={moveImageDown}
                      disabled={selectedImages.length <= 1}
                      icon={<DownOutlined />}
                    >
                      <FormattedMessage id="tools.imageToGifConverter.preview.moveDown" />
                    </Button>
                    <Button
                      onClick={reverseImages}
                      disabled={selectedImages.length <= 1}
                      icon={<SwapOutlined />}
                    >
                      <FormattedMessage id="tools.imageToGifConverter.preview.reverse" />
                    </Button>
                    <Button
                      onClick={shuffleImages}
                      disabled={selectedImages.length <= 1}
                      icon={<ReloadOutlined />}
                    >
                      <FormattedMessage id="tools.imageToGifConverter.preview.shuffle" />
                    </Button>
                  </div>
                </div>
              </Col>

              {/* Controls */}
              <Col xs={24} lg={8}>
                <div className="space-y-4">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Button
                      onClick={generateGif}
                      loading={isProcessing}
                      type="primary"
                      size="large"
                      block
                    >
                      {isProcessing ? (
                        <FormattedMessage id="common.loading" />
                      ) : (
                        <FormattedMessage id="tools.imageToGifConverter.actions.generateGif" />
                      )}
                    </Button>
                    <Button onClick={clearAll} danger block>
                      <FormattedMessage id="common.clear" />
                    </Button>
                  </Space>

                  {/* Loop Count */}
                  <div className="space-y-2">
                    <div>
                      <FormattedMessage id="tools.imageToGifConverter.settings.loopCount" />
                    </div>
                    <div className="flex items-center gap-2">
                      <InputNumber
                        value={gifSettings.loopCount}
                        onChange={(value) => {
                          if (value !== null && value >= 0 && value <= 100) {
                            gifSettings.loopCount = value;
                          }
                        }}
                        min={0}
                        max={100}
                        className="w-full"
                      />
                      <span className="text-sm text-slate-500">
                        (0 ={" "}
                        <FormattedMessage id="tools.imageToGifConverter.settings.infinite" />
                        )
                      </span>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <Card className="bg-white/5 border-slate-700 mb-8">
            <div className="text-center">
              <div className="relative mx-auto mb-4">
                <div className="w-16 h-16 border-4 border-slate-700 border-t-primary-500 rounded-full animate-spin"></div>
                <div
                  className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-primary-400 rounded-full animate-spin"
                  style={{
                    animationDirection: "reverse",
                    animationDuration: "1s",
                  }}
                ></div>
              </div>
              <Title level={3} className="mb-2">
                <FormattedMessage id="tools.imageToGifConverter.processing.title" />
              </Title>
              <Text className="text-slate-300">
                <FormattedMessage id="tools.imageToGifConverter.processing.description" />
              </Text>
              <div className="mt-4 rounded-full h-2 bg-slate-700">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
              <Text className="text-sm text-slate-400 mt-2">
                {processingProgress}%
              </Text>
            </div>
          </Card>
        )}

        {/* Result Section */}
        {generatedGif && (
          <Card
            className="bg-white/5 border-slate-700 mb-8"
            title={
              <FormattedMessage id="tools.imageToGifConverter.result.title" />
            }
          >
            <div className="text-center">
              <img
                referrerPolicy="no-referrer"
                src={generatedGif}
                alt="Generated GIF"
                className="max-w-full h-auto mx-auto rounded-xl mb-4 border border-slate-600"
                style={{ maxHeight: "400px" }}
              />

              <div className="flex justify-center gap-4">
                <Button
                  onClick={downloadGif}
                  type="primary"
                  icon={<DownloadOutlined />}
                  size="large"
                >
                  <FormattedMessage id="tools.imageToGifConverter.result.download" />
                </Button>
                <Button onClick={resetTool} size="large">
                  <FormattedMessage id="tools.imageToGifConverter.result.createNew" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Tips Section */}
        <Card className="bg-warning-500/10 border-l-4 border-warning-500 mb-8">
          <div className="flex">
            <div className="flex-shrink-0">
              <Tag color="warning" className="text-xl">
                !
              </Tag>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-warning-400">
                <FormattedMessage id="tools.imageToGifConverter.tips.title" />
              </h3>
              <div className="mt-2 text-sm">
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <FormattedMessage id="tools.imageToGifConverter.tips.tip1" />
                  </li>
                  <li>
                    <FormattedMessage id="tools.imageToGifConverter.tips.tip2" />
                  </li>
                  <li>
                    <FormattedMessage id="tools.imageToGifConverter.tips.tip3" />
                  </li>
                  <li>
                    <FormattedMessage id="tools.imageToGifConverter.tips.tip4" />
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </Space>
    </div>
  );
};

export default ImageToGifConverter;
