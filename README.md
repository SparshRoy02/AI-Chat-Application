# AI Chat Application

A complete, end-to-end full-stack AI chat application built with React (Vite) and Node.js (Express). It interacts directly with locally hosted Ollama Llama 3 models and provides real-time streaming text generation. 

## 🚀 Features
- **Real-Time Streaming**: Stream responses directly from the local Ollama LLM in real-time, just like ChatGPT.
- **Session Management**: Chat histories are saved persistently as separate "Sessions" in a MongoDB database.
- **Modern UI**: A responsive, beautifully designed chat interface utilizing React, Vite, and Lucide React icons.
- **Contextual Awareness**: Maintains the chat context by sending the message history along with new queries to the model.

## 🏗️ Architecture & Tech Stack

### Frontend
The frontend is a Single Page Application (SPA) built for performance and simplicity.
- **Framework**: React 18 with Vite for ultra-fast HMR and building.
- **State Management**: React Context API (`ChatContext`) is used to handle global state such as active sessions, streaming status, and message history.
- **Styling**: Modern, responsive CSS (`index.css`) with components like `ChatArea`, `ChatSidebar`, and `MessageBubble`.
- **Icons**: `lucide-react`.

### Backend
The backend serves as a middleware REST API between the frontend and the Ollama service, as well as managing the database.
- **Framework**: Node.js with Express.js.
- **Database**: MongoDB using Mongoose ORM (`Message` and `Session` models).
- **CORS**: Configured to allow requests from the Vite dev server.
- **Environment Management**: `dotenv` for configuration.

### API Endpoints
The backend exposes the following main endpoints under `/api`:
- `GET /api/sessions`: Retrieve all saved chat sessions.
- `POST /api/sessions`: Create a new chat session.
- `GET /api/sessions/:sessionId/messages`: Load all messages for a given session.
- `DELETE /api/sessions/:sessionId`: Delete a specific chat session.
- `POST /api/completions/stream`: Send a message to the Ollama model and return a streamed response.

### AI Model layer
- **Ollama**: Runs locally to host and execute large language models securely without external API costs. 

---

## 🛠️ Detailed Step-by-Step Setup Guide

Follow these steps precisely to get the application running on your local machine.

### Step 1: Install System Prerequisites
Before you begin, ensure you have the following software installed on your system:
1. **Node.js**: Download and install the latest LTS version from [nodejs.org](https://nodejs.org/).
2. **MongoDB**: Download and install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community).
3. **Ollama**: Download and install Ollama from [ollama.com](https://ollama.com/).

### Step 2: Start MongoDB
Ensure your MongoDB service is actively running on your machine.
- **Windows**: The MongoDB service usually runs automatically in the background. You can verify it via `services.msc`.
- **macOS/Linux**: You can typically start it using a command like `brew services start mongodb-community` (macOS) or `sudo systemctl start mongod` (Linux).
- Alternatively, you can use a cloud database like MongoDB Atlas and get the connection string.

### Step 3: Setup Ollama & Download Llama 3
You need to pull the Llama 3 AI model into your local Ollama instance.
1. Open your terminal or command prompt.
2. Run the following command to download and start Llama 3:
   ```bash
   ollama run llama3
   ```
3. Keep Ollama running in the background. Once the model is downloaded, you can type `/bye` to exit the chat prompt, but the service will remain running locally on port `11434`.

### Step 4: Open the Project
Open the root directory of the AI Chat App project (`AI Chat App`) in your code editor of choice (e.g., VS Code).

### Step 5: Configure the Backend Environment
You must configure the backend so it knows how to connect to the database.
1. Navigate into the `backend` folder.
2. Create a new file named exactly `.env`.
3. Add the following lines into the `.env` file and save it:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/ai-chat-app
   ```
   *(Note: If you are using MongoDB Atlas, replace the MONGODB_URI with your Atlas connection string).*

### Step 6: Install Backend Dependencies & Start Server
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install all required Node.js packages:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm run dev
   ```
4. You should see a success message in your terminal indicating the server is running on port 5000 and has successfully connected to MongoDB. **Leave this terminal open and running.**

### Step 7: Install Frontend Dependencies & Start Server
1. Open a **new, separate terminal window** (do not close the backend terminal).
2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
3. Install all required React packages:
   ```bash
   npm install
   ```
4. Start the frontend Vite server:
   ```bash
   npm run dev
   ```
5. You should see a message indicating the frontend server is running, typically on port `5173`. **Leave this terminal open and running.**

### Step 8: Access the Application
1. Open your web browser (Chrome, Firefox, Safari, Edge, etc.).
2. Navigate to the URL shown in your frontend terminal, usually:
   ```text
   http://localhost:5173
   ```
3. You should now see the AI Chat Application UI and can begin chatting with Llama 3!

---

## 📝 License
This project is open-source and available under the MIT License.