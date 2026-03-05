import { useState } from "react";

const monthlyData = {
  2: {
    1:  { guests: 2, water: 420 },
    2:  { guests: 1, water: 210 },
    3:  { guests: 3, water: 630, fines: [
          { guestId: "G-1041", entry: "08:00", scheduledExit: "08:45", actualExit: "09:05", lateBy: 20, amount: 150 },
        ]},
    4:  { guests: 2, water: 400 },
    5:  { guests: 0, water: 180 },
    6:  { guests: 4, water: 820, fines: [
          { guestId: "G-1055", entry: "12:00", scheduledExit: "12:50", actualExit: "13:10", lateBy: 20, amount: 200 },
          { guestId: "G-1056", entry: "15:00", scheduledExit: "15:45", actualExit: "16:05", lateBy: 20, amount: 200 },
        ]},
    7:  { guests: 1, water: 200 },
    8:  { guests: 2, water: 390 },
    9:  { guests: 3, water: 610 },
    10: { guests: 2, water: 430, fines: [
          { guestId: "G-1060", entry: "08:10", scheduledExit: "09:00", actualExit: "09:35", lateBy: 35, amount: 300 },
        ]},
    11: { guests: 1, water: 215 },
    12: { guests: 0, water: 170 },
    13: { guests: 3, water: 590 },
    14: { guests: 2, water: 400 },
    15: { guests: 4, water: 840, fines: [
          { guestId: "G-1071", entry: "12:05", scheduledExit: "12:55", actualExit: "13:20", lateBy: 25, amount: 150 },
        ]},
    16: { guests: 2, water: 420 },
    17: { guests: 1, water: 205 },
    18: { guests: 3, water: 615 },
    19: { guests: 2, water: 395 },
    20: { guests: 0, water: 165 },
    21: { guests: 2, water: 410 },
    22: { guests: 3, water: 620, fines: [
          { guestId: "G-1085", entry: "15:00", scheduledExit: "15:30", actualExit: "15:52", lateBy: 22, amount: 200 },
          { guestId: "G-1086", entry: "08:00", scheduledExit: "08:40", actualExit: "09:00", lateBy: 20, amount: 200 },
        ]},
    23: { guests: 1, water: 200 },
    24: { guests: 2, water: 405 },
    25: { guests: 3, water: 630 },
    26: { guests: 2, water: 415 },
    27: { guests: 0, water: 175 },
    28: { guests: 4, water: 810, fines: [
          { guestId: "G-1092", entry: "12:00", scheduledExit: "12:45", actualExit: "13:18", lateBy: 33, amount: 250 },
        ]},
    29: { guests: 2, water: 400 },
    30: { guests: 3, water: 605 },
    31: { guests: 1, water: 210 },
  },
};

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS_IN_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31];

function DayCell({ day, data, monthName }) {
  const [hovered, setHovered] = useState(false);
  if (!day) return <div className="min-h-[52px]" />;

  const hasFine = data?.fines?.length > 0;

  let cellCls = "bg-white/50 border-slate-200/60";
  if (hasFine) cellCls = "bg-red-50/80 border-red-300/70";
  else if (data) cellCls = "bg-emerald-50/70 border-emerald-200/60";

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`rounded-lg border px-1.5 py-1.5 cursor-default select-none transition-all duration-150
          ${cellCls} ${hovered && data ? "shadow-md scale-105" : ""} min-h-[52px]`}
      >
        <div className={`text-xs font-bold mb-1 flex items-center gap-0.5
          ${hasFine ? "text-red-500" : "text-slate-500"}`}>
          {day}
          {hasFine && (
            <span className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold leading-none">
              !
            </span>
          )}
        </div>
        {data && (
          <div className="space-y-0.5">
            <div className="text-[10px] text-slate-500">
              <span className="font-semibold text-slate-600">{data.guests}</span>g
            </div>
            <div className="text-[10px] font-semibold text-blue-500">{data.water}L</div>
          </div>
        )}
      </div>

      {hovered && data && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-60 bg-slate-800 text-white rounded-xl shadow-2xl shadow-slate-900/40 p-3 pointer-events-none">
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45" />

          <div className="text-xs font-bold text-slate-200 mb-2 border-b border-slate-600 pb-1.5">
            {monthName} {day}
          </div>

          <div className="space-y-1 text-xs mb-2">
            <div className="flex justify-between">
              <span className="text-slate-400">No. of Guests</span>
              <span className="font-semibold">{data.guests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Water</span>
              <span className="font-semibold text-blue-300">{data.water} L</span>
            </div>
          </div>

          {hasFine ? (
            <div className="border-t border-slate-600 pt-2">
              <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1.5">
                Late Exit Fines · {data.fines.length} issued
              </div>
              <div className="space-y-2">
                {data.fines.map((f, i) => (
                  <div key={i} className="bg-red-900/30 rounded-lg px-2 py-1.5">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold text-red-300 text-xs">{f.guestId}</span>
                      <span className="text-red-400 font-bold text-xs">₹{f.amount}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 space-y-0.5">
                      <div>
                        Entry: <span className="text-slate-300">{f.entry}</span>
                        {" · "}Sched. Exit: <span className="text-slate-300">{f.scheduledExit}</span>
                      </div>
                      <div>
                        Actual Exit: <span className="text-red-400 font-semibold">{f.actualExit}</span>
                        {" · "}
                        <span className="text-red-300 font-semibold">+{f.lateBy} min late</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="border-t border-slate-600 pt-2 text-[11px] text-emerald-400 font-medium">
              ✓ No late exits on this day
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export const MonthlyDetails = () => {
  const today = new Date();
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const year = today.getFullYear();

  const data = monthlyData[selectedMonth] || {};
  const daysInMonth = DAYS_IN_MONTH[selectedMonth];
  const firstDayOfWeek = new Date(year, selectedMonth, 1).getDay();

  const cells = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const fineDays = Object.values(data).filter(d => d.fines?.length > 0).length;
  const totalFines = Object.values(data).reduce((acc, d) => acc + (d.fines?.length || 0), 0);

  return (
    <div className="relative rounded-2xl border border-slate-300/60 bg-white/60 backdrop-blur-sm shadow-sm shadow-slate-300/30 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-400 via-purple-400 to-transparent" />

      <div className="px-6 pt-5 pb-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-600">Monthly Details</h2>
            {fineDays > 0 && (
              <p className="text-[11px] text-red-400 mt-0.5">
                {fineDays} late exit day{fineDays > 1 ? "s" : ""} &middot; {totalFines} fine{totalFines > 1 ? "s" : ""} this month
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MONTHS.map((m, i) => (
              <button
                key={m}
                onClick={() => setSelectedMonth(i)}
                className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide transition-all duration-150
                  ${i === selectedMonth
                    ? "bg-violet-600 text-white shadow shadow-violet-300/40"
                    : "bg-slate-100/80 text-slate-500 hover:bg-violet-50 hover:text-violet-600 border border-slate-200/60"
                  }`}
              >
                {m.slice(0, 3)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-6 pb-3 flex gap-4 flex-wrap text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" />Normal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" />Late exit fine
        </span>
        <span className="text-slate-400 italic">Hover a day for details</span>
      </div>

      <div className="px-6 pb-6">
        <div className="grid grid-cols-7 gap-1.5 mb-1.5">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d => (
            <div key={d} className="text-center text-[10px] font-bold tracking-widest uppercase text-slate-400 py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((day, idx) => (
            <DayCell key={idx} day={day} data={day ? data[day] : null} monthName={MONTHS[selectedMonth]} />
          ))}
        </div>
      </div>
    </div>
  );
};