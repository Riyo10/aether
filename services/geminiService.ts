
import { GoogleGenAI } from "@google/genai";

// Initialize the client. 
// Note: In a real production app, this would be proxied through a backend to protect the key.
// For this client-side demo architecture, we assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateAgentResponse = async (
  prompt: string,
  systemInstruction: string,
  model: string = 'gemini-2.5-flash'
): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      // Simulate response for demo purposes if no key is present, 
      // ensuring the UI can be showcased without crashing.
      console.warn("No API_KEY found. returning mock response.");
      await new Promise(resolve => setTimeout(resolve, 1500));
      return `[Mock Output] Processed: "${prompt.slice(0, 20)}..." via ${model}.`;
    }

    // Heuristic: Enable Google Search tool if the prompt/system instruction implies searching.
    const enableSearch = systemInstruction.toLowerCase().includes('web search') || 
                         systemInstruction.toLowerCase().includes('search the web') ||
                         systemInstruction.toLowerCase().includes('scrape');

    const config: any = {
        systemInstruction: systemInstruction,
        temperature: 0.7,
    };
    
    // Dynamically attach tool if needed
    if (enableSearch) {
        config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: config
    });

    let outputText = response.text || "No output generated.";

    // Handle Grounding Metadata (Append sources if search was used)
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        const chunks = response.candidates[0].groundingMetadata.groundingChunks;
        const sources = chunks
            .map((c: any) => c.web?.uri ? `- [${c.web.title || 'Source'}](${c.web.uri})` : null)
            .filter(Boolean);
            
        if (sources.length > 0) {
            // Deduplicate sources
            const uniqueSources = [...new Set(sources)];
            outputText += `\n\n### Sources\n${uniqueSources.join('\n')}`;
        }
    }

    return outputText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to execute agent.");
  }
};
