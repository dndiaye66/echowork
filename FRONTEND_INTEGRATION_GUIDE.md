# Guide d'intégration Frontend

Ce guide explique comment adapter le frontend pour utiliser la nouvelle structure de base de données et les nouvelles fonctionnalités.

## 1. Nouveaux types TypeScript

Créer `src/types/database.types.ts`:

```typescript
// Enums
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

export enum ProfileType {
  CLIENT = 'CLIENT',
  EMPLOYEE = 'EMPLOYEE',
  SUPPLIER = 'SUPPLIER',
  OTHER = 'OTHER'
}

export enum CompanySize {
  TPE = 'TPE',
  PME = 'PME',
  GRANDE = 'GRANDE'
}

export enum ReviewContext {
  CLIENT = 'CLIENT',
  EMPLOYEE = 'EMPLOYEE',
  SUPPLIER = 'SUPPLIER',
  OTHER = 'OTHER'
}

export enum ReviewStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM'
}

// Interfaces
export interface UserProfile {
  id: number;
  userId: number;
  fullName?: string;
  profileType: ProfileType;
  trustScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
  profile?: UserProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyLocation {
  id: number;
  companyId: number;
  region?: string;
  department?: string;
  city?: string;
  address?: string;
  lat?: number;
  lng?: number;
  isPrimary: boolean;
}

export interface CompanyScore {
  id: number;
  companyId: number;
  globalScore: number;
  trustIndex: number;
  totalReviews: number;
  lastUpdated: Date;
}

export interface Subscription {
  id: number;
  companyId: number;
  plan: SubscriptionPlan;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface Company {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  tel?: string;
  activite?: string;
  ninea?: string;
  rccm?: string;
  size?: CompanySize;
  isVerified: boolean;
  claimedByUserId?: number;
  categoryId: number;
  locations?: CompanyLocation[];
  scores?: CompanyScore;
  subscription?: Subscription;
  createdAt: Date;
  updatedAt: Date;
}

export interface RatingCriteria {
  id: number;
  name: string;
  description?: string;
  weight: number;
  isActive: boolean;
}

export interface ReviewScore {
  id: number;
  reviewId: number;
  criteriaId: number;
  criteria?: RatingCriteria;
  score: number;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  context: ReviewContext;
  status: ReviewStatus;
  userId: number;
  user?: User;
  companyId: number;
  upvotes: number;
  downvotes: number;
  scores?: ReviewScore[];
  createdAt: Date;
  updatedAt: Date;
}
```

## 2. Composants UI à créer/modifier

### 2.1 Badge de vérification

`src/components/VerificationBadge.tsx`:

```tsx
import React from 'react';

interface VerificationBadgeProps {
  isVerified: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({ 
  isVerified, 
  size = 'md' 
}) => {
  if (!isVerified) return null;
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  return (
    <span 
      className="inline-flex items-center" 
      title="Entreprise vérifiée (NINEA/RCCM confirmé)"
    >
      <svg 
        className={`${sizeClasses[size]} text-blue-500`}
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path 
          fillRule="evenodd" 
          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
          clipRule="evenodd" 
        />
      </svg>
    </span>
  );
};
```

### 2.2 Affichage du Trust Score utilisateur

`src/components/TrustScoreDisplay.tsx`:

```tsx
import React from 'react';

interface TrustScoreDisplayProps {
  trustScore: number; // 0-1
  showLabel?: boolean;
}

export const TrustScoreDisplay: React.FC<TrustScoreDisplayProps> = ({ 
  trustScore, 
  showLabel = true 
}) => {
  const percentage = Math.round(trustScore * 100);
  
  const getColor = (score: number) => {
    if (score >= 0.7) return 'text-green-600 bg-green-100';
    if (score >= 0.4) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };
  
  const getLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Très bon';
    if (score >= 0.4) return 'Bon';
    if (score >= 0.2) return 'Moyen';
    return 'Nouveau';
  };
  
  return (
    <div className="flex items-center gap-2">
      <div className={`px-2 py-1 rounded text-sm font-medium ${getColor(trustScore)}`}>
        {percentage}%
      </div>
      {showLabel && (
        <span className="text-sm text-gray-600">
          {getLabel(trustScore)}
        </span>
      )}
    </div>
  );
};
```

### 2.3 Sélecteur de contexte d'avis

`src/components/ReviewContextSelector.tsx`:

