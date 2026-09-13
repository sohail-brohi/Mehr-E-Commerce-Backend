import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import path from "path";
import { env } from "../config/env.js";

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

export function publicUrl(objectPath: string): string {
  if (!objectPath) return "";
  if (isAbsolute(objectPath)) return objectPath;
  return `${env.s3.publicUrl}/${objectPath.replace(/^\//, "")}`;
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
