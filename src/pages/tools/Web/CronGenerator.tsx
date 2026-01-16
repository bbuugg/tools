import React, { useState, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Select,
  Radio,
  Alert,
  Tooltip,
  Popover,
} from "antd";
import {
  CalendarOutlined,
  CopyOutlined,
  CheckOutlined,
  QuestionOutlined,
} from "@ant-design/icons";
import { useCopy } from "@/hooks/useCopy";
import { FormattedMessage, useIntl } from "react-intl";

const { Title, Text } = Typography;

// Preset cron expressions
const presets = [
  { label: "every_minute", value: "* * * * *" }, // Every minute
  { label: "every_hour", value: "0 * * * *" }, // Every hour
  { label: "every_day_midnight", value: "0 0 * * *" }, // Every day at midnight
  { label: "every_day_morning", value: "0 8 * * *" }, // Every day at 8am
  { label: "every_monday", value: "0 9 * * MON" }, // Every Monday at 9am
  { label: "every_month_first", value: "0 0 1 * *" }, // First day of every month at midnight
];

// Expression types
type ExpressionType =
  | "every"
  | "specific"
  | "range"
  | "interval"
  | "not_specified";

// Expression field definition
interface ExpressionField {
  type: ExpressionType;
  value?: string | number;
  start?: string | number;
  end?: string | number;
  step?: string | number;
}

// Default values configuration
interface FieldDefaultValues {
  value: string | number;
  start: string | number;
  end: string | number;
  step: number;
}

