const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const DATES = Array.from({ length: 31 }, (_, i) => i + 1);
const HIGHLIGHTS: Record<number, "orange" | "blue"> = {
  4: "orange",
  5: "orange",
  10: "blue",
  11: "blue",
  17: "blue",
  24: "orange",
};

export function MiniCalendar() {
  const firstDayOffset = 2; // July 2026 starts on Wednesday

  return (
    <div className="mt-2">
      <div className="mb-1 grid grid-cols-7 gap-0.5 text-center text-[10px] text-text-dim">
        {DAYS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {DATES.map((date) => {
          const highlight = HIGHLIGHTS[date];
          return (
            <div
              key={date}
              className={`flex h-5 w-full items-center justify-center rounded text-[10px] ${
                highlight === "orange"
                  ? "bg-warning/20 font-medium text-warning"
                  : highlight === "blue"
                    ? "bg-primary/20 font-medium text-primary"
                    : "text-text-muted"
              }`}
            >
              {date}
            </div>
          );
        })}
      </div>
    </div>
  );
}