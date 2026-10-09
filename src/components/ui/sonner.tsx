import { Toaster as Sonner } from "sonner"
import { useStore } from "@/lib/store"

// トーストの色はサイトのトークンに合わせる(テーマは store の dark に追従)
export function Toaster() {
  const dark = useStore((s) => s.dark)
  return (
    <Sonner
      theme={dark ? "dark" : "light"}
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--card)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          boxShadow: "none",
          fontFamily: "var(--font-sans)",
        },
      }}
    />
  )
}
