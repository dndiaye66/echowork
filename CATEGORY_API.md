# Company Database and Category API Documentation

## Overview

This document describes the implementation of the company database and enhanced category APIs for EchoWork. The system extracts company information from PDF files and provides comprehensive category-based endpoints for displaying companies, reviews, job offers, and analytics.

## Database Schema Changes

### Company Model

The Company model has been enhanced with the following fields:

```prisma
model Company {
  id             Int             @id @default(autoincrement())
  name           String          // Company name (Entreprise)
  slug           String          @unique
  description    String?
  imageUrl       String?
  ville          String?         // City (Ville)
  adresse        String?         // Address (Adresse)
  tel            String?         // Telephone (Téléphone)
  activite       String?         // Activity/Business type (Activité)
  categoryId     Int
  category       Category        @relation(fields: [categoryId], references: [id])
  reviews        Review[]
  jobOffers      JobOffer[]
  advertisements Advertisement[]
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt
}
```

### Data Extraction

- **Source**: 15 PDF files containing company listings
- **Companies Extracted**: 2,608 companies
- **Categories**: 10 main categories automatically assigned based on business activity

### Categories Breakdown

1. **Commerce et Distribution** - 2,190 companies
2. **Services** - 166 companies
3. **Énergie et Pétrole** - 160 companies
4. **Santé et Pharmacie** - 24 companies
5. **Industrie** - 20 companies
6. **Alimentation et Boissons** - 18 companies
7. **Télécommunications** - 10 companies
8. **Construction et BTP** - 8 companies
9. **Agriculture** - 8 companies
10. **Automobile** - 4 companies

## API Endpoints

### 1. List All Categories

**Endpoint**: `GET /api/categories`

**Description**: Returns a list of all available categories.

**Response**:
```json
[
  {
    "id": 1,
    "name": "Énergie et Pétrole",
    "slug": "energie-et-petrole"
  },
  {
    "id": 2,
    "name": "Commerce et Distribution",
    "slug": "commerce-et-distribution"
  }
  // ...
]
```

### 2. Get Category Details

**Endpoint**: `GET /api/categories/:id`

**Description**: Returns comprehensive information about a category when a user clicks on it. This endpoint provides:

- **Top-rated companies** in the category (sorted by average rating and review count)
- **Company reviews and comments** with user information
- **Active job offers** in the category (up to 20 most recent)
- **Active advertisements** for companies in the category
- **KPIs and statistics** for the category

**Parameters**:
- `id` (path parameter): Category ID

**Response**:
```json
{
  "category": {
    "id": 1,
    "name": "Énergie et Pétrole",
    "slug": "energie-et-petrole"
  },
  "topCompanies": [
    {
      "id": 1,
      "name": "Total Senegal",
      "slug": "total-senegal",
      "description": "Vente De Produits Petroliers",
      "ville": "Dakar",
      "adresse": "BCCD",
      "tel": "33 839 54 54",
      "activite": "Vente De Produits Petroliers",
      "imageUrl": null,
      "categoryId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "averageRating": 4.5,
      "reviewCount": 15,
      "reviews": [
        {
          "id": 1,
          "rating": 5,
          "comment": "Excellent service!",
          "upvotes": 10,
          "downvotes": 1,
          "createdAt": "2024-01-15T10:00:00.000Z",
          "user": {
            "id": 1,
            "username": "john_doe"
          }
        }
        // ... more reviews
      ]
    }
    // ... top 10 companies
  ],
  "jobOffers": [
    {
      "id": 1,
      "title": "Ingénieur Pétrolier",
      "description": "Recherche ingénieur expérimenté...",
      "salary": "2000000 - 3000000 FCFA",
      "location": "Dakar",
      "isActive": true,
      "createdAt": "2024-01-20T00:00:00.000Z",
      "company": {
        "id": 1,
        "name": "Total Senegal",
        "slug": "total-senegal"
      }
    }
    // ... up to 20 job offers
  ],
  "advertisements": [
    {
      "id": 1,
      "title": "Promotion carburant",
      "content": "10% de réduction sur tous les carburants",
      "imageUrl": "https://example.com/promo.jpg",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T00:00:00.000Z",
      "isActive": true,
      "company": {
        "id": 1,
        "name": "Total Senegal",
        "slug": "total-senegal"
      }
    }
    // ... up to 10 advertisements
  ],
  "kpis": {
    "totalCompanies": 160,
    "totalReviews": 450,
    "totalJobOffers": 12,
    "averageRating": 4.2,
    "reviewDistribution": {
      "5": 200,
      "4": 150,
      "3": 80,
      "2": 15,
      "1": 5
    }
  }
}
```

**KPIs Explanation**:
- `totalCompanies`: Number of companies in the category
- `totalReviews`: Total number of reviews for all companies in category
- `totalJobOffers`: Number of active job offers in category
- `averageRating`: Average rating across all companies in category
- `reviewDistribution`: Count of reviews by rating (1-5 stars)

### 3. Search Companies in Category

**Endpoint**: `GET /api/categories/:id/search?q={query}`

**Description**: Search for companies within a specific category. Searches across company name, description, city, and activity fields.

