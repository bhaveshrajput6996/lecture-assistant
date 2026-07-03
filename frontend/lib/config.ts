// ─── API CONFIGURATION ───────────────────────────────────────
// Change this single value to point the frontend at a different backend.
export const API_BASE_URL = "http://127.0.0.1:8000"

export const API_ROUTES = {
  root: () => `${API_BASE_URL}/`,
  uploadAudio: () => `${API_BASE_URL}/upload-audio`,
  summarize: (audioId: string) => `${API_BASE_URL}/summarize/${audioId}`,
  ask: (audioId: string, question: string) =>
    `${API_BASE_URL}/ask/${audioId}?question=${encodeURIComponent(question)}`,
  reindex: (audioId: string) => `${API_BASE_URL}/reindex/${audioId}`,
  deleteLecture: (audioId: string) => `${API_BASE_URL}/lecture/${audioId}`,
}
