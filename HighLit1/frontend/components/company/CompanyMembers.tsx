'use client'

import { useState } from 'react'
import { UserPlus, Loader2, Trash2, Crown, Shield, User as UserIcon } from 'lucide-react'
import { useAddMember, useMembers, useRemoveMember } from '@/hooks/useCompanies'
import { useCurrentUser } from '@/hooks/useAuth'
import { getApiErrorMessage } from '@/lib/apiError'
import type { Company, CompanyMember } from '@/lib/api/companies'

const ROLE_LABEL: Record<CompanyMember['role'], string> = {
  OWNER: 'مالك',
  ADMIN: 'مدير',
  EMPLOYEE: 'موظّف',
}

const ROLE_ICON: Record<CompanyMember['role'], typeof Crown> = {
  OWNER: Crown,
  ADMIN: Shield,
  EMPLOYEE: UserIcon,
}

export function CompanyMembers({ company }: { company: Company }) {
  const { data: members, isLoading } = useMembers(company.slug)
  const add = useAddMember(company.slug)
  const remove = useRemoveMember(company.slug)
  const { data: currentUser } = useCurrentUser()
  const [username, setUsername] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'EMPLOYEE'>('ADMIN')
  const [error, setError] = useState('')

  const submit = () => {
    setError('')
    if (!username.trim()) {
      setError('أدخل اسم المستخدم.')
      return
    }
    add.mutate(
      { username: username.trim().replace(/^@/, ''), role },
      {
        onSuccess: () => setUsername(''),
        onError: (e) => setError(getApiErrorMessage(e, 'تعذّر إضافة العضو.')),
      },
    )
  }

  return (
    <section className="space-y-4 rounded-2xl border border-gray-dark bg-gray-light p-5">
      <div>
        <h3 className="text-sm font-semibold text-text">الفريق والمدراء</h3>
        <p className="mt-0.5 text-xs text-text-secondary">
          أضِف مدراء يمكنهم إدارة الشركة ونشر الوظائف ومراجعة المتقدمين.
        </p>
      </div>

      {/* Add member */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="اسم المستخدم"
          dir="ltr"
          className="flex-1 rounded-lg border border-gray-dark bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'ADMIN' | 'EMPLOYEE')}
          className="rounded-lg border border-gray-dark bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
        >
          <option value="ADMIN">مدير</option>
          <option value="EMPLOYEE">موظّف</option>
        </select>
        <button
          onClick={submit}
          disabled={add.isPending}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-bg hover:bg-accent-hover disabled:opacity-50"
        >
          {add.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          إضافة
        </button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Member list */}
      {isLoading ? (
        <p className="py-6 text-center text-sm text-text-secondary">جارٍ التحميل...</p>
      ) : (
        <div className="space-y-2">
          {(members ?? []).map((member) => {
            const RoleIcon = ROLE_ICON[member.role]
            const isOwner = member.role === 'OWNER'
            const isSelf = currentUser?.id === String(member.user_id)
            return (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-gray-dark bg-bg px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <RoleIcon className="h-4 w-4 text-accent" />
                  <span className="text-sm text-text">@{member.username}</span>
                  <span className="rounded-full border border-gray-dark px-2 py-0.5 text-[11px] text-text-secondary">
                    {ROLE_LABEL[member.role]}
                  </span>
                  {isSelf && <span className="text-[11px] text-text-secondary">(أنت)</span>}
                </div>
                {!isOwner && (
                  <button
                    onClick={() => remove.mutate(member.id)}
                    disabled={remove.isPending}
                    className="rounded-lg border border-gray-dark p-1.5 text-red-400 hover:border-red-400/60 hover:bg-red-500/10 disabled:opacity-50"
                    aria-label="إزالة"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
