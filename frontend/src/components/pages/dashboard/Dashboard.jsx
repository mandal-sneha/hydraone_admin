import { useNavigate } from "react-router-dom";

const waterData = [
  { id: "abc123", location: "Sector 4, Kolkata", buildingType: "Apartment" },
  { id: "xyz456", location: "Park Street, Kolkata", buildingType: "Personal Property" },
  { id: "mnp789", location: "New Town, Kolkata", buildingType: "Apartment" },
  { id: "qrs321", location: "Behala, Kolkata", buildingType: "Personal Property" },
  { id: "tuv654", location: "Tollygunge, Kolkata", buildingType: "Apartment" },
  { id: "wxy987", location: "Dum Dum, Kolkata", buildingType: "Personal Property" },
  { id: "def111", location: "Salt Lake, Kolkata", buildingType: "Apartment" },
  { id: "ghi222", location: "Gariahat, Kolkata", buildingType: "Personal Property" },
  { id: "jkl333", location: "Jadavpur, Kolkata", buildingType: "Apartment" },
];

const WaterCard = ({ entry, onDetails }) => (
  <div className="relative bg-white/50 backdrop-blur-md border border-slate-300/60 rounded shadow-lg shadow-slate-400/20 px-6 py-5 flex flex-col gap-1 hover:shadow-xl hover:shadow-slate-400/30 transition-all duration-200 group">
    
    <div className="absolute top-0 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-slate-400/50 to-transparent rounded-b" />

    <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-slate-400 select-none mb-1">
      Water ID
    </p>
    <p className="font-mono text-slate-700 text-sm tracking-widest font-semibold">
      {entry.id}
    </p>

    <div className="mt-3 space-y-1.5">
      <div>
        <span className="text-[10px] tracking-[0.2em] uppercase text-slate-400 select-none">Location</span>
        <p className="text-slate-600 text-sm mt-0.5">{entry.location}</p>
      </div>
      <div>
        <span className="text-[10px] tracking-[0.2em] uppercase text-slate-400 select-none">Building Type</span>
        <p className="text-slate-600 text-sm mt-0.5">{entry.buildingType}</p>
      </div>
    </div>

    <div className="mt-5">
      <button
        onClick={() => onDetails(entry)}
        className="px-5 py-1.5 bg-slate-700 hover:bg-slate-600
          text-slate-100 text-xs tracking-widest font-medium
          rounded transition-all duration-200
          shadow-md shadow-slate-500/30
          hover:shadow-lg hover:shadow-slate-500/40
          active:translate-y-px active:shadow-sm
          focus:outline-none focus:ring-2 focus:ring-slate-400/50"
      >
        see details
      </button>
    </div>
  </div>
);

export const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-slate-200">

      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-slate-300/50 blur-3xl" />
        <div className="absolute top-[30%] right-[10%] w-[35%] h-[35%] rounded-full bg-cyan-200/30 blur-2xl" />
        <div className="absolute bottom-[20%] left-[15%] w-[30%] h-[30%] rounded-full bg-blue-300/20 blur-2xl" />
      </div>

      
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-slate-300/50 bg-white/30 backdrop-blur-sm">
        <h1 className="text-xl font-semibold tracking-[0.3em] text-slate-700 drop-shadow-sm select-none">
          HYDRAONE
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-[10px] tracking-[0.2em] uppercase text-slate-400 select-none">
            Admin Dashboard
          </span>
        </div>
      </header>

      
      <main className="relative z-10 flex-1 px-8 py-8">
        <div className="mb-6">
          <p className="text-[10px] tracking-[0.3em] uppercase text-slate-400 select-none">
            {waterData.length} Records Found
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {waterData.map((entry) => (
            <WaterCard key={entry.id} entry={entry} onDetails={(e) => navigate("/house", { state: e, replace: true })} />
          ))}
        </div>
      </main>

      
      <footer className="relative z-10 py-4 text-center">
        <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 select-none">
          Admin Access Only
        </p>
      </footer>
    </div>
  );
};