import type { Request, Response } from "express";
import { MessageService } from "../services/message.service.js";
import { logger } from "../logger/logger.js";

function initSSE(res: Response) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
  // A destroyed/closed socket must not crash the process with an
  // unhandled 'error' event when we later try to res.write() to it.
  res.on("error", (err) => logger.warn("SSE response stream error", { error: err }));
}

function sendEvent(res: Response, event: string, data: unknown) {
  if (res.writableEnded) return;
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

/**
 * Wires up the "client disappeared" path (tab closed, network dropped,
 * fetch aborted) so generation stops server-side even when the client
 * never gets a chance to call the explicit /stop endpoint.
 */
function stopOnDisconnect(req: Request, chatId: string) {
  req.on("close", () => {
    if (!req.complete) MessageService.stopGeneration(chatId);
  });
}

export const MessageController = {
  async list(req: Request, res: Response) {
    const messages = await MessageService.listMessages(req.params.chatId, req.user!.sub);
    res.json({ success: true, data: messages });
  },

  async send(req: Request, res: Response) {
    initSSE(res);
    const { chatId } = req.params;
    const { content } = req.body;
    stopOnDisconnect(req, chatId);

    const heartbeat = setInterval(() => res.write(": ping\n\n"), 15000);

    try {
      const assistantMessage = await MessageService.sendMessage({
        chatId,
        userId: req.user!.sub,
        content,
        onToken: (token) => sendEvent(res, "token", { token }),
      });
      sendEvent(res, "done", { message: assistantMessage });
    } catch (err) {
      logger.error("Streaming send failed", { error: err, chatId });
      sendEvent(res, "error", { message: "Failed to generate response" });
    } finally {
      clearInterval(heartbeat);
      res.end();
    }
  },

  async regenerate(req: Request, res: Response) {
    initSSE(res);
    const { chatId, messageId } = req.params;
    stopOnDisconnect(req, chatId);
    const heartbeat = setInterval(() => res.write(": ping\n\n"), 15000);

    try {
      const assistantMessage = await MessageService.regenerate({
        chatId,
        userId: req.user!.sub,
        messageId,
        onToken: (token) => sendEvent(res, "token", { token }),
      });
      sendEvent(res, "done", { message: assistantMessage });
    } catch (err) {
      logger.error("Streaming regenerate failed", { error: err, chatId, messageId });
      sendEvent(res, "error", { message: "Failed to regenerate response" });
    } finally {
      clearInterval(heartbeat);
      res.end();
    }
  },

  async editAndResend(req: Request, res: Response) {
    initSSE(res);
    const { chatId, messageId } = req.params;
    const { content } = req.body;
    stopOnDisconnect(req, chatId);
    const heartbeat = setInterval(() => res.write(": ping\n\n"), 15000);

    try {
      const assistantMessage = await MessageService.editUserMessage({
        chatId,
        userId: req.user!.sub,
        messageId,
        newContent: content,
        onToken: (token) => sendEvent(res, "token", { token }),
      });
      sendEvent(res, "done", { message: assistantMessage });
    } catch (err) {
      logger.error("Streaming edit failed", { error: err, chatId, messageId });
      sendEvent(res, "error", { message: "Failed to process edited message" });
    } finally {
      clearInterval(heartbeat);
      res.end();
    }
  },

  async stop(req: Request, res: Response) {
    MessageService.stopGeneration(req.params.chatId);
    res.json({ success: true, message: "Generation stop requested" });
  },
};
