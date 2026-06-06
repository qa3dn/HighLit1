'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { MapPin, Briefcase, Star, BadgeCheck, Users, CheckCircle2, Clock } from 'lucide-react'
import type { Job } from '@/lib/api/jobs'
import {
  JOB_TYPE_LABEL,
  WORKPLACE_LABEL,
  EXPERIENCE_LABEL,
  EMPLOYMENT_LABEL,
  formatSalary,
  formatDeadline,
} from '@/lib/jobMeta'

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-gray-dark px-2 py-0.5 text-[11px] text-text-secondary">
      {children}
    </span>
  )
}

function CompanyLogo({ url, name }: { url?: string; name: string }) {
  const [failed, setFailed] = useState(false)
  if (url && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        onError={() => setFailed(true)}
        className="h-full w-full object-cover"
      />
    )
  }
  return (
    <div className="flex h-full w-full items-center justify-center text-text-secondary">
      <Briefcase className="h-5 w-5" />
    </div>
  )
}

export function JobListCard({ job }: { job: Job }) {
  const salary = formatSalary(job.min_salary, job.max_salary, job.currency)
  const company = job.company_detail
  const deadline = formatDeadline(job.application_deadline)
  const skills = job.skills ?? []

  return (
    <Link
      href={`/jobs/${job.id}`}
      className={`group block rounded-2xl border bg-gray-light p-5 transition-all hover:border-accent ${
        job.is_featured
          ? 'border-accent/50 shadow-glow'
          : 'border-gray-dark hover:shadow-hover'
      }`}
    >
      <div className="flex gap-4">
        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-gray-dark bg-bg">
          <CompanyLogo url={company?.logo_url} name={company?.name ?? job.company} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate font-bold text-text transition-colors group-hover:text-accent">
                {job.title}
              </h3>
              <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                <span className="truncate">{company?.name ?? job.company}</span>
                {company?.is_verified && (
                  <BadgeCheck className="h-3.5 w-3.5 flex-shrink-0 text-accent" aria-label="شركة موثّقة" />
                )}
              </div>
            </div>
            {job.is_featured && (
              <span className="flex flex-shrink-0 items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
                <Star className="h-3 w-3" aria-hidden /> مميّزة
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <Chip>{JOB_TYPE_LABEL[job.job_type]}</Chip>
            <Chip>{EMPLOYMENT_LABEL[job.employment_type]}</Chip>
            <Chip>{WORKPLACE_LABEL[job.workplace_type]}</Chip>
            <Chip>{EXPERIENCE_LABEL[job.experience_level]}</Chip>
          </div>

          {skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {skills.slice(0, 4).map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-accent/5 px-2 py-0.5 font-mono text-[11px] text-accent/90"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 4 && (
                <span className="px-1 font-mono text-[11px] text-text-secondary">
                  +{skills.length - 4}
                </span>
              )}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-text-secondary">
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                {job.location}
              </span>
            )}
            {salary && <span className="font-medium text-accent">{salary}</span>}
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" aria-hidden />
              {job.application_count} متقدم
            </span>
            <span>{formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: ar })}</span>
            {deadline && (
              <span
                className={`flex items-center gap-1 ${
                  deadline.closed ? 'text-text-secondary' : deadline.urgent ? 'text-amber-400' : 'text-text-secondary'
                }`}
              >
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {deadline.label}
              </span>
            )}
            {job.has_applied && (
              <span className="flex items-center gap-1 text-accent">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> تقدّمت
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
