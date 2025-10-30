import { useEffect, useState } from "react";
import axios from "axios";
import api from "../api";
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
  const [invites, setInvites] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
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
        .get("https://tutalim.com/api/properties", {
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

  useEffect(() => {
    if (!token) return;
    api
      .get("/assignments/pending")
      .then((res) => {
        if (res.data.status === "success")
          setInvites(res.data.assignments || []);
      })
      .finally(() => setLoadingInvites(false));
  }, [token]);

  const acceptInvite = async (id) => {
    try {
      const res = await api.post(`/assignments/${id}/accept`);
      if (res.data.status === "success") {
        setInvites((prev) => prev.filter((i) => i._id !== id));
        axios
          .get("https://tutalim.com/api/properties", {
            headers: { Authorization: `Bearer ${token}` },
          })
          .then((r) => {
            if (r.data.status === "success") setProperties(r.data.properties);
          });
      }
    } catch (err) {}
  };

  const rejectInvite = async (id) => {
    try {
      const res = await api.post(`/assignments/${id}/reject`);
      if (res.data.status === "success") {
        setInvites((prev) => prev.filter((i) => i._id !== id));
      }
    } catch (err) {}
  };

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
        "https://tutalim.com/api/properties",
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

      {/* Pending invitations */}
      <Box sx={{ maxWidth: 1000, margin: "0 auto", mt: 2 }}>
        {!loadingInvites && invites.length > 0 && (
          <Box
            sx={{
              p: 2,
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              background: "#fff9f1",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
              Bekleyen Davetler ({invites.length})
            </Typography>
            {invites.map((inv) => (
              <Box
                key={inv._id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  py: 1,
                }}
              >
                <Typography sx={{ fontSize: 14 }}>
                  {inv.fromUser?.name || inv.fromUser?.mail} sizi bu mülke{" "}
                  {inv.role === "realtor" ? "emlakçı" : "ev sahibi"} olarak
                  atamak istiyor:
                  <strong> {inv.property?.location}</strong>
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <button
                    onClick={() => acceptInvite(inv._id)}
                    style={{
                      padding: "6px 10px",
                      background: "#2E86C1",
                      color: "#fff",
                      border: 0,
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Kabul Et
                  </button>
                  <button
                    onClick={() => rejectInvite(inv._id)}
                    style={{
                      padding: "6px 10px",
                      background: "#eee",
                      color: "#333",
                      border: 0,
                      borderRadius: 6,
                      cursor: "pointer",
                    }}
                  >
                    Reddet
                  </button>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

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
