-- Usuarios que han activado el bot
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,              -- ID de usuario de Discord
  dm_channel_id TEXT,               -- canal de mensajes directos (se guarda la primera vez)
  active INTEGER NOT NULL DEFAULT 1, -- 1 = recibe avisos, 0 = pausado con /stop
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Animes que sigue cada usuario
CREATE TABLE IF NOT EXISTS follows (
  user_id TEXT NOT NULL,
  anilist_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  last_episode INTEGER NOT NULL DEFAULT 0, -- último episodio avisado a este usuario
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, anilist_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_follows_anilist ON follows(anilist_id);