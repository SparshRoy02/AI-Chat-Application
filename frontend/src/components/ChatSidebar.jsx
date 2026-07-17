import React from 'react';
import { useChat } from '../context/ChatContext';
import { MessageSquare, Plus, Trash2, Cpu, PanelLeftClose } from 'lucide-react';

const ChatSidebar = () => {
  const {
    sessions,
    currentSession,
    isSidebarOpen,
    startNewChat,
    deleteSession,
    selectSession,
    toggleSidebar,
  } = useChat();

  if (!isSidebarOpen) return null;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand">
          <Cpu size={22} className="brand-icon" />
          <span>Antigravity AI</span>
        </div>
        <button className="delete-btn" style={{ opacity: 1 }} onClick={toggleSidebar} title="Close Sidebar">
          <PanelLeftClose size={18} />
        </button>
      </div>

      <button className="new-chat-btn" onClick={startNewChat}>
        <Plus size={18} />
        <span>New Chat</span>
      </button>

      <div className="history-list">
        {sessions.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No chat history
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = currentSession && currentSession._id === session._id;
            return (
              <div
                key={session._id}
                className={`history-item ${isActive ? 'active' : ''}`}
                onClick={() => selectSession(session)}
              >
                <div className="history-title-wrapper">
                  <MessageSquare size={16} style={{ flexShrink: 0 }} />
                  <span className="history-title">{session.title}</span>
                </div>
                <button
                  className="delete-btn"
                  onClick={(e) => deleteSession(session._id, e)}
                  title="Delete Chat"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="sidebar-footer">
        <Cpu size={16} />
        <span>Model: Llama 3 (Ollama)</span>
      </div>
    </aside>
  );
};

export default ChatSidebar;
