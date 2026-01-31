# Admin Backoffice - Implementation Guide

This guide describes the implementation of the super-admin backoffice for EchoWork.

## Overview

The admin backoffice provides comprehensive management capabilities for the entire application, including:

- **Dashboard with statistics**: Real-time metrics and KPIs
- **User management**: Manage users, roles, and permissions
- **Reviews moderation**: Approve or reject pending reviews
- **Companies management**: CRUD operations for companies
- **Job offers management**: Create and manage job postings
- **Advertisements management**: Manage promotional content

## Setup Instructions

### 1. Create Super-Admin User

First, create the super-admin account:

```bash
cd backend
npm run create:admin
```

This will create a user with the following credentials:
- **Email**: admin@echowork.com
- **Username**: superadmin
- **Password**: Admin@2024!Echowork
- **Role**: ADMIN

**⚠️ IMPORTANT**: Change the password after first login!

### 2. Start the Application

**Backend:**
```bash
cd backend
npm install
npm run start:dev
```

**Frontend:**
```bash
npm install
npm run dev
```

### 3. Access the Admin Dashboard

1. Navigate to: `http://localhost:5173/login`
2. Log in with the super-admin credentials
3. Access the dashboard at: `http://localhost:5173/admin`

## Features

### 1. Dashboard (`/admin`)

The main dashboard displays:

#### Statistics Cards:
- **Total Users**: Number of registered users
- **Total Companies**: Number of listed companies
- **Total Reviews**: All reviews (approved + pending + rejected)
- **Average Rating**: Overall rating across all companies
- **Pending Reviews**: Reviews awaiting moderation
- **Approved Reviews**: Published reviews
- **Job Offers**: Total job postings
- **Active Advertisements**: Currently running ads

#### Recent Activity:
- **Recent Reviews**: Last 5 reviews submitted
- **Recent Users**: Last 5 users registered

#### Management Links:
- Companies Management
- Users Management
- Reviews Moderation
- Job Offers Management
- Advertisements Management

### 2. Users Management (`/admin/users`)

Features:
- **View all users** with detailed information
- **Update user roles**: Change between USER, MODERATOR, and ADMIN
- **Delete users**: Remove user accounts (except your own)
- **Statistics**: Count of admins, moderators, and regular users
- **User details**: Username, email, phone, verification status
- **Activity metrics**: Number of reviews and claimed companies per user

### 3. Reviews Moderation (`/admin/reviews`)

Features:
- **View pending reviews**: All reviews awaiting approval
- **Approve reviews**: Publish reviews to the site
- **Reject reviews**: Hide inappropriate or spam reviews
- **Review details**: Rating, comment, user info, company name
- **Context information**: Whether review is from CLIENT, EMPLOYEE, or SUPPLIER
- **Vote tracking**: See upvotes and downvotes

### 4. Companies Management (`/admin/companies`)

Features:
- **Create companies**: Add new businesses to the platform
- **Update companies**: Edit company information
- **Delete companies**: Remove companies from the platform
- **Required fields**: Name, slug, category
- **Optional fields**: Description, image URL

### 5. Job Offers Management (`/admin/job-offers`)

Features:
- **Create job offers**: Post new job opportunities
- **Update job offers**: Edit job details
- **Delete job offers**: Remove job postings
- **Filter by company**: View jobs for specific companies
- **Activate/deactivate**: Control job visibility

### 6. Advertisements Management (`/admin/advertisements`)

Features:
- **Create advertisements**: Add new promotional content
- **Update advertisements**: Edit ad details
- **Delete advertisements**: Remove advertisements
- **Schedule ads**: Set start and end dates
- **Ad types**: Banner or Sponsored content
- **Status control**: ACTIVE, PAUSED, or ENDED

## API Endpoints

All admin endpoints require authentication (JWT token) and ADMIN role.

### Dashboard
```
GET /api/admin/dashboard/stats
```

Response:
```json
{
  "stats": {
    "totalUsers": 150,
    "totalCompanies": 2608,
    "totalReviews": 543,
    "approvedReviews": 510,
    "pendingReviews": 33,
    "totalJobOffers": 45,
    "totalAdvertisements": 12,
    "activeAdvertisements": 8,
    "averageRating": 4.2
  },
  "recentReviews": [...],
  "recentUsers": [...]
}
```

