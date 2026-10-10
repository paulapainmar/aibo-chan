// Registra los comandos de Aibo-chan en Discord.
// Se ejecuta a mano, solo cuando cambias los comandos:
//   node scripts/register-commands.js
// Necesita dos variables de entorno: DISCORD_APP_ID y DISCORD_TOKEN.

const appId = process.env.DISCORD_APP_ID;
const token = process.env.DISCORD_TOKEN;

if (!appId || !token) {
  console.error("Faltan DISCORD_APP_ID o DISCORD_TOKEN en el entorno.");
  process.exit(1);
}

// 0 = instalado en un servidor, 1 = instalado en la cuenta de un usuario
const INTEGRATION_TYPES = [0, 1];
// 0 = canal de servidor, 1 = mensaje directo con el bot, 2 = otros chats privados
const CONTEXTS = [0, 1, 2];

const commands = [
  {
    name: "empezar",
    description: "Activa Aibo-chan para tu usuario y muestra la ayuda",
  },
  {
    name: "add",
    description: "Añade un anime a tu lista de seguimiento",
    options: [
      {
        type: 3, // texto
        name: "anime",
        description: "Nombre del anime",
        required: true,
        autocomplete: true,
      },
    ],
  },
  {
    name: "cancel",
    description: "Muestra tu lista y elige un anime para dejar de seguir",
  },
  {
    name: "stop",
    description: "Pausa los avisos (tu lista se conserva)",
  },
].map((c) => ({
  ...c,
  type: 1, // comando de barra (/)
  integration_types: INTEGRATION_TYPES,
  contexts: CONTEXTS,
}));

const url = `https://discord.com/api/v10/applications/${appId}/commands`;

// PUT reemplaza todos los comandos globales por esta lista
const respuesta = await fetch(url, {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bot ${token}`,
  },
  body: JSON.stringify(commands),
});

if (respuesta.ok) {
  const registrados = await respuesta.json();
  console.log(`Registrados ${registrados.length} comandos:`);
  for (const c of registrados) console.log(`  /${c.name}`);
} else {
  console.error(`Error ${respuesta.status}:`, await respuesta.text());
  process.exit(1);
}