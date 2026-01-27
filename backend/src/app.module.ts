import { Module } from '@nestjs/common';
import { CompaniesModule } from './companies/companies.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminModule } from './admin/admin.module';
import { CategoriesModule } from './categories/categories.module';
import { HomeModule } from './home/home.module';

@Module({
  imports: [PrismaModule, CompaniesModule, AuthModule, ReviewsModule, AdminModule, CategoriesModule, HomeModule],
})
export class AppModule {}
