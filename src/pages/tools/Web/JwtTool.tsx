import { useCopy } from "@/hooks/useCopy";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CopyOutlined,
  DownloadOutlined,
  EditOutlined,
  EyeOutlined,
  KeyOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  Input,
  message,
  Radio,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

const { TextArea } = Input;
const { Title, Text } = Typography;

// Utilities for JWT
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const base64UrlEncode = (data: Uint8Array): string => {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const base64UrlDecode = (str: string): Uint8Array => {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
  const binStr = atob(padded);
  const len = binStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binStr.charCodeAt(i);
  }
  return bytes;
};

const strToBase64Url = (str: string): string => {
  return base64UrlEncode(textEncoder.encode(str));
};

const base64UrlToStr = (str: string): string => {
  try {
    return textDecoder.decode(base64UrlDecode(str));
  } catch {
    throw new Error("Invalid Base64Url string");
  }
};

const importKey = async (secret: string, alg: string) => {
  return window.crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    {
      name: "HMAC",
      hash: {
        name:
          alg === "HS256" ? "SHA-256" : alg === "HS384" ? "SHA-384" : "SHA-512",
      },
    },
    false,
    ["sign", "verify"]
  );
};

const sign = async (
  header: string,
  payload: string,
  secret: string,
  alg: string = "HS256"
): Promise<string> => {
  const key = await importKey(secret, alg);
  const data = textEncoder.encode(`${header}.${payload}`);
  const signature = await window.crypto.subtle.sign("HMAC", key, data);
  return base64UrlEncode(new Uint8Array(signature));
};

const verify = async (token: string, secret: string): Promise<boolean> => {
  const [headerB64, payloadB64, signatureB64] = token.split(".");
  if (!headerB64 || !payloadB64 || !signatureB64) return false;

  let alg = "HS256";
  try {
    const header = JSON.parse(base64UrlToStr(headerB64));
    if (header.alg && ["HS256", "HS384", "HS512"].includes(header.alg)) {
      alg = header.alg;
    }
  } catch {
    // Silently handle header parsing errors
  }

  const key = await importKey(secret, alg);
  const data = textEncoder.encode(`${headerB64}.${payloadB64}`);
  const signature = base64UrlDecode(signatureB64);

  return window.crypto.subtle.verify(
    "HMAC",
    key,
    signature as ArrayBuffer,
    data
  );
};

