import { InteractionType, InteractionResponseType } from "discord-interactions";
import { verificarPeticion } from "./discord.js";

function json(datos) {
  return new Response(JSON.stringify(datos), {
    headers: { "content-type": "application/json" },
  });
}

export default {
  // Aquí llegan las peticiones de Discord (comandos, botones, etc.)
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Aibo-chan activo", { status: 200 });
    }

    const { valida, cuerpo } = await verificarPeticion(request, env.DISCORD_PUBLIC_KEY);
    if (!valida) return new Response("Firma no válida", { status: 401 });

    const interaccion = JSON.parse(cuerpo);

    // Discord envía un PING al guardar la URL: hay que responder PONG
    if (interaccion.type === InteractionType.PING) {
      return json({ type: InteractionResponseType.PONG });
    }

    return json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: "Aibo-chan está en construcción." },
    });
  },

  // Aquí llegará el temporizador de cada 6 horas (de momento no hace nada)
  async scheduled(event, env, ctx) {
    console.log("Cron ejecutado");
  },
};