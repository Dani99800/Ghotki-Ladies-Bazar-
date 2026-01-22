
import { GoogleGenAI } from "@google/genai";

// Initialize the Google GenAI SDK with the API key from environment variables.
// Use process.env.API_KEY directly as per @google/genai guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async generateProductDescription(productName: string, category: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Write a compelling, short marketing description for a ${category} product named "${productName}" targeting shoppers in a local Pakistani bazaar. Keep it elegant and highlight local style.`,
      });
      // Directly accessing the .text property from GenerateContentResponse (not calling it as a function).
      return response.text || "No description generated.";
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
      // Directly accessing the .text property from GenerateContentResponse.
      return response.text || text;
    } catch (error) {
      return text;
    }
  }
};
