import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { axiosInstance } from "../../../lib/axios.js"

const WaterCard = ({ entry, onDetails }) => {
  return (
    <div className="relative bg-white border border-slate-200 rounded shadow-lg shadow-slate-400/20 px-6 py-5 flex flex-col gap-1 hover:shadow-xl hover:shadow-slate-400/30 transition-all duration-200">
      <div className="absolute top-0 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-slate-400/50 to-transparent rounded-b" />

      <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-slate-400 mb-1">
        House Name
      </p>
      <p className="text-slate-700 text-sm font-semibold">
        {entry.propertyName}
      </p>

      <div className="mt-3 space-y-2">
        <div>
          <span className="text-[10px] tracking-[0.2em] uppercase text-slate-400">
            Water ID
          </span>
          <p className="font-mono text-slate-600 text-sm mt-0.5">
            {entry.waterId}
          </p>
        </div>

        <div>
          <span className="text-[10px] tracking-[0.2em] uppercase text-slate-400">
            Ward Number
          </span>
          <p className="text-slate-600 text-sm mt-0.5">
            Ward {entry.wardNumber}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <button
          onClick={() => onDetails(entry.waterId)}
          className="px-5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-100 text-xs tracking-widest font-medium rounded transition-all duration-200 shadow-md shadow-slate-500/30 hover:shadow-lg hover:shadow-slate-500/40"
        >
          see details
        </button>
      </div>
    </div>
  )
}

const Dashboard = () => {
  const navigate = useNavigate()
  const [families, setFamilies] = useState([])
  const [loading, setLoading] = useState(true)
  const [municipality, setMunicipality] = useState("")

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        const adminUser = JSON.parse(localStorage.getItem("adminUser"))
        const mun = adminUser?.municipality

        if (!mun) return

        setMunicipality(mun)

        const { data } = await axiosInstance.get(
          `/properties/${encodeURIComponent(mun)}/get-dashboard-content`
        )

        setFamilies(data.data || [])
      } catch (error) {
        setFamilies([])
      } finally {
        setLoading(false)
      }
    }

    fetchFamilies()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-slate-200">
      <header className="flex items-center justify-between px-8 py-5 border-b border-slate-300/50 bg-white/30 backdrop-blur-sm">
        <h1 className="text-xl font-semibold tracking-[0.3em] text-slate-700">
          HYDRAONE
        </h1>
        <span className="text-[10px] tracking-[0.2em] uppercase text-slate-400">
          Admin Dashboard
        </span>
      </header>

      <main className="flex-1 px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-wide text-slate-700">
            Families residing in{" "}
            <span className="text-slate-500">{municipality}</span>
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm tracking-widest uppercase text-slate-400 animate-pulse">
              Loading...
            </p>
          </div>
        ) : families.length === 0 ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-sm tracking-widest uppercase text-slate-400">
              No families found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {families.map((entry, index) => (
              <WaterCard
                key={index}
                entry={entry}
                onDetails={(waterId) => navigate(`/house/${waterId}`)}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="py-4 text-center">
        <p className="text-[10px] tracking-[0.2em] uppercase text-slate-400">
          Admin Access Only
        </p>
      </footer>
    </div>
  )
}

export default Dashboard;