const JwtTool: React.FC = () => {
  const intl = useIntl();
  const copy = useCopy();

  // Mode: encode, decode, verify
  const [mode, setMode] = useState<"encode" | "decode" | "verify">("encode");

  // Encode State
  const [encodeHeader, setEncodeHeader] = useState(() =>
    JSON.stringify({ alg: "HS256", typ: "JWT" }, null, 2)
  );
  const [encodePayload, setEncodePayload] = useState(() =>
    JSON.stringify(
      {
        sub: "1234567890",
        name: "John Doe",
        iat: Math.floor(Date.now() / 1000),
      },
      null,
      2
    )
  );
  const [encodeSecret, setEncodeSecret] = useState("your-256-bit-secret");
  const [encodeAlg, setEncodeAlg] = useState("HS256");
  const [generatedToken, setGeneratedToken] = useState("");

  // Decode State
  const [decodeToken, setDecodeToken] = useState("");
  const [decodedHeader, setDecodedHeader] = useState("");
  const [decodedPayload, setDecodedPayload] = useState("");
  const [decodeSecret, setDecodeSecret] = useState(""); // Optional verify
  const [decodeStatus, setDecodeStatus] = useState<
    "valid" | "invalid" | "unknown"
  >("unknown");

  // Verify State
  const [verifyToken, setVerifyToken] = useState("");
  const [verifySecret, setVerifySecret] = useState("");
  const [verifyResult, setVerifyResult] = useState<"valid" | "invalid" | null>(
    null
  );

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  const handleGenerate = async () => {
    try {
      // Minify JSON
      const headerMin = JSON.stringify(JSON.parse(encodeHeader));
      const payloadMin = JSON.stringify(JSON.parse(encodePayload));

      const headerB64 = strToBase64Url(headerMin);
      const payloadB64 = strToBase64Url(payloadMin);

      const signature = await sign(
        headerB64,
        payloadB64,
        encodeSecret,
        encodeAlg
      );

      setGeneratedToken(`${headerB64}.${payloadB64}.${signature}`);
      message.success(intl.formatMessage({ id: "tools.jwt.tokenGenerated" }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      message.error(
        intl.formatMessage({ id: "tools.jwt.generationFailed" }) +
          ": " +
          errorMessage
      );
    }
  };

  const handleDecode = async () => {
    setDecodedHeader("");
    setDecodedPayload("");
    setDecodeStatus("unknown");

    if (!decodeToken.trim()) return;

    const parts = decodeToken.trim().split(".");
    if (parts.length !== 3) {
      message.error(intl.formatMessage({ id: "tools.jwt.invalidFormat" }));
      return;
    }

    try {
      const headerStr = base64UrlToStr(parts[0]);
      const payloadStr = base64UrlToStr(parts[1]);

      setDecodedHeader(JSON.stringify(JSON.parse(headerStr), null, 2));
      setDecodedPayload(JSON.stringify(JSON.parse(payloadStr), null, 2));

      // Should check exp?
      const payload = JSON.parse(payloadStr);
      if (payload.exp && payload.exp < Date.now() / 1000) {
        message.warning(
          intl.formatMessage({ id: "tools.jwt.tokenExpired" }),
          2
        );
      }

      // Verify if secret provided
      if (decodeSecret) {
        const isValid = await verify(decodeToken.trim(), decodeSecret);
        setDecodeStatus(isValid ? "valid" : "invalid");
      }
    } catch {
      message.error(intl.formatMessage({ id: "tools.jwt.decodeFailed" }));
    }
  };

  // Watch for decode token/secret changes to auto-update if wanted?
  // The previous Vue tool had explicit button. Let's keep manual trigger for verify.
  // But basic decoding can be live? No, usually pasting a token happens at once.

  const handleVerifySubmit = async () => {
    if (!verifyToken || !verifySecret) {
      message.error(
        intl.formatMessage({ id: "tools.jwt.tokenSecretRequired" })
      );
      return;
    }
    try {
      const isValid = await verify(verifyToken.trim(), verifySecret);
      setVerifyResult(isValid ? "valid" : "invalid");
      if (isValid)
        message.success(intl.formatMessage({ id: "tools.jwt.verified" }));
      else
        message.error(intl.formatMessage({ id: "tools.jwt.invalidSignature" }));
    } catch {
      message.error(intl.formatMessage({ id: "tools.jwt.verificationError" }));
      setVerifyResult("invalid");
    }
  };

  const renderEncodeTab = () => (
    <div className="space-y-2">
      <Row gutter={24}>
        <Col span={12}>
          <Card title={<FormattedMessage id="tools.jwt.header" />}>
            <TextArea
              rows={6}
              value={encodeHeader}
              onChange={(e) => setEncodeHeader(e.target.value)}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title={<FormattedMessage id="tools.jwt.payload" />}>
            <TextArea
              rows={6}
              value={encodePayload}
              onChange={(e) => setEncodePayload(e.target.value)}
            />
          </Card>
        </Col>
      </Row>

      <Card title={<FormattedMessage id="tools.jwt.signing" />}>
        <Space orientation="vertical" className="w-full">
          <Row gutter={16}>
            <Col span={16}>
              <Text className="text-slate-400 block mb-1">
                <FormattedMessage id="tools.jwt.secret" />
              </Text>
              <Input.Password
                value={encodeSecret}
                onChange={(e) => setEncodeSecret(e.target.value)}
                iconRender={(visible) =>
                  visible ? <KeyOutlined /> : <KeyOutlined />
                }
                className="border-slate-700"
              />
            </Col>
            <Col span={8}>
              <Text className="text-slate-400 block mb-1">
                <FormattedMessage id="tools.jwt.algorithm" />
              </Text>
              <Select
                value={encodeAlg}
                onChange={setEncodeAlg}
                className="w-full"
                options={[
                  { value: "HS256", label: "HS256 (SHA-256)" },
                  { value: "HS384", label: "HS384 (SHA-384)" },
                  { value: "HS512", label: "HS512 (SHA-512)" },
                ]}
              />
            </Col>
          </Row>
          <Button type="primary" block onClick={handleGenerate} size="large">
            <FormattedMessage id="tools.jwt.generateButton" />
          </Button>
          {generatedToken && (
            <div className="animate-fade-in">
              <Alert
                title={
                  <div className="flex justify-between items-start break-all">
                    <Text className="font-mono text-green-400 text-sm">
                      {generatedToken}
                    </Text>
                    <Space className="ml-4 shrink-0">
                      <Button
                        type="text"
                        icon={<CopyOutlined />}
                        onClick={() => copy(generatedToken)}
                      />
                      <Button
                        type="text"
                        icon={<DownloadOutlined />}
                        onClick={() => {
                          const blob = new Blob([generatedToken], {
                            type: "text/plain",
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "token.jwt";
                          a.click();
                        }}
                      />
                    </Space>
                  </div>
                }
                type="success"
                className="bg-green-900/10 border-green-500/30"
              />
            </div>
          )}
        </Space>
      </Card>
    </div>
  );

  const renderDecodeTab = () => (
    <Card>
      <Space orientation="vertical" className="w-full">
        <Text className="block mb-2">
          <FormattedMessage id="tools.jwt.tokenLabel" />
        </Text>
        <TextArea
          value={decodeToken}
          onChange={(e) => setDecodeToken(e.target.value)}
          rows={4}
          placeholder={intl.formatMessage({ id: "tools.jwt.tokenPlaceholder" })}
        />
        <Space className="w-full justify-between">
          <Input
            placeholder={intl.formatMessage({
              id: "tools.jwt.secretPlaceholder",
            })}
            value={decodeSecret}
            onChange={(e) => setDecodeSecret(e.target.value)}
            className="max-w-md border-slate-700"
            prefix={<KeyOutlined className="text-slate-500" />}
          />
          <Button type="primary" onClick={handleDecode}>
            <FormattedMessage id="tools.jwt.decodeVerify" />
          </Button>
        </Space>
        {(decodedHeader || decodedPayload) && (
          <Row gutter={24}>
            <Col span={12}>
              <div className="mb-2 flex items-center justify-between">
                <Text className="font-medium">
                  <FormattedMessage id="tools.jwt.header" />
                </Text>
                {decodeSecret && decodeStatus !== "unknown" && (
                  <Tag color={decodeStatus === "valid" ? "success" : "error"}>
                    {decodeStatus === "valid"
                      ? intl.formatMessage({ id: "tools.jwt.verified" })
                      : intl.formatMessage({
                          id: "tools.jwt.invalidSignature",
                        })}
                  </Tag>
                )}
              </div>
              <TextArea
                readOnly
                value={decodedHeader}
                rows={10}
                className="font-mono text-xs border-slate-700 text-green-300"
              />
            </Col>
            <Col span={12}>
              <div className="mb-2">
                <Text className="font-medium">
                  <FormattedMessage id="tools.jwt.payload" />
                </Text>
              </div>
              <TextArea
                readOnly
                value={decodedPayload}
                rows={10}
                className="font-mono text-xs border-slate-700 text-purple-300"
              />
            </Col>
          </Row>
        )}
      </Space>
    </Card>
  );

  const renderVerifyTab = () => (
    <div className="space-y-6">
      <Card className="bg-white/5 border-slate-700">
        <div className="mb-4">
          <Text className="text-slate-400 block mb-2">
            <FormattedMessage id="tools.jwt.tokenLabel" />
          </Text>
          <TextArea
            value={verifyToken}
            onChange={(e) => setVerifyToken(e.target.value)}
            rows={3}
            className="font-mono text-xs border-slate-700"
          />
        </div>
        <div className="mb-6">
          <Text className="text-slate-400 block mb-2">
            <FormattedMessage id="tools.jwt.secret" />
          </Text>
          <Input
            value={verifySecret}
            onChange={(e) => setVerifySecret(e.target.value)}
            className="border-slate-700"
            prefix={<KeyOutlined className="text-slate-500" />}
          />
        </div>
        <Button type="primary" block onClick={handleVerifySubmit} size="large">
          <FormattedMessage id="tools.jwt.verifyButton" />
        </Button>
      </Card>

      {verifyResult && (
        <Alert
          type={verifyResult === "valid" ? "success" : "error"}
          showIcon
          icon={
            verifyResult === "valid" ? (
              <CheckCircleOutlined />
            ) : (
              <CloseCircleOutlined />
            )
          }
          message={
            verifyResult === "valid"
              ? intl.formatMessage({ id: "tools.jwt.verified" })
              : intl.formatMessage({ id: "tools.jwt.invalidSignature" })
          }
          description={
            verifyResult === "valid"
              ? intl.formatMessage({ id: "tools.jwt.validDesc" })
              : intl.formatMessage({ id: "tools.jwt.invalidDesc" })
          }
          className={
            verifyResult === "valid"
              ? "bg-green-900/10 border-green-500/30 text-green-300"
              : "bg-red-900/10 border-red-500/30 text-red-300"
          }
        />
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center mb-2">
        <Title level={1} className="text-white mb-2">
          <FormattedMessage id="tools.jwtTool.name" />
        </Title>
        <Text className="text-slate-400 text-lg">
          <FormattedMessage id="tools.jwtTool.description" />
        </Text>
      </div>

      {/* Mode Switcher */}
      <div className="flex justify-center mb-6">
        <Radio.Group
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          optionType="button"
          buttonStyle="solid"
        >
          <Radio.Button value="encode">
            <EditOutlined /> <FormattedMessage id="tools.jwt.tab.encode" />
          </Radio.Button>
          <Radio.Button value="decode">
            <EyeOutlined /> <FormattedMessage id="tools.jwt.tab.decode" />
          </Radio.Button>
          <Radio.Button value="verify">
            <SafetyCertificateOutlined />{" "}
            <FormattedMessage id="tools.jwt.tab.verify" />
          </Radio.Button>
        </Radio.Group>
      </div>

      <div className="mt-2">
        {mode === "encode" && renderEncodeTab()}
        {mode === "decode" && renderDecodeTab()}
        {mode === "verify" && renderVerifyTab()}
      </div>
    </div>
  );
};

export default JwtTool;
