'use client'

import { useState } from 'react'
import { TerminalInput } from '../terminal/TerminalInput'
import { api } from '@/lib/api'

interface LogInputProps {
  onPostCreated: () => void
}

export function LogInput({ onPostCreated }: LogInputProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCommand = async (command: string) => {
    if (command.trim() && !isSubmitting) {
      setIsSubmitting(true)
      try {
        await api.post('/posts', {
          content: command,
          type: 'RANT',
          is_anonymous: false,
        })
        onPostCreated()
      } catch (error) {
        console.error('Failed to create post:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <div className="mb-6">
      <div className="text-terminal-accent font-mono text-sm mb-2" dir="ltr">
        Write your rant:
      </div>
      <TerminalInput
        prompt=">"
        onCommand={handleCommand}
        placeholder="Type your rant here..."
        disabled={isSubmitting}
      />
    </div>
  )
}

