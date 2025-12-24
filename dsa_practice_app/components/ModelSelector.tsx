
import React from 'react';
import { ChatMode } from '../types';
import { Zap, ShieldCheck, Brain } from 'lucide-react';

interface ModelSelectorProps {
  currentMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  disabled: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ currentMode, onModeChange, disabled }) => {
  const modes = [
    { id: ChatMode.FAST, label: 'Fast', icon: <Zap size={14} />, color: 'text-amber-500' },
    { id: ChatMode.PRO, label: 'Pro', icon: <ShieldCheck size={14} />, color: 'text-indigo-500' },
    { id: ChatMode.THINKING, label: 'Think', icon: <Brain size={14} />, color: 'text-purple-500' },
  ];

  return (
    <div className="flex bg-slate-100 p-1 rounded-xl">
      {modes.map((mode) => (
        <button
          key={mode.id}
          disabled={disabled}
          onClick={() => onModeChange(mode.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            currentMode === mode.id
              ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-500 hover:text-slate-700'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className={currentMode === mode.id ? mode.color : ''}>{mode.icon}</span>
          {mode.label}
        </button>
      ))}
    </div>
  );
};
