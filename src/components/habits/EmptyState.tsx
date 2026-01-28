interface EmptyStateProps {
  onAddClick: () => void
}

export function EmptyState({ onAddClick }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">📝</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        No habits yet
      </h2>
      <p className="text-gray-600 mb-6 max-w-xs mx-auto">
        Start building better habits by adding your first one. Small steps lead to big changes!
      </p>
      <button
        onClick={onAddClick}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
      >
        Add your first habit
      </button>
    </div>
  )
}
