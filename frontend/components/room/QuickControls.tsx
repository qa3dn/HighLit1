'use client'

import { Settings, Eye, EyeOff, Github, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Window } from '@/components/terminal/Window'
import { playClickSound } from '@/lib/audio'

interface QuickControlsProps {
  isOwnProfile: boolean
}

export function QuickControls({ isOwnProfile }: QuickControlsProps) {
  if (!isOwnProfile) {
    return null
  }

  const handleExport = () => {
    playClickSound()
    // TODO: Implement export functionality
    alert('ميزة التصدير قريباً...')
  }

  const handleLinkGitHub = () => {
    playClickSound()
    // TODO: Implement GitHub linking
    alert('ميزة ربط GitHub قريباً...')
  }

  const handleDeleteAccount = () => {
    if (confirm('هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      playClickSound()
      // TODO: Implement account deletion
      alert('ميزة حذف الحساب قريباً...')
    }
  }

  return (
    <div className="w-64 bg-bg border-l border-gray h-full flex flex-col">
      <div className="p-4 border-b border-gray">
        <h2 className="text-accent font-mono text-sm font-bold">تحكم سريع</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="space-y-2">
          <h3 className="text-text-secondary font-mono text-xs mb-2">
            الإعدادات
          </h3>
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start"
            onClick={handleLinkGitHub}
          >
            <Github className="w-4 h-4 ml-2" />
            ربط GitHub
          </Button>
        </div>

        <div className="space-y-2">
          <h3 className="text-text-secondary font-mono text-xs mb-2">
            البيانات
          </h3>
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 ml-2" />
            تصدير بياناتي
          </Button>
        </div>

        <div className="space-y-2 pt-4 border-t border-gray">
          <h3 className="text-text-secondary font-mono text-xs mb-2 text-red-500">
            خطر
          </h3>
          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-start text-red-500 hover:bg-red-500/10 hover:border-red-500"
            onClick={handleDeleteAccount}
          >
            <Trash2 className="w-4 h-4 ml-2" />
            حذف حسابي
          </Button>
        </div>
      </div>
    </div>
  )
}

