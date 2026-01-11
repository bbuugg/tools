import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  Button,
  Typography,
  InputNumber,
  Select,
  message,
  Row,
  Col,
  Alert,
  Progress,
  Space,
} from "antd";
import { FormattedMessage, useIntl } from "react-intl";
import {
  DownloadOutlined,
  DeleteOutlined,
  UpOutlined,
  DownOutlined,
  SwapOutlined,
  ReloadOutlined,
  ClearOutlined,
} from "@ant-design/icons";
// @ts-expect-error No type definitions available for gif.js
import GIF from "gif.js";
import { parseGIF, decompressFrames } from "gifuct-js";

const { Title, Text } = Typography;
const { Option } = Select;

interface SelectedGif {
  file: File;
  url: string;
  name: string;
  width: number;
  height: number;
}

interface GifFrame {
  dataUrl: string;
  delay: number;
  imageData: ImageData;
  left: number;
  top: number;
  width: number;
  height: number;
  dispose: number;
}

interface GifSettings {
  width: number;
  quality: "high" | "medium" | "low";
  fps: number;
}

const GifEditor: React.FC = () => {
  const intl = useIntl();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [generatedGif, setGeneratedGif] = useState("");
  const [selectedGif, setSelectedGif] = useState<SelectedGif | null>(null);
  const [frames, setFrames] = useState<GifFrame[]>([]);

  const gifSettings = useRef<GifSettings>({
    width: 300,
    quality: "medium",
    fps: 10,
  }).current;

  // Handle paste event for GIF files
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type === "image/gif") {
          const blob = item.getAsFile();
          if (blob) {
            // Create a File object from the blob
            const file = new File([blob], `pasted-gif-${Date.now()}.gif`, {
              type: blob.type,
            });
            handleGifFile(file);
            message.success(
              intl.formatMessage({ id: "tools.gifEditor.messages.filePasted" })
            );
            break;
          }
        }
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
      // Clean up object URL for selected GIF
      if (selectedGif?.url) {
        URL.revokeObjectURL(selectedGif.url);
      }

      // Clean up generated GIF URL
      if (generatedGif) {
        URL.revokeObjectURL(generatedGif);
      }
    };
  }, [selectedGif, generatedGif]);

  // Parse GIF frames
  const parseGifFrames = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const gif = parseGIF(arrayBuffer);

      // Get dimensions from the GIF header
      let gifWidth = 0;
      let gifHeight = 0;
      if (gif && gif.lsd) {
        gifWidth = gif.lsd.width;
        gifHeight = gif.lsd.height;
      }

      // Decompress frames with buildPatch = true to get full RGBA frame data
      const decompressedFrames = decompressFrames(gif, true);

      // Convert frames to data URLs
      const newFrames: GifFrame[] = [];
      for (const frame of decompressedFrames) {
        // Validate frame dimensions
        if (frame.dims.width <= 0 || frame.dims.height <= 0) {
          console.warn("Skipping frame with invalid dimensions");
          continue;
        }

        // Create a full canvas for this frame to preserve positioning
        const canvas = document.createElement("canvas");
        canvas.width = gifWidth || frame.dims.width;
        canvas.height = gifHeight || frame.dims.height;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          // Create ImageData directly from the patch (which is full RGBA data when buildPatch=true)
          const imageData = new ImageData(
            new Uint8ClampedArray(frame.patch),
            frame.dims.width,
            frame.dims.height
          );

          // Draw the frame at its correct position
          ctx.putImageData(
            imageData,
            frame.dims.left || 0,
            frame.dims.top || 0
          );

          // Convert to data URL with transparency preserved
          const dataUrl = canvas.toDataURL("image/png");

          newFrames.push({
            dataUrl,
            delay: frame.delay,
            imageData,
            left: frame.dims.left || 0,
            top: frame.dims.top || 0,
            width: frame.dims.width,
            height: frame.dims.height,
            dispose: frame.disposalType || 0,
          });
        }
      }

      setFrames(newFrames);

      // Update selectedGif with dimensions if needed
      if (selectedGif && (!selectedGif.width || !selectedGif.height)) {
        setSelectedGif((prev) =>
          prev
            ? {
                ...prev,
                width: gifWidth || newFrames[0]?.width || 0,
                height: gifHeight || newFrames[0]?.height || 0,
              }
            : null
        );
      }
    } catch (err) {
      console.error("Error parsing GIF frames:", err);
      message.error(
        intl.formatMessage({ id: "tools.gifEditor.errors.frameParsingFailed" })
      );
    }
  };

  // Handle GIF file
  const handleGifFile = async (file: File) => {
    if (file.type !== "image/gif") {
      message.error(
        intl.formatMessage({ id: "tools.gifEditor.errors.invalidFile" })
      );
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      // 50MB limit
      message.error(
        intl.formatMessage({ id: "tools.gifEditor.errors.fileTooLarge" })
      );
      return;
    }

    try {
      // Clear previous data
      clearAll();

      // Set selected GIF
      const url = URL.createObjectURL(file);
      const newSelectedGif: SelectedGif = {
        file,
        url,
        name: file.name,
        width: 0,
        height: 0,
      };
      setSelectedGif(newSelectedGif);

      // Parse GIF frames
      await parseGifFrames(file);

      message.success(
        intl.formatMessage({ id: "tools.gifEditor.messages.fileLoaded" })
      );
    } catch (err) {
      console.error("Error handling GIF file:", err);
      message.error(
        intl.formatMessage({ id: "tools.gifEditor.errors.fileProcessing" })
      );
    }
  };

  // Handle file drop
  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const gifFiles = Array.from(files).filter(
        (file) => file.type === "image/gif"
      );
      if (gifFiles.length > 0) {
        handleGifFile(gifFiles[0]);
      } else {
        message.error(
          intl.formatMessage({ id: "tools.gifEditor.errors.noGif" })
        );
      }
    }
  };

  // Handle file select
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const gifFiles = Array.from(files).filter(
        (file) => file.type === "image/gif"
      );
      if (gifFiles.length > 0) {
        handleGifFile(gifFiles[0]);
      } else {
        message.error(
          intl.formatMessage({ id: "tools.gifEditor.errors.noGif" })
        );
      }
    }

    // Reset input to allow selecting the same file again
    if (event.target) {
      event.target.value = "";
    }
  };

  // Remove a frame
  const removeFrame = (index: number) => {
    setFrames((prev) => prev.filter((_, i) => i !== index));
  };

  // Clear all data
  const clearAll = () => {
    // Revoke object URLs
    if (selectedGif?.url) {
      URL.revokeObjectURL(selectedGif.url);
    }
    if (generatedGif) {
      URL.revokeObjectURL(generatedGif);
    }

    setSelectedGif(null);
    setFrames([]);
    setGeneratedGif("");
    setProcessingProgress(0);
  };

  // Update frame delay
  const updateFrameDelay = (index: number, delay: number) => {
    if (!isNaN(delay) && delay >= 20) {
      setFrames((prev) =>
        prev.map((frame, i) => (i === index ? { ...frame, delay } : frame))
      );
    }
  };

  // Move frame up in the list
  const moveFrameUp = () => {
    if (frames.length <= 1) return;

    const newFrames = [...frames];
    const first = newFrames.shift();
    if (first) {
      newFrames.push(first);
      setFrames(newFrames);
    }
  };

  // Move frame down in the list
  const moveFrameDown = () => {
    if (frames.length <= 1) return;

    const newFrames = [...frames];
    const last = newFrames.pop();
    if (last) {
      newFrames.unshift(last);
      setFrames(newFrames);
    }
  };

  // Reverse the order of frames
  const reverseFrames = () => {
    if (frames.length <= 1) return;
    setFrames((prev) => [...prev].reverse());
  };

  // Shuffle frames
  const shuffleFrames = () => {
    if (frames.length <= 1) return;

    const shuffled = [...frames];
    // Fisher-Yates shuffle algorithm
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setFrames(shuffled);
  };

  // Generate GIF from frames
  const generateGif = async () => {
    if (!selectedGif || frames.length === 0) {
      message.error(
        intl.formatMessage({ id: "tools.gifEditor.errors.noFrames" })
      );
      return;
    }

    // Additional validation to ensure we have valid frames
    if (!frames.some((frame) => frame.dataUrl && frame.delay > 0)) {
      message.error(
        intl.formatMessage({ id: "tools.gifEditor.errors.noFrames" })
      );
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      await createGifFromFrames();
      message.success(
        intl.formatMessage({ id: "tools.gifEditor.messages.gifGenerated" })
      );
    } catch (err) {
      console.error("Error generating GIF:", err);
      message.error(
        intl.formatMessage({ id: "tools.gifEditor.errors.processingFailed" }) +
          ": " +
          (err as Error).message
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Create GIF from frames
  const createGifFromFrames = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!selectedGif) {
        reject(new Error("No GIF selected"));
        return;
      }

      // Validate that we have frames to process
      if (frames.length === 0) {
        reject(new Error("No frames to process. Please try another GIF file."));
        return;
      }

      // Use original GIF dimensions
      const gifWidth = selectedGif.width;
      const gifHeight = selectedGif.height;

      // Validate dimensions
      if (!gifWidth || !gifHeight || gifWidth <= 0 || gifHeight <= 0) {
        reject(
          new Error("Invalid GIF dimensions. Please try another GIF file.")
        );
        return;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (!ctx) {
        reject(
          new Error(
            "Unable to get canvas context. Your browser may not support this feature."
          )
        );
        return;
      }

      // Set canvas dimensions to match original GIF exactly
      canvas.width = gifWidth;
      canvas.height = gifHeight;

      // Configure GIF quality based on settings
      const qualityMap = {
        high: 1,
        medium: 10,
        low: 20,
      };

      // Create GIF with original dimensions and transparency support
      const gif = new GIF({
        workers: 2,
        quality: qualityMap[gifSettings.quality],
        width: gifWidth,
        height: gifHeight,
        workerScript: "/gif.worker.js",
        transparent: 0x00000000, // Explicitly set transparent color as 0x00000000 (RGBA)
      });

      const totalFrames = frames.length;
      let processedFrames = 0;

      // Process each frame sequentially using promises
      const processNextFrame = (index: number) => {
        if (index >= frames.length) {
          // All frames processed, render the GIF
          if (processedFrames === 0) {
            reject(
              new Error(
                "No frames could be processed. Please try another GIF file."
              )
            );
            return;
          }

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

        const frame = frames[index];
        const img = new Image();

        img.onload = () => {
          try {
            // Validate that the image has valid dimensions
            if (img.width <= 0 || img.height <= 0) {
              console.warn("Skipping frame with invalid dimensions");
              // Process next frame
              processNextFrame(index + 1);
              return;
            }

            // Draw the image on the full canvas
            ctx.drawImage(img, 0, 0);

            // Add frame to GIF with delay in milliseconds
            gif.addFrame(canvas, { copy: true, delay: frame.delay });

            processedFrames++;
            setProcessingProgress(
              Math.round((processedFrames / totalFrames) * 100)
            );

            // Process next frame
            processNextFrame(index + 1);
          } catch (err) {
            console.error("Error processing frame:", err);
            // Continue with next frame instead of stopping the whole process
            processNextFrame(index + 1);
          }
        };

        img.onerror = () => {
          console.error("Error loading frame image");
          // Continue with next frame instead of stopping the whole process
          processNextFrame(index + 1);
        };

        img.src = frame.dataUrl;
      };

      // Start processing from the first frame
      processNextFrame(0);
    });
  };

  // Download the generated GIF
  const downloadGif = () => {
    if (!generatedGif) return;

    const link = document.createElement("a");
    link.href = generatedGif;
    link.download = `edited-gif-${Date.now()}.gif`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset the tool
  const resetTool = () => {
    clearAll();

    // Reset settings to defaults
    gifSettings.width = 300;
    gifSettings.quality = "medium";
    gifSettings.fps = 10;

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
          <FormattedMessage id="tools.gifEditor.name" />
        </Title>
        <Text className="text-lg">
          <FormattedMessage id="tools.gifEditor.description" />
        </Text>
      </div>

      <Space orientation="vertical" style={{ width: "100%" }}>
        {/* How to use */}
        <Card className="bg-white/5 border-slate-700 mb-8">
          <Alert
            message={
              <div>
                <strong>
                  <FormattedMessage id="tools.gifEditor.howToUse.title" />
                </strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>
                    <FormattedMessage id="tools.gifEditor.howToUse.step1" />
                  </li>
                  <li>
                    <FormattedMessage id="tools.gifEditor.howToUse.step2" />
                  </li>
                  <li>
                    <FormattedMessage id="tools.gifEditor.howToUse.step3" />
                  </li>
                  <li>
                    <FormattedMessage id="tools.gifEditor.howToUse.step4" />
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
          title={<FormattedMessage id="tools.gifEditor.upload.title" />}
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
              <div className="text-slate-400 text-4xl mb-4">🎞️</div>
              <p className="mb-4">
                <FormattedMessage id="tools.gifEditor.upload.dragDrop" />
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/gif"
                className="hidden"
              />
              <Button className="px-6 py-2">
                <FormattedMessage id="tools.gifEditor.upload.selectFile" />
              </Button>
              <p className="text-xs text-slate-400 mt-2">
                <FormattedMessage id="tools.gifEditor.upload.supportedFormats" />
              </p>
            </div>
          </div>

          {/* GIF Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <div className="mb-2">
                <FormattedMessage id="tools.gifEditor.settings.width" />
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
                disabled
              />
              <p className="text-xs text-slate-500 mt-1">
                <FormattedMessage id="tools.gifEditor.settings.preserveOriginal" />
              </p>
            </div>
            <div>
              <div className="mb-2">
                <FormattedMessage id="tools.gifEditor.settings.quality" />
              </div>
              <Select
                value={gifSettings.quality}
                onChange={(value) => {
                  gifSettings.quality = value;
                }}
                className="w-full"
              >
                <Option value="high">
                  <FormattedMessage id="tools.gifEditor.settings.qualityOptions.high" />
                </Option>
                <Option value="medium">
                  <FormattedMessage id="tools.gifEditor.settings.qualityOptions.medium" />
                </Option>
                <Option value="low">
                  <FormattedMessage id="tools.gifEditor.settings.qualityOptions.low" />
                </Option>
              </Select>
            </div>
            <div>
              <div className="mb-2">
                <FormattedMessage id="tools.gifEditor.settings.fps" />
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

        {/* GIF Preview Section */}
        {selectedGif && (
          <Card
            className="bg-white/5 border-slate-700 mb-8"
            title={<FormattedMessage id="tools.gifEditor.preview.title" />}
          >
            <Row gutter={[24, 24]}>
              {/* GIF Preview */}
              <Col xs={24} lg={12}>
                <div className="mb-4">
                  <h4 className="text-md font-semibold mb-3">
                    <FormattedMessage id="tools.gifEditor.preview.originalGif" />
                  </h4>
                  <div className="flex items-center justify-center w-full h-64 rounded-lg border border-slate-600 bg-slate-800">
                    {selectedGif.url ? (
                      <img
                        referrerPolicy="no-referrer"
                        src={selectedGif.url}
                        alt={selectedGif.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                        <p className="mt-2 text-slate-400">
                          <FormattedMessage id="tools.gifEditor.loadingGif" />
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-slate-400">
                    <FormattedMessage
                      id="tools.gifEditor.preview.dimensions"
                      values={{
                        width: selectedGif.width,
                        height: selectedGif.height,
                      }}
                    />
                    <span>
                      {" "}
                      <FormattedMessage id="tools.gifEditor.preview.pixels" />
                    </span>
                  </div>
                </div>
              </Col>

              {/* Frame Controls */}
              <Col xs={24} lg={12}>
                <div className="mb-4">
                  <h4 className="text-md font-semibold mb-3">
                    <FormattedMessage
                      id="tools.gifEditor.preview.frames"
                      values={{ count: frames.length }}
                    />
                  </h4>

                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {frames.map((frame, index) => (
                      <div
                        key={index}
                        className="flex items-center p-3 border border-slate-600 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden">
                          <img
                            referrerPolicy="no-referrer"
                            src={frame.dataUrl}
                            alt={`Frame ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-3 flex-grow min-w-0">
                          <Text className="text-sm font-medium">
                            <FormattedMessage
                              id="tools.gifEditor.preview.frame"
                              values={{ number: index + 1 }}
                            />
                          </Text>
                          <Text className="text-xs text-slate-500">
                            <FormattedMessage
                              id="tools.gifEditor.preview.delay"
                              values={{ delay: frame.delay }}
                            />
                            ms
                          </Text>
                          <Text className="text-xs text-slate-500">
                            Position: ({frame.left}, {frame.top}) {frame.width}×
                            {frame.height}
                          </Text>
                        </div>
                        <div className="flex items-center">
                          <InputNumber
                            value={frame.delay}
                            onChange={(value) => {
                              if (value !== null) {
                                updateFrameDelay(index, value);
                              }
                            }}
                            min={20}
                            max={5000}
                            step={10}
                            className="w-20 text-xs"
                          />
                          <span className="ml-1 text-xs text-slate-500">
                            ms
                          </span>
                          <Button
                            onClick={() => removeFrame(index)}
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
                      onClick={moveFrameUp}
                      disabled={frames.length <= 1}
                      icon={<UpOutlined />}
                    >
                      <FormattedMessage id="tools.gifEditor.preview.moveUp" />
                    </Button>
                    <Button
                      onClick={moveFrameDown}
                      disabled={frames.length <= 1}
                      icon={<DownOutlined />}
                    >
                      <FormattedMessage id="tools.gifEditor.preview.moveDown" />
                    </Button>
                    <Button
                      onClick={reverseFrames}
                      disabled={frames.length <= 1}
                      icon={<SwapOutlined />}
                    >
                      <FormattedMessage id="tools.gifEditor.preview.reverse" />
                    </Button>
                    <Button
                      onClick={shuffleFrames}
                      disabled={frames.length <= 1}
                      icon={<ReloadOutlined />}
                    >
                      <FormattedMessage id="tools.gifEditor.preview.shuffle" />
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    onClick={generateGif}
                    loading={isProcessing}
                    disabled={frames.length === 0}
                    type="primary"
                    block
                  >
                    {isProcessing ? (
                      <FormattedMessage id="common.loading" />
                    ) : (
                      <FormattedMessage id="tools.gifEditor.actions.generateGif" />
                    )}
                  </Button>
                  <Button
                    onClick={clearAll}
                    icon={<ClearOutlined />}
                    danger
                    block
                  >
                    <FormattedMessage id="common.clear" />
                  </Button>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <Card className="bg-white/5 border-slate-700 mb-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <Title level={3} className="mb-2">
                <FormattedMessage id="tools.gifEditor.processing.title" />
              </Title>
              <Text className="text-slate-300">
                <FormattedMessage id="tools.gifEditor.processing.description" />
              </Text>
              <div className="mt-4">
                <Progress
                  percent={processingProgress}
                  strokeColor="#3b82f6"
                  trailColor="#1e293b"
                />
              </div>
              <Text className="text-sm text-slate-400 mt-2">
                {processingProgress}%
              </Text>

              {/* Preview of generated GIF */}
              {generatedGif && (
                <div className="mt-6">
                  <h4 className="text-md font-medium mb-2">
                    <FormattedMessage id="tools.gifEditor.processing.preview" />
                  </h4>
                  <img
                    referrerPolicy="no-referrer"
                    src={generatedGif}
                    alt="GIF Preview"
                    className="max-w-full h-auto mx-auto rounded-lg"
                    style={{ maxHeight: "200px" }}
                  />
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Result Section */}
        {generatedGif && (
          <Card
            className="bg-white/5 border-slate-700 mb-8"
            title={<FormattedMessage id="tools.gifEditor.result.title" />}
          >
            <div className="text-center">
              <img
                referrerPolicy="no-referrer"
                src={generatedGif}
                alt="Generated GIF"
                className="max-w-full h-auto mx-auto rounded-lg mb-4 border border-slate-600"
                style={{ maxHeight: "400px" }}
              />

              <div className="flex justify-center gap-4 flex-wrap">
                <Button
                  onClick={downloadGif}
                  type="primary"
                  icon={<DownloadOutlined />}
                  size="large"
                >
                  <FormattedMessage id="tools.gifEditor.result.download" />
                </Button>
                <Button onClick={resetTool} size="large">
                  <FormattedMessage id="tools.gifEditor.result.createNew" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Tips Section */}
        <Card className="bg-white/5 border-slate-700">
          <div>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <span className="mr-2">💡</span>
              <FormattedMessage id="tools.gifEditor.tips.title" />
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <FormattedMessage id="tools.gifEditor.tips.tip1" />
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <FormattedMessage id="tools.gifEditor.tips.tip2" />
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <FormattedMessage id="tools.gifEditor.tips.tip3" />
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <FormattedMessage id="tools.gifEditor.tips.tip4" />
                </span>
              </li>
            </ul>
          </div>
        </Card>
      </Space>
    </div>
  );
};

export default GifEditor;
