'use client'

import { useState } from 'react'
import { playClickSound } from '@/lib/audio'

interface FileNode {
  name: string
  type: 'folder' | 'file'
  children?: FileNode[]
  postId?: string
}

interface FileTreeProps {
  files: FileNode[]
  onFileSelect?: (file: FileNode) => void
  selectedFile?: string
}

export function FileTree({ files, onFileSelect, selectedFile }: FileTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleExpand = (path: string) => {
    playClickSound()
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const renderNode = (node: FileNode, path: string, level: number = 0) => {
    const isExpanded = expanded.has(path)
    const isSelected = selectedFile === node.postId
    const indent = level * 16

    if (node.type === 'folder') {
      return (
        <div key={path}>
          <div
            className={`flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-terminal-gray font-mono text-sm`}
            style={{ paddingLeft: `${indent + 8}px` }}
            onClick={() => toggleExpand(path)}
          >
            <span className="text-terminal-accent">
              {isExpanded ? '▼' : '▶'}
            </span>
            <span className="text-terminal-text">{node.name}</span>
          </div>
          {isExpanded && node.children && (
            <div>
              {node.children.map((child, index) =>
                renderNode(child, `${path}/${child.name}`, level + 1)
              )}
            </div>
          )}
        </div>
      )
    }

    return (
      <div
        key={path}
        className={`flex items-center gap-1 py-1 px-2 cursor-pointer font-mono text-sm ${
          isSelected
            ? 'bg-terminal-accent text-terminal-bg'
            : 'hover:bg-terminal-gray text-terminal-text'
        }`}
        style={{ paddingLeft: `${indent + 24}px` }}
        onClick={() => {
          playClickSound()
          onFileSelect?.(node)
        }}
      >
        <span className="text-terminal-accent">📄</span>
        <span>{node.name}</span>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto border-r-2 border-terminal-gray bg-terminal-dark-gray">
      {files.map((file) => renderNode(file, file.name))}
    </div>
  )
}

