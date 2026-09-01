/**
 * 文本编码 / 解码工具集
 *
 * 支持 URL、Base64、Base64URL、Unicode、HTML 实体、HTML 转义、
 * Quoted-Printable（RFC 2045）等常见文本编码格式。
 * 依赖浏览器 API（btoa / atob / DOM / TextEncoder），仅在客户端使用。
 */

export type EncodeType =
  | "url"
  | "base64"
  | "base64url"
  | "unicode"
  | "htmlEntity"
  | "htmlEscape"
  | "quotedPrintable";

export type EncodeDir = "encode" | "decode";

export const ENCODE_TYPES: { value: EncodeType; label: string }[] = [
  { value: "url", label: "URL 编码" },
  { value: "base64", label: "Base64" },
  { value: "base64url", label: "Base64URL" },
  { value: "unicode", label: "Unicode" },
  { value: "htmlEntity", label: "HTML 实体" },
  { value: "htmlEscape", label: "HTML 转义" },
  { value: "quotedPrintable", label: "Quoted-Printable" },
];

export function encodeText(type: EncodeType, input: string): string {
  switch (type) {
    case "url":
      return encodeURIComponent(input);
    case "base64":
      return btoa(unescape(encodeURIComponent(input)));
    case "base64url":
      return btoa(unescape(encodeURIComponent(input)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    case "unicode":
      return Array.from(input)
        .map((char) => {
          const code = char.charCodeAt(0);
          if (code > 127) return `\\u${code.toString(16).padStart(4, "0")}`;
          return char;
        })
        .join("");
    case "htmlEntity":
      return Array.from(input)
        .map((char) => `&#x${char.codePointAt(0)?.toString(16).toLowerCase()};`)
        .join("");
    case "htmlEscape": {
      const el = document.createElement("div");
      el.textContent = input;
      return el.innerHTML;
    }
    case "quotedPrintable":
      return quotedPrintableEncode(input);
  }
}

export function decodeText(type: EncodeType, input: string): string {
  switch (type) {
    case "url":
      return decodeURIComponent(input);
    case "base64":
      return decodeURIComponent(escape(atob(input)));
    case "base64url": {
      let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4) b64 += "=";
      return decodeURIComponent(escape(atob(b64)));
    }
    case "unicode":
      return input.replace(/\\u([0-9a-fA-F]{4})/g, (_, g) =>
        String.fromCharCode(parseInt(g, 16)),
      );
    case "htmlEntity":
      return input.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
        String.fromCodePoint(parseInt(hex, 16)),
      );
    case "htmlEscape": {
      const el = document.createElement("div");
      el.innerHTML = input;
      return el.textContent || "";
    }
    case "quotedPrintable":
      return quotedPrintableDecode(input);
  }
}

// ─── Quoted-Printable (RFC 2045 / MIME) ──────────────────────────
// 编码 UTF-8 字节：可打印 ASCII 原样保留，其余转成 =XX（大写十六进制）。
// 行长超过 76 字符时插入软换行（"=\r\n"）；行尾空白会被编码以符合规范。

export function quotedPrintableEncode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let result = "";
  let lineLen = 0;

  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];

    // 硬换行（CRLF / LF）原样输出
    if (b === 0x0d || b === 0x0a) {
      result += b === 0x0d ? "\r\n" : "\n";
      if (b === 0x0d && bytes[i + 1] === 0x0a) i++;
      lineLen = 0;
      continue;
    }

    let token: string;
    const isPlain =
      (b >= 0x21 && b <= 0x3c) || // ! ~ <
      (b >= 0x3e && b <= 0x7e) || // > ~ ~
      b === 0x09 || // tab
      b === 0x20; // space

    if (isPlain) {
      // 位于行尾或文末的空格 / 制表符必须编码
      const nextIsBreak =
        bytes[i + 1] === 0x0d || bytes[i + 1] === 0x0a || i === bytes.length - 1;
      if ((b === 0x09 || b === 0x20) && nextIsBreak) {
        token = "=" + b.toString(16).toUpperCase().padStart(2, "0");
      } else {
        token = String.fromCharCode(b);
      }
    } else {
      token = "=" + b.toString(16).toUpperCase().padStart(2, "0");
    }

    // 超过 76 字符限制时插入软换行
    if (lineLen + token.length > 76) {
      result += "=\r\n";
      lineLen = 0;
    }
    result += token;
    lineLen += token.length;
  }

  return result;
}

export function quotedPrintableDecode(input: string): string {
  // 先移除软换行
  const cleaned = input.replace(/=\r?\n/g, "");
  const bytes: number[] = [];
  const re = /=(?:([0-9A-Fa-f]{2})|$)/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cleaned)) !== null) {
    const segment = cleaned.slice(lastIndex, m.index);
    for (let i = 0; i < segment.length; i++) bytes.push(segment.charCodeAt(i));
    if (m[1]) bytes.push(parseInt(m[1], 16));
    lastIndex = re.lastIndex;
  }
  const rest = cleaned.slice(lastIndex);
  for (let i = 0; i < rest.length; i++) bytes.push(rest.charCodeAt(i));
  return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
}
