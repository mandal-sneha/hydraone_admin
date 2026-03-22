import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../../../lib/axios.js";

const LoginPage = () => {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!key || loading) return;

    try {
      setLoading(true);

      const { data } = await axiosInstance.post("/auth/verify-admin-key", {
        adminKey: key,
      });

      localStorage.setItem("adminToken", data.token);

      const adminUser = {};
      if (data.data.adminName) adminUser.name = data.data.adminName;
      if (data.data.adminLevel) adminUser.adminLevel = data.data.adminLevel;
      if (data.data.municipality) adminUser.municipality = data.data.municipality;
      if (data.data.district) adminUser.district = data.data.district;
      if (data.data.state) adminUser.state = data.data.state;

      localStorage.setItem("adminUser", JSON.stringify(adminUser));

      const level = data.data.adminLevel;
      if (level === "state" && data.data.state) {
        navigate(`/dashboard/${encodeURIComponent(data.data.state)}`, { replace: true });
      } else if (level === "district" && data.data.district) {
        navigate(`/district/${encodeURIComponent(data.data.district)}`, { replace: true });
      } else if (level === "municipality" && data.data.municipality) {
        navigate(`/municipality/${encodeURIComponent(data.data.municipality)}`, { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    } catch (err) {
      setError("Invalid key. Access denied.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  const handleChange = (e) => {
    setKey(e.target.value);
    if (error) setError("");
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-200">
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

      <div className={`relative z-10 w-full max-w-sm px-8 py-10 bg-white/30 backdrop-blur-md border border-slate-300/60 rounded shadow-xl shadow-slate-400/20 ${shake ? "animate-shake" : ""}`}>
        <div className="mb-8 text-center">
          <h1 className="text-lg font-semibold tracking-[0.3em] text-slate-700 select-none mb-1">
            HYDRAONE
          </h1>
          <p className="text-[10px] tracking-[0.3em] uppercase text-slate-400 select-none">
            Admin Access
          </p>
        </div>

        <div className="mb-2">
          <label className="block text-[10px] tracking-[0.2em] uppercase text-slate-400 mb-2 select-none">
            Admin Key
          </label>
          <input
            type="text"
            value={key}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Enter your admin key..."
            className="w-full px-4 py-2.5 text-xs tracking-wide rounded
              bg-white/50 backdrop-blur-md border border-slate-300/60
              text-slate-600 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-slate-400/40
              shadow-sm shadow-slate-400/10 transition-all duration-200"
          />
        </div>

        {error && (
          <p className="mt-1.5 text-xs text-red-500/80 tracking-wide">
            {error}
          </p>
        )}

        <div className="mt-7 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-10 py-2.5 bg-slate-700 hover:bg-slate-600
              text-slate-100 text-sm tracking-widest font-medium
              rounded transition-all duration-200
              shadow-md shadow-slate-500/30
              hover:shadow-lg hover:shadow-slate-500/40
              active:translate-y-px active:shadow-sm
              focus:outline-none focus:ring-2 focus:ring-slate-400/50
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "processing..." : "submit"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes ripple {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.12); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.45s ease-in-out; }
      `}</style>
    </div>
  );
};

export default LoginPage;