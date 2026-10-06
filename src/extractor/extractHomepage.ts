import { load } from 'cheerio';
import { Element } from 'domhandler';
import { HomePage, TrendingAnime, AnimeFeatured } from '../types/anime';

export const extractHomepage = (html: string): HomePage => {
  const $ = load(html);

  const response: HomePage = {
    spotlight: [],
    trending: [],
    topAiring: [],
    mostPopular: [],
    mostFavorite: [],
    latestCompleted: [],
    latestEpisode: [],
    newAdded: [],
    topUpcoming: [],
    top10: {
      today: null,
      week: null,
      month: null,
    },
    genres: [],
  };

  // Seletores adaptados para a estrutura do AnimeFire
  const $latestEpisodes = $('.latest-episodes .card, .row.ml--1 div[class*="col"]');
  const $popular = $('.popular-animes .card, .anime-card');

  // Extrair últimos episódios / animes recentes
  $($latestEpisodes).each((i: number, el: Element) => {
    const obj: AnimeFeatured = {
      title: null,
      alternativeTitle: null,
      id: null,
      poster: null,
      type: null,
      episodes: {
        sub: null,
        dub: null,
        eps: null,
      },
    };

    const linkEl = $(el).find('a').first();
    const href = linkEl.attr('href') || '';
    // Exemplo de link no AnimeFire: /animes/nome-do-anime-episodio-10 ou /animes/nome-do-anime
    obj.id = href.split('/').filter(Boolean).pop() || null;

    const titleEl = $(el).find('.card-title, h3, h4, .anime-title');
    obj.title = titleEl.text().trim() || linkEl.attr('title') || null;

    const imgEl = $(el).find('img');
    obj.poster = imgEl.attr('data-src') || imgEl.attr('src') || null;

    if (obj.title) {
      response.latestEpisode.push(obj);
    }
  });

  // Extrair animes populares / destaque
  $($popular).each((i: number, el: Element) => {
    const obj: TrendingAnime = {
      title: null,
      alternativeTitle: null,
      rank: i + 1,
      poster: null,
      id: null,
    };

    const linkEl = $(el).find('a').first();
    const href = linkEl.attr('href') || '';
    obj.id = href.split('/').filter(Boolean).pop() || null;

    const titleEl = $(el).find('.card-title, h3, h4, .anime-title');
    obj.title = titleEl.text().trim() || linkEl.attr('title') || null;

    const imgEl = $(el).find('img');
    obj.poster = imgEl.attr('data-src') || imgEl.attr('src') || null;

    if (obj.title) {
      response.trending.push(obj);
    }
  });

  // Fallback caso traga dados genéricos
  $('.card, article').each((i: number, el: Element) => {
    const linkEl = $(el).find('a').first();
    const href = linkEl.attr('href') || '';
    const title = $(el).find('h3, h4, .card-title').text().trim();
    const poster = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');

    if (title && href && !response.newAdded.some(item => item.title === title)) {
      const obj: AnimeFeatured = {
        title,
        alternativeTitle: null,
        id: href.split('/').filter(Boolean).pop() || null,
        poster: poster || null,
        type: null,
        episodes: { sub: null, dub: null, eps: null },
      };
      response.newAdded.push(obj);
    }
  });

  return response;
};
