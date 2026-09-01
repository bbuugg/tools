/**
 * 哈希 / HMAC / AES 加解密工具集（基于 crypto-js）
 *
 * - 哈希：MD5 / SHA1 / SHA256 / SHA512，支持 Hex / Base64 输出与大小写
 * - HMAC：MD5 / SHA1 / SHA256 / SHA512，需密钥，输出同上
 * - AES：CBC / ECB / CTR / CFB / OFB 模式，多种填充，密钥与 IV 支持文本 / Hex，
 *        输出 Base64（OpenSSL 兼容盐值格式）或 Hex
 */
import * as CryptoJS from "crypto-js";

export type HashAlgo = "md5" | "sha1" | "sha256" | "sha512";
export type OutputFormat = "hex" | "base64";
export type CaseMode = "lower" | "upper";
export type AesMode = "CBC" | "ECB" | "CTR" | "CFB" | "OFB";
export type AesPadding =
  | "Pkcs7"
  | "ZeroPadding"
  | "NoPadding"
  | "Iso10126"
  | "AnsiX923";
export type KeyFormat = "text" | "hex";

const HASH_FUNCS: Record<HashAlgo, (m: string) => CryptoJS.lib.WordArray> = {
  md5: CryptoJS.MD5,
  sha1: CryptoJS.SHA1,
  sha256: CryptoJS.SHA256,
  sha512: CryptoJS.SHA512,
};

const HMAC_FUNCS: Record<
  HashAlgo,
  (m: string, k: string) => CryptoJS.lib.WordArray
> = {
  md5: CryptoJS.HmacMD5,
  sha1: CryptoJS.HmacSHA1,
  sha256: CryptoJS.HmacSHA256,
  sha512: CryptoJS.HmacSHA512,
};

function toCase(text: string, mode: CaseMode): string {
  return mode === "upper" ? text.toUpperCase() : text.toLowerCase();
}

/** 计算哈希（单向） */
export function computeHash(
  algo: HashAlgo,
  input: string,
  format: OutputFormat,
  caseMode: CaseMode,
): string {
  const enc = format === "base64" ? CryptoJS.enc.Base64 : CryptoJS.enc.Hex;
  return toCase(HASH_FUNCS[algo](input).toString(enc), caseMode);
}

/** 计算 HMAC（需密钥） */
export function computeHmac(
  algo: HashAlgo,
  input: string,
  key: string,
  format: OutputFormat,
  caseMode: CaseMode,
): string {
  const enc = format === "base64" ? CryptoJS.enc.Base64 : CryptoJS.enc.Hex;
  return toCase(HMAC_FUNCS[algo](input, key).toString(enc), caseMode);
}

function parseKey(str: string, format: KeyFormat): CryptoJS.lib.WordArray {
  if (!str) return CryptoJS.lib.WordArray.create();
  return format === "hex"
    ? CryptoJS.enc.Hex.parse(str)
    : CryptoJS.enc.Utf8.parse(str);
}

export interface AesOptions {
  key: string;
  keyFmt: KeyFormat;
  iv: string;
  ivFmt: KeyFormat;
  mode: AesMode;
  padding: AesPadding;
  /** 加密时表示输出格式；解密时表示输入格式 */
  format: OutputFormat;
}

/** AES 加密，输出 Base64（OpenSSL 盐值格式）或 Hex（原始密文） */
export function aesEncrypt(plaintext: string, opts: AesOptions): string {
  const key = parseKey(opts.key, opts.keyFmt);
  const cfg: Record<string, unknown> = {
    mode: (CryptoJS.mode as Record<string, unknown>)[opts.mode],
    padding: (CryptoJS.pad as Record<string, unknown>)[opts.padding],
  };
  if (opts.mode !== "ECB") cfg.iv = parseKey(opts.iv, opts.ivFmt);
  const ct = CryptoJS.AES.encrypt(plaintext, key, cfg as never);
  return opts.format === "hex" ? ct.ciphertext.toString() : ct.toString();
}

/** AES 解密，输入为 Base64 或 Hex（见 opts.format） */
export function aesDecrypt(ciphertext: string, opts: AesOptions): string {
  const key = parseKey(opts.key, opts.keyFmt);
  const cfg: Record<string, unknown> = {
    mode: (CryptoJS.mode as Record<string, unknown>)[opts.mode],
    padding: (CryptoJS.pad as Record<string, unknown>)[opts.padding],
  };
  if (opts.mode !== "ECB") cfg.iv = parseKey(opts.iv, opts.ivFmt);

  let params: CryptoJS.lib.CipherParams | string = ciphertext;
  if (opts.format === "hex") {
    params = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Hex.parse(ciphertext),
    });
  }
  const bytes = CryptoJS.AES.decrypt(params, key, cfg as never);
  const text = bytes.toString(CryptoJS.enc.Utf8);
  if (!text) throw new Error("解密失败：密钥 / IV / 模式 / 填充不匹配或密文损坏");
  return text;
}
