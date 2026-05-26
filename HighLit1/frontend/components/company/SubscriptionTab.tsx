'use client'

import { useState } from 'react'
import { Check, Loader2, Star, Clock } from 'lucide-react'
import { usePlans, useRequestSubscription, useSubscription } from '@/hooks/useCompanies'
import { getApiErrorMessage } from '@/lib/apiError'
import type { Plan } from '@/lib/api/companies'

function planFeatures(plan: Plan): string[] {
  return [
    `${plan.max_active_jobs >= 100000 ? 'وظائف بلا حدود' : `حتى ${plan.max_active_jobs} وظيفة نشطة`}`,
    `${plan.max_visible_applicants >= 100000 ? 'متقدمون بلا حدود' : `${plan.max_visible_applicants} متقدم لكل وظيفة`}`,
    plan.can_view_applicant_contact ? 'عرض بيانات التواصل' : 'بدون بيانات تواصل',
    plan.allows_featured_jobs ? 'إعلانات مميّزة' : 'بدون إعلانات مميّزة',
  ]
}

export function SubscriptionTab({ slug }: { slug: string }) {
  const { data: sub, isLoading } = useSubscription(slug)
  const { data: plans } = usePlans()
  const request = useRequestSubscription(slug)
  const [error, setError] = useState('')
  const [requestedTier, setRequestedTier] = useState<string | null>(null)

  if (isLoading || !sub) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  const currentTier = sub.limits.tier
  const hasPending = !!sub.pending

  const submit = (plan: Plan) => {
    setError('')
    setRequestedTier(plan.tier)
    request.mutate(plan.id, {
      onError: (e: unknown) => {
        setError(getApiErrorMessage(e, 'تعذّر إرسال الطلب.'))
        setRequestedTier(null)
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Current plan + usage */}
      <div className="rounded-2xl border border-gray-dark bg-gray-light p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary">باقتك الحالية</p>
            <h3 className="text-lg font-bold text-accent">{sub.limits.name}</h3>
          </div>
          {sub.current?.expires_at && (
            <span className="flex items-center gap-1 text-xs text-text-secondary">
              <Clock className="h-3.5 w-3.5" />
              تنتهي {new Date(sub.current.expires_at).toLocaleDateString('ar-EG')}
            </span>
          )}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          <div className="rounded-lg border border-gray-dark bg-bg px-3 py-2">
            <div className="text-[11px] text-text-secondary">الوظائف النشطة</div>
            <div className="font-medium text-text">
              {sub.usage.active_jobs} / {sub.limits.max_active_jobs >= 100000 ? '∞' : sub.limits.max_active_jobs}
            </div>
          </div>
          <div className="rounded-lg border border-gray-dark bg-bg px-3 py-2">
            <div className="text-[11px] text-text-secondary">متقدمون / وظيفة</div>
            <div className="font-medium text-text">
              {sub.limits.max_visible_applicants >= 100000 ? '∞' : sub.limits.max_visible_applicants}
            </div>
          </div>
          <div className="rounded-lg border border-gray-dark bg-bg px-3 py-2">
            <div className="text-[11px] text-text-secondary">إعلانات مميّزة</div>
            <div className="font-medium text-text">{sub.limits.allows_featured_jobs ? 'متاحة' : 'غير متاحة'}</div>
          </div>
        </div>
        {hasPending && (
          <p className="mt-3 rounded-lg border border-accent/40 bg-accent/5 px-3 py-2 text-sm text-accent">
            طلب الترقية إلى «{sub.pending?.plan.name}» قيد المراجعة من الإدارة.
          </p>
        )}
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>

      {/* Plans */}
      <div>
        <h3 className="mb-3 font-bold text-text">الباقات المتاحة</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(plans ?? []).map((plan) => {
            const isCurrent = plan.tier === currentTier
            const featured = plan.allows_featured_jobs
            return (
              <div
                key={plan.id}
                className={`flex flex-col rounded-2xl border bg-gray-light p-4 ${
                  isCurrent ? 'border-accent' : 'border-gray-dark'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-text">{plan.name}</h4>
                  {featured && <Star className="h-4 w-4 text-accent" />}
                </div>
                <p className="mt-1 text-2xl font-bold text-accent">
                  {Number(plan.price) === 0 ? 'مجاني' : `${Number(plan.price)} ${plan.currency}`}
                  {Number(plan.price) > 0 && <span className="text-xs font-normal text-text-secondary"> / شهر</span>}
                </p>
                <ul className="mt-3 flex-1 space-y-1.5 text-xs text-text-secondary">
                  {planFeatures(plan).map((f) => (
                    <li key={f} className="flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5 flex-shrink-0 text-accent" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => submit(plan)}
                  disabled={isCurrent || hasPending || request.isPending}
                  className="mt-4 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-bg hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCurrent
                    ? 'باقتك الحالية'
                    : request.isPending && requestedTier === plan.tier
                    ? '...جارٍ'
                    : 'اطلب هذه الباقة'}
                </button>
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-text-secondary">
          بعد إرسال الطلب، تقوم إدارة المنصّة بمراجعته وتفعيله. لا يتم الدفع عبر المنصّة.
        </p>
      </div>
    </div>
  )
}
