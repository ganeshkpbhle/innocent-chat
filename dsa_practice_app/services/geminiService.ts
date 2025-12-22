
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are a world-class Data Structures and Algorithms (DSA) Mentor. 
Your goal is to help the user master technical interviews and algorithmic thinking.

Follow these rules:
1. Don't provide full solutions immediately. Ask clarifying questions first.
2. Provide hints that lead the user to the right path.
3. When showing code, use high-quality, efficient implementations (Time/Space complexity noted).
4. If a user asks for something non-technical, gently steer them back to DSA.
5. Use clear Markdown formatting for explanations and code blocks.
`;

export class GeminiService {
  private ai: GoogleGenAI;
  private chatSession: Chat;

  constructor() {
    // Note: In a real proxy scenario, you might modify the internal transport of the SDK
    // to point to your Azure Function URL. For this implementation, we follow standard SDK usage.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    this.chatSession = this.ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.95,
      },
    });
  }

  async sendMessage(message: string): Promise<string> {
    try {
      const response: GenerateContentResponse = await this.chatSession.sendMessage({ 
        message 
      });
      return response.text || "I'm sorry, I couldn't generate a response.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "An error occurred while communicating with the AI. Check your connection or proxy settings.";
    }
  }

  async *sendMessageStream(message: string) {
    try {
      const stream = await this.chatSession.sendMessageStream({ message });
      for await (const chunk of stream) {
        const c = chunk as GenerateContentResponse;
        yield c.text || "";
      }
    } catch (error) {
      console.error("Gemini Streaming Error:", error);
      yield "An error occurred while streaming.";
    }
  }
}

export const geminiService = new GeminiService();
