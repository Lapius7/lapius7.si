import { useState } from "react"
import { ArrowCounterClockwiseIcon, SpeakerHighIcon, SpeakerSlashIcon } from "@phosphor-icons/react"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { EGGS } from "@/lib/eggs"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

/** ? キーで開く「見つけた一覧」。見つけたものだけ種明かしされる */
export function SecretsDialog() {
  const open = useStore((s) => s.secretsOpen)
  const setOpen = useStore((s) => s.setSecretsOpen)
  const found = useStore((s) => s.found)
  const sound = useStore((s) => s.sound)
  const toggleSound = useStore((s) => s.toggleSound)
  const resetEggs = useStore((s) => s.resetEggs)
  const [confirming, setConfirming] = useState(false)

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setConfirming(false) }}>
      <DialogContent className="flex max-h-[85dvh] max-w-xl flex-col">
        <div className="pr-10">
          <DialogTitle className="text-lg font-semibold tracking-tight">隠れているもの</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-muted-foreground">
            このページには {EGGS.length} 個の仕掛けがあります。見つけると、ここに種明かしが残ります。
          </DialogDescription>
          <p className="mt-3 font-mono text-sm tabular-nums">
            <span className="text-accent">{found.length}</span> / {EGGS.length}
          </p>
        </div>

        <ul className="mt-4 grid min-h-0 flex-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
          {EGGS.map((egg) => {
            const hit = found.includes(egg.id)
            return (
              <li key={egg.id} className={cn("rounded-xl border border-border p-3", hit ? "bg-muted" : "bg-card")}>
                <p className={cn("text-sm font-medium", !hit && "text-muted-foreground")}>{hit ? egg.title : "???"}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hit ? egg.desc : egg.hint}</p>
              </li>
            )
          })}
        </ul>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {confirming ? (
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs text-foreground">見つけた記録を消して、最初に戻します。</p>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>やめる</Button>
              <Button
                size="sm"
                onClick={() => {
                  resetEggs()
                  setConfirming(false)
                }}
              >
                リセットする
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setConfirming(true)} disabled={found.length === 0}>
              <ArrowCounterClockwiseIcon size={14} weight="bold" />
              履歴をリセット
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={toggleSound}>
            {sound ? <SpeakerHighIcon size={14} weight="bold" /> : <SpeakerSlashIcon size={14} weight="bold" />}
            {sound ? "音あり(m)" : "音なし(m)"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
