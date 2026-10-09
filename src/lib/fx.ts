import type { Options, Shape } from "canvas-confetti"

// 紙吹雪のライブラリは、初めて使うときに読み込む(最初の表示を軽くするため)
type Confetti = typeof import("canvas-confetti")
let lib: Promise<Confetti> | null = null
// CommonJS 由来のため、実行時は default に関数が入る
const load = () => (lib ??= import("canvas-confetti").then((m) => (m as unknown as { default: Confetti }).default))

const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches
// oklch のままだと紙吹雪側で解釈されないことがあるため、1ピクセル描いて rgb に直す
const accent = () => {
  const h = getComputedStyle(document.documentElement).getPropertyValue("--accent-h").trim() || "255"
  try {
    const c = document.createElement("canvas")
    c.width = c.height = 1
    const ctx = c.getContext("2d", { willReadFrequently: true })
    if (!ctx) throw new Error("no ctx")
    ctx.fillStyle = `oklch(0.66 0.2 ${h})`
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return `rgb(${r}, ${g}, ${b})`
  } catch {
    return "#3a7bff"
  }
}

export const burst = (opts: Options = {}) => {
  if (reduced()) return
  void load().then((c) => c({ particleCount: 70, spread: 75, startVelocity: 38, ticks: 140, disableForReducedMotion: true, ...opts }))
}

/** 色つきの文字を紙吹雪の形(ビットマップ)にする。ライブラリ標準の shapeFromText は色が効かないため自前で描く */
function textShape(text: string, scalar: number, color: string): Shape {
  const fontSize = 10 * scalar
  const font = `700 ${fontSize}px "Geist Variable", system-ui, sans-serif`
  let canvas = new OffscreenCanvas(fontSize, fontSize)
  let ctx = canvas.getContext("2d")!
  ctx.font = font
  const m = ctx.measureText(text)
  const pad = 2
  const width = Math.ceil(m.actualBoundingBoxRight + m.actualBoundingBoxLeft) + pad * 2
  const height = Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + pad * 2
  canvas = new OffscreenCanvas(width, height)
  ctx = canvas.getContext("2d")!
  ctx.font = font
  ctx.fillStyle = color
  ctx.fillText(text, m.actualBoundingBoxLeft + pad, m.actualBoundingBoxAscent + pad)
  const k = 1 / scalar
  return { type: "bitmap", bitmap: canvas.transferToImageBitmap(), matrix: [k, 0, 0, k, (-width * k) / 2, (-height * k) / 2] } as unknown as Shape
}

/** コナミコマンド: アクセント色の 7 が降る */
export function sevenRain() {
  if (reduced()) return
  void load().then((c) => {
    const seven = textShape("7", 4, accent())
    const end = Date.now() + 2600
    const frame = () => {
      void c({ particleCount: 5, angle: 270, spread: 140, startVelocity: 18, gravity: 0.7, ticks: 260, origin: { x: Math.random(), y: -0.1 }, shapes: [seven], scalar: 4, flat: true })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()
  })
}

/** 全部見つけたときの花火 */
export function finale() {
  const end = Date.now() + 2200
  const tick = () => {
    burst({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.8 } })
    burst({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.8 } })
    if (Date.now() < end) requestAnimationFrame(tick)
  }
  tick()
}
