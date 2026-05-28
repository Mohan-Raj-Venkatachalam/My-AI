import { Router, Request, Response } from "express";
import OpenAI from "openai";

const router = Router();

const openai = new OpenAI({
  apiKey: process.env["AI_INTEGRATIONS_OPENAI_API_KEY"] ?? "dummy",
  baseURL: process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"],
});

type MessageContent =
  | string
  | { type: "text"; text: string }[]
  | { type: "text" | "image_url"; text?: string; image_url?: { url: string } }[];

interface ApiMessage {
  role: "system" | "user" | "assistant";
  content: MessageContent;
}

router.post("/chat", async (req: Request, res: Response) => {
  const { messages } = req.body as { messages: ApiMessage[] };

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages required" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5.4",
      messages: messages as OpenAI.Chat.ChatCompletionMessageParam[],
      stream: true,
      max_completion_tokens: 8192,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content ?? "";
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    req.log.error({ err }, "AI chat error");
    res.write(
      `data: ${JSON.stringify({ content: "Sorry, I encountered an error. Please try again." })}\n\n`
    );
    res.write("data: [DONE]\n\n");
    res.end();
  }
});

export default router;
