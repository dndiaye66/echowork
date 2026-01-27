# Security Guidelines for EchoWork

## Environment Variables

### ⚠️ CRITICAL: Never commit .env files

The `.env` file contains sensitive information like database credentials and API keys. **Never commit this file to version control.**

### Setup Instructions

1. **Copy the example file:**
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Update the values** in `.env` with your actual credentials

3. **Verify `.env` is in `.gitignore`:**
   ```bash
   git check-ignore backend/.env
   # Should output: backend/.env
   ```

4. **If you accidentally committed `.env`:**
   - Remove it from git: `git rm --cached backend/.env`
   - Rotate all credentials immediately
   - Update `.env` with new credentials
   - Commit the removal: `git commit -m "Remove .env from version control"`

## Database Security

### Connection String Best Practices

- Use strong passwords (minimum 16 characters, mix of uppercase, lowercase, numbers, and symbols)
- Don't use default credentials (postgres/password)
- Use environment-specific databases (dev, staging, production)
- Never expose database ports publicly in production

### Example secure DATABASE_URL format:
```
DATABASE_URL="postgresql://username:strong_password_here@localhost:5432/echowork_db?schema=public"
```

## API Security

### CORS Configuration

The backend is configured to accept requests only from the frontend URL specified in `FRONTEND_URL` environment variable:

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
});
```

**In production**, set `FRONTEND_URL` to your actual frontend domain:
```bash
FRONTEND_URL=https://yourdomain.com
```

### Input Validation

All API endpoints validate input parameters:
- ID parameters are validated as numbers
- Invalid requests return 400 Bad Request
- Missing resources return 404 Not Found

### Error Handling

The API doesn't expose internal errors or stack traces to clients. All database errors are caught and return generic error messages.

## Frontend Security

### API Configuration

The frontend API base URL is configured via environment variable:
```bash
VITE_API_URL=http://localhost:3000/api/
```

**In production**, update this to your actual API endpoint:
```bash
VITE_API_URL=https://api.yourdomain.com/api/
```

## Deployment Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Set strong, unique database credentials
- [ ] Configure CORS with actual production domain
- [ ] Set proper `FRONTEND_URL` environment variable
- [ ] Enable HTTPS/TLS for all communications
- [ ] Use environment variables for all sensitive data
- [ ] Review and update timeout values
- [ ] Enable rate limiting on API endpoints
- [ ] Set up monitoring and logging
- [ ] Verify `.env` is not in git history
- [ ] Use secrets management service (AWS Secrets Manager, Azure Key Vault, etc.)

## Reporting Security Issues

If you discover a security vulnerability, please email security@yourdomain.com instead of using the public issue tracker.

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/helmet)
- [Prisma Security Best Practices](https://www.prisma.io/docs/guides/security)
