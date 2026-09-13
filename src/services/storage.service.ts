import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import path from "path";
import { env } from "../config/env.js";
import { requestOrigin } from "../middleware/request-origin.middleware.js";

export const s3 = new S3Client({
  region: env.s3.region,
  endpoint: env.s3.endpoint,
  forcePathStyle: env.s3.forcePathStyle,
  credentials: {
    accessKeyId: env.s3.accessKey,
    secretAccessKey: env.s3.secretKey,
  },
});

const isAbsolute = (value: string) => /^(https?:|blob:|data:|\/)/.test(value);

export function safeObjectKey(raw: string) {
  const key = decodeURIComponent(raw)
    .replace(/^\/+/, "")
    .replace(/\.\./g, "")
    .replace(/^\/+/, "");
  if (!key || !/^[a-zA-Z0-9._/-]+$/.test(key)) return "";
  return key;
}

export function objectKey(value: string) {
  if (!value) return "";
  if (!isAbsolute(value)) return safeObjectKey(value);
  try {
    const url = new URL(value);
    const parts = url.pathname.replace(/^\/+/, "").split("/");
    if (parts[0] === env.s3.bucket) return safeObjectKey(parts.slice(1).join("/"));
    return safeObjectKey(parts.join("/"));
  } catch {
    return "";
  }
}

export function publicUrl(objectPath: string): string {
  if (!objectPath) return "";
  if (/^(blob:|data:)/.test(objectPath)) return objectPath;
  const key = objectKey(objectPath);
  if (!key) return isAbsolute(objectPath) ? objectPath : "";
  const origin = (requestOrigin() || env.apiPublicUrl).replace(/\/$/, "");
  if (origin) return `${origin}/api/media/${key}`;
  return `${env.s3.publicUrl}/${key}`;
}

export async function getObject(objectPath: string) {
  const key = objectKey(objectPath);
  if (!key) return null;
  try {
    return await s3.send(
      new GetObjectCommand({
        Bucket: env.s3.bucket,
        Key: key,
      }),
    );
  } catch {
    return null;
  }
}

export async function uploadBuffer(
  file: { buffer: Buffer; originalname: string; mimetype: string },
  folder = "products",
): Promise<{ path: string; url: string }> {
  const ext = path.extname(file.originalname).replace(".", "").toLowerCase() || "bin";
  const key = `${folder}/${randomUUID()}.${ext}`;
  return uploadAtKey(file.buffer, key, file.mimetype);
}

export async function uploadAtKey(
  body: Buffer,
  key: string,
  contentType: string,
): Promise<{ path: string; url: string }> {
  await s3.send(
    new PutObjectCommand({
      Bucket: env.s3.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000",
    }),
  );
  return { path: key, url: publicUrl(key) };
}
