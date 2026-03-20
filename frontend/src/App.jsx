import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./components/pages/landingpage/Home";
import { LoginPage } from "./components/pages/auth/LoginPage";
import Dashboard from "./components/pages/dashboard/Dashboard";
import { DistrictPage } from "./components/pages/dashboard/DistrictPage";
import { MunicipalityPage } from "./components/pages/dashboard/MunicipalityPage";
import { HouseDetails } from "./components/pages/housedetails/HouseDetails";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/districts"
          element={
            <ProtectedRoute>
              <DistrictPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/district/:districtSlug"
          element={
            <ProtectedRoute>
              <MunicipalityPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/house/:waterid"
          element={
            <ProtectedRoute>
              <HouseDetails />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;