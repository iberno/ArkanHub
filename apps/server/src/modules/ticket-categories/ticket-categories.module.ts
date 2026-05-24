import { Module } from '@nestjs/common';
import { CategoriesController } from './ticket-categories.controller';
import { CategoriesService } from './ticket-categories.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class TicketCategoriesModule {}
