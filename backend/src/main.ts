import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Enable CORS
    app.enableCors({
      origin: [
        process.env.FRONTEND_URL || 'http://localhost:3000',
        'http://localhost:3000',
        'http://localhost:3001',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // Swagger API Documentation
    const config = new DocumentBuilder()
      .setTitle('HighLit API')
      .setDescription('HighLit - كود وفضفض API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('posts', 'Posts and rants')
      .addTag('jobs', 'Job board')
      .addTag('spaces', 'Audio spaces')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    // Backend runs on 3001, frontend on 3000
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 HighLit API is running on: http://localhost:${port}`);
    console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${process.env.PORT || 3001} is already in use`);
    } else if (error.message?.includes('connect ECONNREFUSED')) {
      console.error('❌ Database connection failed. Make sure PostgreSQL is running.');
      console.error('   Check your .env file for database credentials.');
    }
    process.exit(1);
  }
}

bootstrap();

