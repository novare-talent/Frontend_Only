"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { flushSync } from "react-dom"

export function ModeToggle() {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const buttonRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === "dark"

  const toggleTheme = () => {
    const button = buttonRef.current
    if (!button) return

    const { top, left, width, height } = button.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const maxRadius = Math.hypot(
      Math.max(x, (window.visualViewport?.width ?? window.innerWidth) - x),
      Math.max(y, (window.visualViewport?.height ?? window.innerHeight) - y)
    )

    const applyTheme = () => setTheme(isDark ? "light" : "dark")

    if (typeof document.startViewTransition !== "function") {
      applyTheme()
      return
    }

    const transition = document.startViewTransition(() => flushSync(applyTheme))
    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        { duration: 400, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" }
      )
    })
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggleTheme}
      className="relative flex h-7 w-14 items-center rounded-full bg-gray-200 px-1 transition-colors duration-500 dark:bg-card cursor-pointer"
    >
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
          isDark ? "translate-x-7" : "translate-x-0"
        }`}
      >
        <Moon
          className="absolute h-3.5 w-3.5 text-gray-700 transition-all duration-300 ease-in-out"
          style={{ opacity: isDark ? 1 : 0, transform: isDark ? "rotate(0deg)" : "rotate(90deg)" }}
        />
        <Sun
          className="absolute h-3.5 w-3.5 text-yellow-500 transition-all duration-300 ease-in-out"
          style={{ opacity: isDark ? 0 : 1, transform: isDark ? "rotate(-90deg)" : "rotate(0deg)" }}
        />
      </div>
    </button>
  )
}