import { useState, useEffect } from "react";
import * as bootstrap from "bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Avatar,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import api from "../api";
import SocialIcons from "./SocialIcons";

function Navbar({ onLogout, bg }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;

  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // collapse fix
  useEffect(() => {
    const collapseEl = document.getElementById("mainNavbar");
    if (!collapseEl) return;

    const collapse = bootstrap.Collapse.getOrCreateInstance(collapseEl, {
      toggle: false,
    });

    const toggler = document.querySelector(".navbar-toggler");

    const toggleMenu = () => {
      if (collapseEl.classList.contains("show")) collapse.hide();
      else collapse.show();
    };

    toggler?.addEventListener("click", toggleMenu);

    return () => toggler?.removeEventListener("click", toggleMenu);
  }, []);

  const closeMobileMenu = () => {
    const collapseEl = document.getElementById("mainNavbar");
    if (!collapseEl) return;
    bootstrap.Collapse.getOrCreateInstance(collapseEl).hide();
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout", {}, { withCredentials: true });
    } catch {}
    localStorage.removeItem("token");
    if (onLogout) onLogout();
    navigate("/", { state: { showLogoutMsg: true } });
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark sticky-top shadow-sm"
      style={{
        background: bg || "linear-gradient(135deg, #2E86C1, #5DADE2)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="container position-relative d-flex align-items-center justify-content-between">
        {/* LEFT — LOGO */}
        <NavLink to="/" className="navbar-brand">
          <img
            src="/images/tutalim.webp"
            alt="Tutalım Logo"
            style={{
              width: "140px",
              filter: "brightness(0) invert(1)",
            }}
          />
        </NavLink>

        {/* ★ CENTER — SOCIAL ICONS (ABSOLUTE CENTER) */}
        <div
          className="d-none d-lg-flex"
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <SocialIcons />
        </div>

        {/* ★ MOBILE SOCIAL ICONS (LOGO & TOGGLER ARASINDA) */}
        <div className="d-flex d-lg-none ms-auto me-2">
          <SocialIcons />
        </div>

        {/* RIGHT — TOGGLER */}
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
      </div>

      {/* MOBILE MENU (AŞAĞI AÇILAN) */}
      <div className="collapse navbar-collapse" id="mainNavbar">
        <ul className="navbar-nav px-3 pb-3">
          <li className="nav-item">
            <NavLink
              to="/"
              onClick={closeMobileMenu}
              className="nav-link fw-semibold"
            >
              Ana Sayfa
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/about"
              onClick={closeMobileMenu}
              className="nav-link fw-semibold"
            >
              Hakkında
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink
              to="/contact"
              onClick={closeMobileMenu}
              className="nav-link fw-semibold"
            >
              İletişim
            </NavLink>
          </li>

          {token && (
            <>
              <li className="nav-item">
                <NavLink
                  to={decoded?.role === "owner" ? "/owner" : "/realtor"}
                  onClick={closeMobileMenu}
                  className="nav-link fw-semibold"
                >
                  Portföy
                </NavLink>
              </li>

              <li className="nav-item mt-3">
                <SocialIcons />
              </li>
            </>
          )}
        </ul>
      </div>

      {/* DESKTOP MENÜ + AVATAR */}
      <div className="d-none d-lg-flex container justify-content-end align-items-center">
        <ul className="navbar-nav d-flex flex-row gap-3 me-3">
          <li className="nav-item">
            <NavLink to="/" className="nav-link text-white fw-semibold">
              Ana Sayfa
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="/about" className="nav-link text-white fw-semibold">
              Hakkında
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink to="/contact" className="nav-link text-white fw-semibold">
              İletişim
            </NavLink>
          </li>

          {token && (
            <li className="nav-item">
              <NavLink
                to={decoded?.role === "owner" ? "/owner" : "/realtor"}
                className="nav-link text-white fw-semibold"
              >
                Portföy
              </NavLink>
            </li>
          )}
        </ul>

        {token && (
          <>
            <Tooltip title="Hesap Menüsü" arrow>
              <IconButton onClick={handleMenuOpen}>
                <Avatar
                  sx={{
                    bgcolor: "#fff",
                    color: "#2E86C1",
                    fontWeight: 600,
                  }}
                >
                  {decoded?.name?.[0]}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem
                onClick={() => {
                  navigate("/profile");
                  handleMenuClose();
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
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
