// ごく小さな効果音。サウンドは初期状態で OFF(m キーで切替)。外部ファイルは使わず WebAudio で鳴らす。
let ctx: AudioContext | null = null

export function beep(freq = 660, dur = 0.09, type: OscillatorType = "triangle", gain = 0.05) {
  try {
    ctx ??= new AudioContext()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.value = freq
    g.gain.setValueAtTime(gain, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + dur)
  } catch {
    /* 音が出せない環境では何もしない */
  }
}

export const chime = () => [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.14, "triangle", 0.06), i * 90))
export const boing = () => beep(180 + Math.random() * 120, 0.16, "sine", 0.07)
