export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isEmailVerified: boolean;
}

export interface Chat {
  _id: string;
  user: string;
  title: string;
  aiModel: string;
  systemPrompt?: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  _id: string;
  chat: string;
  user: string;
  role: MessageRole;
  content: string;
  tokenCount?: number;
  isError?: boolean;
  createdAt: string;
}
