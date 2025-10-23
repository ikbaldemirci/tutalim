import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import LogoutIcon from "@mui/icons-material/Logout";
import {
  Avatar,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import api from "../api";

function Navbar({ onLogout, bg }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;

  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const doc = document.documentElement;
      const total = (doc.scrollHeight || 0) - (window.innerHeight || 0);
      if (total > 0) {
        setScrollProgress(
          Math.min(100, Math.max(0, (window.scrollY / total) * 100))
        );
      } else {
        setScrollProgress(0);
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobileMenu = () => {
    const el = document.getElementById("mainNavbar");
    if (el && el.classList.contains("show")) {
      el.classList.remove("show");
    }
  };

  const handleLogout = async () => {
    try {
      const res = await api.post("/logout", {}, { withCredentials: true });
      console.log("🟢 Logout response:", res.data);
    } catch (err) {
      console.error("🔴 Logout hatası:", err);
    } finally {
      localStorage.removeItem("token");
      if (onLogout) onLogout();
      navigate("/", { state: { showLogoutMsg: true } });
    }
  };

  const navStyle = bg
    ? { background: bg, color: "#fff" }
    : {
        background: "linear-gradient(135deg, #2E86C1, #5DADE2)",
        color: "#fff",
      };

  const computedNavStyle = scrolled
    ? {
        ...navStyle,
        background: "rgba(46,134,193,0.98)",
        color: "#fff",
        backdropFilter: "saturate(180%) blur(8px)",
        transition: "background 0.3s ease, box-shadow 0.3s ease",
        boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
      }
    : navStyle;

  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm navbar-dark sticky-top"
      style={computedNavStyle}
    >
      <div
        className="container py-2"
        style={{
          paddingTop: scrolled ? 8 : 12,
          paddingBottom: scrolled ? 8 : 12,
          transition: "padding 0.2s ease",
        }}
      >
        <NavLink to="/" className="navbar-brand d-flex align-items-center">
          <img
            src="/images/tutalim.png"
            alt="Tutalım Logo"
            style={{
              width: "140px",
              marginRight: "10px",
              filter: "brightness(0) invert(1)",
            }}
          />
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ border: "none" }}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav ms-auto align-items-center gap-2 gap-lg-0">
            <li className="nav-item mx-2 mb-2 mb-lg-0">
              <NavLink
                end
                to="/"
                className="nav-link text-white fw-semibold"
                onClick={closeMobileMenu}
                style={({ isActive }) => ({
                  borderBottom: isActive ? "2px solid white" : "none",
                  paddingBottom: 2,
                })}
              >
                Ana Sayfa
              </NavLink>
            </li>

            <li className="nav-item mx-2 mb-2 mb-lg-0">
              <NavLink
                to="/about"
                className="nav-link text-white fw-semibold"
                onClick={closeMobileMenu}
                style={({ isActive }) => ({
                  borderBottom: isActive ? "2px solid white" : "none",
                  paddingBottom: 2,
                })}
              >
                Hakkında
              </NavLink>
            </li>

            {token && (
              <>
                <li className="nav-item mx-2 mb-2 mb-lg-0">
                  <NavLink
                    to={decoded?.role === "owner" ? "/owner" : "/realtor"}
                    className="nav-link text-white fw-semibold"
                    onClick={closeMobileMenu}
                    style={({ isActive }) => ({
                      borderBottom: isActive ? "2px solid white" : "none",
                      paddingBottom: 2,
                    })}
                  >
                    Portföy
                  </NavLink>
                </li>

                <li className="nav-item d-flex align-items-center mx-2 mt-3 mt-lg-0">
                  <Tooltip title="Hesap Menüsü" arrow>
                    <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: "#ffffff",
                          color: "#2E86C1",
                          fontSize: "0.95rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          boxShadow:
                            "0 0 0 2px rgba(255,255,255,0.85), 0 2px 6px rgba(0,0,0,0.15)",
                        }}
                      >
                        {decoded?.name?.[0]?.toUpperCase() || "U"}
                      </Avatar>
                    </IconButton>
                  </Tooltip>

                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    PaperProps={{
                      elevation: 4,
                      sx: {
                        mt: 1.5,
                        minWidth: 160,
                        borderRadius: "10px",
                        overflow: "visible",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                      },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        navigate("/profile");
                      }}
                      sx={{ fontWeight: 500, gap: 1 }}
                    >
                      <PersonIcon fontSize="small" /> Profilim
                    </MenuItem>

                    <Divider />

                    <MenuItem
                      onClick={() => {
                        handleLogout();
                        handleMenuClose();
                      }}
                      sx={{
                        color: "error.main",
                        fontWeight: 500,
                        gap: 1,
                        "&:hover": { bgcolor: "rgba(255,0,0,0.05)" },
                      }}
                    >
                      <LogoutIcon fontSize="small" /> Çıkış Yap
                    </MenuItem>
                  </Menu>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 2,
          background: "rgba(255,255,255,0.2)",
        }}
      >
        <div
          style={{
            width: `${scrollProgress}%`,
            height: "100%",
            background: "#5DADE2",
            transition: "width 0.1s linear",
          }}
        />
      </div>
    </nav>
  );
}

export default Navbar;
