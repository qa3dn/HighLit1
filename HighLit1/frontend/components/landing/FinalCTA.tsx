'use client'

import { Button } from '../ui/Button'
import Link from 'next/link'
import { playClickSound } from '@/lib/audio'

export function FinalCTA() {
  return (
    <section className="bg-bg py-16 sm:py-24 lg:py-30" dir="rtl">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center">
          <div className="font-mono text-accent text-sm mb-6 glow-accent" dir="ltr">
            if (understand) {'{'}
          </div>
          <h2 className="mb-6 text-2xl font-bold text-text sm:text-3xl md:text-display-sm">
            إذا حسّيت حالك فاهم اللي فوق… مكانك هون.
          </h2>
          <Button
            asChild
            variant="primary"
            size="lg"
            className="mt-8 w-full px-8 py-4 text-base font-medium sm:w-auto sm:px-12 sm:text-lg"
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
