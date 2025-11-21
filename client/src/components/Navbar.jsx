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
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  useEffect(() => {
    const collapseEl = document.getElementById("mainNavbar");
    if (!collapseEl) return;

    const collapse = bootstrap.Collapse.getOrCreateInstance(collapseEl, {
      toggle: false,
    });

    const toggler = document.querySelector(".navbar-toggler");
    const onToggler = () => {
      if (collapseEl.classList.contains("show")) collapse.hide();
      else collapse.show();
    };

    const onClickOutside = (e) => {
      const insideCollapse = e.target.closest("#mainNavbar");
      const insideToggler = e.target.closest(".navbar-toggler");
      const isOpen = collapseEl.classList.contains("show");

      if (isOpen && !insideCollapse && !insideToggler) collapse.hide();
    };

    toggler?.addEventListener("click", onToggler);
    window.addEventListener("pointerdown", onClickOutside, true);

    return () => {
      toggler?.removeEventListener("click", onToggler);
      window.removeEventListener("pointerdown", onClickOutside, true);
    };
  }, []);

  const closeMobileMenu = () => {
    const collapseEl = document.getElementById("mainNavbar");
    if (!collapseEl) return;
    const collapse = bootstrap.Collapse.getOrCreateInstance(collapseEl, {
      toggle: false,
    });
    collapse.hide();
  };

  const handleLogout = async () => {
    try {
      await api.post("/logout", {}, { withCredentials: true });
    } catch {}
    localStorage.removeItem("token");
    if (onLogout) onLogout();
    navigate("/", { state: { showLogoutMsg: true } });
  };

  const navStyle = bg
    ? { background: bg }
    : { background: "linear-gradient(135deg, #2E86C1, #5DADE2)" };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark sticky-top shadow-sm"
      style={{
        ...navStyle,
        color: "#fff",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        className="container d-flex align-items-center justify-content-between"
        style={{ paddingTop: 10, paddingBottom: 10 }}
      >
        {/* LEFT — LOGO */}
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

        {/* CENTER — SOCIAL ICONS */}
        <div className="d-none d-lg-flex" style={{ marginLeft: -80 }}>
          <SocialIcons />
        </div>

        {/* RIGHT — HAMBURGER BUTTON */}
        <button
          className="navbar-toggler d-lg-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* DESKTOP RIGHT SECTION (MENU + AVATAR) */}
        <div className="d-none d-lg-flex align-items-center gap-3">
          <ul className="navbar-nav me-3 d-flex flex-row gap-3">
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
              <NavLink
                to="/contact"
                className="nav-link text-white fw-semibold"
              >
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
                      width: 36,
                      height: 36,
                      bgcolor: "#fff",
                      color: "#2E86C1",
                      fontWeight: "bold",
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
                  sx: { minWidth: 150, borderRadius: "10px" },
                }}
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
      </div>

      {/* MOBILE – COLLAPSE MENÜ (AŞAĞI DOĞRU AÇILAN) */}
      <div className="collapse" id="mainNavbar">
        <ul className="navbar-nav px-3 pb-3 pt-1">
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
              <li className="nav-item mt-2 mb-2">
                <SocialIcons />
              </li>

              <li className="nav-item">
                <NavLink
                  to={decoded?.role === "owner" ? "/owner" : "/realtor"}
                  onClick={closeMobileMenu}
                  className="nav-link fw-semibold"
                >
                  Portföy
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
