# Email Configuration Guide

## Overview
EchoWork now sends a welcome email to users after they register. This guide explains how to configure the email service.

## Requirements
- Email address is now **mandatory** for registration
- Each email must be unique in the system
- Registration form requires: username (pseudo), email, and password

## Email Service Configuration

### Development Environment
For development, you can use [Ethereal Email](https://ethereal.email/) which is a fake SMTP service that captures emails without sending them:

1. Visit https://ethereal.email/create
2. Copy the SMTP credentials
3. Add them to your `.env` file:

```env
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your-ethereal-username
SMTP_PASS=your-ethereal-password
EMAIL_FROM="EchoWork <noreply@echowork.com>"
```

### Production Environment
For production, you can use any SMTP service. Here are some popular options:

#### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="EchoWork <your-email@gmail.com>"
```

**Note:** For Gmail, you need to use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM="EchoWork <noreply@yourdomain.com>"
```

#### Amazon SES
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-aws-access-key
SMTP_PASS=your-aws-secret-key
EMAIL_FROM="EchoWork <noreply@yourdomain.com>"
```

## Database Migration

After deploying these changes, you need to run the database migration:

```bash
cd backend
npx prisma migrate deploy
```

**Important:** If you have existing users with NULL emails, you need to update them before running the migration:

```sql
-- Update existing users with NULL emails
UPDATE "User" SET email = CONCAT('temp_', id, '@changeme.local') WHERE email IS NULL;
```

Then ask those users to update their email addresses through a profile update feature.

## Welcome Email Content

The welcome email includes:
- A personalized greeting with the user's username
- Information about platform features
- A call-to-action button to start exploring
- Platform branding

## Features Implemented

### 1. Mandatory Email Registration
- Email is now a required field during registration
- Email must be unique across all users
- Frontend validation ensures email format is correct
- Backend validation checks for duplicate emails

### 2. Welcome Email
- Automatically sent after successful registration
- Sent asynchronously (doesn't block registration)
- If email sending fails, registration still succeeds
- Error is logged for debugging

### 3. Username Display
- Reviews and comments display the user's username (pseudo)
- Format: "username" appears with each review
- Already implemented in the UI

## Testing

### Test Email Sending (Development)
1. Register a new user with a valid email
2. Check the console logs for the Ethereal email preview URL
3. Visit the URL to see the email content

### Test Duplicate Email
1. Try to register with an email that already exists
2. Should receive error: "User with this email already exists"

### Test Duplicate Username
1. Try to register with a username that already exists
2. Should receive error: "User with this username already exists"

## Troubleshooting

### Email not sending
- Check SMTP credentials in `.env`
- Check console logs for error messages
- Ensure SMTP_HOST and SMTP_PORT are correct
- For Gmail, ensure 2FA is enabled and using App Password

### Migration fails
- Check if there are existing users with NULL emails
- Update them manually before running migration
- Ensure database is accessible

### Frontend validation issues
- Clear browser cache
- Check browser console for errors
- Ensure frontend is connecting to the correct backend URL

## API Changes

### POST /api/auth/signup
**Request body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "accessToken": "jwt-token-here",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

**Error responses:**
- 409 Conflict: "User with this username already exists"
- 409 Conflict: "User with this email already exists"
- 400 Bad Request: "Email is required" (if email is missing)
- 400 Bad Request: "Invalid email address" (if email format is invalid)
