import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';

@Controller('api/admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ===== COMPANIES =====

  @Post('companies')
  async createCompany(@Body() createCompanyDto: CreateCompanyDto) {
    return this.adminService.createCompany(createCompanyDto);
  }

  @Put('companies/:id')
  async updateCompany(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.adminService.updateCompany(id, updateCompanyDto);
  }

  @Delete('companies/:id')
  async deleteCompany(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteCompany(id);
  }

  // ===== JOB OFFERS =====

  @Post('job-offers')
  async createJobOffer(@Body() createJobOfferDto: CreateJobOfferDto) {
    return this.adminService.createJobOffer(createJobOfferDto);
  }

  @Get('job-offers')
  async getJobOffers(@Query('companyId', ParseIntPipe) companyId?: number) {
    return this.adminService.getJobOffers(companyId);
  }

  @Put('job-offers/:id')
  async updateJobOffer(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<CreateJobOfferDto>,
  ) {
    return this.adminService.updateJobOffer(id, data);
  }

  @Delete('job-offers/:id')
  async deleteJobOffer(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteJobOffer(id);
  }

  // ===== ADVERTISEMENTS =====

  @Post('advertisements')
  async createAdvertisement(@Body() createAdvertisementDto: CreateAdvertisementDto) {
    return this.adminService.createAdvertisement(createAdvertisementDto);
  }

  @Get('advertisements')
  async getAdvertisements(
    @Query('companyId') companyId?: string,
    @Query('isActive') isActive?: string,
  ) {
    const companyIdNum = companyId ? parseInt(companyId, 10) : undefined;
    const isActiveBool = isActive ? isActive === 'true' : undefined;
    return this.adminService.getAdvertisements(companyIdNum, isActiveBool);
  }

  @Put('advertisements/:id')
  async updateAdvertisement(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<CreateAdvertisementDto>,
  ) {
    return this.adminService.updateAdvertisement(id, data);
  }

  @Delete('advertisements/:id')
  async deleteAdvertisement(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.deleteAdvertisement(id);
  }
}
