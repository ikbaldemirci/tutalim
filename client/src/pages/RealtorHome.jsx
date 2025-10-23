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
  Slide,
} from "@mui/material";
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import BasicTable from "../components/BasicTable";
import WelcomeHeader from "../components/WelcomeHeader";

function RealtorHome() {
  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;

  const [properties, setProperties] = useState([]);
  const [loadingState, setLoadingState] = useState({});
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

  useEffect(() => {
    if (token && decoded?.id) {
      axios
        .get("http://localhost:5000/api/properties", {
          headers: { Authorization: `Bearer ${token}` },
        })

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
      const res = await axios.post(
        "http://localhost:5000/api/properties",
        {
          rentPrice: form.rentPrice,
          rentDate: new Date(form.rentDate),
          endDate: new Date(form.endDate),
          location: form.location,
          tenantName: form.tenantName,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
          message: "İlan başarıyla eklendi! 🏠",
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

  return (
    <>
      <Navbar />
      <WelcomeHeader name={decoded?.name} />

      <Paper
        elevation={3}
        sx={{
          maxWidth: 1000,
          margin: "1.5rem auto",
          p: 3,
          borderRadius: 3,
          backgroundColor: "#ffffff",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            mb: 2,
            fontWeight: 600,
            color: "#2E86C1",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <AddHomeWorkIcon />
          Yeni İlan Ekle
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            label="Kiracı Adı Soyadı"
            name="tenantName"
            value={form.tenantName}
            onChange={handleChange}
            size="small"
            sx={{ flex: "1 1 180px" }}
          />
          <TextField
            label="Fiyat (₺)"
            name="rentPrice"
            type="number"
            value={form.rentPrice}
            onChange={handleChange}
            size="small"
            sx={{ flex: "1 1 140px" }}
          />
          <TextField
            label="Başlangıç"
            type="date"
            name="rentDate"
            value={form.rentDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ flex: "1 1 160px" }}
          />
          <TextField
            label="Bitiş"
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ flex: "1 1 160px" }}
          />
          <TextField
            label="Konum"
            name="location"
            value={form.location}
            onChange={handleChange}
            size="small"
            sx={{ flex: "1 1 180px" }}
          />

          <Button
            variant="contained"
            color="primary"
            onClick={handleAddProperty}
            size="medium"
            sx={{
              fontWeight: 600,
              borderRadius: "8px",
              px: 3,
              py: 1,
              minWidth: "110px",
              boxShadow: "0 2px 6px rgba(46, 134, 193, 0.3)",
              "&:hover": {
                backgroundColor: "#1f5fa3",
                boxShadow: "0 3px 8px rgba(46, 134, 193, 0.5)",
              },
            }}
          >
            Ekle
          </Button>
        </Box>
      </Paper>

      {properties.length > 0 ? (
        <BasicTable
          data={properties}
          onUpdate={(updated) => {
            if (updated.deleted) {
              setProperties((prev) =>
                prev.filter((p) => p._id !== updated._id)
              );
            } else {
              setProperties((prev) =>
                prev.map((p) => (p._id === updated._id ? updated : p))
              );
            }
          }}
          loadingState={loadingState}
          setLoadingState={setLoadingState}
        />
      ) : (
        <Box
          sx={{
            textAlign: "center",
            py: 5,
            color: "#777",
            fontStyle: "italic",
          }}
        >
          Henüz ilan bulunmuyor.
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        TransitionComponent={(props) => <Slide {...props} direction="up" />}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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
    </>
  );
}

export default RealtorHome;
