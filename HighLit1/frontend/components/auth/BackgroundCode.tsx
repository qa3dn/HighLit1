'use client'

import { useEffect, useState } from 'react'

const codeLines = [
  'const user = await authenticate(credentials);',
  'if (!user) throw new AuthenticationError();',
  'const token = generateJWT(user);',
  'return { user, token };',
  'function validatePassword(password) {',
  '  return password.length >= 8 && /[A-Z]/.test(password);',
  '}',
  'const session = createSession(userId);',
  'await saveSession(session);',
  'return session.id;',
]

export function BackgroundCode() {
  const [lines, setLines] = useState<string[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setLines((prev) => {
        const newLines = [...prev, codeLines[prev.length % codeLines.length]]
        return newLines.slice(-10) // Keep only last 10 lines
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 opacity-5">
      <div className="h-full overflow-hidden font-mono text-xs text-terminal-accent p-8" dir="ltr">
        {lines.map((line, index) => (
          <div
            key={index}
            className="mb-1 animate-pulse"
            style={{
              animationDelay: `${index * 0.1}s`,
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  )
}

