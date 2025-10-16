// import { useEffect, useState } from "react";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import Navbar from "../components/Navbar";
// import {
//   Typography,
//   CircularProgress,
//   Box,
//   Container,
//   Paper,
// } from "@mui/material";
// import BasicTable from "../components/BasicTable";
// import WelcomeHeader from "../components/WelcomeHeader";

// function OwnerHome() {
//   const token = localStorage.getItem("token");
//   const decoded = token ? jwtDecode(token) : null;

//   const [properties, setProperties] = useState([]);
//   const [loadingState, setLoadingState] = useState({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (token) {
//       const ownerId = decoded?.id;
//       axios
//         .get(`http://localhost:5000/api/properties?ownerId=${ownerId}`)
//         .then((res) => {
//           if (res.data.status === "success") {
//             setProperties(res.data.properties);
//           }
//         })
//         .catch((err) => console.error("Veri çekme hatası:", err))
//         .finally(() => setLoading(false));
//     }
//   }, [token]);

//   return (
//     <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
//       {/* 🔹 Navbar */}
//       <Navbar />

//       {/* 🔹 Ortak karşılama componenti */}
//       <WelcomeHeader name={decoded?.name || "Kullanıcı"} />

//       {/* 🔹 Tablo Alanı */}
//       <Container maxWidth="lg" sx={{ mt: 3, mb: 5 }}>
//         <Paper
//           elevation={3}
//           sx={{
//             p: 3,
//             borderRadius: 3,
//             boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
//           }}
//         >
//           {loading ? (
//             <Box
//               display="flex"
//               justifyContent="center"
//               alignItems="center"
//               py={5}
//             >
//               <CircularProgress color="primary" />
//             </Box>
//           ) : (
//             <BasicTable
//               data={properties}
//               onUpdate={(updated) =>
//                 setProperties((prev) =>
//                   prev.map((p) => (p._id === updated._id ? updated : p))
//                 )
//               }
//               loadingState={loadingState}
//               setLoadingState={setLoadingState}
//             />
//           )}
//         </Paper>
//       </Container>
//     </div>
//   );
// }

// export default OwnerHome;

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { jwtDecode } from "jwt-decode";
// import Navbar from "../components/Navbar";
// import { CircularProgress, Box, Paper } from "@mui/material";
// import BasicTable from "../components/BasicTable";
// import WelcomeHeader from "../components/WelcomeHeader";

// function OwnerHome() {
//   const token = localStorage.getItem("token");
//   const decoded = token ? jwtDecode(token) : null;

//   const [properties, setProperties] = useState([]);
//   const [loadingState, setLoadingState] = useState({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (token) {
//       const ownerId = decoded?.id;
//       axios
//         .get(`http://localhost:5000/api/properties?ownerId=${ownerId}`)
//         .then((res) => {
//           if (res.data.status === "success") {
//             setProperties(res.data.properties);
//           }
//         })
//         .catch((err) => console.error("Veri çekme hatası:", err))
//         .finally(() => setLoading(false));
//     }
//   }, [token]);

//   return (
//     <>
//       {/* 🔹 Navbar */}
//       <Navbar />

//       {/* 🔹 Ortak karşılama componenti */}
//       <WelcomeHeader name={decoded?.name || "Kullanıcı"} />

//       {/* 🔹 Mülk Tablosu */}
//       <Paper
//         elevation={3}
//         sx={{
//           maxWidth: 1000,
//           mx: "auto",
//           my: 3,
//           p: 3,
//           borderRadius: 3,
//           boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
//           backgroundColor: "#ffffff",
//         }}
//       >
//         {loading ? (
//           <Box
//             display="flex"
//             justifyContent="center"
//             alignItems="center"
//             py={5}
//           >
//             <CircularProgress color="primary" />
//           </Box>
//         ) : (
//           <BasicTable
//             data={properties}
//             onUpdate={(updated) =>
//               setProperties((prev) =>
//                 prev.map((p) => (p._id === updated._id ? updated : p))
//               )
//             }
//             loadingState={loadingState}
//             setLoadingState={setLoadingState}
//           />
//         )}
//       </Paper>
//     </>
//   );
// }

// export default OwnerHome;

import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import { CircularProgress, Box, Typography } from "@mui/material";
import BasicTable from "../components/BasicTable";
import WelcomeHeader from "../components/WelcomeHeader";

function OwnerHome() {
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;

  const [properties, setProperties] = useState([]);
  const [loadingState, setLoadingState] = useState({});
  const [loading, setLoading] = useState(true);

  // 🔹 Verileri getir
  useEffect(() => {
    if (token) {
      const ownerId = decoded?.id;
      axios
        .get("http://localhost:5000/api/properties", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.status === "success") {
            setProperties(res.data.properties);
          }
        })
        .catch((err) => console.error("Veri çekme hatası:", err))
        .finally(() => setLoading(false));
    }
  }, [token]);

  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Hoş geldiniz alanı */}
      <WelcomeHeader name={decoded?.name || "Kullanıcı"} />

      {/* Mülk Listesi */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 5,
          }}
        >
          <CircularProgress color="primary" />
        </Box>
      ) : properties.length > 0 ? (
        <BasicTable
          data={properties}
          onUpdate={(updated) =>
            setProperties((prev) =>
              prev.map((p) => (p._id === updated._id ? updated : p))
            )
          }
          loadingState={loadingState}
          setLoadingState={setLoadingState}
        />
      ) : (
        <Box
          sx={{
            textAlign: "center",
            py: 5,
            color: "#777",
            fontStyle: "italic",
          }}
        >
          Henüz ilan bulunmuyor.
        </Box>
      )}
    </>
  );
}

export default OwnerHome;
