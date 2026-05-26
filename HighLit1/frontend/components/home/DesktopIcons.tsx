'use client'

import Link from 'next/link'
import { playClickSound } from '@/lib/audio'

interface DesktopIcon {
  name: string
  path: string
  icon: string
}

const icons: DesktopIcon[] = [
  { name: 'Rants.exe', path: '/rants', icon: '📝' },
  { name: 'Showcase.sh', path: '/code', icon: '💻' },
  { name: 'Jobs.db', path: '/jobs', icon: '💼' },
  { name: 'Spaces.sock', path: '/spaces', icon: '🎙️' },
]

export function DesktopIcons() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
      {icons.map((icon) => (
        <Link
          key={icon.path}
          href={icon.path}
          onClick={playClickSound}
          className="flex flex-col items-center gap-2 p-4 border-2 border-transparent hover:border-terminal-text hover:bg-terminal-dark-gray transition-all group cursor-pointer cursor-glow"
        >
          <div className="text-4xl group-hover:scale-110 transition-transform">
            {icon.icon}
          </div>
          <div className="font-mono text-xs text-terminal-text group-hover:text-terminal-text transition-colors text-center">
            {icon.name}
          </div>
        </Link>
      ))}
    </div>
  )
}

