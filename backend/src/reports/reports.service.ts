import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ReportStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: CreateReportDto, userId?: number) {
    try {
      const company = await this.prisma.company.findUnique({
        where: { id: dto.companyId },
        select: { name: true, slug: true },
      });
      if (!company) throw new NotFoundException('Entreprise introuvable');

      // Fetch reporter username if not anonymous
      let reporterUsername: string | undefined;
      if (!dto.isAnonymous && userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { username: true },
        });
        reporterUsername = user?.username;
      }

      const report = await this.prisma.citizenReport.create({
        data: {
          companyId: dto.companyId,
          userId: dto.isAnonymous ? null : (userId ?? null),
          category: dto.category,
          description: dto.description,
          evidence: dto.evidence,
          isAnonymous: dto.isAnonymous ?? false,
        },
      });

      // Notify admin
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        this.emailService.sendSignalementAlert({
          adminEmail,
          companyName: company.name,
          companySlug: company.slug,
          category: dto.category,
          description: dto.description,
          isAnonymous: dto.isAnonymous ?? false,
          reporterUsername,
        }).catch(() => {});
      }

      return report;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error('Failed to create report', err);
      throw new InternalServerErrorException();
    }
  }

  async findAll(status?: ReportStatus) {
    try {
      return this.prisma.citizenReport.findMany({
        where: status ? { status } : undefined,
        include: {
          company: { select: { id: true, name: true, slug: true } },
          user: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      this.logger.error('Failed to list reports', err);
      throw new InternalServerErrorException();
    }
  }

  async findByCompany(companyId: number) {
    try {
      return this.prisma.citizenReport.findMany({
        where: { companyId, status: 'VALIDATED' },
        select: {
          id: true, category: true, description: true,
          isAnonymous: true, createdAt: true, status: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (err) {
      this.logger.error('Failed to get company reports', err);
      throw new InternalServerErrorException();
    }
  }

  async updateStatus(
    id: number,
    status: ReportStatus,
    moderatorId: number,
    moderatorNote?: string,
  ) {
    try {
      const report = await this.prisma.citizenReport.findUnique({ where: { id } });
      if (!report) throw new NotFoundException('Signalement introuvable');

      return this.prisma.citizenReport.update({
        where: { id },
        data: { status, moderatorId, moderatorNote },
      });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error('Failed to update report status', err);
      throw new InternalServerErrorException();
    }
  }
}
