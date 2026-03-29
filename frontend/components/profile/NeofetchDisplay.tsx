'use client'

interface NeofetchDisplayProps {
  user: {
    username: string
    rank: string
    reputation_points: number
    bio?: string
  }
}

export function NeofetchDisplay({ user }: NeofetchDisplayProps) {
  const rankLabels: Record<string, string> = {
    INTERN: 'Intern Bug Producer',
    JUNIOR: 'Junior Code Warrior',
    MID: 'Mid-Level Debugger',
    SENIOR: 'Senior Bug Creator',
    ARCHITECT: 'System Architect',
  }

  return (
    <div className="font-mono text-sm">
      <pre className="text-terminal-accent whitespace-pre" dir="ltr">
{`     ██╗  ██╗██╗ ██████╗ ██╗  ██╗
     ██║  ██║██║██╔════╝ ██║  ██║
     ███████║██║██║     ███████║
     ██╔══██║██║██║     ██╔══██║
     ██║  ██║██║╚██████╗██║  ██║
     ╚═╝  ╚═╝╚═╝ ╚═════╝╚═╝  ╚═╝`}
      </pre>
      <div className="mt-4 space-y-1" dir="ltr">
        <div className="flex gap-4">
          <span className="text-terminal-accent w-24">USER:</span>
          <span className="text-terminal-text">{user.username}</span>
        </div>
        <div className="flex gap-4">
          <span className="text-terminal-accent w-24">RANK:</span>
          <span className="text-terminal-text">
            {rankLabels[user.rank as keyof typeof rankLabels] || user.rank}
          </span>
        </div>
        <div className="flex gap-4">
          <span className="text-terminal-accent w-24">XP_POINTS:</span>
          <span className="text-terminal-text">{user.reputation_points}</span>
        </div>
        <div className="flex gap-4">
          <span className="text-terminal-accent w-24">STREAK:</span>
          <span className="text-terminal-text">15 Days Coding</span>
        </div>
        <div className="flex gap-4">
          <span className="text-terminal-accent w-24">SHELL:</span>
          <span className="text-terminal-text">Zsh (Pro Mode)</span>
        </div>
        {user.bio && (
          <div className="flex gap-4 mt-2">
            <span className="text-terminal-accent w-24">BIO:</span>
            <span className="text-terminal-text">{user.bio}</span>
          </div>
        )}
      </div>
    </div>
  )
}

