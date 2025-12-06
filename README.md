# Otakudesu API

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/YOUR_USERNAME/otakudesu-api)

REST API for scraping anime data from Otakudesu. Built with [Hono](https://hono.dev/) and deployed to Cloudflare Workers.

## Features

- Ongoing and completed anime listings
- Detailed anime and episode information
- Streaming video player URL resolution
- Multi-resolution download links
- Anime search functionality
- Genre-based filtering
- Weekly release schedule

## Getting Started

```bash
npm install
npm run dev
```

## Deployment

```bash
npm run deploy
```

## API Reference

All endpoints return responses in the following format:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "OK",
  "data": {},
  "timestamp": "ISO 8601",
  "path": "/api/...",
  "responseTime": "ms"
}
```

### Endpoints

#### Home

| Method | Endpoint    | Description                        |
| ------ | ----------- | ---------------------------------- |
| `GET`  | `/api/home` | Latest ongoing and completed anime |

#### Anime

| Method | Endpoint           | Description                        |
| ------ | ------------------ | ---------------------------------- |
| `GET`  | `/api/ongoing`     | Currently airing anime (paginated) |
| `GET`  | `/api/complete`    | Completed anime (paginated)        |
| `GET`  | `/api/anime-list`  | All anime sorted alphabetically    |
| `GET`  | `/api/anime/:slug` | Anime details with episode list    |

#### Episode

| Method | Endpoint             | Description                          |
| ------ | -------------------- | ------------------------------------ |
| `GET`  | `/api/episode/:slug` | Episode streaming and download links |

#### Genre

| Method | Endpoint             | Description                |
| ------ | -------------------- | -------------------------- |
| `GET`  | `/api/genres`        | Available genres           |
| `GET`  | `/api/genres/:genre` | Anime by genre (paginated) |

#### Schedule

| Method | Endpoint        | Description             |
| ------ | --------------- | ----------------------- |
| `GET`  | `/api/schedule` | Weekly release schedule |

#### Search

| Method | Endpoint         | Description             |
| ------ | ---------------- | ----------------------- |
| `GET`  | `/api/search?q=` | Search anime by keyword |

#### Streaming

| Method | Endpoint                              | Description                 |
| ------ | ------------------------------------- | --------------------------- |
| `POST` | `/api/resolve-streaming`              | Resolve streaming URL       |
| `GET`  | `/api/resolve-streaming/:dataContent` | Resolve streaming URL (GET) |

### Query Parameters

| Parameter | Endpoints                                 | Description              |
| --------- | ----------------------------------------- | ------------------------ |
| `page`    | `/ongoing`, `/complete`, `/genres/:genre` | Page number (default: 1) |
| `q`       | `/search`                                 | Search keyword           |

### Error Codes

| Code                | Description                      |
| ------------------- | -------------------------------- |
| `ANIME_NOT_FOUND`   | Requested anime does not exist   |
| `EPISODE_NOT_FOUND` | Requested episode does not exist |
| `UPSTREAM_ERROR`    | Failed to fetch data from source |
| `BAD_REQUEST`       | Invalid request parameters       |

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Parser**: Cheerio

## License

MIT
