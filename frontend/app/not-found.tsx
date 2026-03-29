'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { playClickSound } from '@/lib/audio'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-blue-600 text-white flex items-center justify-center font-mono">
      <div className="max-w-2xl px-8">
        <div className="mb-8">
          <div className="text-6xl font-bold mb-4">:(</div>
          <div className="text-2xl mb-4">
            Your PC ran into a problem and needs to restart.
          </div>
          <div className="text-lg mb-8">
            We're just collecting some error info, and then we'll restart for you.
          </div>
        </div>
        <div className="space-y-2 text-sm mb-8">
          <div>0% complete</div>
          <div className="bg-white/20 h-2 w-full">
            <div className="bg-white h-full" style={{ width: '0%' }} />
          </div>
        </div>
        <div className="space-y-2 text-sm mb-8">
          <div>Stop Code: PAGE_NOT_FOUND</div>
          <div>Error: 0x000000404</div>
          <div>Status: CRASH</div>
        </div>
        <div className="flex gap-4">
          <Button
            variant="terminal"
            onClick={() => {
              playClickSound()
              window.location.href = '/'
            }}
          >
            Restart System
          </Button>
          <Button
            variant="terminal"
            asChild
            onClick={playClickSound}
          >
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

