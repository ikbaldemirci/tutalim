import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import { Typography, Button } from "@mui/material";
// import LogoutIcon from "@mui/icons-material/Logout";

function OwnerHome() {
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div>
      <Navbar />
      <Typography>Hoş geldiniz, {decoded?.name}!</Typography>
      <Button
        variant="contained"
        // endIcon={<LogoutIcon />}
        onClick={handleLogout}
      >
        Logout
      </Button>
    </div>
  );
}
export default OwnerHome;
