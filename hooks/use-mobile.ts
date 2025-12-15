"use client"

import { useEffect, useState } from "react"

const MOBILE_BREAKPOINT = 768 // matches Tailwind md

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return window.innerWidth < MOBILE_BREAKPOINT
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    const onChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    // Initial sync
    setIsMobile(mediaQuery.matches)

    // Modern + legacy support
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", onChange)
    } else {
      mediaQuery.addListener(onChange)
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", onChange)
      } else {
        mediaQuery.removeListener(onChange)
      }
    }
  }, [])

  return isMobile
}
