import { ChatRepository } from "../repositories/chat.repository.js";
import { MessageRepository } from "../repositories/message.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { Types } from "mongoose";

export const ChatService = {
  async createChat(userId: string, opts: { title?: string; aiModel?: string; systemPrompt?: string } = {}) {
    return ChatRepository.create(new Types.ObjectId(userId), opts);
  },

  async listChats(userId: string, search?: string, archived?: boolean) {
    return ChatRepository.listForUser(userId, { search, archived });
  },

  async getChat(chatId: string, userId: string) {
    const chat = await ChatRepository.findByIdForUser(chatId, userId);
    if (!chat) throw ApiError.notFound("Chat not found");
    return chat;
  },

  async getChatWithMessages(chatId: string, userId: string) {
    const chat = await this.getChat(chatId, userId);
    const messages = await MessageRepository.listForChat(chat._id);
    return { chat, messages };
  },

  async renameChat(chatId: string, userId: string, title: string) {
    const chat = await ChatRepository.rename(chatId, userId, title);
    if (!chat) throw ApiError.notFound("Chat not found");
    return chat;
  },

  async pinChat(chatId: string, userId: string, isPinned: boolean) {
    const chat = await ChatRepository.setPinned(chatId, userId, isPinned);
    if (!chat) throw ApiError.notFound("Chat not found");
    return chat;
  },

  async archiveChat(chatId: string, userId: string, isArchived: boolean) {
    const chat = await ChatRepository.setArchived(chatId, userId, isArchived);
    if (!chat) throw ApiError.notFound("Chat not found");
    return chat;
  },

  async deleteChat(chatId: string, userId: string) {
    await this.getChat(chatId, userId);
    await MessageRepository.deleteAllForChat(chatId);
    await ChatRepository.delete(chatId, userId);
  },

  async exportChat(chatId: string, userId: string) {
    const { chat, messages } = await this.getChatWithMessages(chatId, userId);
    return {
      title: chat.title,
      aiModel: chat.aiModel,
      systemPrompt: chat.systemPrompt,
      createdAt: chat.createdAt,
      messages: messages.map((m) => ({ role: m.role, content: m.content, createdAt: m.createdAt })),
    };
  },

  async importChat(userId: string, data: { title?: string; aiModel?: string; systemPrompt?: string; messages: { role: "user" | "assistant" | "system"; content: string }[] }) {
    const chat = await ChatRepository.create(new Types.ObjectId(userId), {
      title: data.title ?? "Imported Chat",
      aiModel: data.aiModel,
      systemPrompt: data.systemPrompt,
    });
    for (const m of data.messages) {
      await MessageRepository.create({ chat: chat._id, user: new Types.ObjectId(userId), role: m.role, content: m.content });
    }
    return chat;
  },
};
