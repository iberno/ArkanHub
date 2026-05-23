import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class KnowledgeService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Categories ─────────────────────────────────────

  async findAllCategories() {
    return this.prisma.knowledgeCategory.findMany({
      include: { _count: { select: { articles: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async createCategory(name: string) {
    return this.prisma.knowledgeCategory.create({ data: { name } });
  }

  async removeCategory(id: string) {
    await this.prisma.knowledgeCategory.findUniqueOrThrow({ where: { id } }).catch(() => {
      throw new NotFoundException('Categoria não encontrada');
    });
    return this.prisma.knowledgeCategory.delete({ where: { id } });
  }

  // ─── Articles ───────────────────────────────────────

  async findAllArticles(categoryId?: string) {
    return this.prisma.knowledgeArticle.findMany({
      where: categoryId ? { categoryId } : undefined,
      include: { category: true, author: { select: { id: true, name: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findArticle(id: string) {
    const article = await this.prisma.knowledgeArticle.findUnique({
      where: { id },
      include: {
        category: true,
        author: { select: { id: true, name: true } },
        versions: { orderBy: { version: 'desc' }, take: 10 },
      },
    });
    if (!article) throw new NotFoundException('Artigo não encontrado');
    return article;
  }

  async createArticle(data: { title: string; content: string; categoryId?: string; authorId: string }) {
    const article = await this.prisma.knowledgeArticle.create({
      data: { title: data.title, content: data.content, categoryId: data.categoryId, authorId: data.authorId },
    });
    await this.prisma.knowledgeVersion.create({
      data: { articleId: article.id, content: data.content, version: 1 },
    });
    return this.findArticle(article.id);
  }

  async updateArticle(id: string, data: { title?: string; content?: string; categoryId?: string }) {
    const article = await this.prisma.knowledgeArticle.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Artigo não encontrado');

    if (data.content && data.content !== article.content) {
      const latest = await this.prisma.knowledgeVersion.findFirst({
        where: { articleId: id },
        orderBy: { version: 'desc' },
      });
      await this.prisma.knowledgeVersion.create({
        data: { articleId: id, content: data.content, version: (latest?.version ?? 0) + 1 },
      });
    }

    return this.prisma.knowledgeArticle.update({ where: { id }, data });
  }

  async removeArticle(id: string) {
    await this.prisma.knowledgeArticle.findUniqueOrThrow({ where: { id } }).catch(() => {
      throw new NotFoundException('Artigo não encontrado');
    });
    await this.prisma.knowledgeVersion.deleteMany({ where: { articleId: id } });
    return this.prisma.knowledgeArticle.delete({ where: { id } });
  }

  // ─── Versions ───────────────────────────────────────

  async findVersions(articleId: string) {
    return this.prisma.knowledgeVersion.findMany({
      where: { articleId },
      orderBy: { version: 'desc' },
    });
  }

  async restoreVersion(articleId: string, versionId: string) {
    const version = await this.prisma.knowledgeVersion.findFirst({ where: { id: versionId, articleId } });
    if (!version) throw new NotFoundException('Versão não encontrada');

    return this.updateArticle(articleId, { content: version.content });
  }
}
