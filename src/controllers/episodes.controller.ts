import { Context } from 'hono';
import config from '../config/config';
import { validationError } from '../utils/errors';
import { extractEpisodes, Episode } from '../extractor/extractEpisodes';
import { axiosInstance } from '../services/axiosInstance';

const episodesController = async (c: Context): Promise<Episode[]> => {
  const id = c.req.param('id');

  if (!id) throw new validationError('id is required');

  const idNum = id.split('-').at(-1);

  // Endpoints AJAX mais comuns nos espelhos atuais (.at e .ru)
  const possibleEndpoints = [
    `/ajax/v2/episode/list/${idNum}`,
    `/ajax/v1/episode/list/${idNum}`,
    `/ajax/anime/episodes/${idNum}`
  ];

  let result: any = null;

  for (const endpoint of possibleEndpoints) {
    try {
      const res = await axiosInstance(endpoint, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Referer': `${config.baseurl}/watch/${id}`,
        },
      });
      if (res && (res.success || res.html || res.data)) {
        result = res;
        break;
      }
    } catch (err) {
      // Tenta o próximo endpoint se falhar
    }
  }

  if (!result || (!result.success && !result.html && !result.data)) {
    throw new validationError('Could not fetch episodes for this anime', {
      validIdEX: 'one-piece-100',
    });
  }

  const rawData = result.data || result.html || result;
  const response = extractEpisodes(rawData);
  return response;
};

export default episodesController;
