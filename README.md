# 🤖 AI Chat Application

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-Llama3-FF6F00?style=for-the-badge&logo=meta&logoColor=white)

**A privacy-first, full-stack AI chat application powered by locally hosted Llama 3 via Ollama — zero cloud API costs, no telemetry, and complete data privacy.**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture & Tech Stack](#️-architecture--tech-stack)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Setup Guide](#️-detailed-step-by-step-setup-guide)
- [Conclusion](#-conclusion)

---

## 🌟 Overview

The **AI Chat Application** is a complete full-stack web application that brings local Large Language Model (LLM) inference directly to your machine. Built with a modern React + Vite frontend and a Node.js + Express backend, it interfaces seamlessly with [Ollama](https://ollama.com/) to run **Llama 3** locally.

It delivers real-time, token-by-token streaming AI responses in a sleek, responsive dark-mode interface—offering a completely self-hosted alternative to ChatGPT with complete privacy.

---

## 🚀 Features

| Feature | Description |
|---|---|
| 🔴 **Real-Time Streaming** | AI responses stream token-by-token via **Server-Sent Events (SSE)** in real-time |
| 💾 **Persistent Sessions** | Full chat histories saved persistently in **MongoDB** organized as separate sessions |
| 🧠 **Contextual Awareness** | Multi-turn conversation context preserved across requests |
| 🎨 **Modern UI** | Sleek dark-mode interface built with React 18 and Lucide icons |
| 🔒 **100% Local & Private** | Powered by Ollama — your prompts and messages never leave your machine |
| ✏️ **Auto Session Titling** | Sessions are dynamically titled based on the initial query |
| ❌ **Session Management** | Create, switch, and delete chat sessions effortlessly |
| ⚡ **Fast Developer Experience** | Vite HMR for instant frontend reloading and Nodemon backend reload |

---

## 🏗️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (User)                       │
│         React 18 + Vite  |  ChatContext (State)          │
│   ChatSidebar  |  ChatArea  |  MessageBubble             │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP / SSE
┌──────────────────────▼──────────────────────────────────┐
│               Node.js + Express Backend                  │
│    REST API  |  SSE Streaming  |  Mongoose ORM           │
│         Session Model  |  Message Model                  │
└──────┬───────────────────────────────┬───────────────────┘
       │                               │
┌──────▼──────┐               ┌────────▼────────┐
│   MongoDB   │               │  Ollama (Local) │
│  (Sessions  │               │   Llama 3 LLM   │
│  Messages)  │               │  Port 11434     │
└─────────────┘               └─────────────────┘
```

### Frontend
- **Framework**: React 18 with Vite 5 (ultra-fast build and HMR)
- **State Management**: React Context API (`ChatContext`)
- **Styling**: Vanilla CSS (`index.css`) with modern dark theme and custom scrollbars
- **Icons**: `lucide-react`
- **Components**: `ChatSidebar`, `ChatArea`, `MessageBubble`

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js v4
- **Database**: MongoDB with Mongoose v8
- **AI Integration**: Native `fetch` to Ollama's local REST API with SSE streaming
- **CORS & Environment**: `cors` and `dotenv`

### AI Model Layer
- **Ollama**: Hosts and runs the Llama 3 model locally on port `11434`.

---

## 📁 Project Structure

```
AI Chat App/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection
│   │   ├── controllers/
│   │   │   └── chatController.js  # Session CRUD + SSE stream logic
│   │   ├── models/
│   │   │   ├── Session.js         # Session schema
│   │   │   └── Message.js         # Message schema
│   │   ├── routes/
│   │   │   └── chatRoutes.js      # API route definitions
│   │   └── index.js               # Express app entry point
│   ├── .env                       # Environment config (PORT, MONGODB_URI)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── ChatArea.jsx        # Main chat window + SSE message handler
    │   │   ├── ChatSidebar.jsx     # Session list + controls
    │   │   └── MessageBubble.jsx   # Message renderer with markdown support
    │   ├── context/
    │   │   └── ChatContext.jsx     # Global state provider
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css              # Global dark-themed styles
    ├── index.html
    └── package.json
```

---

## 📡 API Reference

All backend endpoints are prefixed with `/api`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sessions` | Retrieve all chat sessions (sorted newest first) |
| `POST` | `/api/sessions` | Create a new chat session |
| `GET` | `/api/sessions/:sessionId/messages` | Load all messages for a specific session |
| `DELETE` | `/api/sessions/:sessionId` | Delete a session and its associated messages |
| `POST` | `/api/completions/stream` | Stream response from Ollama via Server-Sent Events (SSE) |

### Streaming Response Format (`POST /api/completions/stream`)

**Request Body:**
```json
{
  "sessionId": "664c1234567890abcdef1234",
  "content": "Explain asynchronous programming in JavaScript"
}
```

**SSE Event Stream:**
```
data: {"sessionId":"664c1234567890abcdef1234"}

data: {"content":"Asynchronous "}
data: {"content":"programming "}
data: {"content":"allows..."}
...
data: [DONE]
```

---

## 🛠️ Detailed Step-by-Step Setup Guide

Follow these steps to set up and run the application locally.

### Step 1: Install System Prerequisites
1. **Node.js** (v18 or higher): [nodejs.org](https://nodejs.org/)
2. **MongoDB Community Server**: [mongodb.com](https://www.mongodb.com/try/download/community)
3. **Ollama**: [ollama.com](https://ollama.com/)

### Step 2: Start MongoDB
Ensure MongoDB is running locally on your machine:
- **Windows**: Verify service via `services.msc` or start MongoDB service.
- **macOS**: `brew services start mongodb-community`
- **Linux**: `sudo systemctl start mongod`

### Step 3: Setup Ollama & Download Llama 3
Download and run the Llama 3 model locally:
```bash
ollama run llama3
```
*Once downloaded, you can exit the terminal prompt using `/bye`; Ollama will continue running in the background on port `11434`.*

### Step 4: Configure Backend Environment
1. Navigate to the `backend` folder.
2. Create a `.env` file with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/ai-chat-app
   OLLAMA_API_URL=http://127.0.0.1:11434/api/chat
   ```

### Step 5: Install Dependencies & Run Application

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run dev
```
*(Server will start on `http://localhost:5000`)*

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```
*(Frontend will start on `http://localhost:5173`)*

### Step 6: Access the Application
Open your browser and navigate to:
```
http://localhost:5173
```

---

## 🐳 Docker Deployment (One-Command Setup)

You can run the entire application stack (Frontend, Backend, MongoDB, and Ollama) with a single command using Docker Compose.

### 1. Prerequisites
Ensure you have **Docker** and **Docker Compose** installed:
- [Docker Desktop for Windows / Mac / Linux](https://www.docker.com/products/docker-desktop/)

### 2. Start All Services
From the project root directory, run:
```bash
docker compose up -d --build
```

This starts:
| Container Name | Service | Exposed Port |
|---|---|---|
| `ai-chat-frontend` | React SPA + NGINX | `http://localhost:3000` |
| `ai-chat-backend` | Express.js API | `http://localhost:5000` |
| `ai-chat-mongodb` | MongoDB 7 | `localhost:27017` |
| `ai-chat-ollama` | Ollama AI Engine | `localhost:11434` |

### 3. Pull Llama 3 Model into Containerized Ollama
Once the containers are running, download the Llama 3 model into the Ollama container:
```bash
docker exec -it ai-chat-ollama ollama run llama3
```
*(After the model finishes downloading, press `Ctrl+D` or type `/bye` to exit the prompt — the Ollama container keeps serving requests).*

### 4. Open the App
Visit **`http://localhost:3000`** in your browser.

### 5. Stopping the Stack
```bash
docker compose down
```
*(To also remove stored database & Ollama volumes, use `docker compose down -v`)*

---

## 🏁 Conclusion

The **AI Chat Application** demonstrates the seamless integration of modern web technologies with on-device LLM inference. It provides a robust, self-hosted blueprint for building responsive AI interfaces without compromising data privacy or incurring recurring API costs.

### What This Project Accomplishes
- **Seamless Local AI Integration**: Interfaces directly with Ollama to run Llama 3 locally, demonstrating that sophisticated AI applications can operate completely offline and free of third-party API fees.
- **Low-Latency Streaming**: Implements real-time Server-Sent Events (SSE) for token-by-token streaming, providing a smooth user experience akin to industry-standard AI platforms.
- **Persistent Data Management**: Employs MongoDB and Mongoose to maintain stateful conversations, automatic title generation, and structured session organization.
- **Modern Full-Stack Architecture**: Combines a modular React 18 frontend (Vite, Context API) with a clean Express.js backend architecture.

### Key Learnings & Takeaways
- **Event-Driven Streaming**: Server-Sent Events (SSE) offer an efficient, unidirectional communication model for streaming text compared to standard polling or complex WebSocket setups.
- **Context Preservation**: Forwarding historical chat context ensures conversational continuity across turns while maintaining scalable session storage.
- **Extensibility**: The decoupled backend design makes it simple to swap AI models (e.g., Mistral, Gemma, CodeLlama) by adjusting the configuration without rewriting frontend components.

### Future Roadmap
- 🔐 **User Authentication**: Add JWT/OAuth authentication for multi-user support.
- 📎 **Multimodal Support**: Support image inputs and document attachments.
- ⚙️ **Model Selection**: Switch between installed Ollama models dynamically from the frontend UI.
- 💾 **Export Chats**: Export chat histories to Markdown, PDF, or JSON.

---
