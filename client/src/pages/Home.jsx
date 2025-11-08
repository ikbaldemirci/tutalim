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

  useEffect(() => {
    const video = document.getElementById("background-video");
    if (video) {
      video.style.display = "block";
      video.currentTime = 0;
      video.play().catch(() => {});
    }
    return () => {
      if (video) {
        video.pause();
        video.style.display = "none";
      }
    };
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
        minHeight: "100vh",
        overflowY: "auto",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          background: "rgba(0,0,0,0.25)",
          pointerEvents: "none",
        }}
      />

      <Navbar bg="rgba(0,0,0,0.3)" onLogout={() => setIsAuthenticated(false)} />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 4, md: 8 },
          py: { xs: 4, md: 0 },
          gap: { xs: 3, md: 6 },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Fade in timeout={800}>
          <Box
            sx={{
              flex: { xs: "unset", md: 1 },
              maxWidth: 640,
              textAlign: { xs: "center", md: "left" },
              px: { xs: 2, md: 5 },
              color: "#fff",
            }}
          >
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                mb: 2,
                fontSize: { xs: "1.9rem", sm: "2.3rem", md: "2.6rem" },
                lineHeight: 1.2,
                textShadow: "0 5px 20px rgba(255, 255, 255, 1)",
                color: "#5DADE2",
              }}
            >
              Tutalım.com
            </Typography>

            <Box
              sx={{
                display: "inline-block",
                px: 2,
                py: 1.2,
                borderRadius: 2,
                background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(4px)",
                color: "#E0E0E0",
                fontSize: { xs: "0.9rem", sm: "1rem" },
                borderLeft: "4px solid #2E86C1",
              }}
            >
              <Typography sx={{ mb: 0.5 }}>
                Ev sahipleri ve emlakçılar için akıllı bağlantılar.
              </Typography>
              <Typography fontWeight="bold">
                Tutalım ile dizginleri elinde tut!
              </Typography>
            </Box>

            <Box
              sx={{
                mt: 3,
                width: { xs: "60%", md: "40%" },
                height: "4px",
                borderRadius: 2,
                mx: { xs: "auto", md: 0 },
                background: "linear-gradient(90deg, #2E86C1, #5DADE2)",
              }}
            />
          </Box>
        </Fade>

        {!isAuthenticated && (
          <Fade in={showForm} timeout={500}>
            <Box
              sx={{
                flexShrink: 0,
                width: "100%",
                maxWidth: { xs: "90%", sm: 400 },
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Paper
                elevation={10}
                sx={{
                  width: "100%",
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 3,
                  backgroundColor: "rgba(255,255,255,0.25)",
                  backdropFilter: "blur(15px)",
                  borderLeft: "5px solid #2E86C1",
                  boxShadow: "0 0 20px rgba(46,134,193,0.4)",
                }}
              >
                {isLogin ? (
                  <Login onSwitch={handleSwitch} />
                ) : (
                  <Signup onSwitch={handleSwitch} />
                )}
              </Paper>
            </Box>
          </Fade>
        )}
      </Box>

      <Footer />
    </Box>
  );
}

export default Home;
