import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ===== COMPANIES =====

  async createCompany(createCompanyDto: CreateCompanyDto) {
    try {
      // Check if slug already exists
      const existingCompany = await this.prisma.company.findUnique({
        where: { slug: createCompanyDto.slug },
      });

      if (existingCompany) {
        throw new ConflictException('Company with this slug already exists');
      }

      const company = await this.prisma.company.create({
        data: createCompanyDto,
        include: { category: true },
      });

      return company;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('Failed to create company', error);
      throw new InternalServerErrorException('Failed to create company');
    }
  }

  async updateCompany(id: number, updateCompanyDto: UpdateCompanyDto) {
    try {
      const company = await this.prisma.company.findUnique({ where: { id } });

      if (!company) {
        throw new NotFoundException(`Company with ID ${id} not found`);
      }

      // Check if new slug already exists
      if (updateCompanyDto.slug && updateCompanyDto.slug !== company.slug) {
        const existingCompany = await this.prisma.company.findUnique({
          where: { slug: updateCompanyDto.slug },
        });

        if (existingCompany) {
          throw new ConflictException('Company with this slug already exists');
        }
      }

      const updatedCompany = await this.prisma.company.update({
        where: { id },
        data: updateCompanyDto,
        include: { category: true },
      });

      return updatedCompany;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Failed to update company ${id}`, error);
      throw new InternalServerErrorException('Failed to update company');
    }
  }

  async deleteCompany(id: number) {
    try {
      const company = await this.prisma.company.findUnique({ where: { id } });

      if (!company) {
        throw new NotFoundException(`Company with ID ${id} not found`);
      }

      await this.prisma.company.delete({ where: { id } });

      return { message: 'Company deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete company ${id}`, error);
      throw new InternalServerErrorException('Failed to delete company');
    }
  }

  // ===== JOB OFFERS =====

  async createJobOffer(createJobOfferDto: CreateJobOfferDto) {
    try {
      // Verify company exists
      const company = await this.prisma.company.findUnique({
        where: { id: createJobOfferDto.companyId },
      });

      if (!company) {
        throw new NotFoundException(
          `Company with ID ${createJobOfferDto.companyId} not found`,
        );
      }

      const jobOffer = await this.prisma.jobOffer.create({
        data: createJobOfferDto,
        include: { company: true },
      });

      return jobOffer;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to create job offer', error);
      throw new InternalServerErrorException('Failed to create job offer');
    }
  }

  async getJobOffers(companyId?: number) {
    try {
      const where = companyId ? { companyId } : {};
      return await this.prisma.jobOffer.findMany({
        where,
        include: { company: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error('Failed to fetch job offers', error);
      throw new InternalServerErrorException('Failed to fetch job offers');
    }
  }

  async updateJobOffer(id: number, data: Partial<CreateJobOfferDto>) {
    try {
      const jobOffer = await this.prisma.jobOffer.findUnique({ where: { id } });

      if (!jobOffer) {
        throw new NotFoundException(`Job offer with ID ${id} not found`);
      }

      return await this.prisma.jobOffer.update({
        where: { id },
        data,
        include: { company: true },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update job offer ${id}`, error);
      throw new InternalServerErrorException('Failed to update job offer');
    }
  }

  async deleteJobOffer(id: number) {
    try {
      const jobOffer = await this.prisma.jobOffer.findUnique({ where: { id } });

      if (!jobOffer) {
        throw new NotFoundException(`Job offer with ID ${id} not found`);
      }

      await this.prisma.jobOffer.delete({ where: { id } });

      return { message: 'Job offer deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete job offer ${id}`, error);
      throw new InternalServerErrorException('Failed to delete job offer');
    }
  }

  // ===== ADVERTISEMENTS =====

  async createAdvertisement(createAdvertisementDto: CreateAdvertisementDto) {
    try {
      // Verify company exists if companyId is provided
      if (createAdvertisementDto.companyId) {
        const company = await this.prisma.company.findUnique({
          where: { id: createAdvertisementDto.companyId },
        });

        if (!company) {
          throw new NotFoundException(
            `Company with ID ${createAdvertisementDto.companyId} not found`,
          );
        }
      }

      const advertisement = await this.prisma.advertisement.create({
        data: {
          ...createAdvertisementDto,
          startDate: new Date(createAdvertisementDto.startDate),
          endDate: new Date(createAdvertisementDto.endDate),
        },
        include: { company: true },
      });

      return advertisement;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to create advertisement', error);
      throw new InternalServerErrorException('Failed to create advertisement');
    }
  }

  async getAdvertisements(companyId?: number, isActive?: boolean) {
    try {
      const where: any = {};
      if (companyId !== undefined) {
        where.companyId = companyId;
      }
      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      return await this.prisma.advertisement.findMany({
        where,
        include: { company: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error('Failed to fetch advertisements', error);
      throw new InternalServerErrorException('Failed to fetch advertisements');
    }
  }

  async updateAdvertisement(id: number, data: Partial<CreateAdvertisementDto>) {
    try {
      const advertisement = await this.prisma.advertisement.findUnique({ where: { id } });

      if (!advertisement) {
        throw new NotFoundException(`Advertisement with ID ${id} not found`);
      }

      const updateData: any = { ...data };
      if (data.startDate) {
        updateData.startDate = new Date(data.startDate);
      }
      if (data.endDate) {
        updateData.endDate = new Date(data.endDate);
      }

      return await this.prisma.advertisement.update({
        where: { id },
        data: updateData,
        include: { company: true },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update advertisement ${id}`, error);
      throw new InternalServerErrorException('Failed to update advertisement');
    }
  }

  async deleteAdvertisement(id: number) {
    try {
      const advertisement = await this.prisma.advertisement.findUnique({ where: { id } });

      if (!advertisement) {
        throw new NotFoundException(`Advertisement with ID ${id} not found`);
      }

      await this.prisma.advertisement.delete({ where: { id } });

      return { message: 'Advertisement deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete advertisement ${id}`, error);
      throw new InternalServerErrorException('Failed to delete advertisement');
    }
  }

  // ===== DASHBOARD STATISTICS =====

  async getDashboardStats() {
    try {
      const [
        totalUsers,
        totalCompanies,
        totalReviews,
        approvedReviews,
        pendingReviews,
        totalJobOffers,
        totalAdvertisements,
        activeAdvertisements,
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.company.count(),
        this.prisma.review.count(),
        this.prisma.review.count({ where: { status: 'APPROVED' } }),
        this.prisma.review.count({ where: { status: 'PENDING' } }),
        this.prisma.jobOffer.count(),
        this.prisma.advertisement.count(),
        this.prisma.advertisement.count({ where: { isActive: true } }),
      ]);

      // Get average rating across all companies
      const reviews = await this.prisma.review.findMany({
        where: { status: 'APPROVED' },
        select: { rating: true },
      });
      const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
      
      const formattedAvgRating = isNaN(averageRating) || averageRating === null 
        ? 0 
        : parseFloat(averageRating.toFixed(2));

      // Get recent activities
      const recentReviews = await this.prisma.review.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { username: true } },
          company: { select: { name: true } },
        },
      });

      const recentUsers = await this.prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, username: true, email: true, role: true, createdAt: true },
      });

      return {
        stats: {
          totalUsers,
          totalCompanies,
          totalReviews,
          approvedReviews,
          pendingReviews,
          totalJobOffers,
          totalAdvertisements,
          activeAdvertisements,
          averageRating: formattedAvgRating,
        },
        recentReviews,
        recentUsers,
      };
    } catch (error) {
      this.logger.error('Failed to fetch dashboard stats', error);
      throw new InternalServerErrorException('Failed to fetch dashboard stats');
    }
  }

  // ===== USERS MANAGEMENT =====

  async getUsers() {
    try {
      return await this.prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          role: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              reviews: true,
              claimedCompanies: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error('Failed to fetch users', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async updateUserRole(id: number, role: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      if (!['USER', 'ADMIN', 'MODERATOR'].includes(role)) {
        throw new ConflictException('Invalid role. Must be USER, ADMIN, or MODERATOR');
      }

      return await this.prisma.user.update({
        where: { id },
        data: { role: role as any },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Failed to update user role ${id}`, error);
      throw new InternalServerErrorException('Failed to update user role');
    }
  }

  async deleteUser(id: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      await this.prisma.user.delete({ where: { id } });

      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete user ${id}`, error);
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  // ===== REVIEWS MODERATION =====

  async getPendingReviews() {
    try {
      return await this.prisma.review.findMany({
        where: { status: 'PENDING' },
        include: {
          user: { select: { id: true, username: true, email: true } },
          company: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error('Failed to fetch pending reviews', error);
      throw new InternalServerErrorException('Failed to fetch pending reviews');
    }
  }

  async approveReview(id: number) {
    try {
      const review = await this.prisma.review.findUnique({ where: { id } });

      if (!review) {
        throw new NotFoundException(`Review with ID ${id} not found`);
      }

      return await this.prisma.review.update({
        where: { id },
        data: { status: 'APPROVED' },
        include: {
          user: { select: { username: true } },
          company: { select: { name: true } },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to approve review ${id}`, error);
      throw new InternalServerErrorException('Failed to approve review');
    }
  }

  async rejectReview(id: number) {
    try {
      const review = await this.prisma.review.findUnique({ where: { id } });

      if (!review) {
        throw new NotFoundException(`Review with ID ${id} not found`);
      }

      return await this.prisma.review.update({
        where: { id },
        data: { status: 'REJECTED' },
        include: {
          user: { select: { username: true } },
          company: { select: { name: true } },
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to reject review ${id}`, error);
      throw new InternalServerErrorException('Failed to reject review');
    }
  }

  // ===== CATEGORIES MANAGEMENT =====

  async getCategories() {
    try {
      return await this.prisma.category.findMany({
        include: {
          _count: {
            select: {
              companies: true,
              keywords: true,
            },
          },
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          children: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });
    } catch (error) {
      this.logger.error('Failed to fetch categories', error);
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  async createCategory(createCategoryDto: CreateCategoryDto) {
    try {
      // Check if slug already exists
      const existingCategory = await this.prisma.category.findUnique({
        where: { slug: createCategoryDto.slug },
      });

      if (existingCategory) {
        throw new ConflictException('Category with this slug already exists');
      }

      // Verify parent exists if provided
      if (createCategoryDto.parentId) {
        const parent = await this.prisma.category.findUnique({
          where: { id: createCategoryDto.parentId },
        });

        if (!parent) {
          throw new NotFoundException(
            `Parent category with ID ${createCategoryDto.parentId} not found`,
          );
        }
      }

      return await this.prisma.category.create({
        data: createCategoryDto,
        include: {
          parent: true,
          _count: {
            select: {
              companies: true,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to create category', error);
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  async updateCategory(id: number, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.prisma.category.findUnique({ where: { id } });

      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      // Check if new slug already exists
      if (updateCategoryDto.slug && updateCategoryDto.slug !== category.slug) {
        const existingCategory = await this.prisma.category.findUnique({
          where: { slug: updateCategoryDto.slug },
        });

        if (existingCategory) {
          throw new ConflictException('Category with this slug already exists');
        }
      }

      // Verify parent exists if provided
      if (updateCategoryDto.parentId) {
        const parent = await this.prisma.category.findUnique({
          where: { id: updateCategoryDto.parentId },
        });

        if (!parent) {
          throw new NotFoundException(
            `Parent category with ID ${updateCategoryDto.parentId} not found`,
          );
        }

        // Prevent circular references
        if (updateCategoryDto.parentId === id) {
          throw new BadRequestException('A category cannot be its own parent');
        }
      }

      return await this.prisma.category.update({
        where: { id },
        data: updateCategoryDto,
        include: {
          parent: true,
          _count: {
            select: {
              companies: true,
            },
          },
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(`Failed to update category ${id}`, error);
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  async deleteCategory(id: number) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              companies: true,
              children: true,
            },
          },
        },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      // Prevent deletion if category has companies
      if (category._count.companies > 0) {
        throw new BadRequestException(
          `Cannot delete category with ${category._count.companies} companies. Please reassign them first.`,
        );
      }

      // Prevent deletion if category has children
      if (category._count.children > 0) {
        throw new BadRequestException(
          `Cannot delete category with ${category._count.children} subcategories. Please delete or reassign them first.`,
        );
      }

      await this.prisma.category.delete({ where: { id } });

      return { message: 'Category deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Failed to delete category ${id}`, error);
      throw new InternalServerErrorException('Failed to delete category');
    }
  }

  // ===== ADVANCED USER MANAGEMENT =====

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Hash password if provided
      const updateData: any = { ...updateUserDto };
      if (updateUserDto.password) {
        updateData.password = await bcrypt.hash(updateUserDto.password, 10);
      }

      // Check if email is being changed and is already in use
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.prisma.user.findUnique({
          where: { email: updateUserDto.email },
        });

        if (existingUser) {
          throw new ConflictException('Email already in use');
        }
      }

      // Check if username is being changed and is already in use
      if (updateUserDto.username && updateUserDto.username !== user.username) {
        const existingUser = await this.prisma.user.findUnique({
          where: { username: updateUserDto.username },
        });

        if (existingUser) {
          throw new ConflictException('Username already in use');
        }
      }

      return await this.prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          role: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Failed to update user ${id}`, error);
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async activateUser(id: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return await this.prisma.user.update({
        where: { id },
        data: { isVerified: true },
        select: {
          id: true,
          username: true,
          email: true,
          isVerified: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to activate user ${id}`, error);
      throw new InternalServerErrorException('Failed to activate user');
    }
  }

  async deactivateUser(id: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return await this.prisma.user.update({
        where: { id },
        data: { isVerified: false },
        select: {
          id: true,
          username: true,
          email: true,
          isVerified: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to deactivate user ${id}`, error);
      throw new InternalServerErrorException('Failed to deactivate user');
    }
  }

  async resetUserPassword(id: number) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      await this.prisma.user.update({
        where: { id },
        data: { password: hashedPassword },
      });

      return {
        message: 'Password reset successfully',
        temporaryPassword: tempPassword,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to reset password for user ${id}`, error);
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  // ===== ANALYTICS AND REPORTS =====

  async getUserAnalytics(period?: string) {
    try {
      const now = new Date();
      let startDate: Date;

      switch (period) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0); // All time
      }

      const users = await this.prisma.user.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      // Group by date
      const usersByDate = users.reduce((acc, user) => {
        const date = user.createdAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalUsers: users.length,
        usersByDate,
        period: period || 'all',
      };
    } catch (error) {
      this.logger.error('Failed to fetch user analytics', error);
      throw new InternalServerErrorException('Failed to fetch user analytics');
    }
  }

  async getCompanyAnalytics() {
    try {
      const totalCompanies = await this.prisma.company.count();
      const verifiedCompanies = await this.prisma.company.count({
        where: { isVerified: true },
      });
      const claimedCompanies = await this.prisma.company.count({
        where: { claimedByUserId: { not: null } },
      });

      // Get companies by category
      const companiesByCategory = await this.prisma.category.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              companies: true,
            },
          },
        },
        orderBy: {
          companies: {
            _count: 'desc',
          },
        },
      });

      return {
        totalCompanies,
        verifiedCompanies,
        claimedCompanies,
        companiesByCategory,
      };
    } catch (error) {
      this.logger.error('Failed to fetch company analytics', error);
      throw new InternalServerErrorException('Failed to fetch company analytics');
    }
  }

  async getReviewAnalytics() {
    try {
      const totalReviews = await this.prisma.review.count();
      const approvedReviews = await this.prisma.review.count({
        where: { status: 'APPROVED' },
      });
      const pendingReviews = await this.prisma.review.count({
        where: { status: 'PENDING' },
      });
      const rejectedReviews = await this.prisma.review.count({
        where: { status: 'REJECTED' },
      });

      // Get rating distribution
      const reviews = await this.prisma.review.findMany({
        select: { rating: true },
      });

      const ratingDistribution = reviews.reduce(
        (acc, review) => {
          acc[review.rating] = (acc[review.rating] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>,
      );

      return {
        totalReviews,
        approvedReviews,
        pendingReviews,
        rejectedReviews,
        ratingDistribution,
      };
    } catch (error) {
      this.logger.error('Failed to fetch review analytics', error);
      throw new InternalServerErrorException('Failed to fetch review analytics');
    }
  }

  async getTopCompanies(limit: number = 10) {
    try {
      const companies = await this.prisma.company.findMany({
        include: {
          reviews: {
            where: { status: 'APPROVED' },
            select: { rating: true },
          },
          category: {
            select: { name: true },
          },
        },
      });

      // Calculate average rating for each company
      const companiesWithRatings = companies
        .map((company) => {
          const totalRating = company.reviews.reduce(
            (sum, review) => sum + review.rating,
            0,
          );
          const averageRating =
            company.reviews.length > 0 ? totalRating / company.reviews.length : 0;

          return {
            id: company.id,
            name: company.name,
            slug: company.slug,
            category: company.category.name,
            averageRating: parseFloat(averageRating.toFixed(2)),
            reviewCount: company.reviews.length,
          };
        })
        .filter((c) => c.reviewCount > 0)
        .sort((a, b) => {
          if (b.averageRating !== a.averageRating) {
            return b.averageRating - a.averageRating;
          }
          return b.reviewCount - a.reviewCount;
        })
        .slice(0, limit);

      return companiesWithRatings;
    } catch (error) {
      this.logger.error('Failed to fetch top companies', error);
      throw new InternalServerErrorException('Failed to fetch top companies');
    }
  }

  async getTopCategories(limit: number = 10) {
    try {
      const categories = await this.prisma.category.findMany({
        include: {
          companies: {
            include: {
              reviews: {
                where: { status: 'APPROVED' },
                select: { rating: true },
              },
            },
          },
        },
      });

      const categoriesWithStats = categories
        .map((category) => {
          const totalCompanies = category.companies.length;
          const totalReviews = category.companies.reduce(
            (sum, c) => sum + c.reviews.length,
            0,
          );

          return {
            id: category.id,
            name: category.name,
            slug: category.slug,
            totalCompanies,
            totalReviews,
          };
        })
        .filter((c) => c.totalCompanies > 0)
        .sort((a, b) => {
          if (b.totalReviews !== a.totalReviews) {
            return b.totalReviews - a.totalReviews;
          }
          return b.totalCompanies - a.totalCompanies;
        })
        .slice(0, limit);

      return categoriesWithStats;
    } catch (error) {
      this.logger.error('Failed to fetch top categories', error);
      throw new InternalServerErrorException('Failed to fetch top categories');
    }
  }

  // ===== DATA EXPORT =====

  async exportUsers() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          role: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: {
              reviews: true,
              claimedCompanies: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return users.map((user) => ({
        ID: user.id,
        Username: user.username,
        Email: user.email,
        Phone: user.phone || 'N/A',
        Role: user.role,
        Verified: user.isVerified ? 'Yes' : 'No',
        'Reviews Count': user._count.reviews,
        'Claimed Companies': user._count.claimedCompanies,
        'Created At': user.createdAt.toISOString(),
      }));
    } catch (error) {
      this.logger.error('Failed to export users', error);
      throw new InternalServerErrorException('Failed to export users');
    }
  }

  async exportCompanies() {
    try {
      const companies = await this.prisma.company.findMany({
        include: {
          category: {
            select: { name: true },
          },
          _count: {
            select: {
              reviews: true,
              jobOffers: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return companies.map((company) => ({
        ID: company.id,
        Name: company.name,
        Slug: company.slug,
        Category: company.category.name,
        City: company.ville || 'N/A',
        Address: company.adresse || 'N/A',
        Phone: company.tel || 'N/A',
        NINEA: company.ninea || 'N/A',
        Verified: company.isVerified ? 'Yes' : 'No',
        'Reviews Count': company._count.reviews,
        'Job Offers': company._count.jobOffers,
        'Created At': company.createdAt.toISOString(),
      }));
    } catch (error) {
      this.logger.error('Failed to export companies', error);
      throw new InternalServerErrorException('Failed to export companies');
    }
  }

  async exportReviews() {
    try {
      const reviews = await this.prisma.review.findMany({
        include: {
          user: {
            select: { username: true, email: true },
          },
          company: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return reviews.map((review) => ({
        ID: review.id,
        Company: review.company.name,
        User: review.user.username,
        'User Email': review.user.email,
        Rating: review.rating,
        Comment: review.comment,
        Context: review.context,
        Status: review.status,
        Upvotes: review.upvotes,
        Downvotes: review.downvotes,
        'Created At': review.createdAt.toISOString(),
      }));
    } catch (error) {
      this.logger.error('Failed to export reviews', error);
      throw new InternalServerErrorException('Failed to export reviews');
    }
  }
}
