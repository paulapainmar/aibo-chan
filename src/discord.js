import { verifyKey } from "discord-interactions";

// Comprueba que la petición viene realmente de Discord.
// Discord firma cada petición; sin firma válida respondemos 401.
export async function verificarPeticion(request, clavePublica) {
  const firma = request.headers.get("x-signature-ed25519");
  const marca = request.headers.get("x-signature-timestamp");
  const cuerpo = await request.text();

  if (!firma || !marca) return { valida: false, cuerpo };

  const valida = await verifyKey(cuerpo, firma, marca, clavePublica);
  return { valida, cuerpo };
}