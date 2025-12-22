
import React, { useState } from 'react';
import ChatWindow from './components/ChatWindow';
import AzureProxyGuide from './components/AzureProxyGuide';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'proxy'>('chat');

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 p-4 gap-4 max-w-[1400px] mx-auto">
      {/* Sidebar for Navigation (Mobile Sticky Top) */}
      <div className="md:w-64 flex-shrink-0 flex md:flex-col gap-2 sticky top-4 z-10">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeTab === 'chat' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>
          <span className="font-semibold text-sm">Practice Chat</span>
        </button>
        <button
          onClick={() => setActiveTab('proxy')}
          className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            activeTab === 'proxy' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span className="font-semibold text-sm">Proxy Setup</span>
        </button>

        <div className="hidden md:block mt-auto p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
          <p className="font-bold mb-1 text-slate-800">Session Status</p>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Connected to Proxy</span>
          </div>
          <p>This app uses a session-based memory. Refreshing will reset the conversation.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-[600px]">
        {activeTab === 'chat' ? (
          <ChatWindow />
        ) : (
          <AzureProxyGuide />
        )}
      </main>
    </div>
  );
};

export default App;
