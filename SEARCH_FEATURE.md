# Global Search with Autocomplete Feature

## Overview
The global search feature provides intelligent autocomplete suggestions as users type their search queries. It supports both direct searches (e.g., "Banque") and rating-based searches (e.g., "meilleur restaurant").

## Features

### 1. Intelligent Search
- **Direct Search**: Type "Banque" to see all banks
- **Rating-Based Search**: Type "meilleur restaurant" to see top-rated restaurants
- **Location Search**: Type a city name to find companies in that location
- **Category Search**: Search by category names

### 2. Autocomplete Dropdown
- Real-time search results as you type
- Displays company name, location, category, and rating
- Maximum 10 results shown
- Responsive design for mobile and desktop

### 3. Keyboard Navigation
- **Arrow Down**: Move to next result
- **Arrow Up**: Move to previous result
- **Enter**: Select highlighted result
- **Escape**: Close dropdown

### 4. Visual Feedback
- Company logos (when available)
- Star ratings display
- Review count
- Category badges
- Location information

## Implementation

### Backend API Endpoint

**Endpoint**: `GET /api/companies/search/autocomplete`

**Query Parameters**:
- `q` (string, required): Search query (minimum 2 characters)
- `limit` (number, optional): Maximum results (default: 10)

**Example Requests**:
```bash
# Search for banks
GET /api/companies/search/autocomplete?q=Banque&limit=10

# Search for best restaurants
GET /api/companies/search/autocomplete?q=meilleur%20restaurant&limit=10

# Search by location
GET /api/companies/search/autocomplete?q=Dakar&limit=10
```

**Response Format**:
```json
[
  {
    "id": 1,
    "name": "Banque de Dakar",
    "slug": "banque-de-dakar",
    "description": "Services bancaires complets",
    "ville": "Dakar",
    "adresse": "Avenue du Président Lamine Gueye",
    "tel": "+221 33 123 45 67",
    "activite": "Banque",
    "imageUrl": "https://example.com/logo.png",
    "category": {
      "id": 1,
      "name": "BANQUES",
      "slug": "banques"
    },
    "averageRating": 4.67,
    "reviewCount": 3
  }
]
```

### Frontend Component

**Component**: `SearchAutocomplete.jsx`

**Location**: `/src/components/SearchAutocomplete.jsx`

**Props**:
- `placeholder` (string, optional): Input placeholder text

**Usage**:
```jsx
import SearchAutocomplete from '../components/SearchAutocomplete';

function MyPage() {
  return (
    <SearchAutocomplete placeholder="Rechercher une entreprise..." />
  );
}
```

**Features**:
- Debounced search (300ms delay)
- Click-outside to close
- Keyboard navigation support
- Automatic navigation to company page on selection

## Search Logic

### Rating Keywords
The following keywords trigger rating-based sorting:
- `meilleur` / `meilleurs` / `meilleures` (French: best)
- `top`
- `best`

### Search Fields
The search queries across multiple fields:
- Company name
- Description
- City (ville)
- Activity type (activite)
- Category name

### Sorting Behavior

**Without Rating Keywords**:
- Results sorted alphabetically by company name

**With Rating Keywords**:
1. Primary sort: Average rating (descending)
2. Secondary sort: Review count (descending)
3. Limited to top N results (default: 10)

## Technical Details

### Backend Service Method
**File**: `/backend/src/companies/companies.service.ts`
**Method**: `searchWithAutocomplete(query: string, limit: number = 10)`

Key features:
- Case-insensitive search
- Multi-field OR query
- Aggregated rating calculation
- Performance optimized with selective data fetching

### Frontend Service
**File**: `/src/services/companyService.jsx`
**Method**: `searchAutocomplete(query, limit = 10)`

Handles API communication with proper error handling.

### Debouncing
Search requests are debounced by 300ms to reduce API calls and improve performance.

## Examples

### Example 1: Search for Banks
**User types**: "Banque"
**Result**: Shows all banks in alphabetical order with their ratings

### Example 2: Best Restaurants
**User types**: "meilleur restaurant"
**Result**: Shows restaurants sorted by highest ratings first

### Example 3: Location Search
**User types**: "Dakar"
**Result**: Shows all companies in Dakar

### Example 4: Top Banks
**User types**: "top banque"
**Result**: Shows banks sorted by highest ratings

## Testing

### Manual Testing Steps
1. Navigate to the home page (VitrinePage)
2. Click on the search input
3. Type "Banque" - verify banks appear
4. Type "meilleur restaurant" - verify best-rated restaurants appear
5. Test keyboard navigation with arrow keys
6. Press Enter to navigate to a company
7. Test clicking on a result
8. Test clicking outside to close dropdown

### Test File
A test file is available at `/tmp/test-search-logic.js` that validates the search logic without requiring a database.

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Touch-friendly interface

## Future Enhancements
Possible improvements for future versions:
- Search history
- Popular searches
- Category filtering in results
- Advanced filters (price range, location distance)
- Search analytics
- Fuzzy matching for typos
- Multi-language support

## Troubleshooting

### No Results Appearing
- Ensure query is at least 2 characters
- Check network connection
- Verify backend API is running
- Check browser console for errors

### Dropdown Not Closing
- Click outside the search area
- Press Escape key
- Refresh the page if issue persists

### Slow Search Response
- Check network latency
- Verify database query performance
- Consider increasing debounce delay
- Add database indexes if needed

## API Error Codes
- `500`: Internal server error (check backend logs)
- `400`: Bad request (invalid query format)
- No results: Empty array `[]` returned
