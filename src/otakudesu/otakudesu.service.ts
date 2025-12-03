import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  HomeResponse,
  AnimeCard,
  AnimeDetail,
  EpisodeDetail,
  Genre,
  ScheduleDay,
  OngoingResponse,
  CompleteResponse,
  GenreAnimeResponse,
  Pagination,
  EpisodeListItem,
  DownloadSection,
  AnimeListItem,
  StreamingServer,
} from './interfaces/otakudesu.interface';

@Injectable()
export class OtakudesuService {
  private readonly baseUrl = 'https://otakudesu.best';
  private readonly headers = {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
  };

  private async fetchHtml(url: string): Promise<cheerio.CheerioAPI> {
    try {
      const response = await axios.get(url, {
        headers: this.headers,
        timeout: 10000,
      });
      return cheerio.load(response.data as string);
    } catch {
      throw new HttpException(
        `Failed to fetch data from ${url}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private extractSlug(url: string): string {
    const matches = url.match(/\/(?:anime|episode)\/([^/]+)\/?/);
    return matches ? matches[1] : '';
  }

  private extractGenreSlug(url: string): string {
    const matches = url.match(/\/genres\/([^/]+)\/?/);
    return matches ? matches[1] : '';
  }

  private parsePagination(
    $: cheerio.CheerioAPI,
    itemsPerPage: number = 50,
  ): Pagination {
    const paginationEl = $('.pagenavix, .pagination');
    const currentPageEl = paginationEl.find('.page-numbers.current');
    const currentPage = parseInt(currentPageEl.text()) || 1;

    const allPages = paginationEl
      .find('.page-numbers:not(.prev):not(.next)')
      .map((_, el) => parseInt($(el).text()) || 0)
      .get()
      .filter((n) => n > 0);

    const totalPages = allPages.length > 0 ? Math.max(...allPages) : 1;

    // Estimate total items (might not be exact)
    const totalItems = totalPages > 0 ? totalPages * itemsPerPage : null;

    return {
      currentPage,
      totalPages,
      itemsPerPage,
      totalItems,
      hasPrevPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      prevPage: currentPage > 1 ? currentPage - 1 : null,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
    };
  }

  async getHome(): Promise<HomeResponse> {
    const $ = await this.fetchHtml(this.baseUrl);

    const ongoing: AnimeCard[] = [];
    const complete: AnimeCard[] = [];

    // Parse ongoing anime
    $('.venz ul')
      .first()
      .find('li')
      .each((_, el) => {
        const $el = $(el);
        const title = $el.find('.jdlflm').text().trim();
        const link = $el.find('.thumb a').attr('href') || '';
        const poster = $el.find('.thumbz img').attr('src') || '';
        const episode = $el.find('.epz').text().replace('Episode', '').trim();
        const releaseDay = $el.find('.epztipe').text().trim();
        const releaseDate = $el.find('.newnime').text().trim();

        if (title && link) {
          ongoing.push({
            title,
            slug: this.extractSlug(link),
            poster,
            episode,
            releaseDay,
            releaseDate,
          });
        }
      });

    // Parse complete anime
    $('.venz ul')
      .last()
      .find('li')
      .each((_, el) => {
        const $el = $(el);
        const title = $el.find('.jdlflm').text().trim();
        const link = $el.find('.thumb a').attr('href') || '';
        const poster = $el.find('.thumbz img').attr('src') || '';
        const totalEpisode = $el.find('.epz').text().trim();
        const rating = $el.find('.epztipe').text().trim();
        const releaseDate = $el.find('.newnime').text().trim();

        if (title && link) {
          complete.push({
            title,
            slug: this.extractSlug(link),
            poster,
            totalEpisode,
            rating,
            releaseDate,
          });
        }
      });

    return { ongoing, complete };
  }

  async getOngoing(page: number = 1): Promise<OngoingResponse> {
    const url =
      page === 1
        ? `${this.baseUrl}/ongoing-anime/`
        : `${this.baseUrl}/ongoing-anime/page/${page}/`;
    const $ = await this.fetchHtml(url);

    const anime: AnimeCard[] = [];

    $('.venz ul li, .rapi .detpost').each((_, el) => {
      const $el = $(el);
      const title = $el.find('.jdlflm, .judul-anime').text().trim();
      const link = $el.find('.thumb a, a').first().attr('href') || '';
      const poster =
        $el.find('.thumbz img, img').first().attr('src') ||
        $el.find('.thumbz img, img').first().attr('data-src') ||
        '';
      const episode = $el.find('.epz').text().replace('Episode', '').trim();
      const releaseDay = $el.find('.epztipe').text().trim();
      const releaseDate = $el.find('.newnime').text().trim();

      if (title && link && link.includes('/anime/')) {
        anime.push({
          title,
          slug: this.extractSlug(link),
          poster,
          episode,
          releaseDay,
          releaseDate,
        });
      }
    });

    const pagination = this.parsePagination($);

    return { anime, pagination };
  }

  async getComplete(page: number = 1): Promise<CompleteResponse> {
    const url =
      page === 1
        ? `${this.baseUrl}/complete-anime/`
        : `${this.baseUrl}/complete-anime/page/${page}/`;
    const $ = await this.fetchHtml(url);

    const anime: AnimeCard[] = [];

    $('.venz ul li, .rapi .detpost').each((_, el) => {
      const $el = $(el);
      const title = $el.find('.jdlflm, .judul-anime').text().trim();
      const link = $el.find('.thumb a, a').first().attr('href') || '';
      const poster =
        $el.find('.thumbz img, img').first().attr('src') ||
        $el.find('.thumbz img, img').first().attr('data-src') ||
        '';
      const totalEpisode = $el.find('.epz').text().trim();
      const rating = $el.find('.epztipe').text().trim();
      const releaseDate = $el.find('.newnime').text().trim();

      if (title && link && link.includes('/anime/')) {
        anime.push({
          title,
          slug: this.extractSlug(link),
          poster,
          totalEpisode,
          rating,
          releaseDate,
        });
      }
    });

    const pagination = this.parsePagination($);

    return { anime, pagination };
  }

  async getAnimeList(): Promise<Record<string, AnimeListItem[]>> {
    const $ = await this.fetchHtml(`${this.baseUrl}/anime-list/`);

    const list: Record<string, AnimeListItem[]> = {};

    $('.bariskelom').each((_, el) => {
      const $el = $(el);
      const letter =
        $el.find('.barispenz a').text().trim().toUpperCase() || '#';

      if (!list[letter]) {
        list[letter] = [];
      }

      $el.find('.jdlbar ul li a').each((_, linkEl) => {
        const $link = $(linkEl);
        const title = $link.text().trim();
        const href = $link.attr('href') || '';

        if (title && href) {
          list[letter].push({
            title,
            slug: this.extractSlug(href),
          });
        }
      });
    });

    return list;
  }

  async getAnimeDetail(slug: string): Promise<AnimeDetail> {
    const $ = await this.fetchHtml(`${this.baseUrl}/anime/${slug}/`);

    const title = $('.jdlrx h1')
      .text()
      .trim()
      .replace(/\s*\(Episode\s*\d+\s*[-–]\s*\d+\)\s*/i, '')
      .replace(/(\s*(Subtitle Indonesia|Sub Indo))+$/i, '')
      .trim();
    const poster = $('.fotoanime img').attr('src') || '';

    // Check if anime exists (title is empty means not found)
    if (!title) {
      throw new HttpException(
        `Anime dengan slug '${slug}' tidak ditemukan`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Parse info
    const infoMap: Record<string, string> = {};
    $('.infozingle p').each((_, el) => {
      const text = $(el).text();
      const [key, ...valueParts] = text.split(':');
      if (key && valueParts.length) {
        infoMap[key.trim().toLowerCase()] = valueParts.join(':').trim();
      }
    });

    // Parse genres
    const genres: string[] = [];
    $('.infozingle p span a[href*="/genres/"]').each((_, el) => {
      genres.push($(el).text().trim());
    });

    // Parse synopsis
    const synopsis = $('.sinopc').text().trim();

    // Parse episodes
    const episodes: EpisodeListItem[] = [];
    $('.episodelist ul li').each((_, el) => {
      const $el = $(el);
      const link = $el.find('a').attr('href') || '';
      const epTitle = $el.find('a').text().trim();
      const date = $el.find('.zeebr').text().trim();

      // Extract episode number
      const epMatch = epTitle.match(/Episode\s*(\d+)/i);
      const episode = epMatch ? epMatch[1] : epTitle;

      if (link.includes('/episode/')) {
        episodes.push({
          episode,
          slug: this.extractSlug(link),
          date,
        });
      }
    });

    return {
      title,
      japanese: infoMap['japanese'] || '',
      score: infoMap['skor'] || '',
      producer: infoMap['produser'] || '',
      type: infoMap['tipe'] || '',
      status: infoMap['status'] || '',
      totalEpisode: infoMap['total episode'] || '',
      duration: infoMap['durasi'] || '',
      releaseDate: infoMap['tanggal rilis'] || '',
      studio: infoMap['studio'] || '',
      genres,
      synopsis,
      poster,
      episodes,
    };
  }

  async getEpisodeDetail(slug: string): Promise<EpisodeDetail> {
    const $ = await this.fetchHtml(`${this.baseUrl}/episode/${slug}/`);

    const title = $('.posttl').text().trim();

    // Check if episode exists
    if (!title) {
      throw new HttpException(
        `Episode dengan slug '${slug}' tidak ditemukan`,
        HttpStatus.NOT_FOUND,
      );
    }

    // Get anime info - look for "See All Episodes" link in .flir
    const animeLink =
      $('.flir a[href*="/anime/"]').attr('href') ||
      $('.flir a:contains("See All")').attr('href') ||
      '';
    // Extract anime title from the episode title (remove "Episode X Subtitle Indonesia")
    const animeTitle = title.replace(/\s*Episode\s*\d+.*$/i, '').trim();

    // Navigation - Otakudesu uses "Previous Eps." and "Next Eps." for navigation
    const prevLink = $('.flir a:contains("Previous")').attr('href') || '';
    const nextLink = $('.flir a:contains("Next")').attr('href') || '';

    // Streaming URL (default player)
    const streamingUrl = $('#embed_holder iframe').attr('src') || '';

    // Parse streaming servers/mirrors
    const streamingServers: StreamingServer[] = [];
    const qualityMap: Record<
      string,
      { provider: string; dataContent: string; isDefault?: boolean }[]
    > = {};

    // Parse mirror stream sections (m360p, m480p, m720p, etc.)
    $('.mirrorstream ul').each((_, ulEl) => {
      const $ul = $(ulEl);
      const className = $ul.attr('class') || '';

      // Extract quality from class name (e.g., m360p -> 360p)
      const qualityMatch = className.match(/m(\d+p)/);
      const quality = qualityMatch ? qualityMatch[1] : 'unknown';

      if (!qualityMap[quality]) {
        qualityMap[quality] = [];
      }

      $ul.find('li a[data-content]').each((_, linkEl) => {
        const $link = $(linkEl);
        const provider = $link.text().trim();
        const dataContent = $link.attr('data-content') || '';
        const isDefault = $link.attr('data-default') === 'true';

        if (provider && dataContent) {
          qualityMap[quality].push({
            provider,
            dataContent,
            isDefault: isDefault || undefined,
          });
        }
      });
    });

    // Convert qualityMap to streamingServers array
    for (const [quality, servers] of Object.entries(qualityMap)) {
      if (servers.length > 0) {
        streamingServers.push({ quality, servers });
      }
    }

    // Download links
    const downloadLinks: DownloadSection[] = [];

    $('.download ul li').each((_, el) => {
      const $el = $(el);
      const resolution = $el.find('strong').text().trim();
      const links: { provider: string; url: string }[] = [];

      $el.find('a').each((_, linkEl) => {
        const $link = $(linkEl);
        const provider = $link.text().trim();
        const url = $link.attr('href') || '';

        if (provider && url) {
          links.push({ provider, url });
        }
      });

      if (resolution && links.length > 0) {
        downloadLinks.push({ resolution, links });
      }
    });

    return {
      title,
      anime: {
        title: animeTitle,
        slug: this.extractSlug(animeLink),
      },
      prevEpisode: prevLink ? this.extractSlug(prevLink) : undefined,
      nextEpisode: nextLink ? this.extractSlug(nextLink) : undefined,
      streamingUrl: streamingUrl || undefined,
      streamingServers,
      downloadLinks,
    };
  }

  async getGenres(): Promise<Genre[]> {
    const $ = await this.fetchHtml(`${this.baseUrl}/genre-list/`);

    const genres: Genre[] = [];

    $('.genres li a').each((_, el) => {
      const $el = $(el);
      const name = $el.text().trim();
      const href = $el.attr('href') || '';

      if (name && href) {
        genres.push({
          name,
          slug: this.extractGenreSlug(href),
        });
      }
    });

    return genres;
  }

  async getAnimeByGenre(
    genre: string,
    page: number = 1,
  ): Promise<GenreAnimeResponse> {
    const url =
      page === 1
        ? `${this.baseUrl}/genres/${genre}/`
        : `${this.baseUrl}/genres/${genre}/page/${page}/`;
    const $ = await this.fetchHtml(url);

    const anime: AnimeCard[] = [];

    $('.col-anime, .col-md-4, .venz li, .page .col-6').each((_, el) => {
      const $el = $(el);
      const title = $el
        .find('.col-anime-title a, .jdlflm, .judul-anime, h3, h4')
        .first()
        .text()
        .trim();
      const link = $el.find('a').first().attr('href') || '';
      const poster =
        $el.find('img').first().attr('src') ||
        $el.find('img').first().attr('data-src') ||
        '';
      const rating = $el.find('.col-anime-rating, .epztipe').text().trim();

      if (title && link && link.includes('/anime/')) {
        anime.push({
          title,
          slug: this.extractSlug(link),
          poster,
          rating,
        });
      }
    });

    const pagination = this.parsePagination($);

    return {
      genre,
      anime,
      pagination,
    };
  }

  async getSchedule(): Promise<ScheduleDay[]> {
    const $ = await this.fetchHtml(`${this.baseUrl}/jadwal-rilis/`);

    const schedule: ScheduleDay[] = [];
    const days = [
      'Senin',
      'Selasa',
      'Rabu',
      'Kamis',
      'Jumat',
      'Sabtu',
      'Minggu',
    ];

    $('.kglist321').each((index, el) => {
      const $el = $(el);
      const day =
        $el.find('h2').text().trim() || days[index] || `Day ${index + 1}`;
      const animeList: { title: string; slug: string }[] = [];

      $el.find('ul li a').each((_, linkEl) => {
        const $link = $(linkEl);
        const title = $link.text().trim();
        const href = $link.attr('href') || '';

        if (title && href) {
          animeList.push({
            title,
            slug: this.extractSlug(href),
          });
        }
      });

      if (animeList.length > 0) {
        schedule.push({
          day,
          anime: animeList,
        });
      }
    });

    return schedule;
  }

  async search(query: string): Promise<AnimeCard[]> {
    const $ = await this.fetchHtml(
      `${this.baseUrl}/?s=${encodeURIComponent(query)}&post_type=anime`,
    );

    const anime: AnimeCard[] = [];

    // Search results use .chivsrc li structure
    $('.chivsrc li').each((_, el) => {
      const $el = $(el);
      const title = $el.find('h2 a').text().trim();
      const link = $el.find('h2 a').attr('href') || '';
      const poster = $el.find('img').attr('src') || '';

      // Extract status and rating
      let rating = '';
      $el.find('.set').each((__, setEl) => {
        const text = $(setEl).text();
        if (text.includes('Rating')) {
          rating = text.replace('Rating :', '').trim();
        }
      });

      if (title && link && link.includes('/anime/')) {
        anime.push({
          title,
          slug: this.extractSlug(link),
          poster,
          rating: rating || undefined,
        });
      }
    });

    return anime;
  }

  /**
   * Resolve streaming URL from data-content (base64 encoded JSON)
   * This simulates the AJAX request that otakudesu uses to get the player iframe
   */
  async resolveStreamingUrl(
    dataContent: string,
  ): Promise<{ url: string; html?: string }> {
    interface StreamingParams {
      id?: number;
      i?: number;
      q?: string;
    }

    interface AjaxResponse {
      data?: string;
    }

    try {
      // Decode the base64 data-content to get the params
      const decoded = Buffer.from(dataContent, 'base64').toString('utf-8');
      const params: StreamingParams = JSON.parse(decoded) as StreamingParams;

      // First, get the nonce
      const nonceResponse = await axios.post<AjaxResponse>(
        `${this.baseUrl}/wp-admin/admin-ajax.php`,
        new URLSearchParams({
          action: 'aa1208d27f29ca340c92c66d1926f13f',
        }),
        {
          headers: {
            ...this.headers,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
        },
      );

      const nonce = nonceResponse.data?.data;

      if (!nonce) {
        throw new HttpException(
          'Failed to get nonce for streaming',
          HttpStatus.BAD_GATEWAY,
        );
      }

      // Now request the actual player URL
      const playerResponse = await axios.post<AjaxResponse>(
        `${this.baseUrl}/wp-admin/admin-ajax.php`,
        new URLSearchParams({
          action: '2a3505c93b0035d3f455df82bf976b84',
          nonce: nonce,
          id: params.id?.toString() || '',
          i: params.i?.toString() || '',
          q: params.q || '',
        }),
        {
          headers: {
            ...this.headers,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 10000,
        },
      );

      const encodedHtml = playerResponse.data?.data;

      if (!encodedHtml) {
        throw new HttpException(
          'Failed to get streaming player',
          HttpStatus.BAD_GATEWAY,
        );
      }

      // Decode the base64 HTML response
      const html = Buffer.from(encodedHtml, 'base64').toString('utf-8');

      // Extract iframe src from the HTML
      const iframeMatch = html.match(/src="([^"]+)"/);
      const url = iframeMatch ? iframeMatch[1] : '';

      return {
        url,
        html,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to resolve streaming URL',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
