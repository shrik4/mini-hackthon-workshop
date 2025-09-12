import { type User, type InsertUser, type Generation, type InsertGeneration } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createGeneration(generation: Omit<InsertGeneration, 'apiKey'>): Promise<Generation>;
  getGeneration(id: string): Promise<Generation | undefined>;
  updateGeneration(id: string, updates: Partial<Generation>): Promise<Generation>;
  getGenerations(): Promise<Generation[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private generations: Map<string, Generation>;

  constructor() {
    this.users = new Map();
    this.generations = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createGeneration(generation: Omit<InsertGeneration, 'apiKey'>): Promise<Generation> {
    const id = randomUUID();
    const newGeneration: Generation = {
      id,
      problemStatement: generation.problemStatement,
      marketResearch: null,
      features: null,
      scaffoldZip: null,
      pitchDeckPdf: null,
      status: "pending",
      createdAt: new Date(),
      completedAt: null,
    };
    this.generations.set(id, newGeneration);
    return newGeneration;
  }

  async getGeneration(id: string): Promise<Generation | undefined> {
    return this.generations.get(id);
  }

  async updateGeneration(id: string, updates: Partial<Generation>): Promise<Generation> {
    const existing = this.generations.get(id);
    if (!existing) {
      throw new Error(`Generation ${id} not found`);
    }
    const updated = { ...existing, ...updates };
    this.generations.set(id, updated);
    return updated;
  }

  async getGenerations(): Promise<Generation[]> {
    return Array.from(this.generations.values());
  }
}

export const storage = new MemStorage();
