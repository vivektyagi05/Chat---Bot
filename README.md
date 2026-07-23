<div align="center">

# 🤖 Nova AI

### Production-Ready AI Assistant Platform powered by Google Gemini

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express"/>
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white"/>
  <img src="https://img.shields.io/badge/Google-Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white"/>
</p>

<p>
  <img src="https://img.shields.io/badge/Status-Active%20Development-success?style=flat-square"/>
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square"/>
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square"/>
</p>

</div>

---

## 📖 Overview

Nova AI is a modern full-stack AI assistant that combines **Google Gemini**, **React**, **TypeScript**, **Node.js**, and **MongoDB** to deliver secure, responsive, and intelligent conversations.

The project focuses on clean architecture, modular backend design, and production-oriented development. It includes secure authentication, streaming AI responses, persistent chat history, markdown rendering, and a responsive interface built for future extensibility.

---

## 📸 Application Preview

| Login | AI Chat |
|-------|---------|
| ![](docs/screenshots/login.png) | ![](docs/screenshots/chat.png) |

| Dark Mode | Mobile View |
|------------|-------------|
| ![](docs/screenshots/dark.png) | ![](docs/screenshots/mobile.png) |

> Replace these placeholders with real screenshots from your application.

---

## ✨ Features

### 🔐 Authentication
- User Registration & Login
- JWT Authentication
- Refresh Tokens
- Email Verification
- Password Reset

### 🤖 AI Assistant
- Google Gemini Integration
- Real-time Streaming (SSE)
- Regenerate Responses
- Edit & Resend
- Stop Generation

### 💬 Chat Management
- Create & Rename Chats
- Pin & Archive
- Delete Conversations
- Search Chats
- Export & Import

### 🎨 User Experience
- Responsive Design
- Dark / Light Theme
- Framer Motion Animations
- Markdown & Code Highlighting

### 🛡 Security
- Helmet
- Rate Limiting
- CORS Protection
- Zod Validation
- Secure Refresh Tokens

---

## 🏗 System Architecture

```text
                React + TypeScript
                        │
                        ▼
               Express REST API
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
     Google Gemini              MongoDB
```

---

## 🛠 Tech Stack

| Category | Technologies |
|----------|--------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, Refresh Tokens |
| AI | Google Gemini API |
| DevOps | Docker |

---

## 🚀 Getting Started

```bash
git clone <repository-url>

cd backend
cp .env.example .env
npm install
npm run dev

cd ../frontend
cp .env.example .env
npm install
npm run dev
```

Add your **Gemini API Key** and MongoDB connection string to the backend `.env` file before starting the application.

---

## 📁 Project Structure

```text
Nova-AI/
├── backend/
├── frontend/
├── docs/
├── docker-compose.yml
└── README.md
```

---

## 🚧 Roadmap

- [x] Secure Authentication
- [x] Streaming AI Responses
- [x] Chat Management
- [x] Markdown Support
- [x] Docker Support
- [ ] Multiple AI Providers
- [ ] Voice Conversations
- [ ] File Upload Support
- [ ] AI Agent Workflows

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome. Feel free to open an issue or submit a pull request.

---

## 📄 License

Licensed under the **MIT License**.
