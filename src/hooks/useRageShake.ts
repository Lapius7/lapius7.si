import { useEffect } from "react"

/** ポインターを激しく左右に振ったら onShake を呼ぶ(3 秒に 1 回まで) */
export function useRageShake(onShake: () => void) {
  useEffect(() => {
    let lastX = 0
    let lastDir = 0
    let reversals: number[] = []
    let cooldown = 0

    const onMove = (e: PointerEvent) => {
      const dx = e.clientX - lastX
      lastX = e.clientX
      if (Math.abs(dx) < 28) return
      const dir = Math.sign(dx)
      const now = performance.now()
      if (lastDir !== 0 && dir !== lastDir) {
        reversals = reversals.filter((t) => now - t < 650)
        reversals.push(now)
        if (reversals.length >= 6 && now > cooldown) {
          cooldown = now + 3000
          reversals = []
          onShake()
        }
      }
      lastDir = dir
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [onShake])
}
