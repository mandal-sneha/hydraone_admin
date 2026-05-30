import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../../../lib/axios.js";

function addHours(timeStr, hours) {
  if (!timeStr || !hours) return "—";
  const [time, modifier] = timeStr.split(" ");
  let [h, m] = time.split(":").map(Number);
  
  if (modifier === "PM" && h !== 12) h += 12;
  if (modifier === "AM" && h === 12) h = 0;
  
  let totalHours = h + parseInt(hours);
  let newHour = totalHours % 24;
  let newModifier = newHour >= 12 ? "PM" : "AM";
  newHour = newHour % 12;
  if (newHour === 0) newHour = 12;
  
  return `${newHour}:${String(m).padStart(2, "0")} ${newModifier}`;
}

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

const getStatusBadge = (status) => {
  if (status === 'arrived') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">Arrived</span>;
  if (status === 'accepted') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">Accepted</span>;
  if (status === 'declined') return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">Declined</span>;
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">Pending</span>;
};

const HouseInfo = () => {
  const { waterid } = useParams();
  const [property, setProperty] = useState(null);
  const [members, setMembers] = useState([]);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingMessage, setPendingMessage] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        
        const familyRes = await axiosInstance.get(`/properties/${waterid}/get-family-details`);
        if (familyRes.data.success) {
          setProperty(familyRes.data.data.property || null);
          setMembers(familyRes.data.data.members || []);
        }
      } catch (error) {
        console.error("Family fetch failed:", error);
      }

      try {
        const regRes = await axiosInstance.get(`/properties/${waterid}/get-water-registration-details-for-today`);
        if (regRes.data.success) {
          if (regRes.data.data.status === "pending") {
            setPendingMessage("Water registration request is pending approval from municipality. Guests will appear here after approval.");
            setRegistration(null);
          } else if (regRes.data.data.status === "rejected") {
            setPendingMessage("Water registration request was rejected. Please contact municipality for more information.");
            setRegistration(null);
          } else {
            setRegistration(regRes.data.data || null);
            setPendingMessage(null);
          }
        } else if (regRes.data.message === "No water registration found for today") {
          setPendingMessage("No water registration found for today.");
          setRegistration(null);
        }
      } catch (error) {
        console.error("Registration fetch failed:", error);
        setRegistration(null);
        setPendingMessage("Unable to load registration data.");
      }

      setLoading(false);
    };

    if (waterid) fetchAll();
  }, [waterid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  const slotLabels = { 8: "8 AM Slot", 12: "12 PM Slot", 15: "3 PM Slot" };
  
  const guestsBySlot = {
    "8 AM": [],
    "12 PM": [],
    "3 PM": []
  };

  if (registration && registration.guests && registration.guests.length > 0) {
    registration.guests.forEach(guest => {
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

  const memberProfileMap = members.reduce((acc, m) => {
    acc[m.userId] = m;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="relative rounded-2xl border border-slate-300/60 bg-white/60 backdrop-blur-sm shadow-sm shadow-slate-300/30 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-cyan-400 to-transparent" />
        <div className="px-6 pt-5 pb-6">
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-blue-500 mb-4">Property Info</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 mb-0.5">Water ID</p>
              <p className="font-mono font-semibold text-slate-700">{waterid}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 mb-0.5">Property ID</p>
              <p className="font-mono font-semibold text-slate-700">{property?.id ?? "—"}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 mb-0.5">Property Type</p>
              <p className="font-semibold text-slate-700">{property?.typeOfProperty ?? "—"}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 mb-0.5">Ward Number</p>
              <p className="font-semibold text-slate-700">{property?.wardNumber ?? "—"}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 mb-0.5">Municipality</p>
              <p className="font-semibold text-slate-700">{property?.municipality ?? "—"}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 mb-0.5">District</p>
              <p className="font-semibold text-slate-700">{property?.district ?? "—"}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 mb-0.5">No. of Tenants</p>
              <p className="font-semibold text-slate-700">{property?.numberOfTenants ?? "—"}</p>
            </div>
          </div>

          {members.length > 0 && (
            <div className="mt-6">
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 mb-3">Family Members</p>
              <div className="flex flex-col gap-2">
                {members.map((member, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                    <img src={member.userProfilePhoto} alt={member.userName} className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-700">{member.userName}</span>
                      <span className="text-[10px] tracking-[0.15em] uppercase text-slate-400 font-mono">{member.userId}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative rounded-2xl border border-slate-300/60 bg-white/60 backdrop-blur-sm shadow-sm shadow-slate-300/30 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-transparent" />
        <div className="px-6 pt-5 pb-6">
          <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-amber-600 mb-1">Today's Water Registration</p>

          {pendingMessage ? (
            <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm text-center">
              {pendingMessage}
            </div>
          ) : !registration ? (
            <p className="text-sm text-slate-400 tracking-wide mt-3">No registration found for today.</p>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs font-semibold text-slate-600 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
                  {slotLabels[registration.slot] ?? `Slot ${registration.slot}`}
                </span>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${registration.extraWaterRequested ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-slate-100 text-slate-400 border-slate-200"}`}>
                  {registration.extraWaterRequested ? "Extra Water Requested" : "No Extra Water"}
                </span>
              </div>

              {registration.members && registration.members.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white/70 overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-200">
                    <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500">Primary Members</span>
                  </div>
                  {registration.members.map((member, i) => {
                    const profile = memberProfileMap[member.userId];
                    return (
                      <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-2.5">
                          {profile?.userProfilePhoto && (
                            <img src={profile.userProfilePhoto} alt={member.userName} className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0" />
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
                    );
                  })}
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
                                    <span className="font-medium">Leaves:</span> {addHours(guest.arrivalTime, guest.stayDuration)}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HouseInfo;