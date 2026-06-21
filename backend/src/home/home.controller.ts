import { Controller, Get, Query } from '@nestjs/common';
import { CompaniesService } from '../companies/companies.service';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Controller handling home page endpoints
 */
@Controller('home')
export class HomeController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * GET /api/home/best-companies
   * Retrieves top 10 companies sorted by average rating
   * @returns Promise<Company[]> List of top 10 rated companies
   */
  @Get('best-companies')
  async getBestCompanies() {
    return this.companiesService.findBestCompanies();
  }

  /**
   * GET /api/home/worst-companies
   * Retrieves top 10 companies with lowest ratings
   * @returns Promise<Company[]> List of worst rated companies
   */
  @Get('worst-companies')
  async getWorstCompanies() {
    return this.companiesService.findWorstCompanies();
  }

  /**
   * GET /api/home/stats
   * Returns platform-wide counts for the hero section
   */
  @Get('stats')
  async getStats() {
    const [companyCount, categoryCount, reviewCount, userCount] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.category.count(),
      this.prisma.review.count({ where: { status: 'APPROVED' } }),
      this.prisma.user.count(),
    ]);
    return { companyCount, categoryCount, reviewCount, userCount };
  }

  @Get('job-offers')
  async getJobOffers() {
    return this.prisma.jobOffer.findMany({
      where: { isActive: true },
      include: { company: { select: { id: true, name: true, imageUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  @Get('recent-reviews')
  async getRecentReviews(@Query('limit') limit?: string) {
    const take = Math.min(parseInt(limit ?? '6', 10) || 6, 50);
    return this.prisma.review.findMany({
      where: { status: 'APPROVED' },
      include: {
        company: { select: { id: true, name: true, slug: true, imageUrl: true, ville: true } },
        user: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
    });
  }

  @Get('barometer')
  async getBarometer() {
    const sectors = [
      { slug: 'banques-et-institutions-financieres', label: 'Banques' },
      { slug: 'telecommunications', label: 'Télécoms' },
      { slug: 'services', label: 'Services publics' },
      { slug: 'sante-et-pharmacie', label: 'Santé' },
    ];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    return Promise.all(
      sectors.map(async ({ slug, label }) => {
        const cat = await this.prisma.category.findFirst({ where: { slug } });
        if (!cat) return { slug, label, avg: null, trend: null, count: 0 };

        const [all, recent, prev] = await Promise.all([
          this.prisma.review.aggregate({
            where: { company: { categoryId: cat.id }, status: 'APPROVED' },
            _avg: { rating: true },
            _count: { id: true },
          }),
          this.prisma.review.aggregate({
            where: { company: { categoryId: cat.id }, status: 'APPROVED', createdAt: { gte: thirtyDaysAgo } },
            _avg: { rating: true },
          }),
          this.prisma.review.aggregate({
            where: { company: { categoryId: cat.id }, status: 'APPROVED', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
            _avg: { rating: true },
          }),
        ]);

        const avg = all._avg.rating ? +all._avg.rating.toFixed(1) : null;
        const recentAvg = recent._avg.rating;
        const prevAvg = prev._avg.rating;
        const trend = recentAvg && prevAvg ? +(recentAvg - prevAvg).toFixed(1) : null;

        return { slug, label, avg, trend, count: all._count.id };
      }),
    );
  }
}
