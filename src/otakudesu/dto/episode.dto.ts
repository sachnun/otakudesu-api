import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DownloadLinkDto {
  @ApiProperty({ example: 'ZippyShare' })
  provider: string;

  @ApiProperty({ example: 'https://...' })
  url: string;
}

export class DownloadSectionDto {
  @ApiProperty({ example: '480p' })
  resolution: string;

  @ApiProperty({ type: [DownloadLinkDto] })
  links: DownloadLinkDto[];
}

export class EpisodeListItemDto {
  @ApiProperty({ example: '8' })
  episode: string;

  @ApiProperty({ example: 'onpm-s3-episode-8-sub-indo' })
  slug: string;

  @ApiProperty({ example: '30 November,2025' })
  date: string;
}

export class AnimeInfoDto {
  @ApiProperty({ example: 'One Punch Man Season 3' })
  title: string;

  @ApiProperty({ example: 'punch-man-s3-sub-indo' })
  slug: string;
}

export class StreamingServerItemDto {
  @ApiProperty({ example: 'updesu' })
  provider: string;

  @ApiProperty({ example: 'eyJpZCI6MTkwNDQzLCJpIjowLCJxIjoiNDgwcCJ9' })
  dataContent: string;

  @ApiPropertyOptional({ example: true })
  isDefault?: boolean;
}

export class StreamingServerDto {
  @ApiProperty({ example: '480p' })
  quality: string;

  @ApiProperty({ type: [StreamingServerItemDto] })
  servers: StreamingServerItemDto[];
}

export class EpisodeDetailDto {
  @ApiProperty({ example: 'One Punch Man Season 3 Episode 8' })
  title: string;

  @ApiProperty({ type: AnimeInfoDto })
  anime: AnimeInfoDto;

  @ApiPropertyOptional({ example: 'onpm-s3-episode-7-sub-indo' })
  prevEpisode?: string;

  @ApiPropertyOptional({ example: 'onpm-s3-episode-9-sub-indo' })
  nextEpisode?: string;

  @ApiPropertyOptional({ example: 'https://...' })
  streamingUrl?: string;

  @ApiProperty({ type: [StreamingServerDto] })
  streamingServers: StreamingServerDto[];

  @ApiProperty({ type: [DownloadSectionDto] })
  downloadLinks: DownloadSectionDto[];
}

export class ResolveStreamingDto {
  @ApiProperty({
    example: 'https://desustream.info/dstream/updesu/v5/index.php?id=...',
  })
  url: string;

  @ApiPropertyOptional({ example: '<div class="player-embed">...</div>' })
  html?: string;
}

export class BatchLinkDto {
  @ApiProperty({ example: '480p' })
  resolution: string;

  @ApiProperty({ type: [DownloadLinkDto] })
  links: DownloadLinkDto[];
}

export class AnimeDetailDto {
  @ApiProperty({ example: 'One Punch Man Season 3' })
  title: string;

  @ApiProperty({ example: 'ワンパンマン 3' })
  japanese: string;

  @ApiProperty({ example: '7.14' })
  score: string;

  @ApiProperty({ example: 'Lantis, Shueisha' })
  producer: string;

  @ApiProperty({ example: 'TV' })
  type: string;

  @ApiProperty({ example: 'Ongoing' })
  status: string;

  @ApiProperty({ example: 'Unknown' })
  totalEpisode: string;

  @ApiProperty({ example: '24 Min.' })
  duration: string;

  @ApiProperty({ example: 'Okt 12, 2025' })
  releaseDate: string;

  @ApiProperty({ example: 'J.C.Staff' })
  studio: string;

  @ApiProperty({ example: ['Action', 'Comedy', 'Parody'] })
  genres: string[];

  @ApiProperty({ example: 'Saitama adalah...' })
  synopsis: string;

  @ApiProperty({ example: 'https://otakudesu.best/wp-content/uploads/...' })
  poster: string;

  @ApiPropertyOptional({ type: [BatchLinkDto] })
  batch?: BatchLinkDto[];

  @ApiProperty({ type: [EpisodeListItemDto] })
  episodes: EpisodeListItemDto[];
}
