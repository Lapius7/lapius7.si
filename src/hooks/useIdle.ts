import { useEffect, useRef } from "react"

/** ms 間操作がなければ onIdle、その後に操作があれば onWake を呼ぶ */
export function useIdle(ms: number, onIdle: () => void, onWake: () => void) {
  const idle = useRef(false)
  const cbs = useRef({ onIdle, onWake })
  cbs.current = { onIdle, onWake }

  useEffect(() => {
    let timer = window.setTimeout(fire, ms)
    function fire() {
      idle.current = true
      cbs.current.onIdle()
    }
    const reset = () => {
      if (idle.current) {
        idle.current = false
        cbs.current.onWake()
      }
      window.clearTimeout(timer)
      timer = window.setTimeout(fire, ms)
    }
    const events = ["pointermove", "pointerdown", "keydown", "touchstart", "wheel"] as const
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }))
    return () => {
      window.clearTimeout(timer)
      events.forEach((ev) => window.removeEventListener(ev, reset))
    }
  }, [ms])
}
