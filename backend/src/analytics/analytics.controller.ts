import { Controller, Get, Post, Param, Query, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyOwnerGuard } from '../companies/company-owner.guard';

@Controller('companies')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /** POST /api/companies/:id/view — tracker une vue (public) */
  @Post(':id/view')
  async trackView(
    @Param('id', ParseIntPipe) id: number,
    @Query('source') source?: string,
  ) {
    await this.analyticsService.trackView(id, source);
    return { ok: true };
  }

  /** GET /api/companies/:id/analytics — données analytiques (owner only) */
  @Get(':id/analytics')
  @UseGuards(JwtAuthGuard, CompanyOwnerGuard)
  async getAnalytics(@Param('id', ParseIntPipe) id: number) {
    return this.analyticsService.getAnalytics(id);
  }
}
