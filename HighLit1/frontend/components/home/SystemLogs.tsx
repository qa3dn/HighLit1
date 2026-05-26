'use client'

import { useState, useEffect } from 'react'

interface SystemLog {
  timestamp: string
  level: string
  message: string
}

const initialLogs: SystemLog[] = [
  { timestamp: '00:00:01', level: 'INFO', message: 'System initialized' },
  { timestamp: '00:00:02', level: 'INFO', message: 'Network services started' },
]

export function SystemLogs() {
  const [logs, setLogs] = useState<SystemLog[]>(initialLogs)

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const timestamp = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })

      const newLog: SystemLog = {
        timestamp,
        level: 'INFO',
        message: `System Status: Online | Users: ${Math.floor(Math.random() * 1000) + 500} | Vibe: Coding`,
      }

      setLogs((prev) => [...prev.slice(-4), newLog])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="mt-8 font-mono text-xs">
      <div className="text-terminal-text mb-2" dir="ltr">System Logs:</div>
      <div className="space-y-1 text-terminal-gray" dir="ltr">
        {logs.map((log, index) => (
          <div key={index} className="flex gap-2">
            <span className="text-terminal-text">[{log.timestamp}]</span>
            <span className="text-terminal-text">[{log.level}]</span>
            <span className="text-terminal-gray">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

