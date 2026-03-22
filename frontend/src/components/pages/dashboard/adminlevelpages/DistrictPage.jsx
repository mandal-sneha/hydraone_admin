import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LOCATION_DATA } from "../../../../lib/locationData.js";

const DISTRICTS = [
  "Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur",
  "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram",
  "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia",
  "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur",
  "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas",
  "Uttar Dinajpur",
];

const DistrictPage = ({ data, area }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  if (data !== undefined && area !== undefined) {
    const filtered = data.filter((item) =>
      item.municipality.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div className="px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-wide text-slate-700">
            Municipalities in <span className="text-slate-500">{area}</span>
          </h2>
        </div>

        <div className="mb-6 max-w-xs">
          <input
            type="text"
            placeholder="Search municipality..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 text-xs tracking-wide rounded
              bg-white/40 backdrop-blur-md border border-slate-300/60
              text-slate-600 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-slate-400/40
              shadow-sm shadow-slate-400/10 transition-all duration-200"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((item, index) => (
            <div
              key={index}
              className="relative bg-white/60 backdrop-blur-sm border border-slate-200 rounded p-5 shadow-sm hover:shadow-md hover:border-slate-400 transition-all duration-200"
            >
              <div className="flex flex-col h-full justify-between gap-3">
                <div>
                  <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-400">
                    Municipality
                  </span>
                  <h3 className="text-slate-700 font-semibold text-sm">{item.municipality}</h3>
                </div>
                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[9px] tracking-[0.1em] uppercase text-slate-400 block mb-1">
                    Administrator
                  </span>
                  {item.adminName ? (
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
            </div>
          ))}
        </div>
      </div>
    );
  }

  const filtered = DISTRICTS.filter((d) =>
    d.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-slate-200">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-slate-300/50 blur-3xl" />
        <div className="absolute top-[30%] right-[10%] w-[35%] h-[35%] rounded-full bg-cyan-200/30 blur-2xl" />
        <div className="absolute bottom-[20%] left-[15%] w-[30%] h-[30%] rounded-full bg-blue-300/20 blur-2xl" />
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-slate-400/20"
            style={{
              width: `${30 + i * 18}%`,
              height: `${18 + i * 10}%`,
              animation: `ripple ${4 + i}s ease-in-out infinite`,
              animationDelay: `${i * 0.6}s`,
            }}
          />
        ))}
      </div>

      <nav className="relative z-10 flex items-center justify-between px-10 py-5 border-b border-slate-300/40 bg-white/20 backdrop-blur-sm">
        <h1 className="text-lg font-semibold tracking-[0.3em] text-slate-700 select-none">
          HYDRAONE
        </h1>
        <span className="text-xs tracking-widest font-medium text-slate-400 uppercase select-none">
          Admin Dashboard
        </span>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col px-8 py-8">
        <div className="mb-6">
          <p className="text-[10px] tracking-[0.4em] uppercase text-slate-400 mb-2 select-none">
            West Bengal
          </p>
          <h2 className="text-xl font-semibold text-slate-700 tracking-wide">
            Districts in <span className="text-cyan-600/80">West Bengal</span>
          </h2>
        </div>

        <div className="mb-7 max-w-xs">
          <input
            type="text"
            placeholder="Search district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 text-xs tracking-wide rounded
              bg-white/40 backdrop-blur-md border border-slate-300/60
              text-slate-600 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-slate-400/40
              shadow-sm shadow-slate-400/10 transition-all duration-200"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[11px] tracking-[0.35em] uppercase text-slate-400 select-none">
              No Districts Found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((district) => {
              const municipalityCount = (LOCATION_DATA["West Bengal"]?.[district] || []).length;
              return (
                <div
                  key={district}
                  className="relative bg-white/40 backdrop-blur-md border border-slate-300/60 rounded shadow-lg shadow-slate-400/20 px-5 py-5 flex flex-col gap-3"
                >
                  <div className="absolute top-0 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-slate-400/50 to-transparent rounded-b" />
                  <div>
                    <p className="text-sm font-semibold tracking-wide text-slate-700 leading-snug">
                      {district}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {municipalityCount} {municipalityCount === 1 ? "Municipality" : "Municipalities"}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      navigate(`/district/${district.toLowerCase().replace(/\s+/g, "-")}`)
                    }
                    className="self-start px-4 py-1.5 text-[10px] tracking-widest font-medium uppercase
                      border border-slate-400/60 text-slate-500 rounded
                      hover:bg-slate-700 hover:text-slate-100 hover:border-slate-700
                      active:translate-y-px transition-all duration-200
                      shadow-sm shadow-slate-400/20 focus:outline-none focus:ring-2 focus:ring-slate-400/40"
                  >
                    See Details
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <footer className="relative z-10 py-4 border-t border-slate-300/40 text-center bg-white/10 backdrop-blur-sm">
        <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 select-none">
          © 2025 HydraOne · Admin Access Only
        </p>
      </footer>

      <style>{`
        @keyframes ripple {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.12); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default DistrictPage;