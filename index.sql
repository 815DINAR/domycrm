-- Индексы для производительности
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_videos_filename ON videos(filename);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_reactions_user_id ON reactions(user_id);
CREATE INDEX idx_watch_progress_user_id ON watch_progress(user_id);