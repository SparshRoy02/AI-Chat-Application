import React from 'react';
import { ChatProvider } from './context/ChatContext';
import ChatSidebar from './components/ChatSidebar';
import ChatArea from './components/ChatArea';

function App() {
  return (
    <ChatProvider>
      <div className="app-container">
        <ChatSidebar />
        <ChatArea />
      </div>
    </ChatProvider>
  );
}

export default App;
