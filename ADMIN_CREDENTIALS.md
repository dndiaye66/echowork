# Super-Admin Credentials

This document contains the credentials for the EchoWork super-admin account.

## Default Super-Admin Credentials

**⚠️ IMPORTANT: These are the default credentials. Change the password immediately after first login!**

### Login Details:
- **Email**: `admin@echowork.com`
- **Username**: `superadmin`
- **Password**: `Admin@2024!Echowork`
- **Role**: `ADMIN`

### How to Create the Super-Admin

Run the following command in the backend directory:

```bash
cd backend
npm run create:admin
```

This script will:
1. Create a super-admin user if one doesn't exist
2. Update the role to ADMIN if the user already exists
3. Display the credentials in the console

### Access the Admin Dashboard

1. Navigate to the login page: `http://localhost:5173/login` (or your frontend URL)
2. Enter the email and password above
3. After successful login, navigate to: `http://localhost:5173/admin`

## Admin Capabilities

The super-admin has access to:

### 1. Dashboard
- View site statistics (total users, companies, reviews, etc.)
- Monitor recent activities
- Track key performance indicators

### 2. Companies Management
- Create new companies
- Update company information
- Delete companies
- Manage company categories

### 3. Advertisements Management
- Create advertisements
- Update advertisement status
- Manage advertisement dates and content
- Delete advertisements

### 4. Job Offers Management
- Create job offers for companies
- Update job offer information
- Activate/deactivate job offers
- Delete job offers

### 5. Users Management
- View all registered users
- Update user roles (USER, ADMIN, MODERATOR)
- Delete user accounts
- View user statistics

### 6. Reviews Moderation
- View pending reviews
- Approve reviews
- Reject reviews
- Monitor review quality

## Security Best Practices

1. **Change the default password** immediately after first login
2. **Use a strong password** with at least 12 characters, including uppercase, lowercase, numbers, and special characters
3. **Don't share credentials** via email or unsecured channels
4. **Enable two-factor authentication** (if implemented in the future)
5. **Regularly review admin access** and remove unnecessary admin privileges
6. **Monitor admin activities** through logs

## API Endpoints for Admin

All admin endpoints require authentication with JWT token and ADMIN role.

### Dashboard
- `GET /api/admin/dashboard/stats` - Get dashboard statistics

### Users
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user

### Reviews Moderation
- `GET /api/admin/reviews/pending` - Get pending reviews
- `PUT /api/admin/reviews/:id/approve` - Approve review
- `PUT /api/admin/reviews/:id/reject` - Reject review

### Companies
- `POST /api/admin/companies` - Create company
- `PUT /api/admin/companies/:id` - Update company
- `DELETE /api/admin/companies/:id` - Delete company

### Job Offers
- `GET /api/admin/job-offers` - List job offers
- `POST /api/admin/job-offers` - Create job offer
- `PUT /api/admin/job-offers/:id` - Update job offer
- `DELETE /api/admin/job-offers/:id` - Delete job offer

### Advertisements
- `GET /api/admin/advertisements` - List advertisements
- `POST /api/admin/advertisements` - Create advertisement
- `PUT /api/admin/advertisements/:id` - Update advertisement
- `DELETE /api/admin/advertisements/:id` - Delete advertisement

## Troubleshooting

### Cannot log in?
1. Verify the credentials are correct
2. Check that the admin user was created successfully
3. Ensure the backend server is running
4. Check the JWT_SECRET is configured in backend/.env

### Access denied error?
1. Verify the user role is set to ADMIN
2. Check that the JWT token is valid
3. Ensure you're logged in

### Need to reset admin password?
Run the create-admin script again, or manually update the password in the database using Prisma Studio:
```bash
cd backend
npm run prisma:studio
```

## Production Deployment

When deploying to production:

1. **Create a new admin user** with a strong, unique password
2. **Update the credentials** in this document (store securely, not in Git!)
3. **Set proper environment variables** in `.env`
4. **Enable HTTPS** for secure authentication
5. **Configure proper CORS** settings
6. **Set up database backups**
7. **Enable logging** for admin activities
