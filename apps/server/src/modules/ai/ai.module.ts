import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { ClassifierService } from './classifier.service';
import { SlaPredictionService } from './sla-prediction.service';
import { ChatbotService } from './chatbot.service';

@Module({
  controllers: [AiController],
  providers: [AiService, ClassifierService, SlaPredictionService, ChatbotService],
  exports: [AiService, ClassifierService],
})
export class AiModule {}
