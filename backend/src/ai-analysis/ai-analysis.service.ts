import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../prisma/prisma.service';

const MIN_REVIEWS = 5;

@Injectable()
export class AiAnalysisService {
  private readonly logger = new Logger(AiAnalysisService.name);
  private readonly client = new Anthropic();

  constructor(private readonly prisma: PrismaService) {}

  async getAnalysis(companyId: number) {
    return this.prisma.reviewAnalysis.findUnique({ where: { companyId } });
  }

  async generateAnalysis(companyId: number) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        category: { select: { name: true } },
        reviews: {
          where: { status: 'APPROVED' },
          select: { rating: true, comment: true },
          orderBy: { createdAt: 'desc' },
          take: 200,
        },
      },
    });

    if (!company) throw new NotFoundException('Entreprise introuvable');
    if (company.reviews.length < MIN_REVIEWS) {
      throw new BadRequestException(
        `Au moins ${MIN_REVIEWS} avis approuvés sont nécessaires pour générer une analyse.`,
      );
    }

    const reviewsText = company.reviews
      .map((r) => `[${r.rating}/5] ${r.comment}`)
      .join('\n');

    const prompt = `Tu es un expert en analyse de satisfaction client au Sénégal.
Analyse ces ${company.reviews.length} avis clients de l'entreprise "${company.name}" (secteur : ${company.category?.name ?? 'non précisé'}).

Identifie exactement 3 points forts et 3 points faibles récurrents dans les avis.
Calcule la répartition sentimentale globale (positif / neutre / négatif) en pourcentages (total = 100).

Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, avec cette structure exacte :
{
  "strengths": ["point fort 1", "point fort 2", "point fort 3"],
  "weaknesses": ["point faible 1", "point faible 2", "point faible 3"],
  "sentiment": { "pos": 72, "neu": 18, "neg": 10 }
}

Avis à analyser :
${reviewsText}`;

    try {
      const message = await this.client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      });

      const text =
        message.content[0].type === 'text' ? message.content[0].text.trim() : '';

      const parsed = JSON.parse(text);
      const { strengths, weaknesses, sentiment } = parsed;

      return this.prisma.reviewAnalysis.upsert({
        where: { companyId },
        create: {
          companyId,
          strengths,
          weaknesses,
          sentimentPos: sentiment.pos,
          sentimentNeu: sentiment.neu,
          sentimentNeg: sentiment.neg,
          reviewCount: company.reviews.length,
        },
        update: {
          strengths,
          weaknesses,
          sentimentPos: sentiment.pos,
          sentimentNeu: sentiment.neu,
          sentimentNeg: sentiment.neg,
          reviewCount: company.reviews.length,
          generatedAt: new Date(),
        },
      });
    } catch (err) {
      this.logger.error(`AI analysis failed for company ${companyId}`, err);
      throw new InternalServerErrorException("Échec de l'analyse IA. Veuillez réessayer.");
    }
  }
}
