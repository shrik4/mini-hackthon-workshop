import { storage } from "../storage";
import { analyzeMarket, generateFeatures } from "./gemini";
import { generateReactScaffold } from "./react-scaffold";
import { generatePitchDeck } from "./pitch-deck";
import { type MarketResearch, type Feature } from "@shared/schema";

export async function generateComplete(
  generationId: string,
  problemStatement: string,
  apiKey: string
): Promise<void> {
  try {
    // Update status to generating
    await storage.updateGeneration(generationId, {
      status: "generating",
    });

    // Step 1: Market Research
    console.log(`[${generationId}] Starting market research...`);
    const marketResearch = await analyzeMarket(problemStatement, apiKey);

    await storage.updateGeneration(generationId, {
      marketResearch: JSON.stringify(marketResearch),
    });

    // Step 2: Feature Generation
    console.log(`[${generationId}] Generating features...`);
    const features = await generateFeatures(problemStatement, marketResearch, apiKey);

    await storage.updateGeneration(generationId, {
      features: features,
    });

    // Step 3: React Scaffold
    console.log(`[${generationId}] Generating React scaffold...`);
    const scaffoldZip = await generateReactScaffold(problemStatement, features);

    // Step 4: Pitch Deck
    console.log(`[${generationId}] Generating pitch deck...`);
    const pitchDeckPdf = await generatePitchDeck(problemStatement, marketResearch, features);

    // Final update
    await storage.updateGeneration(generationId, {
      scaffoldZip,
      pitchDeckPdf,
      status: "completed",
      completedAt: new Date(),
    });

    console.log(`[${generationId}] Generation completed successfully`);
  } catch (error: any) {
    console.error(`[${generationId}] Generation failed:`, error);
    await storage.updateGeneration(generationId, {
      status: "failed",
    });
    throw error;
  }
}

async function generatePitchDeck(
  problemStatement: string,
  marketResearch: MarketResearch,
  features: Feature[]
): Promise<string> {
  // Simple text-based PDF generation for now
  const pdfContent = `
PITCH DECK: ${problemStatement.split(' ').slice(0, 4).join(' ')}

SLIDE 1: THE PROBLEM
${problemStatement}

Market Insight: ${marketResearch.summary.slice(0, 200)}...

SLIDE 2: OUR SOLUTION
Key Features:
${features.filter(f => f.priority === 'mvp').slice(0, 3).map((f, i) => `${i + 1}. ${f.title}: ${f.description}`).join('\n')}

SLIDE 3: THE ASK
We're seeking seed funding to develop our MVP and capture market share in this growing industry.

Contact us to learn more about this opportunity.
  `;

  // Convert to base64 (in a real app, you'd use a proper PDF library)
  return Buffer.from(pdfContent).toString('base64');
}
