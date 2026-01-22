
import { GoogleGenAI } from "@google/genai";

// Fix: Strictly follow initialization guidelines and assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async generateProductDescription(productName: string, category: string): Promise<string> {
    try {
      // Fix: Use the recommended model for basic text tasks and call generateContent directly.
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a compelling, short marketing description for a ${category} product named "${productName}" targeting shoppers in a local Pakistani bazaar. Keep it elegant and highlight local style.`,
      });
      // Fix: Extract text using the .text property directly.
      return response.text || "An elegant addition to your wardrobe.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "An elegant addition to your wardrobe.";
    }
  },

  async translateToUrdu(text: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the following marketing text to natural, spoken Urdu (using Urdu script): "${text}"`,
      });
      // Fix: Extract text using the .text property directly.
      return response.text || text;
    } catch (error) {
      console.error("Gemini Translation Error:", error);
      return text;
    }
  }
};
