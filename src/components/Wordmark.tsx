import { useCallback, useEffect, useRef, useState } from "react"
import { motion, useMotionTemplate, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react"
import { toast } from "sonner"
import { useStore } from "@/lib/store"
import { useRageShake } from "@/hooks/useRageShake"
import { boing } from "@/lib/sfx"
import { cn } from "@/lib/utils"

type Ctl = { el: HTMLSpanElement; x: MotionValue<number>; y: MotionValue<number>; r: MotionValue<number> }

// 1 文字ずつ動かすため分解。"ı" は点のない i(点は目として別に描く)
const CHARS = ["l", "a", "p", "ı", "u", "s", "7", ".", "s", "i"]
const YES = ["Sí (スペイン語)", "Si (イタリア語)", "Oui (フランス語)", "Ja (ドイツ語)", "はい (日本語)", "Da (ロシア語)", "Tak (ポーランド語)", "Ja (スロベニア語)"]

/** i の点。ポインターを目で追う */
function DotEye() {
  const ref = useRef<HTMLSpanElement>(null)
  const px = useSpring(0, { stiffness: 320, damping: 22 })
  const py = useSpring(0, { stiffness: 320, damping: 22 })
  const tx = useTransform(px, (v) => `${v * 0.055}em`)
  const ty = useTransform(py, (v) => `${v * 0.055}em`)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) return
    const onMove = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect()
      if (!r) return
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const a = Math.atan2(dy, dx)
      const d = Math.min(1, Math.hypot(dx, dy) / 240)
      px.set(Math.cos(a) * d)
      py.set(Math.sin(a) * d)
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [px, py, reduce])

  return (
    <span
      ref={ref}
      aria-hidden
      className="absolute left-1/2 block -translate-x-1/2 rounded-full bg-accent"
      style={{ top: "0.115em", width: "0.17em", height: "0.17em" }}
    >
      <span className="absolute inset-[18%] block rounded-full bg-background" />
      <motion.span className="absolute inset-[34%] block rounded-full bg-foreground" style={{ x: tx, y: ty }} />
    </span>
  )
}

