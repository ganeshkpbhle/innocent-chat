
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { ChatMode } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const MODE_MODELS = {
  [ChatMode.FAST]: 'gemini-3-flash-preview',
  [ChatMode.PRO]: 'gemini-3-pro-preview',
  [ChatMode.THINKING]: 'gemini-3-pro-preview'
};

export const createChatSession = (mode: ChatMode, history: { role: string; parts: { text: string }[] }[]) => {
  const modelId = MODE_MODELS[mode];
  const config: any = {
    systemInstruction: "You are Gemini Nexus, a world-class AI assistant. Provide concise, accurate, and helpful answers."
  };

  if (mode === ChatMode.THINKING) {
    config.thinkingConfig = { thinkingBudget: 32768 };
  }

  return ai.chats.create({
    model: modelId,
    config,
    history: history as any
  });
};

export async function* sendMessageStream(chat: Chat, message: string) {
  try {
    const streamResponse = await chat.sendMessageStream({ message });
    for await (const chunk of streamResponse) {
      const c = chunk as GenerateContentResponse;
      yield c.text || "";
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    yield "Error: Failed to connect to AI service. Please check your connection and try again.";
  }
}
