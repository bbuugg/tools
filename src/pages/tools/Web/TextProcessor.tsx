import {
  BookOutlined,
  ClearOutlined,
  CopyOutlined,
  DownloadOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { Button, Card, Input, message, Tooltip, Typography } from "antd";
import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
// @ts-expect-error No type definitions available for crypto-js
import CryptoJS from "crypto-js";

const { Title, Text } = Typography;

const TextProcessor: React.FC = () => {
  const intl = useIntl();
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");

  // Calculate statistics
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const lineCount = inputText ? inputText.split("\n").length : 0;

  // Load example text
  const loadExample = () => {
    const exampleText = intl.formatMessage({
      id: "tools.textProcessor.exampleText",
    });
    setInputText(exampleText);
  };

  // Clear input and output
  const clearInput = () => {
    setInputText("");
    setOutputText("");
  };

  // Copy output to clipboard
  const copyToClipboard = () => {
    if (!outputText) return;

    navigator.clipboard
      .writeText(outputText)
      .then(() => {
        message.success(intl.formatMessage({ id: "toast.copySuccess" }));
      })
      .catch(() => {
        message.error(intl.formatMessage({ id: "toast.copyFail" }));
      });
  };

  // Download output as text file
  const downloadResult = () => {
    if (!outputText) return;

    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "text-processor-result.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    message.success(intl.formatMessage({ id: "common.downloadSuccess" }));
  };

  // Swap input and output content
  const swapInputOutput = () => {
    const temp = inputText;
    setInputText(outputText);
    setOutputText(temp);
  };

  // Text processing functions
  const urlEncode = () => {
    if (!inputText) {
      setOutputText("");
      return;
    }

    try {
      setOutputText(encodeURIComponent(inputText));
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      message.error(
        intl.formatMessage({ id: "tools.textProcessor.errors.encodingError" })
      );
      setOutputText("");
    }
  };

  const urlDecode = () => {
    if (!inputText) {
      setOutputText("");
      return;
    }

    try {
      setOutputText(decodeURIComponent(inputText));
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      message.error(
        intl.formatMessage({ id: "tools.textProcessor.errors.decodingError" })
      );
      setOutputText("");
    }
  };

  const base64Encode = () => {
    if (!inputText) {
      setOutputText("");
      return;
    }

    try {
      setOutputText(btoa(unescape(encodeURIComponent(inputText))));
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      message.error(
        intl.formatMessage({ id: "tools.textProcessor.errors.encodingError" })
      );
      setOutputText("");
    }
  };

  const base64Decode = () => {
    if (!inputText) {
      setOutputText("");
      return;
    }

    try {
      setOutputText(decodeURIComponent(escape(atob(inputText))));
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      message.error(
        intl.formatMessage({ id: "tools.textProcessor.errors.decodingError" })
      );
      setOutputText("");
    }
  };

  const md5Hash = () => {
    if (!inputText) {
      setOutputText("");
      return;
    }

    try {
      setOutputText(CryptoJS.MD5(inputText).toString());
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      message.error(
        intl.formatMessage({ id: "tools.textProcessor.errors.hashingError" })
      );
      setOutputText("");
    }
  };

  const sha256Hash = () => {
    if (!inputText) {
      setOutputText("");
      return;
    }

    try {
      setOutputText(CryptoJS.SHA256(inputText).toString());
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      message.error(
        intl.formatMessage({ id: "tools.textProcessor.errors.hashingError" })
      );
      setOutputText("");
    }
  };

  const unicodeEncode = () => {
    if (!inputText) {
      setOutputText("");
      return;
    }

    try {
      const result = Array.from(inputText)
        .map((char) => {
          const code = char.charCodeAt(0);
          // Only convert non-ASCII characters
          if (code > 127) {
            return `\\u${code.toString(16).padStart(4, "0")}`;
          }
          return char;
        })
        .join("");

      setOutputText(result);
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      message.error(
        intl.formatMessage({ id: "tools.textProcessor.errors.encodingError" })
      );
      setOutputText("");
    }
  };

  const unicodeDecode = () => {
    if (!inputText) {
      setOutputText("");
      return;
    }

    try {
      const result = inputText.replace(
        /\\u([0-9a-fA-F]{4})/g,
        (_, group) => {
          return String.fromCharCode(parseInt(group, 16));
        }
      );

      setOutputText(result);
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      message.error(
        intl.formatMessage({ id: "tools.textProcessor.errors.decodingError" })
      );
      setOutputText("");
    }
  };

  const htmlEntityEncode = () => {
    if (!inputText) {
      setOutputText("");
      return;
    }

    try {
      // Convert text to HTML hexadecimal entity format (&#x6C49;)
      const result = Array.from(inputText)
        .map(char => {
          const codePoint = char.codePointAt(0);
          return `&#x${codePoint?.toString(16).toLowerCase()};`;
        })
        .join("");

      setOutputText(result);
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      message.error(
        intl.formatMessage({ id: "tools.textProcessor.errors.encodingError" })
      );
      setOutputText("");
    }
  };

  const htmlEntityDecode = () => {
    if (!inputText) {
      setOutputText("");
      return;
    }

    try {
      // Convert HTML hexadecimal entity format back to text
      // Regular expression to match &#xXXXX; format hexadecimal values
      const result = inputText.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => 
        String.fromCodePoint(parseInt(hex, 16))
      );

      setOutputText(result);
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      message.error(
        intl.formatMessage({ id: "tools.textProcessor.errors.decodingError" })
      );
      setOutputText("");
    }
  };

  const htmlEscapeEncode = () => {
    if (!inputText) {
      setOutputText("");
      return;
    }

    try {
      // Create a temporary element to use browser's built-in textContent property
      const el = document.createElement('div');
      el.textContent = inputText;
      const result = el.innerHTML;
      setOutputText(result);
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      message.error(
        intl.formatMessage({ id: "tools.textProcessor.errors.encodingError" })
      );
      setOutputText("");
    }
  };

  const htmlEscapeDecode = () => {
    if (!inputText) {
      setOutputText("");
      return;
    }

    try {
      // Create a temporary element to use browser's built-in innerHTML property
      const el = document.createElement('div');
      el.innerHTML = inputText;
      const result = el.textContent || '';
      setOutputText(result);
    } catch (error: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      message.error(
        intl.formatMessage({ id: "tools.textProcessor.errors.decodingError" })
      );
      setOutputText("");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <Title level={1} className="text-white mb-2">
          <FormattedMessage id="tools.textProcessor.name" />
        </Title>
        <Text className="text-lg text-slate-400">
          <FormattedMessage id="tools.textProcessor.description" />
        </Text>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card
          className="bg-white/5 border-slate-700"
          title={
            <div className="flex justify-between items-center">
              <FormattedMessage id="tools.textProcessor.inputTitle" />
              <div className="flex space-x-2">
                <Tooltip title={<FormattedMessage id="common.loadExample" />}>
                  <Button
                    icon={<BookOutlined />}
                    onClick={loadExample}
                    size="small"
                    className="bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                  >
                    <FormattedMessage id="common.loadExample" />
                  </Button>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="common.clear" />}>
                  <Button
                    icon={<ClearOutlined />}
                    onClick={clearInput}
                    size="small"
                    danger
                  >
                    <FormattedMessage id="common.clear" />
                  </Button>
                </Tooltip>
                <Tooltip title={<FormattedMessage id="common.swap" />}>
                  <Button
                    icon={<SwapOutlined />}
                    onClick={swapInputOutput}
                    size="small"
                    className="bg-slate-700/50 text-slate-300 hover:bg-slate-600/50"
                  >
                    <FormattedMessage id="common.swap" />
                  </Button>
                </Tooltip>
              </div>
            </div>
          }
        >
          <Input.TextArea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={intl.formatMessage({
              id: "tools.textProcessor.inputPlaceholder",
            })}
            rows={10}
            className="font-mono text-sm bg-slate-800/50 border-slate-700/30"
          />

          {/* Text Statistics */}
          <div className="mt-4 p-3 rounded-xl border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm">
                  <FormattedMessage id="tools.textProcessor.chars" />
                </p>
                <p className="font-semibold">{inputText.length}</p>
              </div>
              <div>
                <p className="text-sm">
                  <FormattedMessage id="tools.textProcessor.words" />
                </p>
                <p className="font-semibold">{wordCount}</p>
              </div>
              <div>
                <p className="text-sm">
                  <FormattedMessage id="tools.textProcessor.lines" />
                </p>
                <p className="font-semibold">{lineCount}</p>
              </div>
            </div>
          </div>

          {/* Operations */}
          <div className="mt-6 space-y-4">
            <h4 className="font-medium">
              <FormattedMessage id="tools.textProcessor.operations" />
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={urlEncode}
                className="bg-primary-600 text-white hover:bg-primary-700"
              >
                <FormattedMessage id="tools.textProcessor.urlEncode" />
              </Button>
              <Button
                onClick={urlDecode}
                className="bg-primary-600 text-white hover:bg-primary-700"
              >
                <FormattedMessage id="tools.textProcessor.urlDecode" />
              </Button>
              <Button
                onClick={base64Encode}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                <FormattedMessage id="tools.textProcessor.base64Encode" />
              </Button>
              <Button
                onClick={base64Decode}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                <FormattedMessage id="tools.textProcessor.base64Decode" />
              </Button>
              <Button
                onClick={md5Hash}
                className="bg-success-600 text-white hover:bg-success-700"
              >
                <FormattedMessage id="tools.textProcessor.md5Hash" />
              </Button>
              <Button
                onClick={sha256Hash}
                className="bg-success-600 text-white hover:bg-success-700"
              >
                <FormattedMessage id="tools.textProcessor.sha256Hash" />
              </Button>
              <Button
                onClick={unicodeEncode}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <FormattedMessage id="tools.textProcessor.unicodeEncode" />
              </Button>
              <Button
                onClick={unicodeDecode}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <FormattedMessage id="tools.textProcessor.unicodeDecode" />
              </Button>
              <Button
                onClick={htmlEntityEncode}
                className="bg-orange-600 text-white hover:bg-orange-700"
              >
                <FormattedMessage id="tools.textProcessor.htmlEntityEncode" />
              </Button>
              <Button
                onClick={htmlEntityDecode}
                className="bg-orange-600 text-white hover:bg-orange-700"
              >
                <FormattedMessage id="tools.textProcessor.htmlEntityDecode" />
              </Button>
              <Button
                onClick={htmlEscapeEncode}
                className="bg-yellow-600 text-white hover:bg-yellow-700"
              >
                <FormattedMessage id="tools.textProcessor.htmlEscapeEncode" />
              </Button>
              <Button
                onClick={htmlEscapeDecode}
                className="bg-yellow-600 text-white hover:bg-yellow-700"
              >
                <FormattedMessage id="tools.textProcessor.htmlEscapeDecode" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Output Section */}
        <Card
          className="bg-white/5 border-slate-700"
          title={
            <div className="flex justify-between items-center">
              <FormattedMessage id="tools.textProcessor.outputTitle" />
              <div className="flex space-x-2">
                {outputText && (
                  <>
                    <Tooltip title={<FormattedMessage id="common.copy" />}>
                      <Button
                        icon={<CopyOutlined />}
                        onClick={copyToClipboard}
                        size="small"
                        className="bg-primary-500/20 text-primary-400 hover:bg-primary-500/30"
                      />
                    </Tooltip>
                    <Tooltip title={<FormattedMessage id="common.download" />}>
                      <Button
                        icon={<DownloadOutlined />}
                        onClick={downloadResult}
                        size="small"
                        className="bg-success-500/20 text-success-400 hover:bg-success-500/30"
                      />
                    </Tooltip>
                  </>
                )}
              </div>
            </div>
          }
        >
          <Input.TextArea
            value={outputText}
            onChange={(e) => setOutputText(e.target.value)}
            placeholder={intl.formatMessage({
              id: "tools.textProcessor.outputPlaceholder",
            })}
            rows={10}
            readOnly
            className="font-mono text-sm bg-slate-800/50 border-slate-700/30"
          />
        </Card>
      </div>
    </div>
  );
};

export default TextProcessor;