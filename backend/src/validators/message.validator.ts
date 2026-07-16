import { z } from "zod";

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(20000),
});

export const editMessageSchema = z.object({
  content: z.string().min(1).max(20000),
});
