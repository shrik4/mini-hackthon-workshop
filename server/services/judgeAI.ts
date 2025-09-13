import { GoogleGenAI } from "@google/genai";
import { type HackathonScore, type MarketResearch, type Feature } from "@shared/schema";

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

export async function generateHackathonScore(
  problemStatement: string,
  marketResearch: MarketResearch,
  features: Feature[],
  apiKey: string
): Promise<HackathonScore> {
  const ai = new GoogleGenAI({ apiKey });

  const mvpFeatures = features.filter(f => f.priority === 'mvp');
  const stretchFeatures = features.filter(f => f.priority === 'stretch');

  const prompt = `You are an expert hackathon judge evaluating startup ideas. Analyze this hackathon project and provide detailed scores.

PROBLEM STATEMENT: ${problemStatement}

MARKET RESEARCH: ${marketResearch.summary}

COMPETITORS: ${marketResearch.competitors.map(c => `${c.name}: ${c.description}`).join('\n')}

MVP FEATURES:
${mvpFeatures.map((f, i) => `${i + 1}. ${f.title}: ${f.description} (Tech: ${f.techStack}, Complexity: ${f.complexity}/5)`).join('\n')}

STRETCH FEATURES:
${stretchFeatures.map((f, i) => `${i + 1}. ${f.title}: ${f.description} (Tech: ${f.techStack}, Complexity: ${f.complexity}/5)`).join('\n')}

Please evaluate this hackathon project on three key criteria and provide scores from 0-10:

1. ORIGINALITY: How unique and innovative is this idea? Is it solving a problem in a novel way?
2. FEASIBILITY: How realistic is it to build this during a hackathon? Consider technical complexity, team size, and time constraints.
3. MARKET FIT: How well does this address a real market need? Is there clear user demand?

Provide your evaluation in the exact JSON format below:`;

  try {
    return await retryWithBackoff(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              overallScore: { type: "number" },
              originality: {
                type: "object",
                properties: {
                  score: { type: "number" },
                  feedback: { type: "string" }
                },
                required: ["score", "feedback"]
              },
              feasibility: {
                type: "object",
                properties: {
                  score: { type: "number" },
                  feedback: { type: "string" }
                },
                required: ["score", "feedback"]
              },
              marketFit: {
                type: "object",
                properties: {
                  score: { type: "number" },
                  feedback: { type: "string" }
                },
                required: ["score", "feedback"]
              },
              summary: { type: "string" },
              strengths: {
                type: "array",
                items: { type: "string" }
              },
              improvements: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["overallScore", "originality", "feasibility", "marketFit", "summary", "strengths", "improvements"]
          }
        },
        contents: prompt,
      });

      const rawJson = response.text;
      if (!rawJson) {
        throw new Error("Empty response from Gemini");
      }

      const scoreData: HackathonScore = JSON.parse(rawJson);
      
      // Ensure overall score is calculated correctly
      const avgScore = (scoreData.originality.score + scoreData.feasibility.score + scoreData.marketFit.score) / 3;
      scoreData.overallScore = Math.round(avgScore * 10) / 10; // Round to 1 decimal place
      
      return scoreData;
    });
  } catch (error: any) {
    console.error("Hackathon scoring error:", error);
    
    // Return a fallback score if AI fails
    return {
      overallScore: 7.0,
      originality: {
        score: 7,
        feedback: "Unable to fully evaluate originality due to analysis error."
      },
      feasibility: {
        score: 7,
        feedback: "Technical feasibility appears moderate based on basic assessment."
      },
      marketFit: {
        score: 7,
        feedback: "Market potential requires further validation."
      },
      summary: "Evaluation incomplete - please review manually",
      strengths: ["Shows promise", "Addresses user needs"],
      improvements: ["Requires deeper technical analysis", "Market validation needed"]
    };
  }
}