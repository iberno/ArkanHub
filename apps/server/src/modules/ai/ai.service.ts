import { Injectable } from '@nestjs/common';
import { ClassifierService } from './classifier.service';
import { SlaPredictionService } from './sla-prediction.service';

@Injectable()
export class AiService {
  constructor(
    private readonly classifier: ClassifierService,
    private readonly slaPrediction: SlaPredictionService,
  ) {}

  async analyzeTicket(ticketId: string, title: string, description: string) {
    const [categorySuggestion, prioritySuggestion] = await Promise.all([
      this.classifier.suggestCategory(title, description),
      this.classifier.suggestPriority(title, description),
    ]);

    let slaRisk = null;
    if (ticketId) {
      try { slaRisk = await this.slaPrediction.predictRisk(ticketId); } catch { /* no ticket yet */ }
    }

    return { categorySuggestion, prioritySuggestion, slaRisk };
  }

  async trainFromExistingTickets() {
    return this.classifier.trainFromTickets();
  }
}
