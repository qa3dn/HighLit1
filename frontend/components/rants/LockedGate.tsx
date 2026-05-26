'use client'

import Link from 'next/link'
import { Lock } from 'lucide-react'
import { playClickSound } from '@/lib/audio'

interface LockedGateProps {
  remaining: number
}

export function LockedGate({ remaining }: LockedGateProps) {
  return (
    <div className="relative mt-2" dir="rtl">
      {/* Blurred faux content hinting there's more behind the gate */}
      <div aria-hidden className="pointer-events-none select-none space-y-3 opacity-40 blur-sm">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl border border-gray-dark bg-gray-light p-5">
            <div className="mb-3 h-3 w-40 rounded bg-gray" />
            <div className="mb-2 h-3 w-full rounded bg-gray" />
            <div className="h-3 w-3/4 rounded bg-gray" />
          </div>
        ))}
      </div>

      {/* Gate overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-accent/30 bg-bg/90 p-8 text-center shadow-glow backdrop-blur">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
            <Lock className="h-6 w-6 text-accent" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-text">
            في {remaining} منشور إضافي بانتظارك
          </h3>
          <p className="mb-6 text-sm text-text-secondary">
            سجّل دخول أو أنشئ حساباً مجانياً لرؤية كل الفضفضات والمشاركة في النقاش.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              onClick={playClickSound}
              className="rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-bg transition hover:bg-accent-hover"
            >
              تسجيل الدخول
            </Link>
            <Link
              href="/register"
              onClick={playClickSound}
              className="rounded-xl border border-accent px-6 py-2.5 text-sm font-medium text-accent transition hover:bg-accent/10"
            >
              إنشاء حساب
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
