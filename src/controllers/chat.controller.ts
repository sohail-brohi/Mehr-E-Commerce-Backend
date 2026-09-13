import type { Request, Response } from "express";
import { HttpError } from "../helpers/http-error.helper.js";
import { answerChat, type ChatTurn } from "../services/chat.service.js";

export async function ask(req: Request, res: Response) {
  const incoming = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const messages: ChatTurn[] = incoming
    .filter((m: unknown) => m && typeof m === "object" && "role" in m && "content" in m)
    .map((m: { role: string; content: unknown }) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content ?? "").slice(0, 500),
    }))
    .slice(-12);

  if (!messages.some((m) => m.role === "user" && m.content.trim())) {
    throw new HttpError(400, "Ask a question about MEHR.");
  }

  try {
    res.json(await answerChat(messages));
  } catch (error) {
    console.error(error);
    throw new HttpError(500, "The desk is quiet for a moment. Try again, or write hello@mehr.pk.");
  }
}
