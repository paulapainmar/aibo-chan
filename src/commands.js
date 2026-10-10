import { InteractionResponseType } from "discord-interactions";
import { activarUsuario, pausarUsuario, contarAnimes } from "./db.js";

const EFIMERO = 64; // solo lo ve quien ejecuta el comando

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

  return mensaje("Este comando aún está en construcción.");
}