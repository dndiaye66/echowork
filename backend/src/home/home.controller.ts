import { Controller, Get } from '@nestjs/common';
import { CompaniesService } from '../companies/companies.service';

/**
 * Controller handling home page endpoints
 */
@Controller('home')
export class HomeController {
  constructor(private readonly companiesService: CompaniesService) {}

  /**
   * GET /api/home/best-companies
   * Retrieves top 10 companies sorted by average rating
   * @returns Promise<Company[]> List of top 10 rated companies
   */
  @Get('best-companies')
  async getBestCompanies() {
    return this.companiesService.findBestCompanies();
  }
}
