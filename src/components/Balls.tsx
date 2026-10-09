import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { burst } from "@/lib/fx"
import { useStore } from "@/lib/store"
import { boing } from "@/lib/sfx"

type Ball = { id: number; x: number; size: number; delay: number; drift: number }
const MAX = 21

/** 背景ダブルクリックで降ってくる 7。床で跳ねて、クリックすると割れる */
export function Balls() {
  const signal = useStore((s) => s.ballSignal)
  const [balls, setBalls] = useState<Ball[]>([])
  const nextId = useRef(1)

  useEffect(() => {
    if (signal === 0) return
    const add: Ball[] = Array.from({ length: 7 }, () => ({
      id: nextId.current++,
      x: 24 + Math.random() * Math.max(120, window.innerWidth - 96),
      size: 36 + Math.random() * 34,
      delay: Math.random() * 0.7,
      drift: (Math.random() - 0.5) * 120,
    }))
    setBalls((prev) => [...prev, ...add].slice(-MAX))
    useStore.getState().unlock("balls")
    if (useStore.getState().sound) boing()
  }, [signal])

  const pop = (b: Ball, e: React.MouseEvent) => {
    e.stopPropagation()
    setBalls((prev) => prev.filter((x) => x.id !== b.id))
    burst({ particleCount: 22, spread: 70, startVelocity: 22, ticks: 80, origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight } })
    if (useStore.getState().sound) boing()
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden>
      <AnimatePresence>
        {balls.map((b) => (
          <motion.button
            key={b.id}
            type="button"
            tabIndex={-1}
            onClick={(e) => pop(b, e)}
            initial={{ y: -120, x: 0, opacity: 0, rotate: 0 }}
            animate={{ y: window.innerHeight - b.size - 12, x: b.drift, opacity: 1, rotate: b.drift }}
            exit={{ scale: 0, opacity: 0, transition: { duration: 0.18 } }}
            transition={{ type: "spring", bounce: 0.55, duration: 1.7, delay: b.delay }}
            style={{ left: b.x, top: 0, width: b.size, height: b.size, fontSize: b.size * 0.62 }}
            className="pointer-events-auto absolute flex items-center justify-center rounded-full border border-border bg-card font-semibold text-accent"
          >
            7
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  )
}
