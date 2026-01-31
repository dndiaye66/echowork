# Guide d'implémentation - Backend Services

Ce guide explique comment adapter les services backend existants pour utiliser la nouvelle structure de base de données.

## 1. Génération du client Prisma

Après avoir exécuté la migration, régénérer le client Prisma:

```bash
cd backend
npm run prisma:generate
```

## 2. Modifications nécessaires par service

### 2.1 Auth Service (`src/auth/auth.service.ts`)

#### Lors de l'inscription d'un utilisateur

```typescript
async register(username: string, email: string, password: string, phone?: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await this.prisma.user.create({
    data: {
      username,
      email,
      phone, // Nouveau champ
      password: hashedPassword,
      isVerified: false, // Par défaut non vérifié
      // Créer automatiquement le profil
      profile: {
        create: {
          profileType: 'CLIENT',
          trustScore: 0,
        }
      }
    },
    include: {
      profile: true
    }
  });
  
  return user;
}
```

### 2.2 Companies Service (`src/companies/companies.service.ts`)

#### Créer une entreprise avec localisation

```typescript
async create(createCompanyDto: CreateCompanyDto) {
  const { locations, ...companyData } = createCompanyDto;
  
  const company = await this.prisma.company.create({
    data: {
      ...companyData,
      isVerified: false,
      size: createCompanyDto.size || null,
      ninea: createCompanyDto.ninea || null,
      rccm: createCompanyDto.rccm || null,
      // Créer la localisation
      locations: locations ? {
        create: locations.map((loc, index) => ({
          ...loc,
          isPrimary: index === 0 // Premier = principal
        }))
      } : undefined,
      // Créer le score initial
      scores: {
        create: {
          globalScore: 0,
          trustIndex: 0,
          totalReviews: 0,
        }
      },
      // Créer l'abonnement gratuit
      subscription: {
        create: {
          plan: 'FREE',
          isActive: true,
        }
      }
    },
    include: {
      locations: true,
      scores: true,
      subscription: true,
      category: true,
    }
  });
  
  return company;
}
```

#### Revendiquer une entreprise

```typescript
async claimCompany(companyId: number, userId: number) {
  // Vérifier que l'entreprise n'est pas déjà revendiquée
  const company = await this.prisma.company.findUnique({
    where: { id: companyId },
    include: { claimedBy: true }
  });
  
  if (company.claimedByUserId) {
    throw new Error('Cette entreprise a déjà été revendiquée');
  }
  
  // Revendiquer l'entreprise
  return this.prisma.company.update({
    where: { id: companyId },
    data: {
      claimedByUserId: userId,
      // L'entreprise devient vérifiée après validation manuelle
      // isVerified: true
    },
    include: {
      claimedBy: {
        include: {
          profile: true
        }
      }
    }
  });
}
```

#### Recherche géographique

```typescript
async findByLocation(region?: string, city?: string) {
  return this.prisma.company.findMany({
    where: {
      locations: {
        some: {
          ...(region && { region }),
          ...(city && { city }),
        }
      }
    },
    include: {
      locations: {
        where: {
          isPrimary: true
        }
      },
      scores: true,
      category: true,
    }
  });
}
```

### 2.3 Reviews Service (`src/reviews/reviews.service.ts`)

#### Créer un avis avec scores multi-critères

```typescript
async create(createReviewDto: CreateReviewDto) {
  const { scores, ...reviewData } = createReviewDto;
  
  const review = await this.prisma.review.create({
    data: {
      ...reviewData,
      status: 'PENDING', // En attente de validation
      context: createReviewDto.context || 'CLIENT',
      // Créer les scores par critère
      scores: scores ? {
        create: scores.map(s => ({
          criteriaId: s.criteriaId,
          score: s.score
        }))
      } : undefined
    },
    include: {
      scores: {
        include: {
          criteria: true
        }
      },
      user: {
        include: {
          profile: true
        }
      }
    }
  });
  
  // Recalculer les scores de l'entreprise
  await this.updateCompanyScores(reviewData.companyId);
  
  // Augmenter le trust score de l'utilisateur
  await this.updateUserTrustScore(reviewData.userId);
  
  return review;
}
```

#### Approuver un avis (pour modérateurs)

