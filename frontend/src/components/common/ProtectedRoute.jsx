import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isAuthenticated = false; // TODO: replace with real auth check (JWT cookie / authSlice) once backend's connected
  return isAuthenticated ? children : <Navigate to="/admin/login" replace />;
}
