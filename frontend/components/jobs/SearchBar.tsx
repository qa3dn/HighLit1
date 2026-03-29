'use client'

import { useState } from 'react'
import { TerminalInput } from '../terminal/TerminalInput'
import { playClickSound } from '@/lib/audio'

interface SearchBarProps {
  onSearch: (query: string) => void
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const handleCommand = (command: string) => {
    playClickSound()
    // Extract search term from grep command
    const match = command.match(/grep\s+-r\s+"([^"]+)"|grep\s+-r\s+(\S+)/)
    const searchTerm = match ? (match[1] || match[2]) : command.replace(/^grep\s+-r\s+/, '')
    setSearchQuery(searchTerm)
    onSearch(searchTerm)
  }

  return (
    <div className="mb-4" dir="ltr">
      <TerminalInput
        prompt="grep -r"
        onCommand={handleCommand}
        placeholder='"Keyword" /Jordan'
      />
    </div>
  )
}

