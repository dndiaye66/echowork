import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { CompanyOwnerGuard } from './company-owner.guard';

@Module({
  imports: [
    PrismaModule,
    MulterModule.register({ dest: './uploads/companies' }),
  ],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompanyOwnerGuard],
  exports: [CompaniesService],
})
export class CompaniesModule {}
