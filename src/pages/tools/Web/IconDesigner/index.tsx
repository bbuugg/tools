import React, { useState, useRef } from "react";
import { Card, Input, Button, Select, Slider, Radio, Divider, Row, Col, Space, Collapse, Tooltip, Typography } from 'antd';
import { DownloadOutlined, StarOutlined, FontColorsOutlined, BorderOutlined, RotateLeftOutlined, AppstoreOutlined } from '@ant-design/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import { faStar } from "@fortawesome/free-solid-svg-icons";

import IconSelector from "./components/IconSelector";
import type { EnhancedIconCanvasRef } from "./components/EnhancedIconCanvas";
import type { ShapeType, BackgroundType, IconType } from "./components/EnhancedIconPreview";
import EnhancedIconPreview from "./components/EnhancedIconPreview";
import EnhancedIconCanvas from "./components/EnhancedIconCanvas";

const { Text, Paragraph } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

// 颜色预设
const colorPresets = [
  "#000000",
  "#FFFFFF",
  "#6B7280",
  "#3B82F6",
  "#10B981",
  "#EF4444",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
];

// 预设模板
interface Template {
  name: string;
  backgroundType: BackgroundType;
  backgroundColor: string;
  gradientStartColor?: string;
  gradientEndColor?: string;
  gradientDirection?: number;
  iconColor: string;
  shape: ShapeType;
  iconSize: number;
  iconRotation?: number;
}

const templates: Template[] = [
  {
    name: "iOS Style",
    backgroundType: "solid",
    backgroundColor: "#000000",
    iconColor: "#FFFFFF",
    shape: "rounded-square",
    iconSize: 60,
  },
  {
    name: "Material",
    backgroundType: "solid",
    backgroundColor: "#4CAF50",
    iconColor: "#FFFFFF",
    shape: "circle",
    iconSize: 55,
  },
  {
    name: "Minimal",
    backgroundType: "solid",
    backgroundColor: "#FFFFFF",
    iconColor: "#000000",
    shape: "square",
    iconSize: 50,
  },
  {
    name: "Gradient",
    backgroundType: "linear-gradient",
    backgroundColor: "#8B5CF6",
    gradientStartColor: "#6366F1",
    gradientEndColor: "#8B5CF6",
    gradientDirection: 45,
    iconColor: "#FFFFFF",
    shape: "rounded-square",
    iconSize: 65,
  },
  {
    name: "Neon",
    backgroundType: "radial-gradient",
    backgroundColor: "#000000",
    gradientStartColor: "#FF006E",
    gradientEndColor: "#8338EC",
    iconColor: "#FFFFFF",
    shape: "circle",
    iconSize: 70,
    iconRotation: 15,
  },
  {
    name: "Retro",
    backgroundType: "linear-gradient",
    backgroundColor: "#F72585",
    gradientStartColor: "#F72585",
    gradientEndColor: "#B5179E",
    gradientDirection: 135,
    iconColor: "#FFE66D",
    shape: "square",
    iconSize: 65,
  },
  {
    name: "Glassmorphism",
    backgroundType: "linear-gradient",
    backgroundColor: "rgba(255,255,255,0.1)",
    gradientStartColor: "rgba(255,255,255,0.2)",
    gradientEndColor: "rgba(255,255,255,0.05)",
    iconColor: "#FFFFFF",
    shape: "rounded-square",
    iconSize: 60,
  },
  {
    name: "Neumorphism",
    backgroundType: "solid",
    backgroundColor: "#E0E5EC",
    iconColor: "#9BAACF",
    shape: "rounded-square",
    iconSize: 55,
  },
];

