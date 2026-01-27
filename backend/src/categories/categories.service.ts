import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      return await this.prisma.category.findMany({
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      this.logger.error('Failed to fetch categories', error);
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }
}
