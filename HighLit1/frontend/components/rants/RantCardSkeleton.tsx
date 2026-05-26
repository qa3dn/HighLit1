import { Card } from '../ui/Card'

export function RantCardSkeleton() {
  return (
    <Card className="mb-4 animate-pulse border-gray-dark" dir="rtl">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-light" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-32 rounded bg-gray-light" />
          <div className="h-2.5 w-20 rounded bg-gray-light" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gray-light" />
        <div className="h-3 w-5/6 rounded bg-gray-light" />
        <div className="h-3 w-2/3 rounded bg-gray-light" />
      </div>
      <div className="mt-4 flex gap-2 border-t border-gray-dark pt-3">
        <div className="h-7 w-16 rounded-lg bg-gray-light" />
        <div className="h-7 w-16 rounded-lg bg-gray-light" />
        <div className="h-7 w-16 rounded-lg bg-gray-light" />
      </div>
    </Card>
  )
}
