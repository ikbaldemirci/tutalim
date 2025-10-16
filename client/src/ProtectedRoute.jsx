// import { Navigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import api from "./api"; // ⬅️ eklendi
// import { useEffect, useState } from "react";
// import { CircularProgress } from "@mui/material";

// export default function ProtectedRoute({ children, role }) {
//   const [verified, setVerified] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const checkToken = async () => {
//       const token = localStorage.getItem("token");

//       if (token === null) {
//         return (
//           <div style={{ textAlign: "center", marginTop: "20vh" }}>
//             <CircularProgress color="primary" />
//           </div>
//         );
//       }

//       if (!token) {
//         setLoading(false);
//         return;
//       }

//       try {
//         const decoded = jwtDecode(token);

//         // token süresi dolmuşsa backend’e refresh dene
//         if (!decoded.exp || decoded.exp * 1000 < Date.now()) {
//           console.warn("🔁 Token expired, refresh deniyor...");
//           try {
//             const res = await api.post(
//               "/refresh",
//               {},
//               { withCredentials: true }
//             );
//             if (res.data.status === "success") {
//               localStorage.setItem("token", res.data.token);
//               setVerified(true);
//             } else {
//               localStorage.removeItem("token");
//             }
//           } catch (refreshErr) {
//             console.error("Refresh başarısız:", refreshErr);
//             localStorage.removeItem("token");
//           }
//         } else {
//           setVerified(true);
//         }
//       } catch (err) {
//         console.error("Token geçersiz:", err);
//         localStorage.removeItem("token");
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkToken();
//   }, []);

//   if (loading) return null; // bekleme aşaması

//   const token = localStorage.getItem("token");
//   if (!token) return <Navigate to="/login" replace />;

//   try {
//     const decoded = jwtDecode(token);

//     if (role && decoded.role?.toLowerCase() !== role.toLowerCase()) {
//       console.warn(
//         `Rol uyuşmazlığı. Beklenen: ${role}, Bulunan: ${decoded.role}`
//       );
//       return <Navigate to="/login" replace />;
//     }

//     return children;
//   } catch {
//     return <Navigate to="/login" replace />;
//   }
// }

import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "./api";
import { useEffect, useState } from "react";
// import { Box, CircularProgress, Typography } from "@mui/material";
import LoadingScreen from "./components/LoadingScreen";

export default function ProtectedRoute({ children, role }) {
  const [verified, setVerified] = useState(false);
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

        // 🔹 Token süresi dolmuşsa refresh dene
        if (!decoded.exp || decoded.exp * 1000 < Date.now()) {
          console.warn("🔁 Token expired, refresh deneniyor...");
          try {
            const res = await api.post(
              "/refresh",
              {},
              { withCredentials: true }
            );
            if (res.data.status === "success") {
              localStorage.setItem("token", res.data.token);
              setVerified(true);
            } else {
              localStorage.removeItem("token");
            }
          } catch (refreshErr) {
            console.error("Refresh başarısız:", refreshErr);
            localStorage.removeItem("token");
          }
        } else {
          setVerified(true);
        }
      } catch (err) {
        console.error("Token geçersiz:", err);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkToken();
  }, []);

  // ⏳ Yükleniyor ekranı (effect dışında render edilir)
  if (loading) {
    return <LoadingScreen />;
  }

  // 🔐 Token yoksa
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" replace />;

  try {
    const decoded = jwtDecode(token);

    // 🔹 Rol uyuşmazlığı
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
