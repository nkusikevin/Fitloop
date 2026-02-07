'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

interface DrawTextProps {
  text: string
  className?: string
  delay?: number
}

export function DrawText({ text, className = '', delay = 0 }: DrawTextProps) {
  const [displayText, setDisplayText] = useState('')
  const hasAnimated = useRef(false)

  const animate = useCallback(() => {
    let currentIndex = 0
    const chars = text.split('')

    const interval = setInterval(() => {
      if (currentIndex >= chars.length) {
        clearInterval(interval)
        setDisplayText(text)
        return
      }

      const target = chars[currentIndex]
      let flipCount = 0
      const maxFlips = 4

      const flipInterval = setInterval(() => {
        if (flipCount >= maxFlips) {
          clearInterval(flipInterval)
          currentIndex++
          setDisplayText(text.slice(0, currentIndex) + chars.slice(currentIndex).map(() => ' ').join(''))
          return
        }

        setDisplayText(
          text.slice(0, currentIndex) +
          CHARS[Math.floor(Math.random() * CHARS.length)] +
          chars.slice(currentIndex + 1).map(() => ' ').join('')
        )
        flipCount++
      }, 40)
    }, 80)

    return () => clearInterval(interval)
  }, [text])

  useEffect(() => {
    if (!hasAnimated.current) {
      hasAnimated.current = true
      const timeout = setTimeout(animate, delay)
      return () => clearTimeout(timeout)
    }
  }, [animate, delay])

  return (
    <span className={className}>
      {displayText || text}
    </span>
  )
}
