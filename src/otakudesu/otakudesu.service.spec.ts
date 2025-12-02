import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { OtakudesuService } from './otakudesu.service';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OtakudesuService', () => {
  let service: OtakudesuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OtakudesuService],
    }).compile();

    service = module.get<OtakudesuService>(OtakudesuService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHome', () => {
    it('should return ongoing and complete anime', async () => {
      const mockHtml = `
        <html>
          <div class="venz">
            <ul>
              <li>
                <div class="thumb"><a href="https://otakudesu.best/anime/one-piece-sub-indo/"></a></div>
                <div class="thumbz"><img src="https://example.com/poster1.jpg" /></div>
                <div class="jdlflm">One Piece</div>
                <div class="epz">Episode 1100</div>
                <div class="epztipe">Minggu</div>
                <div class="newnime">12 Nov 2024</div>
              </li>
            </ul>
            <ul>
              <li>
                <div class="thumb"><a href="https://otakudesu.best/anime/naruto-sub-indo/"></a></div>
                <div class="thumbz"><img src="https://example.com/poster2.jpg" /></div>
                <div class="jdlflm">Naruto</div>
                <div class="epz">500 Episode</div>
                <div class="epztipe">9.0</div>
                <div class="newnime">Completed</div>
              </li>
            </ul>
          </div>
        </html>
      `;

      mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

      const result = await service.getHome();

      expect(result).toHaveProperty('ongoing');
      expect(result).toHaveProperty('complete');
      expect(Array.isArray(result.ongoing)).toBe(true);
      expect(Array.isArray(result.complete)).toBe(true);
    });

    it('should throw HttpException when fetch fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(service.getHome()).rejects.toThrow(HttpException);
    });
  });

  describe('getOngoing', () => {
    it('should return ongoing anime with pagination', async () => {
      const mockHtml = `
        <html>
          <div class="venz">
            <ul>
              <li>
                <div class="thumb"><a href="https://otakudesu.best/anime/test-anime/"></a></div>
                <div class="thumbz"><img src="https://example.com/poster.jpg" /></div>
                <div class="jdlflm">Test Anime</div>
                <div class="epz">Episode 5</div>
                <div class="epztipe">Senin</div>
                <div class="newnime">10 Nov 2024</div>
              </li>
            </ul>
          </div>
          <div class="pagenavix">
            <span class="page-numbers current">1</span>
            <a class="page-numbers">2</a>
            <a class="page-numbers">3</a>
          </div>
        </html>
      `;

      mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

      const result = await service.getOngoing(1);

      expect(result).toHaveProperty('anime');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination).toHaveProperty('currentPage');
      expect(result.pagination).toHaveProperty('totalPages');
      expect(result.pagination).toHaveProperty('hasNextPage');
      expect(result.pagination).toHaveProperty('hasPrevPage');
    });

    it('should handle page 2 URL correctly', async () => {
      const mockHtml = `<html><div class="venz"><ul></ul></div></html>`;
      mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

      await service.getOngoing(2);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/ongoing-anime/page/2/'),
        expect.any(Object),
      );
    });
  });

  describe('getComplete', () => {
    it('should return complete anime with pagination', async () => {
      const mockHtml = `
        <html>
          <div class="venz">
            <ul>
              <li>
                <div class="thumb"><a href="https://otakudesu.best/anime/completed-anime/"></a></div>
                <div class="thumbz"><img src="https://example.com/poster.jpg" /></div>
                <div class="jdlflm">Completed Anime</div>
                <div class="epz">12 Episode</div>
                <div class="epztipe">8.5</div>
                <div class="newnime">2023</div>
              </li>
            </ul>
          </div>
        </html>
      `;

      mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

      const result = await service.getComplete(1);

      expect(result).toHaveProperty('anime');
      expect(result).toHaveProperty('pagination');
    });
  });

  describe('getAnimeList', () => {
    it('should return anime list grouped by letter', async () => {
      const mockHtml = `
        <html>
          <div class="bariskelom">
            <div class="barispenz"><a>A</a></div>
            <div class="jdlbar">
              <ul>
                <li><a href="https://otakudesu.best/anime/attack-on-titan/">Attack on Titan</a></li>
              </ul>
            </div>
          </div>
          <div class="bariskelom">
            <div class="barispenz"><a>B</a></div>
            <div class="jdlbar">
              <ul>
                <li><a href="https://otakudesu.best/anime/bleach/">Bleach</a></li>
              </ul>
            </div>
          </div>
        </html>
      `;

      mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

      const result = await service.getAnimeList();

      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('A');
      expect(result).toHaveProperty('B');
      expect(Array.isArray(result['A'])).toBe(true);
    });
  });

  describe('getAnimeDetail', () => {
    it('should return anime detail', async () => {
      const mockHtml = `
        <html>
          <div class="jdlrx"><h1>One Punch Man Season 3</h1></div>
          <div class="fotoanime"><img src="https://example.com/poster.jpg" /></div>
          <div class="infozingle">
            <p>Japanese: <span>ワンパンマン</span></p>
            <p>Skor: <span>9.0</span></p>
            <p>Produser: <span>J.C.Staff</span></p>
            <p>Tipe: <span>TV</span></p>
            <p>Status: <span>Ongoing</span></p>
            <p>Total Episode: <span>12</span></p>
            <p>Durasi: <span>24 min</span></p>
            <p>Tanggal Rilis: <span>October 2024</span></p>
            <p>Studio: <span>J.C.Staff</span></p>
            <p><span><a href="/genres/action/">Action</a></span></p>
          </div>
          <div class="sinopc">This is the synopsis.</div>
          <div class="episodelist">
            <ul>
              <li>
                <a href="https://otakudesu.best/episode/opm-s3-ep-1-sub-indo/">Episode 1</a>
                <span class="zeebr">10 Oct 2024</span>
              </li>
            </ul>
          </div>
        </html>
      `;

      mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

      const result = await service.getAnimeDetail('one-punch-man-s3');

      expect(result).toHaveProperty('title', 'One Punch Man Season 3');
      expect(result).toHaveProperty('poster');
      expect(result).toHaveProperty('synopsis');
      expect(result).toHaveProperty('episodes');
      expect(Array.isArray(result.episodes)).toBe(true);
    });

    it('should throw NOT_FOUND when anime does not exist', async () => {
      const mockHtml = `<html><div class="jdlrx"><h1></h1></div></html>`;
      mockedAxios.get.mockResolvedValue({ data: mockHtml });

      try {
        await service.getAnimeDetail('non-existent');
        fail('Expected HttpException to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect((error as HttpException).getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('getEpisodeDetail', () => {
    it('should return episode detail with streaming servers', async () => {
      const mockHtml = `
        <html>
          <div class="posttl">One Punch Man S3 Episode 1 Subtitle Indonesia</div>
          <div class="flir">
            <a href="https://otakudesu.best/anime/one-punch-man-s3/">See All Episodes</a>
            <a href="https://otakudesu.best/episode/prev-ep/">Sebelumnya</a>
            <a href="https://otakudesu.best/episode/next-ep/">Selanjutnya</a>
          </div>
          <div id="embed_holder"><iframe src="https://player.example.com/embed"></iframe></div>
          <div class="mirrorstream">
            <ul class="m360p">
              <li><a data-content="dGVzdDM2MHA=" data-default="true">Provider1</a></li>
            </ul>
            <ul class="m480p">
              <li><a data-content="dGVzdDQ4MHA=">Provider2</a></li>
            </ul>
          </div>
          <div class="download">
            <ul>
              <li>
                <strong>360p</strong>
                <a href="https://download.example.com/360p">Zippy</a>
              </li>
            </ul>
          </div>
        </html>
      `;

      mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

      const result = await service.getEpisodeDetail('opm-s3-ep-1');

      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('anime');
      expect(result).toHaveProperty('streamingServers');
      expect(result).toHaveProperty('downloadLinks');
      expect(Array.isArray(result.streamingServers)).toBe(true);
      expect(Array.isArray(result.downloadLinks)).toBe(true);
    });

    it('should throw NOT_FOUND when episode does not exist', async () => {
      const mockHtml = `<html><div class="posttl"></div></html>`;
      mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

      await expect(service.getEpisodeDetail('non-existent')).rejects.toThrow(
        HttpException,
      );
    });
  });

  describe('getGenres', () => {
    it('should return list of genres', async () => {
      const mockHtml = `
        <html>
          <ul class="genres">
            <li><a href="https://otakudesu.best/genres/action/">Action</a></li>
            <li><a href="https://otakudesu.best/genres/comedy/">Comedy</a></li>
            <li><a href="https://otakudesu.best/genres/drama/">Drama</a></li>
          </ul>
        </html>
      `;

      mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

      const result = await service.getGenres();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('slug');
    });
  });

  describe('getAnimeByGenre', () => {
    it('should return anime filtered by genre', async () => {
      const mockHtml = `
        <html>
          <div class="col-anime">
            <a href="https://otakudesu.best/anime/action-anime/">
              <img src="https://example.com/poster.jpg" />
            </a>
            <div class="col-anime-title"><a>Action Anime</a></div>
            <div class="col-anime-rating">8.5</div>
          </div>
          <div class="pagenavix">
            <span class="page-numbers current">1</span>
            <a class="page-numbers">2</a>
          </div>
        </html>
      `;

      mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

      const result = await service.getAnimeByGenre('action', 1);

      expect(result).toHaveProperty('genre', 'action');
      expect(result).toHaveProperty('anime');
      expect(result).toHaveProperty('pagination');
    });
  });

  describe('getSchedule', () => {
    it('should return weekly schedule', async () => {
      const mockHtml = `
        <html>
          <div class="kglist321">
            <h2>Senin</h2>
            <ul>
              <li><a href="https://otakudesu.best/anime/monday-anime/">Monday Anime</a></li>
            </ul>
          </div>
          <div class="kglist321">
            <h2>Selasa</h2>
            <ul>
              <li><a href="https://otakudesu.best/anime/tuesday-anime/">Tuesday Anime</a></li>
            </ul>
          </div>
        </html>
      `;

      mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

      const result = await service.getSchedule();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('day');
      expect(result[0]).toHaveProperty('anime');
      expect(Array.isArray(result[0].anime)).toBe(true);
    });
  });

  describe('search', () => {
    it('should return search results', async () => {
      const mockHtml = `
        <html>
          <ul class="chivsrc">
            <li>
              <h2><a href="https://otakudesu.best/anime/one-punch-man/">One Punch Man</a></h2>
              <img src="https://example.com/poster.jpg" />
              <div class="set">Rating : 9.0</div>
            </li>
          </ul>
        </html>
      `;

      mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

      const result = await service.search('one punch');

      expect(Array.isArray(result)).toBe(true);
    });

    it('should call correct search URL', async () => {
      const mockHtml = `<html><ul class="chivsrc"></ul></html>`;
      mockedAxios.get.mockResolvedValueOnce({ data: mockHtml });

      await service.search('test query');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('?s=test%20query&post_type=anime'),
        expect.any(Object),
      );
    });
  });

  describe('resolveStreamingUrl', () => {
    it('should resolve streaming URL from dataContent', async () => {
      const mockDataContent = Buffer.from(
        JSON.stringify({ id: 12345, i: 0, q: '480p' }),
      ).toString('base64');

      // Mock nonce request
      mockedAxios.post.mockResolvedValueOnce({
        data: { data: 'test-nonce-value' },
      });

      // Mock player request
      const mockPlayerHtml = Buffer.from(
        '<iframe src="https://player.example.com/embed/12345"></iframe>',
      ).toString('base64');
      mockedAxios.post.mockResolvedValueOnce({
        data: { data: mockPlayerHtml },
      });

      const result = await service.resolveStreamingUrl(mockDataContent);

      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('html');
      expect(result.url).toBe('https://player.example.com/embed/12345');
    });

    it('should throw HttpException when nonce request fails', async () => {
      const mockDataContent = Buffer.from(
        JSON.stringify({ id: 12345, i: 0, q: '480p' }),
      ).toString('base64');

      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      await expect(
        service.resolveStreamingUrl(mockDataContent),
      ).rejects.toThrow(HttpException);
    });

    it('should throw HttpException when player request fails', async () => {
      const mockDataContent = Buffer.from(
        JSON.stringify({ id: 12345, i: 0, q: '480p' }),
      ).toString('base64');

      mockedAxios.post.mockResolvedValueOnce({
        data: { data: 'test-nonce' },
      });
      mockedAxios.post.mockResolvedValueOnce({ data: {} });

      await expect(
        service.resolveStreamingUrl(mockDataContent),
      ).rejects.toThrow(HttpException);
    });

    it('should throw HttpException on invalid dataContent', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Invalid base64'));

      await expect(service.resolveStreamingUrl('invalid')).rejects.toThrow(
        HttpException,
      );
    });
  });
});
