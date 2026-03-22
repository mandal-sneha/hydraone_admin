import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../../../lib/axios.js";

const FamiliesPage = () => {
  const { municipalitySlug } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [adminUser, setAdminUser] = useState(null);
  const municipalityName = decodeURIComponent(municipalitySlug || "");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("adminUser"));
    setAdminUser(user);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `/properties/municipality/${encodeURIComponent(municipalityName)}/get-dashboard-content`
        );
        setData(res.data.data || []);
      } catch (error) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    if (municipalityName) fetchData();
  }, [municipalityName]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/login", { replace: true });
  };

  const filtered = data.filter(
    (item) =>
      item.waterId?.toLowerCase().includes(search.toLowerCase()) ||
      item.propertyName?.toLowerCase().includes(search.toLowerCase()) ||
      String(item.wardNumber)?.includes(search)
  );

  const isMunicipalityAdmin = adminUser?.adminLevel === "municipality";

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-slate-200">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[55%] h-[55%] rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-slate-300/50 blur-3xl" />
        <div className="absolute top-[30%] right-[10%] w-[35%] h-[35%] rounded-full bg-cyan-200/30 blur-2xl" />
        <div className="absolute bottom-[20%] left-[15%] w-[30%] h-[30%] rounded-full bg-blue-300/20 blur-2xl" />
      </div>
      <nav className="relative z-10 flex items-center justify-between px-10 py-5 border-b border-slate-300/40 bg-white/20 backdrop-blur-sm">
        <h1 className="text-lg font-semibold tracking-[0.3em] text-slate-700 select-none">HYDRAONE</h1>
        <div className="flex items-center gap-6">
          {adminUser?.name && (
            <span className="text-xs tracking-widest text-slate-500 uppercase select-none hidden sm:block">
              {adminUser.name}
            </span>
          )}
          <button onClick={handleLogout} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs tracking-widest font-medium rounded transition-all duration-200 shadow-md shadow-slate-500/30 hover:shadow-lg hover:shadow-slate-500/40 active:translate-y-px focus:outline-none focus:ring-2 focus:ring-slate-400/50">
            Log Out
          </button>
        </div>
      </nav>
      <main className="relative z-10 flex-1 flex flex-col px-8 py-8">
        {!isMunicipalityAdmin && (
          <button onClick={() => navigate(-1)} className="self-start mb-6 flex items-center gap-2 text-[10px] tracking-widest uppercase text-slate-400 hover:text-slate-600 transition-colors duration-200">
            ← Back to Municipalities
          </button>
        )}
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-wide text-slate-700">
            Families in <span className="text-slate-500">{municipalityName}</span>
          </h2>
        </div>
        <div className="mb-6 max-w-xs">
          <input type="text" placeholder="Search by water ID, property or ward..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 text-xs tracking-wide rounded bg-white/40 backdrop-blur-md border border-slate-300/60 text-slate-600 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400/40 shadow-sm shadow-slate-400/10 transition-all duration-200"
          />
        </div>
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm tracking-widest uppercase text-slate-400 animate-pulse">Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-[11px] tracking-[0.35em] uppercase text-slate-400 select-none">No Families Found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((item, index) => (
              <div key={index} onClick={() => navigate(`/house/${item.waterId}`)}
                className="group relative bg-white/60 backdrop-blur-sm border border-slate-200 rounded p-5 cursor-pointer hover:border-slate-400 transition-all duration-200 shadow-sm hover:shadow-md">
                <div className="flex flex-col h-full justify-between gap-3">
                  <div>
                    <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-slate-400">Water ID</span>
                    <h3 className="text-slate-700 font-mono font-semibold text-sm group-hover:text-blue-600 transition-colors truncate">{item.waterId}</h3>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex flex-col gap-1.5">
                    <div>
                      <span className="text-[9px] tracking-[0.1em] uppercase text-slate-400 block">Property</span>
                      <p className="text-xs text-slate-600 font-medium truncate">{item.propertyName || "—"}</p>
                    </div>
                    <div>
                      <span className="text-[9px] tracking-[0.1em] uppercase text-slate-400 block">Ward</span>
                      <p className="text-xs text-slate-600 font-medium">Ward {item.wardNumber ?? "—"}</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <footer className="relative z-10 py-4 border-t border-slate-300/40 text-center bg-white/10 backdrop-blur-sm">
        <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400 select-none">© 2025 HydraOne · Admin Access Only</p>
      </footer>
      <style>{`@keyframes ripple { 0%, 100% { transform: scale(1); opacity: 0.5; } 50% { transform: scale(1.12); opacity: 1; } }`}</style>
    </div>
  );
};

export default FamiliesPage;