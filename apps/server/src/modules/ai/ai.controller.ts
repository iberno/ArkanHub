import { Controller, Get, Post, Body, Param, ParseUUIDPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AiService } from './ai.service';
import { ClassifierService } from './classifier.service';
import { SlaPredictionService } from './sla-prediction.service';
import { ChatbotService } from './chatbot.service';
import { IsString, IsOptional } from 'class-validator';

class ChatbotMessageDto {
  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  conversationId?: string;
}

class AnalyzeTicketDto {
  @IsString()
  title: string;

  @IsString()
  description: string;
}

@ApiTags('IA')
@UseGuards(AuthGuard('jwt'))
@Controller()
export class AiController {
  constructor(
    private readonly ai: AiService,
    private readonly classifier: ClassifierService,
    private readonly slaPrediction: SlaPredictionService,
    private readonly chatbot: ChatbotService,
  ) {}

  @Post('ai/analyze')
  @ApiOperation({ summary: 'Analisar texto e sugerir categoria/prioridade' })
  async analyze(@Body() dto: AnalyzeTicketDto) {
    return this.ai.analyzeTicket('', dto.title, dto.description);
  }

  @Post('ai/train')
  @ApiOperation({ summary: 'Treinar classificadores com tickets existentes' })
  async train() {
    const result = await this.classifier.trainFromTickets();
    return { trained: result };
  }

  @Get('ai/sla-risk/:ticketId')
  @ApiOperation({ summary: 'Prever risco de violação de SLA' })
  async slaRisk(@Param('ticketId', ParseUUIDPipe) ticketId: string) {
    return this.slaPrediction.predictRisk(ticketId);
  }

  @Get('ai/sla-stats')
  @ApiOperation({ summary: 'Estatísticas de cumprimento de SLA' })
  async slaStats() {
    return this.slaPrediction.getStats();
  }

  @Post('ai/chatbot')
  @ApiOperation({ summary: 'Enviar mensagem para o chatbot' })
  async chatbotMessage(@Request() req: any, @Body() dto: ChatbotMessageDto) {
    return this.chatbot.processMessage(req.user.id, dto.message, dto.conversationId);
  }
}
