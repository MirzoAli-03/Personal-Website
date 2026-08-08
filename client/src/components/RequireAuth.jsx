import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function RequireAuth({ children }) {
  const { user } = useApp();
  const location = useLocation();

  if (!user) {
    // Remember where they were headed so login can send them back.
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}
