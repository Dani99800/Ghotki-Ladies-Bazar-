
import { GoogleGenAI } from "@google/genai";

// Safe retrieval of API key to prevent crashes if environment variable is not yet set
const getApiKey = () => {
  try {
    return process.env.API_KEY || '';
  } catch (e) {
    return '';
  }
};

const apiKey = getApiKey();
// Initialize only if API key is present, otherwise handle gracefully in methods
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const geminiService = {
  async generateProductDescription(productName: string, category: string): Promise<string> {
    if (!ai) return "An elegant addition to your wardrobe.";
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a compelling, short marketing description for a ${category} product named "${productName}" targeting shoppers in a local Pakistani bazaar. Keep it elegant and highlight local style.`,
      });
      return response.text || "No description generated.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "An elegant addition to your wardrobe.";
    }
  },

  async translateToUrdu(text: string): Promise<string> {
    if (!ai) return text;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the following marketing text to natural, spoken Urdu (using Urdu script): "${text}"`,
      });
      return response.text || text;
    } catch (error) {
      return text;
    }
  }
};
