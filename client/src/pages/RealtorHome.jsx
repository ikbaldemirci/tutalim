import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import {
  Typography,
  Button,
  TextField,
  Box,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import BasicTable from "../components/BasicTable";

function RealtorHome() {
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;

  const [properties, setProperties] = useState([]);
  const [form, setForm] = useState({
    rentPrice: "",
    rentDate: "",
    endDate: "",
    location: "",
    tenantName: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // useEffect(() => {
  //   if (token) {
  //     const decoded = jwtDecode(token);
  //     const realtorId = decoded.id;

  //     axios
  //       .get(`http://localhost:5000/api/properties?realtorId=${realtorId}`)
  //       .then((res) => {
  //         if (res.data.status === "success") {
  //           setProperties(res.data.properties);
  //         }
  //       })
  //       .catch((err) => {
  //         console.error("Veri çekme hatası:", err);
  //       });
  //   }
  // }, [token]);

  useEffect(() => {
    if (token && decoded?.id) {
      axios
        .get(`http://localhost:5000/api/properties?realtorId=${decoded.id}`)
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddProperty = async () => {
    if (!form.rentPrice || !form.rentDate || !form.endDate || !form.location) {
      setSnackbar({
        open: true,
        message: "Lütfen tüm alanları doldurun!",
        severity: "warning",
      });
      return;
    }
    try {
      const res = await axios.post("http://localhost:5000/api/properties", {
        rentPrice: form.rentPrice,
        rentDate: new Date(form.rentDate),
        endDate: new Date(form.endDate),
        location: form.location,
        realtorId: decoded.id,
        tenantName: form.tenantName,
      });

      if (res.data.status === "success") {
        setProperties((prev) => [...prev, res.data.property]);
        setForm({
          rentPrice: "",
          rentDate: "",
          endDate: "",
          location: "",
          tenantName: "",
        });
        setSnackbar({
          open: true,
          message: "İlan başarıyla eklendi!",
          severity: "success",
        });
      }
    } catch (err) {
      console.error("İlan ekleme hatası:", err);
      setSnackbar({
        open: true,
        message: "İlan eklenemedi. Lütfen tekrar deneyin.",
        severity: "error",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div>
      <Navbar />
      <Typography>Hoş geldiniz, {decoded?.name}!</Typography>
      <Paper sx={{ maxWidth: 900, margin: "1rem auto", p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Yeni İlan Ekle
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Kiracı Adı Soyadı"
            name="tenantName"
            value={form.tenantName}
            onChange={handleChange}
            required
          />
          <TextField
            label="Fiyat (₺)"
            name="rentPrice"
            type="number"
            value={form.rentPrice}
            onChange={handleChange}
            required
          />
          <TextField
            label="Başlangıç"
            type="date"
            name="rentDate"
            value={form.rentDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="Bitiş"
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="Konum"
            name="location"
            value={form.location}
            onChange={handleChange}
            required
          />
          <Button variant="contained" onClick={handleAddProperty}>
            Ekle
          </Button>
        </Box>
      </Paper>
      <BasicTable
        data={properties}
        onUpdate={(updated) => {
          setProperties((prev) =>
            prev.map((p) => (p._id === updated._id ? updated : p))
          );
        }}
      />
      <Button
        variant="contained"
        endIcon={<LogoutIcon />}
        onClick={handleLogout}
        sx={{ m: 2 }}
      >
        Logout
      </Button>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}
export default RealtorHome;
