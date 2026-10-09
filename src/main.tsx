import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"

// 開発者ツールを開いた人へのささやかなご挨拶
console.log(
  "%c lapius7.si %c\n7 はどこかで目を光らせています。\nヒント: ページ上で ? キーを押してみてください。",
  "background:#5b7bff;color:#fff;padding:3px 8px;border-radius:6px;font-weight:600",
  "color:inherit;font-size:12px;line-height:1.7",
)

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