```typescript
async approveReview(reviewId: number) {
  const review = await this.prisma.review.update({
    where: { id: reviewId },
    data: {
      status: 'APPROVED'
    },
    include: {
      company: true,
      user: true
    }
  });
  
  // Recalculer les scores
  await this.updateCompanyScores(review.companyId);
  
  return review;
}
```

#### Calculer le score global d'une entreprise

```typescript
async updateCompanyScores(companyId: number) {
  // Récupérer tous les avis approuvés
  const reviews = await this.prisma.review.findMany({
    where: {
      companyId,
      status: 'APPROVED'
    },
    include: {
      scores: {
        include: {
          criteria: true
        }
      }
    }
  });
  
  if (reviews.length === 0) {
    return this.prisma.companyScore.update({
      where: { companyId },
      data: {
        globalScore: 0,
        trustIndex: 0,
        totalReviews: 0,
      }
    });
  }
  
  // Calculer le score pondéré
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  reviews.forEach(review => {
    review.scores.forEach(score => {
      totalWeightedScore += score.score * score.criteria.weight;
      totalWeight += score.criteria.weight;
    });
  });
  
  const globalScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  
  // Calculer l'indice de confiance (basé sur le nombre d'avis)
  const trustIndex = Math.min(reviews.length / 10, 1.0);
  
  return this.prisma.companyScore.update({
    where: { companyId },
    data: {
      globalScore,
      trustIndex,
      totalReviews: reviews.length,
    }
  });
}
```

#### Mettre à jour le trust score d'un utilisateur

```typescript
async updateUserTrustScore(userId: number) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: {
      reviews: {
        where: {
          status: 'APPROVED'
        }
      },
      profile: true
    }
  });
  
  if (!user.profile) return;
  
  // Calculer le trust score basé sur:
  // - Nombre d'avis approuvés
  // - Ancienneté du compte
  // - Vérification du compte
  
  const approvedReviews = user.reviews.length;
  const accountAge = Date.now() - user.createdAt.getTime();
  const daysOld = accountAge / (1000 * 60 * 60 * 24);
  
  let trustScore = 0;
  
  // Points pour les avis approuvés (max 50 points)
  trustScore += Math.min(approvedReviews * 5, 50);
  
  // Points pour l'ancienneté (max 30 points)
  trustScore += Math.min(daysOld / 10, 30);
  
  // Points pour la vérification (20 points)
  if (user.isVerified) {
    trustScore += 20;
  }
  
  // Normaliser sur 100
  trustScore = Math.min(trustScore, 100);
  
  await this.prisma.userProfile.update({
    where: { userId },
    data: {
      trustScore: trustScore / 100 // 0-1
    }
  });
}
```

#### Filtrer les avis par contexte

```typescript
async findByCompanyAndContext(companyId: number, context?: string) {
  return this.prisma.review.findMany({
    where: {
      companyId,
      status: 'APPROVED',
      ...(context && { context: context as any })
    },
    include: {
      scores: {
        include: {
          criteria: true
        }
      },
      user: {
        include: {
          profile: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}
```

### 2.4 Nouveau service - Subscriptions

Créer `src/subscriptions/subscriptions.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}
  
  async upgradeSubscription(companyId: number, plan: 'PRO' | 'PREMIUM') {
    const duration = plan === 'PRO' ? 30 : 365; // jours
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);
    
    return this.prisma.subscription.update({
      where: { companyId },
      data: {
        plan,
        endDate,
        isActive: true,
      }
    });
  }
  
  async checkSubscriptionStatus(companyId: number) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { companyId }
    });
    
    if (!subscription) return null;
    
    // Vérifier si l'abonnement a expiré
    if (subscription.endDate && subscription.endDate < new Date()) {
      await this.prisma.subscription.update({
        where: { companyId },
        data: {
          isActive: false,
          plan: 'FREE'
        }
      });
      
      return { ...subscription, isActive: false, plan: 'FREE' };
    }
    
    return subscription;
  }
}
```

### 2.5 Nouveau service - Rating Criteria