```tsx
import React from 'react';
import { ReviewContext } from '../types/database.types';

interface ReviewContextSelectorProps {
  value: ReviewContext;
  onChange: (context: ReviewContext) => void;
}

export const ReviewContextSelector: React.FC<ReviewContextSelectorProps> = ({ 
  value, 
  onChange 
}) => {
  const contexts = [
    { value: ReviewContext.CLIENT, label: 'Client', icon: '🛍️' },
    { value: ReviewContext.EMPLOYEE, label: 'Employé', icon: '👔' },
    { value: ReviewContext.SUPPLIER, label: 'Fournisseur', icon: '🚚' },
    { value: ReviewContext.OTHER, label: 'Autre', icon: '👤' },
  ];
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Vous évaluez en tant que:
      </label>
      <div className="grid grid-cols-2 gap-3">
        {contexts.map((ctx) => (
          <button
            key={ctx.value}
            type="button"
            onClick={() => onChange(ctx.value)}
            className={`
              flex items-center justify-center gap-2 p-3 rounded-lg border-2 
              transition-all
              ${value === ctx.value 
                ? 'border-blue-500 bg-blue-50 text-blue-700' 
                : 'border-gray-200 hover:border-gray-300'
              }
            `}
          >
            <span className="text-2xl">{ctx.icon}</span>
            <span className="font-medium">{ctx.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
```

### 2.4 Notation multi-critères

`src/components/MultiCriteriaRating.tsx`:

```tsx
import React, { useState, useEffect } from 'react';
import { RatingCriteria, ReviewScore } from '../types/database.types';

interface MultiCriteriaRatingProps {
  onChange: (scores: { criteriaId: number; score: number }[]) => void;
}

export const MultiCriteriaRating: React.FC<MultiCriteriaRatingProps> = ({ 
  onChange 
}) => {
  const [criteria, setCriteria] = useState<RatingCriteria[]>([]);
  const [scores, setScores] = useState<Map<number, number>>(new Map());
  
  useEffect(() => {
    // Charger les critères depuis l'API
    fetch('/api/rating-criteria')
      .then(res => res.json())
      .then(data => setCriteria(data));
  }, []);
  
  const handleScoreChange = (criteriaId: number, score: number) => {
    const newScores = new Map(scores);
    newScores.set(criteriaId, score);
    setScores(newScores);
    
    // Notifier le parent
    onChange(Array.from(newScores.entries()).map(([criteriaId, score]) => ({
      criteriaId,
      score
    })));
  };
  
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Évaluez selon différents critères</h3>
      {criteria.map((criterion) => (
        <div key={criterion.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              {criterion.name}
            </label>
            <span className="text-sm text-gray-500">
              {scores.get(criterion.id) || 0}/5
            </span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleScoreChange(criterion.id, star)}
                className="focus:outline-none"
              >
                <svg
                  className={`w-8 h-8 ${
                    (scores.get(criterion.id) || 0) >= star
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
          {criterion.description && (
            <p className="text-xs text-gray-500">{criterion.description}</p>
          )}
        </div>
      ))}
    </div>
  );
};
```

### 2.5 Affichage des scores d'entreprise

`src/components/CompanyScoreCard.tsx`:

```tsx
import React from 'react';
import { CompanyScore } from '../types/database.types';

interface CompanyScoreCardProps {
  score: CompanyScore;
}

