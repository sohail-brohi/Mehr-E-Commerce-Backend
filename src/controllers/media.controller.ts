import type { Request, Response } from "express";
import { Readable } from "node:stream";
import { HttpError } from "../helpers/http-error.helper.js";
import * as mediaService from "../services/media.service.js";
import { getObject } from "../services/storage.service.js";

export async function upload(req: Request, res: Response) {
  res.status(201).json(await mediaService.uploadMedia(req.file, req.body?.folder));
}

export async function serve(req: Request, res: Response) {
  const key = decodeURIComponent(req.path.replace(/^\/+/, ""));
  const object = await getObject(key);
  if (!object?.Body) throw new HttpError(404, "File not found.");

  if (object.ContentType) res.setHeader("Content-Type", object.ContentType);
  if (object.ContentLength) res.setHeader("Content-Length", String(object.ContentLength));
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

  const body = object.Body;
  if (body instanceof Readable) {
    body.pipe(res);
    return;
  }
  const bytes = await body.transformToByteArray();
  res.end(Buffer.from(bytes));
}
