import { Router } from "express";
import { rateLimit } from "../middleware/rateLimit.js";
import { answerChat, type ChatTurn } from "../lib/chat.js";

export const chatRouter = Router();
const limit = rateLimit(24, 15 * 60 * 1000);

chatRouter.post("/", limit, async (req, res) => {
  const incoming = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const messages: ChatTurn[] = incoming
    .filter((m: unknown) => m && typeof m === "object" && "role" in m && "content" in m)
    .map((m: { role: string; content: unknown }) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content ?? "").slice(0, 500),
    }))
    .slice(-12);

  if (!messages.some((m) => m.role === "user" && m.content.trim())) {
    res.status(400).json({ error: "Ask a question about MEHR." });
    return;
  }

  try {
    const reply = await answerChat(messages);
    res.json(reply);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "The desk is quiet for a moment. Try again, or write hello@mehr.pk." });
  }
});
