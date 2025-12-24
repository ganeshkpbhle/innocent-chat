
import React, { useState, useRef, useEffect } from 'react';
import { Session, ChatMode, Message } from '../types';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { ChatMessage } from './ChatMessage';
import { ModelSelector } from './ModelSelector';
import { Send, Sparkles, MessageSquare } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ChatInterfaceProps {
  session: Session | undefined;
  onUpdateMessages: (messages: Message[]) => void;
  onNewChat: () => void;
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  session, 
  onUpdateMessages, 
  onNewChat,
  mode,
  onModeChange
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [session?.messages, isTyping]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    let targetSession = session;
    if (!targetSession) {
      onNewChat();
      // Since state update is async, we'll wait or handle this carefully
      return; 
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    const updatedMessages = [...targetSession.messages, userMessage];
    onUpdateMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      // Build history for the session
      const history = targetSession.messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const chat = createChatSession(mode, history);
      const assistantMessageId = uuidv4();
      let assistantContent = '';

      const generator = sendMessageStream(chat, userMessage.content);
      
      onUpdateMessages([...updatedMessages, {
        id: assistantMessageId,
        role: 'model',
        content: '',
        timestamp: Date.now()
      }]);

      for await (const chunk of generator) {
        assistantContent += chunk;
        onUpdateMessages([...updatedMessages, {
          id: assistantMessageId,
          role: 'model',
          content: assistantContent,
          timestamp: Date.now()
        }]);
      }
    } catch (error) {
      console.error("Stream failed", error);
    } finally {
      setIsTyping(false);
    }
  };

  if (!session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <Sparkles size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome to Gemini Nexus</h2>
        <p className="text-slate-500 text-center max-w-md mb-8">
          A high-performance AI workspace powered by the latest Gemini models. Choose a mode and start chatting.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl">
          <div onClick={onNewChat} className="p-6 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition-all shadow-sm group">
            <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 mb-2">Fast Mode</h3>
            <p className="text-xs text-slate-500">Optimized for speed and quick responses.</p>
          </div>
          <div onClick={onNewChat} className="p-6 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition-all shadow-sm group">
            <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 mb-2">Pro Mode</h3>
            <p className="text-xs text-slate-500">Advanced reasoning and coding capabilities.</p>
          </div>
          <div onClick={onNewChat} className="p-6 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition-all shadow-sm group">
            <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 mb-2">Thinking Mode</h3>
            <p className="text-xs text-slate-500">Step-by-step logic for complex problems.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <MessageSquare size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">{session.title}</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{mode} MODE ACTIVE</p>
          </div>
        </div>
        <ModelSelector currentMode={mode} onModeChange={onModeChange} disabled={isTyping} />
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
          {session.messages.length === 0 && (
            <div className="text-center py-20 opacity-50 space-y-2">
              <Sparkles className="mx-auto mb-4 text-indigo-600" size={40} />
              <p className="text-lg font-medium">Ready to assist</p>
              <p className="text-sm">Ask me anything in {mode.toLowerCase()} mode.</p>
            </div>
          )}
          {session.messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {isTyping && (
            <div className="flex gap-4 max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                <Sparkles size={16} className="text-indigo-600 animate-pulse" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-slate-200 rounded w-1/4 animate-pulse"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative group">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Message Gemini Nexus in ${mode.toLowerCase()} mode...`}
            className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-6 pr-14 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-700 placeholder:text-slate-400"
            disabled={isTyping}
          />
          <button 
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className={`absolute right-2 top-2 bottom-2 px-4 rounded-xl flex items-center justify-center transition-all ${
              inputValue.trim() && !isTyping 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-400 mt-2">
          Gemini Nexus may provide inaccurate information. Use critically.
        </p>
      </div>
    </>
  );
};
