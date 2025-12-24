
export enum ChatMode {
  FAST = 'FAST',
  PRO = 'PRO',
  THINKING = 'THINKING'
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: number;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  mode: ChatMode;
  updatedAt: number;
}

export interface ModelConfig {
  name: string;
  modelId: string;
  description: string;
  icon: string;
}
