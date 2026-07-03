"use client"

import { useRef, useState } from "react"
import { uploadAudio } from "@/lib/api"
import type { Lecture } from "@/lib/store"
import { useToast } from "@/components/toast"
import {
  UploadCloud,
  FileAudio,
  Loader2,
  X,
  Mic,
  FileText,
  Sparkles,
  MessagesSquare,
  Lightbulb,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadPanelProps {
  onUploaded: (lecture: Lecture) => void
}

const AUDIO_FORMATS = ["MP3", "WAV", "M4A", "OGG", "FLAC", "AAC", "WEBM"]

const STEPS = [
  {
    icon: Mic,
    title: "Upload your audio",
    desc: "Drop a lecture recording or browse your files to get started.",
  },
  {
    icon: FileText,
    title: "Get a transcript",
    desc: "The audio is automatically transcribed into clean, readable text.",
  },
  {
    icon: Sparkles,
    title: "Generate a summary",
    desc: "Turn long transcripts into concise, structured key points.",
  },
  {
    icon: MessagesSquare,
    title: "Chat with the lecture",
    desc: "Ask questions and get answers grounded in your recording.",
  },
]

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function UploadPanel({ onUploaded }: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const toast = useToast()

  function pick(f: File | null) {
    if (!f) return
    if (!f.type.startsWith("audio/") && !/\.(mp3|wav|m4a|ogg|flac|aac|webm)$/i.test(f.name)) {
      toast("error", "Please select an audio file.")
      return
    }
    setFile(f)
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    setProgress(0)
    try {
      const res = await uploadAudio(file, setProgress)
      const lecture: Lecture = {
        audio_id: res.audio_id,
        filename: file.name,
        transcript: res.transcript,
        createdAt: Date.now(),
      }
      onUploaded(lecture)
      toast("success", "Audio uploaded and transcribed successfully.")
      setFile(null)
      setProgress(0)
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Upload failed.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 pb-8">
      {/* Hero */}
      <div className="flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          <Sparkles className="size-3.5 text-primary" />
          AI-powered lecture assistant
        </div>
        <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Turn any lecture into notes you can talk to
        </h2>
        <p className="mt-3 max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
          Upload an audio recording to transcribe it, generate a summary, and chat with the content — all in one place.
        </p>
      </div>

      {/* Upload box */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          pick(e.dataTransfer.files?.[0] ?? null)
        }}
        className={cn(
          "group relative overflow-hidden rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300 sm:p-10",
          dragging
            ? "border-primary bg-primary/10 shadow-[0_0_0_4px_oklch(0.72_0.13_180_/_0.12)]"
            : "border-border bg-card/40 hover:border-primary/50 hover:bg-card/60",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac,.aac,.webm"
          className="sr-only"
          onChange={(e) => pick(e.target.files?.[0] ?? null)}
        />

        {!file ? (
          <>
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 transition-transform duration-300 group-hover:scale-105">
              <UploadCloud className="size-8" />
            </div>
            <p className="mt-5 text-base font-medium text-foreground">Drag &amp; drop your audio file here</p>
            <p className="mt-1 text-sm text-muted-foreground">or click below to choose a file from your device</p>
            <button
              onClick={() => inputRef.current?.click()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
            >
              <FileAudio className="size-4" />
              Browse files
            </button>

            {/* Supported formats */}
            <div className="mt-7 flex flex-col items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Supported formats
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {AUDIO_FORMATS.map((fmt) => (
                  <span
                    key={fmt}
                    className="rounded-md border border-border bg-secondary/60 px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                <FileAudio className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-card-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
              </div>
              {!uploading && (
                <button
                  onClick={() => setFile(null)}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  aria-label="Remove file"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {progress < 100 ? `Uploading… ${progress}%` : "Transcribing audio…"}
                </p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {progress < 100 ? "Uploading" : "Transcribing"}
                </>
              ) : (
                <>
                  <UploadCloud className="size-4" />
                  Upload &amp; Transcribe
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Lightbulb className="size-4" />
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Tip:</span> Use clear audio with minimal background noise for
          the most accurate transcripts and summaries. A close microphone and a quiet room make a big difference.
        </p>
      </div>

      {/* How it works */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">How it works</h3>
          <div className="h-px flex-1 bg-border" />
        </div>

        <ol className="grid gap-3 sm:grid-cols-2">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <li
                key={step.title}
                className="group relative flex gap-4 rounded-2xl border border-border bg-card/50 p-4 transition-colors hover:border-primary/40 hover:bg-card"
              >
                <div className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                  <Icon className="size-5" />
                  <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-card-foreground">{step.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}
