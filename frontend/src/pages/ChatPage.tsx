import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowDown, Sparkles } from "lucide-react";
import Sidebar from "../components/Sidebar";
import ChatInput from "../components/ChatInput";
import MessageBubble from "../components/MessageBubble";
import MarkdownRenderer from "../components/MarkdownRenderer";
import { ChatService } from "../services/chat.service";
import { useChatStream } from "../hooks/useChatStream";
import type { Chat, ChatMessage } from "../types";

const SUGGESTIONS = [
  "Explain quantum computing simply",
  "Write a Python function to reverse a linked list",
  "Draft a professional email asking for a deadline extension",
  "Summarize the plot of a good sci-fi book idea",
];

export default function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const importInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { isStreaming, streamingText, sendMessage, regenerate, editAndResend, stop } = useChatStream();

  const loadChats = useCallback(async () => {
    const list = await ChatService.list(search || undefined);
    setChats(list);
  }, [search]);

  useEffect(() => { loadChats(); }, [loadChats]);

  useEffect(() => {
    if (!chatId) { setMessages([]); return; }
    setLoadingChat(true);
    ChatService.get(chatId)
      .then(({ messages }) => setMessages(messages))
      .finally(() => setLoadingChat(false));
  }, [chatId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, streamingText]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setShowScrollBtn(!nearBottom);
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  };

  const handleNewChat = async () => {
    const chat = await ChatService.create();
    setChats((prev) => [chat, ...prev]);
    navigate(`/chat/${chat._id}`);
  };

  const ensureChat = async (): Promise<string> => {
    if (chatId) return chatId;
    const chat = await ChatService.create();
    setChats((prev) => [chat, ...prev]);
    navigate(`/chat/${chat._id}`, { replace: true });
    return chat._id;
  };

  const handleSend = async (content: string) => {
    const id = await ensureChat();
    const optimisticUser: ChatMessage = {
      _id: `temp-${Date.now()}`,
      chat: id,
      user: "me",
      role: "user",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUser]);

    sendMessage(
      id,
      content,
      (assistantMessage) => {
        setMessages((prev) => [...prev, assistantMessage]);
        loadChats();
      },
      (err) => {
        setMessages((prev) => [
          ...prev,
          { _id: `err-${Date.now()}`, chat: id, user: "system", role: "assistant", content: err, isError: true, createdAt: new Date().toISOString() },
        ]);
      }
    );
  };

  const handleRegenerate = () => {
    if (!chatId) return;
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return;
    setMessages((prev) => prev.filter((m) => m._id !== lastAssistant._id));
    regenerate(
      chatId,
      lastAssistant._id,
      (assistantMessage) => setMessages((prev) => [...prev, assistantMessage]),
      (err) => setMessages((prev) => [...prev, { ...lastAssistant, content: err, isError: true }])
    );
  };

  const handleEdit = (messageId: string, newContent: string) => {
    if (!chatId) return;
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m._id === messageId);
      if (idx === -1) return prev;
      const updated = [...prev.slice(0, idx)];
      updated.push({ ...prev[idx], content: newContent });
      return updated;
    });
    editAndResend(
      chatId,
      messageId,
      newContent,
      (assistantMessage) => setMessages((prev) => [...prev, assistantMessage]),
      (err) => setMessages((prev) => [...prev, { _id: `err-${Date.now()}`, chat: chatId, user: "system", role: "assistant", content: err, isError: true, createdAt: new Date().toISOString() }])
    );
  };

  const handleStop = async () => {
    stop();
    if (chatId) await ChatService.stopGeneration(chatId);
  };

  const handleRename = async (id: string, title: string) => {
    const updated = await ChatService.rename(id, title);
    setChats((prev) => prev.map((c) => (c._id === id ? updated : c)));
  };

  const handlePin = async (id: string, isPinned: boolean) => {
    const updated = await ChatService.pin(id, isPinned);
    setChats((prev) => prev.map((c) => (c._id === id ? updated : c)));
  };

  const handleDelete = async (id: string) => {
    await ChatService.remove(id);
    setChats((prev) => prev.filter((c) => c._id !== id));
    if (chatId === id) navigate("/");
  };

  const handleExport = async (id: string) => {
    const blob = await ChatService.exportChat(id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-${id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = async (file: File) => {
    const text = await file.text();
    const data = JSON.parse(text);
    const chat = await ChatService.importChat(data);
    setChats((prev) => [chat, ...prev]);
    navigate(`/chat/${chat._id}`);
  };

  const activeChat = chats.find((c) => c._id === chatId);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white dark:bg-neutral-950">
      <Sidebar
        chats={chats}
        activeChat={chatId ?? null}
        search={search}
        onSearch={setSearch}
        onSelect={(id) => navigate(`/chat/${id}`)}
        onNewChat={handleNewChat}
        onRename={handleRename}
        onPin={handlePin}
        onDelete={handleDelete}
        onExport={handleExport}
        onImportClick={() => importInputRef.current?.click()}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
      />
      <input
        ref={importInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportFile(f); e.target.value = ""; }}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-6 py-3">
          <h2 className="truncate text-sm font-medium text-neutral-700 dark:text-neutral-200">
            {activeChat?.title ?? "New Chat"}
          </h2>
          <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 text-xs text-neutral-500">
            {activeChat?.aiModel ?? "gemini-3.5-flash"}
          </span>
        </header>

        <div ref={scrollRef} onScroll={handleScroll} className="relative flex-1 overflow-y-auto">
          {!chatId && messages.length === 0 && !loadingChat ? (
            <div className="flex h-full flex-col items-center justify-center px-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                <Sparkles size={26} />
              </div>
              <h1 className="mb-2 text-2xl font-semibold text-neutral-800 dark:text-neutral-100">How can I help you today?</h1>
              <p className="mb-8 text-sm text-neutral-400">Ask anything, brainstorm ideas, or get help with code.</p>
              <div className="grid w-full max-w-2xl grid-cols-1 sm:grid-cols-2 gap-3">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-3 text-left text-sm text-neutral-600 dark:text-neutral-300 hover:border-brand-400 hover:shadow-sm transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl pb-6">
              {messages.map((m, idx) => (
                <MessageBubble
                  key={m._id}
                  message={m}
                  isLast={idx === messages.length - 1}
                  onRegenerate={m.role === "assistant" && !m.isError && !m._id.startsWith("temp-") ? handleRegenerate : undefined}
                  onEdit={m.role === "user" ? (content) => handleEdit(m._id, content) : undefined}
                />
              ))}
              {isStreaming && (
                <div className="flex gap-3 px-4 py-5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                    <Sparkles size={16} />
                  </div>
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-neutral-100 dark:bg-neutral-800/70 px-4 py-3">
                    {streamingText ? (
                      <MarkdownRenderer content={streamingText} />
                    ) : (
                      <span className="inline-flex gap-1">
                        <span className="h-1.5 w-1.5 animate-blink rounded-full bg-neutral-400" style={{ animationDelay: "0ms" }} />
                        <span className="h-1.5 w-1.5 animate-blink rounded-full bg-neutral-400" style={{ animationDelay: "150ms" }} />
                        <span className="h-1.5 w-1.5 animate-blink rounded-full bg-neutral-400" style={{ animationDelay: "300ms" }} />
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {showScrollBtn && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-md hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <ArrowDown size={16} />
            </button>
          )}
        </div>

        <ChatInput onSend={handleSend} onStop={handleStop} isStreaming={isStreaming} />
      </div>
    </div>
  );
}
