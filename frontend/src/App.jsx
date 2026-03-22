import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/pages/landingpage/Home";
import LoginPage from "./components/pages/auth/LoginPage";
import Dashboard from "./components/pages/dashboard/Dashboard";
import MunicipalityPage from "./components/pages/dashboard/adminlevelpages/MunicipalityPage";
import FamiliesPage from "./components/pages/dashboard/adminlevelpages/FamiliesPage";
import { HouseDetails } from "./components/pages/housedetails/HouseDetails";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard/:stateName"
          element={
            <ProtectedRoute minLevel="state">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/district/:districtSlug"
          element={
            <ProtectedRoute minLevel="district">
              <MunicipalityPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/municipality/:municipalitySlug"
          element={
            <ProtectedRoute minLevel="municipality">
              <FamiliesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/house/:waterid"
          element={
            <ProtectedRoute minLevel="municipality">
              <HouseDetails />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;