const CronGenerator: React.FC = () => {
  const intl = useIntl();
  const copy = useCopy();

  // Use a valid preset as initial expression - daily at midnight (without seconds)
  const [customExpression, setCustomExpression] = useState("0 0 * * *");
  const [isCustomExpressionValid, setIsCustomExpressionValid] = useState(true);
  const [hasUserEdited, setHasUserEdited] = useState(false);

  // Generated expression
  const [generatedExpression, setGeneratedExpression] = useState("0 0 * * *");

  // Human-readable description of the expression
  const [expressionDescription, setExpressionDescription] = useState("");

  // Next execution times
  const [nextExecutions, setNextExecutions] = useState<string[]>([]);

  // Copy status
  const [copied, setCopied] = useState(false);

  // Execution count
  const [executionCount, setExecutionCount] = useState(10);

  // Expression field settings
  const [second, setSecond] = useState<ExpressionField>({
    type: "specific",
    value: 0,
  });
  const [minute, setMinute] = useState<ExpressionField>({
    type: "specific",
    value: 0,
  });
  const [hour, setHour] = useState<ExpressionField>({
    type: "specific",
    value: 0,
  });
  const [day, setDay] = useState<ExpressionField>({ type: "every" });
  const [month, setMonth] = useState<ExpressionField>({ type: "every" });
  const [week, setWeek] = useState<ExpressionField>({ type: "not_specified" });
  const [year, setYear] = useState<ExpressionField>({ type: "not_specified" });

  // Component initialization - set a safe default state
  useEffect(() => {
    try {
      // Safely initialize
      setCustomExpression("0 0 * * *"); // Daily at midnight (standard 5-field format)
      setGeneratedExpression("0 0 * * *");

      // Avoid triggering parsing during initialization
      setTimeout(() => {
        parseCustomExpression();
      }, 100);
    } catch (err) {
      console.error("Initialization error:", err);
    }
  }, []);

  // Parse custom expression when it changes
  useEffect(() => {
    parseCustomExpression();
  }, [customExpression, executionCount]);

  // Update generated expression when parts change
  useEffect(() => {
    generateExpression();
  }, [second, minute, hour, day, month, week, year]);

  // Parse custom expression
  const parseCustomExpression = () => {
    if (!customExpression || customExpression.trim() === "") {
      setIsCustomExpressionValid(false);
      setNextExecutions([]);
      setExpressionDescription("");
      return;
    }

    try {
      // In a real implementation, this would use cron-parser and cronstrue libraries
      // For now, we'll simulate the parsing

      // Simple validation for common cron patterns
      const cronPattern =
        /^(\\*|[0-9,*/-]+)\s+(\\*|[0-9,*/-]+)\s+(\\*|[0-9,*/-]+)\s+(\\*|[0-9,*/-]+)\s+(\\*|[0-9,*/-A-Z,]+)/;
      const isValid = cronPattern.test(customExpression.trim());

      if (!isValid) {
        throw new Error("Invalid cron expression format");
      }

      // Simulate getting next execution times
      const next: string[] = [];
      const now = new Date();
      for (let i = 0; i < executionCount; i++) {
        // Simulate next execution times based on the expression
        const nextTime = new Date(now.getTime() + (i + 1) * 60000); // Every minute for demo
        next.push(nextTime.toLocaleString());
      }

      setNextExecutions(next);
      setIsCustomExpressionValid(true);

      // Set a sample description (in real implementation, this would come from cronstrue)
      setExpressionDescription(
        intl.formatMessage({ id: "tools.cronGenerator.simulated_description" })
      );
    } catch (e) {
      console.error("Invalid cron expression:", e);
      setIsCustomExpressionValid(false);
      setNextExecutions([]);
      setExpressionDescription("");
    }
  };

  // Generate expression
  const generateExpression = () => {
    // Get values for each field
    // Note: Generate 5-field standard Cron format (without seconds)
    const minuteValue = getFieldValue(minute, "*");
    const hourValue = getFieldValue(hour, "*");
    const dayValue = getFieldValue(day, "*");
    const monthValue = getFieldValue(month, "*");
    const weekValue = getFieldValue(week, "?").replace("?", "*"); // Ensure ? is replaced with *

    // Combine into full expression
    const expression = `${minuteValue} ${hourValue} ${dayValue} ${monthValue} ${weekValue}`;

    setGeneratedExpression(expression);
    setCustomExpression(expression);
    // Reset user edit state when generating new expression
    setHasUserEdited(false);
  };

  // Get field value based on type
  const getFieldValue = (
    field: ExpressionField,
    defaultValue: string
  ): string => {
    switch (field.type) {
      case "every":
        return defaultValue;
      case "specific":
        return field.value?.toString() || defaultValue;
      case "range":
        return `${field.start}-${field.end}`;
      case "interval":
        return `${field.start || "*"}/${field.step || 1}`;
      case "not_specified":
        return defaultValue === "?" ? "?" : "*";
      default:
        return defaultValue;
    }
  };

  // Handle type change
  const handleTypeChange = (field: string, type: ExpressionType) => {
    const defaultValues: Record<string, FieldDefaultValues> = {
      second: { value: 0, start: 0, end: 59, step: 1 },
      minute: { value: 0, start: 0, end: 59, step: 1 },
      hour: { value: 0, start: 0, end: 23, step: 1 },
      day: { value: 1, start: 1, end: 31, step: 1 },
      month: { value: 1, start: 1, end: 12, step: 1 },
      week: { value: "MON", start: "MON", end: "FRI", step: 1 },
      year: { value: 2024, start: 2024, end: 2030, step: 1 },
    };

    const newField: ExpressionField = {
      type,
      value: defaultValues[field].value,
      start: defaultValues[field].start,
      end: defaultValues[field].end,
      step: defaultValues[field].step,
    };

    switch (field) {
      case "second":
        setSecond(newField);
        break;
      case "minute":
        setMinute(newField);
        break;
      case "hour":
        setHour(newField);
        break;
      case "day":
        setDay(newField);
        break;
      case "month":
        setMonth(newField);
        break;
      case "week":
        setWeek(newField);
        break;
      case "year":
        setYear(newField);
        break;
    }
  };

  // Handle field property change
  const handleFieldChange = (
    field: string,
    prop: string,
    value: string | number
  ) => {
    const updateField = (current: ExpressionField): ExpressionField => {
      return { ...current, [prop]: value };
    };

    switch (field) {
      case "second":
        setSecond(updateField(second));
        break;
      case "minute":
        setMinute(updateField(minute));
        break;
      case "hour":
        setHour(updateField(hour));
        break;
      case "day":
        setDay(updateField(day));
        break;
      case "month":
        setMonth(updateField(month));
        break;
      case "week":
        setWeek(updateField(week));
        break;
      case "year":
        setYear(updateField(year));
        break;
    }
  };

  // Copy expression
  const copyExpression = () => {
    copy(customExpression)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error(
          intl.formatMessage({ id: "tools.cronGenerator.copy_failed" }),
          err
        );
      });
  };

  // Render type options
  const renderTypeOptions = (field: string, currentType: ExpressionType) => {
    const types: ExpressionType[] = ["every", "specific", "range", "interval"];

    // Only day and week can be mutually exclusive (one specified, the other can be unspecified)
    if (field === "day" || field === "week") {
      types.push("not_specified");
    }

    return (
      <Radio.Group
        value={currentType}
        onChange={(e) => handleTypeChange(field, e.target.value)}
        optionType="button"
        buttonStyle="solid"
        className="mb-3"
      >
        {types.map((type) => (
          <Radio.Button key={type} value={type}>
            <FormattedMessage id={`tools.cronGenerator.${type}`} />
          </Radio.Button>
        ))}
      </Radio.Group>
    );
  };

  // Render field input
  const renderFieldInput = (field: string, currentField: ExpressionField) => {
    const options: Record<string, string[]> = {
      month: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
      week: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
    };

    switch (currentField.type) {
      case "specific":
        if (field === "month" || field === "week") {
          return (
            <Select
              value={currentField.value?.toString()}
              onChange={(value) => handleFieldChange(field, "value", value)}
              className="w-full"
            >
              {options[field].map((opt) => (
                <Select.Option key={opt} value={opt}>
                  {opt}
                </Select.Option>
              ))}
            </Select>
          );
        } else {
          return (
            <Input
              type="number"
              value={currentField.value}
              onChange={(e) =>
                handleFieldChange(field, "value", parseInt(e.target.value))
              }
              className="w-full"
            />
          );
        }

      case "range":
        if (field === "month" || field === "week") {
          return (
            <Space className="w-full">
              <Select
                value={currentField.start?.toString()}
                onChange={(value) => handleFieldChange(field, "start", value)}
                className="w-1/3"
              >
                {options[field].map((opt) => (
                  <Select.Option key={opt} value={opt}>
                    {opt}
                  </Select.Option>
                ))}
              </Select>
              <Text className="mx-2">
                {intl.formatMessage({ id: "tools.cronGenerator.to" })}
              </Text>
              <Select
                value={currentField.end?.toString()}
                onChange={(value) => handleFieldChange(field, "end", value)}
                className="w-1/3"
              >
                {options[field].map((opt) => (
                  <Select.Option key={opt} value={opt}>
                    {opt}
                  </Select.Option>
                ))}
              </Select>
            </Space>
          );
        } else {
          return (
            <Space className="w-full">
              <Input
                type="number"
                value={currentField.start}
                onChange={(e) =>
                  handleFieldChange(field, "start", parseInt(e.target.value))
                }
                className="w-1/3"
              />
              <Text className="mx-2">
                {intl.formatMessage({ id: "tools.cronGenerator.to" })}
              </Text>
              <Input
                type="number"
                value={currentField.end}
                onChange={(e) =>
                  handleFieldChange(field, "end", parseInt(e.target.value))
                }
                className="w-1/3"
              />
            </Space>
          );
        }

      case "interval":
        return (
          <Space className="w-full">
            <Text>
              {intl.formatMessage({ id: "tools.cronGenerator.from" })}
            </Text>
            <Input
              type="number"
              value={currentField.start === "*" ? "" : currentField.start}
              placeholder="*"
              onChange={(e) =>
                handleFieldChange(
                  field,
                  "start",
                  e.target.value ? parseInt(e.target.value) : "*"
                )
              }
              className="w-1/4"
            />
            <Text>
              {intl.formatMessage({ id: "tools.cronGenerator.step" })}
            </Text>
            <Input
              type="number"
              value={currentField.step}
              onChange={(e) =>
                handleFieldChange(field, "step", parseInt(e.target.value) || 1)
              }
              className="w-1/4"
            />
          </Space>
        );

      default:
        return null;
    }
  };

  const renderFieldSection = (
    field: string,
    currentField: ExpressionField,
    label: string
  ) => {
    return (
      <div className="mb-6">
        <Title level={5} className="text-white mb-3">
          {label}
        </Title>
        {renderTypeOptions(field, currentField.type)}
        {renderFieldInput(field, currentField)}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-8">
        <Title level={1} className="text-white mb-2">
          <FormattedMessage id="tools.cronGenerator.name" />
        </Title>
        <Text className="text-slate-400 text-lg">
          <FormattedMessage id="tools.cronGenerator.description" />
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left: Expression Generator */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <FormattedMessage id="tools.cronGenerator.generate" />
                <Popover
                  title={<FormattedMessage id="tools.cronGenerator.presets" />}
                  placement="bottom"
                  content={
                    <Space orientation="vertical" className="w-full">
                      {presets.map((preset) => (
                        <Button
                          key={preset.value}
                          className="text-left justify-start"
                          onClick={() => {
                            setCustomExpression(preset.value);
                            setHasUserEdited(false);
                          }}
                          block
                        >
                          <div>
                            <Text strong>
                              <FormattedMessage
                                id={`tools.cronGenerator.${preset.label}`}
                              />
                            </Text>
                            <br />
                            <Text code className="text-xs">
                              {preset.value}
                            </Text>
                          </div>
                        </Button>
                      ))}
                    </Space>
                  }
                >
                  <Button
                    size="small"
                    shape="round"
                    icon={<QuestionOutlined />}
                  />
                </Popover>
              </Space>
            }
          >
            {renderFieldSection(
              "minute",
              minute,
              intl.formatMessage({ id: "tools.cronGenerator.minute" })
            )}
            {renderFieldSection(
              "hour",
              hour,
              intl.formatMessage({ id: "tools.cronGenerator.hour" })
            )}
            {renderFieldSection(
              "day",
              day,
              intl.formatMessage({ id: "tools.cronGenerator.day" })
            )}
            {renderFieldSection(
              "month",
              month,
              intl.formatMessage({ id: "tools.cronGenerator.month" })
            )}
            {renderFieldSection(
              "week",
              week,
              intl.formatMessage({ id: "tools.cronGenerator.week" })
            )}
          </Card>
        </Col>

        {/* Right: Preview and Parser */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <FormattedMessage id="tools.cronGenerator.expression_preview" />
            }
          >
            <div className="rounded-lg p-4 border border-slate-700 mb-4">
              <div className="flex items-center justify-between">
                <Text code className="text-lg break-all">
                  {generatedExpression}
                </Text>
                <Tooltip
                  title={intl.formatMessage({
                    id: "tools.cronGenerator.copy_expression",
                  })}
                >
                  <Button
                    icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                    onClick={copyExpression}
                    size="small"
                  />
                </Tooltip>
              </div>
              {expressionDescription && (
                <div className="mt-3 text-slate-400 text-sm">
                  {expressionDescription}
                </div>
              )}
            </div>

            <div className="mb-4">
              <Text strong className="block mb-2 text-slate-300">
                <FormattedMessage id="tools.cronGenerator.custom_expression" />
              </Text>
              <Input
                value={customExpression}
                onChange={(e) => {
                  setCustomExpression(e.target.value);
                  setHasUserEdited(true);
                }}
                className="border-slate-700"
              />
              {!isCustomExpressionValid && hasUserEdited && (
                <Alert
                  message={intl.formatMessage({
                    id: "tools.cronGenerator.invalid_expression",
                  })}
                  type="error"
                  showIcon
                  className="mt-2"
                />
              )}
            </div>

            <div className="mb-6">
              <Text strong className="block mb-2 text-slate-300">
                <FormattedMessage id="tools.cronGenerator.next_executions_count" />
              </Text>
              <Input
                type="number"
                value={executionCount}
                onChange={(e) =>
                  setExecutionCount(parseInt(e.target.value) || 10)
                }
                min="1"
                max="100"
                className="border-slate-700"
              />
            </div>

            {/* Execution times list */}
            {nextExecutions.length > 0 && (
              <div className="mb-6">
                <Title level={4} className="text-white mb-4">
                  <FormattedMessage id="tools.cronGenerator.execution_times" />
                </Title>
                <div className="rounded-lg border border-slate-700 max-h-60 overflow-y-auto">
                  {nextExecutions.map((time, index) => (
                    <div
                      key={index}
                      className="p-3 border-b border-slate-700 last:border-0 flex items-center"
                    >
                      <CalendarOutlined className="mr-2 text-purple" />
                      {time}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CronGenerator;
