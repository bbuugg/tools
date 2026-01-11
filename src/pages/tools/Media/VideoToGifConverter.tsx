import {
    DeleteOutlined,
    DownloadOutlined,
    PlayCircleOutlined,
    PlusOutlined,
    StopOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import {
    Alert,
    Button,
    Card,
    Input,
    InputNumber,
    Select,
    Space,
    Tag,
    Typography,
    message,
} from "antd";
import React, { useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
// @ts-expect-error No type definitions available for gif.js library
import GIF from "gif.js";

const { Title, Text } = Typography;
const { Option } = Select;

interface GifSettings {
  width: number;
  quality: "high" | "medium" | "low";
  fps: number;
}

interface TextOverlay {
  content: string;
  startTime: number;
  endTime: number;
  fontSize: number;
  color: string;
  position: "top" | "center" | "bottom";
}

interface TimeRange {
  start: number;
  end: number;
}

const VideoToGifConverter: React.FC = () => {
  const intl = useIntl();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [generatedGif, setGeneratedGif] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);

  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");

  const [gifSettings, setGifSettings] = useState<GifSettings>({
    width: 300,
    quality: "medium",
    fps: 15,
  });

  const [timeRange, setTimeRange] = useState<TimeRange>({
    start: 0,
    end: 0,
  });

  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);

  // Handle paste events
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf("video") !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            const file = new File([blob], `pasted-video-${Date.now()}.mp4`, {
              type: blob.type,
            });
            handleVideoFile(file);
            message.success(
              intl.formatMessage({
                id: "tools.videoToGifConverter.messages.filePasted",
              })
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
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
      if (generatedGif) {
        URL.revokeObjectURL(generatedGif);
      }
    };
  }, [videoUrl, generatedGif]);

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleVideoFile(files[0]);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleVideoFile(files[0]);
    }

    // Reset input to allow selecting the same file again
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleVideoFile = (file: File) => {
    if (!file.type.startsWith("video/")) {
      message.error(
        intl.formatMessage({
          id: "tools.videoToGifConverter.errors.invalidFile",
        })
      );
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      // 100MB limit
      message.error(
        intl.formatMessage({
          id: "tools.videoToGifConverter.errors.fileTooLarge",
        })
      );
      return;
    }

    setSelectedVideo(file);
    const newVideoUrl = URL.createObjectURL(file);
    setVideoUrl(newVideoUrl);
    resetCapture();

    message.success(
      intl.formatMessage({
        id: "tools.videoToGifConverter.messages.fileLoaded",
      })
    );
  };

  const onVideoLoaded = () => {
    if (videoPlayerRef.current) {
      const duration = videoPlayerRef.current.duration;
      setVideoDuration(duration);
      // Set default time range: start at 0, end at min(15s or video duration)
      setTimeRange({
        start: 0,
        end: Math.min(duration, 15),
      });
    }
  };

  const onTimeUpdate = () => {
    if (videoPlayerRef.current) {
      const time = videoPlayerRef.current.currentTime;
      setCurrentTime(time);
    }
  };

  // Time range controls
  const setCurrentTimeAsStart = () => {
    setTimeRange((prev) => ({
      ...prev,
      start: currentTime,
    }));
  };

  const setCurrentTimeAsEnd = () => {
    setTimeRange((prev) => ({
      ...prev,
      end: currentTime,
    }));
  };

  // Text overlay controls
  const addTextOverlay = () => {
    setTextOverlays((prev) => [
      ...prev,
      {
        content: "",
        startTime: currentTime,
        endTime: Math.min(currentTime + 2, videoDuration),
        fontSize: 24,
        color: "#ffffff",
        position: "bottom",
      },
    ]);
  };

  const removeTextOverlay = (index: number) => {
    setTextOverlays((prev) => prev.filter((_, i) => i !== index));
  };

  // Update text overlay
  const updateTextOverlay = (
    index: number,
    field: keyof TextOverlay,
    value: string | number
  ) => {
    setTextOverlays((prev) =>
      prev.map((overlay, i) =>
        i === index ? { ...overlay, [field]: value } : overlay
      )
    );
  };

  // Capture and processing
  const startCapture = () => {
    setIsCapturing(true);
    setCapturedFrames([]);

    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = timeRange.start;
      videoPlayerRef.current.play();
    }
  };

  const stopCapture = () => {
    setIsCapturing(false);

    if (videoPlayerRef.current) {
      videoPlayerRef.current.pause();
    }
  };

  const resetCapture = () => {
    setIsCapturing(false);
    setCapturedFrames([]);
    setGeneratedGif("");
    setProcessingProgress(0);
  };

  const generateGif = async () => {
    if (!videoPlayerRef.current || !selectedVideo) {
      message.error(
        intl.formatMessage({
          id: "tools.videoToGifConverter.errors.noVideoSelected",
        })
      );
      return;
    }

    // Validate time range
    if (timeRange.start >= timeRange.end) {
      message.error(
        intl.formatMessage({
          id: "tools.videoToGifConverter.errors.invalidTimeRange",
        })
      );
      return;
    }

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      await createGifFromVideo();
      message.success(
        intl.formatMessage({
          id: "tools.videoToGifConverter.messages.gifGenerated",
        })
      );
    } catch (err) {
      console.error("Error generating GIF:", err);
      message.error(
        intl.formatMessage({
          id: "tools.videoToGifConverter.errors.processingFailed",
        }) +
          ": " +
          (err as Error).message
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const createGifFromVideo = async () => {
    if (!videoPlayerRef.current) {
      throw new Error("Video player not initialized");
    }

    // Check if video is loaded
    if (videoPlayerRef.current.readyState < 2) {
      throw new Error(
        "Video not loaded properly. Please wait for the video to load completely."
      );
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error(
        "Unable to get canvas context. Your browser may not support this feature."
      );
    }

    // Set canvas dimensions
    canvas.width = gifSettings.width;
    canvas.height =
      (videoPlayerRef.current.videoHeight / videoPlayerRef.current.videoWidth) *
      gifSettings.width;

    // Validate dimensions
    if (canvas.width <= 0 || canvas.height <= 0) {
      throw new Error(
        "Invalid video dimensions. Please check your video file."
      );
    }

    // Configure GIF quality based on settings
    const qualityMap = {
      high: 1,
      medium: 10,
      low: 20,
    };

    // Create GIF with improved worker handling
    const gif = new GIF({
      workers: 2,
      quality: qualityMap[gifSettings.quality],
      width: canvas.width,
      height: canvas.height,
      workerScript: "/gif.worker.js",
    });

    const duration = Math.min(timeRange.end - timeRange.start, 15); // Limit to 15 seconds
    const frameInterval = 1 / gifSettings.fps;
    const totalFrames = Math.floor(duration * gifSettings.fps);
    let processedFrames = 0;

    // Extract frames
    for (
      let time = timeRange.start;
      time < timeRange.end && time < timeRange.start + 15;
      time += frameInterval
    ) {
      try {
        videoPlayerRef.current.currentTime = time;
        // Wait for seek to complete
        await new Promise((resolve) => {
          const onSeeked = () => {
            videoPlayerRef.current?.removeEventListener("seeked", onSeeked);
            resolve(void 0);
          };
          videoPlayerRef.current?.addEventListener("seeked", onSeeked);
          // Fallback timeout
          setTimeout(resolve, 500);
        });

        // Draw video frame
        ctx.drawImage(
          videoPlayerRef.current,
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Add text overlays for this time
        textOverlays.forEach((overlay) => {
          if (
            time >= overlay.startTime &&
            time <= overlay.endTime &&
            overlay.content
          ) {
            ctx.save();

            // Configure text styling
            ctx.fillStyle = overlay.color;
            ctx.font = `bold ${overlay.fontSize}px Arial`;
            ctx.textAlign = "center";
            ctx.strokeStyle = "rgba(0,0,0,0.8)";
            ctx.lineWidth = 2;

            // Calculate text position
            let y = canvas.height / 2;
            if (overlay.position === "top") y = overlay.fontSize + 20;
            if (overlay.position === "bottom") y = canvas.height - 20;

            const x = canvas.width / 2;

            // Draw text with stroke for better visibility
            ctx.strokeText(overlay.content, x, y);
            ctx.fillText(overlay.content, x, y);

            ctx.restore();
          }
        });

        // Add frame to GIF
        gif.addFrame(canvas, { copy: true, delay: frameInterval * 1000 });

        processedFrames++;
        setProcessingProgress(Math.round((processedFrames / totalFrames) * 80)); // 80% for frame extraction
      } catch (err) {
        console.error("Error processing frame at time:", time, err);
        // Continue with next frame instead of stopping the whole process
      }
    }

    // Render GIF
    return new Promise<void>((resolve, reject) => {
      gif.on("progress", (progress: number) => {
        setProcessingProgress(80 + Math.round(progress * 20)); // Remaining 20% for GIF rendering
      });

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
    });
  };

  const downloadGif = () => {
    if (!generatedGif) return;

    const link = document.createElement("a");
    link.href = generatedGif;
    link.download = `video-to-gif-${Date.now()}.gif`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    setSelectedVideo(null);
    setVideoUrl("");
    resetCapture();
    setTextOverlays([]);
    setTimeRange({
      start: 0,
      end: 0,
    });
    setVideoDuration(0);

    // Revoke object URLs to free memory
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    if (generatedGif) {
      URL.revokeObjectURL(generatedGif);
    }

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
          <FormattedMessage id="tools.videoToGifConverter.name" />
        </Title>
        <Text className="text-lg">
          <FormattedMessage id="tools.videoToGifConverter.description" />
        </Text>
      </div>

      <Space orientation="vertical" style={{ width: "100%" }}>
        {/* How to use */}
        <Card className="bg-white/5 border-slate-700 mb-8">
          <Alert
            message={
              <div>
                <strong>
                  <FormattedMessage id="tools.videoToGifConverter.howToUse.title" />
                </strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>
                    <FormattedMessage id="tools.videoToGifConverter.howToUse.step1" />
                  </li>
                  <li>
                    <FormattedMessage id="tools.videoToGifConverter.howToUse.step2" />
                  </li>
                  <li>
                    <FormattedMessage id="tools.videoToGifConverter.howToUse.step3" />
                  </li>
                  <li>
                    <FormattedMessage id="tools.videoToGifConverter.howToUse.step4" />
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
            <FormattedMessage id="tools.videoToGifConverter.upload.title" />
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
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-primary-500 bg-primary-500/10"
                  : "border-slate-600/50 hover:border-primary-500/50"
              }`}
            >
              <div className="text-slate-500 text-4xl mb-4">🎥</div>
              <p className="text-slate-400 mb-4">
                <FormattedMessage id="tools.videoToGifConverter.upload.dragDrop" />
              </p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="video/*"
                className="hidden"
              />
              <Button
                icon={<UploadOutlined />}
                className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-500"
              >
                <FormattedMessage id="tools.videoToGifConverter.upload.selectFile" />
              </Button>
              <p className="text-xs text-slate-500 mt-2">
                <FormattedMessage id="tools.videoToGifConverter.upload.supportedFormats" />
              </p>
            </div>
          </div>

          {/* GIF Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <div className="block text-sm font-medium mb-2">
                <FormattedMessage id="tools.videoToGifConverter.settings.width" />
              </div>
              <InputNumber
                value={gifSettings.width}
                onChange={(value) => {
                  if (value !== null && value >= 100 && value <= 800) {
                    setGifSettings((prev) => ({ ...prev, width: value }));
                  }
                }}
                min={100}
                max={800}
                className="w-full"
              />
            </div>
            <div>
              <div className="block text-sm font-medium mb-2">
                <FormattedMessage id="tools.videoToGifConverter.settings.quality" />
              </div>
              <Select
                value={gifSettings.quality}
                onChange={(value) => {
                  setGifSettings((prev) => ({ ...prev, quality: value }));
                }}
                className="w-full"
              >
                <Option value="high">
                  <FormattedMessage id="tools.videoToGifConverter.settings.qualityOptions.high" />
                </Option>
                <Option value="medium">
                  <FormattedMessage id="tools.videoToGifConverter.settings.qualityOptions.medium" />
                </Option>
                <Option value="low">
                  <FormattedMessage id="tools.videoToGifConverter.settings.qualityOptions.low" />
                </Option>
              </Select>
            </div>
            <div>
              <div className="block text-sm font-medium mb-2">
                <FormattedMessage id="tools.videoToGifConverter.settings.fps" />
              </div>
              <InputNumber
                value={gifSettings.fps}
                onChange={(value) => {
                  if (value !== null && value >= 5 && value <= 30) {
                    setGifSettings((prev) => ({ ...prev, fps: value }));
                  }
                }}
                min={5}
                max={30}
                className="w-full"
              />
            </div>
          </div>
        </Card>

        {/* Video Preview Section */}
        {selectedVideo && (
          <Card
            className="bg-white/5 border-slate-700 mb-8"
            title={
              <FormattedMessage id="tools.videoToGifConverter.preview.title" />
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Video Player */}
              <div>
                {!videoDuration ? (
                  <div className="flex items-center justify-center w-full h-64 rounded-xl">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="mt-2 text-slate-400">
                        <FormattedMessage id="tools.videoToGifConverter.loadingVideo" />
                      </p>
                    </div>
                  </div>
                ) : (
                  <video
                    ref={videoPlayerRef}
                    src={videoUrl}
                    controls
                    onLoadedMetadata={onVideoLoaded}
                    onTimeUpdate={onTimeUpdate}
                    className="w-full rounded-xl"
                  />
                )}

                {/* Video Controls */}
                <div className="mt-4 space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={startCapture}
                      disabled={isCapturing || isProcessing}
                      icon={<PlayCircleOutlined />}
                      type="primary"
                    >
                      <FormattedMessage id="tools.videoToGifConverter.actions.startCapture" />
                    </Button>
                    <Button
                      onClick={stopCapture}
                      disabled={!isCapturing || isProcessing}
                      icon={<StopOutlined />}
                      danger
                    >
                      <FormattedMessage id="tools.videoToGifConverter.actions.stopCapture" />
                    </Button>
                    <Button
                      onClick={generateGif}
                      disabled={isProcessing}
                      type="primary"
                      loading={isProcessing}
                    >
                      <FormattedMessage
                        id={
                          isProcessing
                            ? "common.loading"
                            : "tools.videoToGifConverter.actions.generateGif"
                        }
                      />
                    </Button>
                  </div>

                  {/* Time Range Selection */}
                  <div className="space-y-2">
                    <div className="block text-sm font-medium">
                      <FormattedMessage id="tools.videoToGifConverter.timeRange.title" />
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-400">
                          <FormattedMessage id="tools.videoToGifConverter.timeRange.start" />
                          :
                        </label>
                        <InputNumber
                          value={timeRange.start}
                          onChange={(value) => {
                            if (
                              value !== null &&
                              value >= 0 &&
                              value <= videoDuration
                            ) {
                              setTimeRange((prev) => ({
                                ...prev,
                                start: value,
                              }));
                            }
                          }}
                          min={0}
                          max={videoDuration}
                          step={0.1}
                          className="w-20"
                        />
                        <span className="text-sm text-slate-500">s</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-slate-400">
                          <FormattedMessage id="tools.videoToGifConverter.timeRange.end" />
                          :
                        </label>
                        <InputNumber
                          value={timeRange.end}
                          onChange={(value) => {
                            if (
                              value !== null &&
                              value >= timeRange.start &&
                              value <= videoDuration
                            ) {
                              setTimeRange((prev) => ({ ...prev, end: value }));
                            }
                          }}
                          min={timeRange.start}
                          max={videoDuration}
                          step={0.1}
                          className="w-20"
                        />
                        <span className="text-sm text-slate-500">s</span>
                      </div>
                      <Button onClick={setCurrentTimeAsStart} size="small">
                        <FormattedMessage id="tools.videoToGifConverter.timeRange.setStart" />
                      </Button>
                      <Button onClick={setCurrentTimeAsEnd} size="small">
                        <FormattedMessage id="tools.videoToGifConverter.timeRange.setEnd" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Overlay Controls */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-semibold text-slate-100">
                    <FormattedMessage id="tools.videoToGifConverter.textOverlay.title" />
                  </h4>
                  <Button
                    onClick={addTextOverlay}
                    icon={<PlusOutlined />}
                    size="small"
                    type="primary"
                  >
                    <FormattedMessage id="tools.videoToGifConverter.textOverlay.add" />
                  </Button>
                </div>

                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {textOverlays.map((text, index) => (
                    <div
                      key={index}
                      className="border border-slate-700/50 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          <FormattedMessage
                            id="tools.videoToGifConverter.textOverlay.text"
                            values={{ number: index + 1 }}
                          />
                        </span>
                        <Button
                          onClick={() => removeTextOverlay(index)}
                          icon={<DeleteOutlined />}
                          size="small"
                          danger
                        >
                          <FormattedMessage id="common.remove" />
                        </Button>
                      </div>

                      <Input
                        value={text.content}
                        onChange={(e) =>
                          updateTextOverlay(index, "content", e.target.value)
                        }
                        placeholder={intl.formatMessage({
                          id: "tools.videoToGifConverter.textOverlay.placeholder",
                        })}
                        className="w-full"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">
                            <FormattedMessage id="tools.videoToGifConverter.textOverlay.startTime" />
                          </label>
                          <InputNumber
                            value={text.startTime}
                            onChange={(value) => {
                              if (
                                value !== null &&
                                value >= 0 &&
                                value <= videoDuration
                              ) {
                                updateTextOverlay(index, "startTime", value);
                              }
                            }}
                            min={0}
                            max={videoDuration}
                            step={0.1}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">
                            <FormattedMessage id="tools.videoToGifConverter.textOverlay.endTime" />
                          </label>
                          <InputNumber
                            value={text.endTime}
                            onChange={(value) => {
                              if (
                                value !== null &&
                                value >= text.startTime &&
                                value <= videoDuration
                              ) {
                                updateTextOverlay(index, "endTime", value);
                              }
                            }}
                            min={text.startTime}
                            max={videoDuration}
                            step={0.1}
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">
                            <FormattedMessage id="tools.videoToGifConverter.textOverlay.fontSize" />
                          </label>
                          <InputNumber
                            value={text.fontSize}
                            onChange={(value) => {
                              if (
                                value !== null &&
                                value >= 12 &&
                                value <= 48
                              ) {
                                updateTextOverlay(index, "fontSize", value);
                              }
                            }}
                            min={12}
                            max={48}
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">
                            <FormattedMessage id="tools.videoToGifConverter.textOverlay.color" />
                          </label>
                          <input
                            type="color"
                            value={text.color}
                            onChange={(e) =>
                              updateTextOverlay(index, "color", e.target.value)
                            }
                            className="w-full h-8 border border-slate-600/50 rounded cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">
                            <FormattedMessage id="tools.videoToGifConverter.textOverlay.position" />
                          </label>
                          <Select
                            value={text.position}
                            onChange={(value) =>
                              updateTextOverlay(index, "position", value)
                            }
                            className="w-full"
                          >
                            <Option value="top">
                              <FormattedMessage id="tools.videoToGifConverter.textOverlay.positions.top" />
                            </Option>
                            <Option value="center">
                              <FormattedMessage id="tools.videoToGifConverter.textOverlay.positions.center" />
                            </Option>
                            <Option value="bottom">
                              <FormattedMessage id="tools.videoToGifConverter.textOverlay.positions.bottom" />
                            </Option>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <Card className="bg-white/5 border-slate-700 mb-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">
                <FormattedMessage id="tools.videoToGifConverter.processing.title" />
              </h3>
              <p className="text-slate-400">
                <FormattedMessage id="tools.videoToGifConverter.processing.description" />
              </p>
              <div className="mt-4 rounded-full h-2 bg-slate-700">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                {processingProgress}%
              </p>

              {/* Preview of generated GIF */}
              {generatedGif && (
                <div className="mt-6">
                  <h4 className="text-md font-medium mb-2">
                    <FormattedMessage id="tools.videoToGifConverter.processing.preview" />
                  </h4>
                  <img
                    referrerPolicy="no-referrer"
                    src={generatedGif}
                    alt="GIF Preview"
                    className="max-w-full h-auto mx-auto rounded-xl shadow-dark-lg"
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
            title={
              <FormattedMessage id="tools.videoToGifConverter.result.title" />
            }
          >
            <div className="text-center">
              <img
                referrerPolicy="no-referrer"
                src={generatedGif}
                alt="Generated GIF"
                className="max-w-full h-auto mx-auto rounded-xl shadow-dark-lg mb-4"
              />

              <div className="flex justify-center gap-4">
                <Button
                  onClick={downloadGif}
                  icon={<DownloadOutlined />}
                  type="primary"
                >
                  <FormattedMessage id="tools.videoToGifConverter.result.download" />
                </Button>
                <Button onClick={resetTool}>
                  <FormattedMessage id="tools.videoToGifConverter.result.createNew" />
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
                <FormattedMessage id="tools.videoToGifConverter.tips.title" />
              </h3>
              <div className="mt-2 text-sm text-warning-200">
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <FormattedMessage id="tools.videoToGifConverter.tips.tip1" />
                  </li>
                  <li>
                    <FormattedMessage id="tools.videoToGifConverter.tips.tip2" />
                  </li>
                  <li>
                    <FormattedMessage id="tools.videoToGifConverter.tips.tip3" />
                  </li>
                  <li>
                    <FormattedMessage id="tools.videoToGifConverter.tips.tip4" />
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

export default VideoToGifConverter;
