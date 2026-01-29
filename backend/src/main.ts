import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global prefix for all routes
  app.setGlobalPrefix('api');
  
  // Enable CORS with multiple origins support
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : [process.env.FRONTEND_URL || 'http://localhost:5173'];
  
  // Pre-compile regex patterns for performance
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
  
  app.enableCors({
    origin: (origin, callback) => {
      // In development mode, allow all origins
      if (isDevelopment) {
        return callback(null, true);
      }
      
      // In production, reject requests with no origin for security
      // (prevents server-to-server abuse)
      if (!origin) {
        return callback(null, false);
      }
      
      // Check if origin matches any allowed pattern
      const isAllowed = allowedPatterns.some(pattern => {
        if (pattern.type === 'pattern' && pattern.regex) {
          return pattern.regex.test(origin);
        }
        return pattern.value === origin;
      });
      
      // Allow or reject based on whether origin is in allowed list
      callback(null, isAllowed);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
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
}
bootstrap();
