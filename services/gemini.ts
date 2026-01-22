import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  // Use a fallback to empty string if process.env.API_KEY is replaced by an empty string by Vite
  const apiKey = typeof process !== 'undefined' && process.env ? process.env.API_KEY : '';
  
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will be disabled.");
    return null;
  }
  
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI:", err);
    return null;
  }
};

export const geminiService = {
  async generateProductDescription(productName: string, category: string): Promise<string> {
    try {
      const ai = getAIClient();
      if (!ai) return "A premium quality product from our bazaar.";

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
      if (!ai) return text;

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