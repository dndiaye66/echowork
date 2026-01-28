import { Controller, Get, Param, NotFoundException, Query } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompanyIdParamDto, CategoryIdParamDto, CategorySlugParamDto, CompanySlugParamDto } from './dto/param.dto';

/**
 * Controller handling company-related HTTP endpoints
 */
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  /**
   * GET /api/companies/search/autocomplete
   * Intelligent search with autocomplete suggestions
   * Supports direct search (e.g., "Banque") and rating-based search (e.g., "meilleur restaurant")
   * NOTE: This route must come before the general GET / route
   * @param query - Search query
   * @param limit - Maximum number of results (default: 10)
   * @returns Promise<Company[]> List of matching companies with ratings
   */
  @Get('search/autocomplete')
  async searchAutocomplete(
    @Query('q') query?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.companiesService.searchWithAutocomplete(query || '', limitNum);
  }

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
   * GET /api/companies/best
   * Retrieves top 10 companies sorted by average rating
   * NOTE: This route must come before the numeric :id route to avoid conflicts
   * @returns Promise<Company[]> List of top 10 rated companies
   */
  @Get('best')
  async getBestCompanies() {
    return this.companiesService.findBestCompanies();
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

  /**
   * GET /api/companies/slug/:slug
   * Retrieves a specific company by slug
   * NOTE: This route must come before the numeric :id route to avoid conflicts
   * @param params - Validated DTO containing the company slug
   * @returns Promise<Company> The requested company with reviews, job offers, and advertisements
   * @throws BadRequestException if slug format is invalid (handled by ValidationPipe)
   * @throws NotFoundException if company doesn't exist
   */
  @Get('slug/:slug')
  async getBySlug(@Param() params: CompanySlugParamDto) {
    const company = await this.companiesService.findBySlug(params.slug);
    
    if (!company) {
      throw new NotFoundException(`Company with slug ${params.slug} not found`);
    }
    
    return company;
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
}
