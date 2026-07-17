import Session from '../models/Session.js';
import Message from '../models/Message.js';

// Create a new session
export const createSession = async (req, res) => {
  try {
    const session = await Session.create({});
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all sessions
export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find().sort({ updatedAt: -1 });
    res.status(200).json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get messages for a session
export const getMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete session and its messages
export const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    await Session.findByIdAndDelete(sessionId);
    await Message.deleteMany({ sessionId });
    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Stream chat completion
export const streamChatCompletion = async (req, res) => {
  const { sessionId, content } = req.body;

  if (!content) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  let activeSessionId = sessionId;

  try {
    // 1. If no session exists, create one
    if (!activeSessionId) {
      const session = await Session.create({
        title: content.length > 30 ? `${content.substring(0, 30)}...` : content,
      });
      activeSessionId = session._id.toString();
    }

    // 2. Save user message to database
    await Message.create({
      sessionId: activeSessionId,
      role: 'user',
      content,
    });

    // If it's an existing session and it still has default title, update it
    const currentSession = await Session.findById(activeSessionId);
    if (currentSession && currentSession.title === 'New Chat') {
      currentSession.title = content.length > 30 ? `${content.substring(0, 30)}...` : content;
      await currentSession.save();
    }

    // 3. Fetch entire chat history for context
    const previousMessages = await Message.find({ sessionId: activeSessionId }).sort({ createdAt: 1 });

    // Format messages for Ollama API
    const ollamaMessages = previousMessages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add a system prompt if not present
    ollamaMessages.unshift({
      role: 'system',
      content: 'You are a helpful, advanced AI assistant named Antigravity. Format code blocks using appropriate markdown syntax. Provide detailed and well-structured answers.',
    });

    // 4. Initialize SSE Connection
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Send the active sessionId first so the frontend knows it
    res.write(`data: ${JSON.stringify({ sessionId: activeSessionId })}\n\n`);

    // 5. Query Ollama API
    const ollamaUrl = process.env.OLLAMA_API_URL || 'http://127.0.0.1:11434/api/chat';
    
    let response;
    try {
      response = await fetch(ollamaUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          messages: ollamaMessages,
          stream: true,
        }),
      });
    } catch (ollamaErr) {
      res.write(`data: ${JSON.stringify({ error: 'Failed to connect to local Ollama. Please make sure Ollama is running (`ollama run llama3`).' })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    if (!response.ok) {
      const errorText = await response.text();
      res.write(`data: ${JSON.stringify({ error: `Ollama error: ${errorText}` })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantResponse = '';
    let isClientConnected = true;

    req.on('close', () => {
      isClientConnected = false;
      reader.cancel(); // Abort reading from Ollama
    });

    let buffer = '';

    while (isClientConnected) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Save the last line as it might be incomplete
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          const chunkContent = parsed.message?.content || '';
          assistantResponse += chunkContent;

          res.write(`data: ${JSON.stringify({ content: chunkContent })}\n\n`);

          if (parsed.done) {
            break;
          }
        } catch (err) {
          console.error('Error parsing Ollama response line:', err, line);
        }
      }
    }

    // Save the assistant's complete response to database if connection wasn't closed before response
    if (assistantResponse.trim()) {
      await Message.create({
        sessionId: activeSessionId,
        role: 'assistant',
        content: assistantResponse,
      });

      // Update session's updatedAt timestamp
      await Session.findByIdAndUpdate(activeSessionId, { updatedAt: new Date() });
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error in streamChatCompletion:', error);
    try {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (e) {
      // Headers might have already been sent, so try to send JSON
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  }
};
