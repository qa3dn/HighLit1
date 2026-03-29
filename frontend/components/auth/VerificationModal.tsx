'use client'

import { useState } from 'react'
import { Window } from '../terminal/Window'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { playClickSound, playTypingSound } from '@/lib/audio'

interface VerificationModalProps {
  isOpen: boolean
  onVerify: (code: string) => void
  onClose: () => void
}

export function VerificationModal({ isOpen, onVerify, onClose }: VerificationModalProps) {
  const [code, setCode] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    playClickSound()
    onVerify(code)
    setCode('')
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="w-full max-w-md">
        <Window title="2FA_Verification" path="~/auth/verify" onClose={onClose}>
          <div className="font-mono text-sm space-y-4">
            <div className="text-terminal-accent mb-4">
              Enter verification code sent to your email
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <div className="text-terminal-accent mb-2">Enter_Verification_Code:</div>
                <Input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    playTypingSound()
                    setCode(e.target.value)
                  }}
                  placeholder="______"
                  variant="terminal"
                  className="w-full text-center text-2xl tracking-widest"
                  showCursor={true}
                  maxLength={6}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="terminal"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="terminal"
                  className="flex-1"
                  disabled={code.length !== 6}
                >
                  Verify
                </Button>
              </div>
            </form>
          </div>
        </Window>
      </div>
    </div>
  )
}

