import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import { useState, useEffect } from "react";
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import OwnerHome from "./pages/OwnerHome";
import RealtorHome from "./pages/RealtorHome";
import ProtectedRoute from "./ProtectedRoute";
import Profile from "./pages/Profile";
import LoadingScreen from "./components/LoadingScreen";
import ResetPassword from "./pages/ResetPassword";
import { Fade } from "@mui/material";

// 🎨 Tutalım kurumsal renk teması
const theme = createTheme({
  palette: {
    primary: { main: "#2E86C1" }, // koyu mavi
    secondary: { main: "#5DADE2" }, // açık mavi
    background: { default: "#f8f9fa" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
  },
});

function App() {
  const [splash, setSplash] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1200);
    const timer = setTimeout(() => setSplash(false), 1500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {splash ? (
        <Fade in={!fadeOut} timeout={500}>
          <div>
            <LoadingScreen />
          </div>
        </Fade>
      ) : (
        <Fade in timeout={700}>
          <div>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route
                    path="/reset-password/:token"
                    element={<ResetPassword />}
                  />
                  <Route
                    path="/owner"
                    element={
                      <ProtectedRoute role="owner">
                        <OwnerHome />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/realtor"
                    element={
                      <ProtectedRoute role="realtor">
                        <RealtorHome />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </BrowserRouter>
            </ThemeProvider>
          </div>
        </Fade>
      )}
    </>
  );
}

export default App;
