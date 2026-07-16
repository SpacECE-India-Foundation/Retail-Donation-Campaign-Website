import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentAdmin } from "../../services/authService";

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    getCurrentAdmin()
      .then(() => setStatus("authenticated"))
      .catch(() => setStatus("unauthenticated"));
  }, []);

  if (status === "checking") return <div>Checking session...</div>;
  return status === "authenticated" ? children : <Navigate to="/admin/login" replace />;
}
