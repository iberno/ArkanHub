import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { AttachmentsController } from './attachments.controller';
import { AttachmentsService } from './attachments.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [TicketsController, CommentsController, AttachmentsController],
  providers: [TicketsService, CommentsService, AttachmentsService],
  exports: [TicketsService],
})
export class TicketsModule {}
