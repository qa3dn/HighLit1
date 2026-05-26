'use client'

import { CodeBlock } from './CodeBlock'
import { Button } from '../ui/Button'
import { useState } from 'react'
import { ProgressBar } from '../terminal/ProgressBar'
import { playClickSound } from '@/lib/audio'

interface CodeViewerProps {
  code: {
    id: string
    language: string
    code_body: string
    post?: {
      content: string
      user?: {
        username: string
      }
    }
  }
}

export function CodeViewer({ code }: CodeViewerProps) {
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionProgress, setExecutionProgress] = useState(0)

  const handleExecute = () => {
    playClickSound()
    setIsExecuting(true)
    setExecutionProgress(0)

    const interval = setInterval(() => {
      setExecutionProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsExecuting(false)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b-2 border-terminal-gray bg-terminal-dark-gray">
        <div className="font-mono text-sm text-terminal-text" dir="ltr">
          {code.post?.user?.username || 'anonymous'} / {code.language}
        </div>
        <Button
          variant="terminal"
          size="sm"
          onClick={handleExecute}
          disabled={isExecuting}
        >
          [ EXECUTE ]
        </Button>
      </div>
      {isExecuting && (
        <div className="p-4 border-b-2 border-terminal-gray">
          <ProgressBar progress={executionProgress} label="Executing..." />
        </div>
      )}
      <div className="flex-1 overflow-auto p-4">
        {code.post?.content && (
          <div className="mb-4 text-terminal-text font-mono text-sm">
            {code.post.content}
          </div>
        )}
        <CodeBlock code={code.code_body} language={code.language} />
      </div>
    </div>
  )
}

