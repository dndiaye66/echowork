import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [CompaniesModule],
  controllers: [HomeController],
})
export class HomeModule {}
