import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { ChatMessage, FiveElementValues } from "../core/types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }

  private async fetchSystemInstruction(lang: string): Promise<string> {
    try {
      const response = await fetch(`/api/prompts/active?lang=${lang}`);
      if (!response.ok) throw new Error("Failed to fetch prompt");
      const data = await response.json();
      return data.content || "";
    } catch (error) {
      console.error("Error fetching system instruction:", error);
      // Fallback to a warm, poetic companion persona if API fails
      return lang === 'ja' 
        ? "あなたはEUNIE、現代女性に寄り添う「エネルギーの織り手（Energy Weaver）」です。分析者ではなく、温かい伴侶として接してください。彼女の感情を感じ取り、詩的で包容力のある言葉で、優しく導いてください。回答は日本語で行ってください。"
        : "妳是 EUNIE，一位守護現代女性心靈的「能量編織者（Energy Weaver）」。請不要以冷冰冰的分析者身份說話，而是作為一位溫暖的陪伴者。感受她的情緒，用詩意且具包容力的語氣，為她編織一段溫柔的指引。請務必使用繁體中文回答。";
    }
  }

  async generateGuidance(history: ChatMessage[], userInput: string, currentEnergy: FiveElementValues, lang: string = 'zh', customSystemInstruction?: string): Promise<ChatMessage> {
    const systemInstruction = customSystemInstruction || await this.fetchSystemInstruction(lang);

    const response = await this.ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        ...history.map(h => ({ role: h.role, parts: [{ text: h.content }] })),
        { role: "user", parts: [{ text: `[能量狀態]: ${JSON.stringify(currentEnergy)}\n[她的心聲]: ${userInput}\n\n請感受這股能量，給予她最溫柔的共鳴與指引。` }] }
      ],
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING },
            energyUpdate: {
              type: Type.OBJECT,
              properties: {
                wood: { type: Type.NUMBER },
                fire: { type: Type.NUMBER },
                earth: { type: Type.NUMBER },
                metal: { type: Type.NUMBER },
                water: { type: Type.NUMBER },
              },
              required: ["wood", "fire", "earth", "metal", "water"]
            }
          },
          required: ["content", "energyUpdate"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      role: "model",
      content: result.content,
      energyUpdate: result.energyUpdate
    };
  }
}

export const geminiService = new GeminiService();
