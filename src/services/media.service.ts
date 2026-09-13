import { HttpError } from "../helpers/http-error.helper.js";
import { uploadBuffer } from "./storage.service.js";

export async function uploadMedia(
  file: Express.Multer.File | undefined,
  folderRaw: unknown,
) {
  if (!file) throw new HttpError(400, "Choose a file to upload.");
  const folder = String(folderRaw ?? "products").replace(/[^a-z0-9/_-]/gi, "") || "products";
  return uploadBuffer(file, folder);
}
