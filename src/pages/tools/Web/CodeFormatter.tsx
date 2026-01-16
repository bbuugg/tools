import { useCopy } from "@/hooks/useCopy";
import {
  CheckOutlined,
  ClearOutlined,
  CodeOutlined,
  CopyOutlined,
  DownloadOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Input,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

const { Title, Text, Paragraph } = Typography;

// 代码语言类型
type CodeLanguage =
  | "javascript"
  | "typescript"
  | "jsx"
  | "tsx"
  | "html"
  | "css"
  | "json"
  | "markdown"
  | "yaml"
  | "graphql"
  | "sql";

// 语言配置
const languages: {
  [key in CodeLanguage]: { name: string; parser: string; tabWidth: number };
} = {
  javascript: { name: "JavaScript", parser: "babel", tabWidth: 2 },
  typescript: { name: "TypeScript", parser: "typescript", tabWidth: 2 },
  jsx: { name: "JSX", parser: "babel", tabWidth: 2 },
  tsx: { name: "TSX", parser: "typescript", tabWidth: 2 },
  html: { name: "HTML", parser: "html", tabWidth: 2 },
  css: { name: "CSS", parser: "css", tabWidth: 2 },
  json: { name: "JSON", parser: "json", tabWidth: 2 },
  markdown: { name: "Markdown", parser: "markdown", tabWidth: 2 },
  yaml: { name: "YAML", parser: "yaml", tabWidth: 2 },
  graphql: { name: "GraphQL", parser: "graphql", tabWidth: 2 },
  sql: { name: "SQL", parser: "sql", tabWidth: 2 },
};

// 格式化选项
interface FormatOptions {
  printWidth: number;
  tabWidth: number;
  useTabs: boolean;
  semi: boolean;
  singleQuote: boolean;
  trailingComma: "none" | "es5" | "all";
  bracketSpacing: boolean;
  arrowParens: "avoid" | "always";
  proseWrap: "always" | "never" | "preserve";
}

// 添加全局接口，使prettier可以在window上使用
declare global {
  interface Window {
    prettier: {
      format: (source: string, options: Record<string, unknown>) => string;
      [key: string]: unknown;
    };
    prettierPlugins: {
      [key: string]: unknown;
    };
  }
}

const CodeFormatter: React.FC = () => {
  const intl = useIntl();
  const copy = useCopy();

  // 输入与输出
  const [inputCode, setInputCode] = useState("");
  const [outputCode, setOutputCode] = useState("");
  const [selectedLanguage, setSelectedLanguage] =
    useState<CodeLanguage>("javascript");

  // 格式化选项 - 使用默认值，不再提供UI界面修改
  const [formatOptions, setFormatOptions] = useState<FormatOptions>({
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: false,
    trailingComma: "es5",
    bracketSpacing: true,
    arrowParens: "always",
    proseWrap: "preserve",
  });

  // 其他状态
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  const [prettierLoaded, setPrettierLoaded] = useState(false);
  const [fileMissingWarning, setFileMissingWarning] = useState<string | null>(
    null
  );

  // 检查Prettier所需的文件是否存在
  useEffect(() => {
    // 检查核心库
    fetch("/lib/prettier/standalone.js")
      .then((res) => {
        if (!res.ok) {
          setFileMissingWarning(
            intl.formatMessage({
              id: "tools.codeFormatter.warning_missing_files",
            })
          );
        }
      })
      .catch(() => {
        setFileMissingWarning(
          intl.formatMessage({
            id: "tools.codeFormatter.warning_missing_files",
          })
        );
      });
  }, [intl]);

  // 动态加载Prettier库
  useEffect(() => {
    if (typeof window === "undefined" || prettierLoaded) return;

    setLoadingModules(true);

    // 检查Prettier全局对象是否已存在
    if (window.prettier && window.prettierPlugins) {
      console.log("Prettier已加载，使用已有实例");
      setPrettierLoaded(true);
      setLoadingModules(false);
      return;
    }

    // 动态创建脚本标签加载prettier库
    const loadPrettier = () => {
      // 创建prettier核心脚本
      const prettierScript = document.createElement("script");
      prettierScript.src = "/lib/prettier/standalone.js";
      prettierScript.async = true;
      prettierScript.onload = () => {
        console.log(
          intl.formatMessage({ id: "tools.codeFormatter.prettier_core_loaded" })
        );

        // 创建babel解析器脚本（也包含estree插件）
        const babelScript = document.createElement("script");
        babelScript.src = "/lib/prettier/parser-babel.js";
        babelScript.async = true;
        babelScript.onload = () => {
          console.log(
            intl.formatMessage({
              id: "tools.codeFormatter.babel_parser_loaded",
            })
          );

          // 创建html解析器脚本
          const htmlScript = document.createElement("script");
          htmlScript.src = "/lib/prettier/parser-html.js";
          htmlScript.async = true;
          htmlScript.onload = () => {
            console.log(
              intl.formatMessage({
                id: "tools.codeFormatter.html_parser_loaded",
              })
            );

            // 创建postcss解析器脚本
            const cssScript = document.createElement("script");
            cssScript.src = "/lib/prettier/parser-postcss.js";
            cssScript.async = true;
            cssScript.onload = () => {
              console.log(
                intl.formatMessage({
                  id: "tools.codeFormatter.css_parser_loaded",
                })
              );

              // 创建typescript解析器脚本
              const tsScript = document.createElement("script");
              tsScript.src = "/lib/prettier/parser-typescript.js";
              tsScript.async = true;
              tsScript.onload = () => {
                console.log(
                  intl.formatMessage({
                    id: "tools.codeFormatter.typescript_parser_loaded",
                  })
                );

                // 创建markdown解析器脚本
                const mdScript = document.createElement("script");
                mdScript.src = "/lib/prettier/parser-markdown.js";
                mdScript.async = true;
                mdScript.onload = () => {
                  console.log(
                    intl.formatMessage({
                      id: "tools.codeFormatter.markdown_parser_loaded",
                    })
                  );

                  // 创建yaml解析器脚本
                  const yamlScript = document.createElement("script");
                  yamlScript.src = "/lib/prettier/parser-yaml.js";
                  yamlScript.async = true;
                  yamlScript.onload = () => {
                    console.log(
                      intl.formatMessage({
                        id: "tools.codeFormatter.yaml_parser_loaded",
                      })
                    );

                    // 创建graphql解析器脚本
                    const graphqlScript = document.createElement("script");
                    graphqlScript.src = "/lib/prettier/parser-graphql.js";
                    graphqlScript.async = true;
                    graphqlScript.onload = () => {
                      console.log(
                        intl.formatMessage({
                          id: "tools.codeFormatter.graphql_parser_loaded",
                        })
                      );

                      // 所有脚本加载完成
                      console.log(
                        intl.formatMessage({
                          id: "tools.codeFormatter.all_modules_loaded",
                        })
                      );
                      setPrettierLoaded(true);
                      setLoadingModules(false);
                    };
                    document.body.appendChild(graphqlScript);
                  };
                  document.body.appendChild(yamlScript);
                };
                document.body.appendChild(mdScript);
              };
              document.body.appendChild(tsScript);
            };
            document.body.appendChild(cssScript);
          };
          document.body.appendChild(htmlScript);
        };
        document.body.appendChild(babelScript);
      };

      prettierScript.onerror = (error) => {
        console.error(
          intl.formatMessage({ id: "tools.codeFormatter.load_error" }),
          error
        );
        setError(intl.formatMessage({ id: "tools.codeFormatter.load_failed" }));
        setLoadingModules(false);
      };

      document.body.appendChild(prettierScript);
    };

    // 调用加载函数
    loadPrettier();

    return () => {
      // 清理函数不需要移除脚本，因为它们会一直被缓存和重用
    };
  }, [prettierLoaded, intl]);

  // 语言改变时更新 tabWidth
  useEffect(() => {
    // 根据语言自动设置tabWidth
    setFormatOptions((prev) => ({
      ...prev,
      tabWidth: languages[selectedLanguage].tabWidth,
    }));
  }, [selectedLanguage]);

  useEffect(() => {
    if (selectedLanguage && inputCode) {
      formatCode();
    }
  }, [selectedLanguage, inputCode]);

  // 格式化代码函数
  const formatCode = async () => {
    if (!inputCode.trim()) {
      setError(
        intl.formatMessage({ id: "tools.codeFormatter.error_empty_input" })
      );
      setOutputCode("");
      return;
    }

    setIsFormatting(true);
    setError(null);

    try {
      // 确保在客户端环境
      if (typeof window === "undefined") {
        throw new Error(
          intl.formatMessage({ id: "tools.codeFormatter.error_browser_only" })
        );
      }

      // 确保prettier已加载
      if (!window.prettier || !window.prettierPlugins) {
        throw new Error(
          intl.formatMessage({
            id: "tools.codeFormatter.error_library_loading",
          })
        );
      }

      // 获取当前语言的解析器
      const parser = languages[selectedLanguage]?.parser;

      if (!parser) {
        throw new Error(
          intl
            .formatMessage({
              id: "tools.codeFormatter.error_unsupported_language",
            })
            .replace("{language}", selectedLanguage)
        );
      }

      // 处理特殊情况
      let actualParser = parser;
      if (parser === "json") {
        actualParser = "json";
      }

      // SQL格式化特殊处理，使用babel解析器
      if (parser === "sql") {
        try {
          // 简单的SQL格式化处理
          const sqlFormatter = inputCode
            .replace(/\s+/g, " ")
            .replace(/\(\s+/g, "(")
            .replace(/\s+\)/g, ")")
            .replace(/\s*,\s*/g, ", ")
            .replace(/\s*=\s*/g, " = ")
            .replace(/\s*>\s*/g, " > ")
            .replace(/\s*<\s*/g, " < ")
            .replace(/\s*>\s*=\s*/g, " >= ")
            .replace(/\s*<\s*=\s*/g, " <= ")
            .replace(/\s*!=\s*/g, " != ")
            .replace(/\s*<>\s*/g, " <> ")
            .replace(/SELECT/gi, "SELECT\n  ")
            .replace(/FROM/gi, "\nFROM\n  ")
            .replace(/WHERE/gi, "\nWHERE\n  ")
            .replace(/GROUP BY/gi, "\nGROUP BY\n  ")
            .replace(/HAVING/gi, "\nHAVING\n  ")
            .replace(/ORDER BY/gi, "\nORDER BY\n  ")
            .replace(/LIMIT/gi, "\nLIMIT ")
            .replace(/JOIN/gi, "\nJOIN\n  ")
            .replace(/UNION/gi, "\n\nUNION\n\n")
            .replace(/INSERT INTO/gi, "INSERT INTO\n  ")
            .replace(/VALUES/gi, "\nVALUES\n  ")
            .replace(/UPDATE/gi, "UPDATE\n  ")
            .replace(/SET/gi, "\nSET\n  ")
            .replace(/DELETE FROM/gi, "DELETE FROM\n  ")
            .replace(/CREATE TABLE/gi, "CREATE TABLE\n  ")
            .replace(/ALTER TABLE/gi, "ALTER TABLE\n  ")
            .replace(/DROP TABLE/gi, "DROP TABLE\n  ")
            .replace(/AND/gi, "\n  AND")
            .replace(/OR/gi, "\n  OR")
            .replace(/ON/gi, "\n  ON")
            .replace(/\n\s*\n/g, "\n")
            .trim();

          setOutputCode(sqlFormatter);
          return;
        } catch (sqlError) {
          console.error("SQL格式化错误:", sqlError);
        }
      }

      try {
        console.log(
          intl.formatMessage({ id: "tools.codeFormatter.using_parser" }),
          actualParser
        );
        console.log(
          intl.formatMessage({ id: "tools.codeFormatter.available_plugins" }),
          Object.keys(window.prettierPlugins)
        );

        // 使用全局prettier对象格式化代码
        let formattedCode = "";

        // 格式化选项
        const options = {
          parser: actualParser,
          plugins: window.prettierPlugins,
          printWidth: formatOptions.printWidth,
          tabWidth: formatOptions.tabWidth,
          useTabs: formatOptions.useTabs,
          semi: formatOptions.semi,
          singleQuote: formatOptions.singleQuote,
          trailingComma: formatOptions.trailingComma,
          bracketSpacing: formatOptions.bracketSpacing,
          arrowParens: formatOptions.arrowParens,
          proseWrap: formatOptions.proseWrap,
        };

        formattedCode = window.prettier.format(inputCode, options);

        // 更新输出
        setOutputCode(formattedCode);
      } catch (prettierError) {
        throw new Error(
          intl
            .formatMessage({ id: "tools.codeFormatter.error_prettier" })
            .replace(
              "{message}",
              (prettierError as Error)?.message ||
                intl.formatMessage({
                  id: "tools.codeFormatter.error_initialization",
                })
            )
        );
      }
    } catch (err) {
      setError(
        intl
          .formatMessage({ id: "tools.codeFormatter.error_formatting" })
          .replace(
            "{message}",
            (err as Error).message ||
              intl.formatMessage({ id: "tools.codeFormatter.error_unknown" })
          )
      );
      setOutputCode("");
    } finally {
      setIsFormatting(false);
    }
  };

  // 复制格式化后的代码
  const copyFormattedCode = () => {
    if (!outputCode) return;

    copy(outputCode).then((success) => {
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    });
  };

  // 下载格式化后的代码
  const downloadFormattedCode = () => {
    if (!outputCode) return;

    // 确定文件扩展名
    let extension = ".txt";
    switch (selectedLanguage) {
      case "javascript":
        extension = ".js";
        break;
      case "typescript":
        extension = ".ts";
        break;
      case "jsx":
        extension = ".jsx";
        break;
      case "tsx":
        extension = ".tsx";
        break;
      case "html":
        extension = ".html";
        break;
      case "css":
        extension = ".css";
        break;
      case "json":
        extension = ".json";
        break;
      case "markdown":
        extension = ".md";
        break;
      case "yaml":
        extension = ".yaml";
        break;
      case "graphql":
        extension = ".graphql";
        break;
      case "sql":
        extension = ".sql";
        break;
    }

    // 创建并下载文件
    const blob = new Blob([outputCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `formatted_code${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 清除所有内容
  const clearAll = () => {
    setInputCode("");
    setOutputCode("");
    setError(null);
  };

  // 示例代码
  const getExampleCode = () => {
    switch (selectedLanguage) {
      case "javascript":
        return `function add(a,b) {return a+b;}\nconst x={foo:"bar",baz:42,qux:true};\nconsole.log(add(1,2));`;
      case "typescript":
        return `function greet(name: string): string {return "Hello, " + name;}\ninterface User {id: number; name: string; isActive: boolean;}\nconst user: User = {id: 1,name: "John",isActive: true};`;
      case "jsx":
        return `function App() {return (<div className="container"><header><h1>Hello World</h1></header><main><p>Welcome to my app</p></main></div>);}`;
      case "tsx":
        return `interface Props {name: string;}\nfunction Greeting({name}: Props) {return <h1>Hello, {name}!</h1>;}\nconst App = () => (<div><Greeting name="World" /><p>Welcome to TypeScript and React</p></div>);`;
      case "html":
        return `<!DOCTYPE html><html><head><title>Document</title></head><body><div><h1>Hello World</h1><p>This is a paragraph</p></div></body></html>`;
      case "css":
        return `.container { width: 100%; max-width: 1200px; margin: 0 auto; }\n.header { background-color: #f0f0f0; padding: 20px; }\n.button { display: inline-block; padding: 10px 15px; background: #4285f4; color: white; border-radius: 4px; }`;
      case "json":
        return `{"name":"John","age":30,"isStudent":false,"courses":["Math","English","Science"],"address":{"street":"123 Main St","city":"Anytown","zip":"12345"}}`;
      case "markdown":
        return `# Heading
## Subheading
This is a paragraph with **bold** and *italic* text.
- List item 1
- List item 2
> This is a blockquote.
\`\`\`
code block
\`\`\``;
      case "yaml":
        return `server:
  port: 8080
  host: localhost
database:
  url: jdbc:mysql://localhost:3306/mydb
  username: root
  password: secret
logging:
  level: INFO`;
      case "graphql":
        return `type Query {
  user(id: ID!): User
  users: [User!]!
}

type User {
  id: ID!
  name: String!
  email: String
  posts: [Post!]
}

type Post {
  id: ID!
  title: String!
  content: String
  author: User!
}`;
      case "sql":
        return `SELECT u.id, u.name, u.email, COUNT(o.id) as order_count FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.status = 'active' AND o.created_at >= '2023-01-01' GROUP BY u.id, u.name, u.email HAVING COUNT(o.id) > 0 ORDER BY order_count DESC LIMIT 10;`;
      default:
        return `// 请输入要格式化的代码`;
    }
  };

  // 加载示例代码
  const loadExample = () => {
    setInputCode(getExampleCode());
    setOutputCode("");
    setError(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-2">
        <Title level={2}>
          <FormattedMessage id="tools.codeFormatter.name" />
        </Title>
        <Paragraph className="text-gray-500 dark:text-gray-400 mb-6">
          <FormattedMessage id="tools.codeFormatter.description" />
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            extra={
              <Space>
                <Button size="small" onClick={loadExample}>
                  <FormattedMessage id="tools.codeFormatter.load_example" />
                </Button>
                <Button
                  danger
                  size="small"
                  onClick={clearAll}
                  icon={<ClearOutlined />}
                >
                  <FormattedMessage id="tools.codeFormatter.clear" />
                </Button>
              </Space>
            }
            title={
              <Space>
                <FormattedMessage id="tools.codeFormatter.input_code" />
                <Select
                  size="small"
                  value={selectedLanguage}
                  onChange={(value) =>
                    setSelectedLanguage(value as CodeLanguage)
                  }
                  className="min-w-[120px]"
                >
                  {Object.entries(languages).map(([key, { name }]) => (
                    <Select.Option key={key} value={key}>
                      {name}
                    </Select.Option>
                  ))}
                </Select>
              </Space>
            }
          >
            <Input.TextArea
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder={intl
                .formatMessage({ id: "tools.codeFormatter.input_placeholder" })
                .replace("{language}", languages[selectedLanguage].name)}
              className="font-mono"
              rows={15}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <FormattedMessage id="tools.codeFormatter.formatted_result" />
            }
            extra={
              <Space>
                <Button
                  size="small"
                  icon={copied ? <CheckOutlined /> : <CopyOutlined />}
                  onClick={copyFormattedCode}
                  disabled={!outputCode}
                >
                  {copied ? (
                    <FormattedMessage id="tools.codeFormatter.copied" />
                  ) : (
                    <FormattedMessage id="tools.codeFormatter.copy" />
                  )}
                </Button>
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={downloadFormattedCode}
                  disabled={!outputCode}
                >
                  <FormattedMessage id="tools.codeFormatter.download" />
                </Button>
              </Space>
            }
          >
            {error ? (
              <Alert
                title={
                  <FormattedMessage id="tools.codeFormatter.formatting_error_title" />
                }
                description={error}
                type="error"
                showIcon
              />
            ) : outputCode ? (
              <pre className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 text-sm font-mono text-gray-800 dark:text-gray-200 overflow-auto whitespace-pre">
                {outputCode}
              </pre>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6 text-gray-500 dark:text-gray-400">
                <CodeOutlined className="text-3xl mb-2" />
                <p>
                  <FormattedMessage id="tools.codeFormatter.result_placeholder" />
                </p>
                <p className="text-sm mt-2">
                  <FormattedMessage id="tools.codeFormatter.click_format" />
                </p>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {loadingModules && !error && (
        <div className="mt-4 text-center">
          <Text type="secondary">
            <FormattedMessage id="tools.codeFormatter.first_time_loading" />
          </Text>
        </div>
      )}

      {fileMissingWarning && (
        <Alert
          title={fileMissingWarning}
          type="warning"
          showIcon
          className="mt-4"
        />
      )}
    </div>
  );
};

export default CodeFormatter;
