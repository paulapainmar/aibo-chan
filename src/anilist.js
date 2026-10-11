// Acceso a la API de AniList (gratuita, sin clave).

const URL_ANILIST = "https://graphql.anilist.co";

async function consultar(query, variables, limiteMs = 2500) {
  const respuesta = await fetch(URL_ANILIST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "aibo-chan (Discord bot)",
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(limiteMs), // Discord solo espera 3 segundos
  });
  if (!respuesta.ok) {
    // Incluimos el principio de la respuesta: AniList explica ahí por qué rechaza
    const cuerpo = (await respuesta.text()).replace(/\s+/g, " ").slice(0, 150);
    throw new Error(`AniList respondió ${respuesta.status}: ${cuerpo}`);
  }
  const { data, errors } = await respuesta.json();
  if (errors) throw new Error(errors[0].message);
  return data;
}

// Título que mostramos: inglés si existe, y si no, romaji
export function tituloDe(media) {
  return media.title.english || media.title.romaji;
}

// Último episodio ya emitido de un anime
export function ultimoEmitido(media) {
  if (media.nextAiringEpisode) return media.nextAiringEpisode.episode - 1;
  return media.episodes || 0; // serie terminada
}

// Busca animes por texto (para el autocompletado)
export async function buscarAnimes(texto) {
  const query = `
    query ($busqueda: String) {
      Page(perPage: 10) {
        media(search: $busqueda, type: ANIME, isAdult: false, sort: SEARCH_MATCH) {
          id
          title { romaji english }
        }
      }
    }`;
  const data = await consultar(query, { busqueda: texto });
  return data.Page.media;
}

// Datos de un anime concreto por su ID
export async function obtenerAnime(id) {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title { romaji english }
        episodes
        nextAiringEpisode { episode }
      }
    }`;
  try {
    const data = await consultar(query, { id });
    return data.Media;
  } catch (e) {
    if (String(e.message).includes("Not Found")) return null;
    throw e;
  }
}