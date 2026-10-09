import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { burst, useStore } from "@/lib/store"
import { beep, chime } from "@/lib/sfx"

const DIGITS = [3, 9, 1, 5, 0, 8, 2, 6, 4, 7]
const ROW = 88

function Reel({ spinning, delay }: { spinning: boolean; delay: number }) {
  // 7 が最後の段にある縦長のリール。止まるときは必ず 7 で止まる
  const strip = [...DIGITS, ...DIGITS, ...DIGITS]
  const stop = -(strip.length - 1) * ROW
  return (
    <div className="h-[88px] w-20 overflow-hidden rounded-xl border border-border bg-background">
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: spinning ? stop : 0 }}
        transition={spinning ? { duration: 1.6 + delay, ease: [0.22, 0.9, 0.25, 1] } : { duration: 0 }}
      >
        {strip.map((d, i) => (
          <div key={i} className="flex h-[88px] items-center justify-center font-mono text-5xl font-semibold text-foreground">
            <span className={d === 7 ? "text-accent" : ""}>{d}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export function SlotDialog() {
  const open = useStore((s) => s.slotOpen)
  const setOpen = useStore((s) => s.setSlotOpen)
  const [spinning, setSpinning] = useState(false)
  const [won, setWon] = useState(false)

  useEffect(() => {
    if (!open) {
      setSpinning(false)
      setWon(false)
      return
    }
    const t0 = window.setTimeout(() => setSpinning(true), 350)
    const tick = window.setInterval(() => useStore.getState().sound && beep(300 + Math.random() * 400, 0.04, "square", 0.02), 110)
    const t1 = window.setTimeout(() => {
      window.clearInterval(tick)
      setWon(true)
      const s = useStore.getState()
      if (s.sound) chime()
      burst({ particleCount: 140, spread: 100, startVelocity: 45, origin: { y: 0.55 } })
    }, 2400)
    return () => {
      window.clearTimeout(t0)
      window.clearTimeout(t1)
      window.clearInterval(tick)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm text-center">
        <DialogTitle className="text-lg font-semibold tracking-tight">ラッキーセブン</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-muted-foreground">
          {won ? "大当たり。今日はきっといい日です。" : "回しています"}
        </DialogDescription>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Reel spinning={spinning} delay={0} />
          <Reel spinning={spinning} delay={0.35} />
          <Reel spinning={spinning} delay={0.7} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
