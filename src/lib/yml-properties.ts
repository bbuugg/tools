/**
 * YAML ↔ Properties 互转
 *
 * YAML → Properties：递归扁平化对象（数组用 key[i] 表示），可选分隔符、
 * Unicode 转义与键名排序。
 * Properties → YAML：按 `.` 还原层级并推断值类型（布尔 / 数字 / null）。
 */

import * as yaml from "js-yaml";

export interface YmlToPropertiesOptions {
  /** 分隔符：equals => `=`，colon => `:` */
  delimiter: string;
  /** 非 ASCII 字符转成 \uXXXX */
  escapeUnicode: boolean;
  /** 键名排序 */
  sortKeys: boolean;
}

export interface PropertiesToYmlOptions {
  /** 缩进空格数 */
  indent: number;
  /** 强制使用引号包裹字符串 */
  quoteStrings: boolean;
  /** 键名排序 */
  sortKeys: boolean;
}

function flattenObject(
  obj: unknown,
  prefix = "",
  result: Record<string, string> = {},
) {
  if (obj !== null && typeof obj === "object" && !Array.isArray(obj)) {
    for (const key of Object.keys(obj as Record<string, unknown>)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      flattenObject((obj as Record<string, unknown>)[key], newKey, result);
    }
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      const newKey = `${prefix}[${index}]`;
      flattenObject(item, newKey, result);
    });
  } else {
    result[prefix] = obj === null || obj === undefined ? "" : String(obj);
  }
  return result;
}

function unflattenObject(flat: Record<string, string>): unknown {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(flat)) {
    const parts = key.split(".");
    let current: Record<string, unknown> = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (current[part] === undefined || current[part] === null) {
        current[part] = {};
      }
      current = current[part] as Record<string, unknown>;
    }
    const lastPart = parts[parts.length - 1];
    const value = flat[key];
    // 推断值类型
    if (value === "true" || value === "false") {
      current[lastPart] = value === "true";
    } else if (value === "null" || value === "") {
      current[lastPart] = null;
    } else if (/^-?\d+$/.test(value)) {
      current[lastPart] = parseInt(value, 10);
    } else if (/^-?\d+\.\d+$/.test(value)) {
      current[lastPart] = parseFloat(value);
    } else {
      current[lastPart] = value;
    }
  }
  return result;
}

function sortObjectKeys(obj: Record<string, unknown>): Record<string, unknown> {
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    const val = obj[key];
    if (val !== null && typeof val === "object" && !Array.isArray(val)) {
      sorted[key] = sortObjectKeys(val as Record<string, unknown>);
    } else {
      sorted[key] = val;
    }
  }
  return sorted;
}

export function ymlToProperties(
  ymlContent: string,
  opts: YmlToPropertiesOptions,
): string {
  const parsed = yaml.load(ymlContent);
  if (parsed === null || parsed === undefined) return "";
  if (typeof parsed !== "object") return String(parsed);
  const flat = flattenObject(parsed);
  let keys = Object.keys(flat);
  if (opts.sortKeys) keys = keys.sort();
  const delim = opts.delimiter === "colon" ? ":" : "=";
  const lines: string[] = [];
  for (const key of keys) {
    let val = flat[key];
    if (opts.escapeUnicode) {
      val = val.replace(/[\u0080-\uffff]/g, (ch) => {
        const code = ch.charCodeAt(0);
        return `\\u${code.toString(16).padStart(4, "0")}`;
      });
    }
    lines.push(`${key}${delim}${val}`);
  }
  return lines.join("\n");
}

export function propertiesToYml(
  propsContent: string,
  opts: PropertiesToYmlOptions,
): string {
  const flat: Record<string, string> = {};
  const lines = propsContent.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed.startsWith("!")) continue;
    const eqIdx = trimmed.indexOf("=");
    const colonIdx = trimmed.indexOf(":");
    let sepIdx = -1;
    // 优先用 =，若 : 出现在 = 之前则用 :
    if (eqIdx !== -1 && (colonIdx === -1 || eqIdx < colonIdx)) {
      sepIdx = eqIdx;
    } else if (colonIdx !== -1) {
      sepIdx = colonIdx;
    }
    if (sepIdx === -1) continue;
    const key = trimmed.substring(0, sepIdx).trim();
    const value = trimmed.substring(sepIdx + 1).trim();
    if (key) flat[key] = value;
  }
  let obj = unflattenObject(flat);
  if (opts.sortKeys && typeof obj === "object" && obj !== null) {
    obj = sortObjectKeys(obj as Record<string, unknown>);
  }
  return yaml.dump(obj, {
    indent: opts.indent,
    lineWidth: 120,
    forceQuotes: opts.quoteStrings,
  });
}
