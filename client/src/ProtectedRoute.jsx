import { Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

export default function ProtectedRoute({ children, role }) {
  // LocalStorage'daki tokenı çekiyoruz
  const token = localStorage.getItem("token");
  if (!token) {
    // Token yoksa → giriş sayfasına yönlendir
    return <Navigate to="/login" />;
  }

  try {
    // Tokenı decode ediyoruz
    const decoded = jwtDecode(token);

    // Role kontrolü yapıyoruz
    if (decoded.role !== role) {
      // Rol uyuşmuyorsa yine login'e at
      return <Navigate to="/login" />;
    }

    // Her şey okeyse → Çocuğu (sayfayı) render et
    return children;
  } catch (error) {
    console.error("Token çözümlenemedi:", error);
    // Token bozuksa da login'e at
    return <Navigate to="/login" />;
  }
}
