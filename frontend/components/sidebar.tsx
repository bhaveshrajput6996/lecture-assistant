"use client"

import type { Lecture } from "@/lib/store"
import { AudioLines, Plus, FileAudio, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  lectures: Lecture[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  open: boolean
  onClose: () => void
}

export function Sidebar({ lectures, activeId, onSelect, onNew, open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-2.5 border-b border-sidebar-border px-5 py-4">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <AudioLines className="size-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-none text-sidebar-foreground">LectureAI</h1>
            <p className="mt-1 text-xs text-muted-foreground">Transcribe · Summarize · Chat</p>
          </div>
        </div>

        <div className="px-3 py-3">
          <button
            onClick={() => {
              onNew()
              onClose()
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <Plus className="size-4" />
            New Upload
          </button>
        </div>

        <div className="px-4 pb-2 pt-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Recent Lectures
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {lectures.length === 0 ? (
            <p className="px-2 py-4 text-sm text-muted-foreground">No lectures yet. Upload one to get started.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {lectures.map((l) => (
                <li key={l.audio_id}>
                  <button
                    onClick={() => {
                      onSelect(l.audio_id)
                      onClose()
                    }}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      activeId === l.audio_id
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                    )}
                  >
                    <FileAudio className="mt-0.5 size-4 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{l.filename}</span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Circle
                          className={cn(
                            "size-2 shrink-0",
                            l.summary ? "fill-primary text-primary" : "fill-muted-foreground/40 text-muted-foreground/40",
                          )}
                        />
                        {l.summary ? "Summarized" : "Transcribed"}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </nav>

        <div className="border-t border-sidebar-border px-5 py-3">
          <p className="text-xs text-muted-foreground">Connected to your FastAPI backend</p>
        </div>
      </aside>
    </>
  )
}
