# Admin Features Implementation Guide

## Overview
This document describes the newly implemented admin features for the EchoWork platform, including category management, advanced user management, analytics, and data export capabilities.

## Table of Contents
1. [Categories Update](#categories-update)
2. [Category Management](#category-management)
3. [Enhanced User Management](#enhanced-user-management)
4. [Analytics & Reports](#analytics--reports)
5. [Data Export](#data-export)
6. [API Endpoints](#api-endpoints)
7. [Security Features](#security-features)

## Categories Update

### New Category Added
- **Banques et Institutions Financières** has been added to the categories list
- Slug: `banques-et-institutions-financieres`
- Icon: 🏦

### Footer Categories
The footer has been updated with the following categories:
- BANQUES
- RESTAURANTS
- SERVICE PUBLICS
- HÔTELS
- SANTÉ
- VENTES AU DÉTAIL

## Category Management

### Features
- **Create Categories**: Add new categories with name, slug, and optional parent category
- **Edit Categories**: Modify existing category information
- **Delete Categories**: Remove categories (with validation to prevent data loss)
- **Hierarchical Structure**: Support for parent-child category relationships
- **Auto-slug Generation**: Automatically generates URL-friendly slugs from category names

### Access
Navigate to: `/admin/categories`

### Validation Rules
- Cannot delete categories with associated companies
- Cannot delete categories with child categories
- Slug must be unique
- Parent category must exist (if specified)
- Category cannot be its own parent

## Enhanced User Management

### New Features
- **Advanced Filters**: Filter users by role and verification status
- **User Activation/Deactivation**: Enable or disable user accounts
- **Password Reset**: Generate temporary passwords for users
- **Full User Editing**: Update username, email, phone, role, and verification status
- **User Statistics**: View review count and claimed companies per user

### Actions Available
1. **Edit User**: Modify user information
2. **Reset Password**: Generate temporary password
3. **Activate/Deactivate**: Toggle user account status
4. **Change Role**: Update user role (USER, MODERATOR, ADMIN)
5. **Delete User**: Remove user account

### Access
Navigate to: `/admin/users`

### Filters
- **By Role**: All, USER, MODERATOR, ADMIN
- **By Verification**: All, Verified, Unverified

## Analytics & Reports

### Dashboard Features

#### User Analytics
- User registration trends over time
- Customizable time periods (day, week, month, all-time)
- Registration counts by date
- Total new users in selected period

#### Company Analytics
- Total companies count
- Verified companies count
- Claimed companies count
- Companies distribution by category
- Visual bar charts for category distribution

#### Review Analytics
- Total reviews count
- Status breakdown (approved, pending, rejected)
- Rating distribution (1-5 stars)
- Visual rating distribution charts

#### Top Rankings
- **Top 10 Companies**: Ranked by average rating and review count
- **Top 10 Categories**: Ranked by review count and company count

### Access
Navigate to: `/admin/analytics`

## Data Export

### Export Capabilities
Export data to CSV format for:
- **Users**: ID, username, email, phone, role, verification status, review count, claimed companies, creation date
- **Companies**: ID, name, slug, category, city, address, phone, NINEA, verification status, review count, job offers, creation date
- **Reviews**: ID, company name, user, email, rating, comment, context, status, votes, creation date

### How to Export
1. Navigate to `/admin/analytics`
2. Click the respective export button (Users CSV, Companies CSV, Reviews CSV)
3. File will be automatically downloaded with date stamp

### File Format
- Format: CSV (Comma-Separated Values)
- Encoding: UTF-8
- Filename: `{type}-export-{YYYY-MM-DD}.csv`

## API Endpoints

### Category Management
```
GET    /admin/categories              - List all categories
POST   /admin/categories              - Create new category
PUT    /admin/categories/:id          - Update category
DELETE /admin/categories/:id          - Delete category
```

### Advanced User Management
```
GET    /admin/users                   - List all users
PATCH  /admin/users/:id               - Update user information
POST   /admin/users/:id/activate      - Activate user account
POST   /admin/users/:id/deactivate    - Deactivate user account
POST   /admin/users/:id/reset-password - Reset user password
PUT    /admin/users/:id/role          - Update user role
DELETE /admin/users/:id               - Delete user
```

### Analytics
```
GET    /admin/analytics/users?period={day|week|month|all}  - User analytics
GET    /admin/analytics/companies                          - Company analytics
GET    /admin/analytics/reviews                            - Review analytics
GET    /admin/analytics/top-companies?limit=10             - Top companies
GET    /admin/analytics/top-categories?limit=10            - Top categories
```

### Data Export
```
GET    /admin/export/users            - Export users to JSON (convertible to CSV)
GET    /admin/export/companies        - Export companies to JSON
GET    /admin/export/reviews          - Export reviews to JSON
```

## Security Features

### Authentication & Authorization
- All admin endpoints require JWT authentication
- Admin role required for all operations
- User cannot modify their own role
- User cannot delete their own account

### Validation
- Input validation using class-validator
- Unique constraint checks for slugs and emails
- Relationship integrity checks before deletion
- SQL injection protection via Prisma ORM

### Audit Trail
- All operations are logged
- User actions tracked with timestamps
- Created/Updated timestamps on all records

### Password Management
- Passwords hashed using bcrypt (10 rounds)
- Temporary password generation for resets
- Secure password storage

## Usage Examples

### Creating a Category
```typescript
// POST /admin/categories
{
  "name": "Banques et Institutions Financières",
  "slug": "banques-et-institutions-financieres",
  "parentId": null
}
```

### Updating a User
```typescript
// PATCH /admin/users/123
{
  "username": "newusername",
  "email": "newemail@example.com",
  "phone": "+221771234567",
  "role": "MODERATOR",
  "isVerified": true
}
```

### Filtering Users
```typescript
// Frontend state
{
  role: 'ADMIN',      // Filter by admin role
  verified: 'verified' // Only show verified users
}
```

## Navigation Structure

### Admin Dashboard
- **Dashboard Home**: `/admin` - Overview and statistics
- **Companies**: `/admin/companies` - Manage companies
- **Categories**: `/admin/categories` - Manage categories
- **Users**: `/admin/users` - Manage users
- **Reviews**: `/admin/reviews` - Moderate reviews
- **Job Offers**: `/admin/job-offers` - Manage job postings
- **Advertisements**: `/admin/advertisements` - Manage ads
- **Analytics**: `/admin/analytics` - View reports and export data

## Best Practices

### Category Management
1. Always verify no companies exist before deleting a category
2. Use descriptive, SEO-friendly slugs
3. Organize categories hierarchically when appropriate
4. Keep category names consistent with the business domain

### User Management
1. Communicate password resets securely to users
2. Document reason for user deactivation
3. Be cautious when changing user roles
4. Review user activity before deletion

### Data Export
1. Export data regularly for backups
2. Store exported data securely
3. Use exports for compliance and reporting
4. Verify export data integrity

## Troubleshooting

### Common Issues

#### Cannot Delete Category
- **Error**: "Cannot delete category with X companies"
- **Solution**: Reassign companies to another category first

#### User Cannot Login After Deactivation
- **Issue**: Deactivated users cannot authenticate
- **Solution**: Reactivate the user account from admin panel

#### Export Returns Empty File
- **Issue**: No data matches export criteria
- **Solution**: Verify data exists in the database

## Future Enhancements

### Planned Features
1. **Bulk Operations**: Import/export categories and users via CSV
2. **Activity Logs**: Detailed audit logs for all admin actions
3. **Merge Duplicates**: Tool to merge duplicate companies
4. **System Settings**: Configure platform settings from admin panel
5. **Email Templates**: Manage notification email templates
6. **Backup/Restore**: Manual and scheduled database backups
7. **Performance Dashboard**: System performance metrics
8. **Advanced Charts**: Interactive charts using Chart.js or similar

## Support

For issues or questions regarding admin features:
1. Check this documentation first
2. Review API error messages
3. Check browser console for frontend errors
4. Review backend logs for server-side issues

## Changelog

### Version 1.0.0 (2025-02-01)
- ✅ Added "Banques et Institutions Financières" category
- ✅ Implemented complete category CRUD management
- ✅ Enhanced user management with filters and actions
- ✅ Added comprehensive analytics dashboard
- ✅ Implemented CSV data export functionality
- ✅ Updated admin dashboard navigation
- ✅ Added proper validation and security checks
