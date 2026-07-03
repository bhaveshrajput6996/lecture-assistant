"use client"

import { useState } from "react"
import type { Lecture } from "@/lib/store"
import { summarizeLecture, reindexLecture, deleteLecture } from "@/lib/api"
import { useToast } from "@/components/toast"
import { ChatPanel } from "@/components/chat-panel"
import {
  FileText,
  Sparkles,
  RefreshCw,
  Trash2,
  Loader2,
  Copy,
  Check,
  Fingerprint,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface WorkspaceProps {
  lecture: Lecture
  onSummary: (audioId: string, summary: string) => void
  onDeleted: (audioId: string) => void
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

export function LectureWorkspace({ lecture, onSummary, onDeleted }: WorkspaceProps) {
  const [summarizing, setSummarizing] = useState(false)
  const [reindexing, setReindexing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const toast = useToast()

  async function handleSummarize() {
    setSummarizing(true)
    try {
      const res = await summarizeLecture(lecture.audio_id)
      if (res.error) throw new Error(res.error)
      onSummary(lecture.audio_id, res.summary)
      toast("success", "Summary generated.")
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed to summarize.")
    } finally {
      setSummarizing(false)
    }
  }

  async function handleReindex() {
    setReindexing(true)
    try {
      const res = await reindexLecture(lecture.audio_id)
      if (res.error) throw new Error(res.error)
      toast("success", `${res.message} (${res.total_chunks} chunks).`)
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed to reindex.")
    } finally {
      setReindexing(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      const res = await deleteLecture(lecture.audio_id)
      if (res.error) throw new Error(res.error)
      toast("success", "Lecture deleted.")
      onDeleted(lecture.audio_id)
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed to delete.")
      setDeleting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      {/* Left column: info, transcript, summary */}
      <div className="flex flex-col gap-6 xl:col-span-3">
        {/* Header card */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold tracking-tight text-card-foreground">
                {lecture.filename}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Fingerprint className="size-3.5" />
                  <code className="font-mono">{lecture.audio_id}</code>
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2 py-0.5",
                    lecture.summary ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground",
                  )}
                >
                  <span className="size-1.5 rounded-full bg-current" />
                  {lecture.summary ? "Summarized" : "Transcribed"}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleReindex}
                disabled={reindexing}
                className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-60"
              >
                {reindexing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                Reindex
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={deleting}
                className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:opacity-60"
              >
                {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Transcript */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <h3 className="text-sm font-semibold text-card-foreground">Transcript</h3>
            </div>
            <CopyButton text={lecture.transcript} />
          </div>
          <div className="max-h-80 overflow-y-auto px-5 py-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {lecture.transcript || "No transcript available."}
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <h3 className="text-sm font-semibold text-card-foreground">Summary</h3>
            </div>
            {lecture.summary && <CopyButton text={lecture.summary} />}
          </div>
          <div className="px-5 py-4">
            {lecture.summary ? (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-card-foreground">{lecture.summary}</p>
            ) : (
              <div className="flex flex-col items-start gap-4">
                <p className="text-sm text-muted-foreground">
                  No summary yet. Generate an AI summary of this lecture.
                </p>
                <button
                  onClick={handleSummarize}
                  disabled={summarizing}
                  className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {summarizing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  {summarizing ? "Generating…" : "Generate Summary"}
                </button>
              </div>
            )}
          </div>
          {lecture.summary && (
            <div className="border-t border-border px-5 py-3">
              <button
                onClick={handleSummarize}
                disabled={summarizing}
                className="flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
              >
                {summarizing ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
                Regenerate summary
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right column: chat */}
      <div className="xl:col-span-2">
        <div className="h-[640px] xl:sticky xl:top-6">
          <ChatPanel audioId={lecture.audio_id} />
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
          onClick={() => !deleting && setConfirmDelete(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex size-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Trash2 className="size-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-card-foreground">Delete lecture?</h3>
            <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">
              This permanently removes the audio, transcript, summary, vectors, and database record for{" "}
              <span className="font-medium text-foreground">{lecture.filename}</span>. This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
