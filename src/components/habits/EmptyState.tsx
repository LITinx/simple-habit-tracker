interface EmptyStateProps {
  onAddClick: () => void
}

export function EmptyState({ onAddClick }: EmptyStateProps) {
  return (
    <div className="text-center py-14 px-6 rounded-3xl bg-[#f6f7fa] border border-black/5">
      <h2 className="text-2xl font-semibold text-[#111319] mb-2 tracking-tight">
        Start your first habit
      </h2>
      <p className="text-[#7f838d] mb-6 max-w-xs mx-auto">
        Add one daily action and track it with the same rhythm each week.
      </p>
      <button
        onClick={onAddClick}
        className="inline-flex items-center px-5 py-2.5 bg-[#111319] text-white font-medium rounded-full hover:bg-black"
      >
        + Add habit
      </button>
    </div>
  )
}
