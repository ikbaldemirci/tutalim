// import { useState, useEffect } from "react";
// import { Box, Typography, Fade, Paper } from "@mui/material";
// import Navbar from "../components/Navbar";
// import Login from "./Login";
// import Signup from "./Signup";
// import { jwtDecode } from "jwt-decode";

// function Home() {
//   const [isLogin, setIsLogin] = useState(true);
//   const [showForm, setShowForm] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   // ✅ Token kontrolü
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       try {
//         const decoded = jwtDecode(token);
//         // token geçerli mi kontrol edelim
//         if (decoded && decoded.exp * 1000 > Date.now()) {
//           setIsAuthenticated(true);
//         } else {
//           localStorage.removeItem("token");
//         }
//       } catch (err) {
//         console.error("Token doğrulama hatası:", err);
//         localStorage.removeItem("token");
//       }
//     }
//   }, []);

//   const handleSwitch = () => {
//     setShowForm(false);
//     setTimeout(() => {
//       setIsLogin((prev) => !prev);
//       setShowForm(true);
//     }, 200);
//   };

//   return (
//     <Box
//       sx={{
//         height: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         background: "linear-gradient(to right, #eaf2f8 0%, #f4f9ff 100%)",
//       }}
//     >
//       {/* Navbar */}
//       <Navbar onLogout={() => setIsAuthenticated(false)} />

//       {/* Orta alan */}
//       <Box
//         sx={{
//           flex: 1,
//           display: "flex",
//           flexDirection: { xs: "column", md: "row" },
//           alignItems: "center",
//           justifyContent: "center",
//           px: { xs: 2, md: 6 },
//           gap: 4,

//           overflow: "hidden",
//         }}
//       >
//         {/* Sol taraf */}
//         <Box
//           sx={{
//             flex: 1,
//             maxWidth: 640,
//             textAlign: { xs: "center", md: "left" },
//             px: { xs: 2, md: 5 },
//           }}
//         >
//           <Typography
//             variant="h3"
//             fontWeight="bold"
//             sx={{ color: "#2E86C1", mb: 2 }}
//           >
//             🏠 Tutalım.com’a Hoş Geldiniz!
//           </Typography>

//           <Typography variant="h6" sx={{ color: "#555", mb: 2 }}>
//             Ev sahipleri, emlakçılar ve kullanıcılar için güvenli, hızlı ve
//             modern bir platform.
//           </Typography>

//           <Typography variant="body1" sx={{ color: "#777" }}>
//             Şeffaf iletişim. Akıllı çözümler. Gerçek bağlantılar.
//             <br />
//             <strong>Tutalım.com</strong> ile emlak dünyası artık çok daha kolay!
//           </Typography>
//         </Box>

//         {/* Sağ taraf */}
//         {!isAuthenticated && (
//           <Box
//             sx={{
//               flexShrink: 0,
//               width: "100%",
//               maxWidth: 350,
//               display: "flex",
//               justifyContent: "center", // merkeze al
//               alignItems: "center", // dikey ortalama
//             }}
//           >
//             <Paper
//               elevation={4}
//               sx={{
//                 width: "100%",
//                 maxWidth: 350,
//                 p: 3,
//                 borderRadius: 3,
//                 boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
//                 backgroundColor: "#fff",
//                 maxHeight: "80vh", // 🧩 sabit yükseklik
//                 overflowY: "auto", // 🧩 kart içi scroll
//               }}
//             >
//               <Fade in={showForm} timeout={300}>
//                 <Box sx={{ width: "100%" }}>
//                   {isLogin ? (
//                     <Login onSwitch={handleSwitch} />
//                   ) : (
//                     <Signup onSwitch={handleSwitch} />
//                   )}
//                 </Box>
//               </Fade>
//             </Paper>
//           </Box>
//         )}
//       </Box>

//       {/* Footer */}
//       <Box
//         component="footer"
//         sx={{
//           py: 1.5,
//           textAlign: "center",
//           borderTop: "1px solid #e0e0e0",
//           backgroundColor: "#f9f9f9",
//         }}
//       >
//         <Typography variant="body2" color="text.secondary">
//           © 2025 Tutalım.com – Tüm Hakları Saklıdır.
//         </Typography>
//       </Box>
//     </Box>
//   );
// }

// export default Home;

import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { Box, Typography, Fade, Paper } from "@mui/material";
import Login from "./Login";
import Signup from "./Signup";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [showForm, setShowForm] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("token");
        }
      } catch (err) {
        console.error("Token doğrulama hatası:", err);
        localStorage.removeItem("token");
      }
    }
  }, []);

  const handleSwitch = () => {
    setShowForm(false);
    setTimeout(() => {
      setIsLogin((prev) => !prev);
      setShowForm(true);
    }, 200);
  };

  return (
    <Box
      sx={{
        // position: "relative",
        height: "100vh",
        // overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 🔹 Arka plan videosu */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -1,
          filter: "brightness(60%)",
        }}
      >
        <source src="/videos/video_1.mp4" type="video/mp4" />
        Tarayıcınız video etiketini desteklemiyor.
      </video>

      {/* 🔹 Sayfa içeriği */}
      <Navbar bg="rgba(0,0,0,0.3)" onLogout={() => setIsAuthenticated(false)} />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, md: 6 },
          gap: 4,
          overflow: "hidden",
        }}
      >
        {/* Sol taraf */}
        <Fade in timeout={1000}>
          <Box
            sx={{
              flex: 1,
              maxWidth: 640,
              textAlign: { xs: "center", md: "left" },
              px: { xs: 2, md: 5 },
            }}
          >
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                color: "#fff",
                mb: 2,
                textShadow: "0 3px 10px rgba(0,0,0,0.6)",
              }}
            >
              🏙️ Tutalım.com’a Hoş Geldiniz
            </Typography>

            <Typography variant="h6" sx={{ color: "#f1f1f1", mb: 2 }}>
              Lüks konut dünyasında güvenli, modern ve şeffaf bir deneyim.
            </Typography>

            <Typography variant="body1" sx={{ color: "#e0e0e0" }}>
              Ev sahipleri ve emlakçılar için akıllı bağlantılar.
              <br />
              <strong>Tutalım.com</strong> ile gayrimenkul dünyasını yeniden
              keşfedin.
            </Typography>
          </Box>
        </Fade>

        {/* Sağ taraf (Login / Signup Card) */}
        {!isAuthenticated && (
          <Fade in={showForm} timeout={500}>
            <Box
              sx={{
                flexShrink: 0,
                width: "100%",
                maxWidth: 350,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Paper
                elevation={10}
                sx={{
                  width: "100%",
                  maxWidth: 350,
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",

                  maxHeight: "80vh",
                  overflowY: "auto",
                }}
              >
                <Fade in={showForm} timeout={300}>
                  <Box sx={{ width: "100%" }}>
                    {isLogin ? (
                      <Login onSwitch={handleSwitch} />
                    ) : (
                      <Signup onSwitch={handleSwitch} />
                    )}
                  </Box>
                </Fade>
              </Paper>
            </Box>
          </Fade>
        )}
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
    // </Box>
  );
}

export default Home;
