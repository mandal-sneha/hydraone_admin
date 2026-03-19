import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { axiosInstance } from "../../../lib/axios.js"

export const LoginPage = () => {
  const [key, setKey] = useState("")
  const [error, setError] = useState("")
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!key || loading) return

    try {
      setLoading(true)

      const { data } = await axiosInstance.post("/auth/verify-admin-key", {
        adminKey: key
      })

      localStorage.setItem("adminToken", data.token)
      localStorage.setItem(
        "adminUser",
        JSON.stringify({
          name: data.data.adminName,
          ward: data.data.ward,
          municipality: data.data.municipality,
          district: data.data.district
        })
      )

      navigate("/dashboard", { replace: true })
    } catch (err) {
      setError("Invalid key. Access denied.")
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit()
  }

  const handleChange = (e) => {
    const val = e.target.value.replace(/[^a-zA-Z0-9]/g, "")
    setKey(val)
    if (error) setError("")
  }

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
              animationDelay: `${i * 0.6}s`
            }}
          />
        ))}
      </div>

      <h1 className="relative z-10 mb-10 text-3xl font-semibold tracking-[0.3em] text-slate-700 drop-shadow-sm select-none">
        HYDRAONE
      </h1>

      <div
        className={`relative z-10 w-full max-w-md mx-4 px-12 py-10
          bg-white/50 backdrop-blur-md
          border border-slate-300/60
          rounded shadow-xl shadow-slate-400/20
          ${shake ? "animate-shake" : ""}
        `}
      >
        <div className="absolute top-0 left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-transparent via-slate-400/50 to-transparent rounded-b" />

        <label className="block mb-2 text-sm font-medium tracking-wide text-slate-600">
          Enter the key
        </label>

        <input
          type="text"
          value={key}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          maxLength={32}
          autoFocus
          disabled={loading}
          className={`w-full px-3 py-2 bg-white/80 rounded
            border text-slate-800 font-mono tracking-widest text-sm
            outline-none transition-all duration-200
            focus:ring-2 focus:ring-slate-400/40 focus:border-slate-400
            placeholder:text-slate-300
            ${
              error
                ? "border-red-300 focus:ring-red-200/40 focus:border-red-300"
                : "border-slate-300/80"
            }
          `}
        />

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
  )
}