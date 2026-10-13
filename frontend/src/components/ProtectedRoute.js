import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { clearSession, sessionValid, useSession } from "../lib/api";

export default function ProtectedRoute({ children }) {
  const token = useSession();
  const loc = useLocation();
  const ok = Boolean(token) && sessionValid();
  // A token without a matching user (older version / deleted account) is cleared.
  useEffect(() => { if (token && !ok) clearSession(); }, [token, ok]);
  return ok ? children : <Navigate to="/login" replace state={{ from: loc.pathname }} />;
}
