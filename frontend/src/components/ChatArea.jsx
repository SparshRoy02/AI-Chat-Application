import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import MessageBubble from './MessageBubble';
import { Send, Square, PanelLeftOpen, Cpu, Sparkles, MessageSquare, Terminal } from 'lucide-react';

const ChatArea = () => {
  const {
    messages,
    streamingContent,
    isGenerating,
    isSidebarOpen,
    sendMessage,
    stopGeneration,
    toggleSidebar,
  } = useChat();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // Auto-resize textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    sendMessage(input);
    setInput('');
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCardClick = (prompt) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const showWelcome = messages.length === 0 && !streamingContent;

  return (
    <div className="chat-main">
      {/* Sidebar toggle button (visible if sidebar is closed) */}
      {!isSidebarOpen && (
        <button className="menu-toggle-btn" onClick={toggleSidebar} title="Open Sidebar">
          <PanelLeftOpen size={18} />
        </button>
      )}

      {showWelcome ? (
        <div className="welcome-container">
          <div className="welcome-logo">⚡</div>
          <h1 className="welcome-title">How can I help you today?</h1>
          <p className="welcome-subtitle">
            I am Antigravity AI, a local chat client connected to Ollama running Llama 3. Let's write code, debug, or brainstorm ideas.
          </p>

          <div className="welcome-cards">
            <div
              className="welcome-card"
              onClick={() => handleCardClick('Write a clean JavaScript function to deep clone an object.')}
            >
              <Terminal className="welcome-card-icon" size={20} />
              <div className="welcome-card-title">Write Code</div>
              <div className="welcome-card-desc">Deep clone helper in JS</div>
            </div>

            <div
              className="welcome-card"
              onClick={() => handleCardClick('Explain the difference between SQL and NoSQL databases with examples.')}
            >
              <MessageSquare className="welcome-card-icon" size={20} />
              <div className="welcome-card-title">Explain Concepts</div>
              <div className="welcome-card-desc">SQL vs NoSQL breakdown</div>
            </div>

            <div
              className="welcome-card"
              onClick={() => handleCardClick('Suggest 3 creative ways to style a modern glassmorphic card.')}
            >
              <Sparkles className="welcome-card-icon" size={20} />
              <div className="welcome-card-title">Design Ideas</div>
              <div className="welcome-card-desc">Glassmorphic CSS styles</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="messages-container">
          {messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} />
          ))}

          {/* SSE Streaming assistant response bubble */}
          {streamingContent && (
            <MessageBubble
              message={{
                role: 'assistant',
                content: streamingContent,
              }}
            />
          )}

          {/* Preparing stream loading indicator */}
          {isGenerating && !streamingContent && (
            <div className="message-wrapper assistant">
              <div className="avatar assistant">
                <Cpu size={20} color="white" />
              </div>
              <div className="message-bubble">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input area */}
      <div className="input-container">
        <div className="input-form-wrapper">
          <form className="input-form" onSubmit={handleSubmit}>
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              placeholder="Ask Antigravity anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <div className="controls-wrapper">
              {isGenerating ? (
                <button
                  type="button"
                  className="chat-btn stop"
                  onClick={stopGeneration}
                  title="Stop generating"
                >
                  <Square size={16} fill="currentColor" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="chat-btn send"
                  disabled={!input.trim()}
                  title="Send message"
                >
                  <Send size={16} />
                </button>
              )}
            </div>
          </form>
          <div className="input-footer-text">
            Antigravity is powered by a local Llama 3 instance. Answers are generated on your local machine.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;
