import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AnimeCardDto {
  @ApiProperty({ example: 'One Punch Man Season 3' })
  title: string;

  @ApiProperty({ example: 'punch-man-s3-sub-indo' })
  slug: string;

  @ApiProperty({ example: 'https://otakudesu.best/wp-content/uploads/...' })
  poster: string;

  @ApiPropertyOptional({ example: '8' })
  episode?: string;

  @ApiPropertyOptional({ example: '7.14' })
  rating?: string;

  @ApiPropertyOptional({ example: 'Minggu' })
  releaseDay?: string;

  @ApiPropertyOptional({ example: '30 Nov' })
  releaseDate?: string;

  @ApiPropertyOptional({ example: '12' })
  totalEpisode?: string;
}

export class HomeResponseDto {
  @ApiProperty({ type: [AnimeCardDto] })
  ongoing: AnimeCardDto[];

  @ApiProperty({ type: [AnimeCardDto] })
  complete: AnimeCardDto[];
}

export class PaginationDto {
  @ApiProperty({ example: 1, description: 'Current page number' })
  currentPage: number;

  @ApiProperty({ example: 10, description: 'Total number of pages' })
  totalPages: number;

  @ApiProperty({ example: 50, description: 'Number of items per page' })
  itemsPerPage: number;

  @ApiPropertyOptional({
    example: 500,
    description: 'Estimated total items (may not be exact)',
    nullable: true,
  })
  totalItems: number | null;

  @ApiProperty({ example: false, description: 'Whether previous page exists' })
  hasPrevPage: boolean;

  @ApiProperty({ example: true, description: 'Whether next page exists' })
  hasNextPage: boolean;

  @ApiPropertyOptional({ example: null, description: 'Previous page number' })
  prevPage: number | null;

  @ApiPropertyOptional({ example: 2, description: 'Next page number' })
  nextPage: number | null;
}

export class OngoingResponseDto {
  @ApiProperty({ type: [AnimeCardDto] })
  anime: AnimeCardDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}

export class CompleteResponseDto {
  @ApiProperty({ type: [AnimeCardDto] })
  anime: AnimeCardDto[];

  @ApiProperty({ type: PaginationDto })
  pagination: PaginationDto;
}
