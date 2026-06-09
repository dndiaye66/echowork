import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CompanyOwnerGuard } from '../companies/company-owner.guard';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, CompanyOwnerGuard],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
