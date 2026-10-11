import { InteractionResponseType } from "discord-interactions";
import {
  activarUsuario,
  pausarUsuario,
  asegurarUsuario,
  contarAnimes,
  seguirAnime,
} from "./db.js";
import { buscarAnimes, obtenerAnime, tituloDe, ultimoEmitido } from "./anilist.js";

const EFIMERO = 64; // solo lo ve quien ejecuta el comando
const MAX_ANIMES = 20; // límite por usuario (el plan gratuito tiene límites de llamadas)

const AYUDA = [
  "¡Hola! Soy **Aibo-chan**. Te aviso por mensaje directo cuando salga un episodio nuevo de tus animes.",
  "",
  "**Comandos**",
  "`/start` activa los avisos",
  "`/add` añade un anime a tu lista",
  "`/cancel` deja de seguir un anime",
  "`/stop` pausa los avisos (tu lista se conserva)",
].join("\n");

function mensaje(texto) {
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: texto, flags: EFIMERO },
  };
}

// En un servidor el usuario viene en `member.user`; en un chat privado, en `user`
function idUsuario(interaccion) {
  return interaccion.member?.user?.id ?? interaccion.user?.id;
}

// Sugerencias mientras el usuario escribe en /add
export async function manejarAutocompletado(interaccion) {
  const vacio = {
    type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
    data: { choices: [] },
  };
  try {
    const campo = interaccion.data.options?.find((o) => o.focused);
    const texto = (campo?.value ?? "").trim();
    if (texto.length < 2) return vacio;

    const resultados = await buscarAnimes(texto);
    console.log(`Autocompletado "${texto}": ${resultados.length} resultados`);
    const choices = resultados.slice(0, 25).map((media) => ({
      name: tituloDe(media).slice(0, 100),
      value: String(media.id),
    }));
    return { ...vacio, data: { choices } };
  } catch (e) {
    console.error("Autocompletado falló:", e.message);
    return vacio;
  }
}

async function comandoAdd(interaccion, env) {
  const userId = idUsuario(interaccion);
  const valor = String(interaccion.data.options?.[0]?.value ?? "").trim();

  // Si eligió una sugerencia, el valor es el ID. Si escribió texto libre, buscamos.
  let id = /^\d+$/.test(valor) ? Number(valor) : null;
  if (id === null) {
    const resultados = await buscarAnimes(valor);
    if (resultados.length === 0) {
      return mensaje(`No he encontrado ningún anime para "${valor}". Prueba con otro nombre.`);
    }
    id = resultados[0].id;
  }

  const media = await obtenerAnime(id);
  if (!media) return mensaje("No he encontrado ese anime. Elige una de las sugerencias al escribir.");

  await asegurarUsuario(env.DB, userId);
  if ((await contarAnimes(env.DB, userId)) >= MAX_ANIMES) {
    return mensaje(`Ya sigues ${MAX_ANIMES} animes, que es el máximo. Quita alguno con \`/cancel\`.`);
  }

  const titulo = tituloDe(media);
  const ultimo = ultimoEmitido(media);
  const nuevo = await seguirAnime(env.DB, userId, media.id, titulo, ultimo);
  if (!nuevo) return mensaje(`Ya sigues **${titulo}**.`);

  const detalle =
    ultimo > 0
      ? `El último episodio emitido es el EP${ultimo}. Te avisaré del siguiente.`
      : "Todavía no ha empezado. Te avisaré cuando salga el primer episodio.";
  return mensaje(`Añadido: **${titulo}**.\n${detalle}`);
}

// ---------------------------------------------------------------
// TEMPORAL: funciones de diagnóstico. Se borrarán cuando elijamos fuente de datos.
// ---------------------------------------------------------------

// /add diag: comprueba desde el Worker qué fuentes de datos aceptan sus peticiones.
async function diagnostico() {
  const limite = () => AbortSignal.timeout(2500);
  const pruebas = [
    [
      "AniList",
      () =>
        fetch("https://graphql.anilist.co", {
          method: "POST",
          headers: { "Content-Type": "application/json", "User-Agent": "aibo-chan (Discord bot)" },
          body: JSON.stringify({ query: "{ Media(id: 21, type: ANIME) { id } }" }),
          signal: limite(),
        }),
    ],
    [
      "Kitsu",
      () =>
        fetch("https://kitsu.io/api/edge/anime?filter[text]=one%20piece&page[limit]=1", {
          headers: { Accept: "application/vnd.api+json" },
          signal: limite(),
        }),
    ],
    [
      "Jikan",
      () => fetch("https://api.jikan.moe/v4/anime?q=one%20piece&limit=1", { signal: limite() }),
    ],
  ];
  const lineas = await Promise.all(
    pruebas.map(async ([nombre, lanzar]) => {
      try {
        const r = await lanzar();
        return `${nombre}: HTTP ${r.status}`;
      } catch (e) {
        return `${nombre}: error (${e.message})`;
      }
    })
  );
  return "DIAGNÓSTICO\n" + lineas.join("\n");
}

