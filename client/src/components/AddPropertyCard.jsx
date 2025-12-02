import { useState } from "react";
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import { DatePicker } from "@mui/x-date-pickers";
import api from "../api";

const AiBadge = () => (
  <Box
    sx={{
      position: "absolute",
      top: -10,
      right: 10,
      background: "linear-gradient(135deg, #27AE60, #2ECC71)",
      color: "white",
      fontSize: "10px",
      fontWeight: 700,
      px: 1.2,
      py: 0.3,
      borderRadius: "6px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      zIndex: 10,
      letterSpacing: "0.5px",
    }}
  >
    AI
  </Box>
);

const AiWrapper = ({ active, children }) => (
  <Box
    sx={{
      position: "relative",
      borderRadius: "12px",
      transition: "0.35s ease",
      p: "4px",
      boxShadow: active
        ? "0 0 0 2px #2ECC71 inset, 0 0 10px rgba(46, 204, 113, 0.6)"
        : "none",
    }}
  >
    {active && <AiBadge />}
    {children}
  </Box>
);

export default function AddPropertyCard({ onCreate }) {
  const [form, setForm] = useState({
    tenantName: "",
    rentPrice: "",
    rentDate: "",
    endDate: "",
    location: "",
  });

  const [loading, setLoading] = useState(false);
  const [extractLoading, setExtractLoading] = useState(false);

  const [aiFilled, setAiFilled] = useState({
    tenantName: false,
    rentPrice: false,
    rentDate: false,
    endDate: false,
    location: false,
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showError = (msg) =>
    setSnackbar({ open: true, message: msg, severity: "warning" });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toISODate = (d) => {
    if (!d) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

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
          tenantName: "",
          rentPrice: "",
          rentDate: "",
          endDate: "",
          location: "",
        });

        setAiFilled({
          tenantName: false,
          rentPrice: false,
          rentDate: false,
          endDate: false,
          location: false,
        });

        setSnackbar({
          open: true,
          message: "İlan başarıyla eklendi!",
          severity: "success",
        });
      }
    } catch (err) {
      let msg = "İlan eklenemedi. Lütfen tekrar deneyin.";

      if (
        err.response?.data?.message?.includes(
          '"endDate" must be greater than "ref:rentDate"'
        )
      ) {
        msg = "Bitiş tarihi başlangıç tarihinden önce olamaz!";
      }

      setSnackbar({
        open: true,
        message: msg,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async (file) => {
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) {
      showError("Dosya boyutu 25MB'dan büyük olamaz.");
      return;
    }

    setExtractLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/ai/extract-property", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.status === "success") {
        const fields = { ...res.data.fields };
        const updated = {};

        Object.keys(fields).forEach((key) => {
          if (fields[key]) updated[key] = true;
        });

        setAiFilled((prev) => ({ ...prev, ...updated }));

        const trToISO = (dateStr) => {
          if (!dateStr) return "";
          const parts = dateStr.split(".");
          if (parts.length !== 3) return dateStr;
          const [dd, mm, yyyy] = parts;
          return `${yyyy}-${mm}-${dd}`;
        };

        if (fields.rentDate) fields.rentDate = trToISO(fields.rentDate);
        if (fields.endDate) fields.endDate = trToISO(fields.endDate);
        if (fields.rentPrice)
          fields.rentPrice = String(fields.rentPrice).replace(/[^\d]/g, "");

        setForm((prev) => ({ ...prev, ...fields }));

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
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 2,
          }}
        >
          <AiWrapper active={aiFilled.tenantName}>
            <TextField
              label="Kiracı Adı Soyadı"
              name="tenantName"
              value={form.tenantName}
              onChange={handleChange}
              size="small"
              fullWidth
            />
          </AiWrapper>

          <AiWrapper active={aiFilled.rentPrice}>
            <TextField
              label="Fiyat (₺)"
              name="rentPrice"
              type="number"
              value={form.rentPrice}
              onChange={handleChange}
              size="small"
              fullWidth
            />
          </AiWrapper>

          <AiWrapper active={aiFilled.rentDate}>
            <DatePicker
              label="Başlangıç"
              format="dd/MM/yyyy"
              value={form.rentDate ? new Date(form.rentDate) : null}
              onChange={(date) =>
                setForm((prev) => ({ ...prev, rentDate: toISODate(date) }))
              }
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
          </AiWrapper>

          <AiWrapper active={aiFilled.endDate}>
            <DatePicker
              label="Bitiş"
              format="dd/MM/yyyy"
              value={form.endDate ? new Date(form.endDate) : null}
              onChange={(date) =>
                setForm((prev) => ({ ...prev, endDate: toISODate(date) }))
              }
              slotProps={{ textField: { size: "small", fullWidth: true } }}
            />
          </AiWrapper>

          <AiWrapper active={aiFilled.location}>
            <TextField
              label="Konum"
              name="location"
              value={form.location}
              onChange={handleChange}
              size="small"
              fullWidth
            />
          </AiWrapper>
        </Box>

        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            {loading ? "Ekleniyor..." : "Ekle"}
          </Button>

          <Button
            variant="contained"
            component="label"
            disabled={extractLoading}
            sx={{
              minWidth: 150,
              backgroundColor: "#2E86C1",
              "&:hover": { backgroundColor: "#1f5fa3" },
            }}
          >
            {extractLoading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={18} sx={{ color: "white" }} />
                Okunuyor...
              </Box>
            ) : (
              "Belgeden Oku"
            )}

            <input
              hidden
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => handleExtract(e.target.files?.[0])}
            />
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}
