import { Flame } from "lucide-react";
import { getPastDays, getLocalDateString } from "../../lib/utils";

interface HabitCardProps {
  id: string;
  name: string;
  description?: string | null;
  completedToday: boolean;
  currentStreak: number;
  motivationNote?: string | null;
  categoryName?: string | null;
  frequencyType?: "daily" | "weekly";
  frequencyValue?: number;
  weeklyCompletions?: number;
  completionDates?: string[];
  onToggle: () => void;
  onDateToggle?: (date: string) => void;
  onClick?: () => void;
}

export function HabitCard({
  name,
  description,
  completedToday,
  currentStreak,
  motivationNote,
  categoryName,
  frequencyType = "daily",
  frequencyValue = 1,
  weeklyCompletions = 0,
  completionDates = [],
  onToggle,
  onDateToggle,
  onClick,
}: HabitCardProps) {
  const today = getLocalDateString();
  const displayDays = getPastDays(7).reverse();
  const completedSet = new Set(completionDates);
  const monthLabel = new Date(displayDays[0] + "T00:00:00")
    .toLocaleDateString("en-US", { month: "short" })
    .toLowerCase();
  const isWeekly = frequencyType === "weekly";
  const weeklyProgress = isWeekly
    ? `${weeklyCompletions}/${frequencyValue}`
    : null;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  const handleDateToggle = (e: React.MouseEvent, date: string) => {
    e.stopPropagation();
    onDateToggle?.(date);
  };

  return (
    <div
      onClick={onClick}
      className="relative overflow-hidden p-4 sm:p-5 rounded-3xl border border-black/5 bg-white transition-all cursor-pointer hover:shadow-[0_10px_30px_rgba(17,17,17,0.08)]"
    >
      {currentStreak > 0 && (
        <div className="pointer-events-none absolute right-[7%] top-[-5%] h-[120%] flex items-center text-[#111319]/12">
          <span className="text-[20rem] sm:text-[25rem] leading-none font-semibold tabular-nums">
            {currentStreak}
          </span>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 pr-16 sm:pr-20">
          <h3 className="font-semibold text-[clamp(1.1rem,2.3vw,1.5rem)] leading-[1.1] text-[#101114] break-words">
            {name}
          </h3>

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {categoryName && (
              <span className="text-[11px] tracking-[0.14em] uppercase text-[#8f9298]">
                {categoryName}
              </span>
            )}
            {weeklyProgress && (
              <span className="text-[11px] tracking-[0.14em] uppercase text-[#8f9298]">
                {weeklyProgress}/wk
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleToggle}
          className={`
            flex-shrink-0 w-9 h-9 rounded-full border flex items-center justify-center
            transition-all
            ${
              completedToday
                ? "bg-[#111319] border-[#111319] text-white habit-complete"
                : "border-[#c9ccd3] text-[#8f9298] hover:border-[#111319]"
            }
          `}
          aria-label={
            completedToday ? "Mark as incomplete" : "Mark as complete"
          }
        >
          {completedToday && (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>
      </div>

      <p className="mt-5 text-[12px] lowercase tracking-[0.08em] text-[#a2a5ac]">
        {monthLabel}
      </p>

      <div className="mt-2 overflow-x-auto py-1 -mx-1 px-1">
        <div className="flex gap-2 min-w-max">
          {displayDays.map((date) => {
            const dateObj = new Date(date + "T00:00:00");
            const isToday = date === today;
            const isDone = completedSet.has(date);

            return (
              <div key={date} className="w-9 sm:w-10 text-center">
                <button
                  type="button"
                  onClick={(e) => handleDateToggle(e, date)}
                  aria-label={`Toggle ${name} for ${dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                  className={`
                    w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold
                    ${
                      isDone
                        ? "bg-[#111319] text-white"
                        : "bg-[#f1f2f5] text-[#1d1f24]"
                    }
                    ${isToday ? "border-2 border-[#d7dae0]" : "border-2 border-transparent"}
                    hover:border-[#111319] active:scale-[0.98]
                  `}
                >
                  {dateObj.getDate()}
                </button>
                <div className="mt-2 text-[11px] text-[#a2a5ac]">
                  {dateObj
                    .toLocaleDateString("en-US", { weekday: "short" })
                    .charAt(0)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0 flex-1 pr-16 sm:pr-20">
          {description && (
            <p className="text-sm text-[#7c8087] line-clamp-1">{description}</p>
          )}

          {motivationNote && (
            <p className="text-xs text-[#9a9ea7] mt-1 italic line-clamp-1">
              "{motivationNote}"
            </p>
          )}
        </div>

        {currentStreak > 0 && (
          <div className="flex-shrink-0 inline-flex items-center gap-2 text-[#111319]">
            <Flame className="w-8 h-8" strokeWidth={2.2} aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}
