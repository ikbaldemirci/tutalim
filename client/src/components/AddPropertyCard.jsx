import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import { DatePicker } from "@mui/x-date-pickers";
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

  const [aiFilled, setAiFilled] = useState({});

  useEffect(() => {
    if (Object.keys(aiFilled).length > 0) {
      const timer = setTimeout(() => setAiFilled({}), 1500);
      return () => clearTimeout(timer);
    }
  }, [aiFilled]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const showError = (msg) =>
    setSnackbar({ open: true, message: msg, severity: "warning" });

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

    const maxSize = 25 * 1024 * 1024;
    if (file.size > maxSize) {
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
        let fields = { ...res.data.fields };

        const trToISO = (dateStr) => {
          if (!dateStr) return "";
          const parts = dateStr.split(".");
          if (parts.length !== 3) return dateStr;
          const [dd, mm, yyyy] = parts;
          return `${yyyy}-${mm}-${dd}`;
        };

        if (fields.rentDate) fields.rentDate = trToISO(fields.rentDate);
        if (fields.endDate) fields.endDate = trToISO(fields.endDate);

        if (fields.rentPrice !== undefined && fields.rentPrice !== null) {
          const numeric = String(fields.rentPrice).replace(/[^\d]/g, "");
          fields.rentPrice = numeric;
        }

        setForm((prev) => ({ ...prev, ...fields }));

        const filledMap = {};
        Object.keys(fields).forEach((key) => {
          if (fields[key]) filledMap[key] = true;
        });
        setAiFilled(filledMap);

        setSnackbar({
          open: true,
          message: "Belgeden bilgiler başarıyla okundu!",
          severity: "success",
        });
      } else {
        showError("Belge okunamadı. Farklı bir dosya deneyin.");
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Belgeden okuma sırasında hata oluştu.";
      showError(errorMsg);
    } finally {
      setExtractLoading(false);
    }
  };

  const highlightStyle = (field) =>
    aiFilled[field]
      ? {
          transition: "box-shadow 0.3s ease",
          boxShadow: "0 0 0 2px rgba(46,204,113,0.7)",
          borderRadius: "6px",
        }
      : {};

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
          <Box sx={{ position: "relative" }}>
            <TextField
              label="Kiracı Adı Soyadı"
              name="tenantName"
              value={form.tenantName}
              onChange={handleChange}
              size="small"
              sx={{ flex: "1 1 180px", ...highlightStyle("tenantName") }}
            />
            {aiFilled.tenantName && (
              <Chip
                label="AI"
                color="success"
                size="small"
                sx={{ position: "absolute", top: -10, right: -10 }}
              />
            )}
          </Box>

          <Box sx={{ position: "relative" }}>
            <TextField
              label="Fiyat (₺)"
              name="rentPrice"
              type="number"
              value={form.rentPrice}
              onChange={handleChange}
              size="small"
              sx={{ flex: "1 1 140px", ...highlightStyle("rentPrice") }}
            />
            {aiFilled.rentPrice && (
              <Chip
                label="AI"
                color="success"
                size="small"
                sx={{ position: "absolute", top: -10, right: -10 }}
              />
            )}
          </Box>

          <Box sx={{ position: "relative" }}>
            <DatePicker
              label="Başlangıç"
              format="dd/MM/yyyy"
              value={form.rentDate ? new Date(form.rentDate) : null}
              onChange={(date) =>
                setForm((prev) => ({ ...prev, rentDate: toISODate(date) }))
              }
              slotProps={{ textField: { size: "small" } }}
              sx={{ flex: "1 1 160px", ...highlightStyle("rentDate") }}
            />
            {aiFilled.rentDate && (
              <Chip
                label="AI"
                color="success"
                size="small"
                sx={{ position: "absolute", top: -10, right: -10 }}
              />
            )}
          </Box>

          <Box sx={{ position: "relative" }}>
            <DatePicker
              label="Bitiş"
              format="dd/MM/yyyy"
              value={form.endDate ? new Date(form.endDate) : null}
              onChange={(date) =>
                setForm((prev) => ({ ...prev, endDate: toISODate(date) }))
              }
              slotProps={{ textField: { size: "small" } }}
              sx={{ flex: "1 1 160px", ...highlightStyle("endDate") }}
            />
            {aiFilled.endDate && (
              <Chip
                label="AI"
                color="success"
                size="small"
                sx={{ position: "absolute", top: -10, right: -10 }}
              />
            )}
          </Box>

          <Box sx={{ position: "relative" }}>
            <TextField
              label="Konum"
              name="location"
              value={form.location}
              onChange={handleChange}
              size="small"
              sx={{ flex: "1 1 180px", ...highlightStyle("location") }}
            />
            {aiFilled.location && (
              <Chip
                label="AI"
                color="success"
                size="small"
                sx={{ position: "absolute", top: -10, right: -10 }}
              />
            )}
          </Box>

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
            variant="contained"
            component="label"
            size="medium"
            sx={{
              fontWeight: 600,
              borderRadius: "8px",
              px: 3,
              py: 1,
              minWidth: "150px",
              backgroundColor: "#2E86C1",
              color: "#fff",
              boxShadow: "0 2px 6px rgba(46, 134, 193, 0.3)",
              "&:hover": {
                backgroundColor: "#1f5fa3",
                boxShadow: "0 3px 8px rgba(46, 134, 193, 0.5)",
              },
              opacity: extractLoading ? 0.8 : 1,
              cursor: extractLoading ? "not-allowed" : "pointer",
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
              type="file"
              hidden
              accept="image/*,application/pdf"
              disabled={extractLoading}
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
