import { lazy, Suspense, useEffect, useRef } from "react"
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react"
import { ArrowUpRightIcon, MoonIcon, QuestionIcon, SunIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { Wordmark } from "@/components/Wordmark"
import { Mascot } from "@/components/Mascot"
import { Balls } from "@/components/Balls"
import { SparkleTrail } from "@/components/SparkleTrail"
import { LostSeven } from "@/components/LostSeven"
import { useEasterKeys } from "@/hooks/useEasterKeys"
import { useStore } from "@/lib/store"
import { burst } from "@/lib/fx"

// ダイアログ類は初回表示の後に読み込む
const SlotDialog = lazy(() => import("@/components/SlotDialog").then((m) => ({ default: m.SlotDialog })))
const SecretsDialog = lazy(() => import("@/components/SecretsDialog").then((m) => ({ default: m.SecretsDialog })))

const ease = [0.16, 1, 0.3, 1] as const

/** CTA。ポインターが近づくと、ほんの少しだけ吸い寄せられる */
function MagneticCta() {
  const reduce = useReducedMotion()
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 })
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 16 })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduce) return
    const onMove = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect()
      if (!r || e.pointerType === "touch") return
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      const d = Math.hypot(dx, dy)
      if (d < 130) {
        x.set(dx * 0.22)
        y.set(dy * 0.22)
      } else {
        x.set(0)
        y.set(0)
      }
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    return () => window.removeEventListener("pointermove", onMove)
  }, [reduce, x, y])

  return (
    <motion.div ref={ref} style={{ x, y }} className="w-fit" data-interactive>
      <Button asChild size="default" className="group h-12 gap-2.5 px-6 text-base">
        <a href="https://lapius7.com/">
          lapius7.com へ
          <ArrowUpRightIcon size={18} weight="bold" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </Button>
    </motion.div>
  )
}

/** 時刻や日付にまつわるイースターエッグ(開いた瞬間に判定) */
function useTimeEggs() {
  useEffect(() => {
    const s = useStore.getState()
    const now = new Date()
    const h = now.getHours()
    const m = now.getMinutes()
    window.setTimeout(() => {
      if (h >= 0 && h < 5) {
        s.unlock("night")
        s.say("こんな時間まで起きているんですね")
      }
      if ((h === 7 || h === 19) && m === 7) {
        s.unlock("luckytime")
        s.say("7 時 7 分。今がいちばんラッキー")
        burst({ particleCount: 90, spread: 90, origin: { y: 0.4 } })
      }
      if (now.getMonth() === 6 && now.getDate() === 7) {
        s.unlock("tanabata")
        s.say("七夕です。願いごとは決まりましたか")
        const end = Date.now() + 1800
        const fall = () => {
          burst({ particleCount: 3, startVelocity: 12, gravity: 0.5, spread: 20, angle: 270, origin: { x: Math.random(), y: -0.05 }, shapes: ["star"], colors: ["#ffd84d", "#fff3b0"], scalar: 1.4 })
          if (Date.now() < end) requestAnimationFrame(fall)
        }
        fall()
      }
    }, 1400)
  }, [])
}

/** 別のタブへ移ったとき、戻ってきたときのタイトル */
function useTabEgg() {
  useEffect(() => {
    const base = document.title
    let away = false
    let timer: number | undefined
    const onVis = () => {
      if (document.hidden) {
        away = true
        const titles = ["戻ってきて 7", "7 が待っています", base]
        let i = 0
        document.title = titles[0]
        timer = window.setInterval(() => (document.title = titles[++i % titles.length]), 1600)
      } else {
        window.clearInterval(timer)
        document.title = "おかえりなさい"
        window.setTimeout(() => (document.title = base), 2500)
        if (away) {
          away = false
          const s = useStore.getState()
          s.unlock("comeback")
          s.say("おかえりなさい")
        }
      }
    }
    document.addEventListener("visibilitychange", onVis)
    return () => {
      document.removeEventListener("visibilitychange", onVis)
      window.clearInterval(timer)
    }
  }, [])
}

export default function App() {
  const stage = useRef<HTMLElement>(null)
  const dark = useStore((s) => s.dark)
  const toggleDark = useStore((s) => s.toggleDark)
  const lost = window.location.pathname !== "/"
  const clicks = useRef<number[]>([])

  useEasterKeys()
  useTimeEggs()
  useTabEgg()

  // 背景のクリック: 3 回連続でキラキラ、ダブルクリックで 7 の雨
  const onBackgroundClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, a, h1, [data-interactive], [role=menu], [role=dialog], [role=button]")) return
    const now = performance.now()
    clicks.current = [...clicks.current.filter((t) => now - t < 700), now]
    if (clicks.current.length >= 3) {
      clicks.current = []
      useStore.getState().toggleTrail()
    }
  }
  const onBackgroundDouble = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, a, h1, [data-interactive], [role=menu], [role=dialog], [role=button]")) return
    useStore.getState().dropBalls()
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="relative flex min-h-[100dvh] flex-col" onClick={onBackgroundClick} onDoubleClick={onBackgroundDouble}>
        {/* ごく淡いアクセントの光(固定・操作の邪魔をしない) */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0"
          style={{ background: "radial-gradient(54rem 34rem at 4% 108%, color-mix(in oklch, var(--accent) 12%, transparent), transparent 70%)" }}
        />

        {lost ? (
          <LostSeven />
        ) : (
          <>
            <header className="relative z-20 mx-auto flex w-full max-w-[1400px] items-center justify-end gap-1 px-5 pt-4 md:px-10">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={dark ? "ライトテーマにする" : "ダークテーマにする"} onClick={toggleDark} data-interactive>
                    {dark ? <SunIcon size={20} weight="regular" /> : <MoonIcon size={20} weight="regular" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{dark ? "ライト" : "ダーク"}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="隠れているものの一覧" onClick={() => useStore.getState().setSecretsOpen(true)} data-interactive>
                    <QuestionIcon size={20} weight="regular" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>ヒント</TooltipContent>
              </Tooltip>
            </header>

            <main ref={stage} className="relative mx-auto flex w-full max-w-[1400px] flex-1 flex-col justify-center gap-8 px-5 pt-4 pb-10 md:gap-10 md:px-10">
              <Wordmark />

              <div className="flex max-w-md flex-col gap-7">
                <motion.p
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.7, ease }}
                  className="text-pretty text-lg leading-relaxed text-muted-foreground"
                >
                  個人で開発しているサービスの公式サイトは、lapius7.com にあります。
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.62, duration: 0.7, ease }}>
                  <MagneticCta />
                </motion.div>
              </div>

              <div className="flex justify-end pt-2 md:absolute md:right-10 md:bottom-12 md:pt-0">
                <Mascot constraints={stage} />
              </div>
            </main>

            <footer className="relative z-10 mx-auto w-full max-w-[1400px] px-5 pb-6 text-sm text-muted-foreground md:px-10">&copy; {new Date().getFullYear()} Lapius7</footer>
          </>
        )}

        <SparkleTrail />
        <Balls />
        <Suspense fallback={null}>
          <SlotDialog />
          <SecretsDialog />
        </Suspense>
        <Toaster />
      </div>
    </TooltipProvider>
  )
}
