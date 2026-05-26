'use client'

import Link from 'next/link'
import { Github, ImageIcon, Play, Layers } from 'lucide-react'
import type { StudentProject } from '@/lib/api/studentProjects'
import { PROJECT_TYPE_LABELS } from '@/lib/showcase/constants'
import { playClickSound } from '@/lib/audio'

const TYPE_ICONS = {
  IMAGE: ImageIcon,
  GITHUB: Github,
  VIDEO: Play,
  MIXED: Layers,
}

interface ProjectCardProps {
  project: StudentProject
}

export function ProjectCard({ project }: ProjectCardProps) {
  const TypeIcon = TYPE_ICONS[project.project_type] || Layers
  const cover = project.cover_image || project.gallery_images?.[0] || null

  return (
    <Link
      href={`/code/${project.id}`}
      onClick={playClickSound}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-dark bg-gray-light transition-all duration-300 hover:border-accent/50 hover:shadow-glow"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-bg">
        {cover ? (
          <img
            src={cover}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-text-secondary">
            <TypeIcon className="h-10 w-10 text-accent/60" />
            <span className="font-mono text-xs">{PROJECT_TYPE_LABELS[project.project_type]}</span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full border border-accent/30 bg-bg/80 px-2.5 py-0.5 text-xs font-medium text-accent backdrop-blur-sm">
          {PROJECT_TYPE_LABELS[project.project_type]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5" dir="rtl">
        <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-text transition-colors group-hover:text-accent">
          {project.title}
        </h3>
        <p className="mb-3 line-clamp-2 flex-1 text-sm text-text-secondary">{project.summary}</p>
        <p className="mb-3 text-xs text-text-secondary">
          {project.university} · {project.major}
          {project.academic_year ? ` · ${project.academic_year}` : ''}
        </p>
        {project.tech_stack?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tech_stack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="rounded-md border border-gray-dark bg-bg px-2 py-0.5 font-mono text-[10px] text-accent"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
