import { useCopy } from "@/hooks/useCopy";
import {
  CheckOutlined,
  ClearOutlined,
  CopyOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Divider,
  Input,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// 字数统计结果类型
interface CountResult {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  chineseWords: number;
  englishWords: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  chineseCharacters: number;
}

export default function TextCounter() {
  const intl = useIntl();
  const copy = useCopy();

  // 输入文本
  const [text, setText] = useState("");
  // 统计结果
  const [counts, setCounts] = useState<CountResult>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    chineseWords: 0,
    englishWords: 0,
    sentences: 0,
    paragraphs: 0,
    lines: 0,
    chineseCharacters: 0,
  });
  // 复制状态
  const [copied, setCopied] = useState(false);

  // 统计文本
  const countText = (value: string) => {
    if (!value) {
      setCounts({
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        chineseWords: 0,
        englishWords: 0,
        sentences: 0,
        paragraphs: 0,
        lines: 0,
        chineseCharacters: 0,
      });
      return;
    }

    // 总字符数
    const characters = value.length;

    // 不含空格的字符数
    const charactersNoSpaces = value.replace(/\s/g, "").length;

    // 中文字符数
    const chineseCharacters = (value.match(/[\u4e00-\u9fa5]/g) || []).length;

    // 英文单词数
    const englishWords = value.match(/[a-zA-Z]+/g)?.length || 0;

    // 中文词数 (根据标点符号和空格分隔)
    const chineseText = value.match(/[\u4e00-\u9fa5]+/g)?.join("") || "";
    // 中文大约每2个字一个词
    const chineseWords = Math.ceil(chineseText.length / 2);

    // 总词数 (简单估算)
    const words = englishWords + chineseWords;

    // 句子数 (根据句号、问号、感叹号统计)
    const sentences =
      (value.match(/[.!?。！？]+/g) || []).length || (value.length > 0 ? 1 : 0);

    // 段落数 (根据空行分隔)
    const paragraphs =
      value.split(/\n\s*\n/).filter(Boolean).length ||
      (value.length > 0 ? 1 : 0);

    // 行数
    const lines = value.split("\n").length;

    setCounts({
      characters,
      charactersNoSpaces,
      words,
      chineseWords,
      englishWords,
      sentences,
      paragraphs,
      lines,
      chineseCharacters,
    });
  };

  // 文本变化时更新统计结果
  useEffect(() => {
    const timer = setTimeout(() => {
      countText(text);
    }, 0);
    return () => clearTimeout(timer);
  }, [text]);

  // 复制统计结果
  const copyResults = () => {
    const resultText = intl.formatMessage(
      { id: "tools.textCounter.copy_result_text" },
      {
        characters: counts.characters,
        charactersNoSpaces: counts.charactersNoSpaces,
        chineseCharacters: counts.chineseCharacters,
        words: counts.words,
        chineseWords: counts.chineseWords,
        englishWords: counts.englishWords,
        sentences: counts.sentences,
        paragraphs: counts.paragraphs,
        lines: counts.lines,
      }
    );

    copy(resultText).then((success) => {
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    });
  };

  // 清空输入
  const clearText = () => {
    setText("");
  };

  // 加载示例文本
  const loadExample = (type: "chinese" | "english") => {
    if (type === "chinese") {
      setText(
        "这是一个中文文本示例。\n\n这是第二段落，包含了一些中文内容。这个工具可以统计文本中的字符数、词数和其他信息。\n\n第三段落结束。"
      );
    } else {
      setText(
        "This is an English text example.\n\nThis is the second paragraph, containing English content. This tool can count characters, words, and other information in the text.\n\nThe third paragraph ends here."
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-8">
        <Title level={1}>
          <FormattedMessage id="tools.textCounter.name" />
        </Title>
        <Paragraph className="text-gray-500 dark:text-gray-400 mb-6">
          <FormattedMessage id="tools.textCounter.description" />
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {/* 统计结果 */}
        <Col xs={24} md={8}>
          <Card
            title={
              <div className="flex items-center justify-between">
                <span>
                  <FormattedMessage id="tools.textCounter.statistics_results" />
                </span>
                <Button
                  icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                  size="small"
                  onClick={copyResults}
                >
                  {copied ? (
                    <FormattedMessage id="tools.textCounter.copied" />
                  ) : (
                    <FormattedMessage id="tools.textCounter.copy_results" />
                  )}
                </Button>
              </div>
            }
            className="h-full"
          >
            <Space orientation="vertical" size="middle" className="w-full">
              {/* 字符统计 */}
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <Statistic
                    title={
                      <FormattedMessage id="tools.textCounter.statistics.total_characters" />
                    }
                    value={counts.characters}
                    valueStyle={{ fontSize: "1.5rem", fontWeight: "bold" }}
                  />
                </div>

                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <Statistic
                    title={
                      <FormattedMessage id="tools.textCounter.statistics.characters_no_spaces" />
                    }
                    value={counts.charactersNoSpaces}
                    valueStyle={{ fontSize: "1.5rem", fontWeight: "bold" }}
                  />
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                  <Statistic
                    title={
                      <FormattedMessage id="tools.textCounter.statistics.chinese_characters" />
                    }
                    value={counts.chineseCharacters}
                    valueStyle={{ fontSize: "1.5rem", fontWeight: "bold" }}
                  />
                </div>
              </div>

              <Divider>
                <FormattedMessage id="tools.textCounter.word_statistics" />
              </Divider>

              <div className="grid grid-cols-1 gap-3">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <Statistic
                    title={
                      <FormattedMessage id="tools.textCounter.statistics.total_words" />
                    }
                    value={counts.words}
                    valueStyle={{ fontSize: "1.5rem", fontWeight: "bold" }}
                  />
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                  <Statistic
                    title={
                      <FormattedMessage id="tools.textCounter.statistics.chinese_words" />
                    }
                    value={counts.chineseWords}
                    valueStyle={{ fontSize: "1.5rem", fontWeight: "bold" }}
                  />
                </div>

                <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-lg">
                  <Statistic
                    title={
                      <FormattedMessage id="tools.textCounter.statistics.english_words" />
                    }
                    value={counts.englishWords}
                    valueStyle={{ fontSize: "1.5rem", fontWeight: "bold" }}
                  />
                </div>
              </div>

              <Divider>
                <FormattedMessage id="tools.textCounter.other_statistics" />
              </Divider>

              <div className="grid grid-cols-1 gap-3">
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <Statistic
                    title={
                      <FormattedMessage id="tools.textCounter.statistics.sentences" />
                    }
                    value={counts.sentences}
                    valueStyle={{ fontSize: "1.5rem", fontWeight: "bold" }}
                  />
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg">
                  <Statistic
                    title={
                      <FormattedMessage id="tools.textCounter.statistics.paragraphs" />
                    }
                    value={counts.paragraphs}
                    valueStyle={{ fontSize: "1.5rem", fontWeight: "bold" }}
                  />
                </div>

                <div className="bg-pink-50 dark:bg-pink-900/20 p-3 rounded-lg">
                  <Statistic
                    title={
                      <FormattedMessage id="tools.textCounter.statistics.lines" />
                    }
                    value={counts.lines}
                    valueStyle={{ fontSize: "1.5rem", fontWeight: "bold" }}
                  />
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        {/* 文本输入和选项 */}
        <Col xs={24} md={16}>
          <Card
            title={<FormattedMessage id="tools.textCounter.input_text" />}
            className="mb-6"
          >
            <TextArea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={intl.formatMessage({
                id: "tools.textCounter.input_placeholder",
              })}
              rows={12}
              className="font-sans"
            />

            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                <Button
                  onClick={() => loadExample("chinese")}
                  type="dashed"
                  size="small"
                >
                  <FormattedMessage id="tools.textCounter.load_chinese_example" />
                </Button>
                <Button
                  onClick={() => loadExample("english")}
                  type="dashed"
                  size="small"
                >
                  <FormattedMessage id="tools.textCounter.load_english_example" />
                </Button>
              </div>

              <Button onClick={clearText} icon={<ClearOutlined />} danger>
                <FormattedMessage id="tools.textCounter.clear" />
              </Button>
            </div>
          </Card>

          <Card
            title={<FormattedMessage id="tools.textCounter.tool_options" />}
          >
            <Space orientation="vertical" size="middle" className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <InfoCircleOutlined className="text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <Text strong className="block mb-1">
                        <FormattedMessage id="tools.textCounter.how_it_works" />
                      </Text>
                      <Text type="secondary" className="text-sm">
                        <FormattedMessage id="tools.textCounter.explanation" />
                      </Text>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FileTextOutlined className="text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <Text strong className="block mb-1">
                        <FormattedMessage id="tools.textCounter.counting_method" />
                      </Text>
                      <Text type="secondary" className="text-sm">
                        <FormattedMessage id="tools.textCounter.method_details" />
                      </Text>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Tag color="blue">
                  1{" "}
                  {intl.formatMessage({
                    id: "tools.textCounter.tag_characters",
                  })}
                </Tag>
                <Tag color="green">
                  ~ {intl.formatMessage({ id: "tools.textCounter.tag_words" })}
                </Tag>
                <Tag color="orange">
                  1{" "}
                  {intl.formatMessage({
                    id: "tools.textCounter.tag_paragraphs",
                  })}
                </Tag>
                <Tag color="purple">
                  {counts.lines}{" "}
                  {intl.formatMessage({ id: "tools.textCounter.tag_lines" })}
                </Tag>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {!text && (
        <div className="flex items-center justify-center p-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <InfoCircleOutlined className="mr-2" />
          <FormattedMessage id="tools.textCounter.empty_notice" />
        </div>
      )}
    </div>
  );
}
