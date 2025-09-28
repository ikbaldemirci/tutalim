import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import { Typography, Button } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import BasicTable from "../components/BasicTable";

function OwnerHome() {
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;

  const [properties, setProperties] = useState([]);
  const [loadingState, setLoadingState] = useState({});

  const [form, setForm] = useState({
    rentPrice: "",
    rentDate: "",
    endDate: "",
    location: "",
  });

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode(token);
      const ownerId = decoded.id;

      axios
        .get(`http://localhost:5000/api/properties?ownerId=${ownerId}`)
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "1rem auto",
          padding: "0 1rem",
        }}
      >
        <Typography>Hoş geldiniz, {decoded?.name}!</Typography>
        <Button
          variant="contained"
          endIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ m: 2 }}
        >
          Logout
        </Button>
      </div>
      <BasicTable
        data={properties}
        onUpdate={(updated) => {
          setProperties((prev) =>
            prev.map((p) => (p._id === updated._id ? updated : p))
          );
        }}
        loadingState={loadingState}
        setLoadingState={setLoadingState}
      />
    </div>
  );
}
export default OwnerHome;
