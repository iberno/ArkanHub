import {
  Controller,
  Get,
  Post,
  Param,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { AttachmentsService } from './attachments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tickets - Anexos')
@Controller('tickets/:ticketId/attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar anexos do ticket' })
  async findAll(@Param('ticketId', ParseUUIDPipe) ticketId: string) {
    return this.attachmentsService.findAll(ticketId);
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload de anexo' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async upload(
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: string },
  ) {
    return this.attachmentsService.create({
      ticketId,
      uploadedBy: user.id,
      fileName: file.originalname,
      filePath: file.path,
    });
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download de anexo' })
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const attachment = await this.attachmentsService.findOne(id);
    res.download(attachment.filePath, attachment.fileName);
  }
}
