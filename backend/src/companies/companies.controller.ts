import { Controller, Get, Param } from '@nestjs/common';
import { CompaniesService } from './companies.service';

@Controller('api/companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async getAll() {
    return this.companiesService.findAll();
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const idNum = parseInt(id, 10);
    return this.companiesService.findById(idNum);
  }

  @Get('category/:categoryId')
  async getByCategory(@Param('categoryId') categoryId: string) {
    const idNum = parseInt(categoryId, 10);
    return this.companiesService.findByCategory(idNum);
  }
}
