import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AnimeCardDto, PaginationDto } from './anime.dto';

export class GenreDto {
  @ApiProperty({ example: 'Action' })
  name: string;

  @ApiProperty({ example: 'action' })
  slug: string;
}

export class GenreListResponseDto {
  @ApiProperty({ type: [GenreDto] })
  genres: GenreDto[];
}

export class GenreAnimeResponseDto {
  @ApiProperty({ example: 'Action' })
  genre: string;

  @ApiProperty({ type: [AnimeCardDto] })
  anime: AnimeCardDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

export class ScheduleAnimeDto {
  @ApiProperty({ example: 'One Punch Man Season 3' })
  title: string;

  @ApiProperty({ example: 'punch-man-s3-sub-indo' })
  slug: string;
}

export class ScheduleDayDto {
  @ApiProperty({ example: 'Senin' })
  day: string;

  @ApiProperty({ type: [ScheduleAnimeDto] })
  anime: ScheduleAnimeDto[];
}

export class ScheduleResponseDto {
  @ApiProperty({ type: [ScheduleDayDto] })
  schedule: ScheduleDayDto[];
}

export class SearchResponseDto {
  @ApiProperty({ type: [AnimeCardDto] })
  anime: AnimeCardDto[];
}

export class AnimeListItemDto {
  @ApiProperty({ example: 'One Punch Man' })
  title: string;

  @ApiProperty({ example: 'punch-man-sub-indo' })
  slug: string;

  @ApiPropertyOptional({ example: ['Action', 'Comedy'] })
  genres?: string[];

  @ApiPropertyOptional({ example: 'Completed' })
  status?: string;
}

export class AnimeListResponseDto {
  @ApiProperty({
    example: {
      A: [{ title: 'Attack on Titan', slug: 'aot-sub-indo' }],
      B: [{ title: 'Bleach', slug: 'bleach-sub-indo' }],
    },
  })
  list: Record<string, AnimeListItemDto[]>;
}
