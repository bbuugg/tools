import React, { useState } from "react";
import { Card, Typography, Button, Input, message, Tooltip } from "antd";
import { FormattedMessage, useIntl } from "react-intl";
import {
  CopyOutlined,
  DownloadOutlined,
  ClearOutlined,
  BookOutlined,
} from "@ant-design/icons";
// @ts-expect-error No type definitions available for crypto-js
import CryptoJS from "crypto-js";

const { Title, Text, Paragraph } = Typography;

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

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <Title level={1} className="text-white mb-2">
          <FormattedMessage id="tools.textProcessor.title" />
        </Title>
        <Text className="text-lg text-slate-400">
          <FormattedMessage id="tools.textProcessor.description" />
        </Text>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white/5 border-slate-700">
          <div className="text-2xl mb-3">🔗</div>
          <Title level={3} className="text-white mb-2">
            <FormattedMessage id="tools.textProcessor.features.urlEncoding.title" />
          </Title>
          <Paragraph className="text-slate-400 text-sm">
            <FormattedMessage id="tools.textProcessor.features.urlEncoding.description" />
          </Paragraph>
        </Card>
        <Card className="bg-white/5 border-slate-700">
          <div className="text-2xl mb-3">🔒</div>
          <Title level={3} className="text-white mb-2">
            <FormattedMessage id="tools.textProcessor.features.base64.title" />
          </Title>
          <Paragraph className="text-slate-400 text-sm">
            <FormattedMessage id="tools.textProcessor.features.base64.description" />
          </Paragraph>
        </Card>
        <Card className="bg-white/5 border-slate-700">
          <div className="text-2xl mb-3">#️⃣</div>
          <Title level={3} className="text-white mb-2">
            <FormattedMessage id="tools.textProcessor.features.hashing.title" />
          </Title>
          <Paragraph className="text-slate-400 text-sm">
            <FormattedMessage id="tools.textProcessor.features.hashing.description" />
          </Paragraph>
        </Card>
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
            className="font-mono text-sm bg-slate-800/50 text-slate-100 border-slate-700/30"
          />

          {/* Text Statistics */}
          <div className="mt-4 p-3 bg-slate-800/30 border border-slate-700/30 rounded-xl">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-slate-400">
                  <FormattedMessage id="tools.textProcessor.chars" />
                </p>
                <p className="font-semibold text-slate-100">
                  {inputText.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-400">
                  <FormattedMessage id="tools.textProcessor.words" />
                </p>
                <p className="font-semibold text-slate-100">{wordCount}</p>
              </div>
              <div>
                <p className="text-sm text-slate-400">
                  <FormattedMessage id="tools.textProcessor.lines" />
                </p>
                <p className="font-semibold text-slate-100">{lineCount}</p>
              </div>
            </div>
          </div>

          {/* Operations */}
          <div className="mt-6 space-y-4">
            <h4 className="font-medium text-slate-100">
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
            className="font-mono text-sm bg-slate-800/50 text-slate-100 border-slate-700/30"
          />
        </Card>
      </div>
    </div>
  );
};

export default TextProcessor;
