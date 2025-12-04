import { GoogleGenAI } from "@google/genai";
import { MarketData, OrderSide, OrderType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMarketTrend = async (
  symbol: string,
  data: MarketData[]
): Promise<string> => {
  try {
    const recentPrices = data.slice(-20).map(d => d.price).join(', ');
    const prompt = `
      Analyze the following recent price trend for ${symbol}. 
      Prices (oldest to newest): [${recentPrices}].
      Provide a concise 2-sentence market sentiment analysis (Bullish/Bearish/Neutral) and a suggested short-term action.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert cryptocurrency trading bot analyst. Be concise and technical.",
        temperature: 0.3,
      }
    });

    return response.text || "Unable to generate analysis.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Error connecting to AI analyst.";
  }
};

export const generatePythonCode = async (
  symbol: string,
  side: OrderSide,
  type: OrderType,
  quantity: number,
  price?: number
): Promise<string> => {
  try {
    const prompt = `
      Generate a Python script using the 'python-binance' library to place a specific order on the Binance Futures Testnet.
      
      Parameters:
      - Symbol: ${symbol}
      - Side: ${side}
      - Type: ${type}
      - Quantity: ${quantity}
      ${price ? `- Price: ${price}` : ''}
      
      Requirements:
      - Include authentication setup (placeholders for API_KEY/SECRET).
      - Use the Testnet URL.
      - Add error handling.
      - Return ONLY the python code block, no markdown formatting like \`\`\`.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    let code = response.text || "# Error generating code";
    // Clean up potential markdown code blocks if the model ignores the instruction
    code = code.replace(/```python/g, '').replace(/```/g, '').trim();
    return code;
  } catch (error) {
    console.error("Gemini Code Gen Error:", error);
    return "# Error generating Python code via Gemini.";
  }
};