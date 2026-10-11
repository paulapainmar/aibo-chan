# Aibo-chan

Free Discord bot that notifies you by direct message when your favourite anime get a new episode. Runs on Cloudflare Workers, costs nothing.

> **Status: work in progress.** The bot is being built; scheduled notifications are not active yet.

## What it does

Each user manages their own anime list with slash commands. Aibo-chan checks AniList every 6 hours and sends a direct message when a new episode is out.

| Command | Description |
|---|---|
| `/start` | Activates the bot for your user and shows the help message |
| `/add` | Adds an anime to follow (with search suggestions as you type) |
| `/cancel` | Shows your list and lets you pick an anime to stop following |
| `/stop` | Pauses the bot. Your list is kept |

Notification messages and commands are in Spanish.

## How it works

1. A user installs the app on their Discord account and receives a welcome message.
2. Commands reach a Cloudflare Worker, which stores users and followed anime in a D1 database.
3. A scheduled trigger queries AniList once for all followed anime and sends direct messages for new episodes.

## Stack

- Cloudflare Workers (JavaScript) and D1
- Discord interactions over HTTP (no always-on process)
- AniList GraphQL API as the episode source

## Self-hosting

Requirements: Node.js LTS, a free Cloudflare account and a Discord application.

1. Clone the repo and run `npm install`.
2. Create the database: `npx wrangler d1 create aibo-chan` and put its ID in `wrangler.jsonc`.
3. Create the tables: `npx wrangler d1 execute aibo-chan --remote --file=schema.sql`.
4. Create a Discord application, enable **User Install** and **Guild Install**.
5. Store the secrets with `npx wrangler secret put <NAME>`:
   - `DISCORD_TOKEN`
   - `DISCORD_PUBLIC_KEY`
   - `DISCORD_APP_ID`
6. Register the commands and deploy with `npm run deploy` *(scripts coming soon)*.
7. Set the **Interactions Endpoint URL** of your Discord application to your Worker URL.

Never commit tokens or keys. `.dev.vars` and `.env` are git-ignored.

## Limitations

- The free Cloudflare plan allows 50 external calls per Worker run, so one run can only message a limited number of users. Fine for a small group.
- Episode data comes from AniList: no season, episode title or direct episode link yet.
- Crunchyroll blocks automated access from servers, so it cannot be used as a source.

## Roadmap

- [x] Worker project, D1 database and schema
- [ ] Discord application and request verification
- [ ] `/start` and `/stop`
- [ ] `/add` with autocomplete and `/cancel` with a menu
- [ ] Scheduled check and direct messages
- [ ] Welcome message on install
- [x] Remove the legacy Python version
- [ ] Link to the Crunchyroll series page *(to be explored)*

## License

MIT