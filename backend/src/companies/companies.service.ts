import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service responsible for company-related business logic
 */
@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Retrieves all companies with their associated categories
   * @returns Promise<Company[]> List of all companies
   * @throws InternalServerErrorException if database query fails
   */
  async findAll() {
    try {
      return await this.prisma.company.findMany({ include: { category: true } });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch companies');
    }
  }

  /**
   * Retrieves a single company by its ID
   * @param id - The company ID
   * @returns Promise<Company | null> The company if found, null otherwise
   * @throws InternalServerErrorException if database query fails
   */
  async findById(id: number) {
    try {
      return await this.prisma.company.findUnique({ 
        where: { id }, 
        include: { category: true } 
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch company');
    }
  }

  /**
   * Retrieves all companies belonging to a specific category
   * @param categoryId - The category ID
   * @returns Promise<Company[]> List of companies in the category
   * @throws InternalServerErrorException if database query fails
   */
  async findByCategory(categoryId: number) {
    try {
      return await this.prisma.company.findMany({ 
        where: { categoryId }, 
        include: { category: true } 
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch companies by category');
    }
  }
}
