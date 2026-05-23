import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { KnowledgeService } from './knowledge.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Knowledge')
@ApiBearerAuth()
@Controller('knowledge')
export class KnowledgeController {
  constructor(private readonly service: KnowledgeService) {}

  // ─── Categories ─────────────────────────────────────

  @Public()
  @Get('categories')
  findAllCategories() {
    return this.service.findAllCategories();
  }

  @Post('categories')
  createCategory(@Body('name') name: string) {
    return this.service.createCategory(name);
  }

  @Delete('categories/:id')
  removeCategory(@Param('id') id: string) {
    return this.service.removeCategory(id);
  }

  // ─── Articles ───────────────────────────────────────

  @Public()
  @Get('articles')
  findAllArticles() {
    return this.service.findAllArticles();
  }

  @Public()
  @Get('articles/:id')
  findArticle(@Param('id') id: string) {
    return this.service.findArticle(id);
  }

  @Post('articles')
  createArticle(@Body() body: { title: string; content: string; categoryId?: string; authorId: string }) {
    return this.service.createArticle(body);
  }

  @Patch('articles/:id')
  updateArticle(@Param('id') id: string, @Body() body: { title?: string; content?: string; categoryId?: string }) {
    return this.service.updateArticle(id, body);
  }

  @Delete('articles/:id')
  removeArticle(@Param('id') id: string) {
    return this.service.removeArticle(id);
  }

  // ─── Versions ───────────────────────────────────────

  @Get('articles/:id/versions')
  findVersions(@Param('id') id: string) {
    return this.service.findVersions(id);
  }

  @Post('articles/:id/versions/:versionId/restore')
  restoreVersion(@Param('id') id: string, @Param('versionId') versionId: string) {
    return this.service.restoreVersion(id, versionId);
  }
}