// /add diag2 y diag3: qué datos da Kitsu de un anime.
async function diagnosticoKitsu(texto) {
  const cabeceras = { Accept: "application/vnd.api+json" };
  const limite = () => AbortSignal.timeout(1400);
  const base = "https://kitsu.io/api/edge";
  try {
    const busqueda = await fetch(
      `${base}/anime?filter[text]=${encodeURIComponent(texto)}&page[limit]=1`,
      { headers: cabeceras, signal: limite() }
    );
    if (!busqueda.ok) return `Kitsu búsqueda: HTTP ${busqueda.status}`;
    const anime = (await busqueda.json()).data?.[0];
    if (!anime) return "Kitsu: sin resultados";
    const a = anime.attributes;

    const episodios = await fetch(
      `${base}/anime/${anime.id}/episodes?sort=-number&page[limit]=1`,
      { headers: cabeceras, signal: limite() }
    );
    if (!episodios.ok) return `Kitsu episodios: HTTP ${episodios.status}`;
    const ep = (await episodios.json()).data?.[0]?.attributes;

    return [
      `KITSU "${texto}" (id ${anime.id})`,
      `Título: ${a.canonicalTitle} | estado: ${a.status} | episodios totales: ${a.episodeCount}`,
      `nextRelease: ${a.nextRelease}`,
      ep
        ? `Último episodio: ${ep.number} | temporada: ${ep.seasonNumber} | fecha: ${ep.airdate} | título: ${ep.canonicalTitle}`
        : "Último episodio: no hay episodios en Kitsu",
    ].join("\n");
  } catch (e) {
    return `Kitsu: error (${e.message})`;
  }
}

// /add diag4: los dos últimos episodios que Kitsu tiene de un anime, leídos por posición.
async function diagnosticoUltimos(id) {
  const cabeceras = { Accept: "application/vnd.api+json" };
  const limite = () => AbortSignal.timeout(1400);
  const url = `https://kitsu.io/api/edge/anime/${id}/episodes`;
  try {
    const primera = await fetch(`${url}?page[limit]=1`, { headers: cabeceras, signal: limite() });
    if (!primera.ok) return `Kitsu episodios: HTTP ${primera.status}`;
    const total = (await primera.json()).meta?.count;
    if (!total) return "Kitsu no devuelve el total de episodios (meta.count)";

    const desde = Math.max(total - 2, 0);
    const ultimos = await fetch(`${url}?page[limit]=2&page[offset]=${desde}`, {
      headers: cabeceras,
      signal: limite(),
    });
    if (!ultimos.ok) return `Kitsu últimos: HTTP ${ultimos.status}`;
    const lineas = (await ultimos.json()).data.map((e) => {
      const a = e.attributes;
      return `EP ${a.number} | T${a.seasonNumber} | ${a.airdate} | ${a.canonicalTitle}`;
    });
    return [`Kitsu anime ${id}: ${total} episodios en total`, ...lineas].join("\n");
  } catch (e) {
    return `Kitsu: error (${e.message})`;
  }
}

// ---------------------------------------------------------------

export async function manejarComando(interaccion, env) {
  const nombre = interaccion.data.name;
  const userId = idUsuario(interaccion);

  if (nombre === "start") {
    await activarUsuario(env.DB, userId);
    const total = await contarAnimes(env.DB, userId);
    if (total > 0) {
      return mensaje(`Avisos reactivados. Sigues ${total} anime(s).\n\n${AYUDA}`);
    }
    return mensaje(`${AYUDA}\n\nEmpieza con \`/add\`.`);
  }

  if (nombre === "stop") {
    await pausarUsuario(env.DB, userId);
    return mensaje("Avisos pausados. Tu lista se conserva. Usa `/start` para reactivarlos.");
  }

  if (nombre === "add") {
    const texto = String(interaccion.data.options?.[0]?.value ?? "").trim().toLowerCase();
    if (texto === "diag") return mensaje(await diagnostico());
    if (texto === "diag2") return mensaje(await diagnosticoKitsu("one piece"));
    if (texto === "diag3") return mensaje(await diagnosticoKitsu("jujutsu kaisen"));
    if (texto === "diag4") return mensaje(await diagnosticoUltimos(12));
    try {
      return await comandoAdd(interaccion, env);
    } catch (e) {
      console.error("/add falló:", e.message);
      return mensaje(`DEBUG: ${e.message}`);
    }
  }

  return mensaje("Este comando aún está en construcción.");
}