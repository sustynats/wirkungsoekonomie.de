import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { IMAGE_CONFIG, imageError, digest } from "./policy.mjs";

export function inspectImage(bytes, { minWidth = 1200 } = {}) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 32 || bytes.length > IMAGE_CONFIG.max_image_bytes) throw imageError("IMAGE_SIZE_INVALID");
  let width, height, mime, extension;
  if (bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) && bytes.toString("ascii", 12, 16) === "IHDR") {
    let idat = false, end = false;
    for (let offset = 8; offset + 12 <= bytes.length;) {
      const size = bytes.readUInt32BE(offset), type = bytes.toString("ascii", offset + 4, offset + 8);
      if (offset + size + 12 > bytes.length) throw imageError("IMAGE_FORMAT_INVALID");
      if (type === "IDAT" && size) idat = true;
      offset += size + 12;
      if (type === "IEND") { end = offset === bytes.length && size === 0; break; }
    }
    if (!idat || !end) throw imageError("IMAGE_FORMAT_INVALID");
    width = bytes.readUInt32BE(16); height = bytes.readUInt32BE(20); mime = "image/png"; extension = "png";
  } else if (bytes[0] === 255 && bytes[1] === 216) {
    if (bytes.at(-2) !== 255 || bytes.at(-1) !== 217) throw imageError("IMAGE_FORMAT_INVALID");
    for (let i = 2; i + 9 < bytes.length;) {
      if (bytes[i++] !== 255) continue;
      const marker = bytes[i++];
      if (marker === 255 || marker === 216) continue;
      if (marker === 218 || marker === 217) break;
      const length = bytes.readUInt16BE(i);
      if (length < 2 || i + length > bytes.length) break;
      if ([192,193,194].includes(marker)) { height = bytes.readUInt16BE(i + 3); width = bytes.readUInt16BE(i + 5); break; }
      i += length;
    }
    mime = "image/jpeg"; extension = "jpg";
  } else if (bytes.toString("ascii",0,4) === "RIFF" && bytes.toString("ascii",8,12) === "WEBP") {
    if (bytes.readUInt32LE(4) + 8 !== bytes.length) throw imageError("IMAGE_FORMAT_INVALID");
    const codec = bytes.toString("ascii", 12, 16);
    if (codec === "VP8X") { width = 1 + bytes.readUIntLE(24,3); height = 1 + bytes.readUIntLE(27,3); }
    else if (codec === "VP8 " && bytes[23] === 157 && bytes[24] === 1 && bytes[25] === 42) { width = bytes.readUInt16LE(26) & 16383; height = bytes.readUInt16LE(28) & 16383; }
    else if (codec === "VP8L" && bytes[20] === 47) { const bits = bytes.readUInt32LE(21); width = (bits & 16383) + 1; height = ((bits >>> 14) & 16383) + 1; }
    mime = "image/webp"; extension = "webp";
  }
  if (!width || !height || width < minWidth || height < 400 || width > 8192 || height > 8192 || width * height > 34000000) throw imageError("IMAGE_FORMAT_INVALID");
  return { width, height, mime, extension, sha256: digest(bytes), byte_length: bytes.length };
}

const ALLOWED_HOSTS = ["higgsfield.ai", "higgsfield.cloud", "higgsfield-cdn.com", "d8j0ntlcm91z4.cloudfront.net", "github.com", "release-assets.githubusercontent.com", "objects.githubusercontent.com"];
export async function downloadImage(url, { fetchImpl = fetch, lookupImpl = lookup, minWidth = 1200 } = {}) {
  let current = url;
  for (let hop = 0; hop < 4; hop++) {
    const parsed = new URL(current);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || (parsed.port && parsed.port !== "443") || isIP(parsed.hostname) || !ALLOWED_HOSTS.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`))) throw imageError("IMAGE_URL_NOT_ALLOWED");
    const addresses = await lookupImpl(parsed.hostname, { all: true });
    if (!addresses.length || addresses.some(({ address }) => /^(?:127\.|10\.|192\.168\.|169\.254\.|0\.|172\.(?:1[6-9]|2\d|3[01])\.|::|fc|fd|fe80)/i.test(address))) throw imageError("IMAGE_URL_NOT_PUBLIC");
    const response = await fetchImpl(current, { redirect: "manual", signal: AbortSignal.timeout(20000) });
    if ([301,302,303,307,308].includes(response.status)) { current = new URL(response.headers.get("location"), current).href; await response.body?.cancel(); continue; }
    if (!response.ok) throw imageError("IMAGE_DOWNLOAD_FAILED");
    if (Number(response.headers.get("content-length")) > IMAGE_CONFIG.max_image_bytes) { await response.body?.cancel(); throw imageError("IMAGE_SIZE_INVALID"); }
    const chunks = []; let size = 0;
    for await (const chunk of response.body) { size += chunk.length; if (size > IMAGE_CONFIG.max_image_bytes) throw imageError("IMAGE_SIZE_INVALID"); chunks.push(chunk); }
    const bytes = Buffer.concat(chunks);
    return { bytes, ...inspectImage(bytes, { minWidth }) };
  }
  throw imageError("IMAGE_REDIRECT_LIMIT");
}
