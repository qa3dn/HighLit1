'use client'

import { useState, useEffect } from 'react'

interface ASCIIArtProps {
  art: string
  speed?: number
  className?: string
}

const defaultArt = `
╔═══════════════════════════════════════╗
║                                       ║
║     ██╗  ██╗██╗ ██████╗ ██╗  ██╗      ║
║     ██║  ██║██║██╔════╝ ██║  ██║      ║
║     ███████║██║██║     ███████║      ║
║     ██╔══██║██║██║     ██╔══██║      ║
║     ██║  ██║██║╚██████╗██║  ██║      ║
║     ╚═╝  ╚═╝╚═╝ ╚═════╝╚═╝  ╚═╝      ║
║                                       ║
║        كُود وفضفض                      ║
║                                       ║
╚═══════════════════════════════════════╝
`

export function ASCIIArt({ art = defaultArt, speed = 30, className = '' }: ASCIIArtProps) {
  const [displayedArt, setDisplayedArt] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    let currentIndex = 0
    const artLines = art.split('\n')

    const typeInterval = setInterval(() => {
      if (currentIndex < artLines.length) {
        setDisplayedArt((prev) => prev + artLines[currentIndex] + '\n')
        currentIndex++
      } else {
        setIsTyping(false)
        clearInterval(typeInterval)
      }
    }, speed)

    return () => clearInterval(typeInterval)
  }, [art, speed])

  return (
    <pre
      className={`font-mono text-terminal-accent text-sm whitespace-pre ${className}`}
    >
      {displayedArt}
      {isTyping && (
        <span className="cursor-blink text-terminal-accent">_</span>
      )}
    </pre>
  )
}

