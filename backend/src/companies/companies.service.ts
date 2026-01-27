import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Service responsible for company-related business logic
 */
@Injectable()
export class CompaniesService {
  private readonly logger = new Logger(CompaniesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Retrieves all companies with their associated categories
   * @returns Promise<Company[]> List of all companies
   * @throws InternalServerErrorException if database query fails
   */
  async findAll(search?: string) {
    try {
      const where: any = {};
      
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      return await this.prisma.company.findMany({ 
        where,
        include: { category: true },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      this.logger.error('Failed to fetch companies', error);
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
        include: { 
          category: true,
          jobOffers: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
          },
          advertisements: {
            where: { 
              isActive: true,
              startDate: { lte: new Date() },
              endDate: { gte: new Date() },
            },
            orderBy: { createdAt: 'desc' },
          },
        } 
      });
    } catch (error) {
      this.logger.error(`Failed to fetch company with ID ${id}`, error);
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
      this.logger.error(`Failed to fetch companies for category ${categoryId}`, error);
      throw new InternalServerErrorException('Failed to fetch companies by category');
    }
  }

  /**
   * Retrieves all companies belonging to a specific category by slug
   * @param categorySlug - The category slug
   * @returns Promise<Company[]> List of companies in the category with average ratings
   * @throws InternalServerErrorException if database query fails
   */
  async findByCategorySlug(categorySlug: string) {
    try {
      const companies = await this.prisma.company.findMany({
        where: {
          category: {
            slug: categorySlug,
          },
        },
        include: { 
          category: true,
          reviews: {
            select: {
              id: true,
              rating: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      // Calculate average rating for each company
      return companies.map(company => {
        const totalRating = company.reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = company.reviews.length > 0 ? totalRating / company.reviews.length : 0;
        
        return {
          ...company,
          averageRating: parseFloat(averageRating.toFixed(2)),
          reviewCount: company.reviews.length,
        };
      });
    } catch (error) {
      this.logger.error(`Failed to fetch companies for category slug ${categorySlug}`, error);
      throw new InternalServerErrorException('Failed to fetch companies by category slug');
    }
  }

  /**
   * Retrieves a single company by its slug
   * @param slug - The company slug
   * @returns Promise<Company | null> The company if found, null otherwise
   * @throws InternalServerErrorException if database query fails
   */
  async findBySlug(slug: string) {
    try {
      return await this.prisma.company.findUnique({ 
        where: { slug }, 
        include: { 
          category: true,
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          jobOffers: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
          },
          advertisements: {
            where: { 
              isActive: true,
              startDate: { lte: new Date() },
              endDate: { gte: new Date() },
            },
            orderBy: { createdAt: 'desc' },
          },
        } 
      });
    } catch (error) {
      this.logger.error(`Failed to fetch company with slug ${slug}`, error);
      throw new InternalServerErrorException('Failed to fetch company');
    }
  }

  /**
   * Retrieves top 10 companies sorted by average rating
   * @returns Promise<Company[]> List of top rated companies
   * @throws InternalServerErrorException if database query fails
   */
  async findBestCompanies() {
    try {
      const companies = await this.prisma.company.findMany({
        include: { 
          category: true,
          reviews: {
            select: {
              id: true,
              rating: true,
            },
          },
        },
      });

      // Calculate average rating for each company
      const companiesWithRatings = companies.map(company => {
        const totalRating = company.reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = company.reviews.length > 0 ? totalRating / company.reviews.length : 0;
        
        return {
          ...company,
          averageRating: parseFloat(averageRating.toFixed(2)),
          reviewCount: company.reviews.length,
        };
      });

      // Sort by average rating and get top 10
      return companiesWithRatings
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 10);
    } catch (error) {
      this.logger.error('Failed to fetch best companies', error);
      throw new InternalServerErrorException('Failed to fetch best companies');
    }
  }
}
