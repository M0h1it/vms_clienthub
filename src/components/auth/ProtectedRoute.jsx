import { Navigate } from "react-router-dom";

const SESSION_TIMEOUT = 30 * 60 * 1000;

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const lastActivity = localStorage.getItem("lastActivity");

  if (!token || !lastActivity) {
    return <Navigate to="/login" replace />;
  }

  const now = Date.now();

  // ✅ check expiry
  if (now - lastActivity > SESSION_TIMEOUT) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  return children;
}