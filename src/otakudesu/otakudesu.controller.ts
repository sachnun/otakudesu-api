import {
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
  Post,
  Body,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { OtakudesuService } from './otakudesu.service';
import {
  HomeResponseDto,
  OngoingResponseDto,
  CompleteResponseDto,
  AnimeDetailDto,
  EpisodeDetailDto,
  GenreListResponseDto,
  GenreAnimeResponseDto,
  ScheduleResponseDto,
  SearchResponseDto,
  AnimeListResponseDto,
  ResolveStreamingDto,
} from './dto';

@Controller('api')
@UseInterceptors(CacheInterceptor)
export class OtakudesuController {
  constructor(private readonly otakudesuService: OtakudesuService) {}

  // ============ HOME ============
  @Get('home')
  @ApiTags('Home')
  @CacheTTL(300000)
  @ApiOperation({
    summary: 'Get homepage data',
    description: 'Mendapatkan daftar anime ongoing dan completed terbaru',
  })
  @ApiResponse({ status: 200, description: 'Success', type: HomeResponseDto })
  async getHome(): Promise<HomeResponseDto> {
    return this.otakudesuService.getHome();
  }

  // ============ ANIME ============
  @Get('ongoing')
  @ApiTags('Anime')
  @CacheTTL(300000)
  @ApiOperation({
    summary: 'Get ongoing anime',
    description: 'Daftar anime yang sedang tayang dengan pagination',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: OngoingResponseDto,
  })
  async getOngoing(@Query('page') page?: string): Promise<OngoingResponseDto> {
    return this.otakudesuService.getOngoing(parseInt(page || '1'));
  }

  @Get('complete')
  @ApiTags('Anime')
  @CacheTTL(300000)
  @ApiOperation({
    summary: 'Get completed anime',
    description: 'Daftar anime yang sudah selesai tayang dengan pagination',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: CompleteResponseDto,
  })
  async getComplete(
    @Query('page') page?: string,
  ): Promise<CompleteResponseDto> {
    return this.otakudesuService.getComplete(parseInt(page || '1'));
  }

  @Get('anime-list')
  @ApiTags('Anime')
  @CacheTTL(600000)
  @ApiOperation({
    summary: 'Get all anime list (A-Z)',
    description: 'Daftar semua anime diurutkan berdasarkan abjad',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: AnimeListResponseDto,
  })
  async getAnimeList(): Promise<AnimeListResponseDto> {
    const list = await this.otakudesuService.getAnimeList();
    return { list };
  }

  @Get('anime/:slug')
  @ApiTags('Anime')
  @CacheTTL(300000)
  @ApiOperation({
    summary: 'Get anime detail',
    description:
      'Detail lengkap anime termasuk info, synopsis, dan daftar episode',
  })
  @ApiParam({ name: 'slug', example: 'punch-man-s3-sub-indo' })
  @ApiResponse({ status: 200, description: 'Success', type: AnimeDetailDto })
  @ApiResponse({ status: 404, description: 'Anime not found' })
  async getAnimeDetail(@Param('slug') slug: string): Promise<AnimeDetailDto> {
    return this.otakudesuService.getAnimeDetail(slug);
  }

  // ============ EPISODE ============
  @Get('episode/:slug')
  @ApiTags('Episode')
  @CacheTTL(300000)
  @ApiOperation({
    summary: 'Get episode detail',
    description: 'Detail episode termasuk streaming servers dan download links',
  })
  @ApiParam({ name: 'slug', example: 'onpm-s3-episode-8-sub-indo' })
  @ApiResponse({ status: 200, description: 'Success', type: EpisodeDetailDto })
  @ApiResponse({ status: 404, description: 'Episode not found' })
  async getEpisodeDetail(
    @Param('slug') slug: string,
  ): Promise<EpisodeDetailDto> {
    return this.otakudesuService.getEpisodeDetail(slug);
  }

  // ============ GENRE ============
  @Get('genres')
  @ApiTags('Genre')
  @CacheTTL(3600000)
  @ApiOperation({
    summary: 'Get all genres',
    description: 'Daftar semua genre yang tersedia',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: GenreListResponseDto,
  })
  async getGenres(): Promise<GenreListResponseDto> {
    const genres = await this.otakudesuService.getGenres();
    return { genres };
  }

  @Get('genres/:genre')
  @ApiTags('Genre')
  @CacheTTL(300000)
  @ApiOperation({
    summary: 'Get anime by genre',
    description: 'Filter anime berdasarkan genre dengan pagination',
  })
  @ApiParam({ name: 'genre', example: 'action' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: GenreAnimeResponseDto,
  })
  async getAnimeByGenre(
    @Param('genre') genre: string,
    @Query('page') page?: string,
  ): Promise<GenreAnimeResponseDto> {
    return this.otakudesuService.getAnimeByGenre(genre, parseInt(page || '1'));
  }

  // ============ SCHEDULE ============
  @Get('schedule')
  @ApiTags('Schedule')
  @CacheTTL(600000)
  @ApiOperation({
    summary: 'Get release schedule',
    description: 'Jadwal rilis anime dari Senin sampai Minggu',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: ScheduleResponseDto,
  })
  async getSchedule(): Promise<ScheduleResponseDto> {
    const schedule = await this.otakudesuService.getSchedule();
    return { schedule };
  }

  // ============ SEARCH ============
  @Get('search')
  @ApiTags('Search')
  @CacheTTL(300000)
  @ApiOperation({
    summary: 'Search anime',
    description: 'Cari anime berdasarkan kata kunci',
  })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    example: 'one punch',
    description: 'Kata kunci pencarian',
  })
  @ApiResponse({ status: 200, description: 'Success', type: SearchResponseDto })
  async search(@Query('q') query: string): Promise<SearchResponseDto> {
    const anime = await this.otakudesuService.search(query || '');
    return { anime };
  }

  // ============ STREAMING ============
  @Post('resolve-streaming')
  @ApiTags('Streaming')
  @ApiOperation({
    summary: 'Resolve streaming URL (POST)',
    description:
      'Mendapatkan URL streaming player dari data-content yang ada di streamingServers',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        dataContent: {
          type: 'string',
          example: 'eyJpZCI6MTkwNDQzLCJpIjowLCJxIjoiNDgwcCJ9',
          description: 'Base64 encoded data-content dari streamingServers',
        },
      },
      required: ['dataContent'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: ResolveStreamingDto,
  })
  @ApiResponse({ status: 502, description: 'Failed to resolve streaming URL' })
  async resolveStreaming(
    @Body('dataContent') dataContent: string,
  ): Promise<ResolveStreamingDto> {
    return this.otakudesuService.resolveStreamingUrl(dataContent);
  }

  @Get('resolve-streaming/:dataContent')
  @ApiTags('Streaming')
  @ApiOperation({
    summary: 'Resolve streaming URL (GET)',
    description: 'Alternatif GET endpoint untuk resolve streaming URL',
  })
  @ApiParam({
    name: 'dataContent',
    example: 'eyJpZCI6MTkwNDQzLCJpIjowLCJxIjoiNDgwcCJ9',
    description: 'Base64 encoded data-content dari streamingServers',
  })
  @ApiResponse({
    status: 200,
    description: 'Success',
    type: ResolveStreamingDto,
  })
  @ApiResponse({ status: 502, description: 'Failed to resolve streaming URL' })
  async resolveStreamingGet(
    @Param('dataContent') dataContent: string,
  ): Promise<ResolveStreamingDto> {
    return this.otakudesuService.resolveStreamingUrl(dataContent);
  }
}
