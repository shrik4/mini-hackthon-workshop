import { storage } from "../storage";
import { analyzeMarket, generateFeatures } from "./gemini";
import { generateReactScaffold } from "../templates/react-scaffold";
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
  // Use jsPDF to create a proper PDF
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  // Set up basic styling
  doc.setFontSize(20);
  doc.text('PITCH DECK', 20, 30);
  
  // Problem slide
  doc.setFontSize(16);
  doc.text('SLIDE 1: THE PROBLEM', 20, 50);
  doc.setFontSize(12);
  
  // Split long text into lines that fit the page
  const problemLines = doc.splitTextToSize(problemStatement, 170);
  doc.text(problemLines, 20, 65);
  
  // Market insight
  const marketText = `Market Insight: ${marketResearch.summary.slice(0, 200)}...`;
  const marketLines = doc.splitTextToSize(marketText, 170);
  doc.text(marketLines, 20, 85 + (problemLines.length * 5));
  
  // Solution slide
  doc.setFontSize(16);
  const solutionY = 105 + (problemLines.length * 5) + (marketLines.length * 5);
  doc.text('SLIDE 2: OUR SOLUTION', 20, solutionY);
  doc.setFontSize(12);
  doc.text('Key Features:', 20, solutionY + 15);
  
  const mvpFeatures = features.filter(f => f.priority === 'mvp').slice(0, 3);
  mvpFeatures.forEach((feature, i) => {
    const featureText = `${i + 1}. ${feature.title}: ${feature.description}`;
    const featureLines = doc.splitTextToSize(featureText, 160);
    doc.text(featureLines, 25, solutionY + 30 + (i * 15));
  });
  
  // The Ask slide
  doc.setFontSize(16);
  const askY = solutionY + 80;
  doc.text('SLIDE 3: THE ASK', 20, askY);
  doc.setFontSize(12);
  const askText = "We're seeking seed funding to develop our MVP and capture market share in this growing industry. Contact us to learn more about this opportunity.";
  const askLines = doc.splitTextToSize(askText, 170);
  doc.text(askLines, 20, askY + 15);

  // Convert to base64
  const pdfBlob = doc.output('arraybuffer');
  return Buffer.from(pdfBlob).toString('base64');
}
