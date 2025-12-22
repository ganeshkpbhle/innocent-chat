
export enum Role {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system'
}

export interface Message {
  role: Role;
  text: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  messages: Message[];
}
