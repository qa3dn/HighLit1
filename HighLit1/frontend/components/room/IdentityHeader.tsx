'use client'

import { useState } from 'react'
import { Edit2, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useUpdateStatus } from '@/hooks/useRoom'
import { useCurrentUser } from '@/hooks/useAuth'

interface IdentityHeaderProps {
  user: {
    id: string
    username: string
    rank: string
    reputation_points: number
    avatar_url?: string
    status_text?: string
    bio?: string
  }
  codeCount?: number
  isOwnProfile: boolean
  onEditClick?: () => void
}

const rankLabels: Record<string, string> = {
  INTERN: 'Intern Bug Producer',
  JUNIOR: 'Junior Code Warrior',
  MID: 'Mid-Level Debugger',
  SENIOR: 'Senior Bug Creator',
  ARCHITECT: 'System Architect',
}

export function IdentityHeader({
  user,
  codeCount = 0,
  isOwnProfile,
  onEditClick,
}: IdentityHeaderProps) {
  const [isEditingStatus, setIsEditingStatus] = useState(false)
  const [statusText, setStatusText] = useState(user.status_text || '')
  const updateStatusMutation = useUpdateStatus()

  const handleStatusSave = async () => {
    if (isOwnProfile) {
      await updateStatusMutation.mutateAsync(statusText)
      setIsEditingStatus(false)
    }
  }

  return (
    <div className="bg-bg border-b border-gray p-6">
      <div className="flex items-start justify-between gap-4">
        {/* Left: Avatar, Name, Rank, Status */}
        <div className="flex items-start gap-4 flex-1">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-lg bg-gray border border-accent flex items-center justify-center text-accent font-mono text-xl flex-shrink-0">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username}
                className="w-full h-full rounded-lg object-cover"
              />
            ) : (
              <span>{user.username.charAt(0).toUpperCase()}</span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-mono text-text font-bold">
                {user.username}
              </h1>
              <span className="text-sm text-accent font-mono px-2 py-1 bg-gray rounded border border-accent/30">
                {rankLabels[user.rank as keyof typeof rankLabels] || user.rank}
              </span>
            </div>

            {/* Status */}
            {isOwnProfile && isEditingStatus ? (
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  onBlur={handleStatusSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleStatusSave()
                    } else if (e.key === 'Escape') {
                      setStatusText(user.status_text || '')
                      setIsEditingStatus(false)
                    }
                  }}
                  className="flex-1 bg-gray border border-accent/30 px-3 py-1 rounded text-text font-mono text-sm focus:outline-none focus:border-accent"
                  autoFocus
                />
              </div>
            ) : (
              <div
                className="text-text-secondary font-mono text-sm mb-2 cursor-pointer hover:text-accent transition-colors"
                onClick={() => isOwnProfile && setIsEditingStatus(true)}
                title={isOwnProfile ? 'Click to edit status' : ''}
              >
                {user.status_text || (isOwnProfile ? 'Click to set your status...' : '')}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm font-mono">
              <div className="text-accent">
                <span className="text-text-secondary">Points:</span>{' '}
                <span className="text-accent">{user.reputation_points}</span>
              </div>
              <div className="text-accent">
                <span className="text-text-secondary">Code:</span>{' '}
                <span className="text-accent">{codeCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Edit Button */}
        {isOwnProfile && (
          <Button
            variant="outline"
            size="sm"
            onClick={onEditClick}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            رتّب غرفتي
          </Button>
        )}
      </div>
    </div>
  )
}

