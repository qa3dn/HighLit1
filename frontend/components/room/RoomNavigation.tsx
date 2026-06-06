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
    <div className="w-full lg:w-60 lg:flex-shrink-0">
      <div className="rounded-2xl border border-gray-dark bg-gray-light lg:sticky lg:top-20">
        <div className="hidden border-b border-gray-dark p-4 lg:block">
          <h2 className="font-mono text-sm font-bold text-accent">أغراضي</h2>
        </div>
        <nav className="p-2">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:space-y-1 lg:overflow-visible">
            {visibleSections.map((section) => {
              const isActive = activeSection === section.id
              return (
                <li key={section.id} className="flex-shrink-0 lg:flex-shrink">
                  <button
                    onClick={() => {
                      playClickSound()
                      onSectionChange(section.id)
                    }}
                    className={`flex w-full items-center gap-2.5 whitespace-nowrap rounded-lg px-4 py-2.5 font-mono text-sm transition-all ${
                      isActive ? 'bg-accent text-bg' : 'text-text hover:bg-gray hover:text-accent'
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
    </div>
  )
}