export const CompanyScoreCard: React.FC<CompanyScoreCardProps> = ({ score }) => {
  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600';
    if (score >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getTrustColor = (trust: number) => {
    if (trust >= 0.7) return 'bg-green-500';
    if (trust >= 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold">
            <span className={getScoreColor(score.globalScore)}>
              {score.globalScore.toFixed(1)}
            </span>
            <span className="text-gray-400 text-lg">/5</span>
          </h3>
          <p className="text-sm text-gray-600">
            Basé sur {score.totalReviews} avis
          </p>
        </div>
        
        <div className="text-center">
          <div className="mb-1">
            <div className="w-16 h-16 rounded-full border-4 border-gray-200 flex items-center justify-center">
              <div 
                className={`w-12 h-12 rounded-full ${getTrustColor(score.trustIndex)} flex items-center justify-center text-white font-bold`}
              >
                {Math.round(score.trustIndex * 100)}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-600">Indice de confiance</p>
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        Dernière mise à jour: {new Date(score.lastUpdated).toLocaleDateString('fr-FR')}
      </div>
    </div>
  );
};
```

### 2.6 Filtre par contexte d'avis

`src/components/ReviewsFilter.tsx`:

```tsx
import React from 'react';
import { ReviewContext } from '../types/database.types';

interface ReviewsFilterProps {
  currentContext?: ReviewContext;
  onFilterChange: (context?: ReviewContext) => void;
  reviewCounts: Record<string, number>;
}

export const ReviewsFilter: React.FC<ReviewsFilterProps> = ({ 
  currentContext, 
  onFilterChange,
  reviewCounts 
}) => {
  const filters = [
    { value: undefined, label: 'Tous les avis', icon: '📋' },
    { value: ReviewContext.CLIENT, label: 'Clients', icon: '🛍️' },
    { value: ReviewContext.EMPLOYEE, label: 'Employés', icon: '👔' },
    { value: ReviewContext.SUPPLIER, label: 'Fournisseurs', icon: '🚚' },
  ];
  
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {filters.map((filter) => {
        const count = filter.value ? reviewCounts[filter.value] || 0 : Object.values(reviewCounts).reduce((a, b) => a + b, 0);
        const isActive = currentContext === filter.value;
        
        return (
          <button
            key={filter.label}
            onClick={() => onFilterChange(filter.value)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap
              transition-all
              ${isActive 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span>{filter.icon}</span>
            <span className="font-medium">{filter.label}</span>
            <span className={`
              text-sm px-2 py-0.5 rounded-full
              ${isActive ? 'bg-blue-600' : 'bg-gray-200'}
            `}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
```

### 2.7 Carte d'entreprise avec localisation

`src/components/CompanyLocationCard.tsx`:

```tsx
import React from 'react';
import { CompanyLocation } from '../types/database.types';

interface CompanyLocationCardProps {
  location: CompanyLocation;
  showMap?: boolean;
}

export const CompanyLocationCard: React.FC<CompanyLocationCardProps> = ({ 
  location, 
  showMap = false 
}) => {
  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-start gap-3">
        <div className="text-blue-500 mt-1">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        </div>
        
        <div className="flex-1">
          {location.isPrimary && (
            <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded mb-2">
              Principal
            </span>
          )}
          
          <div className="space-y-1 text-sm">
            {location.address && (
              <p className="text-gray-900">{location.address}</p>
            )}
            {location.city && (
              <p className="text-gray-600">{location.city}</p>
            )}
            {location.region && (
              <p className="text-gray-500">Région de {location.region}</p>
            )}
          </div>
          
          {showMap && location.lat && location.lng && (
            <a
              href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              Voir sur la carte
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
```

## 3. Pages à créer/modifier

### 3.1 Page profil entreprise enrichie

```tsx
// src/pages/CompanyProfile.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Company, Review, ReviewContext } from '../types/database.types';
import { CompanyScoreCard } from '../components/CompanyScoreCard';
import { VerificationBadge } from '../components/VerificationBadge';
import { ReviewsFilter } from '../components/ReviewsFilter';
import { CompanyLocationCard } from '../components/CompanyLocationCard';

export const CompanyProfile: React.FC = () => {
  const { slug } = useParams();
  const [company, setCompany] = useState<Company | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filterContext, setFilterContext] = useState<ReviewContext>();
  
  useEffect(() => {
    // Charger l'entreprise
    fetch(`/api/companies/${slug}`)
      .then(res => res.json())
      .then(setCompany);
  }, [slug]);
  
  useEffect(() => {
    // Charger les avis avec filtre
    const params = new URLSearchParams();
    if (filterContext) params.set('context', filterContext);
    
    fetch(`/api/companies/${company?.id}/reviews?${params}`)
      .then(res => res.json())
      .then(setReviews);
  }, [company?.id, filterContext]);
  
  if (!company) return <div>Chargement...</div>;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne principale */}
        <div className="lg:col-span-2">
          {/* En-tête */}
          <div className="mb-6">
            <div className="flex items-start gap-4">
              {company.imageUrl && (
                <img 
                  src={company.imageUrl} 
                  alt={company.name}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold">{company.name}</h1>
                  <VerificationBadge isVerified={company.isVerified} size="lg" />
                </div>
                <p className="text-gray-600 mt-1">{company.activite}</p>
                
                {/* Badges */}
                <div className="flex gap-2 mt-3">
                  {company.size && (
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                      {company.size}
                    </span>
                  )}
                  {company.ninea && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      NINEA: {company.ninea}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Scores */}
          {company.scores && (
            <CompanyScoreCard score={company.scores} />
          )}
          
          {/* Avis */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Avis</h2>
            <ReviewsFilter 
              currentContext={filterContext}
              onFilterChange={setFilterContext}
              reviewCounts={{
                CLIENT: reviews.filter(r => r.context === 'CLIENT').length,
                EMPLOYEE: reviews.filter(r => r.context === 'EMPLOYEE').length,
                SUPPLIER: reviews.filter(r => r.context === 'SUPPLIER').length,
              }}
            />
            {/* Liste des avis */}
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Localisations */}
          {company.locations && company.locations.length > 0 && (
            <div>
              <h3 className="font-bold mb-3">Localisations</h3>
              <div className="space-y-3">
                {company.locations.map(location => (
                  <CompanyLocationCard 
                    key={location.id} 
                    location={location}
                    showMap
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Abonnement */}
          {company.subscription && company.subscription.plan !== 'FREE' && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="font-bold">Membre {company.subscription.plan}</span>
              </div>
              <p className="text-sm opacity-90">
                Entreprise premium vérifiée
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

## 4. Hooks personnalisés

### 4.1 Hook pour charger les critères

```typescript
// src/hooks/useRatingCriteria.ts
import { useState, useEffect } from 'react';
import { RatingCriteria } from '../types/database.types';

export const useRatingCriteria = () => {
  const [criteria, setCriteria] = useState<RatingCriteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    fetch('/api/rating-criteria')
      .then(res => res.json())
      .then(data => {
        setCriteria(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);
  
  return { criteria, loading, error };
};
```

### 4.2 Hook pour revendiquer une entreprise

```typescript
// src/hooks/useClaimCompany.ts
import { useState } from 'react';

export const useClaimCompany = () => {
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const claimCompany = async (companyId: number) => {
    setClaiming(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/companies/${companyId}/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Erreur lors de la revendication');
      
      return await response.json();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setClaiming(false);
    }
  };
  
  return { claimCompany, claiming, error };
};
```

## 5. Intégration de cartes (optionnel)

Pour afficher les localisations sur une carte:

```bash
npm install leaflet react-leaflet
npm install -D @types/leaflet
```

```tsx
// src/components/CompanyMap.tsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface CompanyMapProps {
  locations: { lat: number; lng: number; name: string; address?: string }[];
}

export const CompanyMap: React.FC<CompanyMapProps> = ({ locations }) => {
  if (locations.length === 0) return null;
  
  const center = locations[0];
  
  return (
    <MapContainer 
      center={[center.lat, center.lng]} 
      zoom={13} 
      style={{ height: '400px', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {locations.map((location, index) => (
        <Marker key={index} position={[location.lat, location.lng]}>
          <Popup>
            <strong>{location.name}</strong>
            {location.address && <p>{location.address}</p>}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};
```

## 6. Mise à jour des services API

```typescript
// src/services/api.ts
import { ReviewContext, CompanySize } from '../types/database.types';

export const api = {
  companies: {
    getBySlug: (slug: string) => 
      fetch(`/api/companies/${slug}`).then(res => res.json()),
    
    search: (filters: { region?: string; city?: string; category?: number }) => {
      const params = new URLSearchParams(filters as any);
      return fetch(`/api/companies/search?${params}`).then(res => res.json());
    },
    
    claim: (companyId: number) =>
      fetch(`/api/companies/${companyId}/claim`, { method: 'POST' })
        .then(res => res.json()),
  },
  
  reviews: {
    create: (data: {
      rating: number;
      comment: string;
      companyId: number;
      context: ReviewContext;
      scores: { criteriaId: number; score: number }[];
    }) =>
      fetch(`/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).then(res => res.json()),
    
    getByCompany: (companyId: number, context?: ReviewContext) => {
      const params = new URLSearchParams();
      if (context) params.set('context', context);
      return fetch(`/api/companies/${companyId}/reviews?${params}`)
        .then(res => res.json());
    },
  },
  
  ratingCriteria: {
    getAll: () =>
      fetch(`/api/rating-criteria`).then(res => res.json()),
  },
};
```

## 7. Prochaines étapes

1. **Implémenter les nouveaux composants**
2. **Mettre à jour les pages existantes**
3. **Créer une page de modération pour les admins**
4. **Ajouter la recherche géographique**
5. **Implémenter les notifications pour les entreprises revendiquées**
6. **Créer un dashboard pour les propriétaires d'entreprise**
7. **Ajouter des graphiques pour visualiser l'évolution des scores**

## 8. Design tokens recommandés

```css
/* Couleurs pour les différents contextes */
.context-client { @apply bg-blue-100 text-blue-800; }
.context-employee { @apply bg-purple-100 text-purple-800; }
.context-supplier { @apply bg-green-100 text-green-800; }
.context-other { @apply bg-gray-100 text-gray-800; }

/* Couleurs pour les statuts de review */
.status-pending { @apply bg-yellow-100 text-yellow-800; }
.status-approved { @apply bg-green-100 text-green-800; }
.status-rejected { @apply bg-red-100 text-red-800; }

/* Couleurs pour les plans d'abonnement */
.plan-free { @apply bg-gray-100 text-gray-800; }
.plan-pro { @apply bg-blue-100 text-blue-800; }
.plan-premium { @apply bg-purple-100 text-purple-800; }
```
