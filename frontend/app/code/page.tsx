'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Window } from '@/components/terminal/Window'
import { FileTree } from '@/components/code/FileTree'
import { CodeViewer } from '@/components/code/CodeViewer'
import { api } from '@/lib/api'

export default function CodePage() {
  const [selectedCode, setSelectedCode] = useState<any>(null)

  const { data: codePosts } = useQuery({
    queryKey: ['code-posts'],
    queryFn: async () => {
      const { data } = await api.get('/posts?type=CODE')
      return data.filter((post: any) => post.type === 'CODE')
    },
  })

  // Transform posts into file tree structure
  const fileTree = codePosts
    ? codePosts.map((post: any) => ({
        name: post.user?.username || 'anonymous',
        type: 'folder' as const,
        children: post.code_snippets?.map((snippet: any, index: number) => ({
          name: `${snippet.language}_${index + 1}.${snippet.language}`,
          type: 'file' as const,
          postId: post.id,
          code: { ...snippet, post },
        })),
      }))
    : []

  const handleFileSelect = (file: any) => {
    if (file.code) {
      setSelectedCode(file.code)
    }
  }

  return (
    <div className="min-h-screen bg-terminal-bg text-terminal-text relative">
      <Header />
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <Window title="Code Repository" path="~/projects" className="w-full">
            <div className="flex h-[600px]">
              {/* File Tree - Left Side */}
              <div className="w-1/3">
                <FileTree
                  files={fileTree}
                  onFileSelect={handleFileSelect}
                  selectedFile={selectedCode?.id}
                />
              </div>
              {/* Code Viewer - Right Side */}
              <div className="flex-1">
                {selectedCode ? (
                  <CodeViewer code={selectedCode} />
                ) : (
                  <div className="h-full flex items-center justify-center text-terminal-gray font-mono">
                    Select a file to view code
                  </div>
                )}
              </div>
            </div>
          </Window>
        </div>
      </main>
      <Footer />
    </div>
  )
}

