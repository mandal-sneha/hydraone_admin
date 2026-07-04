import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../../../lib/axios.js";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const getSlotFromTime = (timeStr) => {
  if (!timeStr) return "3 PM";
  const [time, modifier] = timeStr.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (modifier === "PM" && h !== 12) h += 12;
  if (modifier === "AM" && h === 12) h = 0;
  if (h < 8) return "8 AM";
  if (h < 12) return "12 PM";
  if (h < 15) return "3 PM";
  return "3 PM";
};

const formatTimeDisplay = (timeStr) => {
  if (!timeStr) return "—";
  const [time, modifier] = timeStr.split(" ");
  let [h, m] = time.split(":").map(Number);
  let displayHour = h;
  let displayModifier = modifier;
  
  if (!modifier) {
    displayModifier = h >= 12 ? "PM" : "AM";
    displayHour = h % 12 === 0 ? 12 : h % 12;
  }
  
  return `${displayHour}:${String(m).padStart(2, "0")} ${displayModifier}`;
};

const DayCell = ({ day, data, monthName, year, waterid, onDayClick }) => {
  if (!day) return <div className="min-h-[52px]" />;

  const hasFine = data?.hasFine === true;
  const waterUsed = data?.waterUsed || 0;
  const normalGuests = data?.normalGuests || 0;
  const fraudulentGuests = data?.fraudulentGuests || [];

  let cellCls = "bg-white/50 border-slate-200/60";
  if (hasFine) cellCls = "bg-red-50/80 border-red-300/70";

  const handleClick = () => {
    const date = new Date(year, MONTHS.indexOf(monthName), day);
    onDayClick(date, data);
  };

  return (
    <div
      onClick={handleClick}
      className={`rounded-lg border px-1.5 py-1.5 cursor-pointer select-none transition-all duration-150
        ${cellCls} min-h-[52px] hover:shadow-md hover:scale-105`}
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
  );
};