function Letter({ ch, index, register, accent, eye }: { ch: string; index: number; register: (i: number, c: Ctl | null) => void; accent?: boolean; eye?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const x = useSpring(0, { stiffness: 200, damping: 13, mass: 0.7 })
  const y = useSpring(0, { stiffness: 200, damping: 13, mass: 0.7 })
  const r = useSpring(0, { stiffness: 150, damping: 12 })

  useEffect(() => {
    if (ref.current) register(index, { el: ref.current, x, y, r })
    return () => register(index, null)
  }, [index, register, x, y, r])

  return (
    <motion.span
      ref={ref}
      aria-hidden
      style={{ x, y, rotate: r }}
      whileHover={{ scale: 1.07 }}
      whileTap={{ scale: 0.94 }}
      className={cn("relative inline-block", accent && "text-accent")}
      onPointerDown={() => useStore.getState().sound && boing()}
    >
      {ch}
      {eye && <DotEye />}
    </motion.span>
  )
}

export function Wordmark() {
  const reduce = useReducedMotion()
  const ctls = useRef<(Ctl | null)[]>([])
  const register = useCallback((i: number, c: Ctl | null) => {
    ctls.current[i] = c
  }, [])
  const gravity = useStore((s) => s.gravity)
  const waveSignal = useStore((s) => s.waveSignal)
  const scatterSignal = useStore((s) => s.scatterSignal)
  const tracking = useSpring(-0.055, { stiffness: 120, damping: 16 })
  const letterSpacing = useMotionTemplate`${tracking}em`
  const wheelCount = useRef(0)
  const wheelTimer = useRef<number | undefined>(undefined)
  const siClicks = useRef(0)
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)

  // カーソルから逃げる文字(重力モード中と、動きを減らす設定では無効)
  useEffect(() => {
    if (reduce) return
    const reset = () => ctls.current.forEach((c) => c && !useStore.getState().gravity && (c.x.set(0), c.y.set(0), c.r.set(0)))
    const onMove = (e: PointerEvent) => {
      if (useStore.getState().gravity || e.pointerType === "touch") return
      for (const c of ctls.current) {
        if (!c) continue
        const rect = c.el.getBoundingClientRect()
        const cx = rect.left + rect.width / 2 - c.x.get()
        const cy = rect.top + rect.height / 2 - c.y.get()
        const dx = cx - e.clientX
        const dy = cy - e.clientY
        const dist = Math.hypot(dx, dy) || 1
        const R = 170
        if (dist < R) {
          const f = Math.pow(1 - dist / R, 1.6) * 52
          c.x.set((dx / dist) * f)
          c.y.set((dy / dist) * f)
          c.r.set((dx / dist) * f * 0.35)
        } else {
          c.x.set(0)
          c.y.set(0)
          c.r.set(0)
        }
      }
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    document.addEventListener("mouseleave", reset)
    return () => {
      window.removeEventListener("pointermove", onMove)
      document.removeEventListener("mouseleave", reset)
    }
  }, [reduce])

  // g キー: 文字が床まで落ちて跳ねる
  useEffect(() => {
    ctls.current.forEach((c, i) => {
      if (!c) return
      if (gravity) {
        const rect = c.el.getBoundingClientRect()
        const target = window.innerHeight - 28 - (rect.bottom - c.y.get()) - Math.random() * 6
        window.setTimeout(() => {
          c.y.set(target)
          c.x.set((Math.random() - 0.5) * 30)
          c.r.set((Math.random() - 0.5) * 60)
        }, i * 70)
      } else {
        c.x.set(0)
        c.y.set(0)
        c.r.set(0)
      }
    })
  }, [gravity])

  // lapius とタイプ: ウェーブ
  useEffect(() => {
    if (waveSignal === 0) return
    ctls.current.forEach((c, i) => {
      if (!c) return
      window.setTimeout(() => {
        c.y.set(-52)
        c.r.set(i % 2 ? 12 : -12)
        window.setTimeout(() => (c.y.set(0), c.r.set(0)), 190)
      }, i * 75)
    })
  }, [waveSignal])

  // マウスを激しく振る: 文字が散らばって、元に戻る
  const scatter = useCallback(() => {
    ctls.current.forEach((c) => {
      if (!c) return
      c.x.set((Math.random() - 0.5) * 520)
      c.y.set((Math.random() - 0.5) * 360)
      c.r.set((Math.random() - 0.5) * 300)
    })
    window.setTimeout(() => ctls.current.forEach((c) => c && !useStore.getState().gravity && (c.x.set(0), c.y.set(0), c.r.set(0))), 1000)
  }, [])
  useEffect(() => {
    if (scatterSignal > 0) scatter()
  }, [scatterSignal, scatter])
  useRageShake(
    useCallback(() => {
      const s = useStore.getState()
      s.unlock("shake")
      s.say("わわわ、目が回る")
      scatter()
    }, [scatter]),
  )

  const onWheel = (e: React.WheelEvent) => {
    const next = Math.min(0.32, Math.max(-0.08, tracking.get() + e.deltaY * 0.0006))
    tracking.set(next)
    wheelCount.current += 1
    if (wheelCount.current > 6) useStore.getState().unlock("stretch")
    window.clearTimeout(wheelTimer.current)
    wheelTimer.current = window.setTimeout(() => tracking.set(-0.055), 2600)
  }

  const onSiClick = () => {
    const s = useStore.getState()
    siClicks.current += 1
    const i = (siClicks.current - 1) % YES.length
    s.say(siClicks.current === 1 ? ".si はスロベニアの国別ドメイン。でも、si は言語によって「はい」になる。" : `${YES[i]}で「はい」`)
    if (siClicks.current >= 5) s.unlock("polyglot")
  }

  // 右クリックで専用メニュー
  useEffect(() => {
    if (!menu) return
    const close = () => setMenu(null)
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close()
    window.addEventListener("pointerdown", close)
    window.addEventListener("keydown", onKey)
    window.addEventListener("blur", close)
    return () => {
      window.removeEventListener("pointerdown", close)
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("blur", close)
    }
  }, [menu])

  return (
    <>
      <motion.h1
        aria-label="lapius7.si"
        onWheel={onWheel}
        onContextMenu={(e) => {
          e.preventDefault()
          setMenu({ x: Math.min(e.clientX, window.innerWidth - 220), y: Math.min(e.clientY, window.innerHeight - 160) })
          useStore.getState().unlock("menu")
        }}
        style={{ letterSpacing }}
        className="m-0 flex w-fit cursor-default select-none text-[clamp(3.4rem,15.2vw,14.5rem)] leading-[1] font-semibold whitespace-nowrap"
      >
        {CHARS.slice(0, 7).map((ch, i) => (
          <Letter key={i} ch={ch} index={i} register={register} accent={ch === "7"} eye={ch === "ı"} />
        ))}
        <span
          role="button"
          tabIndex={0}
          aria-label=".si について(クリックすると何かが起きる)"
          onClick={onSiClick}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onSiClick())}
          className="inline-flex cursor-pointer rounded-[0.12em] text-muted-foreground outline-none transition-colors duration-200 hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring"
        >
          {CHARS.slice(7).map((ch, i) => (
            <Letter key={i + 7} ch={ch} index={i + 7} register={register} />
          ))}
        </span>
      </motion.h1>

      {menu && (
        <div
          role="menu"
          style={{ left: menu.x, top: menu.y }}
          onPointerDown={(e) => e.stopPropagation()}
          className="fixed z-50 w-52 rounded-xl border border-border bg-card p-1.5 text-sm text-card-foreground"
        >
          {[
            { label: "ドメイン名をコピー", run: () => navigator.clipboard?.writeText("lapius7.si").then(() => toast("コピーしました: lapius7.si")) },
            { label: "7 を降らせる", run: () => useStore.getState().dropBalls() },
            { label: "重力を切り替える", run: () => useStore.getState().toggleGravity() },
          ].map((item) => (
            <button
              key={item.label}
              role="menuitem"
              onClick={() => {
                item.run()
                setMenu(null)
              }}
              className="flex w-full items-center rounded-lg px-3 py-2 text-left outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  )
}

