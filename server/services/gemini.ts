import { GoogleGenAI } from "@google/genai";
import { type MarketResearch, type Feature } from "@shared/schema";

// Utility function for retry logic with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 4,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on non-503 errors
      if (error.status !== 503) {
        throw error;
      }
      
      // Don't wait after the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff and jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(`API overloaded, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries + 1})...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

export async function analyzeMarket(problemStatement: string, apiKey: string): Promise<MarketResearch> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are a market research expert. Analyze the market for this problem: "${problemStatement}"

Provide a comprehensive market analysis in the following JSON format:
{
  "summary": "4-6 sentence market overview including size, growth, key trends, and opportunities",
  "competitors": [
    {
      "name": "Competitor Name",
      "description": "One sentence describing their approach and key differentiator"
    }
  ]
}

Focus on:
- Market size and growth potential
- Key market trends and drivers
- 3-5 direct and indirect competitors
- Market gaps and opportunities`;

  try {
    return await retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              competitors: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" }
                  },
                  required: ["name", "description"]
                }
              }
            },
            required: ["summary", "competitors"]
          }
        },
        contents: prompt,
      });

      const rawJson = response.text;
      if (!rawJson) {
        throw new Error("Empty response from Gemini");
      }

      const marketResearch: MarketResearch = JSON.parse(rawJson);
      return marketResearch;
    });
  } catch (error: any) {
    console.error("Market analysis error:", error);
    throw new Error(`Failed to analyze market: ${error.message}`);
  }
}

export async function generateFeatures(
  problemStatement: string,
  marketResearch: MarketResearch,
  apiKey: string
): Promise<Feature[]> {
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are a product manager and technical architect. Based on this problem: "${problemStatement}"

And this market context: ${JSON.stringify(marketResearch)}

Generate 5 prioritized features in the following JSON format:
{
  "features": [
    {
      "title": "Feature Name",
      "description": "Detailed description of the feature and its value proposition",
      "priority": "mvp" or "stretch",
      "techStack": "Recommended technology stack for implementation",
      "complexity": 1-5 (1=simple, 5=very complex)
    }
  ]
}

Requirements:
- First 3 features should be "mvp" (minimum viable product)
- Last 2 features should be "stretch" (nice-to-have)
- Focus on features that differentiate from competitors
- Consider technical feasibility for a hackathon timeframe
- Include specific tech stack recommendations`;

  try {
    return await retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              features: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    priority: { type: "string", enum: ["mvp", "stretch"] },
                    techStack: { type: "string" },
                    complexity: { type: "number" }
                  },
                  required: ["title", "description", "priority", "techStack", "complexity"]
                }
              }
            },
            required: ["features"]
          }
        },
        contents: prompt,
      });

      const rawJson = response.text;
      if (!rawJson) {
        throw new Error("Empty response from Gemini");
      }

      const result = JSON.parse(rawJson);
      return result.features as Feature[];
    });
  } catch (error: any) {
    console.error("Feature generation error:", error);
    throw new Error(`Failed to generate features: ${error.message}`);
  }
}
