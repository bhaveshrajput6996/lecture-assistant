import { API_ROUTES } from "./config"

// ─── RESPONSE TYPES (match the FastAPI backend) ──────────────
export interface UploadResponse {
  audio_id: string
  transcript: string
}

export interface SummarizeResponse {
  audio_id: string
  summary: string
  summary_path: string
  error?: string
}

export interface AskResponse {
  audio_id: string
  question: string
  answer: string
  chunks_used: number
}

export interface ReindexResponse {
  audio_id: string
  message: string
  total_chunks: number
  error?: string
}

export interface DeleteResponse {
  audio_id: string
  message: string
  error?: string
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.detail) detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail)
    } catch {
      // ignore json parse errors
    }
    throw new Error(detail)
  }
  return res.json() as Promise<T>
}

// ─── UPLOAD (with progress via XHR) ──────────────────────────
export function uploadAudio(file: File, onProgress?: (percent: number) => void): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append("file", file)

    const xhr = new XMLHttpRequest()
    xhr.open("POST", API_ROUTES.uploadAudio())

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText))
        } catch {
          reject(new Error("Invalid response from server"))
        }
      } else {
        reject(new Error(`Upload failed (${xhr.status})`))
      }
    }
    xhr.onerror = () => reject(new Error("Network error — is the backend running on the configured URL?"))
    xhr.send(form)
  })
}

// ─── SUMMARIZE ───────────────────────────────────────────────
export async function summarizeLecture(audioId: string): Promise<SummarizeResponse> {
  const res = await fetch(API_ROUTES.summarize(audioId), { method: "POST" })
  return handle<SummarizeResponse>(res)
}

// ─── ASK ─────────────────────────────────────────────────────
export async function askQuestion(audioId: string, question: string): Promise<AskResponse> {
  const res = await fetch(API_ROUTES.ask(audioId, question), { method: "POST" })
  return handle<AskResponse>(res)
}

// ─── REINDEX ─────────────────────────────────────────────────
export async function reindexLecture(audioId: string): Promise<ReindexResponse> {
  const res = await fetch(API_ROUTES.reindex(audioId), { method: "POST" })
  return handle<ReindexResponse>(res)
}

// ─── DELETE ──────────────────────────────────────────────────
export async function deleteLecture(audioId: string): Promise<DeleteResponse> {
  const res = await fetch(API_ROUTES.deleteLecture(audioId), { method: "DELETE" })
  return handle<DeleteResponse>(res)
}
