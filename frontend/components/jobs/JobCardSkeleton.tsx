export function JobCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-gray-dark bg-gray-light p-5">
      <div className="flex gap-4">
        <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-2/3 rounded bg-gray" />
          <div className="h-3 w-1/3 rounded bg-gray" />
          <div className="flex gap-1.5">
            <div className="h-5 w-16 rounded-full bg-gray" />
            <div className="h-5 w-16 rounded-full bg-gray" />
            <div className="h-5 w-20 rounded-full bg-gray" />
          </div>
          <div className="h-3 w-1/2 rounded bg-gray" />
        </div>
      </div>
    </div>
  )
}
