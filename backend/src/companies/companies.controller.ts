import { Controller, Get, Param, NotFoundException, Query } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompanyIdParamDto, CategoryIdParamDto, CategorySlugParamDto } from './dto/param.dto';

/**
 * Controller handling company-related HTTP endpoints
 */
@Controller('api/companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  /**
   * GET /api/companies
   * Retrieves all companies
   * @param search - Optional search query
   * @returns Promise<Company[]> List of all companies with their categories
   */
  @Get()
  async getAll(@Query('search') search?: string) {
    return this.companiesService.findAll(search);
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
    const company = await this.companiesService.findById(params.id);
    
    if (!company) {
      throw new NotFoundException(`Company with ID ${params.id} not found`);
    }
    
    return company;
  }

  /**
   * GET /api/companies/category/slug/:slug
   * Retrieves all companies in a specific category by slug
   * NOTE: This route must come before the numeric category/:categoryId route
   * @param params - Validated DTO containing the category slug
   * @returns Promise<Company[]> List of companies in the category
   * @throws BadRequestException if slug format is invalid (handled by ValidationPipe)
   */
  @Get('category/slug/:slug')
  async getByCategorySlug(@Param() params: CategorySlugParamDto) {
    return this.companiesService.findByCategorySlug(params.slug);
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
    return this.companiesService.findByCategory(params.categoryId);
  }
}
