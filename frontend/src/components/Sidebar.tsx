import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import {
  Plus, Search, Pin, PinOff, Pencil, Trash2, Download, Upload,
  LogOut, Settings, PanelLeftClose, PanelLeft, Check, X,
} from "lucide-react";
import type { Chat } from "../types";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

interface Props {
  chats: Chat[];
  activeChat: string | null;
  search: string;
  onSearch: (v: string) => void;
  onSelect: (chatId: string) => void;
  onNewChat: () => void;
  onRename: (chatId: string, title: string) => void;
  onPin: (chatId: string, isPinned: boolean) => void;
  onDelete: (chatId: string) => void;
  onExport: (chatId: string) => void;
  onImportClick: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export default function Sidebar({
  chats, activeChat, search, onSearch, onSelect, onNewChat,
  onRename, onPin, onDelete, onExport, onImportClick,
  collapsed, onToggleCollapsed,
}: Props) {
  const { user, logout } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const pinned = chats.filter((c) => c.isPinned);
  const others = chats.filter((c) => !c.isPinned);

  const startEdit = (chat: Chat) => {
    setEditingId(chat._id);
    setEditValue(chat.title);
  };

  const commitEdit = () => {
    if (editingId && editValue.trim()) onRename(editingId, editValue.trim());
    setEditingId(null);
  };

  if (collapsed) {
    return (
      <div className="flex h-full w-14 flex-col items-center gap-3 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 py-3">
        <button onClick={onToggleCollapsed} className="rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800" title="Expand sidebar">
          <PanelLeft size={18} />
        </button>
        <button onClick={onNewChat} className="rounded-lg bg-brand-600 p-2 text-white hover:bg-brand-700" title="New chat">
          <Plus size={18} />
        </button>
      </div>
    );
  }

  const renderChat = (chat: Chat) => (
    <div
      key={chat._id}
      className={clsx(
        "group flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm cursor-pointer transition-colors",
        activeChat === chat._id
          ? "bg-brand-100 dark:bg-brand-900/40 text-brand-800 dark:text-brand-200"
          : "hover:bg-neutral-100 dark:hover:bg-neutral-800/70 text-neutral-700 dark:text-neutral-300"
      )}
      onClick={() => onSelect(chat._id)}
    >
      {editingId === chat._id ? (
        <div className="flex flex-1 items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <input
            autoFocus
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commitEdit()}
            className="w-full rounded-md border border-brand-400 bg-white dark:bg-neutral-900 px-2 py-1 text-xs outline-none"
          />
          <button onClick={commitEdit}><Check size={14} /></button>
          <button onClick={() => setEditingId(null)}><X size={14} /></button>
        </div>
      ) : (
        <>
          <span className="flex-1 truncate">{chat.title}</span>
          <div className="hidden shrink-0 items-center gap-1 group-hover:flex">
            <button onClick={(e) => { e.stopPropagation(); onPin(chat._id, !chat.isPinned); }} title={chat.isPinned ? "Unpin" : "Pin"}>
              {chat.isPinned ? <PinOff size={13} /> : <Pin size={13} />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); startEdit(chat); }} title="Rename"><Pencil size={13} /></button>
            <button onClick={(e) => { e.stopPropagation(); onExport(chat._id); }} title="Export"><Download size={13} /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(chat._id); }} title="Delete" className="text-red-400 hover:text-red-500">
              <Trash2 size={13} />
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="flex h-full w-72 flex-col border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
      <div className="flex items-center justify-between px-3 pt-3">
        <div className="flex items-center gap-2 px-1">
          <div className="h-6 w-6 rounded-md bg-gradient-to-br from-brand-500 to-brand-700" />
          <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Nova AI</span>
        </div>
        <button onClick={onToggleCollapsed} className="rounded-lg p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800" title="Collapse sidebar">
          <PanelLeftClose size={16} />
        </button>
      </div>

      <div className="px-3 pt-3">
        <button
          onClick={onNewChat}
          className="flex w-full items-center gap-2 rounded-xl bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          <Plus size={16} /> New Chat
        </button>
      </div>

      <div className="px-3 pt-3">
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-2.5 py-1.5">
          <Search size={14} className="text-neutral-400" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search chats"
            className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
          />
        </div>
      </div>

      <div className="mt-2 flex-1 space-y-4 overflow-y-auto px-3 pb-3">
        <AnimatePresence initial={false}>
          {pinned.length > 0 && (
            <div>
              <p className="px-1 pb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">Pinned</p>
              <div className="space-y-0.5">
                {pinned.map((c) => (
                  <motion.div key={c._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {renderChat(c)}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          <div>
            {others.length > 0 && <p className="px-1 pb-1 text-xs font-medium uppercase tracking-wide text-neutral-400">Chats</p>}
            <div className="space-y-0.5">
              {others.map((c) => (
                <motion.div key={c._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {renderChat(c)}
                </motion.div>
              ))}
            </div>
          </div>
        </AnimatePresence>
        {chats.length === 0 && (
          <p className="px-1 pt-4 text-center text-xs text-neutral-400">No chats yet. Start a new one!</p>
        )}
      </div>

      <div className="border-t border-neutral-200 dark:border-neutral-800 p-3">
        <button
          onClick={onImportClick}
          className="mb-2 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <Upload size={13} /> Import chat
        </button>
        <div className="flex items-center justify-between rounded-xl px-2 py-1.5">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="truncate">
              <p className="truncate text-sm font-medium text-neutral-800 dark:text-neutral-100">{user?.name}</p>
              <p className="truncate text-xs text-neutral-400">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button className="rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800" title="Settings">
              <Settings size={16} />
            </button>
            <button onClick={logout} className="rounded-lg p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800" title="Log out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
