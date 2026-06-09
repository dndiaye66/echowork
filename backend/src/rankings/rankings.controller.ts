import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { RankingsService } from './rankings.service';

@Controller('rankings')
export class RankingsController {
  constructor(private readonly rankingsService: RankingsService) {}

  /** GET /api/rankings?type=category&slug=banques-et-institutions-financieres&limit=10 */
  /** GET /api/rankings?type=city&city=Dakar&limit=10 */
  @Get()
  async getRankings(
    @Query('type') type?: string,
    @Query('slug') slug?: string,
    @Query('city') city?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? Math.min(parseInt(limit, 10), 50) : 10;

    if (type === 'category') {
      if (!slug) throw new BadRequestException('Le paramètre slug est requis');
      return this.rankingsService.getByCategory(slug, limitNum);
    }

    if (type === 'city') {
      if (!city) throw new BadRequestException('Le paramètre city est requis');
      return this.rankingsService.getByCity(city, limitNum);
    }

    throw new BadRequestException('type doit être "category" ou "city"');
  }

  /** GET /api/rankings/categories — liste des catégories disponibles */
  @Get('categories')
  async getCategories() {
    return this.rankingsService.getTopCategories();
  }
}
