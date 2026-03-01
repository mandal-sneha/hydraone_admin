import { useNavigate } from "react-router-dom";

export const Home = () => {
  const navigate = useNavigate();

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
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-2 bg-slate-700 hover:bg-slate-600
            text-slate-100 text-xs tracking-widest font-medium
            rounded transition-all duration-200
            shadow-md shadow-slate-500/30
            hover:shadow-lg hover:shadow-slate-500/40
            active:translate-y-px
            focus:outline-none focus:ring-2 focus:ring-slate-400/50"
        >
          admin login
        </button>
      </nav>

      
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">

        <p className="text-[10px] tracking-[0.4em] uppercase text-slate-400 mb-5 select-none">
          Municipal Water Management
        </p>

        <h2 className="text-4xl sm:text-5xl font-semibold text-slate-700 tracking-wide leading-tight mb-5 drop-shadow-sm">
          Clean Water.<br />Managed Smarter.
        </h2>

        <p className="max-w-md text-slate-500 text-sm leading-relaxed">
          HydraOne is a unified platform for municipal water authorities to monitor,
          manage, and maintain water supply across residential properties — all in one place.
        </p>


      </main>

      
      <section className="relative z-10 px-8 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            {
              icon: "◈",
              title: "Municipality Access",
              desc: "Each admin gets a unique key tied to their municipality for secure, scoped access.",
            },
            {
              icon: "◉",
              title: "Property Tracking",
              desc: "View and manage all residential and apartment water connections under your zone.",
            },
            {
              icon: "◎",
              title: "Centralized Records",
              desc: "All water IDs, locations, and building types in one clean, organized dashboard.",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="relative bg-white/40 backdrop-blur-md border border-slate-300/60 rounded shadow-lg shadow-slate-400/20 px-6 py-6"
            >
              <div className="absolute top-0 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-slate-400/50 to-transparent rounded-b" />
              <p className="text-slate-400 text-xl mb-3 select-none">{icon}</p>
              <h3 className="text-sm font-semibold tracking-wide text-slate-700 mb-2">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      
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