export default function IconDesigner() {
  const intl = useIntl();
  const canvasRef = useRef<EnhancedIconCanvasRef>(null);

  // 图标相关状态
  const [iconType, setIconType] = useState<IconType>("fontawesome");
  const [selectedIcon, setSelectedIcon] = useState(faStar);
  const [customText, setCustomText] = useState("ABC");
  const [iconColor, setIconColor] = useState("#FFFFFF");
  const [iconSize, setIconSize] = useState(60);
  const [iconRotation, setIconRotation] = useState(0);
  const [fontFamily, setFontFamily] = useState("Arial, sans-serif");
  const [fontWeight, setFontWeight] = useState("bold");
  const [fontSize, setFontSize] = useState(40); // 独立的字体大小，用于文字模式

  // 背景相关状态
  const [backgroundType, setBackgroundType] = useState<BackgroundType>("solid");
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [gradientStartColor, setGradientStartColor] = useState("#6366F1");
  const [gradientEndColor, setGradientEndColor] = useState("#8B5CF6");
  const [gradientDirection, setGradientDirection] = useState(45);
  const [shape, setShape] = useState<ShapeType>("rounded-square");

  // 导出相关状态
  const [exportSize, setExportSize] = useState(256);
  const [exportFormat, setExportFormat] = useState("png");
  const [isGenerating, setIsGenerating] = useState(false);

  // 应用模板
  const applyTemplate = (template: Template) => {
    setBackgroundType(template.backgroundType);
    setBackgroundColor(template.backgroundColor);
    if (template.gradientStartColor)
      setGradientStartColor(template.gradientStartColor);
    if (template.gradientEndColor)
      setGradientEndColor(template.gradientEndColor);
    if (template.gradientDirection)
      setGradientDirection(template.gradientDirection);
    setIconColor(template.iconColor);
    setShape(template.shape);
    setIconSize(template.iconSize);
    if (template.iconRotation) setIconRotation(template.iconRotation);
  };

  // 下载图标
  const downloadIcon = async () => {
    if (!canvasRef.current) return;

    setIsGenerating(true);

    try {
      const dataUrl = await canvasRef.current.generateIcon(exportSize);

      // 下载
      const link = document.createElement("a");
      link.download = `icon-${Date.now()}.${exportFormat}`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("下载失败:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Typography.Title level={2} className="text-white">
          <FormattedMessage id="tools.iconDesigner.name" />
        </Typography.Title>
        <Typography.Text className="text-slate-400 text-lg">
          <FormattedMessage id="tools.iconDesigner.description" />
        </Typography.Text>
      </div>
      
      <Row gutter={[24, 24]} className="mt-6">
        {/* 左侧控制面板 */}
        <Col xs={24} lg={14}>
          <Space orientation="vertical" className="w-full">
            {/* 图标选择 */}
            <Card
              className="border-none bg-white/5"
              title={<><FontColorsOutlined /> <FormattedMessage id="tools.iconDesigner.icon_selection" /></>}
            >
              {/* 图标类型选择 */}
              <div className="mb-4">
                <Text strong className="mb-2 block">
                  <FormattedMessage id="tools.iconDesigner.icon_type" />
                </Text>
                <Radio.Group
                  value={iconType}
                  onChange={(e) => setIconType(e.target.value)}
                  className="mb-4"
                >
                  <Radio.Button value="fontawesome">
                    <FormattedMessage id="tools.iconDesigner.icon_type_fontawesome" />
                  </Radio.Button>
                  <Radio.Button value="text">
                    <FormattedMessage id="tools.iconDesigner.icon_type_text" />
                  </Radio.Button>
                </Radio.Group>
              </div>

              {/* FontAwesome图标选择器 */}
              {iconType === "fontawesome" && (
                <IconSelector
                  selectedIcon={selectedIcon}
                  onIconSelect={setSelectedIcon}
                />
              )}

              {/* 自定义文字输入 */}
              {iconType === "text" && (
                <div className="space-y-4">
                  <div>
                    <Text strong className="mb-2 block">
                      <FormattedMessage id="tools.iconDesigner.text_input" />
                    </Text>
                    <Input
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder={intl.formatMessage({ id: "tools.iconDesigner.text_input_placeholder" })}
                      className="font-mono"
                      maxLength={10}
                    />
                  </div>
                  <div>
                    <Text strong className="mb-2 block">
                      <FormattedMessage id="tools.iconDesigner.font_family" />
                    </Text>
                    <Select
                      value={fontFamily}
                      onChange={(value) => setFontFamily(value)}
                      className="w-full"
                    >
                      <Option value="Arial, sans-serif">Arial</Option>
                      <Option value="Helvetica, sans-serif">Helvetica</Option>
                      <Option value="Times, serif">Times</Option>
                      <Option value="Courier, monospace">Courier</Option>
                      <Option value="Georgia, serif">Georgia</Option>
                      <Option value="Verdana, sans-serif">Verdana</Option>
                    </Select>
                  </div>
                  <div>
                    <Text strong className="mb-2 block">
                      <FormattedMessage id="tools.iconDesigner.font_weight" />
                    </Text>
                    <Select
                      value={fontWeight}
                      onChange={(value) => setFontWeight(value)}
                      className="w-full"
                    >
                      <Option value="normal">Normal</Option>
                      <Option value="bold">Bold</Option>
                      <Option value="100">Thin</Option>
                      <Option value="300">Light</Option>
                      <Option value="500">Medium</Option>
                      <Option value="700">Bold</Option>
                      <Option value="900">Black</Option>
                    </Select>
                  </div>
                  <div>
                    <Text strong className="mb-2 block">
                      <FormattedMessage id="tools.iconDesigner.font_size" />: {fontSize}%
                    </Text>
                    <Slider
                      min={20}
                      max={90}
                      value={fontSize}
                      onChange={(value) => setFontSize(value as number)}
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* 图标设置 */}
            <Card
              className="border-none bg-white/5"
              title={<><StarOutlined /> <FormattedMessage id="tools.iconDesigner.icon_settings" /></>}
            >
              <div className="mb-4">
                <Text strong className="mb-2 block">
                  <FormattedMessage id="tools.iconDesigner.icon_color" />
                </Text>
                <div className="flex flex-wrap gap-2 mb-3">
                  {colorPresets.map((color) => (
                    <Tooltip title={color} key={color}>
                      <Button
                        size="small"
                        style={{ backgroundColor: color, border: iconColor === color ? '2px solid #8B5CF6' : '2px solid transparent' }}
                        onClick={() => setIconColor(color)}
                        className="w-8 h-8 p-0"
                      />
                    </Tooltip>
                  ))}
                </div>
                <Input
                  type="color"
                  value={iconColor}
                  onChange={(e) => setIconColor(e.target.value)}
                  className="w-full h-10"
                />
              </div>

              {iconType === "fontawesome" && (
                <div className="mb-4">
                  <Text strong className="mb-2 block">
                    <FormattedMessage id="tools.iconDesigner.icon_size" />: {iconSize}%
                  </Text>
                  <Slider
                    min={30}
                    max={80}
                    value={iconSize}
                    onChange={(value) => setIconSize(value as number)}
                  />
                </div>
              )}

              <div>
                <Text strong className="mb-2 block">
                  <FormattedMessage id="tools.iconDesigner.icon_rotation" />: {iconRotation}°
                </Text>
                <Slider
                  min={0}
                  max={360}
                  value={iconRotation}
                  onChange={(value) => setIconRotation(value as number)}
                />
              </div>
            </Card>

            {/* 背景设置 */}
            <Card
              className="border-none bg-white/5"
              title={<><AppstoreOutlined /> <FormattedMessage id="tools.iconDesigner.background_settings" /></>}
            >
              <div className="mb-4">
                <Text strong className="mb-2 block">
                  <FormattedMessage id="tools.iconDesigner.background_shape" />
                </Text>
                <Radio.Group
                  value={shape}
                  onChange={(e) => setShape(e.target.value)}
                >
                  <Radio.Button value="circle">
                    <FormattedMessage id="tools.iconDesigner.shape_circle" />
                  </Radio.Button>
                  <Radio.Button value="square">
                    <FormattedMessage id="tools.iconDesigner.shape_square" />
                  </Radio.Button>
                  <Radio.Button value="rounded-square">
                    <FormattedMessage id="tools.iconDesigner.shape_rounded_square" />
                  </Radio.Button>
                  <Radio.Button value="hexagon">
                    <FormattedMessage id="tools.iconDesigner.shape_hexagon" />
                  </Radio.Button>
                </Radio.Group>
              </div>

              <div>
                <Text strong className="mb-2 block">
                  <FormattedMessage id="tools.iconDesigner.background_color" />
                </Text>
                <div className="flex flex-wrap gap-2 mb-3">
                  {colorPresets.map((color) => (
                    <Tooltip title={color} key={color}>
                      <Button
                        size="small"
                        style={{ backgroundColor: color, border: backgroundColor === color ? '2px solid #8B5CF6' : '2px solid transparent' }}
                        onClick={() => setBackgroundColor(color)}
                        className="w-8 h-8 p-0"
                      />
                    </Tooltip>
                  ))}
                </div>
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full h-10"
                />
              </div>
            </Card>

            {/* 预设模板 */}
            <Card
              className="border-none bg-white/5"
              title={<><AppstoreOutlined /> <FormattedMessage id="tools.iconDesigner.preset_templates" /></>}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {templates.map((template, index) => (
                  <Button
                    key={index}
                    className="text-left"
                    onClick={() => applyTemplate(template)}
                    block
                  >
                    <div className="flex items-center mb-2">
                      <div
                        className="w-6 h-6 rounded mr-2"
                        style={{ backgroundColor: template.backgroundColor }}
                      />
                      <span className="font-medium">
                        <FormattedMessage id={`tools.iconDesigner.template_${template.name.toLowerCase().replace(' ', '_')}`} />
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {template.backgroundType === "solid" ? <FormattedMessage id="tools.iconDesigner.solid" /> : <FormattedMessage id="tools.iconDesigner.gradient" />} •{' '}
                      <FormattedMessage id={`tools.iconDesigner.shape_${template.shape.replace('-', '_')}`} /> • {template.iconSize}%
                    </div>
                  </Button>
                ))}
              </div>
            </Card>
          </Space>
        </Col>

        {/* 右侧预览和导出 */}
        <Col xs={24} lg={10}>
          <Space orientation="vertical" className="w-full">
            {/* 预览 */}
            <Card
              className="border-none bg-white/5 h-full"
              title={<><BorderOutlined /> <FormattedMessage id="tools.iconDesigner.preview" /></>}
            >
              <div className="flex flex-col items-center justify-center min-h-[300px] bg-gray-800/30 rounded-lg p-8">
                <EnhancedIconPreview
                  iconType={iconType}
                  icon={selectedIcon}
                  customText={customText}
                  iconColor={iconColor}
                  iconSize={iconType === "text" ? fontSize : iconSize}
                  iconRotation={iconRotation}
                  fontFamily={fontFamily}
                  fontWeight={fontWeight}
                  backgroundType={backgroundType}
                  backgroundColor={backgroundColor}
                  gradientStartColor={gradientStartColor}
                  gradientEndColor={gradientEndColor}
                  gradientDirection={gradientDirection}
                  shape={shape}
                  previewSize={200}
                />

                {/* 隐藏的Canvas用于导出 */}
                <div style={{ position: "absolute", left: "-9999px" }}>
                  <EnhancedIconCanvas
                    ref={canvasRef}
                    iconType={iconType}
                    icon={selectedIcon}
                    customText={customText}
                    iconColor={iconColor}
                    iconSize={iconType === "text" ? fontSize : iconSize}
                    iconRotation={iconRotation}
                    fontFamily={fontFamily}
                    fontWeight={fontWeight}
                    backgroundType={backgroundType}
                    backgroundColor={backgroundColor}
                    gradientStartColor={gradientStartColor}
                    gradientEndColor={gradientEndColor}
                    gradientDirection={gradientDirection}
                    shape={shape}
                    canvasSize={256}
                  />
                </div>
              </div>
            </Card>

            {/* 导出设置 */}
            <Card
              className="border-none bg-white/5"
              title={<><DownloadOutlined /> <FormattedMessage id="tools.iconDesigner.export_settings" /></>}
            >
              <div className="mb-4">
                <Text strong className="mb-2 block">
                  <FormattedMessage id="tools.iconDesigner.export_size" />
                </Text>
                <Radio.Group
                  value={exportSize}
                  onChange={(e) => setExportSize(e.target.value)}
                >
                  <Radio.Button value={64}>64×64</Radio.Button>
                  <Radio.Button value={128}>128×128</Radio.Button>
                  <Radio.Button value={256}>256×256</Radio.Button>
                  <Radio.Button value={512}>512×512</Radio.Button>
                </Radio.Group>
              </div>

              <div className="mb-6">
                <Text strong className="mb-2 block">
                  <FormattedMessage id="tools.iconDesigner.export_format" />
                </Text>
                <Radio.Group
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                >
                  <Radio.Button value="png">PNG</Radio.Button>
                  <Radio.Button value="svg">SVG</Radio.Button>
                </Radio.Group>
              </div>

              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={downloadIcon}
                loading={isGenerating}
                block
              >
                {isGenerating
                  ? <FormattedMessage id="tools.iconDesigner.generating_icon" />
                  : <FormattedMessage id="tools.iconDesigner.download_icon" />}
              </Button>
            </Card>

            {/* 使用说明 */}
            <Card className="border-none bg-white/5">
              <Collapse ghost>
                <Panel 
                  header={<><RotateLeftOutlined /> <FormattedMessage id="tools.iconDesigner.usage_guide" /></>}
                  key="1"
                >
                  <Paragraph className="text-sm">
                    <ul className="list-disc pl-5 space-y-1">
                      <li><FormattedMessage id="tools.iconDesigner.guide_1" /></li>
                      <li><FormattedMessage id="tools.iconDesigner.guide_2" /></li>
                      <li><FormattedMessage id="tools.iconDesigner.guide_3" /></li>
                      <li><FormattedMessage id="tools.iconDesigner.guide_4" /></li>
                      <li><FormattedMessage id="tools.iconDesigner.guide_5" /></li>
                      <li><FormattedMessage id="tools.iconDesigner.guide_6" /></li>
                    </ul>
                  </Paragraph>
                  
                  <Divider />
                  
                  <Paragraph className="text-sm">
                    <Text strong><FormattedMessage id="tools.iconDesigner.tips" /></Text>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                      <li><FormattedMessage id="tools.iconDesigner.tip_1" /></li>
                      <li><FormattedMessage id="tools.iconDesigner.tip_2" /></li>
                      <li><FormattedMessage id="tools.iconDesigner.tip_3" /></li>
                      <li><FormattedMessage id="tools.iconDesigner.tip_4" /></li>
                      <li><FormattedMessage id="tools.iconDesigner.tip_5" /></li>
                      <li><FormattedMessage id="tools.iconDesigner.tip_6" /></li>
                    </ul>
                  </Paragraph>
                </Panel>
              </Collapse>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
}
