import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated'
}

export function Card({ className, variant = 'default', ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-2xl bg-gray-light border border-gray-dark',
        {
          'shadow-soft': variant === 'default',
          'shadow-medium': variant === 'elevated',
        },
        className
      )}
      {...props}
    />
  )
}
