import { useState, useEffect } from "react";
import * as bootstrap from "bootstrap";
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
  Box,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import api from "../api";
import SocialIcons from "./SocialIcons";

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
    const navEl = document.getElementById("mainNavbar");
    if (!navEl) return;

    const collapse = bootstrap.Collapse.getOrCreateInstance(navEl, {
      toggle: false,
    });

    const onOutsidePointer = (e) => {
      const clickedInsideCollapse = e.target.closest("#mainNavbar");
      const clickedOnToggler = e.target.closest(".navbar-toggler");
      const isOpen = navEl.classList.contains("show");

      if (isOpen && !clickedInsideCollapse && !clickedOnToggler) {
        collapse.hide();
      }
    };

    const onKeyDown = (e) => {
      if (e.key === "Escape" && navEl.classList.contains("show")) {
        collapse.hide();
      }
    };

    const toggler = document.querySelector(".navbar-toggler");
    const onTogglerClick = () => {
      if (navEl.classList.contains("show")) collapse.hide();
      else collapse.show();
    };
    toggler?.addEventListener("click", onTogglerClick);

    window.addEventListener("pointerdown", onOutsidePointer, true);
    window.addEventListener("keydown", onKeyDown, true);

    return () => {
      toggler?.removeEventListener("click", onTogglerClick);
      window.removeEventListener("pointerdown", onOutsidePointer, true);
      window.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  const closeMobileMenu = () => {
    const el = document.getElementById("mainNavbar");
    if (!el) return;
    const c = bootstrap.Collapse.getOrCreateInstance(el, { toggle: false });
    if (el.classList.contains("show")) c.hide();
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err);
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
        transition: "background 0.3s ease",
        boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
      }
    : navStyle;

  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm navbar-dark sticky-top"
      style={computedNavStyle}
    >
      <div
        className="container d-flex align-items-center justify-content-between"
        style={{
          paddingTop: scrolled ? 8 : 12,
          paddingBottom: scrolled ? 8 : 12,
          transition: "padding 0.2s ease",
          display: "flex",
        }}
      >
        <div className="d-flex align-items-center">
          <NavLink to="/" className="navbar-brand d-flex align-items-center">
            <img
              src="/images/tutalim.webp"
              alt="Tutalım Logo"
              style={{
                width: "140px",
                filter: "brightness(0) invert(1)",
              }}
            />
          </NavLink>
        </div>
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ flexGrow: 1 }}
        >
          <SocialIcons />
        </div>

        <div className="d-flex align-items-center">
          <button
            className="navbar-toggler d-lg-none ms-2"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mainNavbar"
            aria-label="Toggle navigation"
            style={{ border: "none" }}
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="mainNavbar">
            <ul className="navbar-nav ms-auto align-items-center gap-2">
              <li className="nav-item">
                <NavLink
                  to="/"
                  end
                  className="nav-link text-white fw-semibold"
                  onClick={closeMobileMenu}
                >
                  Ana Sayfa
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/about"
                  className="nav-link text-white fw-semibold"
                  onClick={closeMobileMenu}
                >
                  Hakkında
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/contact"
                  className="nav-link text-white fw-semibold"
                  onClick={closeMobileMenu}
                >
                  İletişim
                </NavLink>
              </li>

              {token && (
                <>
                  <li className="nav-item">
                    <NavLink
                      to={decoded?.role === "owner" ? "/owner" : "/realtor"}
                      className="nav-link text-white fw-semibold"
                      onClick={closeMobileMenu}
                    >
                      Portföy
                    </NavLink>
                  </li>

                  <li className="nav-item d-flex align-items-center ms-3">
                    <Tooltip title="Hesap Menüsü" arrow>
                      <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: "#ffffff",
                            color: "#2E86C1",
                            fontWeight: 600,
                          }}
                        >
                          {decoded?.name?.[0]?.toUpperCase()}
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
                        },
                      }}
                    >
                      <MenuItem
                        onClick={() => {
                          handleMenuClose();
                          navigate("/profile");
                        }}
                      >
                        <PersonIcon fontSize="small" /> Profilim
                      </MenuItem>

                      <Divider />

                      <MenuItem
                        onClick={() => {
                          handleLogout();
                          handleMenuClose();
                        }}
                        sx={{ color: "error.main" }}
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
      </div>
    </nav>
  );
}

export default Navbar;
