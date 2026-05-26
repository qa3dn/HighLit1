export function ProjectCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-gray-dark bg-gray-light">
      <div className="aspect-[16/10] bg-gray" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 rounded bg-gray" />
        <div className="h-4 w-full rounded bg-gray" />
        <div className="h-3 w-1/2 rounded bg-gray" />
      </div>
    </div>
  )
}
