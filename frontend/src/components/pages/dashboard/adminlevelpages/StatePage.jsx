import React from "react";
import { useNavigate } from "react-router-dom";

const StatePage = ({ data, area }) => {
  const navigate = useNavigate();

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-wide text-slate-700">
          Districts in <span className="text-slate-500">{area}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {data.map((item, index) => {
          const hasAdmin = !!item.adminName;
          return (
            <div
              key={index}
              onClick={
                hasAdmin
                  ? () => navigate(`/district/${encodeURIComponent(item.district)}`)
                  : undefined
              }
              title={!hasAdmin ? "No admin assigned — cannot view details" : undefined}
              className={`group relative bg-white/60 backdrop-blur-sm border rounded p-5 shadow-sm transition-all duration-200
                ${hasAdmin
                  ? "border-slate-200 cursor-pointer hover:border-slate-400 hover:shadow-md"
                  : "border-slate-200/50 cursor-not-allowed opacity-70 select-none"
                }`}
            >
              <div className="flex flex-col h-full justify-between gap-3">
                <div>
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-400">
                    District
                  </span>
                  <h3 className={`font-semibold text-sm transition-colors ${hasAdmin ? "text-slate-700 group-hover:text-blue-600" : "text-slate-400"}`}>
                    {item.district}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {item.municipalityCount} {item.municipalityCount === 1 ? "Municipality" : "Municipalities"}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[9px] tracking-[0.1em] uppercase text-slate-400 block mb-1">
                    Administrator
                  </span>
                  {hasAdmin ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <p className="text-xs font-medium text-slate-600 truncate">{item.adminName}</p>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 tracking-wider pl-3.5 truncate">
                        {item.adminKey}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <p className="text-[10px] italic text-rose-400 font-medium">No Admin Assigned</p>
                    </div>
                  )}
                </div>
              </div>

              {hasAdmin && (
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatePage;