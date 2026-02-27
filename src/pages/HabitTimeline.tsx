import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ChevronsDown,
  ChevronsUp,
  CircleCheckBig,
  MinusCircle,
} from "lucide-react";
import { useHabits } from "../hooks/useHabits";
import { useHabitTimeline } from "../hooks/useHabitTimeline";
import { DEFAULT_PROGRESS_QUESTION, LIMITS } from "../lib/types";
import {
  formatDate,
  getDaysAgo,
  getLocalDateString,
  getPastDays,
} from "../lib/utils";

type TimelineDraft = {
  note: string;
  status: 1 | 2 | 3;
};

const AUTOSAVE_DEBOUNCE_MS = 1400;

function ratingToStatus(rating: number): 1 | 2 | 3 {
  if (rating <= 2) return 1;
  if (rating <= 4) return 2;
  return 3;
}

function statusToRating(status: 1 | 2 | 3): number {
  if (status === 1) return 1;
  if (status === 2) return 3;
  return 5;
}

function StatusIcon({ status }: { status: 1 | 2 | 3 }) {
  const className = "w-5 h-5";

  if (status === 1)
    return <AlertTriangle className={`${className} text-[#c14b4b]`} />;
  if (status === 2)
    return <MinusCircle className={`${className} text-[#7b818b]`} />;
  return <CircleCheckBig className={`${className} text-[#2d8f61]`} />;
}

function isDateInAllowedWindow(
  date: string,
  minDate: string,
  maxDate: string,
): boolean {
  return date >= minDate && date <= maxDate;
}

