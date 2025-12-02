import { Test, TestingModule } from '@nestjs/testing';
import { OtakudesuController } from './otakudesu.controller';
import { OtakudesuService } from './otakudesu.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('OtakudesuController', () => {
  let controller: OtakudesuController;

  const mockService = {
    getHome: jest.fn(),
    getOngoing: jest.fn(),
    getComplete: jest.fn(),
    getAnimeList: jest.fn(),
    getAnimeDetail: jest.fn(),
    getEpisodeDetail: jest.fn(),
    getGenres: jest.fn(),
    getAnimeByGenre: jest.fn(),
    getSchedule: jest.fn(),
    search: jest.fn(),
    resolveStreamingUrl: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OtakudesuController],
      providers: [
        { provide: OtakudesuService, useValue: mockService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    controller = module.get<OtakudesuController>(OtakudesuController);
    service = module.get<OtakudesuService>(OtakudesuService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getHome', () => {
    it('should return home data', async () => {
      const mockResult = {
        ongoing: [{ title: 'Test Anime', slug: 'test', poster: '' }],
        complete: [{ title: 'Complete Anime', slug: 'complete', poster: '' }],
      };
      mockService.getHome.mockResolvedValue(mockResult);

      const result = await controller.getHome();

      expect(result).toEqual(mockResult);
      expect(mockService.getHome).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOngoing', () => {
    it('should return ongoing anime with default page', async () => {
      const mockResult = {
        anime: [{ title: 'Ongoing', slug: 'ongoing', poster: '' }],
        pagination: { currentPage: 1, totalPages: 5 },
      };
      mockService.getOngoing.mockResolvedValue(mockResult);

      const result = await controller.getOngoing();

      expect(result).toEqual(mockResult);
      expect(mockService.getOngoing).toHaveBeenCalledWith(1);
    });

    it('should parse page parameter correctly', async () => {
      const mockResult = { anime: [], pagination: { currentPage: 3 } };
      mockService.getOngoing.mockResolvedValue(mockResult);

      await controller.getOngoing('3');

      expect(mockService.getOngoing).toHaveBeenCalledWith(3);
    });
  });

  describe('getComplete', () => {
    it('should return complete anime with default page', async () => {
      const mockResult = {
        anime: [{ title: 'Complete', slug: 'complete', poster: '' }],
        pagination: { currentPage: 1 },
      };
      mockService.getComplete.mockResolvedValue(mockResult);

      const result = await controller.getComplete();

      expect(result).toEqual(mockResult);
      expect(mockService.getComplete).toHaveBeenCalledWith(1);
    });

    it('should parse page parameter correctly', async () => {
      mockService.getComplete.mockResolvedValue({ anime: [], pagination: {} });

      await controller.getComplete('5');

      expect(mockService.getComplete).toHaveBeenCalledWith(5);
    });
  });

  describe('getAnimeList', () => {
    it('should return anime list grouped by letter', async () => {
      const mockList = {
        A: [{ title: 'Attack on Titan', slug: 'aot' }],
        B: [{ title: 'Bleach', slug: 'bleach' }],
      };
      mockService.getAnimeList.mockResolvedValue(mockList);

      const result = await controller.getAnimeList();

      expect(result).toEqual({ list: mockList });
      expect(mockService.getAnimeList).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAnimeDetail', () => {
    it('should return anime detail for given slug', async () => {
      const mockDetail = {
        title: 'One Punch Man',
        slug: 'one-punch-man',
        poster: 'poster.jpg',
        episodes: [],
      };
      mockService.getAnimeDetail.mockResolvedValue(mockDetail);

      const result = await controller.getAnimeDetail('one-punch-man');

      expect(result).toEqual(mockDetail);
      expect(mockService.getAnimeDetail).toHaveBeenCalledWith('one-punch-man');
    });
  });

  describe('getEpisodeDetail', () => {
    it('should return episode detail for given slug', async () => {
      const mockDetail = {
        title: 'Episode 1',
        anime: { title: 'Test', slug: 'test' },
        streamingServers: [],
        downloadLinks: [],
      };
      mockService.getEpisodeDetail.mockResolvedValue(mockDetail);

      const result = await controller.getEpisodeDetail('test-ep-1');

      expect(result).toEqual(mockDetail);
      expect(mockService.getEpisodeDetail).toHaveBeenCalledWith('test-ep-1');
    });
  });

  describe('getGenres', () => {
    it('should return list of genres', async () => {
      const mockGenres = [
        { name: 'Action', slug: 'action' },
        { name: 'Comedy', slug: 'comedy' },
      ];
      mockService.getGenres.mockResolvedValue(mockGenres);

      const result = await controller.getGenres();

      expect(result).toEqual({ genres: mockGenres });
      expect(mockService.getGenres).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAnimeByGenre', () => {
    it('should return anime filtered by genre with default page', async () => {
      const mockResult = {
        genre: 'action',
        anime: [{ title: 'Action Anime', slug: 'action-anime' }],
        pagination: { currentPage: 1 },
      };
      mockService.getAnimeByGenre.mockResolvedValue(mockResult);

      const result = await controller.getAnimeByGenre('action');

      expect(result).toEqual(mockResult);
      expect(mockService.getAnimeByGenre).toHaveBeenCalledWith('action', 1);
    });

    it('should parse page parameter correctly', async () => {
      mockService.getAnimeByGenre.mockResolvedValue({
        genre: 'action',
        anime: [],
        pagination: {},
      });

      await controller.getAnimeByGenre('action', '2');

      expect(mockService.getAnimeByGenre).toHaveBeenCalledWith('action', 2);
    });
  });

  describe('getSchedule', () => {
    it('should return weekly schedule', async () => {
      const mockSchedule = [
        { day: 'Senin', anime: [{ title: 'Monday Anime', slug: 'mon' }] },
        { day: 'Selasa', anime: [{ title: 'Tuesday Anime', slug: 'tue' }] },
      ];
      mockService.getSchedule.mockResolvedValue(mockSchedule);

      const result = await controller.getSchedule();

      expect(result).toEqual({ schedule: mockSchedule });
      expect(mockService.getSchedule).toHaveBeenCalledTimes(1);
    });
  });

  describe('search', () => {
    it('should return search results', async () => {
      const mockResults = [
        { title: 'One Punch Man', slug: 'opm', poster: '' },
        { title: 'One Piece', slug: 'op', poster: '' },
      ];
      mockService.search.mockResolvedValue(mockResults);

      const result = await controller.search('one');

      expect(result).toEqual({ anime: mockResults });
      expect(mockService.search).toHaveBeenCalledWith('one');
    });

    it('should handle empty query', async () => {
      mockService.search.mockResolvedValue([]);

      const result = await controller.search('');

      expect(result).toEqual({ anime: [] });
      expect(mockService.search).toHaveBeenCalledWith('');
    });
  });

  describe('resolveStreaming (POST)', () => {
    it('should resolve streaming URL from dataContent', async () => {
      const mockResult = {
        url: 'https://player.example.com/embed',
        html: '<iframe src="..."></iframe>',
      };
      mockService.resolveStreamingUrl.mockResolvedValue(mockResult);

      const result = await controller.resolveStreaming('base64content');

      expect(result).toEqual(mockResult);
      expect(mockService.resolveStreamingUrl).toHaveBeenCalledWith(
        'base64content',
      );
    });
  });

  describe('resolveStreamingGet (GET)', () => {
    it('should resolve streaming URL from dataContent param', async () => {
      const mockResult = {
        url: 'https://player.example.com/embed',
        html: '<iframe src="..."></iframe>',
      };
      mockService.resolveStreamingUrl.mockResolvedValue(mockResult);

      const result = await controller.resolveStreamingGet('base64content');

      expect(result).toEqual(mockResult);
      expect(mockService.resolveStreamingUrl).toHaveBeenCalledWith(
        'base64content',
      );
    });
  });
});
