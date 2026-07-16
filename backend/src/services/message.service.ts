import { Types } from "mongoose";
import { MessageRepository } from "../repositories/message.repository.js";
import { ChatRepository } from "../repositories/chat.repository.js";
import { ChatService } from "./chat.service.js";
import { getAIProvider, ChatHistoryItem } from "./gemini.service.js";
import { ApiError } from "../utils/ApiError.js";
import { IMessage } from "../models/message.model.js";

/**
 * Registry of in-flight generations so the client can request a stop.
 * Keyed by chatId. Each entry holds a mutable "stopped" flag that the
 * streaming loop checks between tokens.
 */
const activeGenerations = new Map<string, { stopped: boolean }>();

function historyFrom(messages: IMessage[]): ChatHistoryItem[] {
  return messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
}

export const MessageService = {
  stopGeneration(chatId: string) {
    const entry = activeGenerations.get(chatId);
    if (entry) entry.stopped = true;
  },

  async listMessages(chatId: string, userId: string) {
    await ChatService.getChat(chatId, userId);
    return MessageRepository.listForChat(chatId);
  },

  /**
   * Core streaming pipeline: persists the user message, builds context,
   * streams tokens through onToken, persists the assistant reply, and
   * auto-titles the chat on first exchange.
   */
  async sendMessage(params: {
    chatId: string;
    userId: string;
    content: string;
    onToken: (token: string) => void;
  }) {
    const { chatId, userId, content, onToken } = params;
    const chat = await ChatService.getChat(chatId, userId);
    const userObjectId = new Types.ObjectId(userId);

    await MessageRepository.create({ chat: chat._id, user: userObjectId, role: "user", content });

    const priorMessages = await MessageRepository.recentForContext(chat._id, 20);
    const history = historyFrom(priorMessages);

    const provider = getAIProvider();
    const genState = { stopped: false };
    activeGenerations.set(chatId, genState);

    let fullText = "";
    try {
      const result = await provider.streamChat({
        systemPrompt: chat.systemPrompt,
        history,
        message: content,
        modelName: chat.aiModel,
        onToken: (token) => {
          if (genState.stopped) return;
          fullText += token;
          onToken(token);
        },
        shouldStop: () => genState.stopped,
      });
      fullText = genState.stopped ? fullText : result.fullText;
    } finally {
      activeGenerations.delete(chatId);
    }

    const assistantMessage = await MessageRepository.create({
      chat: chat._id,
      user: userObjectId,
      role: "assistant",
      content: fullText,
      tokenCount: provider.estimateTokens(fullText),
    });

    await ChatRepository.touch(chat._id);

    const messageCount = await MessageRepository.listForChat(chat._id, 3);
    if (messageCount.length <= 2 && chat.title === "New Chat") {
      const title = await provider.generateTitle(content);
      await ChatRepository.rename(chat._id, userObjectId, title);
    }

    return assistantMessage;
  },

  async regenerate(params: { chatId: string; userId: string; messageId: string; onToken: (token: string) => void }) {
    const { chatId, userId, messageId, onToken } = params;
    const chat = await ChatService.getChat(chatId, userId);
    const target = await MessageRepository.findById(messageId);
    if (!target) throw ApiError.notFound("Message not found");
    if (target.role !== "assistant") throw ApiError.badRequest("Can only regenerate an assistant message");

    await MessageRepository.deleteById(messageId);

    const priorMessages = await MessageRepository.recentForContext(chat._id, 20);
    const lastUser = [...priorMessages].reverse().find((m) => m.role === "user");
    if (!lastUser) throw ApiError.badRequest("No prior user message to regenerate from");

    const history = historyFrom(priorMessages.filter((m) => m._id.toString() !== lastUser._id.toString()));

    const provider = getAIProvider();
    const genState = { stopped: false };
    activeGenerations.set(chatId, genState);

    let fullText = "";
    try {
      const result = await provider.streamChat({
        systemPrompt: chat.systemPrompt,
        history,
        message: lastUser.content,
        modelName: chat.aiModel,
        onToken: (token) => {
          if (genState.stopped) return;
          fullText += token;
          onToken(token);
        },
        shouldStop: () => genState.stopped,
      });
      fullText = genState.stopped ? fullText : result.fullText;
    } finally {
      activeGenerations.delete(chatId);
    }

    const assistantMessage = await MessageRepository.create({
      chat: chat._id,
      user: new Types.ObjectId(userId),
      role: "assistant",
      content: fullText,
      tokenCount: provider.estimateTokens(fullText),
    });

    await ChatRepository.touch(chat._id);
    return assistantMessage;
  },

  async editUserMessage(params: { chatId: string; userId: string; messageId: string; newContent: string; onToken: (token: string) => void }) {
    const { chatId, userId, messageId, newContent, onToken } = params;
    const chat = await ChatService.getChat(chatId, userId);
    const target = await MessageRepository.findById(messageId);
    if (!target) throw ApiError.notFound("Message not found");
    if (target.role !== "user") throw ApiError.badRequest("Can only edit a user message");

    await MessageRepository.updateContent(messageId, newContent);
    await MessageRepository.deleteAfter(chat._id, target.createdAt);

    const priorMessages = await MessageRepository.recentForContext(chat._id, 20);
    const history = historyFrom(priorMessages.filter((m) => m._id.toString() !== messageId));

    const provider = getAIProvider();
    const genState = { stopped: false };
    activeGenerations.set(chatId, genState);

    let fullText = "";
    try {
      const result = await provider.streamChat({
        systemPrompt: chat.systemPrompt,
        history,
        message: newContent,
        modelName: chat.aiModel,
        onToken: (token) => {
          if (genState.stopped) return;
          fullText += token;
          onToken(token);
        },
        shouldStop: () => genState.stopped,
      });
      fullText = genState.stopped ? fullText : result.fullText;
    } finally {
      activeGenerations.delete(chatId);
    }

    const assistantMessage = await MessageRepository.create({
      chat: chat._id,
      user: new Types.ObjectId(userId),
      role: "assistant",
      content: fullText,
      tokenCount: provider.estimateTokens(fullText),
    });

    await ChatRepository.touch(chat._id);
    return assistantMessage;
  },
};
