import React, { useState, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  Typography,
  Space,
  Row,
  Col,
  Checkbox,
  Tag,
  Alert,
} from "antd";
import {
  CopyOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useCopy } from "@/hooks/useCopy";
import { FormattedMessage, useIntl } from "react-intl";

const { Title, Text } = Typography;

// Define match item type
type MatchResult = RegExpExecArray;
type MatchResultArray = MatchResult[];

// Test regex
const testRegex = (
  regexString: string,
  flags: string,
  testString: string,
  setMatches: React.Dispatch<React.SetStateAction<MatchResultArray>>,
  setMatchCount: React.Dispatch<React.SetStateAction<number>>,
  setRegexError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  if (!regexString || !testString) {
    setMatches([]);
    setMatchCount(0);
    setRegexError(null);
    return;
  }

  try {
    // Validate regex expression
    new RegExp(regexString, flags);
    setRegexError(null);

    if (flags.includes("g")) {
      // Get all matches
      const allMatches: MatchResultArray = [];
      let match: RegExpExecArray | null;
      const regexWithGroups = new RegExp(regexString, flags);

      // Collect all matches and capture groups
      while ((match = regexWithGroups.exec(testString)) !== null) {
        allMatches.push(match);

        // Prevent infinite loop, if match length is 0, manually increment index
        if (match.index === regexWithGroups.lastIndex) {
          regexWithGroups.lastIndex++;
        }
      }

      setMatches(allMatches);
      setMatchCount(allMatches.length);
    } else {
      // Single match mode
      const regexWithoutG = new RegExp(regexString, flags.replace("g", ""));
      const execMatch = regexWithoutG.exec(testString);

      if (execMatch) {
        setMatches([execMatch]);
        setMatchCount(1);
      } else {
        setMatches([]);
        setMatchCount(0);
      }
    }
  } catch (error: unknown) {
    console.error("Regex error", error);
    setRegexError((error as Error).message);
    setMatches([]);
    setMatchCount(0);
  }
};

