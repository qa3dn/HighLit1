'use client'

import { useState } from 'react'
import {
  Check,
  Loader2,
  Star,
  Clock,
  ArrowRight,
  Tag,
  UploadCloud,
  Copy,
  BadgeCheck,
  ShieldCheck,
} from 'lucide-react'
import {
  usePlans,
  useQuoteSubscription,
  useRequestSubscription,
  useSubscription,
} from '@/hooks/useCompanies'
import { uploadFile, type Plan, type SubscriptionInfo, type SubscriptionQuote } from '@/lib/api/companies'
import { getApiErrorMessage } from '@/lib/apiError'

function planFeatures(plan: Plan): string[] {
  return [
    plan.max_active_jobs >= 100000 ? 'وظائف بلا حدود' : `حتى ${plan.max_active_jobs} وظيفة نشطة`,
    plan.max_visible_applicants >= 100000 ? 'متقدمون بلا حدود' : `${plan.max_visible_applicants} متقدم لكل وظيفة`,
    plan.can_view_applicant_contact ? 'عرض بيانات التواصل' : 'بدون بيانات تواصل',
    plan.allows_featured_jobs ? 'إعلانات وظائف مميّزة' : 'بدون إعلانات مميّزة',
  ]
}

export function SubscriptionTab({ slug }: { slug: string }) {
  const { data: sub, isLoading } = useSubscription(slug)
  const { data: plans } = usePlans()
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null)

  if (isLoading || !sub) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  if (checkoutPlan) {
    return <Checkout slug={slug} plan={checkoutPlan} info={sub} onBack={() => setCheckoutPlan(null)} />
  }

  const currentTier = sub.limits.tier
  const hasPending = !!sub.pending

  return (
    <div className="space-y-8">
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
          <p className="mt-3 flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/5 px-3 py-2 text-sm text-accent">
            <Clock className="h-4 w-4 shrink-0" />
            طلب الاشتراك في «{sub.pending?.plan.name}» قيد المراجعة من الإدارة.
          </p>
        )}
      </div>

      {/* Plans */}
      <div>
        <div className="mb-4 text-center">
          <h3 className="text-xl font-bold text-text">اختر الباقة المناسبة</h3>
          <p className="mt-1 text-sm text-text-secondary">رقِّ حسابك بخطوات بسيطة، وادفع بأمان عبر Click.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(plans ?? []).map((plan) => {
            const isCurrent = plan.tier === currentTier
            const highlight = plan.allows_featured_jobs
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border bg-gray-light p-5 transition-all hover:-translate-y-0.5 ${
                  highlight ? 'border-accent shadow-glow' : 'border-gray-dark hover:border-accent/40'
                }`}
              >
                {highlight && (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-bg">
                    الأكثر شيوعاً
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-text">{plan.name}</h4>
                  {highlight && <Star className="h-4 w-4 fill-accent text-accent" />}
                </div>
                <p className="mt-2 text-3xl font-extrabold text-accent">
                  {Number(plan.price) === 0 ? 'مجاني' : Number(plan.price)}
                  {Number(plan.price) > 0 && (
                    <span className="text-xs font-normal text-text-secondary"> {plan.currency} / شهر</span>
                  )}
                </p>
                {plan.description && <p className="mt-1 text-xs text-text-secondary">{plan.description}</p>}
                <ul className="mt-4 flex-1 space-y-2 text-xs text-text-secondary">
                  {planFeatures(plan).map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 shrink-0 text-accent" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setCheckoutPlan(plan)}
                  disabled={isCurrent || hasPending}
                  className={`mt-5 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    highlight
                      ? 'bg-accent text-bg hover:bg-accent-hover'
                      : 'border border-accent/50 text-accent hover:bg-accent/10'
                  }`}
                >
                  {isCurrent ? 'باقتك الحالية' : hasPending ? 'طلب قيد المراجعة' : 'اشترك الآن'}
                  {!isCurrent && !hasPending && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            )
          })}
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-text-secondary">
          <ShieldCheck className="h-3.5 w-3.5 text-accent" />
          الدفع عبر تحويل Click مع مراجعة يدوية من الإدارة لتفعيل الاشتراك.
        </p>
      </div>
    </div>
  )
}

// ── Checkout ──────────────────────────────────────────────────────────────────

function Checkout({
  slug,
  plan,
  info,
  onBack,
}: {
  slug: string
  plan: Plan
  info: SubscriptionInfo
  onBack: () => void
}) {
  const quoteM = useQuoteSubscription(slug)
  const request = useRequestSubscription(slug)
  const isPaid = Number(plan.price) > 0

  const [promo, setPromo] = useState('')
  const [quote, setQuote] = useState<SubscriptionQuote | null>(null)
  const [promoMsg, setPromoMsg] = useState('')
  const [transferRef, setTransferRef] = useState('')
  const [proofUrl, setProofUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const pay = info.payment_info
  const total = quote?.total ?? plan.price
  const currency = quote?.currency ?? plan.currency

  const applyPromo = async () => {
    setError('')
    setPromoMsg('')
    try {
      const q = await quoteM.mutateAsync({ plan_id: plan.id, promo_code: promo.trim() || undefined })
      setQuote(q)
      if (promo.trim()) setPromoMsg(q.promo_applied ? `تم تطبيق الخصم: -${q.discount} ${q.currency}` : q.promo_message || 'كود غير صالح.')
    } catch (e) {
      setError(getApiErrorMessage(e, 'تعذّر التحقق من الكود.'))
    }
  }

  const onProof = async (file?: File) => {
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const { url } = await uploadFile(file)
      setProofUrl(url)
    } catch (e) {
      setError(getApiErrorMessage(e, 'تعذّر رفع الإيصال.'))
    } finally {
      setUploading(false)
    }
  }

  const copyId = async () => {
    if (!pay) return
    try {
      await navigator.clipboard.writeText(pay.account_id)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  const submit = () => {
    setError('')
    request.mutate(
      {
        plan_id: plan.id,
        promo_code: quote?.promo_applied ? promo.trim() : undefined,
        transfer_reference: isPaid ? transferRef.trim() : undefined,
        proof_url: isPaid ? proofUrl || undefined : undefined,
      },
      {
        onSuccess: () => setDone(true),
        onError: (e: unknown) => setError(getApiErrorMessage(e, 'تعذّر إرسال الطلب.')),
      },
    )
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-accent/40 bg-accent/5 p-8 text-center">
        <BadgeCheck className="mx-auto h-12 w-12 text-accent" />
        <h3 className="mt-4 text-lg font-bold text-text">تم إرسال طلبك</h3>
        <p className="mt-2 text-sm text-text-secondary">
          {isPaid
            ? 'سيراجع فريق الإدارة إيصال التحويل ويفعّل اشتراكك قريباً.'
            : 'سيراجع فريق الإدارة طلبك ويفعّله قريباً.'}
        </p>
        <button onClick={onBack} className="mt-5 rounded-lg border border-accent/50 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/10">
          العودة للباقات
        </button>
      </div>
    )
  }

  const canSubmit = !request.isPending && (!isPaid || (transferRef.trim().length > 0 && !uploading))

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-text-secondary hover:text-accent">
        <ArrowRight className="h-4 w-4 rotate-180" /> رجوع للباقات
      </button>

      {/* Plan summary */}
      <div className="rounded-2xl border border-accent/40 bg-gray-light p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-text-secondary">الباقة المختارة</p>
            <h3 className="text-lg font-bold text-text">{plan.name}</h3>
          </div>
          <p className="text-2xl font-extrabold text-accent">
            {Number(total)} <span className="text-xs font-normal text-text-secondary">{currency}</span>
          </p>
        </div>
        {quote && Number(quote.discount) > 0 && (
          <p className="mt-1 text-xs text-text-secondary">
            السعر <span className="line-through">{Number(quote.amount)}</span> — خصم {Number(quote.discount)} {currency}
          </p>
        )}
      </div>

      {isPaid && (
        <>
          {/* Discount code */}
          <div className="rounded-2xl border border-gray-dark bg-gray-light p-5">
            <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-text">
              <Tag className="h-4 w-4 text-accent" /> كود الخصم
            </label>
            <div className="flex gap-2">
              <input
                value={promo}
                onChange={(e) => setPromo(e.target.value)}
                placeholder="أدخل الكود (اختياري)"
                className="flex-1 rounded-lg border border-gray-dark bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
              />
              <button
                onClick={applyPromo}
                disabled={quoteM.isPending}
                className="rounded-lg border border-accent/50 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/10 disabled:opacity-50"
              >
                {quoteM.isPending ? '...' : 'تطبيق'}
              </button>
            </div>
            {promoMsg && (
              <p className={`mt-2 text-xs ${quote?.promo_applied ? 'text-accent' : 'text-red-400'}`}>{promoMsg}</p>
            )}
          </div>

          {/* Click payment */}
          <div className="rounded-2xl border border-gray-dark bg-gray-light p-5">
            <h4 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-text">
              <ShieldCheck className="h-4 w-4 text-accent" /> الدفع عبر {pay?.provider ?? 'Click'}
            </h4>
            <div className="rounded-xl border border-gray-dark bg-bg p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] text-text-secondary">حوّل إلى الحساب</p>
                  <p className="font-mono text-lg font-bold text-accent">{pay?.account_id ?? '—'}</p>
                  <p className="text-xs text-text-secondary">{pay?.account_name}</p>
                </div>
                <button
                  onClick={copyId}
                  className="flex items-center gap-1 rounded-lg border border-gray-dark px-2.5 py-1.5 text-xs text-text-secondary hover:border-accent hover:text-accent"
                >
                  <Copy className="h-3.5 w-3.5" /> {copied ? 'تم النسخ' : 'نسخ'}
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between rounded-lg bg-accent/10 px-3 py-2">
                <span className="text-xs text-text-secondary">المبلغ المطلوب تحويله</span>
                <span className="font-bold text-accent">{Number(total)} {currency}</span>
              </div>
            </div>
            {pay?.instructions && <p className="mt-2 text-xs text-text-secondary">{pay.instructions}</p>}

            {/* Transfer reference + proof */}
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-text">رقم عملية التحويل</label>
                <input
                  value={transferRef}
                  onChange={(e) => setTransferRef(e.target.value)}
                  placeholder="مثال: TXN-123456"
                  className="w-full rounded-lg border border-gray-dark bg-bg px-3 py-2 text-sm text-text outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text">إيصال التحويل (صورة)</label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-gray-dark bg-bg px-3 py-4 text-sm text-text-secondary hover:border-accent">
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-accent" /> جارٍ الرفع...
                    </>
                  ) : proofUrl ? (
                    <>
                      <BadgeCheck className="h-4 w-4 text-accent" /> تم إرفاق الإيصال
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4" /> اختر صورة الإيصال
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onProof(e.target.files?.[0])}
                  />
                </label>
                {proofUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={proofUrl} alt="إيصال" className="mt-2 max-h-40 rounded-lg border border-gray-dark object-contain" />
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        onClick={submit}
        disabled={!canSubmit}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-bold text-bg hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {request.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        {isPaid ? 'تأكيد الطلب وإرسال الإثبات' : 'تأكيد طلب الاشتراك'}
      </button>
      {isPaid && (
        <p className="text-center text-xs text-text-secondary">
          بعد الإرسال تُراجع الإدارة الإيصال وتفعّل الاشتراك يدوياً.
        </p>
      )}
    </div>
  )
}
