'use client'

import { Button } from '../ui/Button'
import Link from 'next/link'
import { playClickSound } from '@/lib/audio'

export function FinalCTA() {
  return (
    <section className="py-30 bg-bg" dir="rtl">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center">
          <div className="font-mono text-accent text-sm mb-6 glow-accent" dir="ltr">
            if (understand) {'{'}
          </div>
          <h2 className="text-display-sm font-bold mb-6 text-text">
            إذا حسّيت حالك فاهم اللي فوق… مكانك هون.
          </h2>
          <Button
            asChild
            variant="primary"
            size="lg"
            className="px-12 py-4 text-lg font-medium mt-8"
            onClick={playClickSound}
          >
            <Link href="/register">انضم لـ HighLit</Link>
          </Button>
          <div className="font-mono text-accent text-sm mt-6 glow-accent" dir="ltr">
            {'}'}
          </div>
        </div>
      </div>
    </section>
  )
}
