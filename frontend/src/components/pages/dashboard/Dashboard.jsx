import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../../lib/axios.js";
import StatePage from "./adminlevelpages/StatePage.jsx";

const Dashboard = () => {
  const navigate = useNavigate();
  const { stateName } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminConfig, setAdminConfig] = useState({
    areaName: "",
    userName: ""
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const adminUser = JSON.parse(localStorage.getItem("adminUser"));
        const area = decodeURIComponent(stateName || "");

        setAdminConfig({
          areaName: area,
          userName: adminUser?.name || ""
        });

        const { data } = await axiosInstance.get(
          `/properties/${encodeURIComponent("state")}/${encodeURIComponent(area)}/get-dashboard-content`
        );

        setData(data.data || []);
      } catch (error) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [stateName]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/login", { replace: true });
  };

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
        <div className="flex items-center gap-6">
          {adminConfig.userName && (
            <span className="text-xs tracking-widest text-slate-500 uppercase select-none hidden sm:block">
              {adminConfig.userName}
            </span>
          )}
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600
              text-slate-100 text-xs tracking-widest font-medium
              rounded transition-all duration-200
              shadow-md shadow-slate-500/30
              hover:shadow-lg hover:shadow-slate-500/40
              active:translate-y-px
              focus:outline-none focus:ring-2 focus:ring-slate-400/50"
          >
            Log Out
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm tracking-widest uppercase text-slate-400 animate-pulse">
              Loading...
            </p>
          </div>
        ) : (
          <StatePage data={data} area={adminConfig.areaName} />
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

export default Dashboard;