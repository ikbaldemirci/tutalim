import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Fade } from "@mui/material";
import { lazy, Suspense, useState, useEffect } from "react";

import ProtectedRoute from "./ProtectedRoute";
import LoadingScreen from "./components/LoadingScreen";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const OwnerHome = lazy(() => import("./pages/OwnerHome"));
const RealtorHome = lazy(() => import("./pages/RealtorHome"));
const Profile = lazy(() => import("./pages/Profile"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ResetSuccess = lazy(() => import("./pages/ResetSuccess"));
const CheckMail = lazy(() => import("./pages/CheckMail"));
const CheckMailVerify = lazy(() => import("./pages/CheckMailVerify"));
const VerifyResult = lazy(() => import("./pages/VerifyResult"));
const ResendVerify = lazy(() => import("./pages/ResendVerify"));
import ScrollToTop from "./components/ScrollToTop";

const theme = createTheme({
  palette: {
    primary: { main: "#2E86C1" },
    secondary: { main: "#5DADE2" },
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
          <main>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <BrowserRouter>
                <ScrollToTop />
                <Suspense fallback={<LoadingScreen />}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route
                      path="/reset-password/:token"
                      element={<ResetPassword />}
                    />
                    <Route path="/reset-success" element={<ResetSuccess />} />
                    <Route path="/check-mail" element={<CheckMail />} />
                    <Route
                      path="/check-mail-verify"
                      element={<CheckMailVerify />}
                    />
                    <Route path="/verify/:token" element={<VerifyResult />} />
                    <Route path="/resend-verify" element={<ResendVerify />} />

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
                </Suspense>
              </BrowserRouter>
            </ThemeProvider>
          </main>
        </Fade>
      )}
    </>
  );
}

export default App;
