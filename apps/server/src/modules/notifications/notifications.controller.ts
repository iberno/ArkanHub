import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  findByUser(@Req() req: any) {
    return this.service.findByUser(req.user.id);
  }

  @Get('unread/count')
  countUnread(@Req() req: any) {
    return this.service.countUnread(req.user.id);
  }

  @Post()
  create(@Body() body: { userId: string; title: string; body: string; type?: string }) {
    return this.service.create(body);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @Req() req: any) {
    return this.service.markRead(id, req.user.id);
  }

  @Patch('read-all')
  markAllRead(@Req() req: any) {
    return this.service.markAllRead(req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user.id);
  }
}
