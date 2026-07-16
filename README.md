# Nova AI — Full Stack Gemini Chatbot

A production-ready AI chatbot built with React + TypeScript + Vite + Tailwind on the
frontend, and Node.js + Express + MongoDB + Google Gemini API on the backend.

## Features implemented

- JWT auth: register, login, refresh, logout, forgot/reset password, email verification
- Real-time streaming AI responses via Server-Sent Events (SSE)
- Full chat management: create, rename, pin, archive, delete, search, export, import
- Message actions: copy, regenerate, edit-and-resend, stop generation
- Markdown rendering with GFM tables + syntax-highlighted code blocks
- Auto chat-title generation from the first message
- Dark mode / light mode with persisted preference
- Responsive, animated UI (Framer Motion), collapsible sidebar
- Rate limiting, Helmet, CORS allow-list, hashed refresh tokens, input validation (Zod)
- Swappable AI provider layer — Gemini is wired up; add OpenAI/Claude/etc. by
  implementing the `AIProvider` interface in `backend/src/services/gemini.service.ts`
  and registering it in the `providers` map there.

## Quick start (local, no Docker)

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI, JWT secrets, and GEMINI_API_KEY
npm install
npm run dev
```

Get a free Gemini API key at https://aistudio.google.com/app/apikey

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Visit http://localhost:5173 — register an account and start chatting.

## Quick start (Docker)

```bash
cd backend && cp .env.example .env   # fill in real secrets/API key
cd ..
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:5000/api/health

## Project structure

```
ai-chatbot/
├── backend/    Express + TS API (auth, chats, messages, Gemini streaming)
├── frontend/   React + TS + Vite + Tailwind chat UI
└── docker-compose.yml
```

## Notes

- Refresh tokens are httpOnly cookies (not accessible to JS); access tokens live in
  memory on the client and are silently refreshed on 401.
- `MailerService` currently logs verification/reset links to the console instead of
  sending real email — wire up a transport (nodemailer/SES/SendGrid) for production use.
- Both the backend (`npx tsc --noEmit`) and frontend (`npx tsc -b` + `vite build`)
  have been verified to compile cleanly in this environment.
