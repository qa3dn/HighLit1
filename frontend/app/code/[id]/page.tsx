'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Card } from '@/components/ui/Card'
import { CodeBlock } from '@/components/code/CodeBlock'
import { RoastSection } from '@/components/code/RoastSection'
import { api } from '@/lib/api'

export default function CodeDetailPage() {
  const params = useParams()
  const postId = params.id as string

  const { data: post } = useQuery({
    queryKey: ['code-post', postId],
    queryFn: async () => {
      const { data } = await api.get(`/posts/${postId}`)
      return data
    },
  })

  if (!post) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <h1 className="text-3xl font-bold mb-4">{post.content}</h1>
            {post.code_snippets?.map((snippet: any) => (
              <div key={snippet.id} className="mb-4">
                <CodeBlock
                  code={snippet.code_body}
                  language={snippet.language}
                />
              </div>
            ))}
            <RoastSection
              postId={post.id}
              isRoastEnabled={post.is_roast_enabled}
            />
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

