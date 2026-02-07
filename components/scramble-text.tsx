'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

const GLYPHS = '!@#$%^&*()_+-=<>?/\\[]{}Xx'

interface ScrambleTextProps {
  text: string
  className?: string
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3'
  scrambleOnMount?: boolean
}

export function ScrambleText({ text, className = '', as: Tag = 'span', scrambleOnMount = false }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(scrambleOnMount ? '' : text)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const hasAnimated = useRef(false)

  const scramble = useCallback(() => {
    let iteration = 0
    const maxIterations = text.length

    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (index < iteration) return char
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
          })
          .join('')
      )

      iteration += 1 / 3

      if (iteration >= maxIterations) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setDisplayText(text)
      }
    }, 30)
  }, [text])

  useEffect(() => {
    if (scrambleOnMount && !hasAnimated.current) {
      hasAnimated.current = true
      const timeout = setTimeout(scramble, 300)
      return () => clearTimeout(timeout)
    }
  }, [scrambleOnMount, scramble])

  return (
    <Tag
      className={className}
      onMouseEnter={scramble}
    >
      {displayText || text}
    </Tag>
  )
}
