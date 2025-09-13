import { storage } from "../storage";
import { analyzeMarket, generateFeatures } from "./gemini";
import { generateReactScaffold } from "../templates/react-scaffold";
import { generateHackathonScore } from "./judgeAI";
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

    // Step 5: Hackathon Scoring (Judge Mode)
    console.log(`[${generationId}] Generating hackathon score...`);
    const hackathonScore = await generateHackathonScore(problemStatement, marketResearch, features, apiKey);

    // Final update
    await storage.updateGeneration(generationId, {
      scaffoldZip,
      pitchDeckPdf,
      hackathonScore: JSON.stringify(hackathonScore),
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
  
  let currentY = 30;
  const lineHeight = 6;
  const pageWidth = 190; // Leave margins on both sides
  
  // Title
  doc.setFontSize(20);
  doc.text('PITCH DECK', 105, currentY, { align: 'center' });
  currentY += 25;
  
  // Slide 1: Problem
  doc.setFontSize(16);
  doc.text('SLIDE 1: THE PROBLEM', 20, currentY);
  currentY += 12;
  
  doc.setFontSize(12);
  const problemLines = doc.splitTextToSize(problemStatement, pageWidth - 40);
  problemLines.forEach((line: string) => {
    doc.text(line, 20, currentY);
    currentY += lineHeight;
  });
  currentY += 8;
  
  // Market insight
  const marketText = `Market Insight: ${marketResearch.summary.slice(0, 250)}...`;
  const marketLines = doc.splitTextToSize(marketText, pageWidth - 40);
  marketLines.forEach((line: string) => {
    doc.text(line, 20, currentY);
    currentY += lineHeight;
  });
  currentY += 15;
  
  // Slide 2: Solution
  doc.setFontSize(16);
  doc.text('SLIDE 2: OUR SOLUTION', 20, currentY);
  currentY += 12;
  
  doc.setFontSize(12);
  doc.text('Key Features:', 20, currentY);
  currentY += 10;
  
  const mvpFeatures = features.filter(f => f.priority === 'mvp').slice(0, 3);
  mvpFeatures.forEach((feature, i) => {
    const featureTitle = `${i + 1}. ${feature.title}`;
    doc.text(featureTitle, 25, currentY);
    currentY += lineHeight;
    
    const featureDescLines = doc.splitTextToSize(feature.description, pageWidth - 60);
    featureDescLines.forEach((line: string) => {
      doc.text(line, 30, currentY);
      currentY += lineHeight;
    });
    currentY += 4;
  });
  currentY += 10;
  
  // Slide 3: The Ask
  doc.setFontSize(16);
  doc.text('SLIDE 3: THE ASK', 20, currentY);
  currentY += 12;
  
  doc.setFontSize(12);
  const askText = "We're seeking seed funding to develop our MVP and capture market share in this growing industry. Contact us to learn more about this opportunity.";
  const askLines = doc.splitTextToSize(askText, pageWidth - 40);
  askLines.forEach((line: string) => {
    doc.text(line, 20, currentY);
    currentY += lineHeight;
  });

  // Convert to base64
  const pdfBlob = doc.output('arraybuffer');
  return Buffer.from(pdfBlob).toString('base64');
}
