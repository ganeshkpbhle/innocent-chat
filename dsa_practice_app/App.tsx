
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatInterface } from './components/ChatInterface';
import { ChatMode, Message, Session } from './types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'gemini_nexus_sessions';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [chatMode, setChatMode] = useState<ChatMode>(ChatMode.FAST);

  // Load sessions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
        if (parsed.length > 0) {
          setCurrentSessionId(parsed[0].id);
          setChatMode(parsed[0].mode);
        }
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
  }, []);

  // Persist sessions
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions]);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  const createNewSession = useCallback(() => {
    const newSession: Session = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      mode: chatMode,
      updatedAt: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  }, [chatMode]);

  const updateSessionMessages = useCallback((sessionId: string, messages: Message[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === sessionId) {
        const title = messages.length > 0 && messages[0].role === 'user' 
          ? messages[0].content.substring(0, 30) + (messages[0].content.length > 30 ? '...' : '')
          : s.title;
        return { ...s, messages, title, updatedAt: Date.now() };
      }
      return s;
    }).sort((a, b) => b.updatedAt - a.updatedAt));
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  }, [currentSessionId]);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewChat={createNewSession}
        onDeleteSession={deleteSession}
      />
      
      <main className="flex-1 flex flex-col relative h-full">
        <ChatInterface 
          session={currentSession}
          onUpdateMessages={(messages) => currentSessionId && updateSessionMessages(currentSessionId, messages)}
          onNewChat={createNewSession}
          mode={chatMode}
          onModeChange={setChatMode}
        />
      </main>
    </div>
  );
};

export default App;
