import { Controller, Get, Post, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AiAnalysisService } from './ai-analysis.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyOwnerGuard } from '../companies/company-owner.guard';

@Controller('companies')
export class AiAnalysisController {
  constructor(private readonly aiAnalysisService: AiAnalysisService) {}

  /** GET /api/companies/:id/analysis */
  @Get(':id/analysis')
  @UseGuards(JwtAuthGuard, CompanyOwnerGuard)
  async getAnalysis(@Param('id', ParseIntPipe) id: number) {
    return this.aiAnalysisService.getAnalysis(id);
  }

  /** POST /api/companies/:id/analysis/generate */
  @Post(':id/analysis/generate')
  @UseGuards(JwtAuthGuard, CompanyOwnerGuard)
  async generateAnalysis(@Param('id', ParseIntPipe) id: number) {
    return this.aiAnalysisService.generateAnalysis(id);
  }
}
