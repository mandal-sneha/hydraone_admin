import { Navigate } from "react-router-dom"

const LEVEL_RANK = {
  state: 3,
  district: 2,
  municipality: 1,
}

const decodeJWT = (token) => {
  try {
    const payload = token.split(".")[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

const getHomeForLevel = (decoded) => {
  const level = decoded?.adminLevel
  if (level === "state" && decoded?.state)
    return `/dashboard/${encodeURIComponent(decoded.state)}`
  if (level === "district" && decoded?.district)
    return `/district/${encodeURIComponent(decoded.district)}`
  if (level === "municipality" && decoded?.municipality)
    return `/municipality/${encodeURIComponent(decoded.municipality)}`
  return "/login"
}

const ProtectedRoute = ({ children, minLevel }) => {
  const token = localStorage.getItem("adminToken")

  if (!token) {
    return <Navigate to="/login" replace />
  }

  const decoded = decodeJWT(token)

  if (!decoded) {
    return <Navigate to="/login" replace />
  }

  if (minLevel) {
    const userRank = LEVEL_RANK[decoded.adminLevel] ?? 0
    const requiredRank = LEVEL_RANK[minLevel] ?? 0
    if (userRank < requiredRank) {
      return <Navigate to={getHomeForLevel(decoded)} replace />
    }
  }

  return children
}

export default ProtectedRoute