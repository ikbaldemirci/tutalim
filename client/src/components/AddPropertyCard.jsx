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
      setSnackbar({
        open: true,
        message: "İlan eklenemedi. Lütfen tekrar deneyin.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  //   const handleExtract = async (file) => {
  //     if (!file) return;

  //     const maxSize = 25 * 1024 * 1024;
  //     if (file.size > maxSize) {
  //       showError("Dosya boyutu 25MB'dan büyük olamaz.");
  //       return;
  //     }

  //     setExtractLoading(true);

  //     const formData = new FormData();
  //     formData.append("file", file);

  //     try {
  //       const res = await api.post("/ai/extract-property", formData, {
  //         headers: { "Content-Type": "multipart/form-data" },
  //       });

  //       if (res.data?.status !== "success") {
  //         showError(res.data?.message || "Belge okunamadı.");
  //         return;
  //       }

  //       let fields = { ...res.data.fields };

  //       const trToISO = (dateStr) => {
  //         if (typeof dateStr !== "string") return "";
  //         const parts = dateStr.split(".");
  //         if (parts.length !== 3) return "";
  //         const [dd, mm, yyyy] = parts;
  //         return `${yyyy}-${mm}-${dd}`;
  //       };

  //       if (
  //         typeof fields.rentDate === "string" &&
  //         fields.rentDate.includes(".")
  //       ) {
  //         fields.rentDate = trToISO(fields.rentDate);
  //       } else {
  //         fields.rentDate = "";
  //       }

  //       if (typeof fields.endDate === "string" && fields.endDate.includes(".")) {
  //         fields.endDate = trToISO(fields.endDate);
  //       } else {
  //         fields.endDate = "";
  //       }

  //       if (fields.rentPrice !== undefined && fields.rentPrice !== null) {
  //         fields.rentPrice = fields.rentPrice.toString().replace(/\D/g, "");
  //       } else {
  //         fields.rentPrice = "";
  //       }

  //       setForm((prev) => ({ ...prev, ...fields }));

  //       setSnackbar({
  //         open: true,
  //         message: "Belgeden bilgiler başarıyla okundu!",
  //         severity: "success",
  //       });
  //     } catch (err) {
  //       console.error(err);
  //       showError("Belgeden okuma sırasında hata oluştu.");
  //     } finally {
  //       setExtractLoading(false);
  //     }
  //   };

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

        if (fields.rentDate) {
          fields.rentDate = trToISO(fields.rentDate);
        }

        if (fields.endDate) {
          fields.endDate = trToISO(fields.endDate);
        }

        if (fields.rentPrice !== undefined && fields.rentPrice !== null) {
          const numeric = String(fields.rentPrice).replace(/[^\d]/g, "");
          fields.rentPrice = numeric;
        }

        setForm((prev) => ({ ...prev, ...fields }));

        setSnackbar({
          open: true,
          message: "Belgeden bilgiler başarıyla okundu!",
          severity: "success",
        });
      } else {
        showError(
          res.data?.message || "Belge okunamadı. Farklı bir dosya deneyin."
        );
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

          <DatePicker
            label="Başlangıç"
            format="dd/MM/yyyy"
            value={form.rentDate ? new Date(form.rentDate) : null}
            onChange={(date) =>
              setForm((prev) => ({ ...prev, rentDate: toISODate(date) }))
            }
            slotProps={{ textField: { size: "small" } }}
            sx={{ flex: "1 1 160px" }}
          />

          <DatePicker
            label="Bitiş"
            format="dd/MM/yyyy"
            value={form.endDate ? new Date(form.endDate) : null}
            onChange={(date) =>
              setForm((prev) => ({ ...prev, endDate: toISODate(date) }))
            }
            slotProps={{ textField: { size: "small" } }}
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
            variant="contained"
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
