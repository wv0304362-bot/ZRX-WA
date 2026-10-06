import { Context } from 'hono';
import config from '../config/config';
import { validationError } from '../utils/errors';
import { extractEpisodes, Episode } from '../extractor/extractEpisodes';
import { axiosInstance } from '../services/axiosInstance';

const episodesController = async (c: Context): Promise<Episode[]> => {
  const id = c.req.param('id');

  if (!id) throw new validationError('id is required');

  const idNum = id.split('-').at(-1);
  
  // Tenta primeiro o v2 e, caso falhe, tenta o v1 ou rota alternativa
  let ajaxUrl = `/ajax/v2/episode/list/${idNum}`;
  let result = await axiosInstance(ajaxUrl, {
    headers: { Referer: `${config.baseurl}/watch/${id}` },
  });

  if (!result.success || !result.data) {
    // Tentativa alternativa com v1 caso o v2 retorne 404
    ajaxUrl = `/ajax/v1/episode/list/${idNum}`;
    result = await axiosInstance(ajaxUrl, {
      headers: { Referer: `${config.baseurl}/watch/${id}` },
    });
  }

  if (!result.success || !result.data) {
    throw new validationError(result.message || 'make sure the id is correct', {
      validIdEX: 'one-piece-100',
    });
  }

  const response = extractEpisodes(result.data);
  return response;
};

export default episodesController;