Créer `src/rating-criteria/rating-criteria.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RatingCriteriaService {
  constructor(private prisma: PrismaService) {}
  
  async findAll() {
    return this.prisma.ratingCriteria.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        weight: 'desc'
      }
    });
  }
  
  async findBySector(categoryId: number) {
    // Pour l'instant, retourner tous les critères
    // Plus tard, on pourra avoir des critères spécifiques par secteur
    return this.findAll();
  }
  
  async getCompanyScoresByCategory(categoryId: number) {
    const companies = await this.prisma.company.findMany({
      where: { categoryId },
      include: {
        scores: true,
        reviews: {
          where: {
            status: 'APPROVED'
          },
          include: {
            scores: {
              include: {
                criteria: true
              }
            }
          }
        }
      }
    });
    
    // Calculer les moyennes par critère pour chaque entreprise
    return companies.map(company => {
      const criteriaScores = new Map();
      
      company.reviews.forEach(review => {
        review.scores.forEach(score => {
          const current = criteriaScores.get(score.criteriaId) || { total: 0, count: 0 };
          criteriaScores.set(score.criteriaId, {
            total: current.total + score.score,
            count: current.count + 1
          });
        });
      });
      
      const averages = Array.from(criteriaScores.entries()).map(([criteriaId, data]) => ({
        criteriaId,
        average: data.total / data.count
      }));
      
      return {
        company,
        criteriaScores: averages
      };
    });
  }
}
```

## 3. DTOs à créer/modifier

### CreateCompanyDto

```typescript
export class CreateCompanyDto {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  tel?: string;
  activite?: string;
  categoryId: number;
  ninea?: string;
  rccm?: string;
  size?: 'TPE' | 'PME' | 'GRANDE';
  locations?: {
    region?: string;
    department?: string;
    city?: string;
    address?: string;
    lat?: number;
    lng?: number;
  }[];
}
```

### CreateReviewDto

```typescript
export class CreateReviewDto {
  rating: number;
  comment: string;
  userId: number;
  companyId: number;
  context?: 'CLIENT' | 'EMPLOYEE' | 'SUPPLIER' | 'OTHER';
  scores?: {
    criteriaId: number;
    score: number; // 1-5
  }[];
}
```

## 4. Routes API recommandées

```
GET    /companies/:id/scores          - Obtenir les scores détaillés
GET    /companies/:id/reviews?context=EMPLOYEE  - Filtrer par contexte
POST   /companies/:id/claim           - Revendiquer une entreprise
GET    /companies/search?region=Dakar - Recherche géographique
POST   /reviews/:id/approve           - Approuver un avis (admin)
POST   /reviews/:id/reject            - Rejeter un avis (admin)
GET    /rating-criteria               - Liste des critères
GET    /categories/:id/companies/rankings - Classement par secteur
POST   /subscriptions/upgrade         - Upgrader l'abonnement
```

## 5. Tâches automatiques recommandées

### Recalcul quotidien des scores

Créer un script cron ou utiliser NestJS Scheduler:

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewsService } from '../reviews/reviews.service';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private reviewsService: ReviewsService
  ) {}
  
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async recalculateAllScores() {
    console.log('Recalculating company scores...');
    
    const companies = await this.prisma.company.findMany({
      select: { id: true }
    });
    
    for (const company of companies) {
      await this.reviewsService.updateCompanyScores(company.id);
    }
    
    console.log(`Updated scores for ${companies.length} companies`);
  }
  
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async checkExpiredSubscriptions() {
    console.log('Checking expired subscriptions...');
    
    const expired = await this.prisma.subscription.updateMany({
      where: {
        endDate: {
          lt: new Date()
        },
        isActive: true
      },
      data: {
        isActive: false,
        plan: 'FREE'
      }
    });
    
    console.log(`Deactivated ${expired.count} expired subscriptions`);
  }
}
```

## 6. Prochaines étapes

1. **Installer les dépendances manquantes**
   ```bash
   npm install @nestjs/schedule
   ```

2. **Créer les nouveaux services et contrôleurs**

3. **Mettre à jour les DTOs**

4. **Ajouter les routes dans les contrôleurs**

5. **Tester les endpoints**

6. **Créer une interface admin pour la modération**

7. **Implémenter les webhooks pour les paiements (abonnements)**

## 7. Sécurité

- Toujours valider les rôles avant d'approuver/rejeter des avis
- Limiter le nombre d'avis par utilisateur/entreprise
- Vérifier que l'utilisateur est authentifié avant de revendiquer une entreprise
- Implémenter un rate limiting sur les endpoints sensibles
