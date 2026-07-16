import type { Request, Response } from "express";
import { ChatService } from "../services/chat.service.js";
import { ApiError } from "../utils/ApiError.js";

export const ChatController = {
  async create(req: Request, res: Response) {
    const chat = await ChatService.createChat(req.user!.sub, req.body);
    res.status(201).json({ success: true, data: chat });
  },

  async list(req: Request, res: Response) {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const archived = req.query.archived === "true" ? true : req.query.archived === "false" ? false : undefined;
    const chats = await ChatService.listChats(req.user!.sub, search, archived);
    res.json({ success: true, data: chats });
  },

  async get(req: Request, res: Response) {
    const { chat, messages } = await ChatService.getChatWithMessages(req.params.chatId, req.user!.sub);
    res.json({ success: true, data: { chat, messages } });
  },

  async rename(req: Request, res: Response) {
    const chat = await ChatService.renameChat(req.params.chatId, req.user!.sub, req.body.title);
    res.json({ success: true, data: chat });
  },

  async pin(req: Request, res: Response) {
    const chat = await ChatService.pinChat(req.params.chatId, req.user!.sub, req.body.isPinned);
    res.json({ success: true, data: chat });
  },

  async archive(req: Request, res: Response) {
    const chat = await ChatService.archiveChat(req.params.chatId, req.user!.sub, req.body.isArchived);
    res.json({ success: true, data: chat });
  },

  async remove(req: Request, res: Response) {
    await ChatService.deleteChat(req.params.chatId, req.user!.sub);
    res.json({ success: true, message: "Chat deleted" });
  },

  async exportChat(req: Request, res: Response) {
    const data = await ChatService.exportChat(req.params.chatId, req.user!.sub);
    res.setHeader("Content-Disposition", `attachment; filename="chat-${req.params.chatId}.json"`);
    res.json(data);
  },

  async importChat(req: Request, res: Response) {
    if (!Array.isArray(req.body.messages) || req.body.messages.length === 0) {
      throw ApiError.badRequest("No messages to import");
    }
    const chat = await ChatService.importChat(req.user!.sub, req.body);
    res.status(201).json({ success: true, data: chat });
  },
};
