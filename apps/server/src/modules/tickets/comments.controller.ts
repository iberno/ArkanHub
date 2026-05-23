import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tickets - Comentários')
@Controller('tickets/:ticketId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar comentários do ticket' })
  async findAll(@Param('ticketId', ParseUUIDPipe) ticketId: string) {
    return this.commentsService.findAll(ticketId);
  }

  @Post()
  @ApiOperation({ summary: 'Adicionar comentário' })
  async create(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @Body('comment') comment: string,
    @Body('internal') internal: boolean,
    @CurrentUser() user: { id: string },
  ) {
    return this.commentsService.create({
      ticketId,
      userId: user.id,
      comment,
      internal: internal ?? false,
    });
  }
}
