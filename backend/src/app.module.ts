import { Module } from '@nestjs/common';
import { CompaniesModule } from './companies/companies.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminModule } from './admin/admin.module';
import { CategoriesModule } from './categories/categories.module';
import { HomeModule } from './home/home.module';
import { UsersModule } from './users/users.module';
import { RankingsModule } from './rankings/rankings.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AiAnalysisModule } from './ai-analysis/ai-analysis.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    PrismaModule,
    CompaniesModule,
    AuthModule,
    ReviewsModule,
    AdminModule,
    CategoriesModule,
    HomeModule,
    UsersModule,
    RankingsModule,
    AnalyticsModule,
    AiAnalysisModule,
    ReportsModule,
  ],
})
export class AppModule {}
