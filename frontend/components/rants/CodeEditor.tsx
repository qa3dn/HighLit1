'use client'

import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { Copy, Check, Code, X } from 'lucide-react'
import { playClickSound } from '@/lib/audio'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  placeholder?: string
}

const languages = [
  'javascript',
  'typescript',
  'python',
  'java',
  'cpp',
  'c',
  'css',
  'html',
  'json',
  'bash',
  'sql',
  'markdown',
]

export function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  placeholder = 'اكتب الكود هنا...',
}: CodeEditorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(language)
  const [isInline, setIsInline] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    playClickSound()
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-2" dir="rtl">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => {
            playClickSound()
            setIsInline(!isInline)
          }}
          className={`px-3 py-1 rounded-lg text-sm font-mono transition-all ${
            isInline
              ? 'bg-accent text-bg'
              : 'bg-gray-light text-text border border-gray-dark hover:border-accent'
          }`}
        >
          <Code className="w-4 h-4 inline ml-1" />
          {isInline ? 'Inline' : 'Block'}
        </button>

        {!isInline && (
          <select
            value={selectedLanguage}
            onChange={(e) => {
              playClickSound()
              setSelectedLanguage(e.target.value)
            }}
            className="px-3 py-1 rounded-lg bg-gray-light text-text border border-gray-dark hover:border-accent focus:outline-none focus:border-accent font-mono text-sm"
          >
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        )}

        {value && (
          <button
            onClick={handleCopy}
            className="px-3 py-1 rounded-lg bg-gray-light text-text border border-gray-dark hover:border-accent transition-all"
          >
            {copied ? (
              <Check className="w-4 h-4 text-accent" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Editor */}
      {isInline ? (
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-gray-light border border-gray-dark rounded-lg px-4 py-2 text-text font-mono text-sm focus:outline-none focus:border-accent placeholder:text-text-secondary"
            dir="ltr"
          />
        </div>
      ) : (
        <div className="border border-gray-dark rounded-lg overflow-hidden bg-gray-light">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-gray-light border-none rounded-lg p-4 text-text font-mono text-sm focus:outline-none focus:border-accent resize-none min-h-[200px]"
            dir="ltr"
          />
        </div>
      )}
    </div>
  )
}

