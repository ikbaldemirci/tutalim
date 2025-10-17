// import { NavLink, useNavigate } from "react-router-dom";
// import { jwtDecode } from "jwt-decode";
// import LogoutIcon from "@mui/icons-material/Logout";

// function Navbar() {
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");
//   const decoded = token ? jwtDecode(token) : null;

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/");
//   };

//   return (
//     <nav className="navbar navbar-expand-lg navbar-light bg-transparent shadow-sm">
//       <div className="container">
//         <NavLink to="/">
//           <img
//             src="/images/tutalim.png"
//             alt="Logo"
//             className="navbar-brand"
//             style={{ width: "150px" }}
//           />
//         </NavLink>
//         <button
//           className="navbar-toggler"
//           type="button"
//           data-bs-toggle="collapse"
//           data-bs-target="#mainNavbar"
//           aria-controls="mainNavbar"
//           aria-expanded="false"
//           aria-label="Toggle navigation"
//         >
//           <span className="navbar-toggler-icon" />
//         </button>
//         <div className="collapse navbar-collapse" id="mainNavbar">
//           <ul className="navbar-nav ms-auto">
//             <li className="nav-item">
//               <NavLink end to="/" className="nav-link">
//                 Ana Sayfa
//               </NavLink>
//             </li>
//             <li className="nav-item">
//               <NavLink to="/about" className="nav-link">
//                 Hakkında
//               </NavLink>
//             </li>
//             {token ? (
//               <>
//                 <li className="nav-item">
//                   <NavLink
//                     to={decoded?.role === "owner" ? "/owner" : "/realtor"}
//                     className="nav-link"
//                   >
//                     Portföy
//                   </NavLink>
//                 </li>

//                 <li className="nav-item">
//                   <button
//                     className="btn btn-link nav-link d-flex align-items-center"
//                     onClick={handleLogout}
//                   >
//                     <LogoutIcon />
//                   </button>
//                 </li>
//               </>
//             ) : null}
//           </ul>
//         </div>
//       </div>
//     </nav>
//   );
// }

// export default Navbar;

import React, { useState } from "react";
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

  const handleLogout = async () => {
    try {
      const res = await api.post("/logout", {}, { withCredentials: true });
      console.log("🟢 Logout response:", res.data);
    } catch (err) {
      console.error("🔴 Logout hatası:", err);
    } finally {
      // her durumda token’ı sil
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

  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm navbar-dark"
      style={navStyle}
    >
      <div className="container py-2">
        {/* Logo */}
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

        {/* Collapse button */}
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

        {/* Menu items */}
        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item mx-2">
              <NavLink
                end
                to="/"
                className="nav-link text-white fw-semibold"
                style={({ isActive }) => ({
                  borderBottom: isActive ? "2px solid white" : "none",
                })}
              >
                Ana Sayfa
              </NavLink>
            </li>

            <li className="nav-item mx-2">
              <NavLink
                to="/about"
                className="nav-link text-white fw-semibold"
                style={({ isActive }) => ({
                  borderBottom: isActive ? "2px solid white" : "none",
                })}
              >
                Hakkında
              </NavLink>
            </li>

            {token && (
              <>
                <li className="nav-item mx-2">
                  <NavLink
                    to={decoded?.role === "owner" ? "/owner" : "/realtor"}
                    className="nav-link text-white fw-semibold"
                    style={({ isActive }) => ({
                      borderBottom: isActive ? "2px solid white" : "none",
                    })}
                  >
                    Portföy
                  </NavLink>
                </li>

                {/* Avatar menüsü */}
                <li className="nav-item d-flex align-items-center mx-2">
                  <Tooltip title="Hesap Menüsü" arrow>
                    <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
                      <Avatar
                        sx={{
                          width: 34,
                          height: 34,
                          bgcolor: "#3498db",
                          fontSize: "0.9rem",
                          cursor: "pointer",
                        }}
                      >
                        {decoded?.name?.[0]?.toUpperCase() || "U"}
                      </Avatar>
                    </IconButton>
                  </Tooltip>

                  {/* Açılır menü */}
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
    </nav>
  );
}

export default Navbar;

// Çıkış Yap + Profil Menu olmadan çalışır hali
// {token && (
//               <>
//                 <li className="nav-item mx-2">
//                   <NavLink
//                     to={decoded?.role === "owner" ? "/owner" : "/realtor"}
//                     className="nav-link text-white fw-semibold"
//                     style={({ isActive }) => ({
//                       borderBottom: isActive ? "2px solid white" : "none",
//                     })}
//                   >
//                     Portföy
//                   </NavLink>
//                 </li>

//                 {/* Profil + Logout */}
//                 <li className="nav-item d-flex align-items-center mx-2">
//                   <Tooltip title={`Çıkış Yap (${decoded?.name || ""})`} arrow>
//                     <button
//                       className="btn btn-light btn-sm d-flex align-items-center"
//                       onClick={handleLogout}
//                       style={{
//                         borderRadius: "50px",
//                         fontWeight: "500",
//                         gap: "5px",
//                       }}
//                     >
//                       <LogoutIcon fontSize="small" /> Çıkış
//                     </button>
//                   </Tooltip>

//                   <Avatar
//                     sx={{
//                       width: 34,
//                       height: 34,
//                       bgcolor: "#3498db",
//                       ml: 2,
//                       fontSize: "0.9rem",
//                     }}
//                   >
//                     {decoded?.name?.[0]?.toUpperCase() || "U"}
//                   </Avatar>
//                 </li>
//               </>
//             )}
