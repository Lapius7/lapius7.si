import { useEffect, useRef, useState, type RefObject } from "react"
import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform } from "motion/react"
import { burst, useStore } from "@/lib/store"
import { useIdle } from "@/hooks/useIdle"
import { boing } from "@/lib/sfx"

const TAP_LINES = ["やあ", "くすぐったいよ", "7 回触ると何かが起きる、らしい", "もう一回?", "ふふふ", "あと少し", "もうすぐ"]

function Eye({ closed, onPoke }: { closed: boolean; onPoke: () => void }) {
  const ref = useRef<HTMLSpanElement>(null)
  const px = useSpring(0, { stiffness: 320, damping: 22 })
  const py = useSpring(0, { stiffness: 320, damping: 22 })
  const tx = useTransform(px, (v) => `${v * 22}%`)
  const ty = useTransform(py, (v) => `${v * 22}%`)
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect()
      if (!r) return
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const a = Math.atan2(dy, dx)
      const d = Math.min(1, Math.hypot(dx, dy) / 260)
      px.set(Math.cos(a) * d)
      py.set(Math.sin(a) * d)
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [px, py])

  // ときどきまばたき
  useEffect(() => {
    let t: number
    const loop = () => {
      t = window.setTimeout(() => {
        setBlink(true)
        window.setTimeout(() => setBlink(false), 140)
        loop()
      }, 2600 + Math.random() * 3400)
    }
    loop()
    return () => window.clearTimeout(t)
  }, [])

  return (
    <motion.span
      ref={ref}
      data-eye
      onClick={(e) => {
        e.stopPropagation()
        onPoke()
      }}
      animate={{ scaleY: closed || blink ? 0.09 : 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className="relative block aspect-square w-full cursor-pointer rounded-full bg-white"
    >
      <motion.span className="absolute inset-[26%] block rounded-full bg-[#14151a]" style={{ x: tx, y: ty }} />
    </motion.span>
  )
}

export function Mascot({ constraints, lost = false }: { constraints?: RefObject<HTMLElement | null>; lost?: boolean }) {
  const reduce = useReducedMotion()
  const speech = useStore((s) => s.speech)
  const [sleeping, setSleeping] = useState(false)
  const [poked, setPoked] = useState(false)
  const [bubble, setBubble] = useState<string | null>(null)
  const taps = useRef(0)

  useIdle(
    15000,
    () => {
      setSleeping(true)
      useStore.getState().unlock("sleepy")
    },
    () => setSleeping(false),
  )

  // store.say() で届いたセリフを吹き出しに出す
  useEffect(() => {
    if (!speech) return
    setBubble(speech.text)
    const t = window.setTimeout(() => setBubble(null), 3200)
    return () => window.clearTimeout(t)
  }, [speech])

  const poke = () => {
    const s = useStore.getState()
    s.unlock("poke")
    s.say("いたっ")
    setPoked(true)
    window.setTimeout(() => setPoked(false), 600)
  }

  const onTap = (e: Event | MouseEvent | TouchEvent | PointerEvent) => {
    const s = useStore.getState()
    if ((e.target as HTMLElement | null)?.closest?.("[data-eye]")) return
    if (s.sound) boing()
    taps.current += 1
    if (taps.current >= 7) {
      taps.current = 0
      s.unlock("lucky7")
      s.setSlotOpen(true)
      return
    }
    s.say(TAP_LINES[(taps.current - 1) % TAP_LINES.length])
  }

  return (
    <motion.div
      drag
      dragConstraints={constraints}
      dragElastic={0.18}
      dragMomentum
      dragTransition={{ bounceStiffness: 240, bounceDamping: 14, power: 0.4, timeConstant: 360 }}
      whileDrag={{ scale: 1.07, rotate: 4 }}
      onTap={onTap}
      onDragEnd={(_, info) => {
        const v = Math.hypot(info.velocity.x, info.velocity.y)
        if (v > 1500) {
          const s = useStore.getState()
          s.unlock("throw")
          s.say("わーい!")
          burst({ particleCount: 30, spread: 60 })
        }
      }}
      initial={reduce ? false : { scale: 0.5, rotate: -24, opacity: 0 }}
      animate={{ scale: 1, rotate: lost ? 12 : -5, opacity: 1 }}
      transition={{ type: "spring", stiffness: 160, damping: 11, delay: 0.25 }}
      role="img"
      aria-label="マスコットの 7"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onTap(e.nativeEvent)
        }
      }}
      className="relative z-10 w-[clamp(9.5rem,24vw,19rem)] cursor-grab touch-none rounded-3xl outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring active:cursor-grabbing"
      data-interactive
    >
      <motion.div
        animate={reduce || sleeping ? { y: 0 } : { y: [0, -9, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        className="relative"
      >
        {/* 7 本体 */}
        <svg viewBox="0 0 200 220" className="block w-full overflow-visible text-accent" aria-hidden>
          <path d="M26 30h148c8 0 12 9 7 15L88 190c-5 6-13 6-18 1l-9-9c-4-4-4-9-1-14l60-85H34c-7 0-12-5-12-12V42c0-7 5-12 12-12Z" fill="currentColor" />
        </svg>
        {/* 目 */}
        <div className="absolute top-[16%] left-[19%] flex w-[48%] gap-[8%]">
          <div className="w-full"><Eye closed={sleeping || poked} onPoke={poke} /></div>
          <div className="w-full"><Eye closed={sleeping || poked} onPoke={poke} /></div>
        </div>
        {/* 口 */}
        <motion.span
          aria-hidden
          animate={{ scaleY: poked ? 1.8 : sleeping ? 0.4 : 1, scaleX: poked ? 0.7 : 1 }}
          className="absolute top-[52%] left-[49.5%] block h-[4.5%] w-[14%] origin-top rounded-b-full bg-[#14151a]"
        />

        <AnimatePresence>
          {sleeping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute -top-2 right-0 font-mono text-accent">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute block"
                  style={{ right: i * 16, fontSize: 14 + i * 7 }}
                  animate={{ y: [0, -26], opacity: [0, 1, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
                >
                  z
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence mode="wait">
        {(bubble || lost) && (
          <motion.div
            key={bubble ?? "lost"}
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            className="pointer-events-none absolute -top-3 right-0 w-max max-w-[min(16rem,calc(100vw-2.5rem))] -translate-y-full rounded-xl md:right-auto md:left-1/2 md:-translate-x-1/2 border border-border bg-card px-3.5 py-2 text-[13px] leading-snug text-card-foreground"
          >
            {bubble ?? "ここ、どこ?"}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