const DayDetailsPopup = ({ isOpen, onClose, date, dayData, waterid }) => {
  const [loading, setLoading] = useState(false);
  const [registrationDetails, setRegistrationDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && date && waterid) {
      fetchDayRegistration();
    }
  }, [isOpen, date, waterid]);

  const fetchDayRegistration = async () => {
    setLoading(true);
    setError(null);
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const response = await axiosInstance.get(`/properties/${waterid}/get-water-registration-for-date`, {
        params: { date: dateStr }
      });
      
      if (response.data.success) {
        setRegistrationDetails(response.data.data);
      } else {
        setRegistrationDetails(null);
        setError(response.data.message || "No registration data available");
      }
    } catch (err) {
      console.error("Error fetching day registration:", err);
      setError(err.response?.data?.message || "Failed to load registration details");
      setRegistrationDetails(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const slotLabels = { 8: "8 AM Slot", 12: "12 PM Slot", 15: "3 PM Slot" };
  const formattedDate = date ? date.toLocaleDateString('en-GB', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }) : "";

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const guestsBySlot = {
    "8 AM": [],
    "12 PM": [],
    "3 PM": []
  };

  if (registrationDetails && registrationDetails.guests && registrationDetails.guests.length > 0) {
    registrationDetails.guests.forEach(guest => {
      if (guest.arrivalTime) {
        const slot = getSlotFromTime(guest.arrivalTime);
        if (slot === "8 AM") guestsBySlot["8 AM"].push(guest);
        else if (slot === "12 PM") guestsBySlot["12 PM"].push(guest);
        else guestsBySlot["3 PM"].push(guest);
      } else {
        guestsBySlot["8 AM"].push(guest);
      }
    });
  }

  const getStatusBadge = (status) => {
    if (status === 'arrived') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Arrived</span>;
    if (status === 'accepted') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">Accepted</span>;
    if (status === 'declined') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">Declined</span>;
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Pending</span>;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="relative bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl mx-4">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Water Registration Details</h3>
            <p className="text-sm text-slate-500">{formattedDate}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-amber-600 text-sm">{error}</div>
              {dayData && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium text-slate-700">Water Used:</span> {dayData.waterUsed || 0} L</p>
                    <p><span className="font-medium text-slate-700">Normal Guests:</span> {dayData.normalGuests || 0}</p>
                    {dayData.hasFine && (
                      <p className="text-red-600"><span className="font-medium">Fine Applied:</span> ₹{dayData.fineAmount || 500}</p>
                    )}
                    {dayData.fraudulentGuests && dayData.fraudulentGuests.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium text-red-600 mb-1">Fraudulent Guests:</p>
                        {dayData.fraudulentGuests.map((guest, idx) => (
                          <div key={idx} className="ml-4 text-sm text-red-500">
                            {guest.guestName} ({guest.guestId}) - Exit at {guest.actualExit}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : registrationDetails ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-600 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
                  {slotLabels[registrationDetails.slot] ?? `Slot ${registrationDetails.slot}`}
                </span>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${registrationDetails.extraWaterRequested ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-slate-100 text-slate-400 border-slate-200"}`}>
                  {registrationDetails.extraWaterRequested ? "Extra Water Requested" : "No Extra Water"}
                </span>
              </div>

              {registrationDetails.members && registrationDetails.members.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white/70 overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">Primary Members</span>
                  </div>
                  {registrationDetails.members.map((member, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-2.5">
                        {member.userProfilePhoto && (
                          <img src={member.userProfilePhoto} alt={member.userName} className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-700">{member.userName}</span>
                          <span className="text-[10px] font-mono text-slate-400">{member.userId}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">Member</span>
                        {member.isSpecial && (
                          <span className="text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full bg-violet-50 text-violet-500 border border-violet-200">Special</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <div className="bg-slate-100 px-4 py-2 rounded-t-xl border border-slate-200 border-b-0">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">Guests by Slot</span>
                </div>
                
                {["8 AM", "12 PM", "3 PM"].map(slot => (
                  <div key={slot} className="border border-slate-200 border-t-0">
                    <div className="bg-amber-50/50 px-4 py-2 border-b border-slate-200">
                      <span className="text-xs font-semibold text-amber-700">{slot}</span>
                      <span className="text-[10px] text-slate-400 ml-2">({guestsBySlot[slot].length} guests)</span>
                    </div>
                    <div>
                      {guestsBySlot[slot].length === 0 ? (
                        <div className="px-4 py-3 text-xs text-slate-400 italic">No guests scheduled for this slot</div>
                      ) : (
                        guestsBySlot[slot].map((guest, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <img src={guest.userProfilePhoto || "https://via.placeholder.com/32"} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-semibold text-slate-700">{guest.userName}</span>
                                    {getStatusBadge(guest.status)}
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400">{guest.userId}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              {guest.arrivalTime && (
                                <>
                                  <div className="text-xs text-slate-500">
                                    <span className="font-medium">Arrives:</span> {formatTimeDisplay(guest.arrivalTime)}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    <span className="font-medium">Status:</span> {guest.status}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {dayData && dayData.hasFine && (
                <div className="rounded-xl border border-red-200 bg-red-50/50 p-4">
                  <p className="text-sm font-semibold text-red-700 mb-2">⚠️ Fine Applied</p>
                  <p className="text-sm text-red-600">Amount: ₹{dayData.fineAmount || 500}</p>
                  {dayData.fraudulentGuests && dayData.fraudulentGuests.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-red-700 mb-1">Fraud Details:</p>
                      {dayData.fraudulentGuests.map((guest, idx) => (
                        <div key={idx} className="ml-4 text-sm text-red-600">
                          {guest.guestName} ({guest.guestId}) - Early exit at {guest.actualExit} (scheduled: {guest.scheduledExit})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500">
              No registration data available for this date
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MonthlyDetails = () => {
  const { waterid } = useParams();
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIndex = today.getMonth();
  const [selectedMonth, setSelectedMonth] = useState(currentMonthIndex);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [apiData, setApiData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayData, setSelectedDayData] = useState(null);

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

  const handleDayClick = (date, dayData) => {
    setSelectedDate(date);
    setSelectedDayData(dayData);
    setPopupOpen(true);
  };

  const closePopup = () => {
    setPopupOpen(false);
    setSelectedDate(null);
    setSelectedDayData(null);
  };

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

  const calculatedTotalUsage = monthInfo.days.reduce((sum, day) => sum + (day.waterUsed || 0), 0);
  const displayTotalUsage = monthInfo.totalUsage || calculatedTotalUsage;

  let daysInMonth = DAYS_IN_MONTH[selectedMonth];
  if (selectedMonth === 1 && (selectedYear % 4 === 0 && selectedYear % 100 !== 0 || selectedYear % 400 === 0)) {
    daysInMonth = 29;
  }
  
  const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay();

  const cells = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const handleMonthChange = (monthIndex) => {
    setSelectedMonth(monthIndex);
    if (monthIndex === 11 && selectedMonth === 0) {
      setSelectedYear(selectedYear - 1);
    } else if (monthIndex === 0 && selectedMonth === 11) {
      setSelectedYear(selectedYear + 1);
    }
  };

  return (
    <>
      <div className="relative rounded-2xl border border-slate-300/60 bg-white/60 backdrop-blur-sm shadow-sm shadow-slate-300/30 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-400 via-purple-400 to-transparent" />

        <div className="px-6 pt-5 pb-4">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-violet-600">Monthly Details</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Total Usage: <span className="font-bold text-blue-600">{displayTotalUsage}L</span> 
                {monthInfo.totalFines > 0 && (
                  <span className="text-red-400 ml-2">
                    · {monthInfo.totalFines} days with fines
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMonthChange(selectedMonth - 1)}
                className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm"
              >
                ←
              </button>
              <div className="flex flex-wrap gap-1.5">
                {MONTHS.map((m, i) => {
                  const isSelected = i === selectedMonth;
                  const isCurrent = i === currentMonthIndex && selectedYear === currentYear;
                  return (
                    <button
                      key={m}
                      onClick={() => handleMonthChange(i)}
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
              <button
                onClick={() => handleMonthChange(selectedMonth + 1)}
                className="px-2 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm"
              >
                →
              </button>
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
          <span className="text-slate-400 italic">Click a day for full details</span>
        </div>

        <div className="px-6 pb-6">
          <div className="text-center text-sm text-slate-600 mb-2 font-medium">
            {MONTHS[selectedMonth]} {selectedYear}
          </div>
          <div className="grid grid-cols-7 gap-1.5 mb-1.5">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="text-center text-[10px] font-bold tracking-widest uppercase text-slate-400 py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((day, idx) => (
              <DayCell 
                key={idx} 
                day={day} 
                data={day ? formattedData[day] : null} 
                monthName={MONTHS[selectedMonth]}
                year={selectedYear}
                waterid={waterid}
                onDayClick={handleDayClick}
              />
            ))}
          </div>
        </div>
      </div>

      <DayDetailsPopup
        isOpen={popupOpen}
        onClose={closePopup}
        date={selectedDate}
        dayData={selectedDayData}
        waterid={waterid}
      />
    </>
  );
};

export default MonthlyDetails;