const RegexTester: React.FC = () => {
  const intl = useIntl();
  const copy = useCopy();

  // Regex input
  const [regexString, setRegexString] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");

  // Test results
  const [matches, setMatches] = useState<MatchResultArray>([]);
  const [matchCount, setMatchCount] = useState(0);

  // Advanced options
  const [showGroups, setShowGroups] = useState(true);
  const [regexError, setRegexError] = useState<string | null>(null);

  // Copy status
  const [copiedRegex, setCopiedRegex] = useState(false);

  // Safe HTML escape
  const escapeHtml = (text: string) => {
    if (text === undefined || text === null) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Common regex examples
  const examples = [
    {
      name: intl.formatMessage({ id: "tools.regexTester.examples.email" }),
      pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
      flags: "g",
      testText: "test@example.com, invalid-email, another.email@domain.co.uk",
    },
    {
      name: intl.formatMessage({ id: "tools.regexTester.examples.phone" }),
      pattern: "1[3-9]\\d{9}",
      flags: "g",
      testText: intl.formatMessage({
        id: "tools.regexTester.example_texts.phone",
      }),
    },
    {
      name: intl.formatMessage({ id: "tools.regexTester.examples.url" }),
      pattern:
        "https?://[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
      flags: "g",
      testText: intl.formatMessage({
        id: "tools.regexTester.example_texts.url",
      }),
    },
    {
      name: intl.formatMessage({ id: "tools.regexTester.examples.ip" }),
      pattern:
        "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
      flags: "g",
      testText: intl.formatMessage({
        id: "tools.regexTester.example_texts.ip",
      }),
    },
    {
      name: intl.formatMessage({ id: "tools.regexTester.examples.chinese" }),
      pattern: "[\\u4e00-\\u9fa5]",
      flags: "g",
      testText: intl.formatMessage({
        id: "tools.regexTester.example_texts.chinese",
      }),
    },
  ];

  // Update test results when input changes
  useEffect(() => {
    testRegex(
      regexString,
      flags,
      testString,
      setMatches,
      setMatchCount,
      setRegexError
    );
  }, [regexString, flags, testString]);

  // Copy regex
  const copyRegex = () => {
    const regexText = `/${regexString}/${flags}`;
    copy(regexText).then(() => {
      setCopiedRegex(true);
      setTimeout(() => setCopiedRegex(false), 2000);
    });
  };

  // Apply example
  const applyExample = (example: {
    pattern: string;
    flags: string;
    testText: string;
  }) => {
    setRegexString(example.pattern);
    setFlags(example.flags);
    setTestString(example.testText);
  };

  // Clear all
  const clearAll = () => {
    setRegexString("");
    setFlags("g");
    setTestString("");
    setMatches([]);
    setMatchCount(0);
    setRegexError(null);
  };

  // Toggle flag
  const toggleFlag = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ""));
    } else {
      setFlags(flags + flag);
    }
  };

  // Render highlighted text
  const renderHighlightedText = () => {
    if (!testString) {
      return (
        <Text type="secondary">
          <FormattedMessage id="tools.regexTester.no_matches" />
        </Text>
      );
    }

    if (matchCount === 0) {
      return (
        <Text type="secondary">
          <FormattedMessage id="tools.regexTester.no_matches" />
        </Text>
      );
    }

    // Create highlighted text
    let result = "";
    let lastIndex = 0;

    // Sort matches by index
    const sortedMatches = [...matches].sort((a, b) => a.index - b.index);

    // Process each match
    sortedMatches.forEach((match) => {
      // Add text before match
      result += escapeHtml(testString.substring(lastIndex, match.index));

      // Add highlighted match content
      result += `<span style="background-color:rgba(139, 92, 246, 0.5); color:white; font-weight:bold; padding:0 4px; border-radius:3px;">${escapeHtml(
        match[0]
      )}</span>`;

      // Update lastIndex
      lastIndex = match.index + match[0].length;
    });

    // Add text after last match
    if (lastIndex < testString.length) {
      result += escapeHtml(testString.substring(lastIndex));
    }

    return (
      <div
        dangerouslySetInnerHTML={{ __html: result }}
        className="whitespace-pre-wrap font-mono text-sm"
      />
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-8">
        <Title level={1} className="text-white mb-2">
          <FormattedMessage id="tools.regexTester.name" />
        </Title>
        <Text className="text-slate-400 text-lg">
          <FormattedMessage id="tools.regexTester.description" />
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left panel - Regex input and options */}
        <Col xs={24} lg={8}>
          <Space orientation="vertical" size="middle" className="w-full">
            {/* Common examples */}
            <Card className="bg-white/5 border-slate-700">
              <Title level={4} className="text-white !mb-4">
                <FormattedMessage id="tools.regexTester.examples.title" />
              </Title>
              <Space orientation="vertical" size="small" className="w-full">
                {examples.map((example, index) => (
                  <Button
                    key={index}
                    className="text-left w-full"
                    onClick={() => applyExample(example)}
                  >
                    {example.name}
                  </Button>
                ))}
              </Space>
            </Card>

            {/* Regex options */}
            <Card className="bg-white/5 border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Title level={4} className="text-white !mb-0">
                  <FormattedMessage id="tools.regexTester.options" />
                </Title>
                <Button
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={clearAll}
                >
                  <FormattedMessage id="tools.regexTester.clear" />
                </Button>
              </div>

              <Space orientation="vertical" size="large" className="w-full">
                <div>
                  <Text strong className="block mb-2 text-slate-300">
                    <FormattedMessage id="tools.regexTester.flags" />
                  </Text>
                  <Space wrap>
                    <Button
                      type={flags.includes("g") ? "primary" : "default"}
                      size="small"
                      onClick={() => toggleFlag("g")}
                    >
                      g (
                      <FormattedMessage id="tools.regexTester.flag_descriptions.global" />
                      )
                    </Button>
                    <Button
                      type={flags.includes("i") ? "primary" : "default"}
                      size="small"
                      onClick={() => toggleFlag("i")}
                    >
                      i (
                      <FormattedMessage id="tools.regexTester.flag_descriptions.case_insensitive" />
                      )
                    </Button>
                    <Button
                      type={flags.includes("m") ? "primary" : "default"}
                      size="small"
                      onClick={() => toggleFlag("m")}
                    >
                      m (
                      <FormattedMessage id="tools.regexTester.flag_descriptions.multiline" />
                      )
                    </Button>
                    <Button
                      type={flags.includes("s") ? "primary" : "default"}
                      size="small"
                      onClick={() => toggleFlag("s")}
                    >
                      s (
                      <FormattedMessage id="tools.regexTester.flag_descriptions.dotall" />
                      )
                    </Button>
                  </Space>
                </div>

                <div>
                  <Checkbox
                    checked={showGroups}
                    onChange={() => setShowGroups(!showGroups)}
                  >
                    <FormattedMessage id="tools.regexTester.show_capture_groups" />
                  </Checkbox>
                </div>
              </Space>
            </Card>
          </Space>
        </Col>

        {/* Right panel - Test area */}
        <Col xs={24} lg={16}>
          <Space orientation="vertical" size="middle" className="w-full">
            {/* Regex expression */}
            <Card className="bg-white/5 border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Title level={4} className="text-white !mb-0">
                  <FormattedMessage id="tools.regexTester.regex_expression" />
                </Title>
                <Button
                  size="small"
                  icon={
                    copiedRegex ? <CheckCircleOutlined /> : <CopyOutlined />
                  }
                  onClick={copyRegex}
                  disabled={!regexString}
                >
                  {copiedRegex
                    ? intl.formatMessage({ id: "common.copySuccess" })
                    : intl.formatMessage({ id: "tools.regexTester.copy" })}
                </Button>
              </div>

              <div className="relative">
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    value={regexString}
                    onChange={(e) => setRegexString(e.target.value)}
                    placeholder={intl.formatMessage({
                      id: "tools.regexTester.enter_regex",
                    })}
                    style={{ width: '80%' }}
                  />
                  <Input
                    value={flags}
                    onChange={(e) => setFlags(e.target.value)}
                    placeholder="flags"
                    style={{ width: '20%' }}
                  />
                </Space.Compact>
              </div>

              {regexError && (
                <Alert
                  message={intl.formatMessage({
                    id: "tools.regexTester.regex_error",
                  })}
                  description={regexError}
                  type="error"
                  showIcon
                  className="mt-2"
                />
              )}
            </Card>

            {/* Test input */}
            <Card className="bg-white/5 border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Title level={4} className="text-white !mb-0">
                  <FormattedMessage id="tools.regexTester.test_text" />
                </Title>
                <Text type="secondary" className="text-sm">
                  <FormattedMessage id="tools.regexTester.character_count" />:
                  <Tag color="purple" className="!mb-0 ml-1">
                    {testString.length}
                  </Tag>
                </Text>
              </div>

              <Input.TextArea
                value={testString}
                onChange={(e) => setTestString(e.target.value)}
                placeholder={intl.formatMessage({
                  id: "tools.regexTester.enter_test_text",
                })}
                rows={6}
              />
            </Card>

            {/* Match results */}
            <Card className="bg-white/5 border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <Title level={4} className="text-white !mb-0">
                  <FormattedMessage id="tools.regexTester.match_results" />
                </Title>
                <Text type="secondary" className="text-sm">
                  <FormattedMessage id="tools.regexTester.match_count" />:
                  <Tag color="purple" className="!mb-0 ml-1">
                    {matchCount}
                  </Tag>
                </Text>
              </div>

              {testString ? (
                <div className="space-y-4">
                  {/* Highlighted matched text */}
                  <div className="bg-slate-800 rounded-md p-4">
                    {matchCount > 0 ? (
                      <>
                        <div className="mb-3 text-slate-400 text-xs flex items-center justify-between">
                          <span>
                            <FormattedMessage id="tools.regexTester.found" />
                            <span className="text-purple font-medium mx-1">
                              {matchCount}
                            </span>
                            <FormattedMessage id="tools.regexTester.matches" />
                          </span>
                          <span className="text-slate-400 text-xs">
                            <FormattedMessage id="tools.regexTester.original_text_length" />
                            : {testString.length}{" "}
                            <FormattedMessage id="tools.regexTester.result_characters" />
                          </span>
                        </div>

                        {renderHighlightedText()}
                      </>
                    ) : (
                      <Text type="secondary">
                        <FormattedMessage id="tools.regexTester.no_matches" />
                      </Text>
                    )}
                  </div>

                  {/* Capture groups details */}
                  {showGroups && matchCount > 0 && (
                    <div>
                      <Title level={5} className="text-white !mb-2">
                        <FormattedMessage id="tools.regexTester.capture_groups" />
                      </Title>
                      <div className="space-y-3">
                        {Array.isArray(matches) &&
                          matches.map((match, index) => (
                            <div
                              key={index}
                              className="bg-slate-800 rounded-md p-3"
                            >
                              <div className="text-xs text-slate-400 mb-2">
                                <FormattedMessage id="tools.regexTester.match" />{" "}
                                #{index + 1} (
                                <FormattedMessage id="tools.regexTester.position" />
                                : {match.index})
                              </div>

                              <div className="space-y-2">
                                {match.length > 0 && (
                                  <div className="flex items-start gap-2">
                                    <span className="text-xs text-slate-400 min-w-[40px]">
                                      <FormattedMessage id="tools.regexTester.full" />
                                      :
                                    </span>
                                    <code className="text-sm text-white bg-purple-500/20 px-2 py-1 rounded break-all">
                                      {escapeHtml(match[0] || "")}
                                    </code>
                                  </div>
                                )}

                                {match.length > 1 &&
                                  Array.from(
                                    { length: match.length - 1 },
                                    (_, i) => i + 1
                                  ).map((group) => (
                                    <div
                                      key={group}
                                      className="flex items-start gap-2"
                                    >
                                      <span className="text-xs text-slate-400 min-w-[40px]">
                                        <FormattedMessage id="tools.regexTester.group" />{" "}
                                        {group}:
                                      </span>
                                      <code className="text-sm text-white bg-purple-500/20 px-2 py-1 rounded break-all">
                                        {match[group]
                                          ? escapeHtml(match[group])
                                          : intl.formatMessage({
                                            id: "tools.regexTester.empty",
                                          })}
                                      </code>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center p-4 text-slate-400">
                  <InfoCircleOutlined className="mr-2" />
                  <FormattedMessage id="tools.regexTester.enter_text_prompt" />
                </div>
              )}
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default RegexTester;