export function HabitTimeline() {
  const navigate = useNavigate();
  const { habitId } = useParams<{ habitId: string }>();
  const {
    habits,
    loading: habitsLoading,
    error: habitsError,
    updateHabit,
  } = useHabits();
  const {
    entries,
    loading: timelineLoading,
    fetchEntries,
    upsertEntry,
  } = useHabitTimeline();

  const today = getLocalDateString();
  const minDate = getDaysAgo(7);
  const timelineDates = useMemo(() => getPastDays(8), [today]);

  const [questionDraft, setQuestionDraft] = useState(DEFAULT_PROGRESS_QUESTION);
  const [questionDirty, setQuestionDirty] = useState(false);

  const [drafts, setDrafts] = useState<Record<string, TimelineDraft>>({});
  const [dirtyDates, setDirtyDates] = useState<Record<string, boolean>>({});
  const [savingDates, setSavingDates] = useState<Record<string, boolean>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const dirtyDatesRef = useRef<Record<string, boolean>>({});

  const habit = useMemo(
    () => habits.find((h) => h.id === habitId),
    [habits, habitId],
  );

  useEffect(() => {
    if (habitId) {
      fetchEntries(habitId);
    }
  }, [habitId, fetchEntries]);

  useEffect(() => {
    setQuestionDraft(habit?.progress_question || DEFAULT_PROGRESS_QUESTION);
    setQuestionDirty(false);
  }, [habit?.progress_question]);

  useEffect(() => {
    if (!habit || !questionDirty) return;

    const timeoutId = window.setTimeout(async () => {
      await updateHabit(habit.id, {
        progress_question: questionDraft.trim() || DEFAULT_PROGRESS_QUESTION,
      });
      setQuestionDirty(false);
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [habit, questionDraft, questionDirty, updateHabit]);

  useEffect(() => {
    dirtyDatesRef.current = dirtyDates;
  }, [dirtyDates]);

  useEffect(() => {
    const entriesByDate = new Map(
      entries.map((entry) => [entry.entry_date, entry]),
    );
    setDrafts((prev) => {
      const nextDrafts: Record<string, TimelineDraft> = {};

      for (const date of timelineDates) {
        if (dirtyDatesRef.current[date] && prev[date]) {
          nextDrafts[date] = prev[date];
          continue;
        }

        const entry = entriesByDate.get(date);
        nextDrafts[date] = {
          note: entry?.note || "",
          status: ratingToStatus(entry?.rating || 3),
        };
      }

      return nextDrafts;
    });
  }, [entries, timelineDates]);

  useEffect(() => {
    if (!habitId) return;

    const datesToSave = Object.keys(dirtyDates).filter(
      (date) => dirtyDates[date],
    );
    if (datesToSave.length === 0) return;

    const timeoutId = window.setTimeout(async () => {
      for (const date of datesToSave) {
        if (!isDateInAllowedWindow(date, minDate, today)) {
          setSaveError("Date must be today or within the past 7 days");
          continue;
        }

        const draft = drafts[date];
        if (!draft || draft.status < 1 || draft.status > 3) {
          setSaveError("Invalid status");
          continue;
        }

        setSavingDates((prev) => ({ ...prev, [date]: true }));

        const success = await upsertEntry({
          habit_id: habitId,
          entry_date: date,
          rating: statusToRating(draft.status),
          note: draft.note.trim() || undefined,
        });

        setSavingDates((prev) => ({ ...prev, [date]: false }));

        if (success) {
          setSaveError(null);
          setDirtyDates((prev) => ({ ...prev, [date]: false }));
        } else {
          setSaveError("Failed to save progress entry");
        }
      }
    }, AUTOSAVE_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [dirtyDates, drafts, habitId, minDate, today, upsertEntry]);

  const handleNoteChange = (date: string, note: string) => {
    setDrafts((prev) => ({
      ...prev,
      [date]: {
        note,
        status: prev[date]?.status || 2,
      },
    }));
    setDirtyDates((prev) => ({ ...prev, [date]: true }));
  };

  const handleStatusStep = (date: string, direction: "up" | "down") => {
    const currentDraft = drafts[date] || { note: "", status: 2 as 1 | 2 | 3 };
    const nextStatus =
      direction === "up"
        ? (Math.min(3, currentDraft.status + 1) as 1 | 2 | 3)
        : (Math.max(1, currentDraft.status - 1) as 1 | 2 | 3);
    const nextDraft: TimelineDraft = {
      note: currentDraft.note,
      status: nextStatus,
    };

    setDrafts((prev) => ({
      ...prev,
      [date]: nextDraft,
    }));
    setDirtyDates((prev) => ({ ...prev, [date]: true }));
  };

  if (!habitId) {
    return (
      <div className="min-h-screen habit-scene flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[#6f737d] mb-3">Missing habit id</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-full bg-[#111319] text-white"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!habitsLoading && !habit) {
    return (
      <div className="min-h-screen habit-scene flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <p className="text-[#6f737d] mb-2">
            Habit not found or you do not have access.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-full bg-[#111319] text-white"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen habit-scene">
      <header className="border-b border-black/10 px-4 py-4 sticky top-0 z-10 bg-[#f7f7f8]/90 backdrop-blur-sm">
        <div className="max-w-[430px] md:max-w-3xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 text-[#666a73] hover:text-[#111319]"
            aria-label="Back to dashboard"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8d919a]">
              Timeline
            </p>
            <h1 className="text-xl font-bold text-[#111319] truncate">
              {habit?.name || "Habit"}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-[430px] md:max-w-3xl mx-auto px-3 sm:px-4 py-5 pb-24 space-y-5">
        {habitsError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
            {habitsError}
          </div>
        )}

        <section className="space-y-2">
          <input
            type="text"
            value={questionDraft}
            onChange={(e) => {
              setQuestionDraft(e.target.value);
              setQuestionDirty(true);
            }}
            maxLength={LIMITS.PROGRESS_QUESTION_MAX}
            style={{ fontSize: "22px", lineHeight: "1.2" }}
            className="w-full px-0 py-2 text-[#101114] bg-transparent border-0 border-b border-b-stone-300 focus:ring-0 focus:outline-none focus:border-[#111319]"
          />
        </section>

        {saveError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
            {saveError}
          </div>
        )}

        <section className="space-y-4">
          {timelineLoading && entries.length === 0 ? (
            <div className="text-sm text-[#7c8087]">Loading timeline...</div>
          ) : (
            timelineDates.map((date) => {
              const draft = drafts[date] || {
                note: "",
                status: 2 as 1 | 2 | 3,
              };
              const savedEntry = entries.find(
                (entry) => entry.entry_date === date,
              );

              return (
                <div key={date} className="grid grid-cols-[28px_1fr] gap-3">
                  <div className="relative flex justify-center items-start">
                    <div className="flex flex-col items-center gap-1 pt-1">
                      <button
                        type="button"
                        onClick={() => handleStatusStep(date, "up")}
                        className="p-0 text-[#9aa0aa] hover:text-[#111319]"
                        aria-label={`Increase status for ${formatDate(date)}`}
                      >
                        <ChevronsUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="z-[1] p-0"
                        aria-label={`Current status for ${formatDate(date)}`}
                      >
                        <StatusIcon status={draft.status} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusStep(date, "down")}
                        className="p-0 text-[#9aa0aa] hover:text-[#111319]"
                        aria-label={`Decrease status for ${formatDate(date)}`}
                      >
                        <ChevronsDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-1 pb-4 border-b border-[#e4e7ed]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[#111319]">
                          {formatDate(date)}
                        </h3>
                        <p className="text-xs text-[#858a94] mt-1">
                          {questionDraft.trim() || DEFAULT_PROGRESS_QUESTION}
                        </p>
                      </div>
                      <span className="text-[11px] uppercase tracking-[0.08em] text-[#9ca1ab]">
                        {savingDates[date]
                          ? "Saving..."
                          : savedEntry
                            ? "Saved"
                            : "No entry"}
                      </span>
                    </div>

                    <textarea
                      value={draft.note}
                      onChange={(e) => handleNoteChange(date, e.target.value)}
                      rows={2}
                      maxLength={LIMITS.TIMELINE_NOTE_MAX}
                      placeholder="Write progress note"
                      className="mt-3 w-full px-0 py-1 bg-transparent border-0 resize-none focus:ring-0 focus:outline-none focus:border-[#111319]"
                    />
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
}
