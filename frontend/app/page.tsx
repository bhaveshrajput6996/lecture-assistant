"use client"

import { useMemo, useState } from "react"
import { useLectures } from "@/lib/store"
import { ToastProvider } from "@/components/toast"
import { Sidebar } from "@/components/sidebar"
import { UploadPanel } from "@/components/upload-panel"
import { LectureWorkspace } from "@/components/lecture-workspace"
import { Menu, AudioLines } from "lucide-react"

function Dashboard() {
  const { lectures, ready, addLecture, updateLecture, removeLecture } = useLectures()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [uploadKey, setUploadKey] = useState(0)

  const activeLecture = useMemo(
    () => lectures.find((l) => l.audio_id === activeId) ?? null,
    [lectures, activeId],
  )

  return (
    <div className="app-ambient flex h-dvh overflow-hidden">
      <Sidebar
        lectures={lectures}
        activeId={showUpload ? null : activeId}
        onSelect={(id) => {
          setActiveId(id)
          setShowUpload(false)
        }}
        onNew={() => {
          setShowUpload(true)
          setActiveId(null)
          setUploadKey((k) => k + 1)
        }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="flex items-center gap-3 border-b border-border bg-background/50 px-4 py-3.5 backdrop-blur-xl md:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>
          <div className="flex items-center gap-2 md:hidden">
            <AudioLines className="size-5 text-primary" />
            <span className="font-semibold text-foreground">LectureAI</span>
          </div>
          <h1 className="hidden text-lg font-semibold tracking-tight text-foreground md:block">
            {showUpload ? "New Lecture" : (activeLecture?.filename ?? "Dashboard")}
          </h1>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {!ready ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">Loading…</div>
          ) : showUpload || !activeLecture ? (
            <UploadPanel
              key={uploadKey}
              onUploaded={(lecture) => {
                addLecture(lecture)
                setActiveId(lecture.audio_id)
                setShowUpload(false)
              }}
            />
          ) : (
            <LectureWorkspace
              lecture={activeLecture}
              onSummary={(audioId, summary) => updateLecture(audioId, { summary })}
              onDeleted={(audioId) => {
                removeLecture(audioId)
                setActiveId(null)
                setShowUpload(true)
              }}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <ToastProvider>
      <Dashboard />
    </ToastProvider>
  )
}
