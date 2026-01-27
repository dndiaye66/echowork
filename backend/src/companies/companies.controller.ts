import { Controller, Get, Param, BadRequestException, NotFoundException } from '@nestjs/common';
import { CompaniesService } from './companies.service';

/**
 * Controller handling company-related HTTP endpoints
 */
@Controller('api/companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  /**
   * GET /api/companies
   * Retrieves all companies
   * @returns Promise<Company[]> List of all companies with their categories
   */
  @Get()
  async getAll() {
    return this.companiesService.findAll();
  }

  /**
   * GET /api/companies/:id
   * Retrieves a specific company by ID
   * @param id - The company ID as string (will be parsed to number)
   * @returns Promise<Company> The requested company
   * @throws BadRequestException if ID is not a valid number
   * @throws NotFoundException if company doesn't exist
   */
  @Get(':id')
  async getById(@Param('id') id: string) {
    const idNum = parseInt(id, 10);
    
    if (isNaN(idNum)) {
      throw new BadRequestException('Invalid company ID');
    }
    
    const company = await this.companiesService.findById(idNum);
    
    if (!company) {
      throw new NotFoundException(`Company with ID ${idNum} not found`);
    }
    
    return company;
  }

  /**
   * GET /api/companies/category/:categoryId
   * Retrieves all companies in a specific category
   * @param categoryId - The category ID as string (will be parsed to number)
   * @returns Promise<Company[]> List of companies in the category
   * @throws BadRequestException if category ID is not a valid number
   */
  @Get('category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: string) {
    const idNum = parseInt(categoryId, 10);
    
    if (isNaN(idNum)) {
      throw new BadRequestException('Invalid category ID');
    }
    
    return this.companiesService.findByCategory(idNum);
  }
}
