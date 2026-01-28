interface PointsDisplayProps {
  points: number
}

export function PointsDisplay({ points }: PointsDisplayProps) {
  return (
    <div className="flex items-center gap-1 text-sm font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
      <span>⭐</span>
      <span>{points.toLocaleString()}</span>
    </div>
  )
}
