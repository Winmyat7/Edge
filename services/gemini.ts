
import { GoogleGenAI } from "@google/genai";
import { Trade, Account } from "../types";

export async function analyzeTrades(trades: Trade[], account: Account): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const tradeDataSummary = trades.map(t => ({
    symbol: t.symbol,
    side: t.side,
    session: t.session,
    bias: t.bias,
    result: t.result,
    resultR: t.resultR,
    tags: t.setups,
    mistake: t.mistake,
    notes: t.notes
  }));

  const prompt = `
    As a professional trading performance coach, analyze the following trading history for account "${account.name}".
    
    Account Metrics:
    - Currency: ${account.currency}
    - Recent Trades Data: ${JSON.stringify(tradeDataSummary.slice(-10))}

    Please provide a structured performance review (Markdown format):
    1. **Psychological & Behavioral Review**: Analyze recurring mistakes or emotional patterns (FOMO, overtrading, poor exit logic) noted in the "mistake" or "notes" fields.
    2. **Session & Bias Optimization**: Look at the "session" and "bias" fields. Are they performing better in London vs NY? Is their HTF bias usually correct?
    3. **Strategy Effectiveness**: Evaluate which SMC setups (OB, FVG, Liq Sweep) are providing the highest R-multiple returns.
    4. **Action Plan**: Provide exactly 3 bullet points for the user to implement in their next 5 trades.

    Keep it sharp, professional, and slightly critical if mistakes are repetitive. Use bold text for key insights.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "Failed to connect to AI coach. Please try again later.";
  }
}
