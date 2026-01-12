
import { type InsertAnalysis, type Analysis } from "@shared/schema";

export interface IStorage {
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
}

export class MemStorage implements IStorage {
  private analyses: Map<number, Analysis>;
  private currentId: number;

  constructor() {
    this.analyses = new Map();
    this.currentId = 1;
  }

  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = this.currentId++;
    const analysis: Analysis = { ...insertAnalysis, id, createdAt: new Date() };
    this.analyses.set(id, analysis);
    return analysis;
  }
}

export const storage = new MemStorage();
