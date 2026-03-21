import {
  ApiOutlined,
  BugOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  LoginOutlined,
  LogoutOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Input,
  Row,
  Space,
  Switch,
  Tag,
  Typography,
  message,
} from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";

const { TextArea } = Input;
const { Title, Text } = Typography;

interface LogMessage {
  type: "success" | "danger" | "info" | "warning";
  content: string;
  time: string;
}

interface WSMessage {
  direction: 0 | 1; // 0: received, 1: sent
  content: string;
  time: string;
}

const WsTool: React.FC = () => {
  const intl = useIntl();

  // Server Config
  const [address, setAddress] = useState("ws://127.0.0.1:9501");
  const [isConnected, setIsConnected] = useState(false);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);

  // Packet Settings
  const [heartbeatInterval, setHeartbeatInterval] = useState(1);
  const [heartbeatContent, setHeartbeatContent] = useState("PING");
  const [isAutoSending, setIsAutoSending] = useState(false);
  const [manualContent, setManualContent] = useState("");
  const [clearAfterSend, setClearAfterSend] = useState(false);

  // Logs & Messages
  const [consoleLogs, setConsoleLogs] = useState<LogMessage[]>([]);
  const [messages, setMessages] = useState<WSMessage[]>([]);

  // Message Options
  const [clearAfterReceive, setClearAfterReceive] = useState(false);
  const [isJsonDecode, setIsJsonDecode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Refs
  const ws = useRef<WebSocket | null>(null);
  const heartbeatTimer = useRef<number | null>(null);
  const consoleContainerRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  const handleHeartBeatContentChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setHeartbeatContent(e.target.value);
    localStorage.setItem("tools.ws.heart_beat_content", e.target.value);
  };

  const handleManualContentChange = (value: string) => {
    setManualContent(value);
    localStorage.setItem("tools.ws.manual_content", value);
  };

  // Initialize address from localstorage
  useEffect(() => {
    const saved = localStorage.getItem("tools.ws.address");
    if (saved) setAddress(saved);
    const hbc = localStorage.getItem("tools.ws.heart_beat_content");
    if (hbc) {
      setHeartbeatContent(hbc);
    }
    const mt = localStorage.getItem("tools.ws.manual_content");
    if (mt) {
      setManualContent(mt);
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (heartbeatTimer.current) {
        clearInterval(heartbeatTimer.current);
        heartbeatTimer.current = null;
      }
      if (ws.current) ws.current.close();
    };
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (consoleContainerRef.current) {
      consoleContainerRef.current.scrollTo({
        top: consoleContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [consoleLogs]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  const getTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
  };

  const addLog = (type: LogMessage["type"], content: string) => {
    setConsoleLogs((prev) => [
      ...prev.slice(-99),
      { type, content, time: getTime() },
    ]);
  };

  const addMessage = useCallback(
    (direction: 0 | 1, content: string) => {
      if (isPaused && direction === 0) return;

      // Format JSON if needed
      let formatted = content;
      if (direction === 0 && isJsonDecode) {
        try {
          formatted = JSON.stringify(JSON.parse(content), null, 2);
        } catch {
          /* ignore json parse error */
        }
      }

      setMessages((prev) => {
        const next = clearAfterReceive && direction === 0 ? [] : prev;
        return [
          ...next.slice(-99),
          { direction, content: formatted, time: getTime() },
        ];
      });
    },
    [isPaused, isJsonDecode, clearAfterReceive]
  );

  // -------------------------------------------------------------------------
  // WebSocket Logic
  // -------------------------------------------------------------------------
  const connect = () => {
    if (ws.current) {
      ws.current.close();
    }

    try {
      localStorage.setItem("tools.ws.address", address);
      const socket = new WebSocket(address);
      ws.current = socket;

      // Initial state update
      setReadyState(WebSocket.CONNECTING);
      addLog(
        "info",
        intl.formatMessage({ id: "tools.wsTool.status.connecting" }) +
          ` ${address}...`
      );

      socket.onopen = () => {
        setReadyState(WebSocket.OPEN);
        setIsConnected(true);
        addLog(
          "success",
          intl.formatMessage({ id: "tools.wsTool.status.connected" }) +
            ` ${address}`
        );
        message.success(
          intl.formatMessage({ id: "tools.wsTool.status.connected" })
        );
      };

      socket.onclose = (event) => {
        setReadyState(WebSocket.CLOSED);
        setIsConnected(false);
        setIsAutoSending(false);
        stopHeartbeat();
        addLog(
          "danger",
          intl.formatMessage(
            { id: "tools.wsTool.disconnected" },
            { code: event.code, reason: getCloseReason(event.code) }
          )
        );
        ws.current = null;
      };

      socket.onerror = () => {
        addLog("danger", intl.formatMessage({ id: "tools.wsTool.error" }));
      };

      socket.onmessage = (event) => {
        addMessage(
          0,
          typeof event.data === "string" ? event.data : "Binary Data"
        );
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      addLog(
        "danger",
        intl.formatMessage({ id: "toast.error" }) + `: ${errorMessage}`
      );
    }
  };

  const disconnect = () => {
    if (ws.current) {
      ws.current.close(
        1000,
        intl.formatMessage({ id: "tools.wsTool.userDisconnected" })
      );
    }
  };

  const getCloseReason = (code: number) => {
    const codes: Record<number, string> = {
      1000: "Normal Closure",
      1001: "Going Away",
      1002: "Protocol Error",
      1003: "Unsupported Data",
      1006: "Abnormal Closure",
      1009: "Message Too Big",
      1011: "Internal Error",
    };
    return codes[code] || "Unknown";
  };

  // -------------------------------------------------------------------------
  // Sending Logic
  // -------------------------------------------------------------------------

  const send = useCallback(
    (data: string) => {
      if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
        message.error(intl.formatMessage({ id: "tools.wsTool.status.closed" }));
        return;
      }
      ws.current.send(data);
      addMessage(1, data);
    },
    [addMessage, intl]
  );

  const handleManualSend = () => {
    if (!manualContent) return;
    send(manualContent);
    if (clearAfterSend) {
      handleManualContentChange("");
    }
  };

  const startHeartbeat = () => {
    if (!ws.current || !isConnected) return;
    setIsAutoSending(true);
    heartbeatTimer.current = window.setInterval(() => {
      send(heartbeatContent);
      addLog("info", `Heartbeat sent: ${heartbeatContent}`);
    }, heartbeatInterval * 1000);
  };

  const stopHeartbeat = () => {
    setIsAutoSending(false);
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current);
      heartbeatTimer.current = null;
    }
  };

  const toggleHeartbeat = () => {
    if (isAutoSending) stopHeartbeat();
    else startHeartbeat();
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  const getStatusColor = (state: number) => {
    switch (state) {
      case WebSocket.CONNECTING:
        return "orange";
      case WebSocket.OPEN:
        return "green";
      case WebSocket.CLOSING:
        return "orange";
      case WebSocket.CLOSED:
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (state: number) => {
    switch (state) {
      case WebSocket.CONNECTING:
        return intl.formatMessage({ id: "tools.wsTool.status.connecting" });
      case WebSocket.OPEN:
        return intl.formatMessage({ id: "tools.wsTool.status.connected" });
      case WebSocket.CLOSING:
        return intl.formatMessage({ id: "tools.wsTool.status.closing" });
      case WebSocket.CLOSED:
        return intl.formatMessage({ id: "tools.wsTool.status.closed" });
      default:
        return intl.formatMessage({ id: "tools.wsTool.status.unknown" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <Row gutter={24}>
        {/* ----------------- LEFT: CONFIG & CONTROL ----------------- */}
        <Col xs={24} lg={12}>
          <Space orientation="vertical" style={{ width: "100%" }}>
            {/* Server Config */}
            <Card
              title={
                <FormattedMessage
                  id="tools.wsTool.connection"
                  defaultMessage="Connection"
                />
              }
            >
              <div className="flex justify-between items-center mb-4">
                <Tag
                  color={getStatusColor(readyState)}
                  className="m-0 text-sm py-1 px-3"
                >
                  {getStatusText(readyState).toUpperCase()}
                </Tag>
              </div>
              <Space.Compact style={{ width: "100%" }}>
                <Input
                  prefix={<ApiOutlined className="text-slate-500" />}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="ws://example.com"
                  disabled={isConnected}
                  className="border-slate-700"
                />
                <Button
                  type={isConnected ? "primary" : "default"}
                  danger={isConnected}
                  className={
                    !isConnected
                      ? "bg-green-600 border-green-600 text-white hover:bg-green-500"
                      : ""
                  }
                  onClick={isConnected ? disconnect : connect}
                  icon={isConnected ? <LogoutOutlined /> : <LoginOutlined />}
                >
                  {isConnected ? (
                    <FormattedMessage
                      id="tools.wsTool.disconnect"
                      defaultMessage="Disconnect"
                    />
                  ) : (
                    <FormattedMessage
                      id="tools.wsTool.connect"
                      defaultMessage="Connect"
                    />
                  )}
                </Button>
              </Space.Compact>
              {/* Heartbeat */}
              <div className="mt-2">
                <Text className="block mb-2 font-medium">
                  <FormattedMessage
                    id="tools.wsTool.heartbeat"
                    defaultMessage="Automatic Heartbeat"
                  />
                </Text>
                <Space className="w-full">
                  <Input
                    type="number"
                    prefix={<ClockCircleOutlined className="text-slate-500" />}
                    value={heartbeatInterval}
                    onChange={(e) =>
                      setHeartbeatInterval(Number(e.target.value))
                    }
                    className="w-24 border-slate-700"
                    suffix="s"
                    disabled={!isConnected}
                  />
                  <Input
                    value={heartbeatContent}
                    onChange={handleHeartBeatContentChange}
                    className="flex-1 border-slate-700"
                    disabled={!isConnected}
                  />
                  <Button
                    type={isAutoSending ? "primary" : "default"}
                    danger={isAutoSending}
                    onClick={toggleHeartbeat}
                    disabled={!isConnected}
                    icon={
                      isAutoSending ? (
                        <PauseCircleOutlined />
                      ) : (
                        <PlayCircleOutlined />
                      )
                    }
                  >
                    {isAutoSending ? (
                      <FormattedMessage
                        id="common.stop"
                        defaultMessage="Stop"
                      />
                    ) : (
                      <FormattedMessage
                        id="common.start"
                        defaultMessage="Start"
                      />
                    )}
                  </Button>
                </Space>
              </div>
              <div className="mt-2">
                <TextArea
                  value={manualContent}
                  onChange={(e) => handleManualContentChange(e.target.value)}
                  rows={4}
                  className="font-mono text-sm border-slate-700/50 text-slate-100 placeholder-slate-500 mb-3"
                  placeholder={intl.formatMessage({
                    id: "tools.wsTool.messagePlaceholder",
                    defaultMessage: "Message content...",
                  })}
                  disabled={!isConnected}
                />
                <div className="flex justify-between items-center mt-2">
                  <Space>
                    <Switch
                      size="small"
                      checked={clearAfterSend}
                      onChange={setClearAfterSend}
                    />
                    <Text className="text-slate-400 text-sm">
                      <FormattedMessage
                        id="tools.wsTool.clearAfterSend"
                        defaultMessage="Clear after send"
                      />
                    </Text>
                  </Space>
                  <Button
                    type="primary"
                    onClick={handleManualSend}
                    disabled={!isConnected || !manualContent}
                    icon={<SendOutlined />}
                  >
                    <FormattedMessage id="common.send" defaultMessage="Send" />
                  </Button>
                </div>
              </div>
            </Card>
            {/* Console Log */}
            <Card
              className="bg-white/5 border-slate-700"
              title={
                <FormattedMessage
                  id="tools.wsTool.console"
                  defaultMessage="Console"
                />
              }
              extra={
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  className="text-slate-400 hover:text-white"
                  onClick={() => setConsoleLogs([])}
                >
                  <FormattedMessage id="common.clear" defaultMessage="Clear" />
                </Button>
              }
            >
              <div
                ref={consoleContainerRef}
                className="h-48 overflow-y-auto p-2 rounded font-mono text-xs custom-scrollbar break-all"
              >
                {consoleLogs.length === 0 && (
                  <div className="text-slate-500 text-center mt-12">
                    <FormattedMessage
                      id="tools.wsTool.noLogs"
                      defaultMessage="No system logs"
                    />
                  </div>
                )}
                {consoleLogs.map((log, i) => (
                  <div
                    key={i}
                    className={`mb-1 ${
                      log.type === "danger"
                        ? "text-red-400"
                        : log.type === "success"
                        ? "text-green-400"
                        : "text-green-400"
                    }`}
                  >
                    <span className="opacity-50 mr-2">[{log.time}]</span>
                    {log.content}
                  </div>
                ))}
              </div>
            </Card>
          </Space>
        </Col>

        {/* ----------------- RIGHT: MESSAGES ----------------- */}
        <Col xs={24} lg={12}>
          <Card
            className="bg-white/5 border-slate-700 h-full flex flex-col"
            title={
              <FormattedMessage
                id="tools.wsTool.messages"
                defaultMessage="Messages"
              />
            }
            extra={
              <Button
                size="small"
                onClick={() => setMessages([])}
                icon={<DeleteOutlined />}
              >
                <FormattedMessage id="common.clear" defaultMessage="Clear" />
              </Button>
            }
            bodyStyle={{ flex: 1, display: "flex", flexDirection: "column" }}
          >
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-4 p-2 rounded">
              <Space size="middle">
                <Space>
                  <Switch
                    disabled={isConnected}
                    size="small"
                    checked={clearAfterReceive}
                    onChange={setClearAfterReceive}
                  />
                  <Text className="text-xs">
                    <FormattedMessage
                      id="tools.wsTool.clearOnRecv"
                      defaultMessage="Clear on Recv"
                    />
                  </Text>
                </Space>
                <Space>
                  <Switch
                    disabled={isConnected}
                    size="small"
                    checked={isJsonDecode}
                    onChange={setIsJsonDecode}
                  />
                  <Text className="text-xs">
                    <FormattedMessage
                      id="tools.wsTool.jsonDecode"
                      defaultMessage="JSON Decode"
                    />
                  </Text>
                </Space>
                <Space>
                  <Switch
                    disabled={isConnected}
                    size="small"
                    checked={isPaused}
                    onChange={setIsPaused}
                    className={isPaused ? "bg-red-500" : ""}
                  />
                  <Text className="text-xs">
                    <FormattedMessage
                      id="tools.wsTool.pauseRecv"
                      defaultMessage="Pause Recv"
                    />
                  </Text>
                </Space>
              </Space>
            </div>

            {/* Message List */}
            <div
              ref={messageContainerRef}
              className="flex-1 overflow-y-auto rounded-lg p-4 font-mono text-sm custom-scrollbar relative"
              style={{ minHeight: "300px", maxHeight: "600px" }}
            >
              {messages.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-slate-500 pointer-events-none">
                  <BugOutlined className="text-4xl mb-2 opacity-20" />
                  <p>
                    <FormattedMessage
                      id="tools.wsTool.noMessages"
                      defaultMessage="No messages yet"
                    />
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`mb-4 flex flex-col ${
                    msg.direction === 1 ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 opacity-70">
                    {msg.direction === 1 ? (
                      <SendOutlined className="text-green-500 text-xs" />
                    ) : (
                      <LoginOutlined className="text-green-500 text-xs" />
                    )}
                    <span
                      className={`text-xs ${
                        msg.direction === 1
                          ? "text-green-400"
                          : "text-green-400"
                      }`}
                    >
                      {msg.direction === 1 ? (
                        <FormattedMessage
                          id="tools.wsTool.sent"
                          defaultMessage="SENT"
                        />
                      ) : (
                        <FormattedMessage
                          id="tools.wsTool.received"
                          defaultMessage="RECEIVED"
                        />
                      )}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">
                      {msg.time}
                    </span>
                  </div>
                  <div
                    className={`
                                            p-3 rounded-lg max-w-[90%] break-words text-black dark:text-white whitespace-pre-wrap
                                            ${
                                              msg.direction === 1
                                                ? "bg-gray-900/20 rounded-tr-none"
                                                : "bg-green-900/20 rounded-tl-none"
                                            }
                                        `}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WsTool;
