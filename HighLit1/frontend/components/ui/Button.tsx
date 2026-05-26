import { ButtonHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'
import { playClickSound } from '@/lib/audio'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'terminal'
  size?: 'sm' | 'md' | 'lg'
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', onClick, asChild, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      playClickSound()
      onClick?.(e)
    }

    // Filter out asChild from props to prevent React warning
    // Note: Full asChild support (rendering child as button) would require Radix UI
    // For now, we just prevent the prop from reaching the DOM
    const { asChild: _, ...domProps } = props as any

    return (
      <button
        ref={ref}
        className={clsx(
          'font-medium rounded-xl transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg',
          {
            // Primary variant - Green accent
            'bg-accent text-bg hover:bg-accent-hover shadow-soft hover:shadow-glow':
              variant === 'primary',
            // Secondary variant
            'bg-gray-light text-text hover:bg-gray border border-gray-dark hover:border-accent':
              variant === 'secondary',
            // Outline variant
            'bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-bg':
              variant === 'outline',
            // Terminal variant - monospace accent button used across the
            // terminal-styled surfaces (auth, jobs, code viewer).
            'bg-transparent border border-accent text-accent font-mono hover:bg-accent hover:text-bg':
              variant === 'terminal',
            // Sizes
            'px-4 py-2 text-sm': size === 'sm',
            'px-6 py-3 text-base': size === 'md',
            'px-8 py-4 text-lg': size === 'lg',
          },
          className
        )}
        onClick={handleClick}
        {...domProps}
      />
    )
  }
)

Button.displayName = 'Button'
