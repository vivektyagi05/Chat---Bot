import { api } from "./api";
import type { Chat, ChatMessage } from "../types";

export const ChatService = {
  async list(search?: string, archived?: boolean) {
    const res = await api.get("/chats", { params: { search, archived } });
    return res.data.data as Chat[];
  },

  async create(data: { title?: string; aiModel?: string; systemPrompt?: string } = {}) {
    const res = await api.post("/chats", data);
    return res.data.data as Chat;
  },

  async get(chatId: string) {
    const res = await api.get(`/chats/${chatId}`);
    return res.data.data as { chat: Chat; messages: ChatMessage[] };
  },

  async rename(chatId: string, title: string) {
    const res = await api.patch(`/chats/${chatId}/rename`, { title });
    return res.data.data as Chat;
  },

  async pin(chatId: string, isPinned: boolean) {
    const res = await api.patch(`/chats/${chatId}/pin`, { isPinned });
    return res.data.data as Chat;
  },

  async archive(chatId: string, isArchived: boolean) {
    const res = await api.patch(`/chats/${chatId}/archive`, { isArchived });
    return res.data.data as Chat;
  },

  async remove(chatId: string) {
    await api.delete(`/chats/${chatId}`);
  },

  async exportChat(chatId: string) {
    const res = await api.get(`/chats/${chatId}/export`, { responseType: "blob" });
    return res.data as Blob;
  },

  async importChat(data: { title?: string; messages: { role: string; content: string }[] }) {
    const res = await api.post("/chats/import", data);
    return res.data.data as Chat;
  },

  async stopGeneration(chatId: string) {
    await api.post(`/chats/${chatId}/messages/stop`);
  },
};
