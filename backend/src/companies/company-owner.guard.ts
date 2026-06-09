import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const companyId = parseInt(request.params.id, 10);

    if (!userId || isNaN(companyId)) {
      throw new ForbiddenException('Accès refusé');
    }

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: { claimedByUserId: true },
    });

    if (!company) {
      throw new NotFoundException('Entreprise introuvable');
    }

    if (company.claimedByUserId !== userId) {
      throw new ForbiddenException(
        'Vous n\'êtes pas autorisé à modifier cette entreprise',
      );
    }

    return true;
  }
}
