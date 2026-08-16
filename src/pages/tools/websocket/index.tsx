import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Bug,
  LogIn,
  LogOut,
  Pause,
  Play,
  Send,
  Trash2
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import MonacoEditor from "@/components/MonacoEditor";

interface LogMessage { type: "success" | "danger" | "info"; content: string; time: string }
interface WSMessage { direction: 0 | 1; content: string; time: string }

const getTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
};

export default function WsToolPage() {
  const [address, setAddress] = useState("ws://127.0.0.1:9501");
  const [isConnected, setIsConnected] = useState(false);
  const [readyState, setReadyState] = useState(0);
  const [heartbeatInterval, setHeartbeatInterval] = useState(1);
  const [heartbeatContent, setHeartbeatContent] = useState("PING");
  const [isAutoSending, setIsAutoSending] = useState(false);
  const [manualContent, setManualContent] = useState("");
  const [messageLanguage, setMessageLanguage] = useState("json");
  const [clearAfterSend, setClearAfterSend] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<LogMessage[]>([]);
  const [messages, setMessages] = useState<WSMessage[]>([]);
  const [clearAfterReceive, setClearAfterReceive] = useState(false);
  const [isJsonDecode, setIsJsonDecode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const ws = useRef<WebSocket | null>(null);
  const heartbeatTimer = useRef<number | null>(null);
  const consoleRef = useRef<HTMLDivElement>(null);
  const msgRef = useRef<HTMLDivElement>(null);

  // Refs for dynamically-switchable options so onmessage handler always reads latest values
  const isPausedRef = useRef(isPaused);
  const isJsonDecodeRef = useRef(isJsonDecode);
  const clearAfterReceiveRef = useRef(clearAfterReceive);

  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { isJsonDecodeRef.current = isJsonDecode; }, [isJsonDecode]);
  useEffect(() => { clearAfterReceiveRef.current = clearAfterReceive; }, [clearAfterReceive]);

  useEffect(() => {
    const saved = localStorage.getItem("tools.ws.address");
    if (saved) setAddress(saved);
    const hbc = localStorage.getItem("tools.ws.heart_beat_content");
    if (hbc) setHeartbeatContent(hbc);
    const mt = localStorage.getItem("tools.ws.manual_content");
    if (mt) setManualContent(mt);
  }, []);

  useEffect(() => {
    return () => {
      if (heartbeatTimer.current) clearInterval(heartbeatTimer.current);
      ws.current?.close();
    };
  }, []);

  useEffect(() => { consoleRef.current?.scrollTo({ top: consoleRef.current.scrollHeight, behavior: "smooth" }); }, [consoleLogs]);
  useEffect(() => { msgRef.current?.scrollTo({ top: msgRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const addLog = (type: LogMessage["type"], content: string) =>
    setConsoleLogs((p) => [...p.slice(-99), { type, content, time: getTime() }]);

  const addMessage = useCallback((dir: 0 | 1, content: string) => {
    if (isPausedRef.current && dir === 0) return;
    let formatted = content;
    if (dir === 0 && isJsonDecodeRef.current) {
      try { formatted = JSON.stringify(JSON.parse(content), null, 2); } catch { }
    }
    setMessages((p) => {
      const next = clearAfterReceiveRef.current && dir === 0 ? [] : p;
      return [...next.slice(-99), { direction: dir, content: formatted, time: getTime() }];
    });
  }, []);

  const connect = () => {
    if (ws.current) ws.current.close();
    localStorage.setItem("tools.ws.address", address);
    const socket = new WebSocket(address);
    ws.current = socket;
    setReadyState(0);
    addLog("info", `正在连接 ${address}...`);
    socket.onopen = () => { setReadyState(1); setIsConnected(true); addLog("success", `已连接 ${address}`); };
    socket.onclose = (e) => { setReadyState(3); setIsConnected(false); setIsAutoSending(false); stopHeartbeat(); addLog("danger", `已断开 (code: ${e.code})`); ws.current = null; };
    socket.onerror = () => addLog("danger", "连接错误");
    socket.onmessage = (e) => addMessage(0, typeof e.data === "string" ? e.data : "Binary Data");
  };

  const disconnect = () => ws.current?.close(1000, "用户断开");

  const send = useCallback((data: string) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) return;
    ws.current.send(data);
    addMessage(1, data);
  }, [addMessage]);

  const handleSend = () => {
    if (!manualContent) return;
    send(manualContent);
    if (clearAfterSend) { setManualContent(""); localStorage.removeItem("tools.ws.manual_content"); }
  };

  const startHeartbeat = () => {
    if (!ws.current || !isConnected) return;
    setIsAutoSending(true);
    heartbeatTimer.current = window.setInterval(() => {
      send(heartbeatContent);
      addLog("info", `心跳已发送: ${heartbeatContent}`);
    }, heartbeatInterval * 1000);
  };

  const stopHeartbeat = () => {
    setIsAutoSending(false);
    if (heartbeatTimer.current) { clearInterval(heartbeatTimer.current); heartbeatTimer.current = null; }
  };

  const statusText = ["连接中", "已连接", "关闭中", "已断开"][readyState] || "未知";
  const statusColor = readyState === 1 ? "bg-green-500" : readyState === 0 ? "bg-amber-500" : "bg-red-500";

  return (
    <>
      <div>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Left: Config */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${statusColor}`} />
                  <span className="text-sm font-medium">{statusText}</span>
                </div>
                <div className="flex gap-2">
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="ws://example.com" disabled={isConnected} />
                  {isConnected ? (
                    <Button variant="destructive" onClick={disconnect}><LogOut className="size-4" /> 断开</Button>
                  ) : (
                    <Button onClick={connect}><LogIn className="size-4" /> 连接</Button>
                  )}
                </div>
                {/* Heartbeat */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">自动心跳</Label>
                  <div className="flex gap-2">
                    <Input type="number" className="w-20" value={heartbeatInterval} onChange={(e) => setHeartbeatInterval(Number(e.target.value))} disabled={!isConnected} />
                    <span className="flex items-center text-xs text-muted-foreground">秒</span>
                    <Input className="flex-1" value={heartbeatContent} onChange={(e) => { setHeartbeatContent(e.target.value); localStorage.setItem("tools.ws.heart_beat_content", e.target.value); }} disabled={!isConnected} />
                    <Button variant={isAutoSending ? "destructive" : "outline"} onClick={() => isAutoSending ? stopHeartbeat() : startHeartbeat()} disabled={!isConnected}>
                      {isAutoSending ? <Pause className="size-4" /> : <Play className="size-4" />} {isAutoSending ? "停止" : "启动"}
                    </Button>
                  </div>
                </div>
                {/* Manual Send */}
                <div>
                  <MonacoEditor value={manualContent} onChange={(v) => { setManualContent(v); localStorage.setItem("tools.ws.manual_content", v); }} language={messageLanguage} showLanguageSelector onLanguageChange={setMessageLanguage} height="180px" />
                  <div className="flex justify-between items-center mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Switch checked={clearAfterSend} onCheckedChange={setClearAfterSend} />
                      <span className="text-xs text-muted-foreground">发送后清空</span>
                    </label>
                    <Button onClick={handleSend} disabled={!isConnected || !manualContent}><Send className="size-4" /> 发送</Button>
                  </div>
                </div>
              </div>

              {/* Console */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium">控制台日志</Label>
                  <Button variant="ghost" size="sm" onClick={() => setConsoleLogs([])} disabled={!consoleLogs.length}><Trash2 className="size-3.5" /> 清空</Button>
                </div>
                <div ref={consoleRef} className="h-40 overflow-y-auto rounded bg-gray-900 p-2 font-mono text-xs">
                  {consoleLogs.length === 0 ? (
                    <div className="text-muted-foreground text-center mt-12">暂无日志</div>
                  ) : consoleLogs.map((log, i) => (
                    <div key={i} className={`mb-1 ${log.type === "danger" ? "text-red-400" : "text-green-400"}`}>
                      <span className="opacity-50 mr-2">[{log.time}]</span>{log.content}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Messages */}
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">消息记录</Label>
                <Button variant="ghost" size="sm" onClick={() => setMessages([])} disabled={!messages.length}><Trash2 className="size-3.5" /> 清空</Button>
              </div>
              <div className="flex flex-wrap gap-4 mb-4 pb-3 border-b border-border">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch checked={clearAfterReceive} onCheckedChange={setClearAfterReceive} />
                  <span className="text-xs text-muted-foreground">接收时清空</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch checked={isJsonDecode} onCheckedChange={setIsJsonDecode} />
                  <span className="text-xs text-muted-foreground">JSON 美化</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch checked={isPaused} onCheckedChange={setIsPaused} />
                  <span className="text-xs text-muted-foreground">暂停接收</span>
                </label>
              </div>
              <div ref={msgRef} className="overflow-y-auto rounded-lg p-4 font-mono text-sm" style={{ minHeight: "300px", maxHeight: "500px" }}>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-20">
                    <Bug className="size-8 opacity-30 mb-2" />
                    <p className="text-sm">暂无消息</p>
                  </div>
                ) : messages.map((msg, i) => (
                  <div key={i} className={`mb-3 flex flex-col ${msg.direction === 1 ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs text-muted-foreground">{msg.direction === 1 ? "已发送" : "已接收"}</span>
                      <span className="text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                    <div className={`p-2 rounded-lg max-w-[90%] break-words whitespace-pre-wrap text-xs ${msg.direction === 1 ? "bg-blue-50 text-blue-900 rounded-tr-none" : "bg-green-50 text-green-900 rounded-tl-none"}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
