import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Slider,
  Input,
  ColorPicker,
  Tooltip,
} from "antd";
import {
  CopyOutlined,
  CheckOutlined,
  PlusOutlined,
  DeleteOutlined,
  BorderOuterOutlined,
  EllipsisOutlined,
  RotateLeftOutlined,
} from "@ant-design/icons";
import { useCopy } from "@/hooks/useCopy";
import { FormattedMessage, useIntl } from "react-intl";

const { Title, Text } = Typography;

// Gradient type
type GradientType = "linear" | "radial";

// Linear gradient direction
type LinearDirection =
  | "0deg"
  | "45deg"
  | "90deg"
  | "135deg"
  | "180deg"
  | "225deg"
  | "270deg"
  | "315deg"
  | "custom";

// Radial gradient shape
type RadialShape = "circle" | "ellipse";

// Radial gradient position
type RadialPosition =
  | "center"
  | "top"
  | "top right"
  | "right"
  | "bottom right"
  | "bottom"
  | "bottom left"
  | "left"
  | "top left";

// Color stop interface
interface ColorStop {
  id: string;
  color: string;
  position: number;
}

const CssGradientGenerator: React.FC = () => {
  const intl = useIntl();
  const copy = useCopy();

  // Gradient type
  const [gradientType, setGradientType] = useState<GradientType>("linear");

  // Linear gradient direction
  const [linearDirection, setLinearDirection] =
    useState<LinearDirection>("90deg");
  const [customAngle, setCustomAngle] = useState<number>(90);

  // Radial gradient settings
  const [radialShape, setRadialShape] = useState<RadialShape>("circle");
  const [radialPosition, setRadialPosition] =
    useState<RadialPosition>("center");

  // Color stops
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { id: "1", color: "#6366F1", position: 0 },
    { id: "2", color: "#8B5CF6", position: 100 },
  ]);

  // CSS code
  const [cssCode, setCssCode] = useState<string>("");

  // Copy status
  const [copied, setCopied] = useState<boolean>(false);

  // Preset colors
  const presetColors = [
    ["#6366F1", "#8B5CF6"], // Default purple gradient
    ["#F472B6", "#EC4899"], // Pink
    ["#10B981", "#059669"], // Green
    ["#3B82F6", "#2563EB"], // Blue
    ["#F59E0B", "#F97316"], // Orange
    ["#6B7280", "#374151"], // Gray
    ["#1E293B", "#0F172A"], // Dark blue-gray
  ];

  // Generate CSS code
  const generateCssCode = () => {
    let cssText = "";

    // Build stops string
    const stopsStr = colorStops
      .sort((a, b) => a.position - b.position)
      .map((stop) => `${stop.color} ${stop.position}%`)
      .join(", ");

    // Build code based on gradient type
    if (gradientType === "linear") {
      const direction =
        linearDirection === "custom" ? `${customAngle}deg` : linearDirection;
      cssText = `background: ${colorStops[0].color};\n`;
      cssText += `background: -webkit-linear-gradient(${direction}, ${stopsStr});\n`;
      cssText += `background: linear-gradient(${direction}, ${stopsStr});`;
    } else {
      cssText = `background: ${colorStops[0].color};\n`;
      cssText += `background: -webkit-radial-gradient(${radialPosition}, ${radialShape}, ${stopsStr});\n`;
      cssText += `background: radial-gradient(${radialShape} at ${radialPosition}, ${stopsStr});`;
    }

    return cssText;
  };

  // Update CSS code when dependencies change
  useEffect(() => {
    const newCssCode = generateCssCode();
    setCssCode(newCssCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    gradientType,
    linearDirection,
    customAngle,
    radialShape,
    radialPosition,
    colorStops,
    colorStops.length,
  ]);

  // Add new color stop
  const addColorStop = () => {
    const id = Date.now().toString();
    const colorCount = colorStops.length;

    // Set default color and position
    const color = "#818CF8";
    let position = 50;

    // If there are at least two colors, try inserting in the middle
    if (colorCount >= 2) {
      // Sort by position
      const sortedStops = [...colorStops].sort(
        (a, b) => a.position - b.position
      );
      // Find largest gap
      let maxGap = 0;
      let insertPosition = 50;

      for (let i = 0; i < sortedStops.length - 1; i++) {
        const gap = sortedStops[i + 1].position - sortedStops[i].position;
        if (gap > maxGap) {
          maxGap = gap;
          insertPosition = sortedStops[i].position + gap / 2;
        }
      }

      position = Math.round(insertPosition);
    }

    setColorStops([...colorStops, { id, color, position }]);
  };

  // Remove color stop
  const removeColorStop = (id: string) => {
    // Ensure at least 2 color stops remain
    if (colorStops.length <= 2) {
      return;
    }

    setColorStops(colorStops.filter((stop) => stop.id !== id));
  };

  // Update color stop
  const updateColorStop = (
    id: string,
    field: "color" | "position",
    value: string | number
  ) => {
    setColorStops(
      colorStops.map((stop) => {
        if (stop.id === id) {
          if (field === "position") {
            // Ensure position is within 0-100 range
            const numValue =
              typeof value === "string" ? parseInt(value, 10) : value;
            return { ...stop, position: Math.max(0, Math.min(100, numValue)) };
          }
          return { ...stop, [field]: value as string };
        }
        return stop;
      })
    );
  };

  // Apply preset colors
  const applyPreset = (colors: string[]) => {
    const newStops = colorStops.map((stop, index) => {
      // Only replace colors, keep original positions and IDs
      if (index < colors.length) {
        return { ...stop, color: colors[index] };
      }
      return stop;
    });

    setColorStops(newStops);
  };

  // Generate random gradient
  const generateRandomGradient = () => {
    // Generate random color
    const generateRandomColor = () => {
      const letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    };

    // Update color stops
    const newStops = colorStops.map((stop) => ({
      ...stop,
      color: generateRandomColor(),
    }));

    // Random gradient type and direction
    const newType = Math.random() > 0.5 ? "linear" : "radial";
    setGradientType(newType);

    if (newType === "linear") {
      const directions: LinearDirection[] = [
        "0deg",
        "45deg",
        "90deg",
        "135deg",
        "180deg",
        "225deg",
        "270deg",
        "315deg",
      ];
      const randomDirection =
        directions[Math.floor(Math.random() * directions.length)];
      setLinearDirection(randomDirection);
    } else {
      const shapes: RadialShape[] = ["circle", "ellipse"];
      const positions: RadialPosition[] = [
        "center",
        "top",
        "right",
        "bottom",
        "left",
        "top right",
        "bottom right",
        "bottom left",
        "top left",
      ];

      setRadialShape(shapes[Math.floor(Math.random() * shapes.length)]);
      setRadialPosition(
        positions[Math.floor(Math.random() * positions.length)]
      );
    }

    setColorStops(newStops);
  };

  // Copy CSS code
  const copyToClipboard = () => {
    copy(cssCode)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) =>
        console.error(
          intl.formatMessage({
            id: "tools.cssGradientGenerator.copy_failed",
          }),
          err
        )
      );
  };

  // Gradient preview style
  const gradientPreviewStyle = {
    background:
      gradientType === "linear"
        ? `linear-gradient(${
            linearDirection === "custom" ? `${customAngle}deg` : linearDirection
          }, ${colorStops
            .sort((a, b) => a.position - b.position)
            .map((stop) => `${stop.color} ${stop.position}%`)
            .join(", ")})`
        : `radial-gradient(${radialShape} at ${radialPosition}, ${colorStops
            .sort((a, b) => a.position - b.position)
            .map((stop) => `${stop.color} ${stop.position}%`)
            .join(", ")})`,
  };

  // Direction icons mapping
  const directionIcons: Record<string, React.ReactNode> = {
    "0deg": <div className="rotate-0 transform">→</div>,
    "45deg": <div className="rotate-45 transform">↗</div>,
    "90deg": <div className="rotate-90 transform">↑</div>,
    "135deg": <div className="rotate-135 transform">↖</div>,
    "180deg": <div className="rotate-180 transform">←</div>,
    "225deg": <div className="rotate-135 transform">↙</div>,
    "270deg": <div className="-rotate-90 transform">↓</div>,
    "315deg": <div className="-rotate-45 transform">↘</div>,
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-8">
        <Title level={1} className="text-white mb-2">
          <FormattedMessage id="tools.cssGradientGenerator.name" />
        </Title>
        <Text className="text-slate-400 text-lg">
          <FormattedMessage id="tools.cssGradientGenerator.description" />
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left panel - Controls */}
        <Col xs={24} lg={12}>
          <Space orientation="vertical" size="large" className="w-full">
            {/* Gradient type */}
            <Card className="bg-white/5 border-slate-700">
              <Title level={4} className="text-white !mb-4">
                <FormattedMessage id="tools.cssGradientGenerator.gradient_type" />
              </Title>
              <Space>
                <Button
                  type={gradientType === "linear" ? "primary" : "default"}
                  onClick={() => setGradientType("linear")}
                  icon={<BorderOuterOutlined />}
                >
                  <FormattedMessage id="tools.cssGradientGenerator.linear_gradient" />
                </Button>
                <Button
                  type={gradientType === "radial" ? "primary" : "default"}
                  onClick={() => setGradientType("radial")}
                  icon={<EllipsisOutlined />}
                >
                  <FormattedMessage id="tools.cssGradientGenerator.radial_gradient" />
                </Button>
              </Space>
            </Card>

            {/* Gradient parameters */}
            <Card className="bg-white/5 border-slate-700">
              <Title level={4} className="text-white !mb-4">
                {gradientType === "linear"
                  ? intl.formatMessage({
                      id: "tools.cssGradientGenerator.gradient_direction",
                    })
                  : intl.formatMessage({
                      id: "tools.cssGradientGenerator.gradient_shape_position",
                    })}
              </Title>

              {gradientType === "linear" ? (
                <div>
                  {/* Linear gradient directions */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {(
                      [
                        "225deg",
                        "270deg",
                        "315deg",
                        "180deg",
                        "0deg",
                        "135deg",
                        "90deg",
                        "45deg",
                      ] as LinearDirection[]
                    ).map((dir) => (
                      <Tooltip
                        title={intl.formatMessage({
                          id: `tools.cssGradientGenerator.direction_titles.${dir}`,
                        })}
                        key={dir}
                      >
                        <Button
                          type={linearDirection === dir ? "primary" : "default"}
                          className="w-full h-10 flex items-center justify-center"
                          onClick={() => setLinearDirection(dir)}
                        >
                          {directionIcons[dir]}
                        </Button>
                      </Tooltip>
                    ))}
                    <div
                      key="center"
                      className="flex items-center justify-center"
                    >
                      <div className="w-4 h-4 rounded-full bg-purple" />
                    </div>
                  </div>

                  {/* Custom angle */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <Text className="text-slate-300">
                        <FormattedMessage id="tools.cssGradientGenerator.custom_angle" />
                      </Text>
                      <Text className="text-slate-400">{customAngle}°</Text>
                    </div>

                    <div className="flex items-center gap-2">
                      <Slider
                        min={0}
                        max={359}
                        value={customAngle}
                        onChange={(value) => {
                          setCustomAngle(value);
                          setLinearDirection("custom");
                        }}
                        className="flex-1"
                      />
                      <Button
                        type={
                          linearDirection === "custom" ? "primary" : "default"
                        }
                        onClick={() => setLinearDirection("custom")}
                      >
                        <FormattedMessage id="tools.cssGradientGenerator.apply" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Radial gradient shape */}
                  <div className="mb-4">
                    <Text className="block mb-2 text-slate-300">
                      <FormattedMessage id="tools.cssGradientGenerator.gradient_shape" />
                    </Text>
                    <Space>
                      <Button
                        type={radialShape === "circle" ? "primary" : "default"}
                        onClick={() => setRadialShape("circle")}
                      >
                        <FormattedMessage id="tools.cssGradientGenerator.circle" />
                      </Button>
                      <Button
                        type={radialShape === "ellipse" ? "primary" : "default"}
                        onClick={() => setRadialShape("ellipse")}
                      >
                        <FormattedMessage id="tools.cssGradientGenerator.ellipse" />
                      </Button>
                    </Space>
                  </div>

                  {/* Radial gradient position */}
                  <div>
                    <Text className="block mb-2 text-slate-300">
                      <FormattedMessage id="tools.cssGradientGenerator.gradient_position" />
                    </Text>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          "top left",
                          "top",
                          "top right",
                          "left",
                          "center",
                          "right",
                          "bottom left",
                          "bottom",
                          "bottom right",
                        ] as RadialPosition[]
                      ).map((pos) => (
                        <Tooltip title={pos} key={pos}>
                          <Button
                            type={
                              radialPosition === pos ? "primary" : "default"
                            }
                            className="w-full h-10 flex items-center justify-center"
                            onClick={() => setRadialPosition(pos)}
                          >
                            <div className="w-3 h-3 rounded-full bg-current"></div>
                          </Button>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Gradient colors */}
            <Card className="bg-white/5 border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <Title level={4} className="text-white !mb-0">
                  <FormattedMessage id="tools.cssGradientGenerator.gradient_colors" />
                </Title>
                <Space>
                  <Tooltip
                    title={intl.formatMessage({
                      id: "tools.cssGradientGenerator.add_color_stop",
                    })}
                  >
                    <Button icon={<PlusOutlined />} onClick={addColorStop} />
                  </Tooltip>
                  <Tooltip
                    title={intl.formatMessage({
                      id: "tools.cssGradientGenerator.random_gradient",
                    })}
                  >
                    <Button
                      icon={<RotateLeftOutlined />}
                      onClick={generateRandomGradient}
                    />
                  </Tooltip>
                </Space>
              </div>

              {/* Color stops list */}
              <div className="mb-6">
                {colorStops
                  .sort((a, b) => a.position - b.position)
                  .map((stop) => (
                    <div key={stop.id} className="flex items-center gap-2 mb-3">
                      <ColorPicker
                        value={stop.color}
                        onChange={(color) =>
                          updateColorStop(stop.id, "color", color.toHexString())
                        }
                        showText={false}
                        className="w-10 h-10"
                      />

                      <Input
                        value={stop.color}
                        onChange={(e) =>
                          updateColorStop(stop.id, "color", e.target.value)
                        }
                        className="w-24"
                      />

                      <Input
                        type="number"
                        value={stop.position}
                        min="0"
                        max="100"
                        onChange={(e) =>
                          updateColorStop(
                            stop.id,
                            "position",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-20"
                      />
                      <Text className="text-slate-400">%</Text>

                      {colorStops.length > 2 && (
                        <Button
                          icon={<DeleteOutlined />}
                          danger
                          onClick={() => removeColorStop(stop.id)}
                          size="small"
                        />
                      )}
                    </div>
                  ))}
              </div>

              {/* Preset colors */}
              <div>
                <Text className="block mb-3 text-slate-300">
                  <FormattedMessage id="tools.cssGradientGenerator.preset_colors" />
                </Text>
                <div className="flex flex-wrap gap-2">
                  {presetColors.map((colors, index) => (
                    <Tooltip
                      key={index}
                      title={intl.formatMessage({
                        id: "tools.cssGradientGenerator.apply_preset",
                      })}
                    >
                      <Button
                        className="w-10 h-10"
                        style={{
                          background: `linear-gradient(to right, ${colors[0]}, ${colors[1]})`,
                        }}
                        onClick={() => applyPreset(colors)}
                      />
                    </Tooltip>
                  ))}
                </div>
              </div>
            </Card>
          </Space>
        </Col>

        {/* Right panel - Preview and code */}
        <Col xs={24} lg={12}>
          <Space orientation="vertical" size="large" className="w-full">
            {/* Gradient preview */}
            <Card className="bg-white/5 border-slate-700">
              <Title level={4} className="text-white !mb-4">
                <FormattedMessage id="tools.cssGradientGenerator.gradient_preview" />
              </Title>

              <div
                className="h-64 rounded-lg overflow-hidden shadow-lg border border-slate-600 relative"
                style={gradientPreviewStyle}
              ></div>

              <Text className="text-slate-400 mt-3 block">
                <FormattedMessage id="tools.cssGradientGenerator.preview_hint" />
              </Text>
            </Card>

            {/* CSS code */}
            <Card
              title={
                <FormattedMessage id="tools.cssGradientGenerator.css_code" />
              }
              extra={
                <Button
                  size="small"
                  icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 bg-slate-700 text-slate-300 hover:bg-slate-600"
                >
                  {copied
                    ? intl.formatMessage({
                        id: "tools.cssGradientGenerator.copied",
                      })
                    : intl.formatMessage({
                        id: "tools.cssGradientGenerator.copy_code",
                      })}
                </Button>
              }
              className="bg-white/5 border-slate-700"
            >
              <div className="relative">
                <pre className="bg-slate-800 rounded-lg p-4 text-sm overflow-auto text-white font-mono">
                  <span className="text-slate-400">
                    <FormattedMessage id="tools.cssGradientGenerator.css_comment" />
                  </span>
                  <br />
                  {cssCode.split("\n").map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </pre>
              </div>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default CssGradientGenerator;
