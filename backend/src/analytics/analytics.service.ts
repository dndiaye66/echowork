import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async trackView(companyId: number, source?: string) {
    try {
      await this.prisma.companyView.create({ data: { companyId, source } });
    } catch (err) {
      this.logger.warn(`Failed to track view for company ${companyId}`, err);
    }
  }

  async getAnalytics(companyId: number) {
    try {
      const [views, reviews, replies, company] = await Promise.all([
        this.prisma.companyView.count({ where: { companyId } }),
        this.prisma.review.findMany({
          where: { companyId, status: 'APPROVED' },
          select: { id: true, rating: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        }),
        this.prisma.companyReply.count({ where: { companyId } }),
        this.prisma.company.findUnique({
          where: { id: companyId },
          select: { categoryId: true },
        }),
      ]);

      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const viewsThisMonth = await this.prisma.companyView.count({
        where: { companyId, viewedAt: { gte: monthAgo } },
      });
      const viewsPrevMonth = await this.prisma.companyView.count({
        where: {
          companyId,
          viewedAt: {
            gte: new Date(now.getFullYear(), now.getMonth() - 2, now.getDate()),
            lt: monthAgo,
          },
        },
      });

      const reviewsThisMonth = reviews.filter((r) => r.createdAt >= monthAgo).length;
      const reviewsPrevMonth = reviews.filter(
        (r) =>
          r.createdAt >= new Date(now.getFullYear(), now.getMonth() - 2, now.getDate()) &&
          r.createdAt < monthAgo,
      ).length;

      const ratingHistory = this.buildMonthlyHistory(reviews, 12);
      const responseRate = reviews.length > 0 ? Math.round((replies / reviews.length) * 100) : 0;

      let competitorAvg: number | null = null;
      if (company?.categoryId) {
        const result = await this.prisma.$queryRaw<{ avg: number }[]>`
          SELECT COALESCE(AVG(r.rating), 0)::float AS avg
          FROM "Review" r
          JOIN "Company" c ON c.id = r."companyId"
          WHERE c."categoryId" = ${company.categoryId}
            AND c.id != ${companyId}
            AND r.status = 'APPROVED'
        `;
        competitorAvg = result[0]
          ? parseFloat(Number(result[0].avg).toFixed(2))
          : null;
      }

      const globalAvg =
        reviews.length > 0
          ? parseFloat(
              (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(2),
            )
          : 0;

      return {
        views: {
          total: views,
          thisMonth: viewsThisMonth,
          trend: this.trend(viewsThisMonth, viewsPrevMonth),
        },
        reviews: {
          total: reviews.length,
          thisMonth: reviewsThisMonth,
          trend: this.trend(reviewsThisMonth, reviewsPrevMonth),
        },
        globalAvg,
        responseRate,
        competitorAvg,
        ratingHistory,
      };
    } catch (err) {
      this.logger.error(`Failed to get analytics for company ${companyId}`, err);
      throw new InternalServerErrorException();
    }
  }

  private buildMonthlyHistory(
    reviews: { rating: number; createdAt: Date }[],
    months: number,
  ) {
    const now = new Date();
    return Array.from({ length: months }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
      const label = d.toISOString().slice(0, 7);
      const bucket = reviews.filter((r) => r.createdAt.toISOString().slice(0, 7) === label);
      const avg =
        bucket.length > 0
          ? parseFloat((bucket.reduce((s, r) => s + r.rating, 0) / bucket.length).toFixed(2))
          : null;
      return { month: label, avg, count: bucket.length };
    });
  }

  private trend(current: number, previous: number): string {
    if (previous === 0) return current > 0 ? `+${current}` : '0';
    const diff = current - previous;
    return diff > 0 ? `+${diff}` : `${diff}`;
  }
}
