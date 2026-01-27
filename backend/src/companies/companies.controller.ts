import { Controller, Get, Param, BadRequestException, NotFoundException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompanyIdParamDto, CategoryIdParamDto } from './dto/param.dto';

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
   * @param params - Validated DTO containing the company ID
   * @returns Promise<Company> The requested company
   * @throws BadRequestException if ID is not a valid positive number (handled by ValidationPipe)
   * @throws NotFoundException if company doesn't exist
   */
  @Get(':id')
  async getById(@Param() params: CompanyIdParamDto) {
    const idNum = parseInt(params.id, 10);
    
    if (isNaN(idNum) || idNum <= 0) {
      throw new BadRequestException('Invalid company ID - must be a positive number');
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
   * @param params - Validated DTO containing the category ID
   * @returns Promise<Company[]> List of companies in the category
   * @throws BadRequestException if category ID is not a valid positive number (handled by ValidationPipe)
   */
  @Get('category/:categoryId')
  async getByCategory(@Param() params: CategoryIdParamDto) {
    const idNum = parseInt(params.categoryId, 10);
    
    if (isNaN(idNum) || idNum <= 0) {
      throw new BadRequestException('Invalid category ID - must be a positive number');
    }
    
    return this.companiesService.findByCategory(idNum);
  }
}