### Users Management
```
GET    /api/admin/users              # List all users
PUT    /api/admin/users/:id/role     # Update user role
DELETE /api/admin/users/:id          # Delete user
```

### Reviews Moderation
```
GET    /api/admin/reviews/pending    # Get pending reviews
PUT    /api/admin/reviews/:id/approve # Approve review
PUT    /api/admin/reviews/:id/reject  # Reject review
```

### Companies Management
```
POST   /api/admin/companies          # Create company
PUT    /api/admin/companies/:id      # Update company
DELETE /api/admin/companies/:id      # Delete company
```

### Job Offers Management
```
GET    /api/admin/job-offers         # List job offers
POST   /api/admin/job-offers         # Create job offer
PUT    /api/admin/job-offers/:id     # Update job offer
DELETE /api/admin/job-offers/:id     # Delete job offer
```

### Advertisements Management
```
GET    /api/admin/advertisements     # List advertisements
POST   /api/admin/advertisements     # Create advertisement
PUT    /api/admin/advertisements/:id # Update advertisement
DELETE /api/admin/advertisements/:id # Delete advertisement
```

## Security

### Authentication
- All admin routes require JWT authentication
- Only users with ADMIN role can access admin endpoints
- AdminGuard validates user role on each request

### Authorization
- Users cannot delete themselves
- Users cannot change their own role
- All sensitive operations require confirmation

### Best Practices
1. Change default admin password immediately
2. Use strong passwords (12+ characters)
3. Don't share admin credentials
4. Regularly audit admin access
5. Monitor admin activities
6. Use HTTPS in production
7. Keep JWT_SECRET secure

## File Structure

### Backend
```
backend/src/admin/
├── admin.controller.ts         # Admin API endpoints
├── admin.service.ts            # Business logic
├── admin.guard.ts              # Role authorization guard
├── admin.module.ts             # Module definition
└── dto/
    ├── create-company.dto.ts
    ├── update-company.dto.ts
    ├── create-job-offer.dto.ts
    └── create-advertisement.dto.ts

backend/prisma/
└── create-admin.ts             # Script to create super-admin
```

### Frontend
```
src/pages/admin/
├── AdminDashboard.jsx          # Main dashboard with stats
├── UsersManagement.jsx         # User management page
├── ReviewsModeration.jsx       # Reviews moderation page
├── CompaniesManagement.jsx     # Companies CRUD
├── JobOffersManagement.jsx     # Job offers CRUD
└── AdvertisementsManagement.jsx # Ads CRUD
```

## UI Components

The admin interface uses:
- **DaisyUI**: For styled components (cards, buttons, tables)
- **Tailwind CSS**: For responsive layouts
- **Lucide React**: For icons
- **React Router**: For navigation

## Troubleshooting

### Cannot access admin dashboard
- Ensure you're logged in with an ADMIN account
- Check that the backend is running
- Verify JWT token is valid

### Statistics not loading
- Check backend logs for errors
- Verify database connection
- Ensure all tables exist (run migrations)

### Cannot create/update/delete
- Verify you have ADMIN role
- Check network console for API errors
- Review backend logs for validation errors

### Password issues
- Run `npm run create:admin` again to recreate the admin user
- Use Prisma Studio to manually update the password
- Check that bcrypt is installed correctly

## Production Deployment

Before deploying to production:

1. **Change default credentials**:
   - Create new admin with strong password
   - Delete or disable default admin account

2. **Secure environment variables**:
   - Set strong JWT_SECRET
   - Use secure database credentials
   - Configure proper CORS settings

3. **Enable HTTPS**:
   - Use SSL certificates
   - Redirect HTTP to HTTPS
   - Set secure cookie flags

4. **Database backups**:
   - Set up automated backups
   - Test restore procedures
   - Monitor database health

5. **Logging and monitoring**:
   - Enable application logs
   - Set up error tracking
   - Monitor admin activities
   - Alert on suspicious actions

## Support

For issues or questions:
1. Check the documentation in `/ADMIN_CREDENTIALS.md`
2. Review API endpoint documentation
3. Check backend logs for errors
4. Verify database schema is up to date

## License

This project is under GNU General Public License v3.0.
