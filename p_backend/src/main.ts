import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Enable CORS for frontend
  app.enableCors({
    // origin: (
    //   origin: string | undefined,
    //   callback: (err: Error | null, allow?: boolean) => void,
    // ) => {
    //   // Allow requests with no origin (like mobile apps or curl requests)
    //   if (!origin) {
    //     return callback(null, true);
    //   }
    //   // In development, allow any localhost origin
    //   if (process.env.NODE_ENV !== 'production') {
    //     if (
    //       origin.startsWith('http://localhost:') ||
    //       origin.startsWith('http://127.0.0.1:')
    //     ) {
    //       return callback(null, true);
    //     }
    //   }
    //   // In production, use specific allowed origins
    //   const allowedOrigins = [
    //     process.env.FRONTEND_URL || 'http://localhost:5173',
    //     'http://localhost:5173',
    //     'http://localhost:5174',
    //   ];
    //   if (allowedOrigins.includes(origin)) {
    //     callback(null, true);
    //   } else {
    //     callback(new Error('Not allowed by CORS'));
    //   }
    // },
    // credentials: true,
    // methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    // allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = process.env.PORT || 3000
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
