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
  Grid,
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

        setAiFilled({});

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

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          maxWidth: 1000,
          width: { xs: "fit-content", md: "100%" },
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
            justifyContent: { xs: "center", md: "flex-start" },
            gap: 1,
          }}
        >
          <AddHomeWorkIcon /> Yeni İlan Ekle
        </Typography>

        <Grid container spacing={2} justifyContent="center">
          <Grid
            item
            xs={12}
            md={3}
            sx={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <TextField
              label="Kiracı Adı Soyadı"
              name="tenantName"
              value={form.tenantName}
              onChange={handleChange}
              size="small"
              sx={{ width: { xs: "280px", md: "100%" } }}
            />
            {aiFilled.tenantName && (
              <Chip
                label="AI"
                color="success"
                size="small"
                sx={{
                  position: "absolute",
                  top: -8,
                  right: { xs: 10, md: 0 },
                  zIndex: 1,
                }}
              />
            )}
          </Grid>

          <Grid
            item
            xs={12}
            md={2}
            sx={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <TextField
              label="Fiyat (₺)"
              name="rentPrice"
              type="number"
              value={form.rentPrice}
              onChange={handleChange}
              size="small"
              sx={{ width: { xs: "280px", md: "100%" } }}
            />
            {aiFilled.rentPrice && (
              <Chip
                label="AI"
                color="success"
                size="small"
                sx={{
                  position: "absolute",
                  top: -8,
                  right: { xs: 10, md: 0 },
                  zIndex: 1,
                }}
              />
            )}
          </Grid>

          <Grid
            item
            xs={12}
            md={3}
            sx={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <TextField
              label="Konum"
              name="location"
              value={form.location}
              onChange={handleChange}
              size="small"
              sx={{ width: { xs: "280px", md: "100%" } }}
            />
            {aiFilled.location && (
              <Chip
                label="AI"
                color="success"
                size="small"
                sx={{
                  position: "absolute",
                  top: -8,
                  right: { xs: 10, md: 0 },
                  zIndex: 1,
                }}
              />
            )}
          </Grid>

          <Grid
            item
            xs={12}
            md={2}
            sx={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <DatePicker
              label="Başlangıç"
              format="dd/MM/yyyy"
              value={form.rentDate ? new Date(form.rentDate) : null}
              onChange={(date) =>
                setForm((prev) => ({ ...prev, rentDate: toISODate(date) }))
              }
              slotProps={{ textField: { size: "small", fullWidth: true } }}
              sx={{ width: { xs: "280px", md: "100%" } }}
            />
            {aiFilled.rentDate && (
              <Chip
                label="AI"
                color="success"
                size="small"
                sx={{
                  position: "absolute",
                  top: -8,
                  right: { xs: 10, md: 0 },
                  zIndex: 1,
                }}
              />
            )}
          </Grid>

          <Grid
            item
            xs={12}
            md={2}
            sx={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <DatePicker
              label="Bitiş"
              format="dd/MM/yyyy"
              value={form.endDate ? new Date(form.endDate) : null}
              onChange={(date) =>
                setForm((prev) => ({ ...prev, endDate: toISODate(date) }))
              }
              slotProps={{ textField: { size: "small", fullWidth: true } }}
              sx={{ width: { xs: "280px", md: "100%" } }}
            />
            {aiFilled.endDate && (
              <Chip
                label="AI"
                color="success"
                size="small"
                sx={{
                  position: "absolute",
                  top: -8,
                  right: { xs: 10, md: 0 },
                  zIndex: 1,
                }}
              />
            )}
          </Grid>

          <Grid
            item
            xs={12}
            md={12}
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: { xs: "center", md: "flex-end" },
            }}
          >
            <Button
              variant="contained"
              component="label"
              size="medium"
              sx={{
                fontWeight: 600,
                borderRadius: "8px",
                px: 3,
                py: 1,
                backgroundColor: "#2E86C1",
                color: "#fff",
                textTransform: "none",
                boxShadow: "0 2px 6px rgba(46, 134, 193, 0.3)",
                "&:hover": {
                  backgroundColor: "#1f5fa3",
                  boxShadow: "0 3px 8px rgba(46, 134, 193, 0.5)",
                },
                opacity: extractLoading ? 0.8 : 1,
                cursor: extractLoading ? "not-allowed" : "pointer",
                width: { xs: "132px", md: "auto" },
              }}
            >
              {extractLoading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={18} sx={{ color: "white" }} />
                  Okunuyor...
                </Box>
              ) : (
                "AI ile Ekle"
              )}

              <input
                type="file"
                hidden
                accept="image/*,application/pdf"
                disabled={extractLoading}
                onChange={(e) => handleExtract(e.target.files?.[0])}
              />
            </Button>

            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              size="medium"
              disabled={loading}
              sx={{
                fontWeight: 600,
                borderRadius: "8px",
                px: 4,
                py: 1,
                textTransform: "none",
                boxShadow: "0 2px 6px rgba(46, 134, 193, 0.3)",
                "&:hover": {
                  backgroundColor: "#1f5fa3",
                  boxShadow: "0 3px 8px rgba(46, 134, 193, 0.5)",
                },
                width: { xs: "132px", md: "auto" },
              }}
            >
              {loading ? "Ekleniyor..." : "Ekle"}
            </Button>
          </Grid>
        </Grid>
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
