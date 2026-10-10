import json
import os
from pathlib import Path
from urllib.parse import quote

import requests

WEBHOOK = os.environ["DISCORD_WEBHOOK"]
ANIMES = Path("animes.json")
STATE = Path("state.json")

QUERY = """
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    episodes
    nextAiringEpisode { episode }
  }
}
"""


def get_latest_episode(anime):
    """Devuelve el último episodio emitido como dict, o None.
    ESTA es la función que cambiaremos por la de Crunchyroll."""
    r = requests.post(
        "https://graphql.anilist.co",
        json={"query": QUERY, "variables": {"id": anime["anilist_id"]}},
        timeout=20,
    )
    r.raise_for_status()
    media = r.json()["data"]["Media"]

    siguiente = media["nextAiringEpisode"]
    if siguiente:
        numero = siguiente["episode"] - 1
    else:
        numero = media["episodes"]  # serie terminada
    if not numero:
        return None

    return {
        "numero": numero,
        "temporada": None,   # AniList no lo da
        "titulo": None,      # AniList no lo da
        "url": "https://www.crunchyroll.com/es/search?q=" + quote(anime["nombre"]),
    }


def formatear(anime, ep):
    partes = [f"EP{ep['numero']}"]
    if anime.get("mostrar_temporada", True) and ep["temporada"]:
        partes.append(f"TEMP{ep['temporada']}")
    partes.append(ep["titulo"] or anime["nombre"])
    texto = " - ".join(partes)
    return f"¡Nuevo episodio disponible!\n[{texto}](<{ep['url']}>)"


def enviar(mensaje):
    r = requests.post(WEBHOOK, json={"content": mensaje}, timeout=20)
    r.raise_for_status()


def main():
    animes = json.loads(ANIMES.read_text(encoding="utf-8"))
    estado = json.loads(STATE.read_text(encoding="utf-8"))

    for anime in animes:
        try:
            ep = get_latest_episode(anime)
        except Exception as e:
            print(f"Error con {anime['nombre']}: {e}")
            continue

        if ep and ep["numero"] > estado.get(anime["nombre"], 0):
            enviar(formatear(anime, ep))
            estado[anime["nombre"]] = ep["numero"]
            print(f"Avisado: {anime['nombre']} EP{ep['numero']}")

    STATE.write_text(json.dumps(estado, indent=2, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    main()