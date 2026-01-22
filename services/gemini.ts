
import { GoogleGenAI } from "@google/genai";

// Initialize safely. If the key is missing, the service will handle the error on call rather than at script load.
const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will be limited.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const geminiService = {
  async generateProductDescription(productName: string, category: string): Promise<string> {
    try {
      const ai = getAIClient();
      if (!ai) throw new Error("AI Client not initialized");

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a compelling, short marketing description for a ${category} product named "${productName}" targeting shoppers in a local Pakistani bazaar. Keep it elegant and highlight local style.`,
      });
      return response.text || "An elegant addition to your wardrobe.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "An elegant addition to your wardrobe.";
    }
  },

  async translateToUrdu(text: string): Promise<string> {
    try {
      const ai = getAIClient();
      if (!ai) throw new Error("AI Client not initialized");

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the following marketing text to natural, spoken Urdu (using Urdu script): "${text}"`,
      });
      return response.text || text;
    } catch (error) {
      console.error("Gemini Translation Error:", error);
      return text;
    }
  }
};
