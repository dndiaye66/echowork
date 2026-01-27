import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
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

  /**
   * Get category details with companies, job offers, and KPIs
   * This endpoint returns:
   * - Most rated companies in the category
   * - Company reviews/comments
   * - Job offers for the category
   * - KPIs and statistics
   * - Active advertisements
   */
  async getCategoryDetails(categoryId: number) {
    try {
      // Get category
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }

      // Get companies in category with their reviews
      const companies = await this.prisma.company.findMany({
        where: { categoryId },
        include: {
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
            orderBy: [
              { upvotes: 'desc' },
              { createdAt: 'desc' },
            ],
          },
        },
      });

      // Calculate average rating for each company and sort by rating
      const companiesWithRatings = companies.map(company => {
        const totalRating = company.reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = company.reviews.length > 0 ? totalRating / company.reviews.length : 0;
        const reviewCount = company.reviews.length;
        
        return {
          ...company,
          averageRating,
          reviewCount,
        };
      });

      // Sort by average rating (descending) and review count
      const sortedCompanies = companiesWithRatings.sort((a, b) => {
        if (b.averageRating !== a.averageRating) {
          return b.averageRating - a.averageRating;
        }
        return b.reviewCount - a.reviewCount;
      });

      // Get top 10 most rated companies
      const topCompanies = sortedCompanies.slice(0, 10);

      // Get all job offers for this category
      const jobOffers = await this.prisma.jobOffer.findMany({
        where: {
          company: {
            categoryId,
          },
          isActive: true,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20, // Limit to 20 most recent job offers
      });

      // Get active advertisements for this category
      const advertisements = await this.prisma.advertisement.findMany({
        where: {
          company: {
            categoryId,
          },
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      // Calculate KPIs
      const totalCompanies = companies.length;
      const totalReviews = companies.reduce((sum, c) => sum + c.reviews.length, 0);
      const totalJobOffers = jobOffers.length;
      const averageCategoryRating = totalCompanies > 0 
        ? companiesWithRatings.reduce((sum, c) => sum + c.averageRating, 0) / totalCompanies 
        : 0;

      // Get review distribution
      const reviewDistribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      companies.forEach(company => {
        company.reviews.forEach(review => {
          reviewDistribution[review.rating as keyof typeof reviewDistribution]++;
        });
      });

      return {
        category,
        topCompanies,
        jobOffers,
        advertisements,
        kpis: {
          totalCompanies,
          totalReviews,
          totalJobOffers,
          averageRating: parseFloat(averageCategoryRating.toFixed(2)),
          reviewDistribution,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to fetch category details for ID ${categoryId}`, error);
      throw new InternalServerErrorException('Failed to fetch category details');
    }
  }

  /**
   * Search companies within a category
   */
  async searchInCategory(categoryId: number, searchQuery: string) {
    try {
      // Return empty array if query is too short
      if (!searchQuery || searchQuery.trim().length < 2) {
        return [];
      }

      const companies = await this.prisma.company.findMany({
        where: {
          categoryId,
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
            { ville: { contains: searchQuery, mode: 'insensitive' } },
            { activite: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        include: {
          category: true,
          reviews: {
            select: {
              id: true,
              rating: true,
              createdAt: true,
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
      this.logger.error(`Failed to search in category ${categoryId}`, error);
      throw new InternalServerErrorException('Failed to search companies');
    }
  }
}
