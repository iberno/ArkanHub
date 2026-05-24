import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';
import * as natural from 'natural';

const { BayesClassifier, PorterStemmerPt, RegexpTokenizer } = natural;

@Injectable()
export class ClassifierService {
  private readonly logger = new Logger(ClassifierService.name);
  private categoryClassifier: any = null;
  private priorityClassifier: any = null;
  private tokenizer = new RegexpTokenizer({ pattern: /[^a-zA-ZÀ-ÿ\u00C0-\u024F0-9]+/ });
  private trained = false;

  constructor(private readonly prisma: PrismaService) {}

  private tokenize(text: string): string[] {
    const cleaned = text.toLowerCase().replace(/[^a-zà-ÿ\u00C0-\u024F0-9\s]/g, ' ');
    const tokens = this.tokenizer.tokenize(cleaned) || [];
    return tokens.map((t: string) => PorterStemmerPt.stem(t)).filter((t: string) => t.length > 1);
  }

  async trainFromTickets() {
    this.logger.log('Training classifiers from existing tickets...');

    const tickets = await this.prisma.ticket.findMany({
      where: { categoryId: { not: null } },
      include: { category: true, priority: true },
      take: 5000,
    });

    if (tickets.length < 5) {
      this.logger.warn('Not enough tickets to train (need at least 5)');
      return false;
    }

    // Category classifier
    this.categoryClassifier = new BayesClassifier();
    const catMap = new Map<string, number>();
    for (const t of tickets) {
      if (!t.category) continue;
      const text = `${t.title} ${t.description}`;
      const tokens = this.tokenize(text);
      if (tokens.length === 0) continue;
      this.categoryClassifier.addDocument(tokens, t.category.name);
      catMap.set(t.category.name, (catMap.get(t.category.name) || 0) + 1);
    }
    this.categoryClassifier.train();

    // Priority classifier (only where priority name maps to keywords well)
    this.priorityClassifier = new BayesClassifier();
    const priorityTickets = tickets.filter((t) => t.priority);
    for (const t of priorityTickets) {
      if (!t.priority) continue;
      const text = `${t.title} ${t.description}`;
      const tokens = this.tokenize(text);
      if (tokens.length === 0) continue;
      this.priorityClassifier.addDocument(tokens, t.priority.name);
    }
    if (priorityTickets.length >= 5) {
      this.priorityClassifier.train();
    } else {
      this.priorityClassifier = null;
    }

    this.trained = true;
    this.logger.log(`Classifiers trained: ${tickets.length} tickets, ${catMap.size} categories`);
    return true;
  }

  async suggestCategory(title: string, description: string): Promise<{ category: string | null; confidence: number } | null> {
    if (!this.trained) {
      const trained = await this.trainFromTickets();
      if (!trained) return null;
    }

    const text = `${title} ${description}`;
    const tokens = this.tokenize(text);
    if (tokens.length === 0) return null;

    const classifications = this.categoryClassifier.getClassifications(tokens);
    const total = classifications.reduce((s: number, c: any) => s + c.value, 0);
    const normalized = classifications.map((c: any) => ({ label: c.label, value: total > 0 ? c.value / total : 0 }));
    normalized.sort((a: any, b: any) => b.value - a.value);
    const best = normalized[0];
    if (!best || best.label === '_unknown' || best.value < 0.15) return null;

    return { category: best.label, confidence: Math.round(best.value * 100) / 100 };
  }

  async suggestPriority(title: string, description: string): Promise<{ priority: string | null; confidence: number } | null> {
    if (!this.priorityClassifier) {
      const trained = await this.trainFromTickets();
      if (!trained || !this.priorityClassifier) return null;
    }

    const text = `${title} ${description}`;
    const tokens = this.tokenize(text);
    if (tokens.length === 0) return null;

    const classifications = this.priorityClassifier.getClassifications(tokens);
    const total = classifications.reduce((s: number, c: any) => s + c.value, 0);
    const normalized = classifications.map((c: any) => ({ label: c.label, value: total > 0 ? c.value / total : 0 }));
    normalized.sort((a: any, b: any) => b.value - a.value);
    const best = normalized[0];
    if (!best || best.value < 0.2) return null;

    return { priority: best.label, confidence: Math.round(best.value * 100) / 100 };
  }
}
