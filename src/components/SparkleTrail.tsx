import { useEffect, useRef } from "react"
import { useReducedMotion } from "motion/react"
import { useStore } from "@/lib/store"

type P = { x: number; y: number; vx: number; vy: number; life: number; size: number; hue: number }

/** ポインターの軌跡にキラキラを散らす(トレイルがオンの間だけ描画) */
export function SparkleTrail() {
  const on = useStore((s) => s.trail)
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!on || reduce) return
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const parts: P[] = []
    let raf = 0
    let lx = 0
    let ly = 0

    const onMove = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - lx, e.clientY - ly)
      lx = e.clientX
      ly = e.clientY
      const n = Math.min(4, 1 + Math.floor(dist / 18))
      const hue = useStore.getState().hue
      for (let i = 0; i < n; i++) {
        parts.push({
          x: e.clientX + (Math.random() - 0.5) * 10,
          y: e.clientY + (Math.random() - 0.5) * 10,
          vx: (Math.random() - 0.5) * 1.6,
          vy: Math.random() * 1.4 + 0.2,
          life: 1,
          size: 2 + Math.random() * 5,
          hue: hue + (Math.random() - 0.5) * 70,
        })
      }
    }
    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.04
        p.life -= 0.022
        if (p.life <= 0) {
          parts.splice(i, 1)
          continue
        }
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.translate(p.x, p.y)
        ctx.rotate(p.life * 5)
        ctx.fillStyle = `oklch(0.78 0.16 ${p.hue})`
        const s = p.size * p.life
        // 4 つの頂点を持つ小さな星
        ctx.beginPath()
        ctx.moveTo(0, -s)
        ctx.quadraticCurveTo(0, 0, s, 0)
        ctx.quadraticCurveTo(0, 0, 0, s)
        ctx.quadraticCurveTo(0, 0, -s, 0)
        ctx.quadraticCurveTo(0, 0, 0, -s)
        ctx.fill()
        ctx.restore()
      }
      raf = requestAnimationFrame(draw)
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("resize", resize)
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("resize", resize)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    }
  }, [on, reduce])

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-40 h-full w-full" style={{ display: on ? "block" : "none" }} />
}
