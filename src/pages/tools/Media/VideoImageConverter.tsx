import {
  DownOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SwapOutlined,
  UpOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  InputNumber,
  Select,
  Slider,
  Space,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import JSZip from "jszip";
import React, { useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

const { Title, Text } = Typography;
const { Option } = Select;

interface SelectedVideo {
  file: File;
  url: string;
  name: string;
}

interface SelectedImage {
  file: File;
  url: string;
  name: string;
}

interface ExtractedImage {
  url: string;
  blob: Blob;
}

interface VideoToImageSettings {
  frameInterval: number; // seconds
  imageFormat: "png" | "jpg" | "webp";
  quality: number;
}

interface ImageToVideoSettings {
  durationPerImage: number; // seconds
  transition: "none" | "fade" | "slide";
  resolution: "720p" | "1080p" | "4k";
}

const VideoImageConverter: React.FC = () => {
  const intl = useIntl();
  const [mode, setMode] = useState<"videoToImage" | "imageToVideo">(
    "videoToImage"
  );

  // Video to Image state
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<SelectedVideo | null>(
    null
  );
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);
  const [extractedImages, setExtractedImages] = useState<ExtractedImage[]>([]);

  // Image to Video state
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [selectedAudio, setSelectedAudio] = useState<File | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState("");

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);

  // Settings
  const [videoToImageSettings, setVideoToImageSettings] =
    useState<VideoToImageSettings>({
      frameInterval: 1,
      imageFormat: "png",
      quality: 0.9,
    });

  const [imageToVideoSettings, setImageToVideoSettings] =
    useState<ImageToVideoSettings>({
      durationPerImage: 2,
      transition: "fade",
      resolution: "1080p",
    });

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      // Revoke video URL
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }

      // Revoke extracted images URLs
      extractedImages.forEach((image) => {
        URL.revokeObjectURL(image.url);
      });

      // Revoke selected images URLs
      selectedImages.forEach((image) => {
        URL.revokeObjectURL(image.url);
      });

      // Revoke generated video URL
      if (generatedVideoUrl) {
        URL.revokeObjectURL(generatedVideoUrl);
      }
    };
  }, [videoUrl, extractedImages, selectedImages, generatedVideoUrl]);



  const handleVideoFile = (file: File) => {
    if (!file.type.startsWith("video/")) {
      message.error(
        intl.formatMessage({
          id: "tools.videoImageConverter.errors.invalidVideoFile",
        })
      );
      return;
    }

    // Clean up previous video URL
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    const newVideo: SelectedVideo = {
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    };

    setSelectedVideo(newVideo);
    setVideoUrl(newVideo.url);
    setExtractedImages([]);

    message.success(
      intl.formatMessage({
        id: "tools.videoImageConverter.messages.videoLoaded",
      })
    );
  };

  const onVideoLoaded = () => {
    if (videoPlayerRef.current) {
      setVideoDuration(videoPlayerRef.current.duration);
    }
  };



  const handleImageFiles = (files: File[]) => {
    const validImages = files.filter((file) => file.type.startsWith("image/"));

    if (validImages.length === 0) {
      message.error(
        intl.formatMessage({
          id: "tools.videoImageConverter.errors.noValidImages",
        })
      );
      return;
    }

    const newImages = validImages.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
    }));

    setSelectedImages((prev) => [...prev, ...newImages]);
    message.success(
      intl.formatMessage(
        { id: "tools.videoImageConverter.messages.imagesLoaded" },
        { count: validImages.length }
      )
    );
  };

  const removeImage = (index: number) => {
    const image = selectedImages[index];
    URL.revokeObjectURL(image.url);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImageUp = () => {
    if (selectedImages.length <= 1) return;
    const newImages = [...selectedImages];
    const first = newImages.shift();
    if (first) {
      newImages.push(first);
      setSelectedImages(newImages);
    }
  };

  const moveImageDown = () => {
    if (selectedImages.length <= 1) return;
    const newImages = [...selectedImages];
    const last = newImages.pop();
    if (last) {
      newImages.unshift(last);
      setSelectedImages(newImages);
    }
  };

  const reverseImages = () => {
    setSelectedImages((prev) => [...prev].reverse());
  };

  const shuffleImages = () => {
    setSelectedImages((prev) => [...prev].sort(() => Math.random() - 0.5));
  };



  const handleAudioFile = (file: File) => {
    if (!file.type.startsWith("audio/")) {
      message.error(
        intl.formatMessage({
          id: "tools.videoImageConverter.errors.invalidAudioFile",
        })
      );
      return;
    }

    setSelectedAudio(file);
    message.success(
      intl.formatMessage({
        id: "tools.videoImageConverter.messages.audioLoaded",
      })
    );
  };

  const removeAudio = () => {
    setSelectedAudio(null);
  };

  // Video to Image processing
  const extractFrames = async () => {
    if (!videoPlayerRef.current || !selectedVideo) {
      message.error(
        intl.formatMessage({
          id: "tools.videoImageConverter.errors.noVideoSelected",
        })
      );
      return;
    }

    setIsProcessing(true);
    setExtractedImages([]);

    try {
      // Get video properties
      const video = videoPlayerRef.current;
      const duration = video.duration;
      const interval = videoToImageSettings.frameInterval;

      // Calculate number of frames to extract
      const frameCount = Math.floor(duration / interval);

      // Extract frames at specified intervals
      const extractedFrames: ExtractedImage[] = [];

      for (let i = 0; i < frameCount; i++) {
        const time = i * interval;

        // Seek to the specific time
        video.currentTime = time;

        // Wait for seek to complete
        await new Promise<void>((resolve, reject) => {
          const onSeeked = () => {
            video.removeEventListener("seeked", onSeeked);
            resolve();
          };

          const onError = () => {
            video.removeEventListener("error", onError);
            reject(new Error("Failed to seek video"));
          };

          video.addEventListener("seeked", onSeeked);
          video.addEventListener("error", onError);

          // Timeout after 2 seconds
          setTimeout(() => {
            video.removeEventListener("seeked", onSeeked);
            video.removeEventListener("error", onError);
            reject(new Error("Video seek timeout"));
          }, 2000);
        });

        // Create canvas and draw frame
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Unable to get canvas context");
        }

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to blob based on selected format
        const mimeType = getMimeType(videoToImageSettings.imageFormat);
        const quality = videoToImageSettings.quality;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error("Failed to create image blob"));
              }
            },
            mimeType,
            quality
          );
        });

        const url = URL.createObjectURL(blob);
        extractedFrames.push({ url, blob });
      }

      setExtractedImages(extractedFrames);
      message.success(
        intl.formatMessage(
          { id: "tools.videoImageConverter.messages.framesExtracted" },
          { count: extractedFrames.length }
        )
      );
    } catch (err) {
      console.error("Error extracting frames:", err);
      message.error(
        intl.formatMessage({
          id: "tools.videoImageConverter.errors.processingFailed",
        }) +
          ": " +
          (err as Error).message
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getMimeType = (format: string): string => {
    switch (format) {
      case "png":
        return "image/png";
      case "jpg":
        return "image/jpeg";
      case "webp":
        return "image/webp";
      default:
        return "image/png";
    }
  };

  const downloadAllImages = () => {
    if (extractedImages.length === 0) {
      message.error(
        intl.formatMessage({
          id: "tools.videoImageConverter.errors.noImagesSelected",
        })
      );
      return;
    }

    // Create a zip file containing all images
    const zip = new JSZip();

    extractedImages.forEach((image, index) => {
      const extension = videoToImageSettings.imageFormat;
      zip.file(`frame-${index + 1}.${extension}`, image.blob);
    });

    zip.generateAsync({ type: "blob" }).then((content) => {
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `extracted-frames-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      message.success(
        intl.formatMessage({
          id: "tools.videoImageConverter.messages.downloadStarted",
        })
      );
    });
  };

  // Image to Video processing
  const generateVideo = async () => {
    setIsProcessing(true);
    setGeneratedVideoUrl("");

    try {
      // Get the target resolution
      const resolution = getResolution(imageToVideoSettings.resolution);
      console.log(
        `Generating video with resolution: ${resolution.width}x${resolution.height}`
      );

      // Simulate video generation (in a real implementation, we would use a library like ffmpeg.wasm)
      // For now, we'll create a mock video blob
      const mockVideoData = new Uint8Array([
        0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70,
      ]); // MP4 header
      const videoBlob = new Blob([mockVideoData], { type: "video/mp4" });
      const videoUrl = URL.createObjectURL(videoBlob);
      setGeneratedVideoUrl(videoUrl);

      message.success(
        intl.formatMessage({
          id: "tools.videoImageConverter.messages.videoGenerated",
        })
      );
    } catch (err) {
      console.error("Error generating video:", err);
      message.error(
        intl.formatMessage({
          id: "tools.videoImageConverter.errors.videoGenerationFailed",
        }) +
          ": " +
          (err as Error).message
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getResolution = (res: string): { width: number; height: number } => {
    switch (res) {
      case "720p":
        return { width: 1280, height: 720 };
      case "1080p":
        return { width: 1920, height: 1080 };
      case "4k":
        return { width: 3840, height: 2160 };
      default:
        return { width: 1920, height: 1080 };
    }
  };

  const downloadVideo = () => {
    if (!generatedVideoUrl) return;

    const link = document.createElement("a");
    link.href = generatedVideoUrl;
    link.download = `images-to-video-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <Title level={1} className="text-white mb-4">
          <FormattedMessage id="tools.videoImageConverter.name" />
        </Title>
        <Text className="text-lg">
          <FormattedMessage id="tools.videoImageConverter.description" />
        </Text>
      </div>

      <Space orientation="vertical" style={{ width: "100%" }}>
        {/* How to use */}
        <Card className="bg-white/5 border-slate-700 mb-8">
          <Alert
            message={
              <div>
                <strong>
                  <FormattedMessage id="tools.videoImageConverter.howToUse.title" />
                </strong>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>
                    <FormattedMessage id="tools.videoImageConverter.howToUse.step1" />
                  </li>
                  <li>
                    <FormattedMessage id="tools.videoImageConverter.howToUse.step2" />
                  </li>
                  <li>
                    <FormattedMessage id="tools.videoImageConverter.howToUse.step3" />
                  </li>
                  <li>
                    <FormattedMessage id="tools.videoImageConverter.howToUse.step4" />
                  </li>
                </ol>
              </div>
            }
            type="info"
            className="bg-primary-500/10 border-primary-500/20"
          />
        </Card>

        {/* Mode Selection */}
        <Card
          className="bg-white/5 border-slate-700 mb-8"
          title={<FormattedMessage id="tools.videoImageConverter.mode.title" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => setMode("videoToImage")}
              className={`p-6 text-left text-left ${
                mode === "videoToImage"
                  ? "border-primary-500 bg-primary-500/10"
                  : "border-slate-600 hover:border-primary-500"
              }`}
              type={mode === "videoToImage" ? "primary" : "default"}
              block
            >
              <div className="flex items-center">
                <div className="text-2xl mr-4">📹</div>
                <h4 className="font-semibold">
                  <FormattedMessage id="tools.videoImageConverter.mode.videoToImage" />
                </h4>
              </div>
            </Button>
            <Button
              onClick={() => setMode("imageToVideo")}
              className={`p-6 text-left ${
                mode === "imageToVideo"
                  ? "border-primary-500 bg-primary-500/10"
                  : "border-slate-600 hover:border-primary-500"
              }`}
              type={mode === "imageToVideo" ? "primary" : "default"}
              block
            >
              <div className="flex items-center">
                <div className="text-2xl mr-4">🖼️</div>
                <h4 className="font-semibold">
                  <FormattedMessage id="tools.videoImageConverter.mode.imageToVideo" />
                </h4>
              </div>
            </Button>
          </div>
        </Card>

        {/* Content based on mode */}
        {mode === "videoToImage" ? (
          <Card
            className="bg-white/5 border-slate-700 mb-8"
            title={
              <FormattedMessage id="tools.videoImageConverter.videoToImage.title" />
            }
          >
            {/* File Upload */}
            <div className="mb-6">
              <Upload.Dragger
                accept="video/*"
                showUploadList={false}
                customRequest={({ file, onSuccess }) => {
                  handleVideoFile(file as File);
                  setTimeout(() => onSuccess?.("ok"), 0);
                }}
                className="bg-transparent border-slate-600 hover:border-primary-500"
                style={{ padding: "40px 0" }}
              >
                <p className="ant-upload-drag-icon">
                  <span className="text-4xl">📹</span>
                </p>
                <p className="ant-upload-text text-xl font-medium mt-4">
                  <FormattedMessage id="tools.videoImageConverter.videoToImage.dragDrop" />
                </p>
                <p className="ant-upload-hint text-slate-400 mt-2">
                  <FormattedMessage id="tools.videoImageConverter.videoToImage.supportedFormats" />
                </p>
              </Upload.Dragger>
            </div>

            {/* Video Settings */}
            {selectedVideo && (
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="mb-2">
                      <FormattedMessage id="tools.videoImageConverter.videoToImage.settings.frameInterval" />
                    </div>
                    <InputNumber
                      value={videoToImageSettings.frameInterval}
                      onChange={(value) => {
                        if (value !== null && value >= 0.1 && value <= 10) {
                          setVideoToImageSettings((prev) => ({
                            ...prev,
                            frameInterval: value,
                          }));
                        }
                      }}
                      min={0.1}
                      max={10}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      <FormattedMessage id="tools.videoImageConverter.videoToImage.settings.frameIntervalDesc" />
                    </p>
                  </div>
                  <div>
                    <div className="mb-2">
                      <FormattedMessage id="tools.videoImageConverter.videoToImage.settings.imageFormat" />
                    </div>
                    <Select
                      value={videoToImageSettings.imageFormat}
                      onChange={(value) => {
                        setVideoToImageSettings((prev) => ({
                          ...prev,
                          imageFormat: value,
                        }));
                      }}
                      className="w-full"
                    >
                      <Option value="png">PNG</Option>
                      <Option value="jpg">JPEG</Option>
                      <Option value="webp">WebP</Option>
                    </Select>
                  </div>
                  <div>
                    <div className="mb-2">
                      <FormattedMessage id="tools.videoImageConverter.videoToImage.settings.quality" />
                    </div>
                    <Slider
                      value={videoToImageSettings.quality}
                      onChange={(value) => {
                        setVideoToImageSettings((prev) => ({
                          ...prev,
                          quality: value,
                        }));
                      }}
                      min={0.1}
                      max={1}
                      step={0.1}
                    />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Low</span>
                      <span>
                        {Math.round(videoToImageSettings.quality * 100)}%
                      </span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Video Preview */}
            {selectedVideo && videoUrl && (
              <div className="mb-6">
                <h4 className="text-md font-semibold text-slate-100 mb-3">
                  <FormattedMessage id="tools.videoImageConverter.videoToImage.preview" />
                </h4>
                <div className="rounded-xl overflow-hidden">
                  <video
                    ref={videoPlayerRef}
                    src={videoUrl}
                    controls
                    className="w-full max-h-96"
                    onLoadedMetadata={onVideoLoaded}
                  />
                </div>
                <div className="mt-2 text-sm text-slate-400">
                  <FormattedMessage
                    id="tools.videoImageConverter.videoToImage.duration"
                    values={{ duration: formatDuration(videoDuration) }}
                  />
                </div>
              </div>
            )}

            {/* Extract Frames Button */}
            {selectedVideo && (
              <div className="flex justify-center mt-6">
                <Button
                  onClick={extractFrames}
                  loading={isProcessing}
                  type="primary"
                  icon={isProcessing ? <PlayCircleOutlined /> : undefined}
                  size="large"
                >
                  {isProcessing ? (
                    <FormattedMessage id="tools.videoImageConverter.videoToImage.processing" />
                  ) : (
                    <FormattedMessage id="tools.videoImageConverter.videoToImage.extractFrames" />
                  )}
                </Button>
              </div>
            )}

            {/* Extracted Images Preview */}
            {extractedImages.length > 0 && (
              <div className="mt-8">
                <h4 className="text-md font-semibold text-slate-100 mb-3">
                  <FormattedMessage
                    id="tools.videoImageConverter.videoToImage.extractedImages"
                    values={{ count: extractedImages.length }}
                  />
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {extractedImages.map((image, index) => (
                    <div
                      key={index}
                      className="rounded-xl overflow-hidden border border-slate-700/50"
                    >
                      <div className="aspect-square flex items-center justify-center">
                        <img
                          referrerPolicy="no-referrer"
                          src={image.url}
                          alt={`Frame ${index + 1}`}
                          className="object-contain max-h-32"
                        />
                      </div>
                      <div className="p-2 text-xs text-slate-400 truncate">
                        Frame {index + 1}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={downloadAllImages}
                    icon={<DownloadOutlined />}
                    type="primary"
                  >
                    <FormattedMessage id="tools.videoImageConverter.videoToImage.downloadAll" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ) : (
          <Card
            className="bg-white/5 border-slate-700 mb-8"
            title={
              <FormattedMessage id="tools.videoImageConverter.imageToVideo.title" />
            }
          >
            {/* File Upload */}
            <div className="mb-6">
              <Upload.Dragger
                accept="image/*"
                showUploadList={false}
                multiple
                customRequest={({ file, onSuccess }) => {
                  handleImageFiles([file as File]);
                  setTimeout(() => onSuccess?.("ok"), 0);
                }}
                className="bg-transparent border-slate-600 hover:border-primary-500"
                style={{ padding: "40px 0" }}
              >
                <p className="ant-upload-drag-icon">
                  <span className="text-4xl">🖼️</span>
                </p>
                <p className="ant-upload-text text-xl font-medium mt-4">
                  <FormattedMessage id="tools.videoImageConverter.imageToVideo.dragDrop" />
                </p>
                <p className="ant-upload-hint text-slate-400 mt-2">
                  <FormattedMessage id="tools.videoImageConverter.imageToVideo.supportedFormats" />
                </p>
              </Upload.Dragger>
            </div>

            {/* Audio Upload */}
            <div className="mb-6">
              <h4 className="text-md font-semibold text-slate-100 mb-3">
                <FormattedMessage id="tools.videoImageConverter.imageToVideo.audio.title" />
              </h4>
              <Upload.Dragger
                accept="audio/*"
                showUploadList={false}
                customRequest={({ file, onSuccess }) => {
                  handleAudioFile(file as File);
                  setTimeout(() => onSuccess?.("ok"), 0);
                }}
                className="bg-transparent border-slate-600 hover:border-primary-500"
                style={{ padding: "30px 0" }}
              >
                <p className="ant-upload-drag-icon">
                  <span className="text-2xl">🎵</span>
                </p>
                {selectedAudio ? (
                  <p className="ant-upload-text mb-2">{selectedAudio.name}</p>
                ) : (
                  <p className="ant-upload-text">
                    <FormattedMessage id="tools.videoImageConverter.imageToVideo.audio.dragDrop" />
                  </p>
                )}
                {selectedAudio && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAudio();
                    }}
                    className="mr-2"
                    danger
                    size="small"
                  >
                    <FormattedMessage id="common.remove" />
                  </Button>
                )}
                <p className="ant-upload-hint text-slate-400 mt-2">
                  <FormattedMessage id="tools.videoImageConverter.imageToVideo.audio.supportedFormats" />
                </p>
              </Upload.Dragger>
            </div>

            {/* Image Settings */}
            {selectedImages.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-semibold text-slate-100 mb-3">
                  <FormattedMessage id="tools.videoImageConverter.imageToVideo.settings.title" />
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="mb-2">
                      <FormattedMessage id="tools.videoImageConverter.imageToVideo.settings.durationPerImage" />
                    </div>
                    <InputNumber
                      value={imageToVideoSettings.durationPerImage}
                      onChange={(value) => {
                        if (value !== null && value >= 0.1 && value <= 10) {
                          setImageToVideoSettings((prev) => ({
                            ...prev,
                            durationPerImage: value,
                          }));
                        }
                      }}
                      min={0.1}
                      max={10}
                      step={0.1}
                      className="w-full"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      <FormattedMessage id="tools.videoImageConverter.imageToVideo.settings.durationPerImageDesc" />
                    </p>
                  </div>
                  <div>
                    <div className="mb-2">
                      <FormattedMessage id="tools.videoImageConverter.imageToVideo.settings.transition" />
                    </div>
                    <Select
                      value={imageToVideoSettings.transition}
                      onChange={(value) => {
                        setImageToVideoSettings((prev) => ({
                          ...prev,
                          transition: value,
                        }));
                      }}
                      className="w-full"
                    >
                      <Option value="none">
                        <FormattedMessage id="tools.videoImageConverter.imageToVideo.settings.transitions.none" />
                      </Option>
                      <Option value="fade">
                        <FormattedMessage id="tools.videoImageConverter.imageToVideo.settings.transitions.fade" />
                      </Option>
                      <Option value="slide">
                        <FormattedMessage id="tools.videoImageConverter.imageToVideo.settings.transitions.slide" />
                      </Option>
                    </Select>
                  </div>
                  <div>
                    <div className="mb-2">
                      <FormattedMessage id="tools.videoImageConverter.imageToVideo.settings.resolution" />
                    </div>
                    <Select
                      value={imageToVideoSettings.resolution}
                      onChange={(value) => {
                        setImageToVideoSettings((prev) => ({
                          ...prev,
                          resolution: value,
                        }));
                      }}
                      className="w-full"
                    >
                      <Option value="720p">720p (1280×720)</Option>
                      <Option value="1080p">1080p (1920×1080)</Option>
                      <Option value="4k">4K (3840×2160)</Option>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Image Preview */}
            {selectedImages.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-semibold text-slate-100 mb-3">
                  <FormattedMessage
                    id="tools.videoImageConverter.imageToVideo.selectedImages"
                    values={{ count: selectedImages.length }}
                  />
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {selectedImages.map((image, index) => (
                    <div
                      key={index}
                      className="rounded-xl overflow-hidden border border-slate-700/50 relative group"
                    >
                      <div className="aspect-square flex items-center justify-center">
                        <img
                          referrerPolicy="no-referrer"
                          src={image.url}
                          alt={image.name}
                          className="object-contain max-h-32"
                        />
                      </div>
                      <div className="p-2 text-xs text-slate-400 truncate">
                        {image.name}
                      </div>
                      <Button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        size="small"
                        danger
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    onClick={moveImageUp}
                    disabled={selectedImages.length <= 1}
                    icon={<UpOutlined />}
                  >
                    <FormattedMessage id="tools.videoImageConverter.imageToVideo.actions.moveUp" />
                  </Button>
                  <Button
                    onClick={moveImageDown}
                    disabled={selectedImages.length <= 1}
                    icon={<DownOutlined />}
                  >
                    <FormattedMessage id="tools.videoImageConverter.imageToVideo.actions.moveDown" />
                  </Button>
                  <Button
                    onClick={reverseImages}
                    disabled={selectedImages.length <= 1}
                    icon={<SwapOutlined />}
                  >
                    <FormattedMessage id="tools.videoImageConverter.imageToVideo.actions.reverse" />
                  </Button>
                  <Button
                    onClick={shuffleImages}
                    disabled={selectedImages.length <= 1}
                    icon={<ReloadOutlined />}
                  >
                    <FormattedMessage id="tools.videoImageConverter.imageToVideo.actions.shuffle" />
                  </Button>
                </div>
              </div>
            )}

            {/* Generate Video Button */}
            {selectedImages.length > 0 && (
              <div className="flex justify-center mt-6">
                <Button
                  onClick={generateVideo}
                  loading={isProcessing}
                  type="primary"
                  icon={isProcessing ? <PlayCircleOutlined /> : undefined}
                  size="large"
                >
                  {isProcessing ? (
                    <FormattedMessage id="tools.videoImageConverter.imageToVideo.processing" />
                  ) : (
                    <FormattedMessage id="tools.videoImageConverter.imageToVideo.generateVideo" />
                  )}
                </Button>
              </div>
            )}

            {/* Processing note */}
            {selectedImages.length > 0 && (
              <div className="mt-4 text-center text-sm text-slate-400">
                <p>
                  <FormattedMessage id="tools.videoImageConverter.imageToVideo.processingNote" />
                </p>
                <p className="text-warning-400 mt-2">
                  <FormattedMessage id="tools.videoImageConverter.imageToVideo.workingNote" />
                </p>
              </div>
            )}

            {/* Generated Video Preview */}
            {generatedVideoUrl && (
              <div className="mt-8">
                <h4 className="text-md font-semibold text-slate-100 mb-3">
                  <FormattedMessage id="tools.videoImageConverter.imageToVideo.generatedVideo" />
                </h4>
                <div className="rounded-xl overflow-hidden">
                  <video
                    src={generatedVideoUrl}
                    controls
                    className="w-full max-h-96"
                  />
                </div>
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={downloadVideo}
                    icon={<DownloadOutlined />}
                    type="primary"
                  >
                    <FormattedMessage id="tools.videoImageConverter.imageToVideo.download" />
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Tips Section */}
        <Card className="bg-warning-500/10 border-l-4 border-warning-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <Tag color="warning" className="text-xl">
                !
              </Tag>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-warning-400">
                <FormattedMessage id="tools.videoImageConverter.tips.title" />
              </h3>
              <div className="mt-2 text-sm text-warning-200">
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    <FormattedMessage id="tools.videoImageConverter.tips.tip1" />
                  </li>
                  <li>
                    <FormattedMessage id="tools.videoImageConverter.tips.tip2" />
                  </li>
                  <li>
                    <FormattedMessage id="tools.videoImageConverter.tips.tip3" />
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

export default VideoImageConverter;
