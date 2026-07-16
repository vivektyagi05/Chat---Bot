import { z } from "zod";

export const createChatSchema = z.object({
  title: z.string().max(200).optional(),
  aiModel: z.string().optional(),
  systemPrompt: z.string().max(4000).optional(),
});

export const renameChatSchema = z.object({ title: z.string().min(1).max(200) });

export const pinChatSchema = z.object({ isPinned: z.boolean() });

export const archiveChatSchema = z.object({ isArchived: z.boolean() });

export const importChatSchema = z.object({
  title: z.string().max(200).optional(),
  aiModel: z.string().optional(),
  systemPrompt: z.string().max(4000).optional(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().min(1),
    })
  ),
});
