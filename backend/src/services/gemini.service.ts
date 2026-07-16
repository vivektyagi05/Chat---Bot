import { GoogleGenAI, Content } from "@google/genai";
import { env } from "../config/env.js";
import { logger } from "../logger/logger.js";
import { ApiError } from "../utils/ApiError.js";

const client = new GoogleGenAI({ apiKey: env.gemini.apiKey });

export interface ChatHistoryItem {
  role: "user" | "assistant";
  content: string;
}

/**
 * AI Provider abstraction. Every provider (Gemini, OpenAI, Claude, etc.)
 * implements streamChat / generateTitle / estimateTokens with this same
 * signature, so swapping providers is a config change, not a rewrite.
 */
export interface AIProvider {
  streamChat(params: {
    systemPrompt?: string;
    history: ChatHistoryItem[];
    message: string;
    modelName?: string;
    temperature?: number;
    topP?: number;
    maxOutputTokens?: number;
    onToken: (token: string) => void;
    shouldStop?: () => boolean;
  }): Promise<{ fullText: string; tokenCount: number }>;

  generateTitle(firstMessage: string): Promise<string>;

  estimateTokens(text: string): number;
}

function toGeminiHistory(history: ChatHistoryItem[]): Content[] {
  return history.map((item) => ({
    role: item.role === "assistant" ? "model" : "user",
    parts: [{ text: item.content }],
  }));
}

export const GeminiProvider: AIProvider = {
  async streamChat({ systemPrompt, history, message, modelName, temperature, topP, maxOutputTokens, onToken, shouldStop }) {
    try {
      const chat = client.chats.create({
        model: modelName ?? env.gemini.model,
        history: toGeminiHistory(history),
        config: {
          systemInstruction: systemPrompt,
          temperature: temperature ?? 0.7,
          topP: topP ?? 0.95,
          maxOutputTokens: maxOutputTokens ?? 2048,
        },
      });

      const stream = await chat.sendMessageStream({ message });

      let fullText = "";
      let tokenCount = 0;
      for await (const chunk of stream) {
        if (shouldStop?.()) break;
        const text = chunk.text;
        if (text) {
          fullText += text;
          onToken(text);
        }
        if (chunk.usageMetadata?.totalTokenCount) {
          tokenCount = chunk.usageMetadata.totalTokenCount;
        }
      }

      return { fullText, tokenCount: tokenCount || this.estimateTokens(fullText) };
    } catch (err) {
      logger.error("Gemini streamChat failed", {
        error: err instanceof Error ? { message: err.message, stack: err.stack } : err,
        model: modelName ?? env.gemini.model,
      });
      throw ApiError.internal("AI provider request failed");
    }
  },

  async generateTitle(firstMessage: string): Promise<string> {
    try {
      const result = await client.models.generateContent({
        model: env.gemini.model,
        contents: `Generate a very short chat title (max 6 words, no quotes, no punctuation at the end) summarizing this message:\n\n"${firstMessage}"`,
      });
      const title = (result.text ?? "").trim().replace(/^["']|["']$/g, "");
      return title.slice(0, 80) || "New Chat";
    } catch (err) {
      logger.warn("Title generation failed, falling back", {
        error: err instanceof Error ? { message: err.message, stack: err.stack } : err,
      });
      return firstMessage.slice(0, 40) || "New Chat";
    }
  },

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  },
};

/**
 * Provider registry — the "one config file" that controls which AI
 * provider powers the app. Add new adapters here and flip ACTIVE_PROVIDER.
 */
const providers: Record<string, AIProvider> = {
  gemini: GeminiProvider,
};

const ACTIVE_PROVIDER = "gemini";

export function getAIProvider(): AIProvider {
  return providers[ACTIVE_PROVIDER];
}
