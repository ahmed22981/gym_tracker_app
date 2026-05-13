import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { token } = useAuth();

  // If there is no token, send them to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the requested page (Outlet)
  return <Outlet />;
}