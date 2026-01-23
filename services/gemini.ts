
import { GoogleGenAI } from "@google/genai";

// Refactored to follow @google/genai initialization guidelines
export const geminiService = {
  async generateProductDescription(productName: string, category: string): Promise<string> {
    try {
      // Fix: Direct initialization using process.env.API_KEY as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a compelling, short marketing description for a ${category} product named "${productName}" targeting shoppers in a local Pakistani bazaar. Keep it elegant and highlight local style.`,
      });
      
      // Fix: Use .text property directly instead of .text()
      return response.text || "An elegant addition to your wardrobe.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "An elegant addition to your wardrobe.";
    }
  },

  async translateToUrdu(text: string): Promise<string> {
    try {
      // Fix: Direct initialization using process.env.API_KEY as per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the following marketing text to natural, spoken Urdu (using Urdu script): "${text}"`,
      });
      
      // Fix: Use .text property directly instead of .text()
      return response.text || text;
    } catch (error) {
      console.error("Gemini Translation Error:", error);
      return text;
    }
  }
};
