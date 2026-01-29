# CORS Configuration Guide

## Overview

This document explains how CORS (Cross-Origin Resource Sharing) is configured in the EchoWork application and how to troubleshoot related issues.

## Problem Solved

Previously, the application had CORS errors when accessed from origins other than `localhost:5173`:
- Requests from `http://185.98.136.93` were blocked
- API calls to `https://echowork.net/api/*` failed with CORS policy errors

## Solution

The backend now supports multiple origins through environment configuration.

## Configuration

### Environment Variables

#### Development (backend/.env)
```bash
# Single origin (backward compatible)
FRONTEND_URL=http://localhost:5173

# Or multiple origins
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Production (.env.prod or docker environment)
```bash
# List all domains that need API access
ALLOWED_ORIGINS=http://185.98.136.93,https://echowork.net,https://www.echowork.net

# Wildcard support for subdomains
ALLOWED_ORIGINS=https://*.echowork.net,http://185.98.136.93
```

### How It Works

1. **Multiple Origins**: The `ALLOWED_ORIGINS` variable accepts a comma-separated list of origins
2. **Wildcard Support**: Use `*` for subdomain matching (e.g., `https://*.example.com`)
3. **Development Mode**: When `NODE_ENV=development`, all origins are automatically allowed
4. **Fallback**: If `ALLOWED_ORIGINS` is not set, falls back to `FRONTEND_URL`

### Nginx Configuration

The nginx configuration has been updated to:
- Not override CORS headers set by the backend
- Properly forward the origin information to the backend

## Common Issues and Solutions

### Issue: "No 'Access-Control-Allow-Origin' header is present"

**Solution**: Add the origin to `ALLOWED_ORIGINS` in your environment configuration.

```bash
# Add the blocked origin
ALLOWED_ORIGINS=http://185.98.136.93,https://echowork.net
```

### Issue: CORS works locally but not in production

**Solution**: 
1. Check that the production `.env` or docker environment includes `ALLOWED_ORIGINS`
2. Restart the backend service after updating environment variables
3. Clear browser cache or test in incognito mode

### Issue: Wildcard not working

**Solution**: Ensure proper format for wildcard patterns:
```bash
# Correct
ALLOWED_ORIGINS=https://*.echowork.net

# Incorrect
ALLOWED_ORIGINS=https://*echowork.net
```

## Testing CORS

You can test CORS using curl:

```bash
# Test with origin header
curl -H "Origin: http://185.98.136.93" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://echowork.net/api/home/best-companies -v

# Check for Access-Control-Allow-Origin header in response
```

## Security Considerations

1. **Don't use wildcards in production** unless absolutely necessary
2. **List specific origins** instead of allowing all origins
3. **Never set `origin: true`** in enableCors as it allows all origins
4. **Keep the list minimal** - only add origins that actually need API access

## Deployment Steps

After updating CORS configuration:

1. Update environment variables in your deployment environment
2. Rebuild the backend if using Docker: `docker-compose build backend`
3. Restart services: `docker-compose restart backend nginx`
4. Test from the affected origin

## Code References

- **Backend CORS setup**: `backend/src/main.ts`
- **Nginx proxy config**: `nginx/nginx.conf`
- **Environment examples**: `backend/.env.example`, `.env.prod.example`
