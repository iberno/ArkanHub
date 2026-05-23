import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { WebsocketModule } from '../websocket/websocket.module';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';
import { TicketAuxController } from './ticket-aux.controller';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    WebsocketModule,
  ],
  controllers: [TicketsController, CommentsController, AttachmentsController, TicketAuxController],
  providers: [TicketsService, CommentsService, AttachmentsService],
  exports: [TicketsService],
})
export class TicketsModule {}
