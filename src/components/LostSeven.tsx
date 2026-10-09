import { useEffect, useRef } from "react"
import { motion } from "motion/react"
import { ArrowLeftIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Mascot } from "@/components/Mascot"
import { useStore } from "@/lib/store"

/** 存在しないパスを開いたときの画面。404 のステータスはサーバーが返す */
export function LostSeven() {
  const stage = useRef<HTMLElement>(null)
  useEffect(() => {
    useStore.getState().unlock("lost")
    document.title = "迷子の 7 | lapius7.si"
  }, [])

  return (
    <main ref={stage} className="relative mx-auto flex min-h-[100dvh] w-full max-w-[1400px] flex-col justify-center gap-10 px-5 py-16 md:px-10">
      <div className="flex flex-col items-start gap-8 md:flex-row md:items-center md:gap-16">
        <div className="pt-16 md:pt-0">
          <Mascot constraints={stage} lost />
        </div>
        <div className="max-w-xl">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="font-mono text-sm text-muted-foreground">
            404
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="mt-2 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
            7 が迷子になりました
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.46, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground">
            このアドレスには何もありません。連れて帰ってあげてください。
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.54, duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="mt-8">
            <Button asChild>
              <a href="/">
                <ArrowLeftIcon size={16} weight="bold" />
                トップへ戻る
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
