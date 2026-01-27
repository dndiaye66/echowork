import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getAll() {
    return this.categoriesService.findAll();
  }

  /**
   * Search companies within a specific category
   * Provides search functionality within the category view
   * NOTE: This route must come before the ':id' route to avoid conflicts
   */
  @Get(':id/search')
  async searchInCategory(
    @Param('id', ParseIntPipe) id: number,
    @Query('q') searchQuery: string,
  ) {
    return this.categoriesService.searchInCategory(id, searchQuery || '');
  }

  /**
   * Get category details with top companies, job offers, advertisements, and KPIs
   * When a user clicks on a category, this endpoint displays:
   * - Most rated companies
   * - Company reviews/comments
   * - Job offers in the category
   * - KPIs and statistics
   * - Advertisements
   */
  @Get(':id')
  async getCategoryDetails(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.getCategoryDetails(id);
  }
}
