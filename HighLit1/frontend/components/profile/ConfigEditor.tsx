'use client'

import { useState } from 'react'
import { Window } from '../terminal/Window'
import { Button } from '../ui/Button'
import { playClickSound } from '@/lib/audio'

interface ConfigEditorProps {
  config: {
    username?: string
    bio?: string
  }
  onSave: (config: { username?: string; bio?: string }) => void
}

export function ConfigEditor({ config, onSave }: ConfigEditorProps) {
  const [editedConfig, setEditedConfig] = useState(config)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    playClickSound()
    onSave(editedConfig)
    setIsEditing(false)
  }

  return (
    <Window title="config.json" path="~/.config/" className="mt-6">
      <div className="font-mono text-sm">
        <div className="flex justify-between items-center mb-4" dir="ltr">
          <div className="text-terminal-accent">Edit Configuration</div>
          {!isEditing ? (
            <Button
              variant="terminal"
              size="sm"
              onClick={() => {
                playClickSound()
                setIsEditing(true)
              }}
            >
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="terminal"
                size="sm"
                onClick={() => {
                  playClickSound()
                  setIsEditing(false)
                  setEditedConfig(config)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="terminal"
                size="sm"
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          )}
        </div>
        <pre className="text-terminal-text bg-terminal-bg p-4 border border-terminal-gray overflow-x-auto" dir="ltr">
{`{
  "user": {
    "username": "${isEditing ? '' : editedConfig.username || 'user'}",
    "bio": "${isEditing ? '' : editedConfig.bio || ''}"
  }
}`}
        </pre>
        {isEditing && (
          <div className="mt-4 space-y-2">
            <div>
              <label className="text-terminal-accent text-xs block mb-1">
                Username:
              </label>
              <input
                type="text"
                value={editedConfig.username || ''}
                onChange={(e) =>
                  setEditedConfig({ ...editedConfig, username: e.target.value })
                }
                className="w-full bg-terminal-bg border border-terminal-gray px-2 py-1 text-terminal-text font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-terminal-accent text-xs block mb-1">
                Bio:
              </label>
              <textarea
                value={editedConfig.bio || ''}
                onChange={(e) =>
                  setEditedConfig({ ...editedConfig, bio: e.target.value })
                }
                className="w-full bg-terminal-bg border border-terminal-gray px-2 py-1 text-terminal-text font-mono text-sm h-24"
              />
            </div>
          </div>
        )}
      </div>
    </Window>
  )
}

