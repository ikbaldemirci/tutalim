import { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import api from "../api";

export default function AddPropertyCard({ onCreate }) {
  const [form, setForm] = useState({
    rentPrice: "",
    rentDate: "",
    endDate: "",
    location: "",
    tenantName: "",
  });

  const [loading, setLoading] = useState(false);
  const [extractLoading, setExtractLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const showError = (msg) =>
    setSnackbar({ open: true, message: msg, severity: "warning" });

  const handleSubmit = async () => {
    if (!form.rentPrice || !form.rentDate || !form.endDate || !form.location) {
      return showError("Lütfen tüm zorunlu alanları doldurun!");
    }

    setLoading(true);

    try {
      const res = await api.post("/properties", {
        rentPrice: form.rentPrice,
        rentDate: new Date(form.rentDate),
        endDate: new Date(form.endDate),
        location: form.location,
        tenantName: form.tenantName,
      });

      if (res.data.status === "success") {
        onCreate?.(res.data.property);

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
      setSnackbar({
        open: true,
        message: "İlan eklenemedi. Lütfen tekrar deneyin.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async (file) => {
    if (!file) return;
    setExtractLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/ai/extract-property", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.status === "success") {
        setForm((prev) => ({ ...prev, ...res.data.fields }));

        setSnackbar({
          open: true,
          message: "Belgeden bilgiler başarıyla okundu!",
          severity: "success",
        });
      } else {
        showError("Belge okunamadı. Farklı bir dosya deneyin.");
      }
    } catch (err) {
      showError("Belgeden okuma sırasında hata oluştu.");
    } finally {
      setExtractLoading(false);
    }
  };

  return (
    <>
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
          <AddHomeWorkIcon /> Yeni İlan Ekle
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
            inputProps={{ placeholder: "dd/mm/yyyy" }}
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
            inputProps={{ placeholder: "dd/mm/yyyy" }}
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
            onClick={handleSubmit}
            size="medium"
            disabled={loading}
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
            {loading ? "Ekleniyor..." : "Ekle"}
          </Button>

          <Button
            variant="outlined"
            component="label"
            size="medium"
            disabled={extractLoading}
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
            {extractLoading ? "Okunuyor..." : "Belgeden Oku"}
            <input
              type="file"
              hidden
              accept="image/*,application/pdf"
              onChange={(e) => handleExtract(e.target.files?.[0])}
            />
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}
