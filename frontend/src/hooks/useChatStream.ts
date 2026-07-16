import { useCallback, useRef, useState } from "react";
import { API_URL, getAccessToken } from "../services/api";
import type { ChatMessage } from "../types";

interface SSEHandlers {
  onToken: (token: string) => void;
  onDone: (message: ChatMessage) => void;
  onError: (message: string) => void;
}

async function consumeSSE(response: Response, handlers: SSEHandlers) {
  if (!response.body) {
    handlers.onError("No response stream");
    return;
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const rawEvent of events) {
      if (!rawEvent.trim() || rawEvent.startsWith(":")) continue;
      const lines = rawEvent.split("\n");
      let eventName = "message";
      let data = "";
      for (const line of lines) {
        if (line.startsWith("event:")) eventName = line.slice(6).trim();
        if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!data) continue;
      try {
        const parsed = JSON.parse(data);
        if (eventName === "token") handlers.onToken(parsed.token);
        else if (eventName === "done") handlers.onDone(parsed.message);
        else if (eventName === "error") handlers.onError(parsed.message);
      } catch {
        // ignore malformed chunk
      }
    }
  }
}

export function useChatStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const run = useCallback(
    async (url: string, body: Record<string, unknown> | undefined, onDone: (message: ChatMessage) => void, onError: (message: string) => void) => {
      setIsStreaming(true);
      setStreamingText("");
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(`${API_URL}${url}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getAccessToken() ?? ""}`,
          },
          credentials: "include",
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        if (!res.ok) {
          onError(`Request failed (${res.status})`);
          setIsStreaming(false);
          return;
        }

        await consumeSSE(res, {
          onToken: (token) => setStreamingText((prev) => prev + token),
          onDone: (message) => {
            onDone(message);
            setIsStreaming(false);
          },
          onError: (message) => {
            onError(message);
            setIsStreaming(false);
          },
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          onError("Connection lost");
        }
        setIsStreaming(false);
      }
    },
    []
  );

  const sendMessage = useCallback(
    (chatId: string, content: string, onDone: (m: ChatMessage) => void, onError: (m: string) => void) =>
      run(`/chats/${chatId}/messages`, { content }, onDone, onError),
    [run]
  );

  const regenerate = useCallback(
    (chatId: string, messageId: string, onDone: (m: ChatMessage) => void, onError: (m: string) => void) =>
      run(`/chats/${chatId}/messages/${messageId}/regenerate`, undefined, onDone, onError),
    [run]
  );

  const editAndResend = useCallback(
    (chatId: string, messageId: string, content: string, onDone: (m: ChatMessage) => void, onError: (m: string) => void) =>
      run(`/chats/${chatId}/messages/${messageId}/edit`, { content }, onDone, onError),
    [run]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
  }, []);

  return { isStreaming, streamingText, sendMessage, regenerate, editAndResend, stop };
}
