"use client"

import { createContext, useCallback, useContext, useState, type ReactNode } from "react"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"

type ToastType = "success" | "error" | "info"
interface Toast {
  id: number
  type: ToastType
  message: string
}

const ToastContext = createContext<(type: ToastType, message: string) => void>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const styles = {
  success: "border-primary/40 text-primary",
  error: "border-destructive/40 text-destructive",
  info: "border-border text-foreground",
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id = Date.now() + Math.random()
      setToasts((prev) => [...prev, { id, type, message }])
      setTimeout(() => remove(id), 4500)
    },
    [remove],
  )

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const Icon = icons[t.type]
          return (
            <div
              key={t.id}
              role="status"
              className={`flex items-start gap-3 rounded-xl border bg-card/95 px-4 py-3 shadow-lg backdrop-blur animate-in slide-in-from-bottom-2 fade-in ${styles[t.type]}`}
            >
              <Icon className="mt-0.5 size-5 shrink-0" />
              <p className="flex-1 text-sm leading-relaxed text-card-foreground">{t.message}</p>
              <button
                onClick={() => remove(t.id)}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Dismiss notification"
              >
                <X className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
