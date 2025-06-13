import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  if (!token || token === "undefined" || token === "null") {
    console.warn("Token eksik veya geçersiz:", token);
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    console.log("Decoded role:", decoded.role);

    if (decoded.role !== role) {
      return <Navigate to="/login" />;
    }

    return children;
  } catch (error) {
    console.error("Token çözümlenemedi:", error);
    return <Navigate to="/login" />;
  }
}
