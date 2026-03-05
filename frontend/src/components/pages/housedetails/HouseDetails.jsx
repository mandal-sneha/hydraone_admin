import { useNavigate, useLocation } from "react-router-dom";
import { HouseInfo } from "./HouseInfo";
import { MonthlyDetails } from "./MonthlyDetails";

export const HouseDetails = () => {
  const navigate = useNavigate();
  const { state: entry } = useLocation();

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
        <h1
          className="text-lg font-semibold tracking-[0.3em] text-slate-700 select-none cursor-pointer"
          onClick={() => navigate("/")}
        >
          HYDRAONE
        </h1>
        <button
          onClick={() => navigate("/dashboard", { replace: true })}
          className="px-6 py-2 bg-slate-700 hover:bg-slate-600
            text-slate-100 text-xs tracking-widest font-medium
            rounded transition-all duration-200
            shadow-md shadow-slate-500/30
            hover:shadow-lg hover:shadow-slate-500/40
            active:translate-y-px
            focus:outline-none focus:ring-2 focus:ring-slate-400/50"
        >
          ← dashboard
        </button>
      </nav>

      <main className="relative z-10 flex-1 px-6 sm:px-10 py-8 max-w-4xl mx-auto w-full space-y-5">
        <HouseInfo />
        <MonthlyDetails />
      </main>

      <style>{`
        @keyframes ripple {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.12); opacity: 1; }
        }
      `}</style>
    </div>
  );
};