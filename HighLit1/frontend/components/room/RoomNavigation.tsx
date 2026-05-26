'use client'

import { Folder, FileText, Lightbulb, MessageSquare, Star, Settings } from 'lucide-react'
import { playClickSound } from '@/lib/audio'

export type RoomSection = 'code' | 'notes' | 'ideas' | 'rants' | 'saved' | 'settings'

interface RoomNavigationProps {
  activeSection: RoomSection
  onSectionChange: (section: RoomSection) => void
  isOwnProfile: boolean
}

const sections: Array<{
  id: RoomSection
  label: string
  icon: React.ReactNode
  private?: boolean
}> = [
  { id: 'code', label: 'مخزن الكود', icon: <Folder className="w-4 h-4" /> },
  { id: 'notes', label: 'ملاحظاتي', icon: <FileText className="w-4 h-4" />, private: true },
  { id: 'ideas', label: 'أفكاري', icon: <Lightbulb className="w-4 h-4" /> },
  { id: 'rants', label: 'فضفضاتي', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'saved', label: 'المحفوظات', icon: <Star className="w-4 h-4" />, private: true },
  { id: 'settings', label: 'إعدادات الغرفة', icon: <Settings className="w-4 h-4" />, private: true },
]

export function RoomNavigation({
  activeSection,
  onSectionChange,
  isOwnProfile,
}: RoomNavigationProps) {
  const visibleSections = sections.filter(
    (section) => !section.private || isOwnProfile
  )

  return (
    <div className="w-64 bg-bg border-r border-gray h-full flex flex-col">
      <div className="p-4 border-b border-gray">
        <h2 className="text-accent font-mono text-sm font-bold">أغراضي</h2>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {visibleSections.map((section) => {
            const isActive = activeSection === section.id
            return (
              <li key={section.id}>
                <button
                  onClick={() => {
                    playClickSound()
                    onSectionChange(section.id)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-sm transition-all ${
                    isActive
                      ? 'bg-accent text-bg'
                      : 'text-text hover:bg-gray hover:text-accent'
                  }`}
                >
                  {section.icon}
                  <span>{section.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}

