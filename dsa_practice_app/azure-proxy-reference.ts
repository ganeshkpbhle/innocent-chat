
/**
 * REFERENCE ONLY: AZURE FUNCTION PROXY LOGIC
 * 
 * If you want to move the Gemini logic to an Azure Function to hide your API Key,
 * here is how the Function code would look (using @google/genai in Node.js).
 */

/*
import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function geminiProxy(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    const body: any = await request.json();
    const { mode, message, history } = body;

    const modelId = mode === 'FAST' ? 'gemini-3-flash-preview' : 'gemini-3-pro-preview';
    const config: any = {
        systemInstruction: "You are a helpful assistant proxying via Azure."
    };

    if (mode === 'THINKING') {
        config.thinkingConfig = { thinkingBudget: 32768 };
    }

    try {
        const chat = ai.chats.create({ model: modelId, config, history });
        const result = await chat.sendMessage(message);
        
        return {
            status: 200,
            jsonBody: { text: result.text }
        };
    } catch (error) {
        return {
            status: 500,
            body: "Internal Server Error"
        };
    }
}

app.http('geminiProxy', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: geminiProxy
});
*/
