import { Controller, Get } from '@nestjs/common';
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
    const [companyCount, categoryCount, reviewCount] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.category.count(),
      this.prisma.review.count(),
    ]);
    return { companyCount, categoryCount, reviewCount };
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
}
