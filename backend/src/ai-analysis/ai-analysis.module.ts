import { Module } from '@nestjs/common';
import { AiAnalysisController } from './ai-analysis.controller';
import { AiAnalysisService } from './ai-analysis.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CompanyOwnerGuard } from '../companies/company-owner.guard';

@Module({
  imports: [PrismaModule],
  controllers: [AiAnalysisController],
  providers: [AiAnalysisService, CompanyOwnerGuard],
})
export class AiAnalysisModule {}
