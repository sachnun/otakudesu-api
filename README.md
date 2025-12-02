# Otakudesu API

REST API untuk scraping data anime dari [Otakudesu](https://otakudesu.best). Dibangun dengan NestJS.

[![Deploy on Zeabur](https://zeabur.com/button.svg)](https://zeabur.com/templates?repo=sachnun/otakudesu-api)

## Features

- Homepage (ongoing & completed anime)
- Ongoing anime list dengan pagination
- Completed anime list dengan pagination
- Anime list A-Z
- Anime detail (info, synopsis, episodes)
- Episode detail dengan streaming servers & download links
- Genre list & filter by genre
- Weekly release schedule
- Search anime
- Resolve streaming URL

## Tech Stack

- **Framework:** NestJS
- **Scraping:** Axios + Cheerio
- **Documentation:** Swagger/OpenAPI
- **Caching:** In-memory cache (5-10 min TTL)

## Installation

```bash
npm install
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

Server akan berjalan di `http://localhost:3000`

## API Documentation

Swagger UI tersedia di `http://localhost:3000/docs`

## Response Format

Semua response menggunakan format konsisten:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "OK",
  "data": { ... },
  "timestamp": "2024-11-12T10:00:00.000Z",
  "path": "/api/home",
  "responseTime": "123ms"
}
```

## Testing

```bash
# unit tests
npm run test

# test coverage
npm run test:cov

# e2e tests
npm run test:e2e
```

## Project Structure

```
src/
├── common/
│   ├── filters/          # Exception filters
│   ├── interceptors/     # Response interceptors
│   └── interfaces/       # Common interfaces
├── otakudesu/
│   ├── dto/              # Data transfer objects
│   ├── interfaces/       # Otakudesu interfaces
│   ├── otakudesu.controller.ts
│   ├── otakudesu.service.ts
│   └── otakudesu.module.ts
├── app.module.ts
└── main.ts
```

## Disclaimer

API ini hanya untuk keperluan edukasi. Semua konten anime berasal dari Otakudesu. Gunakan dengan bijak.

## License

MIT
