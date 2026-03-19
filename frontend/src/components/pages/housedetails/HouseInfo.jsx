import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../../../lib/axios.js";

function addMinutes(timeStr, mins) {
  if (!timeStr || !mins) return "—";
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + Number(mins);
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

const HouseInfo = () => {
  const { waterid } = useParams();
  const [property, setProperty] = useState(null);
  const [members, setMembers] = useState([]);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);

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
          setRegistration(regRes.data.data || null);
        }
      } catch (error) {
        setRegistration(null);
      } finally {
        setLoading(false);
      }
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

  const slotLabels = { 1: "Morning Slot", 2: "Afternoon Slot", 3: "Evening Slot" };

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
                    <img
                      src={member.userProfilePhoto}
                      alt={member.userName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                    />
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

          {!registration ? (
            <p className="text-sm text-slate-400 tracking-wide mt-3">No registration found for today.</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs font-semibold text-slate-600 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
                  {slotLabels[registration.slot] ?? `Slot ${registration.slot}`}
                </span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${registration.extraWaterRequested ? "bg-blue-50 text-blue-600 border-blue-200" : "bg-slate-100 text-slate-400 border-slate-200"}`}>
                  {registration.extraWaterRequested ? "Extra Water Requested" : "No Extra Water"}
                </span>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white/70 overflow-hidden">
                {registration.members?.map((member, i) => {
                  const profile = memberProfileMap[member.userId];
                  return (
                    <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-2.5">
                        {profile?.userProfilePhoto && (
                          <img
                            src={profile.userProfilePhoto}
                            alt={member.userName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 flex-shrink-0"
                          />
                        )}
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-700">{member.userName}</span>
                          <span className="text-[10px] font-mono text-slate-400">{member.userId}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                          Member
                        </span>
                        {member.isSpecial && (
                          <span className="text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full bg-violet-50 text-violet-500 border border-violet-200">
                            Special
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {registration.guests?.map((guest, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-700">{guest.userName}</span>
                      <span className="text-[10px] font-mono text-slate-400">{guest.userId}</span>
                      <div className="flex gap-3 mt-1">
                        <span className="text-[10px] text-slate-400">
                          <span className="uppercase tracking-wide mr-1">Arrives</span>
                          <span className="font-medium text-slate-600">{guest.arrivalTime ?? "—"}</span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          <span className="uppercase tracking-wide mr-1">Leaves</span>
                          <span className="font-medium text-slate-600">{addMinutes(guest.arrivalTime, guest.stayDuration)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full border
                        ${guest.status === "arrived"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : "bg-amber-50 text-amber-600 border-amber-200"
                        }`}>
                        {guest.status}
                      </span>
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