import { useCopy } from "@/hooks/useCopy";
import {
  CheckOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileImageOutlined,
  QrcodeOutlined,
  RedoOutlined,
  ScanOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  ColorPicker,
  Divider,
  Input,
  message,
  Radio,
  Slider,
  Space,
  Tooltip,
  Typography,
  Upload,
} from "antd";
import jsQR from "jsqr";
import JSZip from "jszip";
import QRCode from "qrcode";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { QRCode as ReactQRCodeLogo } from "react-qrcode-logo";

const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

// Interfaces
interface GeneratedQR {
  text: string;
  dataUrl: string;
}

interface RecognizedResult {
  fileName: string;
  preview?: string;
  data?: string;
  error?: string;
  status: "success" | "error";
}

const QrCodeTool: React.FC = () => {
  const intl = useIntl();
  const copy = useCopy();
  const [activeTab, setActiveTab] = useState("generate");

  // Generate State
  const [generateText, setGenerateText] = useState("");
  const [generateMode, setGenerateMode] = useState<"single" | "batch">(
    "single"
  );
  const [generatedQRCodes, setGeneratedQRCodes] = useState<GeneratedQR[]>([]);

  // QR Code Style State
  const [qrSize, setQrSize] = useState(300);
  const [qrBgColor, setQrBgColor] = useState("#FFFFFF");
  const [qrFgColor, setQrFgColor] = useState("#000000");
  const [qrMargin, setQrMargin] = useState(2);
  const [qrStyle, setQrStyle] = useState<"squares" | "dots">("squares");
  const [qrEyeColor, setQrEyeColor] = useState("#000000");
  const [qrEyeRadius, setQrEyeRadius] = useState(0);

  // Logo State
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [logoWidth, setLogoWidth] = useState(60);
  const [logoHeight, setLogoHeight] = useState(60);
  const [logoOpacity, setLogoOpacity] = useState(1);
  const [removeQrCodeBehindLogo, setRemoveQrCodeBehindLogo] = useState(true);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Other State
  const [copied, setCopied] = useState(false);

  // Recognize State
  const [recognizedResults, setRecognizedResults] = useState<
    RecognizedResult[]
  >([]);

  // -------------------------------------------------------------------------
  // GENERATE LOGIC
  // -------------------------------------------------------------------------

  const handleGenerate = async () => {
    if (!generateText.trim()) return;

    try {
      if (generateMode === "single") {
        const dataUrl = await QRCode.toDataURL(generateText.trim(), {
          width: qrSize,
          margin: qrMargin,
          color: { dark: qrFgColor, light: qrBgColor },
        });
        setGeneratedQRCodes([{ text: generateText.trim(), dataUrl }]);
        message.success(
          intl.formatMessage({ id: "tools.qrCodeTool.generateSuccess" })
        );
      } else {
        const lines = generateText
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l);
        if (lines.length === 0) {
          message.warning(
            intl.formatMessage({ id: "tools.qrCodeTool.noValidText" })
          );
          return;
        }

        const newQRs: GeneratedQR[] = [];
        for (const line of lines) {
          const dataUrl = await QRCode.toDataURL(line, {
            width: qrSize,
            margin: qrMargin,
            color: { dark: qrFgColor, light: qrBgColor },
          });
          newQRs.push({ text: line, dataUrl });
        }
        setGeneratedQRCodes(newQRs);
        message.success(
          intl.formatMessage(
            { id: "tools.qrCodeTool.generateCount" },
            { count: lines.length }
          )
        );
      }
    } catch (err) {
      console.error(err);
      message.error(
        intl.formatMessage({ id: "tools.qrCodeTool.generateError" })
      );
    }
  };

  const clearGenerated = () => {
    setGeneratedQRCodes([]);
    setGenerateText("");
  };

  const downloadSingle = async (qr: GeneratedQR, index: number) => {
    try {
      // Generate QR code with current settings
      const currentDataUrl = await generateQRWithCurrentSettings(qr.text);

      const link = document.createElement("a");
      link.href = currentDataUrl;
      link.download = `qr-code-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating QR code for download:", error);
      message.error(
        intl.formatMessage({ id: "tools.qrCodeTool.generateError" })
      );
    }
  };

  const downloadAll = async () => {
    if (generatedQRCodes.length === 0) return;
    try {
      const zip = new JSZip();
      for (let i = 0; i < generatedQRCodes.length; i++) {
        const qr = generatedQRCodes[i];
        // Generate QR code with current settings
        const currentDataUrl = await generateQRWithCurrentSettings(qr.text);
        const base64Data = currentDataUrl.split(",")[1];
        zip.file(`qr-code-${i + 1}.png`, base64Data, { base64: true });
      }
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `qr-codes-${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      message.success(intl.formatMessage({ id: "toast.success" }));
    } catch (err) {
      console.error(err);
      message.error(intl.formatMessage({ id: "tools.qrCodeTool.zipError" }));
    }
  };

  const copyImage = async (dataUrl: string) => {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      message.success(intl.formatMessage({ id: "common.copySuccess" }));
    } catch (err) {
      message.error(
        intl.formatMessage({ id: "tools.qrCodeTool.copyImageError" })
      );
    }
  };

  // Handle Logo Upload
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setLogoImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger Logo Upload
  const triggerLogoUpload = () => {
    fileInputRef.current?.click();
  };

  // Remove Logo
  const removeLogo = () => {
    setLogoImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Apply Color Preset
  const applyColorPreset = (bg: string, fg: string) => {
    setQrBgColor(bg);
    setQrFgColor(fg);
    setQrEyeColor(fg); // Usually eye color matches foreground
  };

  // Color Presets
  const colorPresets = [
    {
      bg: "#FFFFFF",
      fg: "#000000",
      id: "tools.qrCodeTool.preset_classic_bw",
    },
    {
      bg: "#0088CC",
      fg: "#FFFFFF",
      id: "tools.qrCodeTool.preset_blue_white",
    },
    {
      bg: "#EF4444",
      fg: "#FFFFFF",
      id: "tools.qrCodeTool.preset_vibrant_red",
    },
    {
      bg: "#10B981",
      fg: "#FFFFFF",
      id: "tools.qrCodeTool.preset_fresh_green",
    },
    {
      bg: "#6366F1",
      fg: "#FFFFFF",
      id: "tools.qrCodeTool.preset_tech_purple",
    },
    {
      bg: "#262626",
      fg: "#F5F5F5",
      id: "tools.qrCodeTool.preset_dark_mode",
    },
    {
      bg: "#FFFFFF",
      fg: "#F97316",
      id: "tools.qrCodeTool.preset_orange_accent",
    },
    {
      bg: "#FFEDD5",
      fg: "#7C2D12",
      id: "tools.qrCodeTool.preset_warm_brown",
    },
  ];

  // Reset Settings
  const resetSettings = () => {
    setQrSize(300);
    setQrBgColor("#FFFFFF");
    setQrFgColor("#000000");
    setQrMargin(2);
    setQrStyle("squares");
    setQrEyeColor("#000000");
    setQrEyeRadius(0);
    setLogoImage(null);
    setLogoWidth(60);
    setLogoHeight(60);
    setLogoOpacity(1);
    setRemoveQrCodeBehindLogo(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Generate QR Code with current settings
  const generateQRWithCurrentSettings = async (text: string) => {
    return await QRCode.toDataURL(text, {
      width: qrSize,
      margin: qrMargin,
      color: { dark: qrFgColor, light: qrBgColor },
      errorCorrectionLevel: "H",
    });
  };

  // Copy QR Value
  const copyQRValue = () => {
    navigator.clipboard
      .writeText(generateText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.error("Failed to copy:", err));
  };

  // -------------------------------------------------------------------------
  // RECOGNIZE LOGIC
  // -------------------------------------------------------------------------

  const processFiles = async (files: File[]) => {
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      message.error(
        intl.formatMessage({ id: "tools.qrCodeTool.noImagesFound" })
      );
      return;
    }

    const results: RecognizedResult[] = [];

    for (const file of imageFiles) {
      const res: RecognizedResult = {
        fileName: file.name,
        status: "error",
      };

      try {
        // 1. Create Preview
        const preview = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        res.preview = preview;

        // 2. Decode
        const img = new Image();
        img.src = preview;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context failed");

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          res.data = code.data;
          res.status = "success";
        } else {
          res.error = "No QR Code found";
        }
      } catch (err) {
        console.error(err);
        res.error = "Recognition failed";
      }
      results.push(res);
    }

    setRecognizedResults((prev) => [...prev, ...results]);
    message.success(
      intl.formatMessage(
        { id: "tools.qrCodeTool.processedCount" },
        { count: imageFiles.length }
      )
    );
  };

  const handleUploadRequest = (options: any) => {
    processFiles([options.file]);
    setTimeout(() => options.onSuccess?.("ok"), 0);
  };

  const handlePaste = useCallback(
    (event: ClipboardEvent) => {
      if (activeTab !== "recognize") return;
      const items = event.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const f = item.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length > 0) processFiles(files);
    },
    [activeTab]
  );

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const copyAllResults = () => {
    const text = recognizedResults
      .filter((r) => r.status === "success" && r.data)
      .map((r) => r.data)
      .join("\n");
    if (text) copy(text);
    else message.warning("No success results to copy");
  };

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-4">
        <Title level={1} className="text-white mb-4">
          <FormattedMessage id="tools.qrCodeTool.name" />
        </Title>
        <Text className="text-lg">
          <FormattedMessage id="tools.qrCodeTool.description" />
        </Text>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center mb-4">
        <Radio.Group
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value="generate">
            <QrcodeOutlined />{" "}
            <FormattedMessage id="tools.qrCodeTool.generate" />
          </Radio.Button>
          <Radio.Button value="recognize">
            <ScanOutlined />{" "}
            <FormattedMessage id="tools.qrCodeTool.recognize" />
          </Radio.Button>
        </Radio.Group>
      </div>

      {activeTab === "generate" ? (
        <div className="animate-fade-in space-y-8">
          <Card
            extra={
              <Button
                size="small"
                type="default"
                onClick={clearGenerated}
                icon={<DeleteOutlined />}
              >
                <FormattedMessage id="common.clear" />
              </Button>
            }
            className="bg-white/5 border-slate-700"
            title={<FormattedMessage id="tools.qrCodeTool.inputSettings" />}
          >
            <Space
              orientation="vertical"
              style={{ width: "100%" }}
              size="middle"
            >
              <TextArea
                rows={6}
                value={generateText}
                onChange={(e) => setGenerateText(e.target.value)}
                placeholder={intl.formatMessage({
                  id: "tools.qrCodeTool.inputPlaceholder",
                })}
                className="mb-4 border-slate-600 placeholder-slate-500 bg-slate-900"
              />

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <Space orientation="vertical">
                  <Radio.Group
                    value={generateMode}
                    onChange={(e) => setGenerateMode(e.target.value)}
                    buttonStyle="solid"
                  >
                    <Radio.Button value="single">
                      <FormattedMessage id="tools.qrCodeTool.singleMode" />
                    </Radio.Button>
                    <Radio.Button value="batch">
                      <FormattedMessage id="tools.qrCodeTool.batchMode" />
                    </Radio.Button>
                  </Radio.Group>
                  <Text className="text-xs">
                    {generateMode === "single"
                      ? intl.formatMessage({
                        id: "tools.qrCodeTool.singleDesc",
                      })
                      : intl.formatMessage({
                        id: "tools.qrCodeTool.batchDesc",
                      })}
                  </Text>
                </Space>

                <Button
                  type="primary"
                  onClick={handleGenerate}
                  size="large"
                  icon={<QrcodeOutlined />}
                >
                  <FormattedMessage id="tools.qrCodeTool.generate" />
                </Button>
              </div>
            </Space>
            <Space
              orientation="vertical"
              style={{ width: "100%" }}
              size="middle"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm block mb-2">
                    <FormattedMessage id="tools.qrCodeTool.size_pixels" />
                  </label>
                  <Slider
                    min={100}
                    max={500}
                    step={10}
                    value={typeof qrSize === "number" ? qrSize : 300}
                    onChange={(value) => setQrSize(value as number)}
                    tooltip={{ formatter: (value) => `${value} px` }}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-sm">100px</span>
                    <span className="text-sm">{qrSize}px</span>
                    <span className="text-sm">500px</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm block mb-2">
                    <FormattedMessage id="tools.qrCodeTool.margin_pixels" />
                  </label>
                  <Slider
                    min={0}
                    max={50}
                    step={1}
                    value={typeof qrMargin === "number" ? qrMargin : 2}
                    onChange={(value) => setQrMargin(value as number)}
                    tooltip={{ formatter: (value) => `${value} px` }}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-sm">0px</span>
                    <span className="text-sm">{qrMargin}px</span>
                    <span className="text-sm">50px</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm block mb-2">
                  <FormattedMessage id="tools.qrCodeTool.dot_style" />
                </label>
                <Radio.Group
                  value={qrStyle}
                  onChange={(e) => setQrStyle(e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="squares">
                    <FormattedMessage id="tools.qrCodeTool.squares" />
                  </Radio.Button>
                  <Radio.Button value="dots">
                    <FormattedMessage id="tools.qrCodeTool.dots" />
                  </Radio.Button>
                </Radio.Group>
              </div>
            </Space>
            <Space
              orientation="vertical"
              style={{ width: "100%" }}
              size="middle"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm block mb-2">
                    <FormattedMessage id="tools.qrCodeTool.background_color" />
                  </label>
                  <Space align="center">
                    <ColorPicker
                      value={qrBgColor}
                      onChange={(color) => setQrBgColor(color.toHexString())}
                      showText
                      size="large"
                    />
                    <Input
                      value={qrBgColor}
                      onChange={(e) => setQrBgColor(e.target.value)}
                      style={{ width: 100 }}
                      className="border-slate-600 placeholder-slate-500 bg-slate-900"
                    />
                  </Space>
                </div>

                <div>
                  <label className="text-sm block mb-2">
                    <FormattedMessage id="tools.qrCodeTool.foreground_color" />
                  </label>
                  <Space align="center">
                    <ColorPicker
                      value={qrFgColor}
                      onChange={(color) => setQrFgColor(color.toHexString())}
                      showText
                      size="large"
                    />
                    <Input
                      value={qrFgColor}
                      onChange={(e) => setQrFgColor(e.target.value)}
                      style={{ width: 100 }}
                      className="border-slate-600 placeholder-slate-500 bg-slate-900"
                    />
                  </Space>
                </div>

                <div>
                  <label className="text-sm block mb-2">
                    <FormattedMessage id="tools.qrCodeTool.eye_color" />
                  </label>
                  <Space align="center">
                    <ColorPicker
                      value={qrEyeColor}
                      onChange={(color) => setQrEyeColor(color.toHexString())}
                      showText
                      size="large"
                    />
                    <Input
                      value={qrEyeColor}
                      onChange={(e) => setQrEyeColor(e.target.value)}
                      style={{ width: 100 }}
                      className="border-slate-600 placeholder-slate-500 bg-slate-900"
                    />
                  </Space>
                </div>
              </div>

              <div>
                <label className="text-sm block mb-2">
                  <FormattedMessage id="tools.qrCodeTool.eye_radius" />
                </label>
                <Slider
                  min={0}
                  max={50}
                  step={5}
                  value={typeof qrEyeRadius === "number" ? qrEyeRadius : 0}
                  onChange={(value) => setQrEyeRadius(value as number)}
                  tooltip={{ formatter: (value) => `${value}%` }}
                />
                <div className="flex justify-between mt-1">
                  <span className="text-sm">0%</span>
                  <span className="text-sm">{qrEyeRadius}%</span>
                  <span className="text-sm">50%</span>
                </div>
              </div>

              <Divider className="">
                <FormattedMessage id="tools.qrCodeTool.preset_colors" />
              </Divider>

              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {colorPresets.map((preset, index) => (
                  <Button
                    key={index}
                    className="p-2 border rounded-md hover:border-purple-500 transition-all duration-200 hover:scale-105"
                    onClick={() => applyColorPreset(preset.bg, preset.fg)}
                    title={intl.formatMessage({ id: preset.id })}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className="w-4 h-4 rounded-sm border border-gray-300"
                        style={{
                          backgroundColor: preset.fg,
                          borderColor: preset.bg,
                        }}
                      ></div>
                      <div className="text-xs mt-1 truncate w-full text-center">
                        <FormattedMessage id={preset.id} />
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </Space>
            <Space
              orientation="vertical"
              style={{ width: "100%" }}
              size="middle"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: "none" }}
              />

              <div className="flex justify-between items-center mb-2">
                <Button className="btn-primary" onClick={triggerLogoUpload}>
                  <FileImageOutlined className="mr-2" />
                  <FormattedMessage id="tools.qrCodeTool.upload_logo" />
                </Button>

                {logoImage && (
                  <Button
                    className="btn-secondary text-error"
                    onClick={removeLogo}
                  >
                    <DeleteOutlined className="mr-2" />
                    <FormattedMessage id="tools.qrCodeTool.remove" />
                  </Button>
                )}
              </div>

              {logoImage && (
                <div className="rounded bg-slate-800 p-3 mb-4 flex justify-center items-center">
                  <img
                    src={logoImage}
                    alt="Logo"
                    className="max-h-20 max-w-full"
                  />
                </div>
              )}

              {logoImage && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm block mb-2">
                        <FormattedMessage id="tools.qrCodeTool.logo_width" />
                      </label>
                      <Slider
                        min={20}
                        max={150}
                        value={typeof logoWidth === "number" ? logoWidth : 60}
                        onChange={(value) => setLogoWidth(value as number)}
                        tooltip={{ formatter: (value) => `${value}px` }}
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-sm">20px</span>
                        <span className="text-sm">{logoWidth}px</span>
                        <span className="text-sm">150px</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm block mb-2">
                        <FormattedMessage id="tools.qrCodeTool.logo_height" />
                      </label>
                      <Slider
                        min={20}
                        max={150}
                        value={typeof logoHeight === "number" ? logoHeight : 60}
                        onChange={(value) => setLogoHeight(value as number)}
                        tooltip={{ formatter: (value) => `${value}px` }}
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-sm">20px</span>
                        <span className="text-sm">{logoHeight}px</span>
                        <span className="text-sm">150px</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm block mb-2">
                      <FormattedMessage id="tools.qrCodeTool.logo_opacity" />
                    </label>
                    <Slider
                      min={0}
                      max={1}
                      step={0.1}
                      value={typeof logoOpacity === "number" ? logoOpacity : 1}
                      onChange={(value) => setLogoOpacity(value as number)}
                      tooltip={{
                        formatter: (value) =>
                          `${Math.round((value as number) * 100)}%`,
                      }}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-sm">0%</span>
                      <span className="text-sm">
                        {Math.round(logoOpacity * 100)}%
                      </span>
                      <span className="text-sm">100%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={removeQrCodeBehindLogo}
                      onChange={(e) =>
                        setRemoveQrCodeBehindLogo(e.target.checked)
                      }
                    />
                    <label className="text-sm cursor-pointer">
                      <FormattedMessage id="tools.qrCodeTool.remove_code_behind_logo" />
                    </label>
                  </div>
                </>
              )}
            </Space>
          </Card>

          {generatedQRCodes.length > 0 && (
            <Card
              className="bg-white/5 border-slate-700"
              title={
                <FormattedMessage
                  id="tools.qrCodeTool.results"
                  values={{ count: generatedQRCodes.length }}
                />
              }
              extra={
                <Space>
                  <Button
                    icon={<RedoOutlined />}
                    onClick={resetSettings}
                    title={intl.formatMessage({
                      id: "tools.qrCodeTool.reset_settings",
                    })}
                  >
                    <FormattedMessage id="tools.qrCodeTool.reset_settings" />
                  </Button>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={downloadAll}
                    type="primary"
                    ghost
                  >
                    <FormattedMessage id="tools.qrCodeTool.downloadZip" />
                  </Button>
                </Space>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {generatedQRCodes.map((qr, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-slate-700/50 text-center group hover:border-primary-500/50 transition-colors bg-slate-900/50"
                  >
                    <div className="bg-white p-2 rounded mb-3 w-full max-w-[300px] mx-auto">
                      <div className="relative w-full h-auto" style={{ aspectRatio: '1/1' }}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ReactQRCodeLogo
                            value={qr.text}
                            size={qrSize}
                            bgColor={qrBgColor}
                            fgColor={qrFgColor}
                            logoImage={logoImage || undefined}
                            logoWidth={logoWidth}
                            logoHeight={logoHeight}
                            logoOpacity={logoOpacity}
                            removeQrCodeBehindLogo={removeQrCodeBehindLogo}
                            eyeColor={qrEyeColor}
                            eyeRadius={qrEyeRadius}
                            qrStyle={qrStyle === "dots" ? "dots" : "squares"}
                            quietZone={qrMargin}
                            ecLevel="H"
                            style={{
                              width: '100%',
                              height: '100%',
                              maxWidth: qrSize,
                              maxHeight: qrSize,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <Paragraph
                      className="text-xs truncate mb-3"
                      copyable={{ text: qr.text }}
                      title={qr.text}
                    >
                      {qr.text}
                    </Paragraph>
                    <Space size="small">
                      <Tooltip
                        title={intl.formatMessage({
                          id: "tools.qrCodeTool.copy_content",
                        })}
                      >
                        <Button
                          size="small"
                          icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                          onClick={copyQRValue}
                        />
                      </Tooltip>
                      <Tooltip
                        title={intl.formatMessage({
                          id: "tools.qrCodeTool.copyImage",
                        })}
                      >
                        <Button
                          size="small"
                          icon={<CopyOutlined />}
                          onClick={() => copyImage(qr.dataUrl)}
                        />
                      </Tooltip>
                      <Tooltip
                        title={intl.formatMessage({ id: "common.download" })}
                      >
                        <Button
                          size="small"
                          icon={<DownloadOutlined />}
                          type="primary"
                          onClick={() => downloadSingle(qr, idx)}
                        />
                      </Tooltip>
                    </Space>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : (
        <div className="animate-fade-in space-y-8">
          <Card className="bg-white/5 border-slate-700">
            <Dragger
              customRequest={handleUploadRequest}
              multiple
              showUploadList={false}
              accept="image/*"
              className="bg-transparent border-slate-600 hover:border-primary-500"
            >
              <p className="ant-upload-drag-icon">
                <FileImageOutlined className="text-5xl" />
              </p>
              <p className="ant-upload-text text-xl font-medium mt-4">
                <FormattedMessage id="tools.qrCodeTool.scanTitle" />
              </p>
              <p className="ant-upload-hint mt-2">
                <FormattedMessage id="tools.qrCodeTool.scanHint" />
              </p>
            </Dragger>
          </Card>

          {recognizedResults.length > 0 && (
            <Card
              className="bg-white/5 border-slate-700"
              title={
                <FormattedMessage
                  id="tools.qrCodeTool.scanResults"
                  values={{ count: recognizedResults.length }}
                />
              }
              extra={
                <Space>
                  <Button
                    onClick={() => setRecognizedResults([])}
                    icon={<DeleteOutlined />}
                  >
                    <FormattedMessage id="common.clear" />
                  </Button>
                  <Button
                    type="primary"
                    icon={<CopyOutlined />}
                    onClick={copyAllResults}
                  >
                    <FormattedMessage id="tools.qrCodeTool.copyAllResults" />
                  </Button>
                </Space>
              }
            >
              <div className="space-y-4">
                {recognizedResults.map((res, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${res.status === "success"
                        ? "bg-green-500/10 border-green-500/20"
                        : "bg-red-500/10 border-red-500/20"
                      } flex items-start gap-4 transition-all hover:bg-white/5`}
                  >
                    {res.preview && (
                      <img
                        referrerPolicy="no-referrer"
                        src={res.preview}
                        className="w-16 h-16 object-cover rounded border border-white/10"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <Text strong className="block mb-1">
                        {res.fileName}
                      </Text>
                      {res.status === "success" ? (
                        <Paragraph
                          className="text-green-300 font-mono text-sm break-all mb-0"
                          copyable
                        >
                          {res.data}
                        </Paragraph>
                      ) : (
                        <Text className="text-red-400">{res.error}</Text>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default QrCodeTool;
