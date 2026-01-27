import { Module } from '@nestjs/common';
import { CompaniesModule } from './companies/companies.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [PrismaModule, CompaniesModule, AuthModule, ReviewsModule, AdminModule],
})
export class AppModule {}
