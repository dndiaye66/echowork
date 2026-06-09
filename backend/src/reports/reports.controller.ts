import {
  Controller, Get, Post, Patch, Body, Param,
  Query, UseGuards, Request, ParseIntPipe, ForbiddenException,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReportStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

class UpdateStatusDto {
  @IsEnum(ReportStatus) status!: ReportStatus;
  @IsOptional() @IsString() moderatorNote?: string;
}

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /** POST /api/reports — soumettre un signalement (auth optionnel) */
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Request() req: any, @Body() dto: CreateReportDto) {
    return this.reportsService.create(dto, req.user?.id);
  }

  /** GET /api/reports — liste admin */
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req: any, @Query('status') status?: ReportStatus) {
    if (req.user?.role !== 'ADMIN') throw new ForbiddenException();
    return this.reportsService.findAll(status);
  }

  /** GET /api/reports/company/:companyId — signalements validés d'une entreprise */
  @Get('company/:companyId')
  async findByCompany(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.reportsService.findByCompany(companyId);
  }

  /** PATCH /api/reports/:id/status — modérer un signalement */
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    if (req.user?.role !== 'ADMIN') throw new ForbiddenException();
    return this.reportsService.updateStatus(id, dto.status, req.user.id, dto.moderatorNote);
  }
}
