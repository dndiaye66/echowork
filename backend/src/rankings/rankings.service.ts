import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RankingsService {
  private readonly logger = new Logger(RankingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getByCategory(categorySlug: string, limit = 10) {
    try {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT
          c.id, c.name, c.slug, c.description, c."imageUrl", c.ville,
          c."isVerified", c."categoryId",
          cat.name as "categoryName", cat.slug as "categorySlug",
          COALESCE(AVG(r.rating), 0)::float   AS "averageRating",
          COUNT(r.id)::int                    AS "reviewCount",
          COALESCE(
            AVG(r.rating) FILTER (WHERE r."createdAt" >= NOW() - INTERVAL '30 days'), 0
          )::float AS "ratingLast30",
          COALESCE(
            AVG(r.rating) FILTER (WHERE r."createdAt" >= NOW() - INTERVAL '60 days'
                                   AND r."createdAt" <  NOW() - INTERVAL '30 days'), 0
          )::float AS "ratingPrev30"
        FROM "Company" c
        JOIN "Category" cat ON cat.id = c."categoryId"
        LEFT JOIN "Review" r ON r."companyId" = c.id AND r.status = 'APPROVED'
        WHERE cat.slug = ${categorySlug}
        GROUP BY c.id, cat.id
        ORDER BY "averageRating" DESC, "reviewCount" DESC, c.name ASC
        LIMIT ${limit}
      `;
      return this.formatRows(rows);
    } catch (err) {
      this.logger.error('Failed to get rankings by category', err);
      throw new InternalServerErrorException();
    }
  }

  async getByCity(city: string, limit = 10) {
    try {
      const rows = await this.prisma.$queryRaw<any[]>`
        SELECT
          c.id, c.name, c.slug, c.description, c."imageUrl", c.ville,
          c."isVerified", c."categoryId",
          cat.name as "categoryName", cat.slug as "categorySlug",
          COALESCE(AVG(r.rating), 0)::float   AS "averageRating",
          COUNT(r.id)::int                    AS "reviewCount",
          COALESCE(
            AVG(r.rating) FILTER (WHERE r."createdAt" >= NOW() - INTERVAL '30 days'), 0
          )::float AS "ratingLast30",
          COALESCE(
            AVG(r.rating) FILTER (WHERE r."createdAt" >= NOW() - INTERVAL '60 days'
                                   AND r."createdAt" <  NOW() - INTERVAL '30 days'), 0
          )::float AS "ratingPrev30"
        FROM "Company" c
        JOIN "Category" cat ON cat.id = c."categoryId"
        LEFT JOIN "Review" r ON r."companyId" = c.id AND r.status = 'APPROVED'
        LEFT JOIN "CompanyLocation" loc ON loc."companyId" = c.id AND loc."isPrimary" = true
        WHERE LOWER(COALESCE(loc.city, c.ville, '')) LIKE LOWER(${`%${city}%`})
        GROUP BY c.id, cat.id
        ORDER BY "averageRating" DESC, "reviewCount" DESC, c.name ASC
        LIMIT ${limit}
      `;
      return this.formatRows(rows);
    } catch (err) {
      this.logger.error('Failed to get rankings by city', err);
      throw new InternalServerErrorException();
    }
  }

  async getTopCategories() {
    try {
      const cats = await this.prisma.category.findMany({
        where: { parentId: null },
        select: { id: true, name: true, slug: true, _count: { select: { companies: true } } },
        orderBy: { name: 'asc' },
      });
      // Tri par nombre d'entreprises décroissant côté JS pour éviter les problèmes de version Prisma
      return cats.sort((a, b) => (b._count?.companies ?? 0) - (a._count?.companies ?? 0));
    } catch (err) {
      this.logger.error('Failed to get top categories', err);
      throw new InternalServerErrorException();
    }
  }

  private formatRows(rows: any[]) {
    return rows.map((row, index) => ({
      rank: index + 1,
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      imageUrl: row.imageUrl,
      ville: row.ville,
      isVerified: row.isVerified,
      categoryId: row.categoryId,
      category: { name: row.categoryName, slug: row.categorySlug },
      averageRating: parseFloat(Number(row.averageRating).toFixed(2)),
      reviewCount: Number(row.reviewCount),
      trend: this.computeTrend(Number(row.ratingLast30), Number(row.ratingPrev30)),
    }));
  }

  private computeTrend(last30: number, prev30: number): 'up' | 'down' | 'stable' {
    if (prev30 === 0 || last30 === 0) return 'stable';
    const diff = last30 - prev30;
    if (diff > 0.1) return 'up';
    if (diff < -0.1) return 'down';
    return 'stable';
  }
}
