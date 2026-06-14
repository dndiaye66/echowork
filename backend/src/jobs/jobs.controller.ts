import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query('q') q?: string,
    @Query('categoryId') categoryId?: string,
    @Query('limit') limit?: string,
  ) {
    const where: any = { isActive: true };

    if (q?.trim()) {
      where.OR = [
        { title: { contains: q.trim(), mode: 'insensitive' } },
        { description: { contains: q.trim(), mode: 'insensitive' } },
        { location: { contains: q.trim(), mode: 'insensitive' } },
        { company: { name: { contains: q.trim(), mode: 'insensitive' } } },
      ];
    }

    if (categoryId) {
      where.company = { ...(where.company ?? {}), categoryId: parseInt(categoryId, 10) };
    }

    return this.prisma.jobOffer.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            imageUrl: true,
            ville: true,
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? parseInt(limit, 10) : 50,
    });
  }
}
