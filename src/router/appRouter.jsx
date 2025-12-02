import { BrowserRouter, Routes, Route } from "react-router-dom";
import Register from "../Components/Signup_Signin/Signup_Signin";
import Dashboard from "../Components/Dashboard/dashboard";
import Navbar from "../Components/Navbar/Navbar";
import ProtectedRoute from "./protectedRoute";


export default function AppRouter({ setThemeMode }) {
  return (
    
    <BrowserRouter>
      <Navbar setThemeMode={setThemeMode} />

      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Register />} />

        {/* Protected Route */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
