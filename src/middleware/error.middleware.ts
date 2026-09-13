import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../helpers/http-error.helper.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (!(err instanceof HttpError) || err.status >= 500) {
    console.error(err);
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (typeof err === "object" && err && "status" in err && (err as { status?: number }).status === 400) {
    res.status(400).json({ error: "Invalid request body." });
    return;
  }

  const message = err instanceof Error ? err.message : "Something went wrong.";
  res.status(500).json({ error: message });
}
