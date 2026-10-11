// Consultas a la base de datos D1. Todas reciben `db` (env.DB).

// Da de alta al usuario (o lo reactiva si estaba en pausa)
export async function activarUsuario(db, userId) {
  await db
    .prepare(
      "INSERT INTO users (id, active) VALUES (?, 1) ON CONFLICT(id) DO UPDATE SET active = 1"
    )
    .bind(userId)
    .run();
}

// Pausa los avisos del usuario (su lista se conserva)
export async function pausarUsuario(db, userId) {
  await db
    .prepare(
      "INSERT INTO users (id, active) VALUES (?, 0) ON CONFLICT(id) DO UPDATE SET active = 0"
    )
    .bind(userId)
    .run();
}

// Crea al usuario si no existe, sin tocar su estado si ya existe
export async function asegurarUsuario(db, userId) {
  await db.prepare("INSERT OR IGNORE INTO users (id) VALUES (?)").bind(userId).run();
}

// Cuántos animes sigue el usuario
export async function contarAnimes(db, userId) {
  const fila = await db
    .prepare("SELECT COUNT(*) AS total FROM follows WHERE user_id = ?")
    .bind(userId)
    .first();
  return fila ? fila.total : 0;
}

// Añade un anime a la lista. Devuelve false si ya lo seguía.
export async function seguirAnime(db, userId, anilistId, titulo, ultimoEpisodio) {
  const resultado = await db
    .prepare(
      `INSERT INTO follows (user_id, anilist_id, title, last_episode)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, anilist_id) DO NOTHING`
    )
    .bind(userId, anilistId, titulo, ultimoEpisodio)
    .run();
  return resultado.meta.changes > 0;
}