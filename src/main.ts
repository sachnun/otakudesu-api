import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformResponseInterceptor } from './common/interceptors';
import { GlobalExceptionFilter } from './common/filters';
import { Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global interceptor for consistent response format
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // Global exception filter for better error handling
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Redirect root to docs
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/', (_req: unknown, res: Response) => {
    res.redirect('/docs');
  });

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Otakudesu API')
    .setDescription(
      `REST API untuk scraping data anime dari Otakudesu.

## Fitur
- Daftar anime ongoing dan completed
- Detail anime dan episode
- Streaming video player URLs
- Download links berbagai resolusi
- Pencarian anime
- Filter berdasarkan genre
- Jadwal rilis anime

## Response Format
Semua response menggunakan format konsisten:
\`\`\`json
{
  "success": true,
  "statusCode": 200,
  "message": "OK",
  "data": { ... },
  "timestamp": "...",
  "path": "/api/...",
  "responseTime": "123ms"
}
\`\`\`
`,
    )
    .setVersion('1.0')
    .setContact('Otakudesu API', '', '')
    .addTag('Home', 'Homepage data - ongoing dan completed anime terbaru')
    .addTag('Anime', 'Daftar anime dan detail anime')
    .addTag('Episode', 'Detail episode dan streaming/download links')
    .addTag('Genre', 'Daftar genre dan filter anime by genre')
    .addTag('Schedule', 'Jadwal rilis anime')
    .addTag('Search', 'Pencarian anime')
    .addTag('Streaming', 'Resolve streaming player URLs')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger docs available at: http://localhost:${port}/docs`);
}
void bootstrap();
