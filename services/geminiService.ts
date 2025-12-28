
// Aether AI Service - Supports Xiaomi (text), Groq (vision), Tavily (search)

// API keys from environment variables
// For production, use backend proxy or server-side API calls
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY || '';
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

// Only 3 models supported
const XIAOMI_MODEL = 'xiaomi/mimo-v2-flash:free';
const GROQ_VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

export const generateAgentResponse = async (
  prompt: string,
  systemInstruction: string,
  model?: string,
  imageUrl?: string
): Promise<string> => {
  // Ensure model is defined, default to mimo-v2-flash
  const actualModel = model || 'mimo-v2-flash';
  console.log(`[AI Agent] Model requested: "${model}" → Using: "${actualModel}"`);
  
  try {
    // TAVILY SEARCH - Real web search
    if (actualModel === 'tavily-search') {
      console.log(`[TAVILY] Searching for: ${prompt.substring(0, 100)}...`);
      
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query: prompt,
          max_results: 5,
          include_answer: true
        })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error || 'Tavily search failed');
      }
      
      // Format results
      let formattedResponse = '';
      if (data.answer) {
        formattedResponse += `**Summary:**\n${data.answer}\n\n`;
      }
      if (data.results && data.results.length > 0) {
        formattedResponse += `**Sources:**\n`;
        data.results.forEach((result: any, index: number) => {
          formattedResponse += `\n${index + 1}. **${result.title}**\n`;
          formattedResponse += `   ${result.content?.substring(0, 200)}...\n`;
          formattedResponse += `   🔗 ${result.url}\n`;
        });
      }
      
      console.log(`[TAVILY] Found ${data.results?.length || 0} results`);
      return formattedResponse || 'No search results found.';
    }
    
    // GROQ VISION - Image text extraction
    if (actualModel === 'groq-vision') {
      console.log(`[GROQ] Processing with vision model. Image provided: ${!!imageUrl}`);
      
      // Check if we have an image
      const hasImage = imageUrl || prompt.startsWith('data:image');
      
      if (!hasImage) {
        console.log(`[GROQ] No image provided - falling back to Xiaomi for text processing`);
        // Fall through to Xiaomi below
      } else {
        const textPrompt = systemInstruction || prompt || 'Extract all text from this image. Be thorough and accurate.';
        
        const messageContent: any[] = [
          { type: 'text', text: textPrompt }
        ];
        
        // Add image
        const imgUrl = imageUrl || prompt;
        messageContent.push({
          type: 'image_url',
          image_url: { url: imgUrl }
        });
        
        console.log(`[GROQ] Sending to vision API with image (${imgUrl.substring(0, 50)}...)`);
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: GROQ_VISION_MODEL,
            messages: [{ role: 'user', content: messageContent }],
            max_tokens: 4096
          })
        });
        
        const data = await response.json();
        
        if (data.error) {
          console.error('[GROQ] Error:', data.error);
          throw new Error(data.error.message || 'Groq vision failed');
        }
        
        console.log(`[GROQ] Vision extraction complete`);
        return data.choices?.[0]?.message?.content || 'No text extracted from image.';
      }
    }
    
    // XIAOMI (default) - Text-to-text AI
    console.log(`[XIAOMI] Using mimo-v2-flash for text generation`);
    
    const messages: any[] = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: XIAOMI_MODEL,
        messages: messages
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'OpenRouter API error');
    }

    return data.choices?.[0]?.message?.content || 'No output generated.';
  } catch (error: any) {
    console.error("AI Service Error:", error);
    throw new Error(`AI Error: ${error.message}`);
  }
};
