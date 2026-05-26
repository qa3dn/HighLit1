'use client'

import { useState, useEffect } from 'react'

interface BootSequenceProps {
  onComplete: () => void
}

const bootMessages = [
  'System ready.',
  'Initializing MajlisOS...',
  'Loading kernel modules...',
  'Mounting filesystems...',
  'Starting network services...',
]

export function BootSequence({ onComplete }: BootSequenceProps) {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (currentMessage < bootMessages.length) {
      const message = bootMessages[currentMessage]
      let charIndex = 0
      
      // Typing speed: very fast (10ms per character)
      const typingInterval = setInterval(() => {
        if (charIndex < message.length) {
          setDisplayedText(message.substring(0, charIndex + 1))
          charIndex++
        } else {
          clearInterval(typingInterval)
          // Very short delay before next message (100ms)
          setTimeout(() => {
            if (currentMessage < bootMessages.length - 1) {
              setCurrentMessage(currentMessage + 1)
              setDisplayedText('')
            } else {
              setIsComplete(true)
              setTimeout(onComplete, 200)
            }
          }, 100)
        }
      }, 10) // Very fast typing

      return () => clearInterval(typingInterval)
    }
  }, [currentMessage, onComplete])

  if (isComplete) return null

  return (
    <div className="fixed inset-0 bg-terminal-bg z-50 flex items-center justify-center">
      <div className="font-mono text-terminal-text text-sm" dir="ltr">
        <div className="mb-2 flex items-center gap-2">
          <span className="cursor-blink text-terminal-text">_</span>
          <span>{displayedText}</span>
        </div>
        <div className="text-terminal-gray text-xs space-y-1">
          {Array(currentMessage).fill(0).map((_, i) => (
            <div key={i} className="text-terminal-text flex items-center gap-2">
              <span>✓</span>
              <span>{bootMessages[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

