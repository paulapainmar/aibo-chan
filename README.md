# Aibo-chan

[Leer en español](README.es.md)

Free Discord notifier for new anime episodes. Runs on GitHub Actions, costs nothing.

Aibo-chan checks your anime list every 6 hours and sends a message to your Discord channel when a new episode is available.

## Example

> ¡Nuevo episodio disponible!
> [EP1 - TEMP1 - Episode title](https://www.crunchyroll.com/es)

Notification messages are sent in Spanish.

## How it works

1. GitHub Actions runs `check.py` on a schedule.
2. The script reads your list from `animes.json`.
3. It compares the latest episode of each anime with `state.json`.
4. If there is a new one, it sends a message through a Discord webhook.
5. The workflow saves the updated `state.json` in the repo.

## Setup

1. **Fork or clone** this repo. Keep it public so GitHub Actions minutes are unlimited.
2. **Create a Discord webhook**: Channel settings > Integrations > Webhooks > New webhook. Copy the URL.
3. **Add the secret**: repo Settings > Secrets and variables > Actions > New repository secret.
   - Name: `DISCORD_WEBHOOK`
   - Value: your webhook URL
4. **Edit `animes.json`** with your anime list.
5. **Test it**: Actions tab > "Check episodes" > Run workflow.

## Adding an anime

Add a new entry to `animes.json`:

```json
[
  { "nombre": "One Piece", "anilist_id": 21 }
]
```

`anilist_id` is the number in the anime's AniList URL (`anilist.co/anime/21`).

## Configuration

- **Frequency**: change the `cron` line in `.github/workflows/check.yml`. Default is every 6 hours (`0 */6 * * *`).
- **Language and region**: messages are in Spanish and links point to Crunchyroll Spain.

## Limitations

- No chat commands: the list is edited in `animes.json`.
- GitHub disables scheduled workflows after 60 days without repo activity. The automatic `state.json` commits usually prevent this.
- Episode data currently comes from AniList, so season, episode title and direct episode link are not available yet.

## Roadmap

- [ ] Crunchyroll Spain as data source (season, title, direct link)
- [ ] Commands to add and remove anime (Cloudflare Workers)

## License

MIT