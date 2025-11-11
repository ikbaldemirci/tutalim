import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import LoadingScreen from "./components/LoadingScreen";

export default function ProtectedRoute({ children, role }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
      } catch (err) {
        console.error("Token geçersiz:", err);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;

  try {
    const decoded = jwtDecode(token);

    if (role && decoded.role?.toLowerCase() !== role.toLowerCase()) {
      console.warn(
        `Rol uyuşmazlığı. Beklenen: ${role}, Bulunan: ${decoded.role}`
      );
      return <Navigate to="/" replace />;
    }

    return children;
  } catch {
    return <Navigate to="/" replace />;
  }
}
