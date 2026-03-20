"use client"

import { useEffect, useState } from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "./ui/button"

const ThemeToggle = () => {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        size="icon"
        variant="outline"
        className="shrink-0"
        aria-label="Alternar tema"
      >
        <SunIcon />
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      size="icon"
      variant="outline"
      className="shrink-0"
      aria-label={`Ativar modo ${isDark ? "claro" : "escuro"}`}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}

export default ThemeToggle
