import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCompanyProfileDto } from './dto/update-company-profile.dto';

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
   * Search companies with intelligent matching and rating support
   * Supports both direct search (e.g., "Banque") and rating-based search (e.g., "meilleur restaurant")
   * @param query - Search query
   * @param limit - Maximum number of results (default: 10)
   * @returns Promise<Company[]> List of matching companies with ratings
   * @throws InternalServerErrorException if database query fails
   */
  async searchWithAutocomplete(query: string, limit: number = 10) {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const searchQuery = query.trim().toLowerCase();
      
      // Check if query contains rating keywords
      const ratingKeywords = ['meilleur', 'meilleurs', 'meilleures', 'top', 'best'];
      const hasRatingKeyword = ratingKeywords.some(keyword => searchQuery.includes(keyword));
      
      // Extract category from query by removing rating keywords
      let categoryQuery = searchQuery;
      ratingKeywords.forEach(keyword => {
        categoryQuery = categoryQuery.replace(new RegExp(`\\b${keyword}\\b`, 'g'), '').trim();
      });

      // Build where clause
      const where: any = {
        OR: [
          { name: { contains: categoryQuery, mode: 'insensitive' } },
          { description: { contains: categoryQuery, mode: 'insensitive' } },
          { ville: { contains: categoryQuery, mode: 'insensitive' } },
          { activite: { contains: categoryQuery, mode: 'insensitive' } },
          { category: { name: { contains: categoryQuery, mode: 'insensitive' } } },
        ],
      };

      // Fetch companies with reviews
      const companies = await this.prisma.company.findMany({
        where,
        include: {
          category: true,
          reviews: {
            select: {
              id: true,
              rating: true,
            },
          },
        },
        take: hasRatingKeyword ? 100 : limit, // Get more if sorting by rating
      });

      // Calculate average ratings
      const companiesWithRatings = companies.map(company => {
        const totalRating = company.reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = company.reviews.length > 0 ? totalRating / company.reviews.length : 0;
        
        return {
          ...company,
          averageRating: parseFloat(averageRating.toFixed(2)),
          reviewCount: company.reviews.length,
        };
      });

      // Sort by rating if rating keyword is present, otherwise by name
      if (hasRatingKeyword) {
        companiesWithRatings.sort((a, b) => {
          if (b.averageRating !== a.averageRating) {
            return b.averageRating - a.averageRating;
          }
          return b.reviewCount - a.reviewCount;
        });
        return companiesWithRatings.slice(0, limit);
      }

      return companiesWithRatings;
    } catch (error) {
      this.logger.error('Failed to search companies with autocomplete', error);
      throw new InternalServerErrorException('Failed to search companies');
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

      return this.calculateAverageRatings(companies);
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
                  createdAt: true,
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
   * Uses database aggregation for better performance
   * @returns Promise<Company[]> List of top rated companies
   * @throws InternalServerErrorException if database query fails
   */
  async findBestCompanies() {
    try {
      // Use raw query for efficient aggregation at database level
      const companies = await this.prisma.$queryRaw`
        SELECT 
          c.id, c.name, c.slug, c.description, c."imageUrl", c.ville, c.adresse, c.tel, c.activite, c."categoryId",
          c."createdAt", c."updatedAt",
          COALESCE(AVG(r.rating), 0) as "averageRating",
          COUNT(r.id) as "reviewCount"
        FROM "Company" c
        LEFT JOIN "Review" r ON c.id = r."companyId"
        GROUP BY c.id
        ORDER BY "averageRating" DESC, "reviewCount" DESC
        LIMIT 10
      ` as any[];

      // Fetch category info for each company
      const companiesWithCategories = await Promise.all(
        companies.map(async (company) => {
          const category = await this.prisma.category.findUnique({
            where: { id: company.categoryId },
          });
          
          return {
            ...company,
            category,
            averageRating: parseFloat(Number(company.averageRating).toFixed(2)),
            reviewCount: Number(company.reviewCount),
          };
        })
      );

      return companiesWithCategories;
    } catch (error) {
      this.logger.error('Failed to fetch best companies', error);
      throw new InternalServerErrorException('Failed to fetch best companies');
    }
  }

  /**
   * Retrieves top 10 companies with lowest ratings
   * Uses database aggregation for better performance
   * @returns Promise<Company[]> List of worst rated companies
   * @throws InternalServerErrorException if database query fails
   */
  async findWorstCompanies() {
    try {
      // Use raw query for efficient aggregation at database level with JOIN
      const companies = await this.prisma.$queryRaw`
        SELECT 
          c.id, c.name, c.slug, c.description, c."imageUrl", c.ville, c.adresse, c.tel, c.activite, c."categoryId",
          c."createdAt", c."updatedAt",
          COALESCE(AVG(r.rating), 0) as "averageRating",
          COUNT(r.id) as "reviewCount",
          cat.id as "category_id", cat.name as "category_name", cat.slug as "category_slug",
          cat."parentId" as "category_parentId"
        FROM "Company" c
        LEFT JOIN "Review" r ON c.id = r."companyId"
        LEFT JOIN "Category" cat ON c."categoryId" = cat.id
        GROUP BY c.id, cat.id
        HAVING COUNT(r.id) > 0
        ORDER BY "averageRating" ASC, "reviewCount" DESC
        LIMIT 10
      ` as any[];

      // Map category data into nested structure
      return companies.map((company) => ({
        id: company.id,
        name: company.name,
        slug: company.slug,
        description: company.description,
        imageUrl: company.imageUrl,
        ville: company.ville,
        adresse: company.adresse,
        tel: company.tel,
        activite: company.activite,
        categoryId: company.categoryId,
        createdAt: company.createdAt,
        updatedAt: company.updatedAt,
        averageRating: parseFloat(Number(company.averageRating).toFixed(2)),
        reviewCount: Number(company.reviewCount),
        category: company.category_id ? {
          id: company.category_id,
          name: company.category_name,
          slug: company.category_slug,
          parentId: company.category_parentId,
        } : null,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch worst companies', error);
      throw new InternalServerErrorException('Failed to fetch worst companies');
    }
  }

  async claimCompany(companyId: number, userId: number) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, claimedByUserId: true, name: true },
    });

    if (!company) throw new NotFoundException('Entreprise introuvable');
    if (company.claimedByUserId) {
      throw new ConflictException('Cette entreprise a déjà été réclamée');
    }

    return this.prisma.company.update({
      where: { id: companyId },
      data: { claimedByUserId: userId },
      include: { category: true },
    });
  }

  async unclaimCompany(companyId: number, userId: number) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { claimedByUserId: true },
    });

    if (!company) throw new NotFoundException('Entreprise introuvable');
    if (company.claimedByUserId !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas propriétaire de cette fiche');
    }

    return this.prisma.company.update({
      where: { id: companyId },
      data: { claimedByUserId: null },
    });
  }

  async getMyCompanies(userId: number) {
    return this.prisma.company.findMany({
      where: { claimedByUserId: userId },
      include: {
        category: true,
        scores: true,
        photos: { orderBy: { createdAt: 'asc' } },
        _count: { select: { reviews: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async updateProfile(companyId: number, dto: UpdateCompanyProfileDto) {
    return this.prisma.company.update({
      where: { id: companyId },
      data: {
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.tel !== undefined && { tel: dto.tel }),
        ...(dto.adresse !== undefined && { adresse: dto.adresse }),
        ...(dto.ville !== undefined && { ville: dto.ville }),
        ...(dto.website !== undefined && { website: dto.website }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(dto.openingHours !== undefined && { openingHours: dto.openingHours as object }),
        ...(dto.socialLinks !== undefined && { socialLinks: dto.socialLinks as object }),
      },
      include: { category: true, photos: true, scores: true },
    });
  }

  async addPhoto(companyId: number, url: string, caption?: string) {
    const count = await this.prisma.companyPhoto.count({ where: { companyId } });
    return this.prisma.companyPhoto.create({
      data: { companyId, url, caption, isPrimary: count === 0 },
    });
  }

  async deletePhoto(companyId: number, photoId: number) {
    const photo = await this.prisma.companyPhoto.findUnique({
      where: { id: photoId },
      select: { companyId: true, isPrimary: true },
    });

    if (!photo || photo.companyId !== companyId) {
      throw new NotFoundException('Photo introuvable');
    }

    await this.prisma.companyPhoto.delete({ where: { id: photoId } });

    if (photo.isPrimary) {
      const next = await this.prisma.companyPhoto.findFirst({
        where: { companyId },
        orderBy: { createdAt: 'asc' },
      });
      if (next) {
        await this.prisma.companyPhoto.update({
          where: { id: next.id },
          data: { isPrimary: true },
        });
      }
    }

    return { success: true };
  }

  async getCompanyDashboard(companyId: number) {
    return this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        category: true,
        photos: { orderBy: { createdAt: 'asc' } },
        scores: true,
        locations: true,
        subscription: true,
        reviews: {
          where: { status: 'APPROVED' },
          include: {
            user: { select: { id: true, username: true, createdAt: true, isVerified: true } },
            reply: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        _count: { select: { reviews: true } },
      },
    });
  }

  /**
   * Helper method to calculate average ratings for companies
   * @param companies - Array of companies with reviews
   * @returns Array of companies with averageRating and reviewCount
   */
  private calculateAverageRatings(companies: any[]) {
    return companies.map(company => {
      const totalRating = company.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
      const averageRating = company.reviews.length > 0 ? totalRating / company.reviews.length : 0;
      
      return {
        ...company,
        averageRating: parseFloat(averageRating.toFixed(2)),
        reviewCount: company.reviews.length,
      };
    });
  }
}
