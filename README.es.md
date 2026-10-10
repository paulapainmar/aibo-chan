# Aibo-chan

[Read in English](README.md)

Bot gratuito de Discord que te avisa por mensaje directo cuando tus animes favoritos tienen un episodio nuevo. Funciona con Cloudflare Workers y no cuesta nada.

> **Estado: en desarrollo.** El Worker se está construyendo. Hasta que esté listo, sigue funcionando la versión anterior (`check.py` + GitHub Actions + webhook).

## Qué hace

Cada usuario gestiona su propia lista de animes con comandos. Aibo-chan consulta AniList cada 6 horas y envía un mensaje directo cuando sale un episodio nuevo.

| Comando | Descripción |
|---|---|
| `/empezar` | Activa el bot para tu usuario y muestra la ayuda |
| `/add` | Añade un anime a seguir (con sugerencias mientras escribes) |
| `/cancel` | Muestra tu lista y eliges qué anime dejar de seguir |
| `/stop` | Pausa el bot. Tu lista se conserva |

Los comandos y los avisos están en español.

## Cómo funciona

1. El usuario instala la app en su cuenta de Discord y recibe un mensaje de bienvenida.
2. Los comandos llegan a un Worker de Cloudflare, que guarda usuarios y animes seguidos en una base de datos D1.
3. Un temporizador consulta AniList una sola vez para todos los animes seguidos y envía mensajes directos de los episodios nuevos.

## Tecnología

- Cloudflare Workers (JavaScript) y D1
- Interacciones de Discord por HTTP (sin proceso siempre encendido)
- API GraphQL de AniList como fuente de episodios

## Instalación propia

Requisitos: Node.js LTS, una cuenta gratuita de Cloudflare y una aplicación de Discord.

1. Clona el repo y ejecuta `npm install`.
2. Crea la base de datos: `npx wrangler d1 create aibo-chan` y pon su ID en `wrangler.jsonc`.
3. Crea las tablas: `npx wrangler d1 execute aibo-chan --remote --file=schema.sql`.
4. Crea una aplicación de Discord y activa **Instalación de usuario** e **Instalación de servidor**.
5. Guarda los secretos con `npx wrangler secret put <NOMBRE>`:
   - `DISCORD_TOKEN`
   - `DISCORD_PUBLIC_KEY`
   - `DISCORD_APP_ID`
6. Registra los comandos y despliega con `npm run deploy` *(scripts próximamente)*.
7. Pon la URL de tu Worker en **Interactions Endpoint URL** (URL de punto final de interacciones) de tu aplicación de Discord.

Nunca subas tokens ni claves. `.dev.vars` y `.env` están ignorados por Git.

## Limitaciones

- El plan gratuito de Cloudflare permite 50 llamadas externas por ejecución, así que cada ejecución solo puede avisar a un número limitado de usuarios. Suficiente para un grupo pequeño.
- Los datos vienen de AniList: todavía no hay temporada, título del episodio ni enlace directo al episodio.
- Crunchyroll bloquea el acceso automatizado desde servidores, así que no se puede usar como fuente.

## Hoja de ruta

- [x] Proyecto Worker, base de datos D1 y esquema
- [ ] Aplicación de Discord y verificación de peticiones
- [ ] `/empezar` y `/stop`
- [ ] `/add` con autocompletado y `/cancel` con menú
- [ ] Comprobación programada y mensajes directos
- [ ] Mensaje de bienvenida al instalar
- [ ] Retirar la versión antigua en Python
- [ ] Enlace a la página de la serie en Crunchyroll *(por explorar)*

## Licencia

MIT