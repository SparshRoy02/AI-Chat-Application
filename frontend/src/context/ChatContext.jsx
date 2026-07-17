import React, { createContext, useState, useEffect, useContext, useRef } from 'react';

const ChatContext = createContext();

const API_BASE_URL = 'http://localhost:5000/api';

export const ChatProvider = ({ children }) => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const abortControllerRef = useRef(null);

  // Fetch all sessions
  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  };

  // Load messages for a session
  const loadSessionMessages = async (sessionId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Create new session
  const startNewChat = () => {
    setCurrentSession(null);
    setMessages([]);
    setStreamingContent('');
    setIsGenerating(false);
  };

  // Delete session
  const deleteSession = async (sessionId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchSessions();
        if (currentSession && currentSession._id === sessionId) {
          startNewChat();
        }
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  // Send message and handle SSE stream
  const sendMessage = async (content) => {
    if (!content.trim() || isGenerating) return;

    setIsGenerating(true);
    setStreamingContent('');

    // Setup abort controller
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    // Optimistically add user message to list
    const tempUserMsg = {
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    let activeSessionId = currentSession?._id;
    let accumulatedContent = '';

    try {
      const response = await fetch(`${API_BASE_URL}/completions/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSessionId,
          content,
        }),
        signal,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(dataStr);
              
              if (parsed.error) {
                setStreamingContent((prev) => prev + `\n\n*Error: ${parsed.error}*`);
                accumulatedContent += `\n\n*Error: ${parsed.error}*`;
              } else if (parsed.sessionId) {
                // If backend created a new session, update locally
                activeSessionId = parsed.sessionId;
                const newSessionObj = { _id: activeSessionId, title: content };
                setCurrentSession(newSessionObj);
                fetchSessions(); // Refresh list to include new session
              } else if (parsed.content) {
                setStreamingContent((prev) => prev + parsed.content);
                accumulatedContent += parsed.content;
              }
            } catch (err) {
              console.error('Error parsing JSON chunk:', err, line);
            }
          }
        }
      }

      // Generation done, save assistant message to local state
      if (accumulatedContent) {
        const tempAssistantMsg = {
          role: 'assistant',
          content: accumulatedContent,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempAssistantMsg]);
        setStreamingContent('');
        fetchSessions(); // Refresh list to update title
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Stream aborted by user');
        // Save whatever was accumulated so far
        if (accumulatedContent) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: accumulatedContent + '\n\n*Generation stopped by user.*',
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      } else {
        console.error('Error sending message:', error);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: '*Sorry, something went wrong. Make sure backend and Ollama services are running.*',
            createdAt: new Date().toISOString(),
          },
        ]);
      }
      setStreamingContent('');
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  // Stop current generation
  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Switch session
  const selectSession = async (session) => {
    setCurrentSession(session);
    setStreamingContent('');
    setIsGenerating(false);
    await loadSessionMessages(session._id);
  };

  // Toggle Sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Initial load
  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <ChatContext.Provider
      value={{
        sessions,
        currentSession,
        messages,
        streamingContent,
        isGenerating,
        isSidebarOpen,
        fetchSessions,
        startNewChat,
        deleteSession,
        sendMessage,
        stopGeneration,
        selectSession,
        toggleSidebar,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
