import { useEffect } from "react"
import { useStore } from "@/lib/store"
import { burst, sevenRain } from "@/lib/fx"

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"]

const GREETINGS = ["こんにちは!", "Hello!", "Bonjour!", "Hola!", "Ciao!", "Zdravo!", "你好!", "안녕!", "Привет!"]

const isTyping = (t: EventTarget | null) => {
  const el = t as HTMLElement | null
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)
}

/** キーボード由来のイースターエッグをまとめて受け持つ */
export function useEasterKeys() {
  useEffect(() => {
    const seq: string[] = []
    let word = ""

    const onKey = (e: KeyboardEvent) => {
      if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return
      const k = e.key.toLowerCase()
      const s = useStore.getState()

      // コナミコマンド
      seq.push(k)
      if (seq.length > KONAMI.length) seq.shift()
      if (seq.length === KONAMI.length && seq.every((v, i) => v === KONAMI[i])) {
        s.unlock("konami")
        s.say("コマンド成功。命が 30 増えた気がする。")
        sevenRain()
        seq.length = 0
      }

      // 1 キーのショートカット
      if (k === "g") s.toggleGravity()
      else if (k === "c") s.cycleHue()
      else if (k === "d") s.toggleDark()
      else if (k === "t") s.toggleTrail()
      else if (k === "m") s.toggleSound()
      else if (e.key === "?" || (k === "/" && e.shiftKey)) s.setSecretsOpen(true)
      else if (k === "escape") s.setSecretsOpen(false)

      // 単語入力
      if (k.length === 1 && /[a-z]/.test(k)) {
        word = (word + k).slice(-12)
        if (word.endsWith("hello")) {
          s.unlock("hello")
          s.say(GREETINGS[Math.floor(Math.random() * GREETINGS.length)])
          burst({ particleCount: 24, spread: 50, origin: { x: 0.8, y: 0.6 } })
          word = ""
        } else if (word.endsWith("lapius")) {
          s.unlock("wave")
          s.wave()
          word = ""
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])
}
