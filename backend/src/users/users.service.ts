import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMyProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        createdAt: true,
        profile: {
          select: { fullName: true, profileType: true, trustScore: true },
        },
        _count: {
          select: { reviews: true },
        },
        reviews: {
          where: { status: 'APPROVED' },
          select: { rating: true },
        },
      },
    });

    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const avgRating =
      user.reviews.length > 0
        ? user.reviews.reduce((sum, r) => sum + r.rating, 0) / user.reviews.length
        : null;

    const { reviews, ...rest } = user;

    return {
      ...rest,
      stats: {
        totalReviews: user._count.reviews,
        approvedReviews: reviews.length,
        avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      },
    };
  }

  async updateProfile(
    userId: number,
    dto: {
      username?: string;
      email?: string;
      phone?: string;
      fullName?: string;
      profileType?: string;
    },
  ) {
    // Check username uniqueness
    if (dto.username) {
      const existing = await this.prisma.user.findFirst({
        where: { username: dto.username, NOT: { id: userId } },
      });
      if (existing) throw new ConflictException('Ce nom d\'utilisateur est déjà pris.');
    }

    // Check email uniqueness
    if (dto.email) {
      const existing = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id: userId } },
      });
      if (existing) throw new ConflictException('Cette adresse email est déjà utilisée.');
    }

    const { fullName, profileType, ...userFields } = dto;

    await this.prisma.user.update({
      where: { id: userId },
      data: { ...userFields },
    });

    if (fullName !== undefined || profileType !== undefined) {
      await this.prisma.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          fullName: fullName ?? null,
          profileType: (profileType as any) ?? 'CLIENT',
        },
        update: {
          ...(fullName !== undefined && { fullName }),
          ...(profileType !== undefined && { profileType: profileType as any }),
        },
      });
    }

    return this.getMyProfile(userId);
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    // Google OAuth users have empty password
    if (!user.password) {
      throw new BadRequestException(
        'Votre compte utilise Google — vous ne pouvez pas changer le mot de passe ici.',
      );
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new BadRequestException('Mot de passe actuel incorrect.');

    if (newPassword.length < 8) {
      throw new BadRequestException('Le nouveau mot de passe doit contenir au moins 8 caractères.');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    return { message: 'Mot de passe mis à jour avec succès.' };
  }

  async getMyReviews(userId: number, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          rating: true,
          comment: true,
          context: true,
          status: true,
          upvotes: true,
          downvotes: true,
          createdAt: true,
          company: {
            select: { id: true, name: true, slug: true, imageUrl: true },
          },
        },
      }),
      this.prisma.review.count({ where: { userId } }),
    ]);

    return {
      data: reviews,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
