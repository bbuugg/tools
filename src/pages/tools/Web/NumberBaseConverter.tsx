import { useCopy } from "@/hooks/useCopy";
import {
  CheckOutlined,
  ClearOutlined,
  CopyOutlined,
  ReloadOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Collapse,
  Input,
  Row,
  Space,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

export default function NumberBaseConverter() {
  const intl = useIntl();
  const copy = useCopy();

  // 状态管理
  const [inputValue, setInputValue] = useState("");
  const [outputValue, setOutputValue] = useState("");
  const [fromBase, setFromBase] = useState("10"); // 默认从十进制
  const [toBase, setToBase] = useState("2"); // 默认转换为二进制
  const [customFromBase, setCustomFromBase] = useState("10");
  const [customToBase, setCustomToBase] = useState("2");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [useUppercase, setUseUppercase] = useState(true);
  const [addPrefix, setAddPrefix] = useState(false);
  const [groupDigits, setGroupDigits] = useState(false);

  // 有效的进制列表
  const baseOptions = [
    {
      id: "2",
      name: intl.formatMessage({ id: "tools.numberBaseConverter.binary" }),
    },
    {
      id: "8",
      name: intl.formatMessage({ id: "tools.numberBaseConverter.octal" }),
    },
    {
      id: "10",
      name: intl.formatMessage({ id: "tools.numberBaseConverter.decimal" }),
    },
    {
      id: "16",
      name: intl.formatMessage({ id: "tools.numberBaseConverter.hex" }),
    },
    {
      id: "custom",
      name: intl.formatMessage({ id: "tools.numberBaseConverter.custom" }),
    },
  ];

  // 当输入值、进制等变化时自动转换
  useEffect(() => {
    if (inputValue.trim() === "") {
      setOutputValue("");
      setError("");
      return;
    }

    try {
      const result = convertBase(
        inputValue,
        fromBase === "custom" ? customFromBase : fromBase,
        toBase === "custom" ? customToBase : toBase
      );
      setOutputValue(result);
      setError("");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          intl.formatMessage({ id: "tools.numberBaseConverter.general_error" })
        );
      }
      setOutputValue("");
    }
  }, [
    inputValue,
    fromBase,
    toBase,
    customFromBase,
    customToBase,
    useUppercase,
    addPrefix,
    groupDigits,
    intl,
  ]);

  // 进制转换函数
  const convertBase = (value: string, from: string, to: string): string => {
    const fromBaseInt = parseInt(from, 10);
    const toBaseInt = parseInt(to, 10);

    // 验证进制范围
    if (
      fromBaseInt < 2 ||
      fromBaseInt > 36 ||
      toBaseInt < 2 ||
      toBaseInt > 36
    ) {
      throw new Error(
        intl.formatMessage({ id: "tools.numberBaseConverter.base_error" })
      );
    }

    // 移除输入中可能存在的前缀和格式化字符
    const cleanValue = value.replace(/^0[bxo]|[\s_]/gi, "");

    // 尝试转换为十进制
    let decimalValue;
    try {
      decimalValue = parseInt(cleanValue, fromBaseInt);

      // 检查NaN，表明输入无效
      if (isNaN(decimalValue)) {
        throw new Error();
      }
    } catch {
      throw new Error(
        intl.formatMessage({ id: "tools.numberBaseConverter.input_error" })
      );
    }

    // 转换为目标进制
    let result = decimalValue.toString(toBaseInt);

    // 大写十六进制或更高进制字母
    if (useUppercase && toBaseInt > 10) {
      result = result.toUpperCase();
    }

    // 添加适当的前缀
    if (addPrefix) {
      if (toBaseInt === 2) result = "0b" + result;
      else if (toBaseInt === 8) result = "0o" + result;
      else if (toBaseInt === 16) result = "0x" + result;
    }

    // 分组数字以提高可读性
    if (groupDigits) {
      // 二进制每8位分组
      if (toBaseInt === 2) {
        result =
          result
            .replace(/^0[b]/i, "")
            .match(/.{1,8}/g)
            ?.join("_") || result;
        if (addPrefix) result = "0b" + result;
      }
      // 十六进制每4位分组
      else if (toBaseInt === 16) {
        result =
          result
            .replace(/^0[x]/i, "")
            .match(/.{1,4}/g)
            ?.join("_") || result;
        if (addPrefix) result = "0x" + result;
      }
      // 其他进制每4位分组
      else if (toBaseInt !== 10) {
        result =
          result
            .replace(/^0[bo]/i, "")
            .match(/.{1,4}/g)
            ?.join("_") || result;
        if (addPrefix) {
          if (toBaseInt === 8) result = "0o" + result;
        }
      }
    }

    return result;
  };

  // 复制输出内容到剪贴板
  const copyToClipboard = () => {
    if (!outputValue) return;

    copy(outputValue).then((success) => {
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    });
  };

  // 清空输入和输出
  const clearAll = () => {
    setInputValue("");
    setOutputValue("");
    setError("");
  };

  // 加载示例
  const loadExample = () => {
    const examples: Record<string, string> = {
      "2": intl.formatMessage({
        id: "tools.numberBaseConverter.example_binary",
      }),
      "8": intl.formatMessage({
        id: "tools.numberBaseConverter.example_octal",
      }),
      "10": intl.formatMessage({
        id: "tools.numberBaseConverter.example_decimal",
      }),
      "16": intl.formatMessage({ id: "tools.numberBaseConverter.example_hex" }),
    };

    // 从当前选择的进制加载示例
    const currentFromBase = fromBase === "custom" ? customFromBase : fromBase;
    const example = examples[currentFromBase] || examples["10"];
    setInputValue(example);
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-8">
        <Title level={1}>
          <FormattedMessage id="tools.numberBaseConverter.name" />
        </Title>
        <Text className="text-slate-400 text-lg">
          <FormattedMessage id="tools.numberBaseConverter.description" />
        </Text>
      </div>

      <Card>
        <Space orientation="vertical" size="large" className="w-full">
          {/* 进制选择 */}
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <div>
                <Text strong className="block mb-2">
                  <FormattedMessage id="tools.numberBaseConverter.from_base" />
                </Text>
                <div className="flex flex-wrap gap-2 mb-3">
                  {baseOptions.map((option) => (
                    <Button
                      key={option.id}
                      type={fromBase === option.id ? "primary" : "default"}
                      onClick={() => setFromBase(option.id)}
                      size="middle"
                    >
                      {option.name}
                    </Button>
                  ))}
                </div>

                {fromBase === "custom" && (
                  <div>
                    <Text className="block mb-1">
                      <FormattedMessage id="tools.numberBaseConverter.custom_base_from" />
                    </Text>
                    <Input
                      type="number"
                      min="2"
                      max="36"
                      value={customFromBase}
                      onChange={(e) => setCustomFromBase(e.target.value)}
                      className="w-32"
                      placeholder="2-36"
                    />
                  </div>
                )}
              </div>
            </Col>

            <Col xs={24} md={12}>
              <div>
                <Text strong className="block mb-2">
                  <FormattedMessage id="tools.numberBaseConverter.to_base" />
                </Text>
                <div className="flex flex-wrap gap-2 mb-3">
                  {baseOptions.map((option) => (
                    <Button
                      key={option.id}
                      type={toBase === option.id ? "primary" : "default"}
                      onClick={() => setToBase(option.id)}
                      size="middle"
                    >
                      {option.name}
                    </Button>
                  ))}
                </div>

                {toBase === "custom" && (
                  <div>
                    <Text className="block mb-1">
                      <FormattedMessage id="tools.numberBaseConverter.custom_base_to" />
                    </Text>
                    <Input
                      type="number"
                      min="2"
                      max="36"
                      value={customToBase}
                      onChange={(e) => setCustomToBase(e.target.value)}
                      className="w-32"
                      placeholder="2-36"
                    />
                  </div>
                )}
              </div>
            </Col>
          </Row>

          {/* 高级选项 */}
          <Collapse
            ghost
            onChange={() => setShowAdvancedOptions(!showAdvancedOptions)}
            items={[
              {
                key: "advanced-options",
                label: (
                  <div className="flex items-center gap-2">
                    <SettingOutlined />
                    <FormattedMessage id="tools.numberBaseConverter.advanced_options" />
                  </div>
                ),
                children: (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <Checkbox
                      checked={useUppercase}
                      onChange={(e) => setUseUppercase(e.target.checked)}
                    >
                      <FormattedMessage id="tools.numberBaseConverter.use_uppercase" />
                    </Checkbox>
                    <Checkbox
                      checked={addPrefix}
                      onChange={(e) => setAddPrefix(e.target.checked)}
                    >
                      <FormattedMessage id="tools.numberBaseConverter.add_prefix" />
                    </Checkbox>
                    <Checkbox
                      checked={groupDigits}
                      onChange={(e) => setGroupDigits(e.target.checked)}
                    >
                      <FormattedMessage id="tools.numberBaseConverter.group_digits" />
                    </Checkbox>
                  </div>
                ),
              },
            ]}
          />

          {/* 输入区域 */}
          <div>
            <Text strong className="block mb-2">
              <FormattedMessage id="tools.numberBaseConverter.input_label" />
            </Text>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={intl.formatMessage({
                id: "tools.numberBaseConverter.input_placeholder",
              })}
              rows={4}
              className="font-mono"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between flex-wrap gap-2">
            <Space>
              <Button onClick={loadExample} icon={<ReloadOutlined />}>
                <FormattedMessage id="tools.numberBaseConverter.load_example" />
              </Button>
              <Button onClick={clearAll} icon={<ClearOutlined />} danger>
                <FormattedMessage id="tools.numberBaseConverter.clear" />
              </Button>
            </Space>
          </div>

          {/* 错误消息 */}
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* 输出区域 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <Text strong>
                <FormattedMessage id="tools.numberBaseConverter.result_label" />
              </Text>
              {outputValue && (
                <Button
                  icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                  onClick={copyToClipboard}
                  size="small"
                >
                  {copied ? (
                    <FormattedMessage id="tools.numberBaseConverter.copy_success" />
                  ) : (
                    <FormattedMessage id="tools.numberBaseConverter.copy" />
                  )}
                </Button>
              )}
            </div>
            <TextArea
              value={outputValue}
              readOnly
              placeholder={intl.formatMessage({
                id: "tools.numberBaseConverter.output_placeholder",
              })}
              rows={4}
              className="font-mono bg-gray-50 dark:bg-gray-800"
            />
          </div>
        </Space>
      </Card>
    </div>
  );
}
