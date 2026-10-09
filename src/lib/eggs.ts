// イースターエッグの一覧。hint は見つける前のヒント、desc は見つけたあとの種明かし。
export type Egg = { id: string; title: string; hint: string; desc: string }

export const EGGS: Egg[] = [
  { id: "konami", title: "コナミコマンド", hint: "あの有名な呪文を、十字キーで。", desc: "↑ ↑ ↓ ↓ ← → ← → B A と入力" },
  { id: "lucky7", title: "ラッキーセブン", hint: "7 は 7 回触ると機嫌がいい。", desc: "マスコットの 7 を 7 回タップ" },
  { id: "poke", title: "いたっ", hint: "目は大事にしてあげて。", desc: "マスコットの目をつつく" },
  { id: "throw", title: "投げた", hint: "つかんで、ぽいっと。", desc: "マスコットを勢いよく投げる" },
  { id: "sleepy", title: "おやすみ", hint: "しばらく放っておくと。", desc: "15 秒間、何も操作しない" },
  { id: "polyglot", title: "si は「はい」", hint: ".si の意味は国によって違う。", desc: ".si を 5 回クリックして、いろいろな言語の「はい」を聞く" },
  { id: "hello", title: "こんにちは", hint: "挨拶をしてみて。", desc: "hello とタイプ" },
  { id: "wave", title: "ウェーブ", hint: "名前を呼んでみて。", desc: "lapius とタイプ" },
  { id: "shake", title: "ぶるぶる", hint: "マウスを思いきり。", desc: "ポインターを激しく左右に振る" },
  { id: "gravity", title: "重力", hint: "g の力。", desc: "g キーで文字が落ちる(もう一度で戻る)" },
  { id: "hue", title: "色相", hint: "c は color の c。", desc: "c キーでアクセントカラーが変わる" },
  { id: "theme", title: "昼と夜", hint: "d は dark の d。", desc: "d キーでテーマを切り替える" },
  { id: "trail", title: "キラキラ", hint: "背景は三度叩くもの。", desc: "背景を 3 回続けてクリック(または t キー)" },
  { id: "balls", title: "7 の雨", hint: "背景を二度叩くと何かが降る。", desc: "背景をダブルクリック" },
  { id: "stretch", title: "のびる", hint: "文字の上でホイールを回す。", desc: "文字の上でスクロールして字間を伸ばす" },
  { id: "menu", title: "右クリック", hint: "文字にも裏の顔がある。", desc: "文字を右クリックして専用メニューを出す" },
  { id: "comeback", title: "おかえり", hint: "ちょっと離れて、戻ってくる。", desc: "別のタブを見てから戻る" },
  { id: "night", title: "夜更かし", hint: "草木も眠る時間に。", desc: "0 時から 4 時の間に開く" },
  { id: "luckytime", title: "7 時 7 分", hint: "時計をよく見て。", desc: "7:07 または 19:07 に開く" },
  { id: "tanabata", title: "七夕", hint: "7 が 2 つ並ぶ日。", desc: "7 月 7 日に開く" },
  { id: "lost", title: "迷子", hint: "存在しない場所へ。", desc: "存在しないページを開く" },
]

export const EGG_BY_ID = Object.fromEntries(EGGS.map((e) => [e.id, e])) as Record<string, Egg>
