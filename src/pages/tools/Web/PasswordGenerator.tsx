import { useCopy } from "@/hooks/useCopy";
import {
  CheckOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Checkbox,
  Col,
  Input,
  Row,
  Slider,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

const { Title, Text } = Typography;

type CharsetOptionKey = "uppercase" | "lowercase" | "digits" | "symbols";

const DEFAULT_SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/\\|";
const SIMILAR_CHARS = "Il1O0o";
const AMBIGUOUS_SYMBOLS = "{}[]()/\\'\"`~,;:.<>";

const PasswordGenerator: React.FC = () => {
  const intl = useIntl();
  const copy = useCopy();

  const [length, setLength] = useState(12);
  const [count, setCount] = useState(10);
  const [forceAllSets, setForceAllSets] = useState(true);
  const [includeSets, setIncludeSets] = useState<
    Record<CharsetOptionKey, boolean>
  >({
    uppercase: true,
    lowercase: true,
    digits: true,
    symbols: true,
  });
  const [customInclude, setCustomInclude] = useState("");
  const [excludeChars, setExcludeChars] = useState(SIMILAR_CHARS);
  const [avoidSimilar, setAvoidSimilar] = useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | "all" | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const charset = useMemo(() => {
    let chars = "";
    if (includeSets.uppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeSets.lowercase) chars += "abcdefghijklmnopqrstuvwxyz";
    if (includeSets.digits) chars += "0123456789";
    if (includeSets.symbols) chars += DEFAULT_SYMBOLS;
    if (customInclude) chars += customInclude;

    let excludes = excludeChars || "";
    if (avoidSimilar) excludes += SIMILAR_CHARS;
    if (avoidAmbiguous) excludes += AMBIGUOUS_SYMBOLS;

    if (excludes) {
      const excludeSet = new Set(excludes.split(""));
      chars = Array.from(new Set(chars.split("")))
        .filter((c) => !excludeSet.has(c))
        .join("");
    }
    return chars;
  }, [includeSets, customInclude, excludeChars, avoidSimilar, avoidAmbiguous]);

  const ensureAllSets = (candidate: string): boolean => {
    if (!forceAllSets) return true;
    const checks = [
      !includeSets.uppercase || /[A-Z]/.test(candidate),
      !includeSets.lowercase || /[a-z]/.test(candidate),
      !includeSets.digits || /[0-9]/.test(candidate),
      !includeSets.symbols ||
        new RegExp(`[${escapeForRegex(DEFAULT_SYMBOLS)}]`).test(candidate),
    ];
    return checks.every(Boolean);
  };

  const generateOne = (pool: string, len: number): string => {
    if (!pool) return "";
    const array = new Uint32Array(len);
    if (
      typeof window !== "undefined" &&
      window.crypto &&
      window.crypto.getRandomValues
    ) {
      window.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < len; i++)
        array[i] = Math.floor(Math.random() * 0xffffffff);
    }
    const chars = [] as string[];
    for (let i = 0; i < len; i++) {
      const idx = array[i] % pool.length;
      chars.push(pool[idx]);
    }
    return chars.join("");
  };

  const generate = () => {
    setLoading(true);
    const pool = charset;
    const list: string[] = [];
    const target = Math.min(Math.max(count, 1), 100);
    const len = Math.min(Math.max(length, 4), 128);

    let attempts = 0;
    while (list.length < target && attempts < target * 100) {
      attempts++;
      const candidate = generateOne(pool, len);
      if (candidate && ensureAllSets(candidate)) {
        list.push(candidate);
      }
    }
    setResults(list);
    setLoading(false);
  };

  const copyOne = async (idx: number) => {
    try {
      await copy(results[idx] || "");
      setCopiedIndex(idx);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      // Empty catch block for error handling
    }
  };

  const copyAll = async () => {
    try {
      await copy(results.join("\n"));
      setCopiedIndex("all");
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch {
      // Empty catch block for error handling
    }
  };

  const downloadTxt = () => {
    const blob = new Blob([results.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "passwords.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSet = (key: CharsetOptionKey) => {
    setIncludeSets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const reset = () => {
    setLength(12);
    setCount(10);
    setForceAllSets(true);
    setIncludeSets({
      uppercase: true,
      lowercase: true,
      digits: true,
      symbols: true,
    });
    setCustomInclude("");
    setExcludeChars(SIMILAR_CHARS);
    setAvoidSimilar(true);
    setAvoidAmbiguous(false);
    setResults([]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-8">
        <Title level={1} className="text-white mb-2">
          <FormattedMessage id="tools.passwordGenerator.name" />
        </Title>
        <Text className="text-slate-400 text-lg">
          <FormattedMessage id="tools.passwordGenerator.description" />
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card className="bg-white/5 border-slate-700">
            <Title level={4} className="text-white !mb-4">
              <FormattedMessage id="tools.passwordGenerator.settings" />
            </Title>

            <Space orientation="vertical" size="large" className="w-full">
              <div>
                <Text strong className="block mb-2 text-slate-300">
                  <FormattedMessage id="tools.passwordGenerator.length" /> (
                  {length})
                </Text>
                <Slider
                  min={4}
                  max={128}
                  value={length}
                  onChange={(value) => setLength(value || 0)}
                  tooltip={{
                    formatter: (value) =>
                      `${value} ${intl.formatMessage({
                        id: "tools.passwordGenerator.chars",
                      })}`,
                  }}
                />
              </div>

              <div>
                <Text strong className="block mb-2 text-slate-300">
                  <FormattedMessage id="tools.passwordGenerator.count" /> (
                  {count})
                </Text>
                <Slider
                  min={1}
                  max={100}
                  value={count}
                  onChange={(value) => setCount(value || 0)}
                  tooltip={{
                    formatter: (value) =>
                      `${value} ${intl.formatMessage({
                        id: "tools.passwordGenerator.passwords",
                      })}`,
                  }}
                />
              </div>

              <div>
                <Text strong className="block mb-2 text-slate-300">
                  <FormattedMessage id="tools.passwordGenerator.charset_options" />
                </Text>
                <Space orientation="vertical" className="w-full">
                  <Checkbox
                    checked={includeSets.uppercase}
                    onChange={() => toggleSet("uppercase")}
                  >
                    <FormattedMessage id="tools.passwordGenerator.set_uppercase" />
                  </Checkbox>
                  <Checkbox
                    checked={includeSets.lowercase}
                    onChange={() => toggleSet("lowercase")}
                  >
                    <FormattedMessage id="tools.passwordGenerator.set_lowercase" />
                  </Checkbox>
                  <Checkbox
                    checked={includeSets.digits}
                    onChange={() => toggleSet("digits")}
                  >
                    <FormattedMessage id="tools.passwordGenerator.set_digits" />
                  </Checkbox>
                  <Checkbox
                    checked={includeSets.symbols}
                    onChange={() => toggleSet("symbols")}
                  >
                    <FormattedMessage id="tools.passwordGenerator.set_symbols" />
                  </Checkbox>
                  <Checkbox
                    checked={forceAllSets}
                    onChange={(e) => setForceAllSets(e.target.checked)}
                  >
                    <FormattedMessage id="tools.passwordGenerator.force_all_sets" />
                  </Checkbox>
                </Space>
              </div>

              <div>
                <Text strong className="block mb-2 text-slate-300">
                  <FormattedMessage id="tools.passwordGenerator.custom_include" />
                </Text>
                <Input
                  value={customInclude}
                  onChange={(e) => setCustomInclude(e.target.value)}
                  placeholder={intl.formatMessage({
                    id: "tools.passwordGenerator.custom_include_placeholder",
                  })}
                  className="border-slate-700"
                />
              </div>

              <div>
                <Text strong className="block mb-2 text-slate-300">
                  <FormattedMessage id="tools.passwordGenerator.exclude_chars" />
                </Text>
                <Input
                  value={excludeChars}
                  onChange={(e) => setExcludeChars(e.target.value)}
                  placeholder={intl.formatMessage({
                    id: "tools.passwordGenerator.exclude_chars_placeholder",
                  })}
                  className="border-slate-700 mb-2"
                />

                <Space>
                  <Button
                    type={avoidSimilar ? "primary" : "default"}
                    size="small"
                    onClick={() => setAvoidSimilar(!avoidSimilar)}
                  >
                    {avoidSimilar
                      ? intl.formatMessage({
                          id: "tools.passwordGenerator.avoid_similar_on",
                        })
                      : intl.formatMessage({
                          id: "tools.passwordGenerator.avoid_similar_off",
                        })}
                  </Button>
                  <Button
                    type={avoidAmbiguous ? "primary" : "default"}
                    size="small"
                    onClick={() => setAvoidAmbiguous(!avoidAmbiguous)}
                  >
                    {avoidAmbiguous
                      ? intl.formatMessage({
                          id: "tools.passwordGenerator.avoid_ambiguous_on",
                        })
                      : intl.formatMessage({
                          id: "tools.passwordGenerator.avoid_ambiguous_off",
                        })}
                  </Button>
                </Space>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card className="bg-white/5 border-slate-700">
            <div className="flex flex-wrap gap-3 mb-6">
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={generate}
                loading={loading}
              >
                <FormattedMessage id="tools.passwordGenerator.generate" />
              </Button>
              <Button
                icon={
                  copiedIndex === "all" ? <CheckOutlined /> : <CopyOutlined />
                }
                onClick={copyAll}
                disabled={results.length === 0}
              >
                <FormattedMessage id="tools.passwordGenerator.copy_all" />
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={downloadTxt}
                disabled={results.length === 0}
              >
                <FormattedMessage id="tools.passwordGenerator.download" />
              </Button>
              <Button icon={<DeleteOutlined />} onClick={reset} danger>
                <FormattedMessage id="tools.passwordGenerator.reset" />
              </Button>
            </div>

            <div>
              <Title level={4} className="text-white !mb-4">
                <FormattedMessage id="tools.passwordGenerator.results" />
                {results.length > 0 && (
                  <Tag color="purple" className="ml-2">
                    {results.length}{" "}
                    <FormattedMessage id="tools.passwordGenerator.passwords" />
                  </Tag>
                )}
              </Title>

              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <Spin size="large" />
                </div>
              ) : results.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Text>
                    <FormattedMessage id="tools.passwordGenerator.no_result" />
                  </Text>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto no-scrollbar">
                  {results.map((pwd, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 border-b border-slate-600"
                    >
                      <Tooltip title={pwd} placement="left">
                        <Text className="truncate cursor-pointer">{pwd}</Text>
                      </Tooltip>

                      <Button
                        type="text"
                        size="small"
                        icon={
                          copiedIndex === idx ? (
                            <CheckOutlined />
                          ) : (
                            <CopyOutlined />
                          )
                        }
                        onClick={() => copyOne(idx)}
                        className="ml-2"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

function escapeForRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default PasswordGenerator;
