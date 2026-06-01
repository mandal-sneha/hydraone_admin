import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../../../lib/axios.js";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const DayCell = ({ day, data, monthName }) => {
  const [hovered, setHovered] = useState(false);
  if (!day) return <div className="min-h-[52px]" />;

  const hasFine = data?.hasFine === true;
  const waterUsed = data?.waterUsed || 0;
  const normalGuests = data?.normalGuests || 0;
  const fraudulentGuests = data?.fraudulentGuests || [];

  let cellCls = "bg-white/50 border-slate-200/60";
  if (hasFine) cellCls = "bg-red-50/80 border-red-300/70";

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
              <span className="font-semibold text-slate-600">{normalGuests}</span>g
              {fraudulentGuests.length > 0 && (
                <span className="ml-1 text-red-500">({fraudulentGuests.length}f)</span>
              )}
            </div>
            <div className="text-[10px] font-semibold text-blue-500">{waterUsed}L</div>
          </div>
        )}
      </div>

      {hovered && data && (hasFine || fraudulentGuests.length > 0) && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 w-64 bg-slate-800 text-white rounded-xl shadow-2xl shadow-slate-900/40 p-3 pointer-events-none">
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45" />

          <div className="text-xs font-bold text-slate-200 mb-2 border-b border-slate-600 pb-1.5">
            {monthName} {day}
          </div>

          <div className="space-y-1 text-xs mb-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Normal Guests</span>
              <span className="font-semibold">{normalGuests}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Water</span>
              <span className="font-semibold text-blue-300">{waterUsed} L</span>
            </div>
            {hasFine && fraudulentGuests.length === 0 && (
              <div className="flex justify-between mt-1 pt-1 border-t border-slate-600">
                <span className="text-slate-400">Fine Amount</span>
                <span className="font-semibold text-red-400">₹{data?.fineAmount || 500}</span>
              </div>
            )}
          </div>

          {fraudulentGuests.length > 0 ? (
            <div className="border-t border-slate-600 pt-2">
              <div className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1.5">
                Late Exit Fines · {fraudulentGuests.length} issued
              </div>
              <div className="space-y-2">
                {fraudulentGuests.map((f, i) => (
                  <div key={i} className="bg-red-900/30 rounded-lg px-2 py-1.5">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold text-red-300 text-[11px]">{f.guestName}</span>
                      <span className="text-red-400 font-bold text-xs">₹{f.fine}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 space-y-0.5">
                      <div>
                        Sch. Exit: <span className="text-slate-300">{f.scheduledExit}</span>
                      </div>
                      <div>
                        Actual Exit: <span className="text-red-400 font-semibold">{f.actualExit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : hasFine ? (
            <div className="border-t border-slate-600 pt-2 text-[11px] text-amber-400 font-medium">
              Fine recorded (no guest details available)
            </div>
          ) : (
            <div className="border-t border-slate-600 pt-2 text-[11px] text-emerald-400 font-medium">
              No late exits on this day
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const MonthlyDetails = () => {
  const { waterid } = useParams();
  const today = new Date();
  const currentMonthIndex = today.getMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonthIndex);
  const [apiData, setApiData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/properties/${waterid}/get-family-monthly-usage-details`);
        
        if (response.data.success) {
          setApiData(response.data.data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    if (waterid) fetchData();
  }, [waterid]);

  if (loading) return <div className="p-10 text-center text-slate-500 font-medium">Loading historical records...</div>;
  if (error) return <div className="p-10 text-center text-red-500 font-bold">{error}</div>;

  const currentMonthName = MONTHS[selectedMonth];
  const monthInfo = apiData[currentMonthName] || { days: [], totalUsage: 0, totalFines: 0 };
  
  const formattedData = {};
  monthInfo.days.forEach(d => {
    formattedData[d.date] = {
      waterUsed: d.waterUsed,
      normalGuests: d.normalGuests,
      fraudulentGuests: d.fraudulentGuests || [],
      hasFine: d.hasFine === true,
      fineAmount: d.fineAmount
    };
  });

  const year = today.getFullYear();
  let daysInMonth = DAYS_IN_MONTH[selectedMonth];
  if (selectedMonth === 1 && (year % 4 === 0 && year % 100 !== 0 || year % 400 === 0)) {
    daysInMonth = 29;
  }
  
  const firstDayOfWeek = new Date(year, selectedMonth, 1).getDay();

  const cells = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="relative rounded-2xl border border-slate-300/60 bg-white/60 backdrop-blur-sm shadow-sm shadow-slate-300/30 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-400 via-purple-400 to-transparent" />

      <div className="px-6 pt-5 pb-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-600">Monthly Details</h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Total Usage: <span className="font-bold text-blue-600">{monthInfo.totalUsage}L</span> 
              {monthInfo.totalFines > 0 && (
                <span className="text-red-400 ml-2">
                  · {monthInfo.totalFines} days with fines
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {MONTHS.map((m, i) => {
              const isSelected = i === selectedMonth;
              const isCurrent = i === currentMonthIndex;
              return (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(i)}
                  className={`px-3 py-1 rounded-full text-xs font-medium tracking-wide transition-all duration-150
                    ${isSelected
                      ? "bg-violet-600 text-white shadow shadow-violet-300/40"
                      : isCurrent
                      ? "bg-violet-100 text-violet-700 border border-violet-300"
                      : "bg-slate-100/80 text-slate-500 hover:bg-violet-50 hover:text-violet-600 border border-slate-200/60"
                    }`}
                >
                  {m.slice(0, 3)}
                </button>
              );
            })}
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
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="text-center text-[10px] font-bold tracking-widest uppercase text-slate-400 py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((day, idx) => (
            <DayCell key={idx} day={day} data={day ? formattedData[day] : null} monthName={MONTHS[selectedMonth]} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlyDetails;