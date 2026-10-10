# Aibo-chan

[Read in English](README.md)

Avisador gratuito de nuevos episodios de anime para Discord. Funciona con GitHub Actions y no cuesta nada.

Aibo-chan revisa tu lista de animes cada 6 horas y envía un mensaje a tu canal de Discord cuando hay un episodio nuevo.

## Ejemplo

> ¡Nuevo episodio disponible!
> [EP1 - TEMP1 - Título del episodio](https://www.crunchyroll.com/es)

## Cómo funciona

1. GitHub Actions ejecuta `check.py` de forma programada.
2. El script lee tu lista de `animes.json`.
3. Compara el último episodio de cada anime con `state.json`.
4. Si hay uno nuevo, envía un mensaje mediante un webhook de Discord.
5. El workflow guarda el `state.json` actualizado en el repo.

## Instalación

1. **Haz fork o clona** este repo. Mantenlo público para que los minutos de GitHub Actions sean ilimitados.
2. **Crea un webhook de Discord**: Ajustes del canal > Integraciones > Webhooks > Nuevo webhook. Copia la URL.
3. **Añade el secret**: Settings del repo > Secrets and variables > Actions > New repository secret.
   - Nombre: `DISCORD_WEBHOOK`
   - Valor: la URL del webhook
4. **Edita `animes.json`** con tu lista de animes.
5. **Pruébalo**: pestaña Actions > "Check episodes" > Run workflow.

## Añadir un anime

Añade una entrada nueva a `animes.json`:

```json
[
  { "nombre": "One Piece", "anilist_id": 21 }
]
```

`anilist_id` es el número que aparece en la URL del anime en AniList (`anilist.co/anime/21`).

## Configuración

- **Frecuencia**: cambia la línea `cron` en `.github/workflows/check.yml`. Por defecto es cada 6 horas (`0 */6 * * *`).
- **Idioma y región**: los mensajes están en español y los enlaces apuntan a Crunchyroll España.

## Limitaciones

- No hay comandos de chat: la lista se edita en `animes.json`.
- GitHub desactiva los workflows programados tras 60 días sin actividad en el repo. Los commits automáticos de `state.json` suelen evitarlo.
- Los datos de episodios vienen ahora de AniList, así que todavía no hay temporada, título del episodio ni enlace directo.

## Hoja de ruta

- [ ] Crunchyroll España como fuente de datos (temporada, título, enlace directo)
- [ ] Comandos para añadir y quitar animes (Cloudflare Workers)

## Licencia

MIT