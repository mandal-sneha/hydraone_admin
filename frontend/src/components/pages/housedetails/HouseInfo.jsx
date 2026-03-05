import { useState } from "react";

const houseData = {
  waterId: "WTR-2024-4821",
  location: "Sector 14, Block C, Navi Mumbai - 400614",
  familyCount: 4,
  members: [
    { name: "Rajesh Sharma",  present: true  },
    { name: "Priya Sharma",   present: true  },
    { name: "Aryan Sharma",   present: false },
    { name: "neha Sharma",   present: true  },
  ],
};

const todaySlots = [
  {
    slotLabel: "8 AM",
    guests: [
      { guestId: "G-1041", entryTime: "08:00", scheduledExit: "08:45", durationMinutes: 40 },
      { guestId: "G-1042", entryTime: "08:10", scheduledExit: "09:00", durationMinutes: 50 },
    ],
  },
  {
    slotLabel: "12 PM",
    guests: [
      { guestId: "G-1043", entryTime: "12:00", scheduledExit: "12:50", durationMinutes: 55 },
    ],
  },
  {
    slotLabel: "3 PM",
    guests: [
      { guestId: "G-1044", entryTime: "15:05", scheduledExit: "15:45", durationMinutes: 30 },
    ],
  },
];

function addMinutes(timeStr, mins) {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

function toMins(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function GuestRow({ guest }) {
  const [tooltip, setTooltip] = useState(false);
  const actualExit = addMinutes(guest.entryTime, guest.durationMinutes);
  const late = toMins(actualExit) > toMins(guest.scheduledExit);
  const lateBy = late ? toMins(actualExit) - toMins(guest.scheduledExit) : 0;

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="relative flex-shrink-0">
        <div
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200
            ${late ? "border-red-400 bg-red-50 cursor-pointer" : "border-emerald-500 bg-emerald-50"}`}
          onMouseEnter={() => late && setTooltip(true)}
          onMouseLeave={() => setTooltip(false)}
        >
          {late ? (
            <svg className="w-3.5 h-3.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        {tooltip && late && (
          <div className="absolute left-9 top-0 z-50 bg-slate-800 text-white text-xs rounded-xl px-3 py-2 w-48 shadow-xl pointer-events-none">
            <div className="font-semibold text-red-300 mb-0.5">Late Exit</div>
            <div>
              Guest stayed <span className="font-bold text-white">{lateBy} min</span> extra
            </div>
            <div className="text-slate-400 mt-1">
              Scheduled: {guest.scheduledExit} · Actual: {actualExit}
            </div>
            <div className="absolute left-[-5px] top-2.5 w-2.5 h-2.5 bg-slate-800 rotate-45" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-0.5 text-xs">
        <span>
          <span className="text-slate-400 uppercase tracking-wide mr-1">Guest</span>
          <span className="font-semibold text-slate-700">{guest.guestId}</span>
        </span>
        <span>
          <span className="text-slate-400 uppercase tracking-wide mr-1">Entry</span>
          <span className="font-medium text-slate-600">{guest.entryTime}</span>
        </span>
        <span>
          <span className="text-slate-400 uppercase tracking-wide mr-1">Sched.</span>
          <span className="font-medium text-slate-600">{guest.scheduledExit}</span>
        </span>
        <span>
          <span className="text-slate-400 uppercase tracking-wide mr-1">Actual</span>
          <span className={`font-medium ${late ? "text-red-500" : "text-emerald-600"}`}>{actualExit}</span>
        </span>
      </div>
    </div>
  );
}

export const HouseInfo = () => {
  const presentCount = houseData.members.filter(m => m.present).length;

  return (
    <div className="h-[520px] overflow-y-auto pr-1 space-y-5
      scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">

      <div className="relative rounded-2xl border border-slate-300/60 bg-white/60 backdrop-blur-sm shadow-sm shadow-slate-300/30 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-cyan-400 to-transparent" />
        <div className="px-6 pt-5 pb-1">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-blue-600 mb-4">House Details</h2>
        </div>
        <div className="px-6 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3 text-sm">
          <div>
            <span className="text-xs tracking-widest uppercase text-slate-400">Water ID</span>
            <p className="font-semibold text-slate-700 mt-0.5">{houseData.waterId}</p>
          </div>
          <div>
            <span className="text-xs tracking-widest uppercase text-slate-400">Location</span>
            <p className="font-semibold text-slate-700 mt-0.5">{houseData.location}</p>
          </div>
          <div>
            <span className="text-xs tracking-widest uppercase text-slate-400">No. of Family Members</span>
            <p className="font-semibold text-slate-700 mt-0.5">{houseData.familyCount}</p>
          </div>
          <div>
            <span className="text-xs tracking-widest uppercase text-slate-400">Members</span>
            <ol className="mt-0.5 space-y-0.5">
              {houseData.members.map((m, i) => (
                <li key={i} className="font-semibold text-slate-700">
                  <span className="text-slate-400 mr-1.5">{i + 1}.</span>{m.name}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="relative rounded-2xl border border-slate-300/60 bg-white/60 backdrop-blur-sm shadow-sm shadow-slate-300/30 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-transparent" />
        <div className="px-6 pt-5 pb-1">
          <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-emerald-600 mb-4">
            Today's Water Allocation
          </h2>
        </div>

        <div className="px-6 pb-6 space-y-5">
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              <span className="text-xs font-bold tracking-widest uppercase text-indigo-500">Family Members</span>
              <span className="ml-auto text-xs font-semibold text-slate-500">
                <span className="text-indigo-600 font-bold">{presentCount}</span>
                <span className="text-slate-400"> / {houseData.familyCount} present today</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {houseData.members.map((m, i) => (
                <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 border text-xs
                  ${m.present
                    ? "bg-indigo-50/60 border-indigo-200/60"
                    : "bg-slate-100/50 border-slate-200/50"
                  }`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.present ? "bg-indigo-400" : "bg-slate-300"}`} />
                  <span className={`font-medium ${m.present ? "text-indigo-700" : "text-slate-400"}`}>
                    {m.name}
                  </span>
                  <span className={`ml-auto text-[10px] font-semibold ${m.present ? "text-indigo-500" : "text-slate-400"}`}>
                    {m.present ? "In" : "Out"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/70 bg-slate-50/60 px-4 py-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-xs font-bold tracking-widest uppercase text-blue-500">Guests</span>
            </div>

            <div className="flex justify-between items-center mb-3 px-1">
              {todaySlots.map((slot) => (
                <div key={slot.slotLabel} className="flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-slate-500">{slot.slotLabel}</span>
                  <div className="w-px h-2 bg-blue-300" />
                </div>
              ))}
            </div>
            <div className="h-px bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-200 mb-4" />

            <div className="space-y-4">
              {todaySlots.map((slot) => (
                <div key={slot.slotLabel}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <span className="text-xs font-bold tracking-widest uppercase text-blue-400">
                      {slot.slotLabel} Slot
                    </span>
                  </div>
                  <div className="pl-3 border-l-2 border-blue-100">
                    {slot.guests.map((guest) => (
                      <GuestRow key={guest.guestId} guest={guest} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};