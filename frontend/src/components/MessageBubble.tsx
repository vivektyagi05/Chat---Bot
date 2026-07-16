import { motion } from "framer-motion";
import { useState } from "react";
import { Bot, User, Copy, Check, RefreshCw, Pencil } from "lucide-react";
import clsx from "clsx";
import MarkdownRenderer from "./MarkdownRenderer";
import type { ChatMessage } from "../types";

interface Props {
  message: ChatMessage;
  isLast: boolean;
  onRegenerate?: () => void;
  onEdit?: (newContent: string) => void;
}

export default function MessageBubble({ message, isLast, onRegenerate, onEdit }: Props) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const submitEdit = () => {
    if (draft.trim() && draft !== message.content) onEdit?.(draft.trim());
    setIsEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={clsx("group flex w-full gap-3 px-4 py-5", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
          <Bot size={16} />
        </div>
      )}

      <div className={clsx("flex max-w-[85%] flex-col gap-1.5", isUser && "items-end")}>
        {isEditing ? (
          <div className="w-full min-w-[280px] rounded-2xl border border-brand-400 bg-white dark:bg-neutral-900 p-3">
            <textarea
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              className="w-full resize-none bg-transparent text-sm text-neutral-800 dark:text-neutral-100 outline-none"
            />
            <div className="mt-2 flex justify-end gap-2">
              <button onClick={() => setIsEditing(false)} className="rounded-md px-3 py-1 text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
                Cancel
              </button>
              <button onClick={submitEdit} className="rounded-md bg-brand-600 px-3 py-1 text-xs text-white hover:bg-brand-700">
                Save & Resend
              </button>
            </div>
          </div>
        ) : (
          <div
            className={clsx(
              "rounded-2xl px-4 py-3 text-sm sm:text-[15px]",
              isUser
                ? "bg-brand-600 text-white rounded-tr-sm"
                : "bg-neutral-100 dark:bg-neutral-800/70 text-neutral-800 dark:text-neutral-100 rounded-tl-sm",
              message.isError && "border border-red-400 text-red-500"
            )}
          >
            {isUser ? (
              <p className="whitespace-pre-wrap">{message.content}</p>
            ) : (
              <MarkdownRenderer content={message.content || "…"} />
            )}
          </div>
        )}

        <div className="flex items-center gap-2 px-1 text-xs text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100">
          <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          <button onClick={handleCopy} className="inline-flex items-center gap-1 hover:text-neutral-600 dark:hover:text-neutral-200">
            {copied ? <Check size={12} /> : <Copy size={12} />}
          </button>
          {isUser && onEdit && !isEditing && (
            <button onClick={() => setIsEditing(true)} className="inline-flex items-center gap-1 hover:text-neutral-600 dark:hover:text-neutral-200">
              <Pencil size={12} />
            </button>
          )}
          {!isUser && isLast && onRegenerate && (
            <button onClick={onRegenerate} className="inline-flex items-center gap-1 hover:text-neutral-600 dark:hover:text-neutral-200">
              <RefreshCw size={12} />
              Regenerate
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-200">
          <User size={16} />
        </div>
      )}
    </motion.div>
  );
}
