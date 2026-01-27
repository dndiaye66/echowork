import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.company.findMany({ include: { category: true } });
  }

  async findById(id: number) {
    return this.prisma.company.findUnique({ where: { id }, include: { category: true } });
  }

  async findByCategory(categoryId: number) {
    return this.prisma.company.findMany({ where: { categoryId }, include: { category: true } });
  }
}