**Parameters**:
- `id` (path parameter): Category ID
- `q` (query parameter): Search query string

**Example**: `GET /api/categories/1/search?q=dakar`

**Response**:
```json
[
  {
    "id": 1,
    "name": "Total Senegal",
    "slug": "total-senegal",
    "description": "Vente De Produits Petroliers",
    "ville": "Dakar",
    "adresse": "BCCD",
    "tel": "33 839 54 54",
    "activite": "Vente De Produits Petroliers",
    "imageUrl": null,
    "categoryId": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "averageRating": 4.5,
    "reviewCount": 15,
    "category": {
      "id": 1,
      "name": "Énergie et Pétrole",
      "slug": "energie-et-petrole"
    },
    "reviews": [
      {
        "id": 1,
        "rating": 5,
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
      // ... review summary
    ]
  }
  // ... more matching companies
]
```

## Setup and Migration

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Generate Prisma Client

```bash
npm run prisma:generate
```

### 3. Run Database Migration

```bash
npm run prisma:migrate
```

This will create a new migration file and apply the schema changes to add the new company fields.

### 4. Seed the Database

```bash
npm run prisma:seed
```

This will:
1. Create all categories
2. Import all 2,608 companies from the extracted PDF data
3. Associate each company with its appropriate category

**Note**: The PDF extraction has already been completed and the data is available in `backend/prisma/seed.ts`. The seed script reads from the categorized company data.

## Frontend Integration

### Example: Displaying Category Page

```javascript
import { useEffect, useState } from 'react';
import axios from 'axios';

function CategoryPage({ categoryId }) {
  const [categoryData, setCategoryData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    // Fetch category details
    axios.get(`/api/categories/${categoryId}`)
      .then(response => setCategoryData(response.data))
      .catch(error => console.error(error));
  }, [categoryId]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length > 0) {
      axios.get(`/api/categories/${categoryId}/search?q=${query}`)
        .then(response => setSearchResults(response.data))
        .catch(error => console.error(error));
    }
  };

  if (!categoryData) return <div>Loading...</div>;

  return (
    <div>
      <h1>{categoryData.category.name}</h1>
      
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Rechercher une entreprise..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {/* KPIs Dashboard */}
      <div className="kpis">
        <div>Total Entreprises: {categoryData.kpis.totalCompanies}</div>
        <div>Total Avis: {categoryData.kpis.totalReviews}</div>
        <div>Offres d'emploi: {categoryData.kpis.totalJobOffers}</div>
        <div>Note Moyenne: {categoryData.kpis.averageRating}/5</div>
      </div>

      {/* Top Rated Companies */}
      <h2>Entreprises les mieux notées</h2>
      {categoryData.topCompanies.map(company => (
        <div key={company.id}>
          <h3>{company.name}</h3>
          <p>Ville: {company.ville}</p>
          <p>Téléphone: {company.tel}</p>
          <p>Note: {company.averageRating}/5 ({company.reviewCount} avis)</p>
          
          {/* Display reviews */}
          {company.reviews.map(review => (
            <div key={review.id}>
              <strong>{review.user.username}</strong>: {review.comment}
              <span>({review.rating}/5)</span>
            </div>
          ))}
        </div>
      ))}

      {/* Job Offers */}
      <h2>Offres d'emploi</h2>
      {categoryData.jobOffers.map(offer => (
        <div key={offer.id}>
          <h3>{offer.title}</h3>
          <p>{offer.description}</p>
          <p>Salaire: {offer.salary}</p>
          <p>Entreprise: {offer.company.name}</p>
        </div>
      ))}

      {/* Advertisements */}
      <h2>Publicités</h2>
      {categoryData.advertisements.map(ad => (
        <div key={ad.id}>
          <h3>{ad.title}</h3>
          <p>{ad.content}</p>
          {ad.imageUrl && <img src={ad.imageUrl} alt={ad.title} />}
        </div>
      ))}
    </div>
  );
}
```

## Error Handling

All endpoints implement proper error handling:

- **404 Not Found**: Returned when a category ID doesn't exist
- **500 Internal Server Error**: Returned for database or server errors
- All errors are logged with the NestJS Logger

## Performance Considerations

1. **Pagination**: Job offers are limited to 20 most recent
2. **Top Companies**: Limited to top 10 by rating
3. **Indexes**: Database indexes on category IDs, ratings, and slugs for fast queries
4. **Caching**: Consider implementing Redis caching for category details in production

## Security

- No authentication required for read-only category endpoints
- Search queries use parameterized queries to prevent SQL injection
- Input sanitization handled by NestJS validators

## Testing

To test the APIs after setup:

```bash
# List all categories
curl http://localhost:3000/api/categories

# Get category details
curl http://localhost:3000/api/categories/1

# Search in category
curl "http://localhost:3000/api/categories/1/search?q=dakar"
```

## Future Enhancements

1. Add pagination to company lists
2. Implement filtering by rating, location, etc.
3. Add sorting options (by rating, name, recent reviews)
4. Implement category-wide statistics dashboard
5. Add company comparison feature
6. Implement favorites/bookmarks for companies
