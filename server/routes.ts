import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generationRequestSchema, type GenerationRequest } from "@shared/schema";
import { generateComplete } from "./services/generator";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate complete hackathon package
  app.post("/api/generate", async (req, res) => {
    try {
      const validationResult = generationRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: fromZodError(validationResult.error).toString(),
        });
      }

      const { problemStatement, apiKey } = validationResult.data;

      // Create generation record
      const generation = await storage.createGeneration({ problemStatement });

      // Start generation process asynchronously
      generateComplete(generation.id, problemStatement, apiKey).catch(console.error);

      res.json({
        generationId: generation.id,
        status: "started",
      });
    } catch (error: any) {
      console.error("Generation error:", error);
      res.status(500).json({
        error: "Failed to start generation",
        message: error.message,
      });
    }
  });

  // Get generation status and results
  app.get("/api/generation/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const generation = await storage.getGeneration(id);

      if (!generation) {
        return res.status(404).json({ error: "Generation not found" });
      }

      res.json(generation);
    } catch (error: any) {
      console.error("Get generation error:", error);
      res.status(500).json({
        error: "Failed to get generation",
        message: error.message,
      });
    }
  });

  // Download generated files
  app.get("/api/generation/:id/download/:type", async (req, res) => {
    try {
      const { id, type } = req.params;
      const generation = await storage.getGeneration(id);

      if (!generation) {
        return res.status(404).json({ error: "Generation not found" });
      }

      if (generation.status !== "completed") {
        return res.status(400).json({ error: "Generation not completed" });
      }

      if (type === "zip" && generation.scaffoldZip) {
        const buffer = Buffer.from(generation.scaffoldZip, "base64");
        res.setHeader("Content-Type", "application/zip");
        res.setHeader("Content-Disposition", `attachment; filename="hackathon-app.zip"`);
        res.send(buffer);
      } else if (type === "pdf" && generation.pitchDeckPdf) {
        const buffer = Buffer.from(generation.pitchDeckPdf, "base64");
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="pitch-deck.pdf"`);
        res.send(buffer);
      } else {
        res.status(404).json({ error: "File not found" });
      }
    } catch (error: any) {
      console.error("Download error:", error);
      res.status(500).json({
        error: "Failed to download file",
        message: error.message,
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
