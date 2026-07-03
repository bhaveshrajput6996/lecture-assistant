"use client"

import { useEffect, useRef, useState } from "react"
import { askQuestion } from "@/lib/api"
import { useToast } from "@/components/toast"
import { Send, Sparkles, User, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Message {
  role: "user" | "assistant"
  content: string
  chunks?: number
}

export function ChatPanel({ audioId }: { audioId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Reset conversation when switching lectures
  useEffect(() => {
    setMessages([])
    setInput("")
  }, [audioId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, loading])

  async function send() {
    const question = input.trim()
    if (!question || loading) return
    setInput("")
    setMessages((prev) => [...prev, { role: "user", content: question }])
    setLoading(true)
    try {
      const res = await askQuestion(audioId, question)
      setMessages((prev) => [...prev, { role: "assistant", content: res.answer, chunks: res.chunks_used }])
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "Failed to get an answer.")
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't answer that. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
        <Sparkles className="size-4 text-primary" />
        <h3 className="text-sm font-semibold text-card-foreground">Ask about this lecture</h3>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        {messages.length === 0 && !loading && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="size-6" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">Chat with your lecture</p>
            <p className="mt-1 max-w-xs text-pretty text-xs leading-relaxed text-muted-foreground">
              Ask questions and get answers grounded in the transcript, powered by your RAG pipeline.
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-3", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full",
                m.role === "user" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground",
              )}
            >
              {m.role === "user" ? <User className="size-4" /> : <Sparkles className="size-4" />}
            </div>
            <div className={cn("flex max-w-[80%] flex-col gap-1", m.role === "user" ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "rounded-tr-sm bg-primary text-primary-foreground"
                    : "rounded-tl-sm bg-secondary text-secondary-foreground",
                )}
              >
                {m.content}
              </div>
              {m.role === "assistant" && typeof m.chunks === "number" && (
                <span className="px-1 text-xs text-muted-foreground">{m.chunks} chunks referenced</span>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-secondary px-4 py-3">
              <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
              <span className="size-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
              <span className="size-2 animate-bounce rounded-full bg-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-primary/60">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder="Ask a question about the lecture…"
            className="max-h-32 flex-1 resize-none bg-transparent py-1.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={send}
            disabled={!input.trim() || loading}
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send question"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
