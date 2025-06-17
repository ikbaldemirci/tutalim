import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import { Typography, Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import BasicTable from "../components/BasicTable";

function RealtorHome() {
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;

  const [properties, setProperties] = useState([]);

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      const realtorId = decoded.id;

      axios
        .get(`http://localhost:5000/api/properties?realtorId=${realtorId}`)
        .then((res) => {
          if (res.data.status === "success") {
            setProperties(res.data.properties);
          }
        })
        .catch((err) => {
          console.error("Veri çekme hatası:", err);
        });
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div>
      <Navbar />
      <Typography>Hoş geldiniz, {decoded?.name}!</Typography>
      <BasicTable data={properties} />
      <Button
        variant="contained"
        endIcon={<LogoutIcon />}
        onClick={handleLogout}
      >
        Logout
      </Button>
    </div>
  );
}
export default RealtorHome;
