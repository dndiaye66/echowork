import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ===== COMPANIES =====

  async createCompany(createCompanyDto: CreateCompanyDto) {
    try {
      // Check if slug already exists
      const existingCompany = await this.prisma.company.findUnique({
        where: { slug: createCompanyDto.slug },
      });

      if (existingCompany) {
        throw new ConflictException('Company with this slug already exists');
      }

      const company = await this.prisma.company.create({
        data: createCompanyDto,
        include: { category: true },
      });

      return company;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error('Failed to create company', error);
      throw new InternalServerErrorException('Failed to create company');
    }
  }

  async updateCompany(id: number, updateCompanyDto: UpdateCompanyDto) {
    try {
      const company = await this.prisma.company.findUnique({ where: { id } });

      if (!company) {
        throw new NotFoundException(`Company with ID ${id} not found`);
      }

      // Check if new slug already exists
      if (updateCompanyDto.slug && updateCompanyDto.slug !== company.slug) {
        const existingCompany = await this.prisma.company.findUnique({
          where: { slug: updateCompanyDto.slug },
        });

        if (existingCompany) {
          throw new ConflictException('Company with this slug already exists');
        }
      }

      const updatedCompany = await this.prisma.company.update({
        where: { id },
        data: updateCompanyDto,
        include: { category: true },
      });

      return updatedCompany;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Failed to update company ${id}`, error);
      throw new InternalServerErrorException('Failed to update company');
    }
  }

  async deleteCompany(id: number) {
    try {
      const company = await this.prisma.company.findUnique({ where: { id } });

      if (!company) {
        throw new NotFoundException(`Company with ID ${id} not found`);
      }

      await this.prisma.company.delete({ where: { id } });

      return { message: 'Company deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete company ${id}`, error);
      throw new InternalServerErrorException('Failed to delete company');
    }
  }

  // ===== JOB OFFERS =====

  async createJobOffer(createJobOfferDto: CreateJobOfferDto) {
    try {
      // Verify company exists
      const company = await this.prisma.company.findUnique({
        where: { id: createJobOfferDto.companyId },
      });

      if (!company) {
        throw new NotFoundException(
          `Company with ID ${createJobOfferDto.companyId} not found`,
        );
      }

      const jobOffer = await this.prisma.jobOffer.create({
        data: createJobOfferDto,
        include: { company: true },
      });

      return jobOffer;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to create job offer', error);
      throw new InternalServerErrorException('Failed to create job offer');
    }
  }

  async getJobOffers(companyId?: number) {
    try {
      const where = companyId ? { companyId } : {};
      return await this.prisma.jobOffer.findMany({
        where,
        include: { company: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error('Failed to fetch job offers', error);
      throw new InternalServerErrorException('Failed to fetch job offers');
    }
  }

  async updateJobOffer(id: number, data: Partial<CreateJobOfferDto>) {
    try {
      const jobOffer = await this.prisma.jobOffer.findUnique({ where: { id } });

      if (!jobOffer) {
        throw new NotFoundException(`Job offer with ID ${id} not found`);
      }

      return await this.prisma.jobOffer.update({
        where: { id },
        data,
        include: { company: true },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update job offer ${id}`, error);
      throw new InternalServerErrorException('Failed to update job offer');
    }
  }

  async deleteJobOffer(id: number) {
    try {
      const jobOffer = await this.prisma.jobOffer.findUnique({ where: { id } });

      if (!jobOffer) {
        throw new NotFoundException(`Job offer with ID ${id} not found`);
      }

      await this.prisma.jobOffer.delete({ where: { id } });

      return { message: 'Job offer deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete job offer ${id}`, error);
      throw new InternalServerErrorException('Failed to delete job offer');
    }
  }

  // ===== ADVERTISEMENTS =====

  async createAdvertisement(createAdvertisementDto: CreateAdvertisementDto) {
    try {
      // Verify company exists if companyId is provided
      if (createAdvertisementDto.companyId) {
        const company = await this.prisma.company.findUnique({
          where: { id: createAdvertisementDto.companyId },
        });

        if (!company) {
          throw new NotFoundException(
            `Company with ID ${createAdvertisementDto.companyId} not found`,
          );
        }
      }

      const advertisement = await this.prisma.advertisement.create({
        data: {
          ...createAdvertisementDto,
          startDate: new Date(createAdvertisementDto.startDate),
          endDate: new Date(createAdvertisementDto.endDate),
        },
        include: { company: true },
      });

      return advertisement;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Failed to create advertisement', error);
      throw new InternalServerErrorException('Failed to create advertisement');
    }
  }

  async getAdvertisements(companyId?: number, isActive?: boolean) {
    try {
      const where: any = {};
      if (companyId !== undefined) {
        where.companyId = companyId;
      }
      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      return await this.prisma.advertisement.findMany({
        where,
        include: { company: true },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error('Failed to fetch advertisements', error);
      throw new InternalServerErrorException('Failed to fetch advertisements');
    }
  }

  async updateAdvertisement(id: number, data: Partial<CreateAdvertisementDto>) {
    try {
      const advertisement = await this.prisma.advertisement.findUnique({ where: { id } });

      if (!advertisement) {
        throw new NotFoundException(`Advertisement with ID ${id} not found`);
      }

      const updateData: any = { ...data };
      if (data.startDate) {
        updateData.startDate = new Date(data.startDate);
      }
      if (data.endDate) {
        updateData.endDate = new Date(data.endDate);
      }

      return await this.prisma.advertisement.update({
        where: { id },
        data: updateData,
        include: { company: true },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to update advertisement ${id}`, error);
      throw new InternalServerErrorException('Failed to update advertisement');
    }
  }

  async deleteAdvertisement(id: number) {
    try {
      const advertisement = await this.prisma.advertisement.findUnique({ where: { id } });

      if (!advertisement) {
        throw new NotFoundException(`Advertisement with ID ${id} not found`);
      }

      await this.prisma.advertisement.delete({ where: { id } });

      return { message: 'Advertisement deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Failed to delete advertisement ${id}`, error);
      throw new InternalServerErrorException('Failed to delete advertisement');
    }
  }
}
