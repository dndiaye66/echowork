import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global prefix for all routes
  app.setGlobalPrefix('api');
  
  // Enable CORS with proper configuration for echowork.net
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : [process.env.FRONTEND_URL || 'http://localhost:5173'];
  
  // Pre-compile regex patterns for wildcard support
  const allowedPatterns = allowedOrigins.map(allowed => {
    if (allowed.includes('*')) {
      // Escape special regex characters except *
      const escaped = allowed.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
      // Replace * with .*
      const pattern = '^' + escaped.replace(/\*/g, '.*') + '$';
      return { type: 'pattern', regex: new RegExp(pattern) };
    }
    return { type: 'exact', value: allowed };
  });
  
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Configure CORS to prevent duplicate headers and ensure proper origin handling
  app.enableCors({
    origin: (origin, callback) => {
      // In development mode, allow all origins
      if (isDevelopment) {
        return callback(null, true);
      }
      
      // In production, allow requests with no origin (e.g., mobile apps, Postman)
      // but verify the origin if present
      if (!origin) {
        return callback(null, true);
      }
      
      // Check if origin matches any allowed pattern
      const isAllowed = allowedPatterns.some(pattern => {
        if (pattern.type === 'pattern' && pattern.regex) {
          return pattern.regex.test(origin);
        }
        return pattern.value === origin;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked request from origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    // Prevent duplicate headers by not setting exposedHeaders if not needed
    exposedHeaders: [],
  });
  
  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server listening on http://localhost:${port}`);
  console.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);
}
bootstrap();
