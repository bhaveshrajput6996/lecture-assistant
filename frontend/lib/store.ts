"use client"

import { useCallback, useEffect, useState } from "react"

export interface Lecture {
  audio_id: string
  filename: string
  transcript: string
  summary?: string
  createdAt: number
}

const STORAGE_KEY = "lectureai:lectures"

function read(): Lecture[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Lecture[]) : []
  } catch {
    return []
  }
}

function write(lectures: Lecture[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lectures))
  } catch {
    // storage full or unavailable — ignore
  }
}

/**
 * The backend has no "list lectures" endpoint, so we keep a client-side index
 * of lectures the user has uploaded in this browser. All content shown comes
 * from real backend responses — nothing is mocked.
 */
export function useLectures() {
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setLectures(read())
    setReady(true)
  }, [])

  const persist = useCallback((next: Lecture[]) => {
    setLectures(next)
    write(next)
  }, [])

  const addLecture = useCallback(
    (lecture: Lecture) => {
      persist([lecture, ...read().filter((l) => l.audio_id !== lecture.audio_id)])
    },
    [persist],
  )

  const updateLecture = useCallback(
    (audioId: string, patch: Partial<Lecture>) => {
      persist(read().map((l) => (l.audio_id === audioId ? { ...l, ...patch } : l)))
    },
    [persist],
  )

  const removeLecture = useCallback(
    (audioId: string) => {
      persist(read().filter((l) => l.audio_id !== audioId))
    },
    [persist],
  )

  return { lectures, ready, addLecture, updateLecture, removeLecture }
}
