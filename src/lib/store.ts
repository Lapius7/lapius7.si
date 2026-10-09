import { create } from "zustand"
import { toast } from "sonner"
import { EGGS, EGG_BY_ID } from "@/lib/eggs"
import { chime } from "@/lib/sfx"
import { burst, finale } from "@/lib/fx"

export { burst }

const read = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* プライベートモード等では保存しない */
  }
}

const initialFound = (): string[] => {
  try {
    const parsed = JSON.parse(read("l7.found") ?? "[]")
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string" && id in EGG_BY_ID) : []
  } catch {
    return []
  }
}

type Counter = number
type State = {
  found: string[]
  dark: boolean
  gravity: boolean
  trail: boolean
  sound: boolean
  hue: number
  secretsOpen: boolean
  slotOpen: boolean
  speech: { id: number; text: string } | null
  // イベントの合図。数字が増えたら、各コンポーネントが反応する
  waveSignal: Counter
  scatterSignal: Counter
  ballSignal: Counter
  unlock: (id: string) => void
  toggleDark: () => void
  setDark: (v: boolean) => void
  toggleGravity: () => void
  toggleTrail: () => void
  toggleSound: () => void
  cycleHue: () => void
  setSecretsOpen: (v: boolean) => void
  setSlotOpen: (v: boolean) => void
  say: (text: string) => void
  resetEggs: () => void
  wave: () => void
  scatter: () => void
  dropBalls: () => void
}

export const useStore = create<State>((set, get) => ({
  found: initialFound(),
  dark: document.documentElement.classList.contains("dark"),
  gravity: false,
  trail: false,
  sound: read("l7.sound") === "1",
  hue: Number(read("l7.hue") ?? 255),
  secretsOpen: false,
  slotOpen: false,
  speech: null,
  waveSignal: 0,
  scatterSignal: 0,
  ballSignal: 0,

  unlock: (id) => {
    const egg = EGG_BY_ID[id]
    if (!egg || get().found.includes(id)) return
    const found = [...get().found, id]
    set({ found })
    write("l7.found", JSON.stringify(found))
    if (get().sound) chime()
    if (found.length === EGGS.length) {
      toast("全部見つけました", { description: "あなたは本物の 7 です。" })
      finale()
      return
    }
    toast(`見つけた: ${egg.title}`, { description: `${found.length} / ${EGGS.length}` })
  },

  setDark: (v) => {
    document.documentElement.classList.toggle("dark", v)
    write("l7.dark", v ? "1" : "0")
    set({ dark: v })
  },
  toggleDark: () => {
    get().setDark(!get().dark)
    get().unlock("theme")
  },
  toggleGravity: () => {
    set({ gravity: !get().gravity })
    get().unlock("gravity")
  },
  toggleTrail: () => {
    set({ trail: !get().trail })
    get().unlock("trail")
  },
  toggleSound: () => {
    const sound = !get().sound
    write("l7.sound", sound ? "1" : "0")
    set({ sound })
    toast(sound ? "サウンド ON" : "サウンド OFF")
  },
  cycleHue: () => {
    const hue = (get().hue + 47) % 360
    document.documentElement.style.setProperty("--accent-h", String(hue))
    write("l7.hue", String(hue))
    set({ hue })
    get().unlock("hue")
  },
  setSecretsOpen: (v) => set({ secretsOpen: v }),
  setSlotOpen: (v) => set({ slotOpen: v }),
  say: (text) => set({ speech: { id: Date.now(), text } }),
  resetEggs: () => {
    // 見つけた履歴と、遊びで変えた設定(色・音・重力・キラキラ)を初期状態に戻す。テーマは残す
    write("l7.found", "[]")
    write("l7.hue", "255")
    write("l7.sound", "0")
    document.documentElement.style.setProperty("--accent-h", "255")
    set({ found: [], hue: 255, sound: false, gravity: false, trail: false, speech: null })
    toast("リセットしました", { description: "また最初から探せます。" })
  },
  wave: () => set({ waveSignal: get().waveSignal + 1 }),
  scatter: () => set({ scatterSignal: get().scatterSignal + 1 }),
  dropBalls: () => set({ ballSignal: get().ballSignal + 1 }),
}))

