import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new review
   * @param userId - ID of the user creating the review
   * @param createReviewDto - Review data
   * @returns Created review
   */
  async create(userId: number, createReviewDto: CreateReviewDto) {
    try {
      // Verify company exists
      const company = await this.prisma.company.findUnique({
        where: { id: createReviewDto.companyId },
      });

      if (!company) {
        throw new NotFoundException(
          `Company with ID ${createReviewDto.companyId} not found`,
        );
      }

      const review = await this.prisma.review.create({
        data: {
          rating: createReviewDto.rating,
          comment: createReviewDto.comment,
          userId,
          companyId: createReviewDto.companyId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      return review;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to create review', error);
      throw new InternalServerErrorException('Failed to create review');
    }
  }

  /**
   * Get all reviews for a company
   * @param companyId - Company ID
   * @param rating - Optional rating filter
   * @returns Array of reviews
   */
  async findByCompany(companyId: number, rating?: number) {
    try {
      const where: any = { companyId };
      if (rating) {
        where.rating = rating;
      }

      const reviews = await this.prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return reviews;
    } catch (error) {
      this.logger.error(
        `Failed to fetch reviews for company ${companyId}`,
        error,
      );
      throw new InternalServerErrorException('Failed to fetch reviews');
    }
  }

  /**
   * Get a single review by ID
   * @param id - Review ID
   * @returns Review object
   */
  async findOne(id: number) {
    try {
      const review = await this.prisma.review.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      return review;
    } catch (error) {
      this.logger.error(`Failed to fetch review with ID ${id}`, error);
      throw new InternalServerErrorException('Failed to fetch review');
    }
  }

  /**
   * Update review votes (upvote/downvote)
   * @param id - Review ID
   * @param type - 'upvote' or 'downvote'
   * @returns Updated review
   */
  async vote(id: number, type: 'upvote' | 'downvote') {
    try {
      const review = await this.prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        throw new NotFoundException(`Review with ID ${id} not found`);
      }

      const updateData =
        type === 'upvote'
          ? { upvotes: review.upvotes + 1 }
          : { downvotes: review.downvotes + 1 };

      const updatedReview = await this.prisma.review.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      return updatedReview;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to vote on review ${id}`, error);
      throw new InternalServerErrorException('Failed to vote on review');
    }
  }

  /**
   * Delete a review (only by owner or admin)
   * @param id - Review ID
   * @param userId - User ID attempting deletion
   * @param userRole - User role
   */
  async delete(id: number, userId: number, userRole: string) {
    try {
      const review = await this.prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        throw new NotFoundException(`Review with ID ${id} not found`);
      }

      // Check if user is owner or admin
      if (review.userId !== userId && userRole !== 'ADMIN') {
        throw new ForbiddenException(
          'You do not have permission to delete this review',
        );
      }

      await this.prisma.review.delete({
        where: { id },
      });

      return { message: 'Review deleted successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(`Failed to delete review ${id}`, error);
      throw new InternalServerErrorException('Failed to delete review');
    }
  }
}
