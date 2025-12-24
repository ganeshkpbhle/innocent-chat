
import React from 'react';
import { Message } from '../types';
import { User, Sparkles } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
        isUser ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-100'
      }`}>
        {isUser ? <User size={18} /> : <Sparkles size={18} />}
      </div>
      
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[85%]`}>
        <div className={`px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed ${
          isUser 
            ? 'bg-indigo-600 text-white rounded-tr-none' 
            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
        }`}>
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>
        <span className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tighter">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};
