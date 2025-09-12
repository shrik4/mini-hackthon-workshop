import { sql } from "drizzle-orm";
import { pgTable, text, varchar, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const generations = pgTable("generations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  problemStatement: text("problem_statement").notNull(),
  marketResearch: text("market_research"),
  features: jsonb("features"),
  scaffoldZip: text("scaffold_zip"), // base64 encoded zip
  pitchDeckPdf: text("pitch_deck_pdf"), // base64 encoded pdf
  status: text("status").notNull().default("pending"), // pending, generating, completed, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGenerationSchema = createInsertSchema(generations).pick({
  problemStatement: true,
}).extend({
  apiKey: z.string().min(1, "API key is required"),
});

export const generationRequestSchema = z.object({
  problemStatement: z.string().min(10, "Problem statement must be at least 10 characters"),
  apiKey: z.string().min(1, "API key is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Generation = typeof generations.$inferSelect;
export type InsertGeneration = z.infer<typeof insertGenerationSchema>;
export type GenerationRequest = z.infer<typeof generationRequestSchema>;

export interface MarketResearch {
  summary: string;
  competitors: Array<{
    name: string;
    description: string;
  }>;
}

export interface Feature {
  title: string;
  description: string;
  priority: "mvp" | "stretch";
  techStack: string;
  complexity: number;
}

export interface GenerationResult {
  id: string;
  marketResearch: MarketResearch;
  features: Feature[];
  scaffoldZip: string; // base64
  pitchDeckPdf: string; // base64
  status: string;
}
