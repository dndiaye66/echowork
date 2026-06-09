import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

const userSelect = {
  id: true,
  username: true,
  createdAt: true,
};

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createReviewDto: CreateReviewDto) {
    try {
      // Check user is verified
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { isVerified: true },
      });
      if (!user?.isVerified) {
        throw new ForbiddenException(
          'Vous devez d\'abord valider votre compte via l\'email de confirmation envoyé.',
        );
      }

      const company = await this.prisma.company.findUnique({
        where: { id: createReviewDto.companyId },
      });

      if (!company) {
        throw new NotFoundException(
          `Company with ID ${createReviewDto.companyId} not found`,
        );
      }

      // Check for existing review by this user for this company
      const existing = await this.prisma.review.findFirst({
        where: { userId, companyId: createReviewDto.companyId },
      });

      if (existing) {
        throw new ConflictException({
          message: 'Vous avez déjà laissé un avis pour cette entreprise',
          reviewId: existing.id,
        });
      }

      const review = await this.prisma.review.create({
        data: {
          rating: createReviewDto.rating,
          comment: createReviewDto.comment ?? '',
          userId,
          companyId: createReviewDto.companyId,
        },
        include: {
          user: { select: userSelect },
          company: { select: { id: true, name: true, slug: true } },
        },
      });

      return review;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error('Failed to create review', error);
      throw new InternalServerErrorException('Failed to create review');
    }
  }

  async update(id: number, userId: number, updateReviewDto: UpdateReviewDto) {
    try {
      const review = await this.prisma.review.findUnique({ where: { id } });

      if (!review) {
        throw new NotFoundException(`Review with ID ${id} not found`);
      }

      if (review.userId !== userId) {
        throw new ForbiddenException('You cannot edit this review');
      }

      const updated = await this.prisma.review.update({
        where: { id },
        data: {
          rating: updateReviewDto.rating,
          comment: updateReviewDto.comment ?? '',
        },
        include: {
          user: { select: userSelect },
          company: { select: { id: true, name: true, slug: true } },
        },
      });

      return updated;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      this.logger.error(`Failed to update review ${id}`, error);
      throw new InternalServerErrorException('Failed to update review');
    }
  }

  async findByCompany(companyId: number, rating?: number) {
    try {
      const where: any = { companyId };
      if (rating) where.rating = rating;

      return await this.prisma.review.findMany({
        where,
        include: { user: { select: userSelect } },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch reviews for company ${companyId}`, error);
      throw new InternalServerErrorException('Failed to fetch reviews');
    }
  }

  async findOne(id: number) {
    try {
      return await this.prisma.review.findUnique({
        where: { id },
        include: {
          user: { select: userSelect },
          company: { select: { id: true, name: true, slug: true } },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch review with ID ${id}`, error);
      throw new InternalServerErrorException('Failed to fetch review');
    }
  }

  async vote(id: number, type: 'upvote' | 'downvote', userId: number) {
    try {
      const review = await this.prisma.review.findUnique({ where: { id } });
      if (!review) throw new NotFoundException(`Review with ID ${id} not found`);

      const voteType = type === 'upvote' ? 'LIKE' : 'DISLIKE';

      const existing = await this.prisma.reviewVote.findUnique({
        where: { userId_reviewId: { userId, reviewId: id } },
      });

      let upvotesDelta = 0;
      let downvotesDelta = 0;
      let userVote: string | null = null;

      if (existing) {
        if (existing.type === voteType) {
          // Same vote → remove (toggle off)
          await this.prisma.reviewVote.delete({
            where: { userId_reviewId: { userId, reviewId: id } },
          });
          if (type === 'upvote') upvotesDelta = -1;
          else downvotesDelta = -1;
          userVote = null;
        } else {
          // Different vote → switch
          await this.prisma.reviewVote.update({
            where: { userId_reviewId: { userId, reviewId: id } },
            data: { type: voteType },
          });
          if (type === 'upvote') { upvotesDelta = 1; downvotesDelta = -1; }
          else { upvotesDelta = -1; downvotesDelta = 1; }
          userVote = voteType;
        }
      } else {
        // New vote
        await this.prisma.reviewVote.create({
          data: { userId, reviewId: id, type: voteType },
        });
        if (type === 'upvote') upvotesDelta = 1;
        else downvotesDelta = 1;
        userVote = voteType;
      }

      const updated = await this.prisma.review.update({
        where: { id },
        data: {
          upvotes: { increment: upvotesDelta },
          downvotes: { increment: downvotesDelta },
        },
        include: { user: { select: userSelect } },
      });

      return { ...updated, userVote };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error(`Failed to vote on review ${id}`, error);
      throw new InternalServerErrorException('Failed to vote on review');
    }
  }

  async getUserVotesForCompany(userId: number, companyId: number) {
    try {
      const votes = await this.prisma.reviewVote.findMany({
        where: { userId, review: { companyId } },
        select: { reviewId: true, type: true },
      });
      const result: Record<number, string> = {};
      for (const v of votes) result[v.reviewId] = v.type;
      return result;
    } catch (error) {
      this.logger.error(`Failed to get user votes for company ${companyId}`, error);
      throw new InternalServerErrorException('Failed to get user votes');
    }
  }

  async createReply(reviewId: number, userId: number, content: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { company: { select: { id: true, claimedByUserId: true } }, reply: true },
    });

    if (!review) throw new NotFoundException('Avis introuvable');
    if (review.company.claimedByUserId !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à répondre à cet avis');
    }
    if (review.reply) {
      throw new ConflictException('Une réponse existe déjà pour cet avis');
    }

    return this.prisma.companyReply.create({
      data: { reviewId, companyId: review.company.id, content },
    });
  }

  async updateReply(reviewId: number, userId: number, content: string) {
    const reply = await this.prisma.companyReply.findUnique({
      where: { reviewId },
      include: { company: { select: { claimedByUserId: true } } },
    });

    if (!reply) throw new NotFoundException('Réponse introuvable');
    if (reply.company.claimedByUserId !== userId) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier cette réponse');
    }

    return this.prisma.companyReply.update({
      where: { reviewId },
      data: { content },
    });
  }

  async deleteReply(reviewId: number, userId: number, userRole: string) {
    const reply = await this.prisma.companyReply.findUnique({
      where: { reviewId },
      include: { company: { select: { claimedByUserId: true } } },
    });

    if (!reply) throw new NotFoundException('Réponse introuvable');

    const isOwner = reply.company.claimedByUserId === userId;
    const isAdmin = userRole === 'ADMIN';
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer cette réponse');
    }

    await this.prisma.companyReply.delete({ where: { reviewId } });
    return { success: true };
  }

  async delete(id: number, userId: number, userRole: string) {
    try {
      const review = await this.prisma.review.findUnique({ where: { id } });

      if (!review) {
        throw new NotFoundException(`Review with ID ${id} not found`);
      }

      if (review.userId !== userId && userRole !== 'ADMIN') {
        throw new ForbiddenException('You do not have permission to delete this review');
      }

      await this.prisma.review.delete({ where: { id } });
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
