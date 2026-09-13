import type { Request, Response } from "express";
import * as mediaService from "../services/media.service.js";

export async function upload(req: Request, res: Response) {
  res.status(201).json(await mediaService.uploadMedia(req.file, req.body?.folder));
}
